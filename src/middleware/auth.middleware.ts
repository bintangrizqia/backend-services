import { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify'
import jwt from 'jsonwebtoken'
import fp from 'fastify-plugin'

interface JwtPayload {
  npp: string
  name: string
  eselon: number
  is_superuser: boolean
  [key: string]: any
}

declare module 'fastify' {
  interface FastifyRequest {
    user?: any
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
 * Authentication middleware using JWT directly with eselon support
 */
const authMiddleware = fp(async (fastify: FastifyInstance) => {
  const jwtSecret = process.env.JWT_SECRET || 'supersecretkey'
  
  /**
   * Authentication middleware function
   * Verifies JWT token from Authorization header and attaches user to request
   */
  const authenticate = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const authHeader = request.headers.authorization
      
      if (!authHeader) {
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
      
      // Find user in database with eselon
      const user = await fastify.prisma.personnels.findUnique({
        where: { npp: decoded.npp },
        select: {
          npp: true,
          name: true,
          email: true,
          photo: true,
          eselon: true,        // TAMBAH eselon
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
      
      // Attach user data to request - pastikan semua data dari database
      request.user = {
        ...user,
        eselon: user.eselon || 5,               // Default ke staff jika null
        is_superuser: Boolean(user.is_superuser)
      };
      
      // Debug log
      fastify.log.info(`User authenticated: ${request.user.npp}, eselon=${request.user.eselon}, is_superuser=${request.user.is_superuser} (${typeof request.user.is_superuser})`);
      
      // Authentication successful - tidak perlu permission di sini karena sudah pakai eselon
      
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
   * Generate a new JWT token with user basic info (simplified)
   */
  const generateToken = async (userId: string): Promise<string> => {
    // Get user basic info including eselon
    const user = await fastify.prisma.personnels.findUnique({
      where: { id: userId },
      select: {
        npp: true,
        name: true,
        eselon: true,        // TAMBAH eselon
        is_superuser: true
      }
    });
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Log untuk debugging
    fastify.log.info(`Generating token for user ${user.npp} with eselon=${user.eselon}, is_superuser=${user.is_superuser}`);
    
    // Create JWT payload - SIMPLIFIED (tidak perlu permission lagi)
    const payload: JwtPayload = {
      npp: user.npp,
      name: user.name,
      eselon: user.eselon || 5,                    // Default ke staff
      is_superuser: Boolean(user.is_superuser)
    };
    
    fastify.log.info(`Token payload for user ${user.npp}: ${JSON.stringify(payload)}`);
    
    // Generate token
    return jwt.sign(payload, jwtSecret, {
      expiresIn: '24h' // Token valid 24 jam
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