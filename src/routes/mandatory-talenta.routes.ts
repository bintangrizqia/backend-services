import { FastifyPluginAsync } from 'fastify'
import { MandatoryTalentaController } from '../controllers/mandatory-talenta.controller'

const mandatoryTalentaRoutes: FastifyPluginAsync = async (fastify) => {
  const controller = new MandatoryTalentaController(fastify)

  // POST - Create mandatory talenta
  fastify.post('/create', {
    schema: {
      tags: ['mandatory-talenta'],
      description: 'Create new mandatory talenta',
      body: {
        type: 'object',
        properties: {
          project: { type: 'string' },
          information: { type: ['string', 'null'] },
          key: { type: 'string' },
          year: { type: 'number' },
        },
        required: ['project', 'key', 'year'],
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            project: { type: 'string' },
            information: { type: ['string', 'null'] },
            key: { type: 'string' },
            year: { type: 'number' },
            created_at: { type: 'string' },
            updated_at: { type: 'string' },
          },
        },
      },
    },
  }, controller.createMandatoryTalenta.bind(controller))

  // GET - Get all mandatory talenta with pagination and search
  fastify.get('/', {
    schema: {
      tags: ['mandatory-talenta'],
      description: 'Get all mandatory talenta with pagination and search',
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
                  id: { type: 'string' },
                  project: { type: 'string' },
                  information: { type: ['string', 'null'] },
                  key: { type: 'string' },
                  year: { type: 'number' },
                  created_at: { type: 'string' },
                  updated_at: { type: 'string' },
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
  }, controller.getAllMandatoryTalenta.bind(controller))

  // GET - Get mandatory talenta by ID
  fastify.get('/:id', {
    schema: {
      tags: ['mandatory-talenta'],
      description: 'Get mandatory talenta by ID',
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
        required: ['id'],
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            project: { type: 'string' },
            information: { type: ['string', 'null'] },
            key: { type: 'string' },
            year: { type: 'number' },
            created_at: { type: 'string' },
            updated_at: { type: 'string' },
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
  }, controller.getMandatoryTalentaById.bind(controller))

  // PUT - Edit mandatory talenta
  fastify.put('/:id', {
    schema: {
      tags: ['mandatory-talenta'],
      description: 'Edit mandatory talenta',
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
        required: ['id'],
      },
      body: {
        type: 'object',
        properties: {
          project: { type: 'string' },
          information: { type: ['string', 'null'] },
          key: { type: 'string' },
          year: { type: 'number' },
        },
        required: ['project', 'key', 'year'],
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            project: { type: 'string' },
            information: { type: ['string', 'null'] },
            key: { type: 'string' },
            year: { type: 'number' },
            created_at: { type: 'string' },
            updated_at: { type: 'string' },
          },
        },
      },
    },
  }, controller.editMandatoryTalenta.bind(controller))

  // DELETE - Delete mandatory talenta
  fastify.delete('/:id', {
    schema: {
      tags: ['mandatory-talenta'],
      description: 'Delete mandatory talenta',
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
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
  }, controller.deleteMandatoryTalenta.bind(controller))
}

export default mandatoryTalentaRoutes
