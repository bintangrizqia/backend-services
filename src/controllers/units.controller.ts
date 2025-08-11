import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { BaseController } from './base.controller'

interface GetUnitsQuery {
  active?: boolean
}

export class UnitsController extends BaseController {
  constructor(fastify: FastifyInstance) {
    super(fastify)
  }

  async getUnits(
    request: FastifyRequest<{ Querystring: GetUnitsQuery }>,
    reply: FastifyReply
  ) {
    try {
      const { active } = request.query

      const whereClause: any = {}
      if (typeof active !== 'undefined') {
        whereClause.active = active
      }

      const units = await this.prisma.units.findMany({
        where: whereClause,
        select: {
          id: true,
          name: true
        },
        orderBy: {
          name: 'asc'
        }
      })

      return this.sendResponse(reply, units)
    } catch (error) {
      return this.handleError(error, reply, 'Failed to fetch units')
    }
  }
}
