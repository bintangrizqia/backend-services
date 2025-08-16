import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { BaseController } from './base.controller';
import { Prisma } from '@prisma/client';
import bcrypt from 'bcrypt';

interface GetPersonnelParams {
  npp: string;
}

interface GetPersonnelQuery {
  page?: number;
  limit?: number;
  search?: string;
}

export interface CreatePersonnelBody {
  npp: string;
  name: string;
  email?: string;
  unit_id: number;
  position_id: number;
  eselon?: number;
  photo?: string;
}

export interface UpdatePersonnelBody {
  name?: string;
  email?: string;
  unit_id?: number;
  position_id?: number;
  eselon?: number;
  photo?: string;
}

export class PersonnelController extends BaseController {
  constructor(fastify: FastifyInstance) {
    super(fastify);
  }

  async createPersonnel(
    request: FastifyRequest<{ Body: CreatePersonnelBody }>,
    reply: FastifyReply
  ) {
    try {
      const { npp, name, unit_id, position_id, eselon, photo, email } = request.body;

      // Validate unit and position exist
      const unitExists = await this.prisma.units.findUnique({ where: { id: unit_id } });
      if (!unitExists) {
        return reply.status(400).send({
          error: 'Bad Request',
          message: `Unit with ID ${unit_id} does not exist.`
        });
      }

      const positionExists = await this.prisma.positions.findUnique({ where: { id: position_id } });
      if (!positionExists) {
        return reply.status(400).send({
          error: 'Bad Request',
          message: `Position with ID ${position_id} does not exist.`
        });
      }

      const hashedPassword = await bcrypt.hash("initial01!", 10);

      const personnel = await this.prisma.personnels.create({
        data: {
          npp,
          name,
          unit_id,
          position_id,
          eselon: eselon ?? null,
          email: email ?? null,
          photo: photo ?? null,
          password: hashedPassword,
          active: true,
          is_superuser: false
        }
      });

      // Return consistent response data
      const responseData = {
        npp: personnel.npp,
        name: personnel.name,
        email: personnel.email,
        unit_id: personnel.unit_id,
        position_id: personnel.position_id,
        eselon: personnel.eselon,
        photo: personnel.photo,
        created_at: personnel.created_at.toISOString(),
        updated_at: personnel.updated_at.toISOString()
      };
      
      return this.sendResponse(reply, { message: 'Personnel created successfully', data: responseData }, 201);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          return reply.status(409).send({
            error: 'Conflict',
            message: `Personnel with NPP '${request.body.npp}' already exists.`
          });
        }
        if (error.code === 'P2003') {
          return reply.status(400).send({
            error: 'Bad Request',
            message: 'Invalid unit_id or position_id provided.'
          });
        }
      }
      return this.handleError(error, reply, 'Failed to create personnel');
    }
  }

 async getAllPersonnel(
  request: FastifyRequest<{ Querystring: GetPersonnelQuery }>,
  reply: FastifyReply
  ) {
    try {
      const { page = 1, limit = 10, search } = request.query;
      const skip = (page - 1) * limit;

      const where = search
        ? {
            OR: [
              { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
              { npp: { contains: search, mode: Prisma.QueryMode.insensitive } },
              { email: { contains: search, mode: Prisma.QueryMode.insensitive } }
            ]
          }
        : {};

      const personnel = await this.prisma.personnels.findMany({
        where,
        skip,
        take: limit,
        // FIXED: Data terbaru di atas
        orderBy: {
          created_at: 'desc'
        },
        select: {
          npp: true,
          name: true,
          email: true,
          eselon: true, // FIXED: PENTING! Include eselon field
          active: true, // Tambahan: untuk status
          unit: {
            select: {
              id: true,
              name: true,
              position_type: true,
              created_at: true
            }
          },
          position: {
            select: {
              id: true,
              name: true,
              type_position: {
                select: {
                  id: true,
                  name_f: true,
                  name_s: true,
                  eselon: true,
                  level_type_position: true,
                  description: true,
                  created_at: true
                }
              }
            }
          },
          photo: true,
          created_at: true,
          updated_at: true
        }
      });

      const totalCount = await this.prisma.personnels.count({ where });

      return this.sendResponse(reply, {
        data: personnel,
        meta: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit)
        }
      });
    } catch (error) {
      return this.handleError(error, reply, 'Failed to retrieve personnel');
    }
  }

  async getPersonnelById(
    request: FastifyRequest<{ Params: GetPersonnelParams }>,
    reply: FastifyReply
  ) {
    try {
      const { npp } = request.params;

      const personnel = await this.prisma.personnels.findUnique({
        where: { npp },
        select: {
          npp: true,
          name: true,
          email: true,
          eselon: true,
          unit: {
            select: {
              id: true,
              name: true,
              position_type: true,
              created_at: true
            }
          },
          position: {
            select: {
              id: true,
              name: true,
              type_position: {
                select: {
                  id: true,
                  name_f: true,
                  name_s: true,
                  eselon: true,
                  level_type_position: true,
                  description: true,
                  created_at: true
                }
              }
            }
          },
          photo: true,
          created_at: true,
          updated_at: true
        }
      });

      if (!personnel) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'Personnel not found'
        });
      }

      return this.sendResponse(reply, personnel);
    } catch (error) {
      return this.handleError(error, reply, 'Failed to retrieve personnel');
    }
  }

  async updatePersonnel(
    request: FastifyRequest<{ Params: GetPersonnelParams; Body: UpdatePersonnelBody }>,
    reply: FastifyReply
  ) {
    try {
      const { npp } = request.params;
      const updateData = request.body;

      // Check if personnel exists
      const existing = await this.prisma.personnels.findUnique({ where: { npp } });
      if (!existing) {
        return reply.status(404).send({ 
          error: 'Not Found', 
          message: 'Personnel not found' 
        });
      }

      // Validate unit_id if provided
      if (updateData.unit_id) {
        const unitExists = await this.prisma.units.findUnique({ 
          where: { id: updateData.unit_id } 
        });
        if (!unitExists) {
          return reply.status(400).send({
            error: 'Bad Request',
            message: `Unit with ID ${updateData.unit_id} does not exist.`
          });
        }
      }

      // Validate position_id if provided  
      if (updateData.position_id) {
        const positionExists = await this.prisma.positions.findUnique({ 
          where: { id: updateData.position_id } 
        });
        if (!positionExists) {
          return reply.status(400).send({
            error: 'Bad Request',
            message: `Position with ID ${updateData.position_id} does not exist.`
          });
        }
      }

      const updated = await this.prisma.personnels.update({
        where: { npp },
        data: updateData,
        select: {
          npp: true,
          name: true,
          email: true,
          unit_id: true,
          position_id: true,
          eselon: true,
          photo: true,
          created_at: true,
          updated_at: true
        }
      });

      return this.sendResponse(reply, {
        message: 'Personnel updated successfully',
        data: {
          ...updated,
          created_at: updated.created_at.toISOString(),
          updated_at: updated.updated_at.toISOString()
        }
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          return reply.status(400).send({
            error: 'Bad Request',
            message: 'Invalid unit_id or position_id provided.'
          });
        }
      }
      return this.handleError(error, reply, 'Failed to update personnel');
    }
  }

  async deletePersonnel(
    request: FastifyRequest<{ Params: GetPersonnelParams }>,
    reply: FastifyReply
  ) {
    try {
      const { npp } = request.params;

      const existing = await this.prisma.personnels.findUnique({ where: { npp } });
      if (!existing) {
        return reply.status(404).send({ 
          error: 'Not Found', 
          message: 'Personnel not found' 
        });
      }

      await this.prisma.personnels.delete({ where: { npp } });

      return this.sendResponse(reply, { message: 'Personnel deleted successfully' });
    } catch (error) {
      return this.handleError(error, reply, 'Failed to delete personnel');
    }
  }

  async getPersonnelOptions(
    request: FastifyRequest<{ Querystring: { eselon?: string } }>,
    reply: FastifyReply
  ) {
    try {
      const eselonParam = request.query?.eselon;
      const eselonFilter = eselonParam
        ? (Array.isArray(eselonParam) ? eselonParam.map(Number) : eselonParam.split(',').map(Number))
        : undefined;

      const personnels = await this.prisma.personnels.findMany({
        where: eselonFilter
          ? { eselon: { in: eselonFilter } }
          : undefined,
        select: {
          npp: true,
          name: true
        },
        orderBy: {
          name: 'asc'
        }
      });

      return this.sendResponse(reply, { data: personnels });
    } catch (error) {
      return this.handleError(error, reply, 'Failed to retrieve personnel options');
    }
  }
}