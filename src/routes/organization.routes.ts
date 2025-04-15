import { FastifyPluginAsync } from 'fastify'
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import { PersonnelController } from '../controllers/personnel.controller'
import { Resource, Permission } from '@prisma/client'

const organizationRoutes: FastifyPluginAsync = async (fastify) => {
  const server = fastify.withTypeProvider<TypeBoxTypeProvider>()
  const personnelController = new PersonnelController(fastify)

  // Perbaikan urutan middleware hooks
  server.addHook('onRequest', fastify.authenticate)
  
  // Get all personnel
  interface GetOrganizationQuery {
    page?: number;
    limit?: number;
    search?: string;
  }
  
  server.get<{
    Querystring: GetOrganizationQuery
  }>('/', {
      // Modifikasi hook untuk membiarkan superuser lewat
      preValidation: async (request, reply) => {
        // Superuser bypass checks
        if (request.user && request.user.is_superuser === true) {
          fastify.log.info(`Superuser ${request.user.npp} accessing personnel list, bypassing permission check`);
          return;
        }
        
        // Regular users go through permission check
        await new Promise<void>((resolve, reject) => {
          fastify.checkPermission(Resource.PERSONNEL, Permission.CAN_CREATE_PERSONNEL)(request, reply, (err) => {
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
    preHandler: fastify.checkPermission(Resource.PERSONNEL, Permission.CAN_READ_PERSONNEL),
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
          photo: Type.Union([Type.String(), Type.Null()]),
          created_at: Type.String(),
          updated_at: Type.String(),
        })
      },
    }
  }, personnelController.getPersonnelById.bind(personnelController))

  // Create personnel
  server.post<{
    Body: {
      npp: string;
      name: string;
      email?: string;
      password: string;
      photo?: string;
    }
  }>('/', {
    preHandler: fastify.checkPermission(Resource.PERSONNEL, Permission.CAN_CREATE_PERSONNEL),
    schema: {
      tags: ['personnels'],
      description: 'Membuat personel baru',
      security: [{ bearerAuth: [] }],
      body: Type.Object({
        npp: Type.String(),
        name: Type.String(),
        email: Type.Optional(Type.String({ format: 'email' })),
        password: Type.String(),
        photo: Type.Optional(Type.String()),
      }),
      response: {
        201: Type.Object({
          npp: Type.String(),
          name: Type.String(),
          email: Type.Union([Type.String(), Type.Null()]),
          photo: Type.Union([Type.String(), Type.Null()]),
          created_at: Type.String(),
          updated_at: Type.String(),
        })
      },
    }
  }, personnelController.createPersonnel.bind(personnelController))

  // Update personnel
  interface UpdatePersonnelRequest {
    npp?: string;
    name?: string;
    email?: string;
    password?: string;
    photo?: string;
  }

  server.put<{
    Params: GetPersonnelParams;
    Body: UpdatePersonnelRequest;
  }>('/:npp', {
    preHandler: fastify.checkPermission(Resource.PERSONNEL, Permission.CAN_UPDATE_PERSONNEL),
    schema: {
      tags: ['personnels'],
      description: 'Memperbarui informasi personel',
      security: [{ bearerAuth: [] }],
      params: Type.Object({
        npp: Type.String()
      }),
      body: Type.Object({
        npp: Type.Optional(Type.String()),
        name: Type.Optional(Type.String()),
        email: Type.Optional(Type.String({ format: 'email' })),
        password: Type.Optional(Type.String()),
        photo: Type.Optional(Type.String()),
      }),
      response: {
        200: Type.Object({
          npp: Type.String(),
          name: Type.String(),
          email: Type.Union([Type.String(), Type.Null()]),
          photo: Type.Union([Type.String(), Type.Null()]),
          created_at: Type.String(),
          updated_at: Type.String(),
        })
      },
    }
  }, personnelController.updatePersonnel.bind(personnelController))

  // Delete personnel
  server.delete<{
    Params: GetPersonnelParams
  }>('/:npp', {
    preHandler: fastify.checkPermission(Resource.PERSONNEL, Permission.CAN_DELETE_PERSONNEL),
    schema: {
      tags: ['personnels'],
      description: 'Menghapus personel',
      security: [{ bearerAuth: [] }],
      params: Type.Object({
        npp: Type.String()
      }),
      response: {
        204: Type.Null()
      },
    }
  }, personnelController.deletePersonnel.bind(personnelController))
}

export default organizationRoutes
