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
        where: { npp: userId },
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
        // Instead of sending response directly, set status code and attach error info
        reply.status(401)
        return reply.send({
          statusCode: 401,
          error: 'Unauthorized',
          message: 'Authentication required - missing Authorization header'
        })
      }
      
      // Extract token from Authorization header
      const parts = authHeader.split(' ')
      if (parts.length !== 2 || parts[0] !== 'Bearer') {
        reply.status(401)
        return reply.send({
          statusCode: 401,
          error: 'Unauthorized',
          message: 'Authentication format invalid - use Bearer scheme'
        })
      }
      
      const token = parts[1]
      
      // Verify token
      const decoded = jwt.verify(token, jwtSecret) as JwtPayload
      
      // Log decoded token for debugging
      fastify.log.info(`Decoded token: ${JSON.stringify(decoded, null, 2)}`);
      
      // Find user in database
      const user = await fastify.prisma.personnels.findUnique({
        where: { npp: decoded.npp },
        select: {
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
        reply.status(401)
        return reply.send({
          statusCode: 401,
          error: 'Unauthorized',
          message: 'User not found or inactive'
        })
      }
      
      // Log user data for debugging
      fastify.log.info(`User data from DB: ${JSON.stringify(user, null, 2)}`);
      
      // Masalah utama di sini! Pastikan is_superuser dari database digunakan, bukan dari token
      // Decode is_superuser sebagai boolean murni
      request.user = {
        ...user,
        is_superuser: Boolean(user.is_superuser)
      };
      
      // Debug log
      fastify.log.info(`User authenticated: ${request.user.npp}, is_superuser=${request.user.is_superuser} (${typeof request.user.is_superuser})`);
      
      // Attach permissions directly from database for superuser, not from token
      if (user.is_superuser) {
        // Give superuser all permissions
        request.permissions = Object.values(Resource).reduce((permissions, resource) => {
          permissions[resource] = Object.values(Permission);
          return permissions;
        }, {} as { [key in Resource]: Permission[] });
      } else if (decoded.permissions) {
        // Use token permissions for regular users
        request.permissions = decoded.permissions;
      }
      
      // Authentication successful
      
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        reply.status(401)
        return reply.send({
          statusCode: 401,
          error: 'Unauthorized',
          message: 'Invalid token'
        })
      }
      
      if (error instanceof jwt.TokenExpiredError) {
        reply.status(401)
        return reply.send({
          statusCode: 401,
          error: 'Unauthorized',
          message: 'Token expired'
        })
      }
      
      fastify.log.error(error)
      reply.status(500)
      return reply.send({
        statusCode: 500,
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
      where: { npp: userId },
      select: {
        npp: true,
        name: true,
        is_superuser: true
      }
    });
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Get user permissionsth special attention to is_superuser
    fastify.log.info(`Generating token for user ${user.npp} with is_superuser=${user.is_superuser}`);
    
    // Create JWT payload with permissions
    const permissions = await getUserPermissions(userId);
    
    // Create JWT payload with permissions - ensure is_superuser is a boolean
    const payload = {
      npp: user.npp,
      name: user.name,
      is_superuser: Boolean(user.is_superuser),
      permissions
    };
    fastify.log.info(`Token payload for user ${user.npp}: ${JSON.stringify(payload)}`);
    
    // Generate token with longer expiration for easier testing
    return jwt.sign(payload, jwtSecret, { 
      expiresIn: '30d' // Extend to 30 days for testing
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
