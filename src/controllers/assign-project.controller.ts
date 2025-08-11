import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { BaseController } from './base.controller'

/* ----------  DTO & Query Params ---------- */
export interface CreateAssignProjectBody {
  key: string
  name: string
  target: string
  unit: string
  description?: string
  created_by?: string
  year: number
  performance_management_plan_type_id: string
  owner: string
  performance_management_plan_program_id: string
  note?: string
  personnel_target_id: string
  due_date: string
  activity_project?: string
  activity_unit?: string
}


/* ----------  Controller Class ---------- */
export class AssignProjectController extends BaseController {
  constructor(fastify: FastifyInstance) {
    super(fastify)
  }

  /* ---- CREATE ---- */
  async createAssignProject(
    request: FastifyRequest<{ Body: CreateAssignProjectBody }>,
    reply: FastifyReply
  ) {
    try {
      const {
        key,
        name,
        target,
        unit,
        description,
        year,
        performance_management_plan_type_id,
        owner,
        performance_management_plan_program_id,
        note,
        personnel_target_id, // NPP target
        due_date,
        activity_project,
        activity_unit
      } = request.body

      // Ambil NPP user login dari auth middleware
      const loggedInNpp = request.user?.npp
      if (!loggedInNpp) {
        return reply.code(401).send({
          message: 'Tidak dapat menemukan NPP user yang login'
        })
      }

      const approval_status = 0
      const project_status = 'not_started'
      
      // Tentukan status proyek berdasarkan approval_status
      // const project_status = approval_status === 0 ? 'not_started' : 'on_progress'

      // Ambil data personnels target
      const targetPersonnel = await this.prisma.personnels.findUnique({
        where: { npp: personnel_target_id }
      })
      if (!targetPersonnel) {
        return reply.code(400).send({
          message: `Personnel target dengan NPP ${personnel_target_id} tidak ditemukan`
        })
      }

      // Ambil data personnels from berdasarkan NPP user login
      const fromPersonnel = await this.prisma.personnels.findUnique({
        where: { npp: loggedInNpp }
      })
      if (!fromPersonnel) {
        return reply.code(400).send({
          message: `Personnel from dengan NPP ${loggedInNpp} tidak ditemukan`
        })
      }

      // Transaksi prisma agar proses create project dan transaction atomik
      const result = await this.prisma.$transaction(async (tx) => {
        // 1. Buat project
        const project = await tx.performance_Management_Plan_Projects.create({
          data: {
            key,
            name,
            target,
            unit,
            approval_status,
            project_status,
            description,
            created_by: fromPersonnel.id, // user login sebagai pembuat
            year,
            performance_management_plan_type_id,
            owner,
            performance_management_plan_program_id,
            note
          }
        })

        // 2. Buat transaction terkait project yang baru dibuat
        const transaction = await tx.performance_Management_Plan_Transactions.create({
          data: {
            performance_management_project_id: project.id,
            performance_management_project_parent_id: project.id,
            approved_status: approval_status,
            realization: '',
            realization_status: 0,
            description: null,
            personnel_target_id: targetPersonnel.id,
            position_target_id: targetPersonnel.position_id ?? 0,
            position_from_id: fromPersonnel.position_id ?? 0,
            personnel_from_id: fromPersonnel.id,
            due_date: new Date(due_date),
            created_by: fromPersonnel.id,
            year,
            activity_project: activity_project ?? '',
            activity_target: '',
            activity_unit: activity_unit ?? '',
            boss_who_creating_an_activity: '',
            project_active_status: 'active',
            realization_active_status: 'inactive',
            performance_management_plan_program_id,
            realization_boss_who_create_an_activity_percentage: 0,
            realization_self_percentage: 0,
            note: note ?? null
          }
        })

        return { project, transaction }
      })

      return this.sendResponse(reply, result)
    } catch (error) {
      return this.handleError(error, reply, 'Failed to create assign project')
    }
  }
}
