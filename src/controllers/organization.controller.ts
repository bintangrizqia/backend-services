import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { BaseController } from './base.controller'
import { Prisma } from '@prisma/client'

interface GetOrganizationQuery {
  page?: number
  limit?: number
  search?: string
}

  // Get organizaiton by ID
interface GetOrganizationParams {
  id: number;
}


export class OrganizationController extends BaseController {
  constructor(fastify: FastifyInstance) {
    super(fastify)
  }

  async getAllOrganizations(request: FastifyRequest<{ Querystring: GetOrganizationQuery }>, reply: FastifyReply) {
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

  
    /**
   * Get personnel by ID
   */
    async getOrganizationById(request: FastifyRequest<{ Params: GetOrganizationParams }>, reply: FastifyReply) {
      try {
        const { id } = request.params
  
        const organization = await this.prisma.units.findUnique({
          where: { id },
          select: {
            id: true,
            name: true,
            unit: {
              select: {
                id: true,
                name: true,
                created_at: true,
                updated_at: true
              }
            },
            created_at: true,
            updated_at: true
          }
        })
  
        if (!organization) {
          return reply.status(404).send({
            error: 'Not Found',
            message: 'Organization not found'
          })
        }
  
        return this.sendResponse(reply, organization)
      } catch (error) {
        return this.handleError(error, reply, 'Failed to retrieve personnel')
      }
    }
}


