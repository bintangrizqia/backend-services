// src/modules/access-project-type/accessProjectType.controller.ts

import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { BaseController } from './base.controller'
import { Prisma } from '@prisma/client'

interface GetAccessProjectTypeParams {
  id: string // UUID
}

interface GetAccessProjectTypeQuery {
  page?: number
  limit?: number
  search?: string
}

interface CreateAccessProjectTypeBody {
  keys: string
  unit: string
  type: string
  project_name: string
  information: string
  target: number
  year: number
}

interface DeleteAccessProjectTypeParams {
  id: string
}

export class AccessProjectTypeController extends BaseController {
  constructor(fastify: FastifyInstance) {
    super(fastify)
  }

  async createAccessProjectType(
    request: FastifyRequest<{ Body: CreateAccessProjectTypeBody }>,
    reply: FastifyReply
  ) {
    try {
      const { keys, unit, type, project_name, information, target, year } = request.body

      const result = await this.prisma.accessProjectType.create({
        data: { keys, unit, type, project_name, information, target, year },
        select: {
          id: true,
          keys: true,
          unit: true,
          type: true,
          project_name: true,
          information: true,
          target: true,
          year: true,
          created_at: true,
          updated_at: true,
        },
      })

      return this.sendResponse(reply, result)
    } catch (error) {
      return this.handleError(error, reply, 'Failed to create access project type')
    }
  }

  async deleteAccessProjectType(
    request: FastifyRequest<{ Params: DeleteAccessProjectTypeParams }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params

      await this.prisma.accessProjectType.delete({
        where: { id },
      })

      return reply.status(200).send({
        message: 'Access project type was deleted.',
      })
    } catch (error) {
      return this.handleError(error, reply, 'Failed to delete access project type')
    }
  }

  async getAllAccessProjectType(
    request: FastifyRequest<{ Querystring: GetAccessProjectTypeQuery }>,
    reply: FastifyReply
  ) {
    try {
      const { page = 1, limit = 10, search } = request.query
      const skip = (page - 1) * limit

      const where: Prisma.AccessProjectTypeWhereInput = search
        ? {
            OR: [
              { project_name: { contains: search, mode: 'insensitive' } },
              { information: { contains: search, mode: 'insensitive' } },
              { unit: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}

      const data = await this.prisma.accessProjectType.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          keys: true,
          unit: true,
          type: true,
          project_name: true,
          information: true,
          target: true,
          year: true,
          created_at: true,
          updated_at: true,
          project: {
            select: { id: true, name: true },
          },
          typeRel: {
            select: { id: true, name: true, description: true },
          },
        },
      })

      const totalCount = await this.prisma.accessProjectType.count({ where })

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
      return this.handleError(error, reply, 'Failed to retrieve access project types')
    }
  }

  async getAccessProjectTypeById(
    request: FastifyRequest<{ Params: GetAccessProjectTypeParams }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params

      const data = await this.prisma.accessProjectType.findUnique({
        where: { id },
        select: {
          id: true,
          keys: true,
          unit: true,
          type: true,
          project_name: true,
          information: true,
          target: true,
          year: true,
          created_at: true,
          updated_at: true,
          project: {
            select: { id: true, name: true },
          },
          typeRel: {
            select: { id: true, name: true, description: true },
          },
        },
      })

      if (!data) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'Access project type not found',
        })
      }

      return this.sendResponse(reply, data)
    } catch (error) {
      return this.handleError(error, reply, 'Failed to retrieve access project type')
    }
  }

  async editAccessProjectType(
    request: FastifyRequest<{
      Params: GetAccessProjectTypeParams
      Body: Partial<CreateAccessProjectTypeBody>
    }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params
      const { keys, unit, type, project_name, information, target, year } = request.body

      const data = await this.prisma.accessProjectType.update({
        where: { id },
        data: {
          keys: keys ?? undefined,
          unit: unit ?? undefined,
          type: type ?? undefined,
          project_name: project_name ?? undefined,
          information: information ?? undefined,
          target: target ?? undefined,
          year: year ?? undefined,
        },
        select: {
          id: true,
          keys: true,
          unit: true,
          type: true,
          project_name: true,
          information: true,
          target: true,
          year: true,
          created_at: true,
          updated_at: true,
        },
      })

      return this.sendResponse(reply, data)
    } catch (error) {
      return this.handleError(error, reply, 'Failed to update access project type')
    }
  }
}