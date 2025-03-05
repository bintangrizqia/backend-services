import { FastifyPluginAsync } from 'fastify'
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import { AuthController } from '../controllers/auth.controller'

const authRoutes: FastifyPluginAsync = async (fastify) => {
  const server = fastify.withTypeProvider<TypeBoxTypeProvider>()
  const authController = new AuthController(fastify)

  // Login endpoint
  server.post('/login', {
    schema: {
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
