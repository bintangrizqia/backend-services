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
      // If no user is authenticated, they have no permissions
      if (!request.user) {
        return false
      }

      // If user is superuser, they have all permissions
      if (request.user.is_superuser) {
        return true
      }
      
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

      const userId = request.user.id

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
      hasPermission(request, resource, permission)
        .then(allowed => {
          if (!allowed) {
            // Block the request
            reply.status(403).send({
              error: 'Forbidden',
              message: `You do not have permission to access this resource (${resource})`
            });
            // Use a custom error to stop the request chain
            done(new Error('Permission denied'));
          } else {
            // Continue with the request
            done();
          }
        })
        .catch(err => {
          fastify.log.error('Permission check error:', err);
          reply.status(500).send({
            error: 'Internal Server Error',
            message: 'An error occurred while checking permissions'
          });
          done(err);
        });
    };
  }

  // Add decorators to Fastify instance
  fastify.decorate('hasPermission', hasPermission);
  fastify.decorate('checkPermission', checkPermission);
})

export default permissionMiddleware
