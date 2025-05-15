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
      const ResourceArray: Resource[] = Object.values(Resource)
      const PermissionArray: Permission[] = Object.values(Permission)
        return reply.status(200).send({
          permissions: PermissionArray,
          resources: ResourceArray
        })
    } catch (error) {
      return this.handleError(error, reply, 'Failed to retrieve permissions')
    }
  }

}