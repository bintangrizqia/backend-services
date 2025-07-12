// src/modules/overview-division/overviewDivision.controller.ts

import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { BaseController } from './base.controller'
import { Prisma } from '@prisma/client'

interface GetOverviewDivisionQuery {
  page?: number
  limit?: number
  search?: string
  personnel_id?: string
}

export class OverviewDivisionController extends BaseController {
  constructor(fastify: FastifyInstance) {
    super(fastify)
  }

  async getAllOverviewDivision(
    request: FastifyRequest<{ Querystring: GetOverviewDivisionQuery }>,
    reply: FastifyReply
  ) {
    try {
      const { page = 1, limit = 10, search, personnel_id } = request.query
      const skip = (page - 1) * limit

      const where: Prisma.OverviewDivisionWhereInput = {
        ...(personnel_id && { personnel_id }),
        ...(search && {
          OR: [
            { information: { contains: search, mode: 'insensitive' } },
            { explanation: { contains: search, mode: 'insensitive' } },
            { program: { name: { contains: search, mode: 'insensitive' } } },
            { project: { name: { contains: search, mode: 'insensitive' } } },
          ],
        }),
      }

      const data = await this.prisma.overviewDivision.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          due_date: true,
          information: true,
          explanation: true,
          created_at: true,
          updated_at: true,
          program: {
            select: {
              id: true,
              name: true,
              description: true,
              status: true,
              year: true,
            },
          },
          project: {
            select: {
              id: true,
              name: true,
              target: true,
              unit: true,
              project_status: true,
              note: true,
              year: true,
            },
          },
          transaction: {
            select: {
              id: true,
              realization: true,
              note: true,
              realization_self_percentage: true,
              realization_boss_who_create_an_activity_percentage: true,
              due_date: true,
            },
          },
        },
      })

      const totalCount = await this.prisma.overviewDivision.count({ where })

      return this.sendResponse(reply, {
        data,
        meta: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
      })
    } catch (error) {
      return this.handleError(error, reply, 'Failed to retrieve overview division data')
    }
  }
}
