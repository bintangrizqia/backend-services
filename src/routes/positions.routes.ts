import { FastifyPluginAsync } from 'fastify'
import { PositionsController } from '../controllers/positions.controller'

interface GetPositionsQuery {
  active?: boolean
}

const positionsRoutes: FastifyPluginAsync = async (fastify) => {
  const controller = new PositionsController(fastify)

  /* ----------  GET LIST POSITIONS ---------- */
  fastify.get<{ Querystring: GetPositionsQuery }>(
    '/',
    {
      preHandler: [fastify.authenticate],
      schema: {
        tags: ['positions'],
        description: 'Get list of positions (id & name)',
        querystring: {
          type: 'object',
          properties: {
            active: { type: 'boolean' }
          }
        }
      }
    },
    controller.getPositions.bind(controller)
  )
}

export default positionsRoutes
