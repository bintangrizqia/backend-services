import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import fp from 'fastify-plugin'
import { Permission, Resource } from '@prisma/client'

// Extend FastifyRequest to include a flag for permission errors
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
  }
}

const permissionMiddleware = fp(async (fastify: FastifyInstance) => {
  /**
   * Check if a user has a specific permission for a resource
   */
  const hasPermission = async (
    request: FastifyRequest, 
    resource: Resource, 
    permission: Permission | Permission[]
  ): Promise<boolean> => {
    try {
      // Tambahkan logging lebih detail
      fastify.log.info(`===== PERMISSION CHECK =====`);
      fastify.log.info(`Resource: ${resource}, Permission: ${permission}`);
      
      if (!request.user) {
        fastify.log.warn('No user found in request, denying permission');
        return false
      }

      // Log user data in detail
      fastify.log.info(`User data: ${JSON.stringify(request.user, null, 2)}`);
      fastify.log.info(`is_superuser type: ${typeof request.user.is_superuser}`);
      fastify.log.info(`is_superuser value: ${request.user.is_superuser}`);
      
      // Perbaikan kritis: super simple superuser check
      if (request.user.is_superuser === true) {
        fastify.log.info(`User ${request.user.npp} IS SUPERUSER - granting all permissions`);
        return true;
      }
      
      // Tambahkan logging untuk memahami alur kode
      fastify.log.info(`User ${request.user.npp} is NOT superuser, checking specific permissions`);
      
      const permissions = Array.isArray(permission) ? permission : [permission]
      
      // First check JWT token embedded permissions (faster than DB query)
      if (request.permissions && request.permissions[resource]) {
        const hasPermissions = permissions.some(p => 
          request.permissions![resource]!.includes(p)
        )
        
        if (hasPermissions) {
          return true
        }
        
        fastify.log.info(`Token permissions check failed: User ${request.user.npp}, Resource ${resource}`)
      }

      const userId = request.user.npp

      // Check for direct user permissions
      const directPermissionsCount = await fastify.prisma.personnelPermissions.count({
        where: {
          personnel_id: userId,
          resource,
          permission: { in: permissions }
        }
      })

      if (directPermissionsCount > 0) {
        return true
      }

      // Check for permissions through groups
      const groupPermissionsResult = await fastify.prisma.$queryRaw<[{ count: bigint }]>`
        SELECT COUNT(*) 
        FROM "GroupPermissions" gp
        JOIN "PersonnelGroups" pg ON pg.group_id = gp.group_id
        WHERE pg.personnel_id = ${userId}
        AND gp.resource = ${resource}::\"Resource\"
        AND gp.permission = ANY(${permissions}::\"Permission\"[])
      `

      return Number(groupPermissionsResult[0].count) > 0
    } catch (error) {
      fastify.log.error('Permission check failed:', error)
      return false
    }
  }

  /**
   * Create a hook function that checks permissions and can be used with preHandler
   * This uses Fastify's synchronous done callback to ensure the request is blocked
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
      // Skip permission check completely for superusers
      if (request.user && request.user.is_superuser === true) {
        fastify.log.info(`SUPERUSER detected: ${request.user.npp} - skipping permission check`);
        return done();
      }

      // If the request is already unauthorized, don't proceed with permission check
      if (reply.statusCode === 401 || reply.sent === true) {
        return done();
      }

      // Make sure we have a user object
      if (!request.user) {
        // Log it for debugging
        fastify.log.warn('No user object found in permission check');
        
        // This shouldn't happen because authentication should run first,
        // but just in case, mark as unauthorized
        reply.code(401).send({
          statusCode: 401,
          error: 'Unauthorized',
          message: 'Authentication required'
        });
        // End the request lifecycle
        return done(new Error('Authentication required'));
      }
      
      // Add debug logging
      fastify.log.info(`Permission check hook for ${resource}.${permission} - User: ${request.user.npp}`);
      
      hasPermission(request, resource, permission)
        .then(allowed => {
          if (!allowed) {
            // Critical change: Use a custom error to force Fastify to stop processing
            const err = new Error('Permission denied');
            
            // Log the permission denial
            fastify.log.warn(`Permission denied: User ${request.user.npp} tried to access ${resource} without permission`);
            
            // Send the 403 Forbidden response
            reply.code(403).send({
              statusCode: 403,
              error: 'Forbidden',
              message: `You do not have permission to access this resource (${resource})`
            });
            
            // Important: Pass an error to done to ensure the request chain stops
            return done(err);
          }
          
          // Continue with request if allowed
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
  }

  // Add decorators to Fastify instance
  fastify.decorate('hasPermission', hasPermission);
  fastify.decorate('checkPermission', checkPermission);
})

export default permissionMiddleware
