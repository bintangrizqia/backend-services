import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { BaseController } from './base.controller'
import { Permission, Resource } from '@prisma/client'

interface GroupPermissionParams {
  group_id: string
}

interface CreateGroupPermissionRequest {
  resource: Resource
  permission: Permission[]
}

interface DeleteGroupPermissionParams {
  group_id: string
  permission_id: string
}

export class GroupPermissionController extends BaseController {
  constructor(fastify: FastifyInstance) {
    super(fastify)
  }

  async getGroupPermissions(request: FastifyRequest<{ Params: GroupPermissionParams }>, reply: FastifyReply) {
    try {
      const { group_id } = request.params

      const group = await this.prisma.groups.findUnique({
        where: { id: group_id }
      })

      if (!group) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'Group not found'
        })
      }

      const permissions = await this.prisma.groupPermissions.findMany({
        where: { group_id: group_id }
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
      const { group_id } = request.params
      const { resource, permission } = request.body
      const permissions : object[] = []

      const group = await this.prisma.groups.findUnique({
        where: { id: group_id }
      })

      if (!group) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'Group not found'
        })
      }

      permission.map(async (permission : Permission) => {
        const existingPermission = await this.prisma.groupPermissions.findFirst({
          where: {
            group_id: group_id,
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
            group_id: group_id,
            resource,
            permission
          },
          select: {
            id: true,
            resource: true,
            permission: true,
            created_at: true
          }
        })
        permissions.push(newPermission)
        
      })

      return this.sendResponse(reply, permissions, 201)
    } catch (error) {
      return this.handleError(error, reply, 'Failed to add group permission')
    }
  }

  async deleteGroupPermission(request: FastifyRequest<{ Params: DeleteGroupPermissionParams }>, reply: FastifyReply) {
    try {
      const { group_id, permission_id } = request.params

      const permission = await this.prisma.groupPermissions.findFirst({
        where: {
          id: permission_id,
          group_id: group_id
        }
      })

      if (!permission) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'Permission not found for this group'
        })
      }

      await this.prisma.groupPermissions.delete({
        where: { id: permission_id }
      })

      return reply.status(204).send()
    } catch (error) {
      return this.handleError(error, reply, 'Failed to delete group permission')
    }
  }
}
