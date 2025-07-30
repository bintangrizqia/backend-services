import { FastifyPluginAsync } from 'fastify'
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import { PlanProjectController } from '../controllers/plan-project.controller'

const planProjectRoutes: FastifyPluginAsync = async (fastify) => {
  const server = fastify.withTypeProvider<TypeBoxTypeProvider>()
  const controller = new PlanProjectController(fastify)

  server.addHook('onRequest', fastify.authenticate)

  server.get('/options', {
    preHandler: async (request, reply) => {
      // Cukup log jika superuser, tanpa permission check
      if (request.user?.is_superuser) {
        fastify.log.info(`Superuser ${request.user.npp} accessing project options`)
      }
    },
    schema: {
      tags: ['plan-project'],
      description: 'Get list of projects (id and name only)',
      security: [{ bearerAuth: [] }],
      response: {
        200: Type.Object({
          data: Type.Array(
            Type.Object({
              id: Type.String(),
              name: Type.String(),
            })
          ),
        }),
      },
    },
  }, controller.getProjectOptions.bind(controller))
}

export default planProjectRoutes
