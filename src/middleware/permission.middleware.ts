import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import fp from 'fastify-plugin'
import { Permission, Resource } from '@prisma/client'

// Define role mapping based on eselon
const getRoleFromEselon = (eselon: number, isSuperuser: boolean): string => {
  if (isSuperuser) return 'SUPER_ADMIN';
  
  switch (eselon) {
    case -1: return 'ADMIN'; // Direksi
    case 1:
    case 2: return 'MANAGER';
    case 3:
    case 4:
    case 5: return 'STAFF';
    default: return 'STAFF';
  }
};

// Define permissions based on role
const ROLE_PERMISSIONS = {
  'SUPER_ADMIN': {
    // Super Admin - Full access to everything
    USER: ['CREATE', 'READ', 'UPDATE', 'DELETE'],
    PROGRAM: ['CREATE', 'READ', 'UPDATE', 'DELETE'],
    PLAN_TYPE: ['CREATE', 'READ', 'UPDATE', 'DELETE'],
    PLAN_PROJECT: ['CREATE', 'READ', 'UPDATE', 'DELETE'],
    ASSIGN_PROJECT: ['CREATE', 'READ', 'UPDATE', 'DELETE'],
    OVERVIEW: ['READ'],
    PERSONNEL: ['READ'], // For assignment purposes
    PROFILE: ['READ', 'UPDATE'] // Can edit own profile
  },
  'ADMIN': {
    // Direksi - Admin terbatas (tidak bisa kelola user)
    USER: [], // Tidak bisa kelola user
    PROGRAM: ['CREATE', 'READ', 'UPDATE', 'DELETE'],
    PLAN_TYPE: ['CREATE', 'READ', 'UPDATE', 'DELETE'],
    PLAN_PROJECT: ['CREATE', 'READ', 'UPDATE', 'DELETE'],
    ASSIGN_PROJECT: ['CREATE', 'READ', 'UPDATE', 'DELETE'], // Bisa assign ke eselon 1
    OVERVIEW: ['READ'],
    PERSONNEL: ['READ'], // Bisa lihat personnel untuk assignment
    PROFILE: ['READ', 'UPDATE'] // Can edit own profile
  },
  'MANAGER': {
    // Eselon 1 & 2 - Bisa cascade assignment
    USER: [],
    PROGRAM: ['READ'], // Hanya lihat, tidak bisa add/edit/delete
    PLAN_TYPE: [],
    PLAN_PROJECT: [],
    ASSIGN_PROJECT: ['READ', 'UPDATE'], // Bisa cascade/menurunkan assignment
    OVERVIEW: ['READ'],
    PERSONNEL: ['READ'], // Perlu lihat personnel untuk penurunan
    PROFILE: ['READ', 'UPDATE'] // Can edit own profile
  },
  'STAFF': {
    // Eselon 3,4,5 - View only
    USER: [],
    PROGRAM: [],
    PLAN_TYPE: [],
    PLAN_PROJECT: [],
    ASSIGN_PROJECT: ['READ'], // Hanya lihat assignment
    OVERVIEW: ['READ'],
    PERSONNEL: [], // Tidak perlu lihat personnel lain
    PROFILE: ['READ', 'UPDATE'] // Can edit own profile
  }
} as const;

declare module 'fastify' {
  interface FastifyRequest {
    permissionError?: boolean;
  }

  interface FastifyInstance {
    hasPermission: (
      request: FastifyRequest,
      resource: Resource,
      permission: Permission | Permission[]
    ) => Promise<boolean>
    checkPermission: (
      resource: Resource,
      permission: Permission | Permission[]
    ) => (request: FastifyRequest, reply: FastifyReply, done: (err?: Error) => void) => void
    getUserRole: (request: FastifyRequest) => string
    canAssignToEselon: (request: FastifyRequest, targetEselon: number) => boolean
    canAssignToPersonnel: (request: FastifyRequest, targetPersonnel: any) => boolean
    canEditPersonnel: (request: FastifyRequest, targetPersonnelNpp: string) => boolean
  }
}

const permissionMiddleware = fp(async (fastify: FastifyInstance) => {
  
  const getUserRole = (request: FastifyRequest): string => {
    if (!request.user) return 'GUEST';
    
    const eselon = request.user.eselon || 5;
    const isSuperuser = request.user.is_superuser === true;
    
    return getRoleFromEselon(eselon, isSuperuser);
  };
  
  // Function to check if user can edit specific personnel (for own profile)
  const canEditPersonnel = (request: FastifyRequest, targetPersonnelNpp: string): boolean => {
    if (!request.user) return false;
    
    // User can always edit their own profile
    if (request.user.npp === targetPersonnelNpp) {
      return true;
    }
    
    // Super admin can edit others (if needed)
    const userRole = getUserRole(request);
    return userRole === 'SUPER_ADMIN';
  };
  
  // Function to check if user can assign project to specific personnel
  const canAssignToPersonnel = (request: FastifyRequest, targetPersonnel: any): boolean => {
    if (!request.user) return false;
    
    const userRole = getUserRole(request);
    const userEselon = request.user.eselon || 5;
    const targetEselon = targetPersonnel.eselon;
    const targetIsSuperuser = targetPersonnel.is_superuser;
    
    switch (userRole) {
      case 'SUPER_ADMIN':
        // Super admin bisa assign ke siapa saja KECUALI sesama superuser
        return !targetIsSuperuser;
      
      case 'ADMIN': // Direksi (eselon -1, bukan superuser)
        // Direksi hanya bisa assign ke eselon 1 (bukan superuser)
        return targetEselon === 1 && !targetIsSuperuser;
      
      case 'MANAGER':
        if (userEselon === 1) {
          // Eselon 1 hanya bisa assign ke eselon 2 (bukan superuser)
          return targetEselon === 2 && !targetIsSuperuser;
        } else if (userEselon === 2) {
          // Eselon 2 bisa assign ke 3,4,5 (bukan superuser)
          return [3, 4, 5].includes(targetEselon) && !targetIsSuperuser;
        }
        return false;
      
      case 'STAFF':
        return false; // Staff tidak bisa assign
      
      default:
        return false;
    }
  };
  
  // Backward compatibility - masih bisa pakai canAssignToEselon
  const canAssignToEselon = (request: FastifyRequest, targetEselon: number): boolean => {
    return canAssignToPersonnel(request, { eselon: targetEselon, is_superuser: false });
  };
  
  /**
   * Check if a user has a specific permission for a resource
   */
  const hasPermission = async (
  request: FastifyRequest,
  resource: Resource,
  permission: Permission | Permission[]
): Promise<boolean> => {
  try {
    fastify.log.info(`===== ESELON PERMISSION CHECK =====`);
    fastify.log.info(`Resource: ${resource}, Permission: ${permission}`);

    if (!request.user) {
      fastify.log.warn('No user found in request, denying permission');
      return false;
    }

    const userRole = getUserRole(request);
    const userEselon = request.user.eselon || 5;

    fastify.log.info(`User ${request.user.npp} - Eselon: ${userEselon}, Role: ${userRole}`);

    // Get permissions for this role
    const rolePermissions = ROLE_PERMISSIONS[userRole as keyof typeof ROLE_PERMISSIONS];

    if (!rolePermissions) {
      fastify.log.warn(`Unknown role: ${userRole}`);
      return false;
    }

    // Check if resource exists in role permissions
    // Gunakan `(rolePermissions as any)` untuk memberitahu TypeScript agar tidak terlalu ketat
    const resourcePermissions = (rolePermissions as any)[resource];

    if (!resourcePermissions) {
      fastify.log.info(`Resource ${resource} not defined for role ${userRole}`);
      return false;
    }

    // Check specific permissions
    const permissions = Array.isArray(permission) ? permission : [permission];
    
    // Perbaiki baris ini. Kita perlu mengkonversi resourcePermissions ke tipe yang bisa diakses
    const hasRequiredPermission = permissions.some(p =>
      // Konversi ke `string[]` akan menghasilkan error, jadi kita gunakan `as any as string[]`
      (resourcePermissions as readonly string[]).includes(p as string)
    );

    fastify.log.info(`Permission check result: ${hasRequiredPermission}`);
    return hasRequiredPermission;

  } catch (error) {
    fastify.log.error('Permission check failed:', error);
    return false;
  }
};

  /**
   * Create a hook function that checks permissions and can be used with preHandler
   */
  const checkPermission = (
    resource: Resource,
    permission: Permission | Permission[]
  ) => {
    return function permissionCheckHook(
      request: FastifyRequest, 
      reply: FastifyReply, 
      done: (err?: Error) => void
    ) {
      if (!request.user) {
        reply.code(401).send({
          statusCode: 401,
          error: 'Unauthorized',
          message: 'Authentication required'
        });
        return done(new Error('Authentication required'));
      }
      
      const userRole = getUserRole(request);
      
      fastify.log.info(`Permission check for ${resource}.${permission} - User: ${request.user.npp} (${userRole})`);
      
      hasPermission(request, resource, permission)
        .then(allowed => {
          if (!allowed) {
            const err = new Error('Permission denied');
            fastify.log.warn(`Permission denied: User ${request.user.npp} (${userRole}) tried to access ${resource}`);
            
            reply.code(403).send({
              statusCode: 403,
              error: 'Forbidden',
              message: `Access denied. Your role (${userRole}) does not have permission to ${permission} ${resource}`
            });
            
            return done(err);
          }
          
          fastify.log.info(`Permission granted for user ${request.user.npp} to access ${resource}`);
          return done();
        })
        .catch(err => {
          fastify.log.error('Permission check error:', err);
          reply.code(500).send({
            statusCode: 500,
            error: 'Internal Server Error',
            message: 'An error occurred while checking permissions'
          });
          return done(err);
        });
    };
  };

  // Add decorators to Fastify instance
  fastify.decorate('hasPermission', hasPermission);
  fastify.decorate('checkPermission', checkPermission);
  fastify.decorate('getUserRole', getUserRole);
  fastify.decorate('canAssignToEselon', canAssignToEselon);
  fastify.decorate('canAssignToPersonnel', canAssignToPersonnel);
  fastify.decorate('canEditPersonnel', canEditPersonnel);
});

export default permissionMiddleware;