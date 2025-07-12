import { FastifyInstance } from 'fastify'
import { OverviewDivisionController } from '../controllers/overview-division.controller'
import { Type } from '@sinclair/typebox'

export default async function overviewDivisionRoutes(fastify: FastifyInstance) {
  const controller = new OverviewDivisionController(fastify)

  await fastify.get('/overview-division', {
    schema: {
      tags: ['overview-division'],
      description: 'Get overview data for divisions by personnel',
      querystring: Type.Object({
        unit_id: Type.Optional(Type.Integer()),
        program_id: Type.Optional(Type.String()),
        page: Type.Optional(Type.Integer({ default: 1 })),
        limit: Type.Optional(Type.Integer({ default: 10 }))
      }),
      response: {
        200: Type.Object({
          data: Type.Array(Type.Any()),
          meta: Type.Object({
            page: Type.Integer(),
            limit: Type.Integer(),
            totalCount: Type.Integer(),
            totalPages: Type.Integer()
          })
        })
      }
    },
    handler: controller.getAllOverviewDivision.bind(controller)
  })
}
