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

import Fastify, { FastifyInstance } from 'fastify'
import cors from '@fastify/cors'
import fastifyEnv from '@fastify/env'
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import swagger from '@fastify/swagger'
import swaggerUI from '@fastify/swagger-ui'
import prismaPlugin from './plugins/prisma'
import authMiddleware from './middleware/auth.middleware'
import permissionMiddleware from './middleware/permission.middleware'
import activityLoggerMiddleware from './middleware/activity-logger.middleware'
import routes from './routes'
import mandatoryTalentaRoutes from './routes/mandatory-talenta.routes'
import accessProjectRoutes from './routes/access-project.routes'
import overviewDivisionRoutes from './routes/overview-division.routes'
import statusRealisasiRoutes from './routes/status-realisasi.routes'
import programRoutes from './routes/performance.management.program.routes'
import planProjectRoutes from './routes/plan-project.routes'
import assignProjectRoutes from './routes/assign-project.routes'




// Environmental schema
const schema = {
  type: 'object',
  required: ['PORT', 'HOST'],
  properties: {
    PORT: {
      type: 'string',
      default: '3002'
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

  // Register Swagger for API documentation
  await app.register(swagger, {
    swagger: {
      info: {
        title: 'PMP API Documentation',
        description: 'Personnel Management Portal API documentation',
        version: '1.0.0'
      },
      externalDocs: {
        url: 'https://swagger.io',
        description: 'Find more info here'
      },
      host: `${process.env.HOST || 'localhost'}:${process.env.PORT || 3000}`,
      schemes: ['http'],
      consumes: ['application/json'],
      produces: ['application/json'],
      securityDefinitions: {
        bearerAuth: {
          type: 'apiKey',
          name: 'Authorization',
          in: 'header'
        }
      },
      security: [{ bearerAuth: [] }], // Apply security globally
      tags: [
        { name: 'auth', description: 'Authentication endpoints' },
        { name: 'personnels', description: 'Personnel management operations' },
        { name: 'groups', description: 'Group management operations' },
        { name: 'plan-types', description: 'Plan types management operations' },
        { name: 'utility', description: 'Utility endpoints' },
        { name: 'organizations', description: 'Organizations endpoints' },
        { name: 'mandatory-talenta', description: 'Mandatory talenta management operations' },

      ]
    }
  })

  // Konfigurasi Swagger UI yang lebih sederhana
  await app.register(swaggerUI, {
    routePrefix: '/docs',
    uiConfig: {
      persistAuthorization: true,
      tryItOutEnabled: true,
      displayRequestDuration: true,
      filter: true,
      withCredentials: true,
      docExpansion: 'list',
      defaultModelRendering: 'model',
      showCommonExtensions: true,
      showExtensions: true,
      // Penyesuaian untuk token
      onComplete: function() {
        // Token akan disimpan di localStorage saat halaman dimuat
        console.log("Swagger UI loaded");
      }
    },
    initOAuth: {
      clientId: "swagger-ui",
      usePkceWithAuthorizationCodeGrant: false,
      useBasicAuthenticationWithAccessCodeGrant: false
    }
  })

  // Add cache control headers for Swagger UI
  app.addHook('preHandler', (req, res, done) => {
    if (req.url.startsWith('/docs')) {
      res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.header('Pragma', 'no-cache');
      res.header('Expires', '0');
    }
    done();
  })

  // Register other plugins
  await app.register(cors, {
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
  
  // Register Prisma client
  await app.register(prismaPlugin)
  
  // Register custom auth middleware
  await app.register(authMiddleware)
  
  // Register permission middleware
  await app.register(permissionMiddleware)
  
  // Register activity logger middleware after auth middleware
  await app.register(activityLoggerMiddleware)
  
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
  app.get('/health', {
    schema: {
      tags: ['utility'],
      description: 'Memeriksa status API',
      security: [{ bearerAuth: [] }] // Tambahkan ini
    }
  }, async () => {
    return { status: 'ok', timestamp: new Date() }
  })
  
  app.get('/test', {
    schema: {
      tags: ['utility'],
      description: 'Endpoint pengujian',
      security: [{ bearerAuth: [] }] // Tambahkan ini
    }
  }, async () => {
    return { message: 'Test route working!' }
  })

  // Tambahkan endpoint untuk verifikasi token
  app.get('/debug/user', {
    preHandler: [app.authenticate],
    schema: {
      tags: ['utility'],
      security: [{ bearerAuth: [] }],
      description: 'Cek status autentikasi dan token',
      response: {
        200: {
          type: 'object',
          properties: {
            user: { type: 'object' },
            permissions: { type: 'object' },
            isSuperuser: { type: 'boolean' }
          }
        }
      }
    }
  }, async (request, reply) => {
    return {
      user: request.user,
      permissions: request.permissions,
      isSuperuser: request.user?.is_superuser === true
    };
  });

   // 🔸 Register route utama
  await app.register(routes)

  await app.register(mandatoryTalentaRoutes, { prefix: '/mandatory-talenta' })

  await app.register(accessProjectRoutes, { prefix: '/access-project-type' })

  await app.register(overviewDivisionRoutes, { prefix: '/overview-division' })

  await app.register(statusRealisasiRoutes, { prefix: '/status-realisasi' })

  await app.register(programRoutes, { prefix: '/program' })

  await app.register(planProjectRoutes, { prefix: '/project' })

    await app.register(assignProjectRoutes, { prefix: '/assign-project' })
  
  return app
}
