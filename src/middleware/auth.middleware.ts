import { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify'
import jwt from 'jsonwebtoken'
import fp from 'fastify-plugin'

interface JwtPayload {
  id: string
  npp: string
  name: string
  [key: string]: any
}

declare module 'fastify' {
  interface FastifyRequest {
    user?: any
  }
  
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
    generateToken: (payload: object) => string
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
          id: true
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
   * Generate a new JWT token
   */
  const generateToken = (payload: object): string => {
    return jwt.sign(payload, jwtSecret, { 
      expiresIn: '1d' // Token expires in 1 day
    })
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
