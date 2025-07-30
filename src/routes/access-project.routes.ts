// Final: Route & Controller - Access Project Type

// ROUTES - access-project.routes.ts
import { FastifyPluginAsync } from 'fastify'
import { AccessProjectTypeController } from '../controllers/access-project.controller'

const accessProjectTypeRoutes: FastifyPluginAsync = async (fastify) => {
  const controller = new AccessProjectTypeController(fastify)

  const accessProjectTypeSchema = {
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
      project: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
        },
        nullable: true,
      },
      typeRel: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string' },
        },
        nullable: true,
      },
    },
  }

  const responseWrapper = {
    type: 'object',
    properties: {
      success: { type: 'boolean' },
      data: accessProjectTypeSchema,
    },
  }

  fastify.post('/create', {
    schema: {
      tags: ['access-project-type'],
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
      response: { 200: responseWrapper },
    },
  }, controller.createAccessProjectType.bind(controller))

  fastify.get('/', {
    schema: {
      tags: ['access-project-type'],
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number' },
          limit: { type: 'number' },
          search: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'array',
              items: accessProjectTypeSchema,
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

  fastify.get('/:id', {
    schema: {
      tags: ['access-project-type'],
      params: {
        type: 'object',
        properties: { id: { type: 'string' } },
        required: ['id'],
      },
      response: {
        200: responseWrapper,
        404: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
          },
        },
      },
    },
  }, controller.getAccessProjectTypeById.bind(controller))

  fastify.put('/:id', {
    schema: {
      tags: ['access-project-type'],
      params: {
        type: 'object',
        properties: { id: { type: 'string' } },
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
      response: { 200: responseWrapper },
    },
  }, controller.editAccessProjectType.bind(controller))

  fastify.delete('/:id', {
    schema: {
      tags: ['access-project-type'],
      params: {
        type: 'object',
        properties: { id: { type: 'string' } },
        required: ['id'],
      },
      response: {
        200: {
          type: 'object',
          properties: { message: { type: 'string' } },
        },
      },
    },
  }, controller.deleteAccessProjectType.bind(controller))
}

export default accessProjectTypeRoutes
