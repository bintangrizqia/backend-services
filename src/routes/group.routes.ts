import { FastifyPluginAsync } from 'fastify'
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import { GroupController } from '../controllers/group.controller'
import { GroupPermissionController } from '../controllers/group-permission.controller'

const groupRoutes: FastifyPluginAsync = async (fastify) => {
  const server = fastify.withTypeProvider<TypeBoxTypeProvider>()
  const groupController = new GroupController(fastify)
  const groupPermissionController = new GroupPermissionController(fastify)

  server.addHook('preHandler', fastify.authenticate)
  
  server.get('/', {
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

  server.get('/:id', {
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
              resource: Type.Enum({ USER: 'USER', PROJECT: 'PROJECT', GROUP: 'GROUP' }),
              permission: Type.Enum({ CAN_READ_GROUP: 'CAN_READ_GROUP', CAN_DELETE_GROUP: 'CAN_DELETE_GROUP', CAN_UPDATE_GROUP: 'CAN_UPDATE_GROUP', CAN_CREATE_GROUP: 'CAN_CREATE_GROUP' }),
              created_at: Type.String()
            })
          )
        })
      },
      security: [{ bearerAuth: [] }]
    }
  }, groupController.getGroupById.bind(groupController))

  server.post('/', {
    schema: {
      tags: ['groups'],
      body: Type.Object({
        name: Type.String(),
        permissions: Type.Optional(Type.Array(
          Type.Object({
            resource: Type.Enum({ USER: 'USER', PROJECT: 'PROJECT', GROUP: 'GROUP' }),
            permission: Type.Enum({ CAN_READ_GROUP: 'CAN_READ_GROUP', CAN_DELETE_GROUP: 'CAN_DELETE_GROUP', CAN_UPDATE_GROUP: 'CAN_UPDATE_GROUP', CAN_CREATE_GROUP: 'CAN_CREATE_GROUP' }),
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
              resource: Type.Enum({ USER: 'USER', PROJECT: 'PROJECT', GROUP: 'GROUP' }),
              permission: Type.Enum({ CAN_READ_GROUP: 'CAN_READ_GROUP', CAN_DELETE_GROUP: 'CAN_DELETE_GROUP', CAN_UPDATE_GROUP: 'CAN_UPDATE_GROUP', CAN_CREATE_GROUP: 'CAN_CREATE_GROUP' }),
            })
          )
        })
      },
      security: [{ bearerAuth: [] }]
    }
  }, groupController.createGroup.bind(groupController))

  server.put('/:id', {
    schema: {
      tags: ['groups'],
      params: Type.Object({
        id: Type.String()
      }),
      body: Type.Object({
        name: Type.Optional(Type.String()),
        permissions: Type.Optional(Type.Array(
          Type.Object({
            resource: Type.Enum({ USER: 'USER', PROJECT: 'PROJECT', GROUP: 'GROUP' }),
            permission: Type.Enum({ CAN_READ_GROUP: 'CAN_READ_GROUP', CAN_DELETE_GROUP: 'CAN_DELETE_GROUP', CAN_UPDATE_GROUP: 'CAN_UPDATE_GROUP', CAN_CREATE_GROUP: 'CAN_CREATE_GROUP' }),
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
              resource: Type.Enum({ USER: 'USER', PROJECT: 'PROJECT', GROUP: 'GROUP' }),
              permission: Type.Enum({ CAN_READ_GROUP: 'CAN_READ_GROUP', CAN_DELETE_GROUP: 'CAN_DELETE_GROUP', CAN_UPDATE_GROUP: 'CAN_UPDATE_GROUP', CAN_CREATE_GROUP: 'CAN_CREATE_GROUP' }),
              created_at: Type.String()
            })
          )
        })
      },
      security: [{ bearerAuth: [] }]
    }
  }, groupController.updateGroup.bind(groupController))

  server.delete('/:id', {
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

  server.get('/:groupId/permissions', {
    schema: {
      tags: ['groups'],
      params: Type.Object({
        groupId: Type.String()
      }),
      response: {
        200: Type.Array(
          Type.Object({
            id: Type.String(),
            group_id: Type.String(),
            resource: Type.Enum({ USER: 'USER', PROJECT: 'PROJECT', GROUP: 'GROUP' }),
            permission: Type.Enum({ CAN_READ_GROUP: 'CAN_READ_GROUP', CAN_DELETE_GROUP: 'CAN_DELETE_GROUP', CAN_UPDATE_GROUP: 'CAN_UPDATE_GROUP', CAN_CREATE_GROUP: 'CAN_CREATE_GROUP' }),
            created_at: Type.String()
          })
        )
      },
      security: [{ bearerAuth: [] }]
    }
  }, groupPermissionController.getGroupPermissions.bind(groupPermissionController))

  server.post('/:groupId/permissions', {
    schema: {
      tags: ['groups'],
      params: Type.Object({
        groupId: Type.String()
      }),
      body: Type.Object({
        resource: Type.Enum({ USER: 'USER', PROJECT: 'PROJECT', GROUP: 'GROUP' }),
        permission: Type.Enum({ CAN_READ_GROUP: 'CAN_READ_GROUP', CAN_DELETE_GROUP: 'CAN_DELETE_GROUP', CAN_UPDATE_GROUP: 'CAN_UPDATE_GROUP', CAN_CREATE_GROUP: 'CAN_CREATE_GROUP' }),
      }),
      response: {
        201: Type.Object({
          id: Type.String(),
          group_id: Type.String(),
          resource: Type.Enum({ USER: 'USER', PROJECT: 'PROJECT', GROUP: 'GROUP' }),
          permission: Type.Enum({ CAN_READ_GROUP: 'CAN_READ_GROUP', CAN_DELETE_GROUP: 'CAN_DELETE_GROUP', CAN_UPDATE_GROUP: 'CAN_UPDATE_GROUP', CAN_CREATE_GROUP: 'CAN_CREATE_GROUP' }),
          created_at: Type.String()
        })
      },
      security: [{ bearerAuth: [] }]
    }
  }, groupPermissionController.addGroupPermission.bind(groupPermissionController))

  server.delete('/:groupId/permissions/:permissionId', {
    schema: {
      tags: ['groups'],
      params: Type.Object({
        groupId: Type.String(),
        permissionId: Type.String()
      }),
      response: {
        204: Type.Null()
      },
      security: [{ bearerAuth: [] }]
    }
  }, groupPermissionController.deleteGroupPermission.bind(groupPermissionController))



  server.post('/assigns/:group_id/personnels', {
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
