import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { BaseController } from './base.controller'

interface GetPositionsQuery {
  active?: boolean
}

export class PositionsController extends BaseController {
  constructor(fastify: FastifyInstance) {
    super(fastify)
  }

  async getPositions(
    request: FastifyRequest<{ Querystring: GetPositionsQuery }>,
    reply: FastifyReply
  ) {
    try {
      const { active } = request.query

      const whereClause: any = {}
      if (typeof active !== 'undefined') {
        whereClause.active = active
      }

      const positions = await this.prisma.positions.findMany({
        where: whereClause,
        select: {
          id: true,
          name: true
        },
        orderBy: {
          name: 'asc'
        }
      })

      return this.sendResponse(reply, positions)
    } catch (error) {
      return this.handleError(error, reply, 'Failed to fetch positions')
    }
  }
}
