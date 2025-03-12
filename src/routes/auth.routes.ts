import { FastifyPluginAsync } from 'fastify'
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import { AuthController } from '../controllers/auth.controller'

declare module 'fastify' {
  interface FastifyContextConfig {
    authenticated?: boolean
  }
}

const authRoutes: FastifyPluginAsync = async (fastify) => {
  const server = fastify.withTypeProvider<TypeBoxTypeProvider>()
  const authController = new AuthController(fastify)

  // Login endpoint
  server.post('/login', {
    schema: {
      tags: ['auth'],
      body: Type.Object({
        npp: Type.String(),
        password: Type.String(),
      }),
      response: {
        200: Type.Object({
          user: Type.Object({
            id: Type.String(),
            npp: Type.String(),
            name: Type.String(),
            email: Type.Union([Type.String(), Type.Null()]),
          }),
          token: Type.String()
        })
      }
    }
  }, authController.login.bind(authController))

  // Register endpoint
  server.post('/register', {
    schema: {
      tags: ['auth'],
      body: Type.Object({
        npp: Type.String(),
        name: Type.String(),
        email: Type.Optional(Type.String({ format: 'email' })),
        password: Type.String(),
        photo: Type.Optional(Type.String()),
        is_superuser: Type.Optional(Type.Boolean()),
        groups: Type.Optional(Type.Array(Type.String())),
        permissions: Type.Optional(Type.Array(
          Type.Object({
            resource: Type.Enum({ PERSONNEL: 'PERSONNEL', PROJECT: 'PROJECT' }),
            permission: Type.Enum({ READ: 'READ', DELETE: 'DELETE', UPDATE: 'UPDATE', CREATE: 'CREATE' })
          })
        ))
      }),
      response: {
        201: Type.Object({
          id: Type.String(),
          npp: Type.String(),
          name: Type.String(),
          email: Type.Union([Type.String(), Type.Null()]),
          photo: Type.Union([Type.String(), Type.Null()]),
          is_superuser: Type.Boolean(),
          created_at: Type.String(),
          updated_at: Type.String(),
          PersonnelGroups: Type.Array(
            Type.Object({
              id: Type.String(),
              personnel_id: Type.String(),
              group_id: Type.String(),
              created_at: Type.String(),
              group: Type.Object({
                id: Type.String(),
                name: Type.String(),
                created_at: Type.String(),
                updated_at: Type.String()
              })
            })
          ),
          PersonnelPermissions: Type.Array(
            Type.Object({
              id: Type.String(),
              personnel_id: Type.String(),
              resource: Type.Enum({ PERSONNEL: 'PERSONNEL', PROJECT: 'PROJECT' }),
              permission: Type.Enum({ READ: 'READ', DELETE: 'DELETE', UPDATE: 'UPDATE', CREATE: 'CREATE' }),
              created_at: Type.String()
            })
          )
        })
      }
    }
  }, authController.register.bind(authController))

  // Get current user endpoint - use custom authenticate middleware
  server.get('/me', {
    preHandler: [fastify.authenticate],
    config: {
      authenticated: true
    },
    schema: {
      tags: ['auth'],
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
      }
    }
  }, authController.getCurrentUser.bind(authController))
}

export default authRoutes
