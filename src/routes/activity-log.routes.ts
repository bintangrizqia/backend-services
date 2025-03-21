import { FastifyPluginAsync } from 'fastify'
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import { ActivityLogController } from '../controllers/activity-log.controller'
import { Resource, Permission } from '@prisma/client'

const activityLogRoutes: FastifyPluginAsync = async (fastify) => {
  const server = fastify.withTypeProvider<TypeBoxTypeProvider>()
  const activityLogController = new ActivityLogController(fastify)

  // Secure all routes with JWT authentication
  server.addHook('onRequest', fastify.authenticate)
  
  // Get all logs - only accessible by superuser
  server.get<{
    Querystring: {
      page?: number;
      limit?: number;
      personnel_id?: string;
      startDate?: string;
      endDate?: string;
      activity_type?: string;
    }
  }>('/', {
    preValidation: async (request, reply) => {
      // Only superuser can see logs
      if (request.user && request.user.is_superuser === true) {
        return
      }
      throw new Error('Permission denied')
    },
    schema: {
      tags: ['activity-logs'],
      description: 'Get activity logs (superuser only)',
      security: [{ bearerAuth: [] }],
      querystring: Type.Object({
        page: Type.Optional(Type.Number({ minimum: 1 })),
        limit: Type.Optional(Type.Number({ minimum: 1, maximum: 100 })),
        personnel_id: Type.Optional(Type.String()),
        startDate: Type.Optional(Type.String({ format: 'date-time' })),
        endDate: Type.Optional(Type.String({ format: 'date-time' })),
        activity_type: Type.Optional(Type.String())
      }),
      response: {
        200: Type.Object({
          data: Type.Array(
            Type.Object({
              id: Type.String(),
              personnel_id: Type.Union([Type.String(), Type.Null()]),
              url: Type.String(),
              method: Type.String(),
              description: Type.Union([Type.String(), Type.Null()]),
              ip_address: Type.Union([Type.String(), Type.Null()]),
              activity_type: Type.String(),
              status_code: Type.Union([Type.Number(), Type.Null()]),
              created_at: Type.String(),
              personnel: Type.Union([
                Type.Object({
                  npp: Type.String(),
                  name: Type.String()
                }),
                Type.Null()
              ])
            })
          ),
          meta: Type.Object({
            page: Type.Number(),
            limit: Type.Number(),
            totalCount: Type.Number(),
            totalPages: Type.Number()
          })
        })
      }
    }
  }, activityLogController.getLogs.bind(activityLogController))

  // Get log by ID - only accessible by superuser
  server.get<{
    Params: { id: string }
  }>('/:id', {
    preValidation: async (request, reply) => {
      // Only superuser can see logs
      if (request.user && request.user.is_superuser === true) {
        return
      }
      throw new Error('Permission denied')
    },
    schema: {
      tags: ['activity-logs'],
      description: 'Get activity log by ID (superuser only)',
      security: [{ bearerAuth: [] }],
      params: Type.Object({
        id: Type.String()
      }),
      response: {
        200: Type.Object({
          id: Type.String(),
          personnel_id: Type.Union([Type.String(), Type.Null()]),
          url: Type.String(),
          method: Type.String(),
          description: Type.Union([Type.String(), Type.Null()]),
          ip_address: Type.Union([Type.String(), Type.Null()]),
          user_agent: Type.Union([Type.String(), Type.Null()]),
          payload: Type.Union([Type.Unknown(), Type.Null()]),
          activity_type: Type.String(),
          status_code: Type.Union([Type.Number(), Type.Null()]),
          created_at: Type.String(),
          personnel: Type.Union([
            Type.Object({
              npp: Type.String(),
              name: Type.String()
            }),
            Type.Null()
          ])
        })
      }
    }
  }, activityLogController.getLogById.bind(activityLogController))
}

export default activityLogRoutes
