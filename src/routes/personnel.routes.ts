import { FastifyPluginAsync } from 'fastify'
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import { PersonnelController } from '../controllers/personnel.controller'
import { Resource, Permission } from '@prisma/client'

const personnelRoutes: FastifyPluginAsync = async (fastify) => {
  const server = fastify.withTypeProvider<TypeBoxTypeProvider>()
  const personnelController = new PersonnelController(fastify)

  // Perbaikan urutan middleware hooks
  server.addHook('onRequest', fastify.authenticate)
  
  // Get all personnel
  interface GetPersonnelQuery {
    page?: number;
    limit?: number;
    search?: string;
  }
  
  server.get<{
    Querystring: GetPersonnelQuery
  }>('/', {
      // Modifikasi hook untuk membiarkan superuser lewat
      preHandler: async (request, reply) => {
        // Superuser bypass checks
        if (request.user && request.user.is_superuser === true) {
          fastify.log.info(`Superuser ${request.user.npp} accessing personnel list, bypassing permission check`);
          return;
        }
        
        // Regular users go through permission check
        await new Promise<void>((resolve, reject) => {
          fastify.checkPermission(Resource.PERSONNEL, Permission.CAN_READ_PERSONNEL)(request, reply, (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      },
      schema: {
        tags: ['personnels'],
        description: 'Mendapatkan daftar semua personel',
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
              npp: Type.String(),
              name: Type.String(),
              email: Type.Union([Type.String(), Type.Null()]),
              unit: Type.Object({
                id: Type.String(),
                name: Type.String(),
                position_type: Type.String(),
                created_at: Type.String()
              }),
              position: Type.Object({
                id: Type.Number(),
                name: Type.String(),
                type_position: Type.Object({
                  id: Type.Number(),
                  name_f: Type.String(),
                  name_s: Type.String(),
                  eselon: Type.Number(),
                  level_type_position: Type.String(),
                  description: Type.String(),
                  created_at: Type.String()
                })
              }),
              photo: Type.Union([Type.String(), Type.Null()]),
              created_at: Type.String(),
              updated_at: Type.String(),
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
  }, personnelController.getAllPersonnel.bind(personnelController))

  // Get personnel by ID
  interface GetPersonnelParams {
    npp: string;
  }

  server.get<{
    Params: GetPersonnelParams
  }>('/:npp', {
      // Modifikasi hook untuk membiarkan superuser lewat
      preHandler: async (request, reply) => {
        // Superuser bypass checks
        if (request.user && request.user.is_superuser === true) {
          fastify.log.info(`Superuser ${request.user.npp} accessing personnel list, bypassing permission check`);
          return;
        }
        
        // Regular users go through permission check
        await new Promise<void>((resolve, reject) => {
          fastify.checkPermission(Resource.PERSONNEL, Permission.CAN_READ_PERSONNEL)(request, reply, (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      },
    schema: {
      tags: ['personnels'],
      description: 'Mendapatkan personel berdasarkan NPP',
      security: [{ bearerAuth: [] }],
      params: Type.Object({
        npp: Type.String()
      }),
      response: {
        200: Type.Object({
          npp: Type.String(),
          name: Type.String(),
          email: Type.Union([Type.String(), Type.Null()]),
          unit: Type.Object({
            id: Type.String(),
            name: Type.String(),
            position_type: Type.String(),
            created_at: Type.String()
          }),
          position: Type.Object({
            id: Type.Number(),
            name: Type.String(),
            type_position: Type.Object({
              id: Type.Number(),
              name_f: Type.String(),
              name_s: Type.String(),
              eselon: Type.Number(),
              level_type_position: Type.String(),
              description: Type.String(),
              created_at: Type.String()
            })
          }),
          photo: Type.Union([Type.String(), Type.Null()]),
          created_at: Type.String(),
          updated_at: Type.String(),
        })
      },
    }
  }, personnelController.getPersonnelById.bind(personnelController))
}

export default personnelRoutes
