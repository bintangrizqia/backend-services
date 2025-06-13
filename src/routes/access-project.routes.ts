import { FastifyPluginAsync } from 'fastify'
import { AccessProjectTypeController } from '../controllers/access-project.controller'

const accessProjectTypeRoutes: FastifyPluginAsync = async (fastify) => {
  const controller = new AccessProjectTypeController(fastify)

  // POST - Create access project type
  fastify.post('/create', {
    schema: {
      tags: ['access-project-type'],
      description: 'Create new access project type',
      body: {
        type: 'object',
        properties: {
          keys: { type: 'string' },
          unit: { type: 'string' },
          type: { type: 'string' },
          project_name: { type: 'string' },
          information: { type: 'string' },
          target: { type: 'number' },
          year: { type: 'number' },
        },
        required: ['keys', 'unit', 'type', 'project_name', 'target', 'year'],
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            keys: { type: 'string' },
            unit: { type: 'string' },
            type: { type: 'string' },
            project_name: { type: 'string' },
            information: { type: 'string' },
            target: { type: 'number' },
            year: { type: 'number' },
            created_at: { type: 'string' },
            updated_at: { type: 'string' },
          },
        },
      },
    },
  }, controller.createAccessProjectType.bind(controller))

  // GET - Get all access project types with pagination and search
  fastify.get('/', {
    schema: {
      tags: ['access-project-type'],
      description: 'Get all access project types with pagination and search',
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
                  keys: { type: 'string' },
                  unit: { type: 'string' },
                  type: { type: 'string' },
                  project_name: { type: 'string' },
                  information: { type: 'string' },
                  target: { type: 'number' },
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
  }, controller.getAllAccessProjectType.bind(controller))

  // GET - Get access project type by ID
  fastify.get('/:id', {
    schema: {
      tags: ['access-project-type'],
      description: 'Get access project type by ID',
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
            keys: { type: 'string' },
            unit: { type: 'string' },
            type: { type: 'string' },
            project_name: { type: 'string' },
            information: { type: 'string' },
            target: { type: 'number' },
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
  }, controller.getAccessProjectTypeById.bind(controller))

  // PUT - Edit access project type
  fastify.put('/:id', {
    schema: {
      tags: ['access-project-type'],
      description: 'Edit access project type',
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
          keys: { type: 'string' },
          unit: { type: 'string' },
          type: { type: 'string' },
          project_name: { type: 'string' },
          information: { type: 'string' },
          target: { type: 'number' },
          year: { type: 'number' },
        },
        required: ['keys', 'unit', 'type', 'project_name', 'target', 'year'],
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            keys: { type: 'string' },
            unit: { type: 'string' },
            type: { type: 'string' },
            project_name: { type: 'string' },
            information: { type: 'string' },
            target: { type: 'number' },
            year: { type: 'number' },
            created_at: { type: 'string' },
            updated_at: { type: 'string' },
          },
        },
      },
    },
  }, controller.editAccessProjectType.bind(controller))

  // DELETE - Delete access project type
  fastify.delete('/:id', {
    schema: {
      tags: ['access-project-type'],
      description: 'Delete access project type',
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
  }, controller.deleteAccessProjectType.bind(controller))
}

export default accessProjectTypeRoutes
