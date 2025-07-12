import { FastifyPluginAsync } from 'fastify'
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import { PermissionController } from '../controllers/permission.controller'
import { Resource, Permission } from '@prisma/client'

const permissionRoutes: FastifyPluginAsync = async (fastify) => {
  const server = fastify.withTypeProvider<TypeBoxTypeProvider>()
  const permissionController = new PermissionController(fastify)

  // Perbaikan urutan middleware hooks
  server.addHook('onRequest', fastify.authenticate)
  
  
  server.get('/', {
      // Modifikasi hook untuk membiarkan superuser lewat
      preHandler: async (request, reply) => {
        // Superuser bypass checks
        if (request.user && request.user.is_superuser === true) {
          fastify.log.info(`Superuser ${request.user.npp} accessing permission list, bypassing permission check`);
          return;
        }
        
        // Regular users go through permission check
        await new Promise<void>((resolve, reject) => {
          fastify.checkPermission(Resource.PERMISSION, Permission.CAN_READ_PERMISSION)(request, reply, (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      },
      schema: {
        tags: ['permissions'],
        description: 'Mendapatkan daftar semua permissions',
        security: [{ bearerAuth: [] }],
      response: {
        200: Type.Object({
          permissions: Type.Array(Type.String())
        })
      }
    }
  }, permissionController.getPermissionAndApps.bind(permissionController))
}

export default permissionRoutes
