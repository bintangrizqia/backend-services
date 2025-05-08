import { FastifyPluginAsync } from 'fastify'
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import { PlanTypesController } from '../controllers/performance.management.plan.types.controller'
import { Resource, Permission } from '@prisma/client'

const planTypeRoutes: FastifyPluginAsync = async (fastify) => {
  const server = fastify.withTypeProvider<TypeBoxTypeProvider>()
  const planTypesController = new PlanTypesController(fastify)

  // Perbaikan urutan middleware hooks
  server.addHook('onRequest', fastify.authenticate)
  
  // Get all personnel
  interface GetPlanTypesQuery {
    page?: number;
    limit?: number;
    search?: string;
  }
  
  server.get<{
    Querystring: GetPlanTypesQuery
  }>('/', {
      // Modifikasi hook untuk membiarkan superuser lewat
      preValidation: async (request, reply) => {
        // Superuser bypass checks
        if (request.user && request.user.is_superuser === true) {
          fastify.log.info(`Superuser ${request.user.npp} accessing plan types list, bypassing permission check`);
          return;
        }
        
        // Regular users go through permission check
        await new Promise<void>((resolve, reject) => {
          fastify.checkPermission(Resource.PLAN_TYPES, Permission.CAN_READ_PLAN_TYPE)(request, reply, (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      },
      schema: {
        tags: ['plan-types'],
        description: 'Mendapatkan daftar semua plan types',
        security: [{ bearerAuth: [] }],
        querystring: Type.Object({
          page: Type.Optional(Type.Number({ minimum: 1 })),
          limit: Type.Optional(Type.Number({ minimum: 1, maximum: 100 })),
          search: Type.Optional(Type.String())
        }),
      response: {
        200: Type.Object({
          data: Type.Array(
            Type.Object({
                id: Type.String(),
                name: Type.String(),
                description: Type.String(),
                created_at: Type.String(),
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
  }, planTypesController.getAllPlanTypes.bind(planTypesController))

  // Get personnel by ID
  interface GetPlanTypeParams {
    id: string;
  }

  server.get<{
    Params: GetPlanTypeParams
  }>('/:id', {
      // Modifikasi hook untuk membiarkan superuser lewat
      preValidation: async (request, reply) => {
        // Superuser bypass checks
        if (request.user && request.user.is_superuser === true) {
          fastify.log.info(`Superuser ${request.user.npp} accessing plan types list, bypassing permission check`);
          return;
        }
        
        // Regular users go through permission check
        await new Promise<void>((resolve, reject) => {
          fastify.checkPermission(Resource.PLAN_TYPES, Permission.CAN_READ_PLAN_TYPE)(request, reply, (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      },
    schema: {
      tags: ['plan-types'],
      description: 'Mendapatkan plan type berdasarkan id',
      security: [{ bearerAuth: [] }],
      params: Type.Object({
        id: Type.String()
      }),
      response: {
        200: Type.Object({
          id: Type.String(),
          name: Type.String(),
          description: Type.String(),
          created_at: Type.String(),
        })
      },
    }
  }, planTypesController.GetPlanTypesById.bind(planTypesController))

  interface CreatePlanTypeBody {
    name: string
    description: string | null
  }

  server.post<{
    Body: CreatePlanTypeBody
  }>('/', {
      // Modifikasi hook untuk membiarkan superuser lewat
      preValidation: async (request, reply) => {
        // Superuser bypass checks
        if (request.user && request.user.is_superuser === true) {
          fastify.log.info(`Superuser ${request.user.npp} accessing plan types list, bypassing permission check`);
          return;
        }
        
        // Regular users go through permission check
        await new Promise<void>((resolve, reject) => {
          fastify.checkPermission(Resource.PLAN_TYPES, [Permission.CAN_READ_PLAN_TYPE, Permission.CAN_CREATE_PLAN_TYPE])(request, reply, (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      },
    schema: {
        tags: ['plan-types'],
        description: 'Membuat plan type',
        security: [{ bearerAuth: [] }],
        body: Type.Object({
          name: Type.String(),
          description: Type.String()
        }),
        response: {
          200: Type.Object({
            id: Type.String(),
            name: Type.String(),
            description: Type.String(),
            created_at: Type.String(),
          })
        },
      }
  }, planTypesController.createPlanTypes.bind(planTypesController))


  interface DeletePlanTypeParams {
    id: string
  }
  server.delete<{
    Params: DeletePlanTypeParams
  }>('/:id', {
    preHandler: fastify.checkPermission(Resource.PLAN_TYPES, Permission.CAN_DELETE_PLAN_TYPE),
    schema: {
        tags: ['plan-types'],
        description: 'Hapus plan type',
        security: [{ bearerAuth: [] }],
        params: Type.Object({
          id: Type.String()
        }),
        response: {
          200: Type.Object({
            message: Type.String()
          })
        },
      }
  }, planTypesController.deletePlanTypes.bind(planTypesController))


  server.put<{
    Params: DeletePlanTypeParams,
    Body: CreatePlanTypeBody
  }>('/:id', {
    preHandler: fastify.checkPermission(Resource.PLAN_TYPES, Permission.CAN_UPDATE_PLAN_TYPE),
    schema: {
        tags: ['plan-types'],
        description: 'Edit plan type',
        security: [{ bearerAuth: [] }],
        params: Type.Object({
          id: Type.String()
        }),
        body: Type.Object({
            name: Type.String(),
            description: Type.String()
        }),
        response: {
          200: Type.Object({
            id: Type.String(),
            name: Type.String(),
            description: Type.String(),
            created_at: Type.String(),
          })
        },
      }
  }, planTypesController.editPlanTypes.bind(planTypesController))
}

export default planTypeRoutes
