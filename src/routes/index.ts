import { FastifyPluginAsync } from 'fastify'
import authRoutes from './auth.routes'
import personnelRoutes from './personnel.routes'
import groupRoutes from './group.routes'
import activityLogRoutes from './activity-log.routes'
import organizationRoutes from './organization.routes'

const routes: FastifyPluginAsync = async (fastify, options) => {
  // Auth routes
  await fastify.register(authRoutes, { 
    prefix: '/auth'
  })
  
  // Personnel routes
  await fastify.register(personnelRoutes, { 
    prefix: '/personnels'  
  })
  
  // Group routes
  await fastify.register(groupRoutes, {
    prefix: '/groups'
  })

  // Organization routes
  await fastify.register(organizationRoutes, {
    prefix: '/organizations'
  })
  
  // Activity log routes
  await fastify.register(activityLogRoutes, { 
    prefix: '/activity-logs'  
  })
  
  // Add ping route directly to the root
  fastify.get('/ping', async () => {
    return { status: 'ok', time: new Date().toISOString() }
  })
}

export default routes
