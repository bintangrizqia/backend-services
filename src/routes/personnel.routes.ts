import { FastifyPluginAsync } from 'fastify'
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import { PersonnelController } from '../controllers/personnel.controller'
import { Resource, Permission } from '@prisma/client'

const personnelRoutes: FastifyPluginAsync = async (fastify) => {
  const server = fastify.withTypeProvider<TypeBoxTypeProvider>()
  const personnelController = new PersonnelController(fastify)

  // Secure all routes with JWT authentication
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
      // Use the new hook-style permission check
      preHandler: fastify.checkPermission(Resource.PERSONNEL, Permission.READ),
      schema: {
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
    id: string;
  }

  server.get<{
    Params: GetPersonnelParams
  }>('/:id', {
    preHandler: fastify.checkPermission(Resource.PERSONNEL, Permission.READ),
    schema: {
      params: Type.Object({
        id: Type.String()
      }),
      response: {
        200: Type.Object({
          id: Type.String(),
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
    preHandler: fastify.checkPermission(Resource.PERSONNEL, Permission.CREATE),
    schema: {
      body: Type.Object({
        npp: Type.String(),
        name: Type.String(),
        email: Type.Optional(Type.String({ format: 'email' })),
        password: Type.String(),
        photo: Type.Optional(Type.String()),
      }),
      response: {
        201: Type.Object({
          id: Type.String(),
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
  }>('/:id', {
    preHandler: fastify.checkPermission(Resource.PERSONNEL, Permission.UPDATE),
    schema: {
      params: Type.Object({
        id: Type.String()
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
          id: Type.String(),
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
  }>('/:id', {
    preHandler: fastify.checkPermission(Resource.PERSONNEL, Permission.DELETE),
    schema: {
      params: Type.Object({
        id: Type.String()
      }),
      response: {
        204: Type.Null()
      },
    }
  }, personnelController.deletePersonnel.bind(personnelController))
}

export default personnelRoutes
