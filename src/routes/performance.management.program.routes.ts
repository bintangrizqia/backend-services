import { FastifyPluginAsync } from 'fastify'
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import { ProgramController } from '../controllers/performance.management.program.controller'
import { Resource, Permission } from '@prisma/client'


const programRoutes: FastifyPluginAsync = async (fastify) => {
  const server = fastify.withTypeProvider<TypeBoxTypeProvider>()
  const programController = new ProgramController(fastify)

  // Perbaikan urutan middleware hooks
  server.addHook('onRequest', fastify.authenticate)
  
  // Get all personnel
  interface GetProgramQuery {
    page?: number;
    limit?: number;
    search?: string;
  }
  
  server.get<{
    Querystring: GetProgramQuery
  }>('/', {
      // Modifikasi hook untuk membiarkan superuser lewat
      preHandler: async (request, reply) => {
        // Superuser bypass checks
        if (request.user && request.user.is_superuser === true) {
          fastify.log.info(`Superuser ${request.user.npp} accessing program list, bypassing permission check`);
          return;
        }
        
        // Regular users go through permission check
        await new Promise<void>((resolve, reject) => {
          fastify.checkPermission(Resource.PROGRAM, Permission.CAN_READ_PROGRAM)(request, reply, (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      },
      schema: {
        tags: ['program'],
        description: 'Mendapatkan daftar semua programs',
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
                year: Type.Number(),
                status: Type.Boolean(),
                program_code: Type.String(),
                created_at: Type.String()
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
  }, programController.getAllProgram.bind(programController))
  
    server.get('/options', {
    preHandler: async (request, reply) => {
      // Superuser bypass checks
      if (request.user && request.user.is_superuser === true) {
        fastify.log.info(`Superuser ${request.user.npp} accessing program options, bypassing permission check`)
        return
      }

      // Regular users go through permission check
      await new Promise<void>((resolve, reject) => {
        fastify.checkPermission(Resource.PROGRAM, Permission.CAN_READ_PROGRAM)(request, reply, (err) => {
          if (err) reject(err)
          else resolve()
        })
      })
    },
    schema: {
      tags: ['program'],
      description: 'Mendapatkan daftar id dan name dari program',
      security: [{ bearerAuth: [] }],
      response: {
        200: Type.Object({
          data: Type.Array(
            Type.Object({
              id: Type.String(),
              name: Type.String()
            })
          )
        })
      }
    }
  }, programController.getProgramOptions.bind(programController))


  // Get personnel by ID
  interface GetPlanTypeParams {
    id: string;
  }

  server.get<{
    Params: GetPlanTypeParams
  }>('/:id', {
      // Modifikasi hook untuk membiarkan superuser lewat
      preHandler: async (request, reply) => {
        // Superuser bypass checks
        if (request.user && request.user.is_superuser === true) {
          fastify.log.info(`Superuser ${request.user.npp} accessing plan program, bypassing permission check`);
          return;
        }
        
        // Regular users go through permission check
        await new Promise<void>((resolve, reject) => {
          fastify.checkPermission(Resource.PROGRAM, Permission.CAN_READ_PROGRAM)(request, reply, (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      },
    schema: {
      tags: ['program'],
      description: 'Mendapatkan program berdasarkan id',
      security: [{ bearerAuth: [] }],
      params: Type.Object({
        id: Type.String()
      }),
      response: {
        200: Type.Object({
                id: Type.String(),
                name: Type.String(),
                description: Type.String(),
                year: Type.Number(),
                status: Type.Boolean(),
                program_code: Type.String(),
                created_at: Type.String()
        })
      },
    }
  }, programController.GetProgramById.bind(programController))

  interface CreateProgramBody {
    name: string
    description: string | null
    year: number
    status: string
    program_code: string
    created_by: string
  }

  server.post<{
    Body: CreateProgramBody
  }>('/', {
      // Modifikasi hook untuk membiarkan superuser lewat
      preHandler: async (request, reply) => {
        // Superuser bypass checks
        if (request.user && request.user.is_superuser === true) {
          fastify.log.info(`Superuser ${request.user.npp} accessing plan program, bypassing permission check`);
          return;
        }
        
        // Regular users go through permission check
        await new Promise<void>((resolve, reject) => {
          fastify.checkPermission(Resource.PROGRAM, [Permission.CAN_READ_PROGRAM, Permission.CAN_CREATE_PROGRAM])(request, reply, (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      },
    schema: {
        tags: ['program'],
        description: 'Membuat program',
        security: [{ bearerAuth: [] }],
        body: Type.Object({
            name: Type.String(),
            description: Type.String(),
            year: Type.Number(),
            status: Type.String(),
            program_code: Type.String(),
            created_by: Type.String()
        }),
        response: {
          200: Type.Object({
            id: Type.String(),
            name: Type.String(),
            description: Type.String(),
            year: Type.Number(),
            status: Type.Boolean(),
            program_code: Type.String(),
            created_at: Type.String()
          })
        },
      }
  }, programController.createProgram.bind(programController))


  interface DeleteProgramParams {
    id: string
  }
  server.delete<{
    Params: DeleteProgramParams
  }>('/:id', {
      // Modifikasi hook untuk membiarkan superuser lewat
      preHandler: async (request, reply) => {
        // Superuser bypass checks
        if (request.user && request.user.is_superuser === true) {
          fastify.log.info(`Superuser ${request.user.npp} accessing plan program, bypassing permission check`);
          return;
        }
        
        // Regular users go through permission check
        await new Promise<void>((resolve, reject) => {
          fastify.checkPermission(Resource.PROGRAM, [Permission.CAN_READ_PROGRAM, Permission.CAN_DELETE_PROGRAM])(request, reply, (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      },
    schema: {
        tags: ['program'],
        description: 'Hapus program',
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
  }, programController.deleteProgram.bind(programController))


  server.put<{
    Params: DeleteProgramParams,
    Body: CreateProgramBody
  }>('/:id', {
          // Modifikasi hook untuk membiarkan superuser lewat
          preHandler: async (request, reply) => {
            // Superuser bypass checks
            if (request.user && request.user.is_superuser === true) {
              fastify.log.info(`Superuser ${request.user.npp} accessing plan program, bypassing permission check`);
              return;
            }
            
            // Regular users go through permission check
            await new Promise<void>((resolve, reject) => {
              fastify.checkPermission(Resource.PROGRAM, [Permission.CAN_READ_PROGRAM, Permission.CAN_UPDATE_PROGRAM])(request, reply, (err) => {
                if (err) reject(err);
                else resolve();
              });
            });
          },
    schema: {
        tags: ['program'],
        description: 'Edit program',
        security: [{ bearerAuth: [] }],
        params: Type.Object({
          id: Type.String()
        }),
        body: Type.Object({
            name: Type.String(),
            description: Type.String(),
            year: Type.Number(),
            status: Type.String(),
            program_code: Type.String(),
            created_by: Type.String()
        }),
        response: {
          200: Type.Object({
            id: Type.String(),
            name: Type.String(),
            description: Type.String(),
            year: Type.Number(),
            status: Type.Boolean(),
            program_code: Type.String(),
            created_at: Type.String()
          })
        },
      }
  }, programController.editProgram.bind(programController))
}

export default programRoutes
