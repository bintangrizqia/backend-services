import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { BaseController } from './base.controller'
import bcrypt from 'bcrypt'
import { Prisma } from '@prisma/client'

interface CreatePersonnelRequest {
  photo?: string
  npp: string
  name: string
  email?: string
  password: string
}

interface UpdatePersonnelRequest {
  photo?: string
  npp?: string
  name?: string
  email?: string
  password?: string
}

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
          photo: true,
          created_at: true,
          updated_at: true,
        },
        orderBy: { created_at: 'desc' }
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
          photo: true,
          created_at: true,
          updated_at: true
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
   * Create new personnel
   */
  async createPersonnel(request: FastifyRequest<{ Body: CreatePersonnelRequest }>, reply: FastifyReply) {
    try {
      const { npp, name, email, password, photo } = request.body

      // Check if NPP already exists
      const existingPersonnel = await this.prisma.personnels.findUnique({
        where: { npp }
      })

      if (existingPersonnel) {
        return reply.status(409).send({
          error: 'Conflict',
          message: 'Personnel with this NPP already exists'
        })
      }

      // Hash password
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(password, salt)

      // Create personnel
      const newPersonnel = await this.prisma.personnels.create({
        data: {
          npp,
          name,
          email,
          password: hashedPassword,
          photo
        }
      })

      // Remove password from response
      const { password: _, ...personnelWithoutPassword } = newPersonnel

      return this.sendResponse(reply, personnelWithoutPassword, 201)
    } catch (error) {
      return this.handleError(error, reply, 'Failed to create personnel')
    }
  }

  /**
   * Update personnel by ID
   */
  async updatePersonnel(
    request: FastifyRequest<{ Params: GetPersonnelParams; Body: UpdatePersonnelRequest }>,
    reply: FastifyReply
  ) {
    try {
      const { npp } = request.params
      const updateData = { ...request.body }

      // Check if personnel exists
      const personnel = await this.prisma.personnels.findUnique({
        where: { npp }
      })

      if (!personnel) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'Personnel not found'
        })
      }

      // If NPP is being updated, check if the new NPP is already taken
      if (updateData.npp && updateData.npp !== personnel.npp) {
        const existingPersonnel = await this.prisma.personnels.findUnique({
          where: { npp: updateData.npp }
        })

        if (existingPersonnel) {
          return reply.status(409).send({
            error: 'Conflict',
            message: 'NPP already in use'
          })
        }
      }

      // Hash password if it's being updated
      if (updateData.password) {
        const salt = await bcrypt.genSalt(10)
        updateData.password = await bcrypt.hash(updateData.password, salt)
      }

      // Update personnel
      const updatedPersonnel = await this.prisma.personnels.update({
        where: { npp },
        data: updateData
      })

      // Remove password from response
      const { password: _, ...personnelWithoutPassword } = updatedPersonnel

      return this.sendResponse(reply, personnelWithoutPassword)
    } catch (error) {
      return this.handleError(error, reply, 'Failed to update personnel')
    }
  }

  /**
   * Delete personnel by ID
   */
  async deletePersonnel(request: FastifyRequest<{ Params: GetPersonnelParams }>, reply: FastifyReply) {
    try {
      const { npp } = request.params

      // Check if personnel exists
      const personnel = await this.prisma.personnels.findUnique({
        where: { npp }
      })

      if (!personnel) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'Personnel not found'
        })
      }

      // Delete personnel
      await this.prisma.personnels.delete({
        where: { npp }
      })

      return reply.status(204).send()
    } catch (error) {
      return this.handleError(error, reply, 'Failed to delete personnel')
    }
  }
}
