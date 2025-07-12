import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { BaseController } from './base.controller'
import { Prisma } from '@prisma/client'

interface GetMandatoryTalentaParams {
  id: string // UUID
}

interface GetMandatoryTalentaQuery {
  page?: number
  limit?: number
  search?: string
}

interface CreateMandatoryTalentaBody {
  project: string
  information: string | null
  key: string
  year: number
}

interface DeleteMandatoryTalentaParams {
  id: string
}

export class MandatoryTalentaController extends BaseController {
  constructor(fastify: FastifyInstance) {
    super(fastify)
  }

  async createMandatoryTalenta(
    request: FastifyRequest<{ Body: CreateMandatoryTalentaBody }>,
    reply: FastifyReply
  ) {
    try {
      const { project, information, key, year } = request.body

      const mandatory = await this.prisma.mandatoryTalenta.create({
        data: { project, information, key, year },
        select: {
          id: true,
          project: true,
          information: true,
          key: true,
          year: true,
          created_at: true,
          updated_at: true,
        },
      })

      return this.sendResponse(reply, mandatory)
    } catch (error) {
      return this.handleError(error, reply, 'Failed to create mandatory talenta')
    }
  }

  async deleteMandatoryTalenta(
    request: FastifyRequest<{ Params: DeleteMandatoryTalentaParams }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params

      await this.prisma.mandatoryTalenta.delete({
        where: { id },
      })

      return reply.status(200).send({
        message: 'Mandatory talenta was deleted.',
      })
    } catch (error) {
      return this.handleError(error, reply, 'Failed to delete mandatory talenta')
    }
  }

  async getAllMandatoryTalenta(
    request: FastifyRequest<{ Querystring: GetMandatoryTalentaQuery }>,
    reply: FastifyReply
  ) {
    try {
      const { page = 1, limit = 10, search } = request.query
      const skip = (page - 1) * limit

      const where: Prisma.MandatoryTalentaWhereInput = search
        ? {
            OR: [
              { project: { contains: search, mode: 'insensitive' } },
              { information: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}

      const mandatories = await this.prisma.mandatoryTalenta.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          project: true,
          information: true,
          key: true,
          year: true,
          created_at: true,
          updated_at: true,
        },
      })

      const totalCount = await this.prisma.mandatoryTalenta.count({ where })

      return this.sendResponse(reply, {
        data: mandatories,
        meta: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
      })
    } catch (error) {
      return this.handleError(error, reply, 'Failed to retrieve mandatory talenta')
    }
  }

  async getMandatoryTalentaById(
    request: FastifyRequest<{ Params: GetMandatoryTalentaParams }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params

      const mandatory = await this.prisma.mandatoryTalenta.findUnique({
        where: { id },
        select: {
          id: true,
          project: true,
          information: true,
          key: true,
          year: true,
          created_at: true,
          updated_at: true,
        },
      })

      if (!mandatory) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'Mandatory talenta not found',
        })
      }

      return this.sendResponse(reply, mandatory)
    } catch (error) {
      return this.handleError(error, reply, 'Failed to retrieve mandatory talenta')
    }
  }

  async editMandatoryTalenta(
    request: FastifyRequest<{
      Params: GetMandatoryTalentaParams
      Body: CreateMandatoryTalentaBody
    }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params
      const { project, information, key, year } = request.body

      const mandatory = await this.prisma.mandatoryTalenta.update({
        where: { id },
        data: {
          project: project || undefined,
          information: information || undefined,
          key: key || undefined,
          year: year || undefined,
        },
        select: {
          id: true,
          project: true,
          information: true,
          key: true,
          year: true,
          created_at: true,
          updated_at: true,
        },
      })

      return this.sendResponse(reply, mandatory)
    } catch (error) {
      return this.handleError(error, reply, 'Failed to edit mandatory talenta')
    }
  }
}