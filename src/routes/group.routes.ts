import { FastifyPluginAsync } from 'fastify'
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import { GroupController } from '../controllers/group.controller'
import { GroupPermissionController } from '../controllers/group-permission.controller'
import {Resource, Permission} from '@prisma/client'

const groupRoutes: FastifyPluginAsync = async (fastify) => {
  const server = fastify.withTypeProvider<TypeBoxTypeProvider>()
  const groupController = new GroupController(fastify)
  const groupPermissionController = new GroupPermissionController(fastify)

  server.addHook('onRequest', fastify.authenticate)
    

  interface GetGroupQuery {
    page?: number;
    limit?: number;
    search?: string;
  }

  server.get<{
    Querystring: GetGroupQuery
  }>('/', {
      // Modifikasi hook untuk membiarkan superuser lewat
      preHandler: async (request, reply) => {
        // Superuser bypass checks
        if (request.user && request.user.is_superuser === true) {
          fastify.log.info(`Superuser ${request.user.npp} accessing group list, bypassing permission check`);
          return;
        }
        
        // Regular users go through permission check
        await new Promise<void>((resolve, reject) => {
          fastify.checkPermission(Resource.GROUP, Permission.CAN_READ_GROUP)(request, reply, (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      },
    schema: {
      tags: ['groups'],
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
              name: Type.String(),
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
  }, groupController.getAllGroups.bind(groupController))

  interface GetGroupParams {
    id: string
  }
  server.get<{
    Params: GetGroupParams
  }>('/:id', {
      // Modifikasi hook untuk membiarkan superuser lewat
      preHandler: async (request, reply) => {
        // Superuser bypass checks
        if (request.user && request.user.is_superuser === true) {
          fastify.log.info(`Superuser ${request.user.npp} accessing group list, bypassing permission check`);
          return;
        }
        
        // Regular users go through permission check
        await new Promise<void>((resolve, reject) => {
          fastify.checkPermission(Resource.GROUP, Permission.CAN_READ_PERSONNEL)(request, reply, (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      },
    schema: {
      tags: ['groups'],
      params: Type.Object({
        id: Type.String()
      }),
      response: {
        200: Type.Object({
          id: Type.String(),
          name: Type.String(),
          created_at: Type.String(),
          updated_at: Type.String(),
          GroupPermissions: Type.Array(
            Type.Object({
              id: Type.String(),
              group_id: Type.String(),
              resource: Type.String(),
              permission: Type.String(),
              created_at: Type.String()
            })
          )
        })
      },
      security: [{ bearerAuth: [] }]
    }
  }, groupController.getGroupById.bind(groupController))


  interface PermissionItem {
    resource: Resource
    permission: Permission
  }

  interface CreateGroupRequest {
    name: string
    permissions?: PermissionItem[]
  }
  
  server.post<{
    Body: CreateGroupRequest
  }>('/', {
      // Modifikasi hook untuk membiarkan superuser lewat
      preHandler: async (request, reply) => {
        // Superuser bypass checks
        if (request.user && request.user.is_superuser === true) {
          fastify.log.info(`Superuser ${request.user.npp} accessing group list, bypassing permission check`);
          return;
        }
        
        // Regular users go through permission check
        await new Promise<void>((resolve, reject) => {
          fastify.checkPermission(Resource.GROUP, [Permission.CAN_CREATE_GROUP, Permission.CAN_READ_GROUP])(request, reply, (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      },
    schema: {
      tags: ['groups'],
      body: Type.Object({
        name: Type.String(),
        permissions: Type.Optional(Type.Array(
          Type.Object({
            resource: Type.String(),
            permission: Type.String()
          })
        ))
      }),
      response: {
        201: Type.Object({
          id: Type.String(),
          name: Type.String(),
          created_at: Type.String(),
          updated_at: Type.String(),
          GroupPermissions: Type.Array(
            Type.Object({
              resource: Type.String(),
              permission: Type.String()
            })
          )
        })
      },
      security: [{ bearerAuth: [] }]
    }
  }, groupController.createGroup.bind(groupController))

  interface PutGroupParams {
    id: string
  }

  interface UpdateGroupRequest {
    name?: string
    permissions?: PermissionItem[]
  }

  server.put<{
    Params: PutGroupParams
    Body: UpdateGroupRequest
  }>('/:id', {
      // Modifikasi hook untuk membiarkan superuser lewat
      preHandler: async (request, reply) => {
        // Superuser bypass checks
        if (request.user && request.user.is_superuser === true) {
          fastify.log.info(`Superuser ${request.user.npp} accessing group edit, bypassing permission check`);
          return;
        }
        
        // Regular users go through permission check
        await new Promise<void>((resolve, reject) => {
          fastify.checkPermission(Resource.GROUP, [Permission.CAN_UPDATE_GROUP, Permission.CAN_READ_GROUP])(request, reply, (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      },
    schema: {
      tags: ['groups'],
      params: Type.Object({
        id: Type.String()
      }),
      body: Type.Object({
        name: Type.Optional(Type.String()),
        permissions: Type.Optional(Type.Array(
          Type.Object({
            resource: Type.String(),
            permission: Type.String()
          })
        ))
      }),
      response: {
        200: Type.Object({
          id: Type.String(),
          name: Type.String(),
          created_at: Type.String(),
          updated_at: Type.String(),
          GroupPermissions: Type.Array(
            Type.Object({
              id: Type.String(),
              group_id: Type.String(),
              resource: Type.String(),
              permission: Type.String(),
              created_at: Type.String()
            })
          )
        })
      },
      security: [{ bearerAuth: [] }]
    }
  }, groupController.updateGroup.bind(groupController))

  server.delete<{
    Params: GetGroupParams
  }>('/:id', {
      // Modifikasi hook untuk membiarkan superuser lewat
      preHandler: async (request, reply) => {
        // Superuser bypass checks
        if (request.user && request.user.is_superuser === true) {
          fastify.log.info(`Superuser ${request.user.npp} accessing group delete, bypassing permission check`);
          return;
        }
        
        // Regular users go through permission check
        await new Promise<void>((resolve, reject) => {
          fastify.checkPermission(Resource.GROUP, [Permission.CAN_READ_GROUP, Permission.CAN_DELETE_GROUP])(request, reply, (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      },
    schema: {
      tags: ['groups'],
      params: Type.Object({
        id: Type.String()
      }),
      response: {
        204: Type.Null()
      },
      security: [{ bearerAuth: [] }]
    }
  }, groupController.deleteGroup.bind(groupController))


  interface GetGroupPermissionParams {
    group_id: string
  }
  server.get<{
    Params: GetGroupPermissionParams
  }>('/:group_id/permissions', {
      // Modifikasi hook untuk membiarkan superuser lewat
      preHandler: async (request, reply) => {
        // Superuser bypass checks
        if (request.user && request.user.is_superuser === true) {
          fastify.log.info(`Superuser ${request.user.npp} accessing group edit, bypassing permission check`);
          return;
        }
        
        // Regular users go through permission check
        await new Promise<void>((resolve, reject) => {
          fastify.checkPermission(Resource.GROUP, [Permission.CAN_READ_GROUP, Permission.CAN_READ_PERMISSION])(request, reply, (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      },
    schema: {
      tags: ['groups'],
      params: Type.Object({
        group_id: Type.String()
      }),
      response: {
        200: Type.Array(
          Type.Object({
            id: Type.String(),
            group_id: Type.String(),
            resource: Type.String(),
            permission: Type.String(),
            created_at: Type.String()
          })
        )
      },
      security: [{ bearerAuth: [] }]
    }
  }, groupPermissionController.getGroupPermissions.bind(groupPermissionController))


  interface CreateGroupPermissionRequest {
    resource: Resource
    permission: Permission[]
  }

  server.put<{
    Params: GetGroupPermissionParams
    Body: CreateGroupPermissionRequest
  }>('/:group_id/permissions', {
      // Modifikasi hook untuk membiarkan superuser lewat
      preHandler: async (request, reply) => {
        // Superuser bypass checks
        if (request.user && request.user.is_superuser === true) {
          fastify.log.info(`Superuser ${request.user.npp} accessing group edit, bypassing permission check`);
          return;
        }
        
        // Regular users go through permission check
        await new Promise<void>((resolve, reject) => {
          fastify.checkPermission(Resource.GROUP, [Permission.CAN_UPDATE_GROUP, Permission.CAN_READ_PERMISSION, Permission.CAN_READ_GROUP])(request, reply, (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      },
    schema: {
      tags: ['groups'],
      params: Type.Object({
        group_id: Type.String()
      }),
      body: Type.Array(
        Type.Object({
          resource: Type.String(),
          permission: Type.String(),
        })
      ),
      response: {
        201: Type.Array(
          Type.Object({
            id: Type.String(),
            group_id: Type.String(),
            resource: Type.String(),
            permission: Type.String(),
            created_at: Type.String()
          })
        )
      },
      security: [{ bearerAuth: [] }]
    }
  }, groupPermissionController.addGroupPermission.bind(groupPermissionController))


  interface DeleteGroupPermissionParams {
    group_id: string
    permission_id: string
  }
  server.delete<{
    Params: DeleteGroupPermissionParams
  }>('/:group_id/permissions/:permission_id', {
      // Modifikasi hook untuk membiarkan superuser lewat
      preHandler: async (request, reply) => {
        // Superuser bypass checks
        if (request.user && request.user.is_superuser === true) {
          fastify.log.info(`Superuser ${request.user.npp} accessing group edit, bypassing permission check`);
          return;
        }
        
        // Regular users go through permission check
        await new Promise<void>((resolve, reject) => {
          fastify.checkPermission(Resource.GROUP, [Permission.CAN_READ_GROUP, Permission.CAN_READ_PERMISSION, Permission.CAN_DELETE_GROUP])(request, reply, (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      },
    schema: {
      tags: ['groups'],
      params: Type.Object({
        group_id: Type.String(),
        permission_id: Type.String()
      }),
      response: {
        204: Type.Null()
      },
      security: [{ bearerAuth: [] }]
    }
  }, groupPermissionController.deleteGroupPermission.bind(groupPermissionController))


  interface GetGroupToPersonnelParams {
    group_id: string
  }
  interface CreateGroupToPersonnelBody {
    personnels: string[]
  }

  server.post<{
    Params: GetGroupToPersonnelParams
    Body: CreateGroupToPersonnelBody
  }>('/assigns/:group_id/personnels', {

      // Modifikasi hook untuk membiarkan superuser lewat
      preHandler: async (request, reply) => {
        // Superuser bypass checks
        if (request.user && request.user.is_superuser === true) {
          fastify.log.info(`Superuser ${request.user.npp} accessing group edit, bypassing permission check`);
          return;
        }
        
        // Regular users go through permission check
        await new Promise<void>((resolve, reject) => {
          fastify.checkPermission(Resource.GROUP, [Permission.CAN_READ_GROUP, Permission.CAN_READ_PERMISSION, Permission.CAN_UPDATE_GROUP])(request, reply, (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      },
    schema: {
      tags: ['groups'],
      params: Type.Object({
        group_id: Type.String()
      }),
      body: Type.Object({
        personnels: Type.Array(Type.String())
      }),
      response: {
        201: Type.Array(Type.Object({
          personnel: Type.Object({
            id: Type.String(),
            npp: Type.String(),
            name: Type.String(),
            position: Type.Object({
              id: Type.String(),
              name: Type.String()
            }),
            unit: Type.Object({
              id: Type.String(),
              name: Type.String(),
              parent: Type.Object({
                id: Type.String(),
                name: Type.String()
              })
            }),
            eselon: Type.String(),
            is_superuser: Type.String(),
            updated_at: Type.String()
          })
        })),
        500: Type.Object({
          message: Type.String()
        }),
        401: Type.Object({
          error: Type.String(),
          message: Type.String()
        })
      },
      security: [ {bearerAuth: [] }]
    }
  }, groupController.assignGroupToPersonnel.bind(groupController))
}

export default groupRoutes
