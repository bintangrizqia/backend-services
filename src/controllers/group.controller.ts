import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { BaseController } from './base.controller'
import { Prisma, Permission, Resource } from '@prisma/client'

interface PermissionItem {
  resource: Resource
  permission: Permission
}

interface CreateGroupRequest {
  name: string
  permissions?: PermissionItem[]
}

interface UpdateGroupRequest {
  name?: string
  permissions?: PermissionItem[]
}

interface GetGroupParams {
  id: string
}

interface GetGroupQuery {
  page?: number
  limit?: number
  search?: string
}

export class GroupController extends BaseController {
  constructor(fastify: FastifyInstance) {
    super(fastify)
  }

  async getAllGroups(request: FastifyRequest<{ Querystring: GetGroupQuery }>, reply: FastifyReply) {
    try {
      const { page = 1, limit = 10, search } = request.query
      const skip = (page - 1) * limit

      const where = search
        ? {
            name: { contains: search, mode: Prisma.QueryMode.insensitive }
          }
        : {}

      const groups = await this.prisma.groups.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' }
      })

      const totalCount = await this.prisma.groups.count({ where })

      return this.sendResponse(reply, {
        data: groups,
        meta: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit)
        }
      })
    } catch (error) {
      return this.handleError(error, reply, 'Failed to retrieve groups')
    }
  }

  async getGroupById(request: FastifyRequest<{ Params: GetGroupParams }>, reply: FastifyReply) {
    try {
      const { id } = request.params

      const group = await this.prisma.groups.findUnique({
        where: { id },
        include: {
          GroupPermissions: {
            select: {
              resource: true,
              permission: true
            }
          }
        }
      })

      if (!group) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'Group not found'
        })
      }

      return this.sendResponse(reply, group)
    } catch (error) {
      return this.handleError(error, reply, 'Failed to retrieve group')
    }
  }

  async createGroup(request: FastifyRequest<{ Body: CreateGroupRequest }>, reply: FastifyReply) {
    try {
      const { name, permissions = [] } = request.body

      const existingGroup = await this.prisma.groups.findUnique({
        where: { name }
      })

      if (existingGroup) {
        return reply.status(409).send({
          error: 'Conflict',
          message: 'Group with this name already exists'
        })
      }

      // Create the group and permissions in a transaction
      const result = await this.prisma.$transaction(async (tx) => {
        // Create the group
        const newGroup = await tx.groups.create({
          data: { name }
        })
        
        // Add permissions if they exist
        if (permissions.length > 0) {
          const permissionsData = permissions.map(p => ({
            group_id: newGroup.id,
            resource: p.resource,
            permission: p.permission
          }))
          
          await tx.groupPermissions.createMany({
            data: permissionsData
          })
        }
        
        // Return the created group with permissions
        return tx.groups.findUnique({
          where: { id: newGroup.id },
          include: { GroupPermissions: true }
        })
      })

      return this.sendResponse(reply, result, 201)
    } catch (error) {
      return this.handleError(error, reply, 'Failed to create group')
    }
  }

  async updateGroup(
    request: FastifyRequest<{ Params: GetGroupParams; Body: UpdateGroupRequest }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params
      const { name, permissions } = request.body

      const group = await this.prisma.groups.findUnique({
        where: { id }
      })

      if (!group) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'Group not found'
        })
      }

      if (name && name !== group.name) {
        const existingGroup = await this.prisma.groups.findUnique({
          where: { name }
        })

        if (existingGroup) {
          return reply.status(409).send({
            error: 'Conflict',
            message: 'Group name already in use'
          })
        }
      }

      // Update the group and permissions in a transaction
      const result = await this.prisma.$transaction(async (tx) => {
        // Update the group name if provided
        const updatedGroup = await tx.groups.update({
          where: { id },
          data: { name: name || group.name }
        })
        
        // Update permissions if provided
        if (permissions !== undefined) {
          // Delete existing permissions
          await tx.groupPermissions.deleteMany({
            where: { group_id: id }
          })
          
          // Add new permissions if any exist
          if (permissions.length > 0) {
            const permissionsData = permissions.map(p => ({
              group_id: id,
              resource: p.resource,
              permission: p.permission
            }))
            
            await tx.groupPermissions.createMany({
              data: permissionsData
            })
          }
        }
        
        // Return updated group with permissions
        return tx.groups.findUnique({
          where: { id },
          include: { GroupPermissions: true }
        })
      })

      return this.sendResponse(reply, result)
    } catch (error) {
      return this.handleError(error, reply, 'Failed to update group')
    }
  }

  async deleteGroup(request: FastifyRequest<{ Params: GetGroupParams }>, reply: FastifyReply) {
    try {
      const { id } = request.params

      const group = await this.prisma.groups.findUnique({
        where: { id }
      })

      if (!group) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'Group not found'
        })
      }

      await this.prisma.groups.delete({
        where: { id }
      })

      return reply.status(204).send()
    } catch (error) {
      return this.handleError(error, reply, 'Failed to delete group')
    }
  }
}
