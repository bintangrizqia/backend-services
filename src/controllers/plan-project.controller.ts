import { FastifyInstance } from 'fastify'
import { PrismaClient } from '@prisma/client'

export class PlanProjectController {
  private prisma: PrismaClient

  constructor(private readonly fastify: FastifyInstance) {
    this.prisma = fastify.prisma // asumsi prisma diinject ke fastify
  }

  async getProjectOptions(request: any, reply: any) {
    try {
      const data = await this.prisma.performance_Management_Plan_Projects.findMany({
        select: {
          id: true,
          name: true,
        },
      })

      reply.send({ data })
    } catch (error) {
      this.fastify.log.error(error)
      reply.status(500).send({ message: 'Internal server error' })
    }
  }
}
