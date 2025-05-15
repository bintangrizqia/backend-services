import { FastifyPluginAsync } from 'fastify'
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import { OrganizationController } from '../controllers/organization.controller'
import { Resource, Permission } from '@prisma/client'

const organizationRoutes: FastifyPluginAsync = async (fastify) => {
  const server = fastify.withTypeProvider<TypeBoxTypeProvider>()
  const organizationController = new OrganizationController(fastify)

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
      preHandler: async (request, reply) => {
        // Superuser bypass checks
        if (request.user && request.user.is_superuser === true) {
          fastify.log.info(`Superuser ${request.user.npp} accessing organization lists, bypassing permission check`);
          return;
        }
        
        // Regular users go through permission check
        await new Promise<void>((resolve, reject) => {
          fastify.checkPermission(Resource.ORGANIZATION, Permission.CAN_READ_ORGANIZATION)(request, reply, (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      },
      schema: {
        tags: ['organizations'],
        description: 'Mendapatkan daftar semua organizations',
        security: [{ bearerAuth: [] }],
        querystring: Type.Object({
          page: Type.Optional(Type.Number({ minimum: 1 })),
          limit: Type.Optional(Type.Number({ minimum: 1, maximum: 100 })),
          search: Type.Optional(Type.String())
        }),
      response: {
        200: Type.Object({
          data: Type.Array(Type.Any()),
          meta: Type.Object({
            page: Type.Number(),
            limit: Type.Number(),
            totalCount: Type.Number(),
            totalPages: Type.Number()
          })
        })
      }
    }
  }, organizationController.getAllOrganizations.bind(organizationController))

  // Get personnel by ID
  interface GetOrganizationParams {
    id: number;
  }

  server.get<{
    Params: GetOrganizationParams
  }>('/:id', {
    preHandler: fastify.checkPermission(Resource.ORGANIZATION, Permission.CAN_READ_ORGANIZATION),
    schema: {
      tags: ['organizations'],
      description: 'Mendapatkan personel berdasarkan ID',
      security: [{ bearerAuth: [] }],
      params: Type.Object({
        id: Type.Number()
      }),
      response: {
        200: Type.Any()
      },
    }
  }, organizationController.getOrganizationById.bind(organizationController))
}
export default organizationRoutes
