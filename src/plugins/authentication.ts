import { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify'
import fp from 'fastify-plugin'
import jwt from 'jsonwebtoken'

interface AuthPluginOptions {
  secret?: string
}

// Extending FastifyRequest to include user property
declare module 'fastify' {
  interface FastifyRequest {
    user?: any
  }
  
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
  }
}

const authPlugin: FastifyPluginAsync<AuthPluginOptions> = async (fastify, options) => {
  const secret = options.secret || process.env.JWT_SECRET || 'default-secret'
  
  // Add authenticate decorator to fastify instance
  fastify.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const authHeader = request.headers.authorization
      
      if (!authHeader) {
        throw new Error('Authorization header is required')
      }
      
      // Get token from header
      const token = authHeader.split(' ')[1]
      
      if (!token) {
        throw new Error('Bearer token is required')
      }
      
      // Verify token
      const decoded = jwt.verify(token, secret)
      request.user = decoded
    } catch (err) {
      reply.status(401).send({
        error: 'Unauthorized',
        message: 'Authentication failed'
      })
    }
  })
}

export default fp(authPlugin, { name: 'authentication' })
