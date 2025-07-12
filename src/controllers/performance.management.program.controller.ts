import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { BaseController } from './base.controller'
import { Prisma } from "@prisma/client";


interface GetProgramTypes {
  id: string
}

interface GetProgramQueryParams {
  page?: number
  limit?: number
  search?: string
}

interface CreateProgramBody {
    name: string
    description: string | null
    year: number
    status: string
    program_code: string
    created_by: string

}

interface DeleteProgramParams {
    id: string
}

export class ProgramController extends BaseController {
  constructor(fastify: FastifyInstance) {
    super(fastify)
  }

  /**
   * Create plan types
   * @param request 
   * @param reply 
   */
  async createProgram(request: FastifyRequest<{Body: CreateProgramBody}>, reply: FastifyReply) {
    try {
        const { name, description, year, created_by, status, program_code } = request.body

        const program = await this.prisma.performance_Management_Plan_Program.create({
            data: {name, description, year, created_by, status, program_code},
        }).catch((error: any) => {
            return this.handleError(error, reply, "Failed to create program")
        })

        return this.sendResponse(reply, program)
    } catch (error) {
        return this.handleError(error, reply, 'Failed to retrieve program')
    }
  }

/**
 * Delete plan types
 * @param request 
 * @param reply 
 */
  async deleteProgram(request: FastifyRequest<{Params: DeleteProgramParams }>, reply: FastifyReply) {
    try {
        const {id} = request.params

        await this.prisma.performance_Management_Plan_Program.delete({
            where: {id}
        })
        return reply.status(200).send({
            message: 'Program was deleted.'
        })
    } catch (error) {
        return this.handleError(error, reply, 'Failed to delete program')
    }
  }

  /**
   * Get all plan types with pagination and search
   */
  async getAllProgram(request: FastifyRequest<{ Querystring: GetProgramQueryParams }>, reply: FastifyReply) {
    try {
      const { page = 1, limit = 10, search } = request.query
      const skip = (page - 1) * limit

      const where = search
        ? {
            name: { contains: search, mode: Prisma.QueryMode.insensitive },
            program_code: { contains: search, mode: Prisma.QueryMode.insensitive },
            status: { contains: search, mode: Prisma.QueryMode.insensitive },
          }
        : {}
      const programs = await this.prisma.performance_Management_Plan_Program.findMany({
        where,
        skip,
        select: {
            id: true,
            name: true,
            description: true,
            year: true,
            status: true,
            program_code: true,
            created_at: true
        },
        take: limit
      })  

      // Get total count for pagination
      const totalCount = await this.prisma.performance_Management_Plan_Program.count({ where })

      return this.sendResponse(reply, {
        data: programs,
        meta: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit)
        }
      })
      
    } catch (error) {
      return this.handleError(error, reply, 'Failed to retrieve programs')
    }
  }

  /**
   * Get plan types by ID
   */
  async GetProgramById(request: FastifyRequest<{ Params: GetProgramTypes }>, reply: FastifyReply) {
    try {
      const { id } = request.params

      const plan_type = await this.prisma.performance_Management_Plan_Program.findUnique({
        where: { id },
        select: {
            id: true,
            name: true,
            description: true,
            year: true,
            status: true,
            program_code: true,
            created_at: true,
        }
      })

      if (!plan_type) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'Program not found'
        })
      }

      return this.sendResponse(reply, plan_type)
    } catch (error) {
      return this.handleError(error, reply, 'Failed to retrieve program')
    }
  }


  /**
   * Edit plan types
   * @param request 
   * @param reply 
   */
  async editProgram(request: FastifyRequest<{Params: GetProgramTypes, Body: CreateProgramBody}>, reply: FastifyReply) {
    try {
        const {id} = request.params
        const {name, description, program_code, status} = request.body

        const plan_type = await this.prisma.performance_Management_Plan_Program.update({
            where: {id},
            data: {
                name: name || undefined,
                description: description || undefined,
                program_code: program_code || undefined,
                status: status || undefined
            },
            select: {
                id: true,
                name: true,
                description: true,
                year: true,
                status: true,
                program_code: true,
                created_at: true,
            }
        })

        return this.sendResponse(reply, plan_type)
    } catch (error) {
      return this.handleError(error, reply, 'Failed to retrieve plan type')
        
    }
  }

}