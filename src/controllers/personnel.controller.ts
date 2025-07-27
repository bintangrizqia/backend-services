import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { BaseController } from './base.controller'
import { Prisma } from '@prisma/client'


interface GetPersonnelParams {
  npp: string
}

interface GetPersonnelQuery {
  page?: number
  limit?: number
  search?: string
}

export class PersonnelController extends BaseController {
  constructor(fastify: FastifyInstance) {
    super(fastify)
  }

  /**
   * Get all personnel with pagination and search
   */
  async getAllPersonnel(request: FastifyRequest<{ Querystring: GetPersonnelQuery }>, reply: FastifyReply) {
    try {
      const { page = 1, limit = 10, search } = request.query
      const skip = (page - 1) * limit

      const where = search
        ? {
            OR: [
              { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
              { npp: { contains: search, mode: Prisma.QueryMode.insensitive } },
              { email: { contains: search, mode: Prisma.QueryMode.insensitive } }
            ]
          }
        : {}

      // Get personnel with pagination
      const personnel = await this.prisma.personnels.findMany({
        where,
        skip,
        take: limit,
        select: {
          npp: true,
          name: true,
          email: true,
          unit: {
            select: {
              id: true,
              name: true,
              position_type: true,
              created_at: true
            },
          },
          position: {
            select: {
              id: true,
              name: true,
              type_position: {
                select: {
                  id: true,
                  name_f: true,
                  name_s: true,
                  eselon: true,
                  level_type_position: true,
                  description: true,
                  created_at: true
                }
              }
            }
          },
          photo: true,
          created_at: true,
          updated_at: true,
        }
      })

      // Get total count for pagination
      const totalCount = await this.prisma.personnels.count({ where })

      return this.sendResponse(reply, {
        data: personnel,
        meta: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit)
        }
      })
    } catch (error) {
      return this.handleError(error, reply, 'Failed to retrieve personnel')
    }
  }

  /**
   * Get personnel by ID
   */
  async getPersonnelById(request: FastifyRequest<{ Params: GetPersonnelParams }>, reply: FastifyReply) {
    try {
      const { npp } = request.params

      const personnel = await this.prisma.personnels.findUnique({
        where: { npp },
        select: {
          npp: true,
          name: true,
          email: true,
          unit: {
            select: {
              id: true,
              name: true,
              position_type: true,
              created_at: true
            },
          },
          position: {
            select: {
              id: true,
              name: true,
              type_position: {
                select: {
                  id: true,
                  name_f: true,
                  name_s: true,
                  eselon: true,
                  level_type_position: true,
                  description: true,
                  created_at: true
                }
              }
            }
          },
          photo: true,
          created_at: true,
          updated_at: true,
        }
      })

      if (!personnel) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'Personnel not found'
        })
      }

      return this.sendResponse(reply, personnel)
    } catch (error) {
      return this.handleError(error, reply, 'Failed to retrieve personnel')
    }
  }

  /**
 * Get list of personnel (npp and name only)
 * with optional filter by eselon via query (e.g. ?eselon=1 or ?eselon=1,2)
 */
async getPersonnelOptions(
  request: FastifyRequest<{ Querystring: { eselon?: string } }>,
  reply: FastifyReply
) {
  try {
    const eselonParam = request.query?.eselon // ambil dari query params
    const eselonFilter = eselonParam
      ? (Array.isArray(eselonParam)
          ? eselonParam.map(Number)
          : eselonParam.split(',').map(Number))
      : undefined

    const personnels = await this.prisma.personnels.findMany({
      where: eselonFilter
        ? { eselon: { in: eselonFilter } }
        : undefined, // tanpa filter jika tidak ada param
      select: {
        npp: true,
        name: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    return this.sendResponse(reply, { data: personnels })
  } catch (error) {
    return this.handleError(error, reply, 'Failed to retrieve personnel options')
  }
}

}