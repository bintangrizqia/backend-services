import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import fp from 'fastify-plugin'
import { Permission, Resource } from '@prisma/client'

// Extend FastifyInstance type to include our permission methods
declare module 'fastify' {
  interface FastifyInstance {
    hasPermission: (
      request: FastifyRequest,
      resource: Resource,
      permission: Permission | Permission[]
    ) => Promise<boolean>
    requirePermission: (
      request: FastifyRequest,
      reply: FastifyReply,
      resource: Resource,
      permission: Permission | Permission[]
    ) => Promise<boolean>
    checkPermission: (
      request: FastifyRequest,
      reply: FastifyReply,
      resource: Resource,
      permission: Permission | Permission[]
    ) => Promise<void>
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
        const hasAllPermissions = permissions.some(p => 
          request.permissions![resource]!.includes(p)
        )
        
        if (hasAllPermissions) {
          return true
        }
      }

      const userId = request.user.id

      // Fall back to database check if JWT doesn't contain the permissions
      // (this handles cases where permissions might have been updated since token was issued)
      
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
   * Require a permission, returning true if allowed, false otherwise
   */
  const requirePermission = async (
    request: FastifyRequest,
    reply: FastifyReply,
    resource: Resource,
    permission: Permission | Permission[]
  ): Promise<boolean> => {
    const allowed = await hasPermission(request, resource, permission)
    if (!allowed) {
      return false
    }
    return true
  }

  /**
   * Middleware to check permission and return 403 if not allowed
   */
  const checkPermission = async (
    request: FastifyRequest,
    reply: FastifyReply,
    resource: Resource,
    permission: Permission | Permission[]
  ): Promise<void> => {
    const allowed = await hasPermission(request, resource, permission)
    if (!allowed) {
      reply.status(403).send({
        error: 'Forbidden',
        message: 'You do not have permission to access this resource'
      })
    }
  }

  // Add decorators to Fastify instance
  fastify.decorate('hasPermission', hasPermission)
  fastify.decorate('requirePermission', requirePermission)
  fastify.decorate('checkPermission', checkPermission)
})

export default permissionMiddleware
