// src/routes/overview-division.routes.ts
import { FastifyInstance } from 'fastify'
import { OverviewDivisionController } from '../controllers/overview-division.controller'
import { Static, Type } from '@sinclair/typebox'

const GetOverviewDivisionQuery = Type.Object({
  page: Type.Optional(Type.Integer({ minimum: 1 })),
  limit: Type.Optional(Type.Integer({ minimum: 1 })),
  search: Type.Optional(Type.String()),
  personnel_id: Type.Optional(Type.String())
})

export default async function overviewDivisionRoutes(server: FastifyInstance) {
  const controller = new OverviewDivisionController(server)

  server.get('/', {
    schema: {
      tags: ['overview-division'],
      querystring: GetOverviewDivisionQuery,
      response: {
        200: Type.Object({
          data: Type.Array(Type.Any()),
          meta: Type.Any()
        })
      }
    },
    preHandler: [server.authenticate],
    handler: controller.getAllOverviewDivision.bind(controller)
  })
}
