import { FastifyPluginAsync } from 'fastify'
import authRoutes from './auth.routes'
import personnelRoutes from './personnel.routes'

// This is the main routes file that registers all routes
const routes: FastifyPluginAsync = async (fastify, options) => {
  // Auth routes
  await fastify.register(authRoutes, { 
    prefix: '/auth'
  })
  
  // Personnel routes - fix the prefix here
  await fastify.register(personnelRoutes, { 
    prefix: '/personnels'  
  })
  
  // Add ping route directly to the root
  fastify.get('/ping', async () => {
    return { status: 'ok', time: new Date().toISOString() }
  })
}

export default routes
