import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { BaseController } from './base.controller'
import { Prisma, ActivityType } from '@prisma/client'

interface GetLogsQuery {
  page?: number;
  limit?: number;
  personnel_id?: string;
  startDate?: string;
  endDate?: string;
  activity_type?: string;
}

export class ActivityLogController extends BaseController {
  constructor(fastify: FastifyInstance) {
    super(fastify)
  }

  async getLogs(request: FastifyRequest<{ Querystring: GetLogsQuery }>, reply: FastifyReply) {
    try {
      const {
        page = 1,
        limit = 20,
        personnel_id,
        startDate,
        endDate,
        activity_type
      } = request.query;

      const skip = (page - 1) * limit;

      // Build where clause based on filters
      const where: Prisma.ActivityLogsWhereInput = {};
      
      if (personnel_id) {
        where.personnel_id = personnel_id;
      }
      
      if (startDate || endDate) {
        where.created_at = {};
        
        if (startDate) {
          where.created_at.gte = new Date(startDate);
        }
        
        if (endDate) {
          where.created_at.lte = new Date(endDate);
        }
      }
      
      if (activity_type) {
        where.activity_type = activity_type as ActivityType;
      }

      // Get activity logs with pagination
      const logs = await this.prisma.activityLogs.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          personnel: {
            select: {
              id: true,
              npp: true,
              name: true
            }
          }
        }
      });

      // Get total count for pagination
      const totalCount = await this.prisma.activityLogs.count({ where });

      return this.sendResponse(reply, {
        data: logs,
        meta: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit)
        }
      });
    } catch (error) {
      return this.handleError(error, reply, 'Failed to retrieve activity logs');
    }
  }

  async getLogById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const { id } = request.params;

      const log = await this.prisma.activityLogs.findUnique({
        where: { id },
        include: {
          personnel: {
            select: {
              id: true,
              npp: true,
              name: true
            }
          }
        }
      });

      if (!log) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'Activity log not found'
        });
      }

      return this.sendResponse(reply, log);
    } catch (error) {
      return this.handleError(error, reply, 'Failed to retrieve activity log');
    }
  }
}
