import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { PrismaClient } from '@prisma/client'

/**
 * Base controller class that contains common functionality
 */
export abstract class BaseController {
  protected prisma: PrismaClient
  protected fastify: FastifyInstance

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify
    this.prisma = fastify.prisma
  }

  /**
   * Helper method to handle errors
   */
  protected handleError(error: any, reply: FastifyReply, message = 'An error occurred') {
    this.fastify.log.error(error)
    
    // Check if this is a Prisma error
    if (error.code && error.code.startsWith('P')) {
      // Handle specific Prisma errors
      switch (error.code) {
        case 'P2002': // Unique constraint violation
          return reply.status(409).send({ 
            error: 'Conflict', 
            message: 'A record with this identifier already exists'
          })
        case 'P2025': // Record not found
          return reply.status(404).send({
            error: 'Not Found',
            message: 'The requested resource was not found'
          })
        default:
          return reply.status(400).send({
            error: 'Bad Request',
            message
          })
      }
    }

    // Default error handling
    return reply.status(500).send({
      error: 'Internal Server Error',
      message
    })
  }

  /**
   * Helper method to send successful responses
   */
  protected sendResponse<T>(reply: FastifyReply, data: T, statusCode = 200) {
    return reply.status(statusCode).send(data)
  }
}
