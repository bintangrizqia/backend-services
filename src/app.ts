import Fastify, { FastifyInstance } from 'fastify'
import cors from '@fastify/cors'
import fastifyEnv from '@fastify/env'
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import prismaPlugin from './plugins/prisma'
import authMiddleware from './middleware/auth.middleware'
import permissionMiddleware from './middleware/permission.middleware'
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
  
  // Register permission middleware
  await app.register(permissionMiddleware)
  
  // Add a catch-all error handler specifically for permission errors
  app.setErrorHandler((error, request, reply) => {
    app.log.error(`Error: ${error.message}`);
    
    // Check if the error is from our permission middleware
    if (error.message === 'Permission denied') {
      if (!reply.sent) {
        reply.status(403).send({
          error: 'Forbidden',
          message: 'You do not have permission to access this resource'
        });
      }
      return;
    }
    
    // For authentication errors
    if (error.message.includes('Authentication') || 
        error.message.includes('Unauthorized') ||
        error.message.includes('token')) {
      reply.status(401).send({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
      return;
    }
    
    // Default error handling
    reply.status(500).send({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred'
    });
  });
  
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
