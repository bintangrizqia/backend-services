// src/routes/assign-project.routes.ts

import { FastifyPluginAsync } from 'fastify'
import { AssignProjectController } from '../controllers/assign-project.controller'

const assignProjectRoutes: FastifyPluginAsync = async (fastify) => {
  const controller = new AssignProjectController(fastify)

  /* ----------  CREATE ---------- */
  fastify.post(
    '/create',
    {
      schema: {
        tags: ['assign-project'],
        description: 'Create new assign project',
        body: {
        type: 'object',
        properties: {
          key: { type: 'string' },
          name: { type: 'string' },
          target: { type: 'string' },
          unit: { type: 'string' },
          approval_status: { type: 'number' }, // ← tetap wajib
          description: { type: 'string' },
          created_by: { type: 'string' },
          year: { type: 'number' },
          performance_management_plan_type_id: { type: 'string' },
          owner: { type: 'string' },
          performance_management_plan_program_id: { type: 'string' },
          note: { type: 'string' }
        },
        required: [
          'key',
          'name',
          'target',
          'unit',
          'approval_status',
          'year',
          'performance_management_plan_type_id',
          'owner',
          'performance_management_plan_program_id'
        ]
      }
      }
    },
    controller.createAssignProject.bind(controller)
  )

  /* ----------  GET ALL ---------- */
  fastify.get(
    '/',
    {
      schema: {
        tags: ['assign-project'],
        description: 'Get all assign projects with pagination and search',
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'number', minimum: 1 },
            limit: { type: 'number', minimum: 1, maximum: 100 },
            search: { type: 'string' }
          }
        }
      }
    },
    controller.getAllAssignProjects.bind(controller)
  )

  /* ----------  GET BY ID ---------- */
  fastify.get(
    '/:id',
    {
      schema: {
        tags: ['assign-project'],
        description: 'Get assign project by ID',
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' }
          },
          required: ['id']
        }
      }
    },
    controller.getAssignProjectById.bind(controller)
  )

  /* ----------  UPDATE ---------- */
  fastify.put(
    '/:id',
    {
      schema: {
        tags: ['assign-project'],
        description: 'Update assign project by ID',
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' }
          },
          required: ['id']
        },
        body: {
          type: 'object',
          properties: {
            key: { type: 'string' },
            name: { type: 'string' },
            target: { type: 'string' },
            unit: { type: 'string' },
            project_status: { type: 'string' },
            approval_status: { type: 'number' },
            description: { type: 'string' },
            created_by: { type: 'string' },
            year: { type: 'number' },
            performance_management_plan_type_id: { type: 'string' },
            owner: { type: 'string' },
            performance_management_plan_program_id: { type: 'string' },
            note: { type: 'string' }
          }
        }
      }
    },
    controller.editAssignProject.bind(controller)
  )

  /* ----------  DELETE ---------- */
  fastify.delete(
    '/:id',
    {
      schema: {
        tags: ['assign-project'],
        description: 'Delete assign project by ID',
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' }
          },
          required: ['id']
        },
        response: {
          200: {
            type: 'object',
            properties: {
              message: { type: 'string' }
            }
          }
        }
      }
    },
    controller.deleteAssignProject.bind(controller)
  )
}

export default assignProjectRoutes
