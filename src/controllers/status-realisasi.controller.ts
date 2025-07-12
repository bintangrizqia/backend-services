// src/controllers/statusRealisasi.controller.ts

import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { BaseController } from './base.controller'
import { Prisma } from '@prisma/client'

interface GetStatusRealisasiParams {
  id: number
}

interface GetStatusRealisasiQuery {
  page?: number
  limit?: number
  search?: string
}

interface CreateStatusRealisasiBody {
  nama_status_realisasi: string
  kode_warna_realisasi: string
  keterangan: string
  created_by: string
}

export class StatusRealisasiController extends BaseController {
  constructor(fastify: FastifyInstance) {
    super(fastify)
  }

  async createStatusRealisasi(
    request: FastifyRequest<{ Body: CreateStatusRealisasiBody }>,
    reply: FastifyReply
  ) {
    try {
      const { nama_status_realisasi, kode_warna_realisasi, keterangan, created_by } = request.body

      const result = await this.prisma.statusRealisasi.create({
        data: {
          nama_status_realisasi,
          kode_warna_realisasi,
          keterangan,
          created_by,
        },
      })

      return this.sendResponse(reply, result)
    } catch (error) {
      return this.handleError(error, reply, 'Failed to create status realisasi')
    }
  }

  async deleteStatusRealisasi(
    request: FastifyRequest<{ Params: GetStatusRealisasiParams }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params

      await this.prisma.statusRealisasi.delete({
        where: { id },
      })

      return reply.status(200).send({ message: 'Status realisasi was deleted.' })
    } catch (error) {
      return this.handleError(error, reply, 'Failed to delete status realisasi')
    }
  }

  async getAllStatusRealisasi(
    request: FastifyRequest<{ Querystring: GetStatusRealisasiQuery }>,
    reply: FastifyReply
  ) {
    try {
      const { page = 1, limit = 10, search } = request.query
      const skip = (page - 1) * limit

      const where: Prisma.StatusRealisasiWhereInput = search
        ? {
            OR: [
              { nama_status_realisasi: { contains: search, mode: 'insensitive' } },
              { keterangan: { contains: search, mode: 'insensitive' } },
              { created_by: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}

      const data = await this.prisma.statusRealisasi.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_date: 'desc' },
      })

      const totalCount = await this.prisma.statusRealisasi.count({ where })

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
      return this.handleError(error, reply, 'Failed to retrieve status realisasi')
    }
  }

  async getStatusRealisasiById(
    request: FastifyRequest<{ Params: GetStatusRealisasiParams }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params

      const data = await this.prisma.statusRealisasi.findUnique({
        where: { id },
      })

      if (!data) {
        return reply.status(404).send({ error: 'Not Found', message: 'Status realisasi not found' })
      }

      return this.sendResponse(reply, data)
    } catch (error) {
      return this.handleError(error, reply, 'Failed to retrieve status realisasi')
    }
  }

  async editStatusRealisasi(
    request: FastifyRequest<{
      Params: GetStatusRealisasiParams
      Body: Partial<CreateStatusRealisasiBody>
    }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params
      const { nama_status_realisasi, kode_warna_realisasi, keterangan, created_by } = request.body

      const result = await this.prisma.statusRealisasi.update({
        where: { id },
        data: {
          nama_status_realisasi: nama_status_realisasi ?? undefined,
          kode_warna_realisasi: kode_warna_realisasi ?? undefined,
          keterangan: keterangan ?? undefined,
          created_by: created_by ?? undefined,
        },
      })

      return this.sendResponse(reply, result)
    } catch (error) {
      return this.handleError(error, reply, 'Failed to update status realisasi')
    }
  }
}
