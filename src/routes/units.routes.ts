import { FastifyPluginAsync } from 'fastify'
import { UnitsController } from '../controllers/units.controller'

interface GetUnitsQuery {
  active?: boolean
}

const unitsRoutes: FastifyPluginAsync = async (fastify) => {
  const controller = new UnitsController(fastify)

  /* ----------  GET LIST UNITS ---------- */
  fastify.get<{ Querystring: GetUnitsQuery }>(
    '/', // <--- kasih generic di sini
    {
      preHandler: [fastify.authenticate],
      schema: {
        tags: ['units'],
        description: 'Get list of units (id & name)',
        querystring: {
          type: 'object',
          properties: {
            active: { type: 'boolean' }
          }
        }
      }
    },
    controller.getUnits.bind(controller)
  )
}

export default unitsRoutes
