import Fastify, { FastifyInstance } from 'fastify'
import cors from '@fastify/cors'
import fastifyEnv from '@fastify/env'
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import prismaPlugin from './plugins/prisma'
import authMiddleware from './middleware/auth.middleware'
import routes from './routes'

// Environmental schema
const schema = {
  type: 'object',
  required: ['PORT', 'HOST'],
  properties: {
    PORT: {
      type: 'string',
      default: '3000'
    },
    HOST: {
      type: 'string',
      default: '127.0.0.1'
    },
    NODE_ENV: {
      type: 'string',
      default: 'development'
    },
    JWT_SECRET: {
      type: 'string',
      default: 'supersecretkey'
    }
  }
}

// Create Fastify instance with TypeBox for schema validation
export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: {
      level: process.env.NODE_ENV === 'development' ? 'debug' : 'info'
    }
  }).withTypeProvider<TypeBoxTypeProvider>()

  // Register env plugin
  await app.register(fastifyEnv, {
    schema,
    dotenv: true
  })

  // Register other plugins
  await app.register(cors, {
    origin: true
  })
  
  // Register Prisma client
  await app.register(prismaPlugin)
  
  // Register custom auth middleware
  await app.register(authMiddleware)
  
  // Direct health and test routes
  app.get('/health', async () => {
    return { status: 'ok', timestamp: new Date() }
  })
  
  app.get('/test', async () => {
    return { message: 'Test route working!' }
  })
  
  app.get('/routes', async () => {
    return { routes: app.printRoutes() }
  })
  
  // Register main routes
  await app.register(routes)

  return app
}

// For TypeScript to recognize config on fastify instance
declare module 'fastify' {
  interface FastifyInstance {
    config: {
      PORT: string
      HOST: string
      NODE_ENV: string
      JWT_SECRET: string
    }
  }
}
