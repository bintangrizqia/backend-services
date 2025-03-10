import { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify'
import jwt from 'jsonwebtoken'
import fp from 'fastify-plugin'
import { Permission, Resource } from '@prisma/client'

interface JwtPayload {
  id: string
  npp: string
  name: string
  is_superuser: boolean
  permissions?: {
    [key in Resource]?: Permission[]
  }
  [key: string]: any
}

declare module 'fastify' {
  interface FastifyRequest {
    user?: any
    permissions?: {
      [key in Resource]?: Permission[]
    }
  }
  
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
    generateToken: (userId: string) => Promise<string>
  }

  interface FastifyRouteConfig {
    authenticated?: boolean
  }
}

/**
 * Authentication middleware using JWT directly
 */
const authMiddleware = fp(async (fastify: FastifyInstance) => {
  const jwtSecret = process.env.JWT_SECRET || 'supersecretkey'
  
  /**
   * Get user permissions from database (both direct and via groups)
   */
  const getUserPermissions = async (userId: string): Promise<{ [key in Resource]?: Permission[] }> => {
    try {
      // Check if user is superuser first
      const user = await fastify.prisma.personnels.findUnique({
        where: { id: userId },
        select: { is_superuser: true }
      });
      
      if (user?.is_superuser) {
        // Superusers have all permissions, no need to query the database further
        return Object.values(Resource).reduce((permissions, resource) => {
          permissions[resource] = Object.values(Permission);
          return permissions;
        }, {} as { [key in Resource]: Permission[] });
      }
      
      // Get direct permissions
      const directPermissions = await fastify.prisma.personnelPermissions.findMany({
        where: { personnel_id: userId }
      });
      
      // Get group permissions
      const groupPermissions = await fastify.prisma.$queryRaw<{ resource: Resource; permission: Permission }[]>`
        SELECT gp.resource, gp.permission
        FROM "GroupPermissions" gp
        JOIN "PersonnelGroups" pg ON pg.group_id = gp.group_id
        WHERE pg.personnel_id = ${userId}
      `;
      
      // Combine permissions
      const allPermissions = [...directPermissions, ...groupPermissions];
      
      // Group by resource
      const permissionsByResource: { [key in Resource]?: Permission[] } = {};
      
      allPermissions.forEach(p => {
        const resource = p.resource as Resource;
        const permission = p.permission as Permission;
        
        if (!permissionsByResource[resource]) {
          permissionsByResource[resource] = [];
        }
        
        if (!permissionsByResource[resource]!.includes(permission)) {
          permissionsByResource[resource]!.push(permission);
        }
      });
      
      return permissionsByResource;
    } catch (error) {
      fastify.log.error('Error fetching user permissions:', error);
      return {};
    }
  };
  
  /**
   * Authentication middleware function
   * Verifies JWT token from Authorization header and attaches user to request
   */
  const authenticate = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const authHeader = request.headers.authorization
      
      if (!authHeader) {
        return reply.status(401).send({
          error: 'Unauthorized',
          message: 'Authentication required - missing Authorization header'
        })
      }
      
      // Extract token from Authorization header
      const parts = authHeader.split(' ')
      if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return reply.status(401).send({
          error: 'Unauthorized',
          message: 'Authentication format invalid - use Bearer scheme'
        })
      }
      
      const token = parts[1]
      
      // Verify token
      const decoded = jwt.verify(token, jwtSecret) as JwtPayload
      
      // Find user in database
      const user = await fastify.prisma.personnels.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          npp: true,
          name: true,
          email: true,
          photo: true,
          is_superuser: true,
          created_at: true,
          updated_at: true,
          // Exclude password for security
          password: false
        }
      })
      
      if (!user) {
        return reply.status(401).send({
          error: 'Unauthorized',
          message: 'User not found or inactive'
        })
      }
      
      // Attach user to request
      request.user = user
      
      // Attach permissions from token to request for quick access
      if (decoded.permissions) {
        request.permissions = decoded.permissions
      }
      
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        return reply.status(401).send({
          error: 'Unauthorized',
          message: 'Invalid token'
        })
      }
      
      if (error instanceof jwt.TokenExpiredError) {
        return reply.status(401).send({
          error: 'Unauthorized',
          message: 'Token expired'
        })
      }
      
      fastify.log.error(error)
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Authentication error'
      })
    }
  }
  
  /**
   * Generate a new JWT token with user permissions included
   */
  const generateToken = async (userId: string): Promise<string> => {
    // Get user basic info
    const user = await fastify.prisma.personnels.findUnique({
      where: { id: userId },
      select: {
        id: true,
        npp: true,
        name: true,
        is_superuser: true
      }
    });
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Get user permissions
    const permissions = await getUserPermissions(userId);
    
    // Create JWT payload with permissions
    const payload = {
      id: user.id,
      npp: user.npp,
      name: user.name,
      is_superuser: user.is_superuser,
      permissions
    };
    
    // Generate and return token
    return jwt.sign(payload, jwtSecret, { 
      expiresIn: '1d' // Token expires in 1 day
    });
  }
  
  // Register decorator functions
  fastify.decorate('authenticate', authenticate)
  fastify.decorate('generateToken', generateToken)
  
  // Add hook to include security headers in responses
  fastify.addHook('onSend', async (request, reply) => {
    reply.header('X-Content-Type-Options', 'nosniff')
    reply.header('X-Frame-Options', 'DENY')
    reply.header('X-XSS-Protection', '1; mode=block')
  })
})

export default authMiddleware
