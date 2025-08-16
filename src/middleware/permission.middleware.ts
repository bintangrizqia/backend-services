import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import fp from 'fastify-plugin'
// Pastikan ini diimpor dari lokasi yang benar di proyek Anda,
// biasanya generated oleh Prisma atau file enum manual Anda.
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
// Pastikan semua nilai dalam array adalah ENUM Permission, bukan string literal
const ROLE_PERMISSIONS = {
  'SUPER_ADMIN': {
    // Super Admin - Full access to everything
    USER: [Permission.CAN_CREATE_PERSONNEL, Permission.CAN_READ_PERSONNEL, Permission.CAN_UPDATE_PERSONNEL, Permission.CAN_DELETE_PERSONNEL],
    PROGRAM: [Permission.CAN_CREATE_PROGRAM, Permission.CAN_READ_PROGRAM, Permission.CAN_UPDATE_PROGRAM, Permission.CAN_DELETE_PROGRAM],
    PLAN_TYPES: [Permission.CAN_CREATE_PLAN_TYPE, Permission.CAN_READ_PLAN_TYPE, Permission.CAN_UPDATE_PLAN_TYPE, Permission.CAN_DELETE_PLAN_TYPE],
    PLAN_PROJECT: [Permission.CAN_CREATE_PROJECT, Permission.CAN_READ_PROJECT, Permission.CAN_UPDATE_PROJECT, Permission.CAN_DELETE_PROJECT],
    ASSIGN_PROJECT: [Permission.CAN_CREATE_PROJECT, Permission.CAN_READ_PROJECT, Permission.CAN_UPDATE_PROJECT], 
    OVERVIEW: [Permission.CAN_READ_PERMISSION],
    PERSONNEL: [Permission.CAN_READ_PERSONNEL],
    PROFILE: [Permission.CAN_READ_PERSONNEL, Permission.CAN_UPDATE_PERSONNEL]
  },
  'ADMIN': {
    USER: [],
    PROGRAM: [Permission.CAN_CREATE_PROGRAM, Permission.CAN_READ_PROGRAM, Permission.CAN_UPDATE_PROGRAM, Permission.CAN_DELETE_PROGRAM],
    PLAN_TYPES: [Permission.CAN_READ_PLAN_TYPE],
    PLAN_PROJECT: [Permission.CAN_READ_PROJECT, Permission.CAN_CREATE_PROJECT, Permission.CAN_UPDATE_PROJECT, Permission.CAN_DELETE_PROJECT], // ADMIN bisa CRUD Project
    ASSIGN_PROJECT: [Permission.CAN_CREATE_PROJECT, Permission.CAN_READ_PROJECT, Permission.CAN_UPDATE_PROJECT], // ADMIN bisa assign ke eselon 1
    OVERVIEW: [Permission.CAN_READ_PERMISSION],
    PERSONNEL: [Permission.CAN_READ_PERSONNEL],
    PROFILE: [Permission.CAN_READ_PERSONNEL, Permission.CAN_UPDATE_PERSONNEL]
  },
  'MANAGER': {
    USER: [],
    PROGRAM: [Permission.CAN_READ_PROGRAM],
    PLAN_TYPES: [], // MANAGER harus bisa READ Plan Type untuk memilih di form assign
    PLAN_PROJECT: [Permission.CAN_READ_PROJECT], 
    ASSIGN_PROJECT: [Permission.CAN_READ_PROJECT, Permission.CAN_UPDATE_PROJECT], // Manager bisa READ dan juga UPDATE (assign/reassign) project
    OVERVIEW: [Permission.CAN_READ_PERMISSION],
    PERSONNEL: [Permission.CAN_READ_PERSONNEL], // MANAGER perlu bisa READ PERSONNEL untuk fitur assign
    PROFILE: [Permission.CAN_READ_PERSONNEL, Permission.CAN_UPDATE_PERSONNEL]
  },
  'STAFF': {
    USER: [],
    PROGRAM: [],
    PLAN_TYPES: [],
    PLAN_PROJECT: [Permission.CAN_READ_PROJECT], // STAFF hanya bisa READ Project (jika mereka punya project)
    ASSIGN_PROJECT: [Permission.CAN_READ_PROJECT],
    OVERVIEW: [Permission.CAN_READ_PERMISSION],
    PERSONNEL: [],
    PROFILE: [Permission.CAN_READ_PERSONNEL, Permission.CAN_UPDATE_PERSONNEL]
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
    permission: Permission | Permission[] // Ini menerima nilai enum
  ): Promise<boolean> => {
    try {
      fastify.log.info(`===== PERMISSION CHECK DEBUG =====`);
      fastify.log.info(`User NPP: ${request.user?.npp}, Eselon: ${request.user?.eselon}, Superuser: ${request.user?.is_superuser}`);
      const userRole = getUserRole(request);
      fastify.log.info(`Detected Role: ${userRole}`);
      fastify.log.info(`Resource: ${resource}, Requested Permission: ${JSON.stringify(permission)}`);

      // Get permissions for this role
      const rolePermissions = ROLE_PERMISSIONS[userRole as keyof typeof ROLE_PERMISSIONS];

      if (!rolePermissions) {
        fastify.log.warn(`Unknown role: ${userRole}`);
        return false;
      }
      fastify.log.info(`Permissions defined for ${userRole}: ${JSON.stringify(rolePermissions)}`);


      // Check if resource exists in role permissions
      // Menggunakan `as any` untuk mengakses properti dengan string literal
      const resourcePermissions = (rolePermissions as any)[resource];

      if (!resourcePermissions) {
        fastify.log.info(`Resource ${resource} not defined for role ${userRole}`);
        return false;
      }
      fastify.log.info(`Specific permissions for ${resource} for ${userRole}: ${JSON.stringify(resourcePermissions)}`);


      // Check specific permissions
      const permissionsToCheck = Array.isArray(permission) ? permission : [permission];
      
      // Membandingkan nilai enum secara langsung (resourcePermissions adalah array enum)
      const hasRequiredPermission = permissionsToCheck.some(p =>
        (resourcePermissions as readonly Permission[]).includes(p) 
      );

      fastify.log.info(`Final decision: ${hasRequiredPermission ? 'GRANTED' : 'DENIED'}`);
      return hasRequiredPermission;

    } catch (error) {
      fastify.log.error('Permission check failed (exception caught):', error);
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
      
      // Perhatikan logging di sini, nilai 'permission' sudah merupakan string literal dari enum
      fastify.log.info(`Permission check for ${resource}.${permission} - User: ${request.user.npp} (${userRole})`); 
      
      hasPermission(request, resource, permission)
        .then(allowed => {
          if (!allowed) {
            const err = new Error('Permission denied');
            fastify.log.warn(`Permission denied: User ${request.user.npp} (${userRole}) tried to access ${resource}`);
            
            // Perhatikan bagaimana pesan error dibentuk, gunakan string literal dari permission
            reply.code(403).send({
              statusCode: 403,
              error: 'Forbidden',
              message: `Access denied. Your role (${userRole}) does not have permission to ${Array.isArray(permission) ? permission.join(', ') : permission} ${resource}`
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
