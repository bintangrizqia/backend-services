import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { BaseController } from './base.controller'
import { FromType } from '@sinclair/typebox/build/cjs/type/module/compute'

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

/* ----------  DTO & Query Params ---------- */
export interface UpdateAssignProjectBody {
  key?: string
  name?: string
  target?: string
  unit?: string
  description?: string
  year?: number
  performance_management_plan_type_id?: string
  owner?: string
  performance_management_plan_program_id?: string
  note?: string
  personnel_target_id: string[]   // bisa lebih dari 1 NPP target
  due_date?: string
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

  /* ---- UPDATE ---- */
async updateAssignProject(
  request: FastifyRequest<{ Params: { id: string }, Body: UpdateAssignProjectBody }>,
  reply: FastifyReply
) {
  try {
    const { id } = request.params
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
      personnel_target_id, // array of NPP target
      due_date,
      activity_project,
      activity_unit
    } = request.body

    // Ambil NPP user login dari auth middleware
    const loggedInNpp = request.user?.npp
    if (!loggedInNpp) {
      return reply.code(401).send({ message: 'Tidak dapat menemukan NPP user yang login' })
    }

    // Ambil data personnels from (user login)
    const fromPersonnel = await this.prisma.personnels.findUnique({
      where: { npp: loggedInNpp }
    })
    if (!fromPersonnel) {
      return reply.code(400).send({ message: `Personnel from dengan NPP ${loggedInNpp} tidak ditemukan` })
    }

    // Ambil project lama (supaya field yg tidak diupdate tetap dipakai)
    const oldProject = await this.prisma.performance_Management_Plan_Projects.findUnique({
      where: { id }
    })
    if (!oldProject) {
      return reply.code(404).send({ message: `Project dengan id ${id} tidak ditemukan` })
    }

    // Validasi personnel_target_id (jika ada)
    let targetPersonnels: any[] = []
    if (personnel_target_id && Array.isArray(personnel_target_id) && personnel_target_id.length > 0) {
      targetPersonnels = await this.prisma.personnels.findMany({
        where: { npp: { in: personnel_target_id } }
      })
      if (targetPersonnels.length !== personnel_target_id.length) {
        return reply.code(400).send({ message: 'Beberapa personnel target tidak ditemukan' })
      }
    } else {
      // kalau tidak ada personnel_target_id baru → gunakan personnel target lama dari transaksi
      const oldTargets = await this.prisma.performance_Management_Plan_Transactions.findMany({
        where: { performance_management_project_id: id },
        select: { personnel_target_id: true, position_target_id: true }
      })
      if (oldTargets.length === 0) {
        return reply.code(400).send({ message: 'Project tidak memiliki personnel target sebelumnya' })
      }
      // Ambil data personnel lama
      targetPersonnels = await this.prisma.personnels.findMany({
        where: { id: { in: oldTargets.map(t => t.personnel_target_id) } }
      })
    }

    const approval_status = 0
    const project_status = 'not_started'

    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Update project (partial update)
      const project = await tx.performance_Management_Plan_Projects.update({
        where: { id },
        data: {
          ...(key !== undefined && { key }),
          ...(name !== undefined && { name }),
          ...(target !== undefined && { target }),
          ...(unit !== undefined && { unit }),
          ...(description !== undefined && { description }),
          ...(year !== undefined && { year }),
          ...(performance_management_plan_type_id !== undefined && { performance_management_plan_type_id }),
          ...(owner !== undefined && { owner }),
          ...(performance_management_plan_program_id !== undefined && { performance_management_plan_program_id }),
          ...(note !== undefined && { note }),
          ...(due_date ? { due_date: new Date(due_date) } : {}),
          approval_status,
          project_status
        }
      })

      // 2. Buat transaksi baru untuk setiap personnel target
      const transactions = []
      for (const target of targetPersonnels) {
        const trx = await tx.performance_Management_Plan_Transactions.create({
          data: {
            performance_management_project_id: project.id,
            performance_management_project_parent_id: project.id,
            approved_status: approval_status ?? '',
            realization: '',
            realization_status: 0,
            description: null,
            personnel_target_id: target.id ?? '',
            position_target_id: target.position_id ?? 0,
            position_from_id: fromPersonnel?.position_id ?? 0,
            personnel_from_id: fromPersonnel?.id ?? '',
            due_date: due_date ? new Date(due_date) : new Date(),
            created_by: fromPersonnel?.id ?? '',
            year: year ?? oldProject.year ?? new Date().getFullYear(),
            activity_project: activity_project ?? '',
            activity_target: '',
            activity_unit: activity_unit ?? '',
            boss_who_creating_an_activity: '',
            project_active_status: 'active',
            realization_active_status: 'inactive',
            performance_management_plan_program_id: performance_management_plan_program_id ?? oldProject.performance_management_plan_program_id ?? '',
            realization_boss_who_create_an_activity_percentage: 0,
            realization_self_percentage: 0,
            note: note ?? oldProject.note
          }
        })
        transactions.push(trx)
      }

      return { project, transactions }
    })

    return this.sendResponse(reply, result)
  } catch (error) {
    return this.handleError(error, reply, 'Failed to update assign project')
  }
}

/* ---- READ ---- */
async getAssignProjects(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const projects = await this.prisma.performance_Management_Plan_Projects.findMany({
      include: {
        performance_management_plan_transaction: {
          include: {
            personnel_target: true,
            personnel_from: true,
            position_target: true,
            position_from: true
          }
        }
      }
    })

    return this.sendResponse(reply, projects)
  } catch (error) {
    return this.handleError(error, reply, 'Failed to get assign projects')
  }
}

/* ---- READ BY ID ---- */
async getAssignProjectById(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  try {
    const { id } = request.params;

    const project = await this.prisma.performance_Management_Plan_Projects.findUnique({
      where: { id: id}, // pastikan id bertipe number sesuai database
      include: {
        performance_management_plan_transaction: {
          include: {
            personnel_target: true,
            personnel_from: true,
            position_target: true,
            position_from: true
          }
        }
      }
    });

    if (!project) {
      return reply.status(404).send({ message: 'Assign project not found' });
    }

    return this.sendResponse(reply, project);
  } catch (error) {
    return this.handleError(error, reply, 'Failed to get assign project by id');
  }
}


/* ---- READ ASSIGN TABEL ---- */
  async getAssignTable(req: FastifyRequest, reply: FastifyReply) {
    try {
      const transactions = await this.prisma.performance_Management_Plan_Transactions.findMany({
        take: 10, // ambil 10 data
        orderBy: { created_at: "desc" },
        include: {
          performance_management_project: true,
          personnel_target: true,
        },
      })

      const formatted = transactions.map((t) => ({
        status: this.mapStatus(t.approved_status),                  // Status
        key: t.performance_management_project?.key || "-",           // Key
        project: t.performance_management_project?.name || "-",      // Project
        program: t.performance_management_plan_program_id || "-",    // Program (sementara ID)
        information: t.description || "-",                           // Information
        assign_to: t.personnel_target?.name || "-",                  // Assign To
        target: t.activity_target || "-",                            // Target
        unit: t.activity_unit || "-",                                // Unit
      }))

      return this.sendResponse(reply, formatted)
    } catch (error) {
      return this.handleError(error, reply, "Failed to get transaction table")
    }
  }

  /* ---- READ TREE DIVISI ---- */
async getTreeDivision(req: FastifyRequest, reply: FastifyReply) {
  try {
    const transactions = await this.prisma.performance_Management_Plan_Transactions.findMany({
      take: 10, // hanya 10 data
      orderBy: {
        created_at: 'desc',
      },
      include: {
        performance_management_project: true,
        performance_management_project_parent: true,
        personnel_target: true,
        personnel_from: true,
        position_target: true,
        position_from: true,
      },
    });

    const formatted = transactions.map((t) => ({
      status: this.mapStatus(t.approved_status),                    // kolom Status
      project: t.performance_management_project?.name || "-",        // kolom Project
      program: t.performance_management_plan_program_id || "-",      // kolom Program (pakai ID karena belum ada relasi)
      target: t.activity_target || "-",                              // kolom Target
      note: t.note || "-",                                           // kolom Note
      realization: t.realization || "-",                             // kolom Realization
      realization_percentage: t.realization_self_percentage ?? 0,    // kolom Realization(%)
      due_date: t.due_date ? t.due_date.toISOString().split("T")[0] : "-", // kolom Due Date
      information: t.description || "-",                             // kolom Information
      explanation: t.activity_unit || "-",                           // kolom Explanation
    }));

    return this.sendResponse(reply, formatted);
  } catch (error) {
    return this.handleError(error, reply, 'Failed to get transaction table');
  }
}

// Helper untuk mapping status
private mapStatus(status: number | null): string {
  switch (status) {
    case 0: return "Not Started";
    case 1: return "On Track";
    case 2: return "Completed";
    default: return "-";
  }
}


/* ---------- READ TREE PROGRAM ---------- */
  async getTreeProgram(req: FastifyRequest, reply: FastifyReply) {
  try {
    const transactions = await this.prisma.performance_Management_Plan_Transactions.findMany({
      take: 10, // misal ambil 10 data terbaru
      orderBy: { created_at: "desc" },
      include: {
        position_target: {
          include: {
            unit: true, // ambil division dari unit
          },
        },
      },
    })

    const formatted = transactions.map((t) => ({
      division: t.position_target?.unit?.name || "-",
      position: t.position_target?.name || "-",
    }))

    return this.sendResponse(reply, formatted)
  } catch (error) {
    return this.handleError(error, reply, "Failed to get division and position")
  }
}


/* ---------- READ TREE PROJECT ---------- */
async getTreeProject(req: FastifyRequest, reply: FastifyReply) {
  try {
    const transactions = await this.prisma.performance_Management_Plan_Transactions.findMany({
      take: 10, // contoh limit
      orderBy: { created_at: "desc" },
      include: {
        personnel_target: true,
        position_target: {
          include: { unit: true },
        },
      },
    })

    const formatted = transactions.map((t) => ({
      status: this.mapStatus(t.approved_status),  // atau bisa pakai realization_status tergantung kebutuhan
      division: t.position_target?.unit?.name || "-",
      personnel_name: t.personnel_target?.name || "-",
      position: t.position_target?.name || "-",
    }))
    return this.sendResponse(reply, formatted)
  } catch (error) {
    return this.handleError(error, reply, "Failed to get data (status, division, personnel, position)")
  }
}

async getPrograms(req: FastifyRequest, reply: FastifyReply) {
  try {
    const programs = await this.prisma.performance_Management_Plan_Projects.findMany({
      take: 10,
      orderBy: { created_at: "desc" },
      include: {
        _count: {
          select: { performance_management_plan_transaction: true }, // hitung personel yg terlibat
        },
      },
    })

    const formatted = programs.map((p) => ({
      program: p.name,                       // nama program / project
      description: p.description || "-",      // deskripsi
      number_of_personnel_involved: p._count.performance_management_plan_transaction, // jumlah
    }))

    return this.sendResponse(reply, formatted)
  } catch (error) {
    return this.handleError(error, reply, "Failed to get programs data")
  }
}

/* ----------  GET LIST PROJECT TRANSACTIONS ---------- */
  async getKPIProjects(request: FastifyRequest, reply: FastifyReply) {
    try {
      const transactions = await this.prisma.performance_Management_Plan_Transactions.findMany({
        include: {
          performance_management_project: true, // ambil data project
          personnel_target: {
            include: {
              unit: true,       // ambil division
              position: true,   // ambil jabatan
            },
          },
        },
      })

      const result = transactions.map((t) => ({
        status: this.mapStatus(t.approved_status), // status project
        kpi_project: t.performance_management_project?.name || "-", // KPI / Project
        assign_to: t.personnel_target?.name || "-", // personnel
        directorate: t.personnel_target?.unit?.name || "-", // unit / division
        target: t.activity_target, // target dari skema
        realization: t.realization, // realisasi
        due_date: t.due_date, // deadline
        information: t.description || "-", // keterangan tambahan
      }))

      return reply.send(result)
    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({ message: 'Error fetching assign projects' })
    }
  }

}
