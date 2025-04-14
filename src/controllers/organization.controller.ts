import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { BaseController } from './base.controller'
import { Prisma } from '@prisma/client'

interface GetOrganzationQuery {
  page?: number
  limit?: number
  search?: string
}

export class OrganizationController extends BaseController {
  constructor(fastify: FastifyInstance) {
    super(fastify)
  }

  async getAllGroups(request: FastifyRequest<{ Querystring: GetOrganzationQuery }>, reply: FastifyReply) {
    try {
      const { page = 1, limit = 10, search } = request.query
      const skip = (page - 1) * limit

      const where = search
        ? {
            name: { contains: search, mode: Prisma.QueryMode.insensitive }
          }
        : {}

      const units = await this.prisma.units.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' }
      })

      const totalCount = await this.prisma.units.count({ where })

      return this.sendResponse(reply, {
        data: units,
        meta: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit)
        }
      })
    } catch (error) {
      return this.handleError(error, reply, 'Failed to retrieve units')
    }
  }
}