import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { BaseController } from './base.controller'
import { Permission, Resource } from '@prisma/client'

interface GroupPermissionParams {
  groupId: string
}

interface CreateGroupPermissionRequest {
  resource: Resource
  permission: Permission
}

interface DeleteGroupPermissionParams {
  groupId: string
  permissionId: string
}

export class GroupPermissionController extends BaseController {
  constructor(fastify: FastifyInstance) {
    super(fastify)
  }

  async getGroupPermissions(request: FastifyRequest<{ Params: GroupPermissionParams }>, reply: FastifyReply) {
    try {
      const { groupId } = request.params

      const group = await this.prisma.groups.findUnique({
        where: { id: groupId }
      })

      if (!group) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'Group not found'
        })
      }

      const permissions = await this.prisma.groupPermissions.findMany({
        where: { group_id: groupId }
      })

      return this.sendResponse(reply, permissions)
    } catch (error) {
      return this.handleError(error, reply, 'Failed to retrieve group permissions')
    }
  }

  async addGroupPermission(
    request: FastifyRequest<{ Params: GroupPermissionParams; Body: CreateGroupPermissionRequest }>,
    reply: FastifyReply
  ) {
    try {
      const { groupId } = request.params
      const { resource, permission } = request.body

      const group = await this.prisma.groups.findUnique({
        where: { id: groupId }
      })

      if (!group) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'Group not found'
        })
      }

      const existingPermission = await this.prisma.groupPermissions.findFirst({
        where: {
          group_id: groupId,
          resource,
          permission
        }
      })

      if (existingPermission) {
        return reply.status(409).send({
          error: 'Conflict',
          message: 'This permission is already assigned to the group'
        })
      }

      const newPermission = await this.prisma.groupPermissions.create({
        data: {
          group_id: groupId,
          resource,
          permission
        }
      })

      return this.sendResponse(reply, newPermission, 201)
    } catch (error) {
      return this.handleError(error, reply, 'Failed to add group permission')
    }
  }

  async deleteGroupPermission(request: FastifyRequest<{ Params: DeleteGroupPermissionParams }>, reply: FastifyReply) {
    try {
      const { groupId, permissionId } = request.params

      const permission = await this.prisma.groupPermissions.findFirst({
        where: {
          id: permissionId,
          group_id: groupId
        }
      })

      if (!permission) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'Permission not found for this group'
        })
      }

      await this.prisma.groupPermissions.delete({
        where: { id: permissionId }
      })

      return reply.status(204).send()
    } catch (error) {
      return this.handleError(error, reply, 'Failed to delete group permission')
    }
  }
}
