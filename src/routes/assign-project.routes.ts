import { FastifyPluginAsync } from 'fastify'
import { AssignProjectController } from '../controllers/assign-project.controller'

// Import interface dari controller biar tidak duplikat
import type { CreateAssignProjectBody, UpdateAssignProjectBody } from '../controllers/assign-project.controller'

const assignProjectRoutes: FastifyPluginAsync = async (fastify) => {
  const controller = new AssignProjectController(fastify)

  /* ----------  CREATE ---------- */
  fastify.post<{ Body: CreateAssignProjectBody }>(
    '/create',
    {
      preHandler: [fastify.authenticate], // pastikan user login
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
            description: { type: 'string' },
            year: { type: 'number' },
            performance_management_plan_type_id: { type: 'string' },
            owner: { type: 'string' },
            performance_management_plan_program_id: { type: 'string' },
            note: { type: 'string' },
            personnel_target_id: { type: 'string' },
            due_date: { type: 'string', format: 'date-time' },
            activity_project: { type: 'string' },
            activity_unit: { type: 'string' }
          },
          required: [
            'key',
            'name',
            'target',
            'unit',
            'year',
            'performance_management_plan_type_id',
            'owner',
            'performance_management_plan_program_id',
            'personnel_target_id',
            'due_date'
          ]
        }
      }
    },
    controller.createAssignProject.bind(controller)
  )

/* ----------  UPDATE ---------- */
  fastify.put<{ Params: { id: string }, Body: UpdateAssignProjectBody }>(
    '/:id',
    {
      preHandler: [fastify.authenticate],
      schema: {
        tags: ['assign-project'],
        description: 'Update existing assign project',
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
            description: { type: 'string' },
            year: { type: 'number' },
            performance_management_plan_type_id: { type: 'string' },
            owner: { type: 'string' },
            performance_management_plan_program_id: { type: 'string' },
            note: { type: 'string' },
            personnel_target_id: { type: 'array', items: { type: 'string' } },
            due_date: { type: 'string', format: 'date-time' },
            activity_project: { type: 'string' },
            activity_unit: { type: 'string' }
          }
        }
      }
    },
    controller.updateAssignProject.bind(controller)
  )

  /* ----------  READ LIST ---------- */
  fastify.get(
    '/',
    {
      preHandler: [fastify.authenticate],
      schema: {
        tags: ['assign-project'],
        description: 'Get all assign projects'
      }
    },
    controller.getAssignProjects.bind(controller)
  )

  /* ----------  READ DETAIL ---------- */
  fastify.get<{ Params: { id: string } }>(
    '/:id',
    {
      preHandler: [fastify.authenticate],
      schema: {
        tags: ['assign-project'],
        description: 'Get assign project detail',
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

  
 /* ---------- READ ASSIGN TABLE ---------- */
  fastify.get(
    "/assign-table",
    {
      preHandler: [fastify.authenticate],
      schema: {
        tags: ["assign-project"],
        description: "Get top 10 transaction table of assign projects",
        response: {
          200: {
            type: "array",
            items: {
              type: "object",
              properties: {
                status: { type: "string" },
                key: { type: "string" },
                project: { type: "string" },
                program: { type: "string" },
                information: { type: "string" },
                assign_to: { type: "string" },
                target: { type: "string" },
                unit: { type: "string" },
              },
            },
          },
        },
      },
    },
    controller.getAssignTable.bind(controller)
  )

  /* ---------- READ TREE DIVISION ---------- */
fastify.get(
  '/tree-division',
  {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['assign-project'],
      description: 'Get top 10 transaction table of assign projects',
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              status: { type: 'string' },
              project: { type: 'string' },
              program: { type: 'string' },
              target: { type: 'string' },
              note: { type: 'string' },
              realization: { type: ['string', 'number', 'null'] },
              realization_percentage: { type: ['number', 'null'] },
              due_date: { type: ['string', 'null'] },
              information: { type: 'string' },
              explanation: { type: 'string' },
            },
          },
        },
      },
    },
  },
  controller.getTreeDivision.bind(controller)
)

/* ---------- READ TREE PROGRAM---------- */
  fastify.get(
  "/tree-program",
  {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ["transactions"],
      description: "Get division and position from transactions",
      response: {
        200: {
          type: "array",
          items: {
            type: "object",
            properties: {
              division: { type: "string" },
              position: { type: "string" },
            },
          },
        },
      },
    },
  },
  controller.getTreeProgram.bind(controller)
)


/* ---------- READ TREE PROJECT ---------- */
fastify.get(
  "/tree-project",
  {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ["transactions"],
      description: "Get status, division, personnel name, and position from transactions",
      response: {
        200: {
          type: "array",
          items: {
            type: "object",
            properties: {
              status: { type: "string" },
              division: { type: "string" },
              personnel_name: { type: "string" },
              position: { type: "string" },
            },
          },
        },
      },
    },
  },
  controller.getTreeProject.bind(controller)
)

/* ---------- READ PROGRAMS ---------- */
fastify.get(
  "/programs",
  {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ["programs"],
      description: "Get programs, description, and number of personnel involved",
      response: {
        200: {
          type: "array",
          items: {
            type: "object",
            properties: {
              program: { type: "string" },
              description: { type: "string" },
              number_of_personnel_involved: { type: "number" },
            },
          },
        },
      },
    },
  },
  controller.getPrograms.bind(controller)
)

 /* ---------- READ KPI PROJECT TRANSACTIONS ---------- */
  fastify.get(
    "/kpi-projects",
    {
      preHandler: [fastify.authenticate],
      schema: {
        tags: ["transactions"],
        description: "Get list of KPI projects transactions",
        response: {
          200: {
            type: "array",
            items: {
              type: "object",
              properties: {
                status: { type: "string" },
                kpi_project: { type: "string" },
                assign_to: { type: "string" },
                directorate: { type: "string" },
                target: { type: "number" },
                realization: { type: "number" },
                due_date: { type: "string", format: "date-time" },
                information: { type: "string" },
              },
            },
          },
        },
      },
    },
    controller.getKPIProjects.bind(controller)
  )
}
export default assignProjectRoutes
