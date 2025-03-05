import { FastifyPluginAsync } from 'fastify'
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import { PersonnelController } from '../controllers/personnel.controller'

const personnelRoutes: FastifyPluginAsync = async (fastify) => {
  const server = fastify.withTypeProvider<TypeBoxTypeProvider>()
  const personnelController = new PersonnelController(fastify)

  // Secure all routes with JWT authentication
  server.addHook('preHandler', fastify.authenticate)
  
  // Get all personnel - make sure this is registered correctly
  server.get('/', {
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
      },
      security: [{ bearerAuth: [] }]
    }
  }, personnelController.getAllPersonnel.bind(personnelController))

  // Get personnel by ID
  server.get('/:id', {
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
      security: [{ bearerAuth: [] }]
    }
  }, personnelController.getPersonnelById.bind(personnelController))

  // Create personnel
  server.post('/', {
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
      security: [{ bearerAuth: [] }]
    }
  }, personnelController.createPersonnel.bind(personnelController))

  // Update personnel
  server.put('/:id', {
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
      security: [{ bearerAuth: [] }]
    }
  }, personnelController.updatePersonnel.bind(personnelController))

  // Delete personnel
  server.delete('/:id', {
    schema: {
      params: Type.Object({
        id: Type.String()
      }),
      response: {
        204: Type.Null()
      },
      security: [{ bearerAuth: [] }]
    }
  }, personnelController.deletePersonnel.bind(personnelController))
}

export default personnelRoutes
