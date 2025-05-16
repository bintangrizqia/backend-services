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


interface AssignGroupToPersonnelBody {
  personnels: string[]
}

interface AssignGroupToPersonnelParams {
  group_id: string
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
        select: {
          id: true,
          name: true,
          GroupPermissions: {
            select: {
              id: true,
              resource: true,
              permission: true
            }
          },
          PersonnelGroups: {
            select: {
              personnel: {
                select: {
                  npp: true,
                  name: true,
                  is_superuser: true,
                  created_at: true
                }
              }
            }
          },
          created_at: true
        },
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
        select: {
          id: true,
          name: true,
          GroupPermissions: {
            select: {
              id: true,
              resource: true,
              permission: true
            }
          },
          PersonnelGroups: {
            select: {
              id: true,
              personnel: {
                select: {
                  npp: true,
                  name: true,
                  is_superuser: true,
                  created_at: true
                }
              }
            }
          },
          created_at: true
        },
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

      return reply.status(204).send({
        message: 'Group deleted successfully.'
      })
    } catch (error) {
      return this.handleError(error, reply, 'Failed to delete group')
    }
  }

  async assignGroupToPersonnel(request: FastifyRequest<{ Params: AssignGroupToPersonnelParams, Body: AssignGroupToPersonnelBody }>, reply: FastifyReply) {
    try {
      const {personnels} = request.body
      const {group_id} = request.params
      const groups_personnels: object[] = []


      /**
       * Delete all personnel in the same group first.
       */
      await this.prisma.personnelGroups.deleteMany({
          where: {group_id: group_id}
      })

      personnels.map(async (npp: string) => {
        const personnel = await this.prisma.personnels.findUniqueOrThrow({
          where: {npp}
        }).catch((e: any) => {
          return reply.status(500).send({
            message: `Cannot find personnel with npp ${npp}`
          })
        })

        const group = await this.prisma.groups.findUniqueOrThrow({
          where: {id: group_id}
        }).catch((e : any) => {
          return reply.status(500).send({
            message: `Cannot find group with id ${group_id}`
          })
        })

        /**
         * After delete all, let initialize again
         */

        const personnel_groups = await this.prisma.personnelGroups.create({
          data: {
            group_id: group.id,
            personnel_id: personnel.id,
          },
          select: {
            personnel: {
              select: {
                id: true,
                npp: true,
                name: true,
                position: {
                  select: {
                    id: true,
                    name: true
                  }
                },
                unit: {
                  select: {
                    id: true,
                    name: true,
                    parent: {
                      select: {
                        id: true,
                        name: true
                      }
                    }
                  }
                },
                eselon: true,
                is_superuser: true,
                updated_at: true
              }
            }
          }
        }).catch((e : any) => {
          return reply.status(500).send({
            message: `Failed to insert npp ${personnel.npp} to group ${group.name}`
          })
        })

        groups_personnels.push(personnel_groups)
      })

      return this.sendResponse(reply, groups_personnels)
       
    } catch (error) {
      return this.handleError(error, reply, 'Failed to assign personnel')
      
    }
  }
}
