// src/controllers/performance.management.plan.types.controller.ts

import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { BaseController } from './base.controller'

interface GetPlanTypes {
  id: string
}

interface GetPlanQueryParams {
  page?: number
  limit?: number
  search?: string
}

interface CreatePlanTypeBody {
  name: string
  description: string | null
}

interface DeletePlanTypeParams {
  id: string
}

export class PlanTypesController extends BaseController {
  constructor(fastify: FastifyInstance) {
    super(fastify)
  }


  async createPlanTypes(
    request: FastifyRequest<{ Body: CreatePlanTypeBody }>,
    reply: FastifyReply
  ) {
    try {
      const { name, description } = request.body

      const plan_type = await this.prisma.performance_Management_Plan_Types.create({
        data: { name, description },
        select: {
          id: true,
          name: true,
          description: true,
          created_at: true
        }
      }).catch((error: any) => {
        return this.handleError(error, reply, 'Failed to create plan types')
      })

      return this.sendResponse(reply, plan_type)
    } catch (error) {
      return this.handleError(error, reply, 'Failed to create plan types')
    }
  }

  /**
   * Delete plan types
   */
  async deletePlanTypes(
    request: FastifyRequest<{ Params: DeletePlanTypeParams }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params

      await this.prisma.performance_Management_Plan_Types.delete({
        where: { id }
      })

      return reply.status(200).send({
        message: 'Plan type was deleted.'
      })
    } catch (error) {
      return this.handleError(error, reply, 'Failed to delete plan type')
    }
  }

  /**
   * Get all plan types with pagination and search
   */
  async getAllPlanTypes(
    request: FastifyRequest<{ Querystring: GetPlanQueryParams }>,
    reply: FastifyReply
  ) {
    try {
      const { page = 1, limit = 10, search } = request.query
      const skip = (page - 1) * limit

      const where = search
        ? {
            name: {
              contains: search,
              mode: 'insensitive' as const
            }
          }
        : {}

      const planTypes = await this.prisma.performance_Management_Plan_Types.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          description: true,
          created_at: true
        }
      })

      const totalCount = await this.prisma.performance_Management_Plan_Types.count({
        where
      })

      return this.sendResponse(reply, {
        data: planTypes,
        meta: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit)
        }
      })
    } catch (error) {
      return this.handleError(error, reply, 'Failed to retrieve plan types')
    }
  }

  /**
   * Get plan types by ID
   */
  async GetPlanTypesById(
    request: FastifyRequest<{ Params: GetPlanTypes }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params

      const plan_type = await this.prisma.performance_Management_Plan_Types.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          description: true,
          created_at: true
        }
      })

      if (!plan_type) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'Plan type not found'
        })
      }

      return this.sendResponse(reply, plan_type)
    } catch (error) {
      return this.handleError(error, reply, 'Failed to retrieve plan type')
    }
  }

 
  async editPlanTypes(
    request: FastifyRequest<{ Params: GetPlanTypes; Body: CreatePlanTypeBody }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params
      const { name, description } = request.body

      const plan_type = await this.prisma.performance_Management_Plan_Types.update({
        where: { id },
        data: {
          name: name || undefined,
          description: description || undefined
        },
        select: {
          id: true,
          name: true,
          description: true,
          created_at: true
        }
      })

      return this.sendResponse(reply, plan_type)
    } catch (error) {
      return this.handleError(error, reply, 'Failed to update plan type')
    }
  }
}
