import 'fastify'

declare module 'fastify' {
  interface FastifyRequest {
    user?: any
  }
  
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
    generateToken: (payload: object) => string
  }

  interface RouteOptions {
    config?: {
      authenticated?: boolean
      [key: string]: any
    }
  }
}
