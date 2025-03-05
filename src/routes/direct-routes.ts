import { FastifyPluginAsync } from 'fastify'

/**
 * Direct routes that don't need middleware or controllers
 * Useful for testing and debugging
 */
const directRoutes: FastifyPluginAsync = async (fastify) => {
  // Health check route
  fastify.get('/health', async () => {
    return { status: 'ok', timestamp: new Date() }
  })
  
  // Test route
  fastify.get('/test', async () => {
    return { message: 'Test route working!' }
  })

  // List all routes
  fastify.get('/routes', async (request, reply) => {
    const routes = fastify.printRoutes()
    return { routes }
  })
}

export default directRoutes
