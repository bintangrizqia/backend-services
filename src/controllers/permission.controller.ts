import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { BaseController } from './base.controller'
import {Permission, Resource} from '@prisma/client'



export class PermissionController extends BaseController {
  constructor(fastify: FastifyInstance) {
    super(fastify)
  }


  /**
   * Get permissions
   */
  async getPermissionAndApps(request: FastifyRequest, reply: FastifyReply) {
    try {
        return reply.status(200).send({
          permissions: Permission,
          resources: Resource
        })
    } catch (error) {
      return this.handleError(error, reply, 'Failed to retrieve permissions')
    }
  }

}