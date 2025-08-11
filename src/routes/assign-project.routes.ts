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
            approval_status: { type: 'number' },
            description: { type: 'string' },
            created_by: { type: 'string' },
            year: { type: 'number' },
            performance_management_plan_type_id: { type: 'string' },
            owner: { type: 'string' },
            performance_management_plan_program_id: { type: 'string' },
            note: { type: 'string' },
            personnel_target_id: { type: 'string' },
            personnel_from_id: { type: 'string' },
            due_date: { type: 'string', format: 'date-time' },
            activity_project: { type: 'string' },
            activity_unit: { type: 'string' }
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
            'performance_management_plan_program_id',
            'personnel_target_id',
            'personnel_from_id',
            'due_date'
          ]
        }
      }
    },
    controller.createAssignProject.bind(controller)
  )
}

export default assignProjectRoutes
