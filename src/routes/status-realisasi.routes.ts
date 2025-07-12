// src/routes/status-realisasi.routes.ts

import { FastifyPluginAsync } from 'fastify'
import { StatusRealisasiController } from '../controllers/status-realisasi.controller'

const statusRealisasiRoutes: FastifyPluginAsync = async (fastify) => {
  const controller = new StatusRealisasiController(fastify)

  // POST - Create
  fastify.post('/create', {
    schema: {
      tags: ['status-realisasi'],
      description: 'Create new status realisasi',
      body: {
        type: 'object',
        properties: {
          nama_status_realisasi: { type: 'string' },
          kode_warna_realisasi: { type: 'string' },
          keterangan: { type: 'string' },
          created_by: { type: 'string' },
        },
        required: ['nama_status_realisasi', 'kode_warna_realisasi', 'keterangan', 'created_by'],
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            nama_status_realisasi: { type: 'string' },
            kode_warna_realisasi: { type: 'string' },
            keterangan: { type: 'string' },
            created_by: { type: 'string' },
            created_date: { type: 'string' },
          },
        },
      },
    },
  }, controller.createStatusRealisasi.bind(controller))

  // GET - Get all with pagination and search
  fastify.get('/', {
    schema: {
      tags: ['status-realisasi'],
      description: 'Get all status realisasi with pagination and search',
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number', minimum: 1 },
          limit: { type: 'number', minimum: 1, maximum: 100 },
          search: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'number' },
                  nama_status_realisasi: { type: 'string' },
                  kode_warna_realisasi: { type: 'string' },
                  keterangan: { type: 'string' },
                  created_by: { type: 'string' },
                  created_date: { type: 'string' },
                },
              },
            },
            meta: {
              type: 'object',
              properties: {
                page: { type: 'number' },
                limit: { type: 'number' },
                totalCount: { type: 'number' },
                totalPages: { type: 'number' },
              },
            },
          },
        },
      },
    },
  }, controller.getAllStatusRealisasi.bind(controller))

  // GET - By ID
  fastify.get('/:id', {
    schema: {
      tags: ['status-realisasi'],
      description: 'Get status realisasi by ID',
      params: {
        type: 'object',
        properties: {
          id: { type: 'number' },
        },
        required: ['id'],
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            nama_status_realisasi: { type: 'string' },
            kode_warna_realisasi: { type: 'string' },
            keterangan: { type: 'string' },
            created_by: { type: 'string' },
            created_date: { type: 'string' },
          },
        },
        404: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' },
          },
        },
      },
    },
  }, controller.getStatusRealisasiById.bind(controller))

  // PUT - Update
  fastify.put('/:id', {
    schema: {
      tags: ['status-realisasi'],
      description: 'Update status realisasi by ID',
      params: {
        type: 'object',
        properties: {
          id: { type: 'number' },
        },
        required: ['id'],
      },
      body: {
        type: 'object',
        properties: {
          nama_status_realisasi: { type: 'string' },
          kode_warna_realisasi: { type: 'string' },
          keterangan: { type: 'string' },
          created_by: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            nama_status_realisasi: { type: 'string' },
            kode_warna_realisasi: { type: 'string' },
            keterangan: { type: 'string' },
            created_by: { type: 'string' },
            created_date: { type: 'string' },
          },
        },
      },
    },
  }, controller.editStatusRealisasi.bind(controller))

  // DELETE - Delete
  fastify.delete('/:id', {
    schema: {
      tags: ['status-realisasi'],
      description: 'Delete status realisasi by ID',
      params: {
        type: 'object',
        properties: {
          id: { type: 'number' },
        },
        required: ['id'],
      },
      response: {
        200: {
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
        },
      },
    },
  }, controller.deleteStatusRealisasi.bind(controller))
}

export default statusRealisasiRoutes
