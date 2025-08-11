import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { BaseController } from './base.controller'
import { Prisma } from '@prisma/client'
import bcrypt from 'bcrypt';

interface GetPersonnelParams {
  npp: string
}

interface GetPersonnelQuery {
  page?: number
  limit?: number
  search?: string
}

// Disesuaikan dengan schema Prisma
export interface CreatePersonnelBody {
  npp: string;
  name: string;
  email?: string;
  unit_id: number;         // number karena biasanya id di DB integer
  position_id: number;
  eselon?: number;         // ditambahkan biar nggak error ts2339
  photo?: string;
}

export interface UpdatePersonnelBody {
  name?: string;
  email?: string;
  unit_id?: number;
  position_id?: number;
  eselon?: number;         // ditambahkan biar aman saat update
  photo?: string;
}

export class PersonnelController extends BaseController {
  constructor(fastify: FastifyInstance) {
    super(fastify)
  }

  /**
 * Create new personnel
 */
async createPersonnel(
  request: FastifyRequest<{ Body: CreatePersonnelBody }>,
  reply: FastifyReply
) {
  try {
    const { npp, name, unit_id, position_id, eselon, photo, email } = request.body;

    // Hash default password "initial01!"
    const hashedPassword = await bcrypt.hash("initial01!", 10);

    const personnel = await this.prisma.personnels.create({
      data: {
        npp,
        name,
        unit_id: Number(unit_id),
        position_id: Number(position_id),
        eselon: eselon ?? null,
        email: email ?? null,
        photo: photo ?? null,
        password: hashedPassword,
        active: true,
        is_superuser: false
      }
    });

    return this.sendResponse(reply, personnel, 201);
  } catch (error) {
    return this.handleError(error, reply, 'Failed to create personnel');
  }
}


  /**
   * Get all personnel with pagination and search
   */
  async getAllPersonnel(
    request: FastifyRequest<{ Querystring: GetPersonnelQuery }>,
    reply: FastifyReply
  ) {
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
   * Get personnel by NPP
   */
  async getPersonnelById(
    request: FastifyRequest<{ Params: GetPersonnelParams }>,
    reply: FastifyReply
  ) {
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
   * Update personnel by NPP
   */
  async updatePersonnel(
    request: FastifyRequest<{ Params: GetPersonnelParams; Body: UpdatePersonnelBody }>,
    reply: FastifyReply
  ) {
    try {
      const { npp } = request.params
      const data = request.body

      const existing = await this.prisma.personnels.findUnique({ where: { npp } })
      if (!existing) {
        return reply.status(404).send({ error: 'Not Found', message: 'Personnel not found' })
      }

      const updated = await this.prisma.personnels.update({
        where: { npp },
        data
      })

      return this.sendResponse(reply, updated)
    } catch (error) {
      return this.handleError(error, reply, 'Failed to update personnel')
    }
  }

  /**
   * Delete personnel by NPP
   */
  async deletePersonnel(
    request: FastifyRequest<{ Params: GetPersonnelParams }>,
    reply: FastifyReply
  ) {
    try {
      const { npp } = request.params

      const existing = await this.prisma.personnels.findUnique({ where: { npp } })
      if (!existing) {
        return reply.status(404).send({ error: 'Not Found', message: 'Personnel not found' })
      }

      await this.prisma.personnels.delete({ where: { npp } })

      return this.sendResponse(reply, { message: 'Personnel deleted successfully' })
    } catch (error) {
      return this.handleError(error, reply, 'Failed to delete personnel')
    }
  }

  /**
   * Get list of personnel options (npp and name only) with optional filter by eselon
   */
  async getPersonnelOptions(
    request: FastifyRequest<{ Querystring: { eselon?: string } }>,
    reply: FastifyReply
  ) {
    try {
      const eselonParam = request.query?.eselon
      const eselonFilter = eselonParam
        ? (Array.isArray(eselonParam)
            ? eselonParam.map(Number)
            : eselonParam.split(',').map(Number))
        : undefined

      const personnels = await this.prisma.personnels.findMany({
        where: eselonFilter
          ? { eselon: { in: eselonFilter } }
          : undefined,
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
