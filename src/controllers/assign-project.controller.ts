// src/controllers/assign-project.controller.ts

import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { BaseController } from './base.controller'
import { Prisma } from '@prisma/client'

/* ----------  DTO & Query Params ---------- */
interface GetAssignProjectParams {
  id: string          // cuid()
}

interface GetAssignProjectQuery {
  page?: number
  limit?: number
  search?: string
}

interface CreateAssignProjectBody {
  key: string
  name: string
  target: string
  unit: string
  project_status: string
  approval_status: number
  description?: string
  created_by?: string
  year: number
  performance_management_plan_type_id: string
  owner: string
  performance_management_plan_program_id: string
  note?: string
}

/* ----------  Controller Class ---------- */
export class AssignProjectController extends BaseController {
  constructor (fastify: FastifyInstance) {
    super(fastify)
  }

  /* ---- CREATE ---- */
  async createAssignProject(
  request: FastifyRequest<{ Body: CreateAssignProjectBody }>,
  reply: FastifyReply
) {
  try {
    const {
      key,
      name,
      target,
      unit,
      approval_status,
      description,
      year,
      performance_management_plan_type_id,
      owner,
      performance_management_plan_program_id,
      note
    } = request.body

    // Tentukan status proyek berdasarkan approval_status
    const project_status = approval_status === 0 ? 'not_started' : 'on_progress'

    const result = await this.prisma.performance_Management_Plan_Projects.create({
      data: {
        key,
        name,
        target,
        unit,
        approval_status,
        project_status,
        description,
        created_by: null,
        year,
        performance_management_plan_type_id,
        owner,
        performance_management_plan_program_id,
        note
      }
    })

    return this.sendResponse(reply, result)
  } catch (error) {
    return this.handleError(error, reply, 'Failed to create assign project')
  }
}


  /* ---- DELETE ---- */
  async deleteAssignProject (
    request: FastifyRequest<{ Params: GetAssignProjectParams }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params

      await this.prisma.performance_Management_Plan_Projects.delete({
        where: { id }
      })

      return reply.status(200).send({ message: 'Assign project was deleted.' })
    } catch (error) {
      return this.handleError(error, reply, 'Failed to delete assign project')
    }
  }

  /* ---- GET ALL ---- */
  async getAllAssignProjects (
    request: FastifyRequest<{ Querystring: GetAssignProjectQuery }>,
    reply: FastifyReply
  ) {
    try {
      const { page = 1, limit = 10, search } = request.query
      const skip = (page - 1) * limit

      const where: Prisma.Performance_Management_Plan_ProjectsWhereInput = search
        ? {
            OR: [
              { key: { contains: search, mode: 'insensitive' } },
              { name: { contains: search, mode: 'insensitive' } },
              { unit: { contains: search, mode: 'insensitive' } },
              { owner: { contains: search, mode: 'insensitive' } },
              { created_by: { contains: search, mode: 'insensitive' } }
            ]
          }
        : {}

      const data = await this.prisma.performance_Management_Plan_Projects.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' }
      })

      const totalCount = await this.prisma.performance_Management_Plan_Projects.count({ where })

      return this.sendResponse(reply, {
        data,
        meta: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit)
        }
      })
    } catch (error) {
      return this.handleError(error, reply, 'Failed to retrieve assign projects')
    }
  }

  /* ---- GET BY ID ---- */
  async getAssignProjectById (
    request: FastifyRequest<{ Params: GetAssignProjectParams }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params

      const data = await this.prisma.performance_Management_Plan_Projects.findUnique({
        where: { id },
        include: {
          performance_management_plan_type: true,
          performance_management_plan_program: true
        }
      })

      if (!data) {
        return reply.status(404).send({ error: 'Not Found', message: 'Assign project not found' })
      }

      return this.sendResponse(reply, data)
    } catch (error) {
      return this.handleError(error, reply, 'Failed to retrieve assign project')
    }
  }

  /* ---- UPDATE ---- */
  async editAssignProject (
    request: FastifyRequest<{
      Params: GetAssignProjectParams
      Body: Partial<CreateAssignProjectBody>
    }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params
      const body = request.body

      const result = await this.prisma.performance_Management_Plan_Projects.update({
        where: { id },
        data: {
          key: body.key ?? undefined,
          name: body.name ?? undefined,
          target: body.target ?? undefined,
          unit: body.unit ?? undefined,
          project_status: body.project_status ?? undefined,
          approval_status: body.approval_status ?? undefined,
          description: body.description ?? undefined,
          created_by: body.created_by ?? undefined,
          year: body.year ?? undefined,
          performance_management_plan_type_id:
            body.performance_management_plan_type_id ?? undefined,
          owner: body.owner ?? undefined,
          performance_management_plan_program_id:
            body.performance_management_plan_program_id ?? undefined,
          note: body.note ?? undefined
        }
      })

      return this.sendResponse(reply, result)
    } catch (error) {
      return this.handleError(error, reply, 'Failed to update assign project')
    }
  }
}
