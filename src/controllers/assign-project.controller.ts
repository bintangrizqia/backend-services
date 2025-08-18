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
  personnel_target_id?: string[]   // bisa lebih dari 1 NPP target
  due_date?: string
  activity_project?: string
  activity_unit?: string
  realization_boss_who_create_an_activity_percentage?: number
  realization_self_percentage?: number
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

    // 🔹 Cek apakah KEY sudah ada
    const existingProject = await this.prisma.performance_Management_Plan_Projects.findFirst({
      where: { key }
    })
    if (existingProject) {
      return reply.code(400).send({
        message: `KEY "${key}" sudah digunakan, silakan gunakan KEY lain`
      })
    }

    // 🔹 Cari project_status berdasarkan StatusRealisasi (approval_status = 0)
    const statusRealisasi = await this.prisma.statusRealisasi.findFirst({
      where: { keterangan: 'Not Started' },
      select: { nama_status_realisasi: true }
    })
    const project_status = statusRealisasi?.nama_status_realisasi || 'Not Started'

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
          created_by: fromPersonnel.id,
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


/* ---------- UPDATE CONTROLLER ---------- */
async updateAssignProject(
  request: FastifyRequest<{ Params: { id: string }, Body: UpdateAssignProjectBody }>,
  reply: FastifyReply
) {
  try {
    const { id } = request.params;
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
      personnel_target_id,
      due_date,
      activity_project,
      activity_unit,
      realization_boss_who_create_an_activity_percentage,
      realization_self_percentage
    } = request.body;

    // ------- Helpers untuk status (pakai ID dari tabel StatusRealisasi) -------
    const getApprovalStatus = (total: number) => {
      if (total === 100) return 7; // Completed
      if (total >= 75)  return 9;  // Almost Completed
      if (total >= 50)  return 8;  // In Progress
      if (total >= 25)  return 4;  // On Track
      return 5;                    // Not Started (ID di tabelmu)
    };

    const loggedInNpp = request.user?.npp;
    if (!loggedInNpp) return reply.code(401).send({ message: 'Tidak dapat menemukan NPP user yang login' });

    const fromPersonnel = await this.prisma.personnels.findUnique({ where: { npp: loggedInNpp } });
    if (!fromPersonnel) return reply.code(400).send({ message: `Personnel from dengan NPP ${loggedInNpp} tidak ditemukan` });

    const oldProject = await this.prisma.performance_Management_Plan_Projects.findUnique({ where: { id } });
    if (!oldProject) return reply.code(404).send({ message: `Project dengan id ${id} tidak ditemukan` });

    // Validasi personnel_target_id -> ambil daftar target yang akan diupdate
    let targetPersonnels: any[] = [];
    if (personnel_target_id && personnel_target_id.length > 0) {
      targetPersonnels = await this.prisma.personnels.findMany({ where: { npp: { in: personnel_target_id } } });
      if (targetPersonnels.length !== personnel_target_id.length)
        return reply.code(400).send({ message: 'Beberapa personnel target tidak ditemukan' });
    } else {

      const oldTargets = await this.prisma.performance_Management_Plan_Transactions.findMany({
        where: { performance_management_project_id: id },
        select: { personnel_target_id: true }
      });
      if (oldTargets.length === 0) {
        return reply.code(400).send({ message: 'Project tidak memiliki personnel target sebelumnya' });
      }

      targetPersonnels = await this.prisma.personnels.findMany({
        where: { id: { in: oldTargets.map(t => t.personnel_target_id) } }
      });
    }

    // ------- VALIDASI: cegah total > 100 sebelum transaksi dijalankan -------
    const addBoss = realization_boss_who_create_an_activity_percentage ?? 0;
    const addSelf = realization_self_percentage ?? 0;

    if (addBoss < 0 || addSelf < 0) {
      return reply.code(400).send({
        message: 'Persentase yang ditambahkan tidak boleh negatif'
      });
    }

    const previewTargets = targetPersonnels.length > 0 ? targetPersonnels : [fromPersonnel];
    const errors: Array<any> = [];

    for (const target of previewTargets) {
      const existingTrx = await this.prisma.performance_Management_Plan_Transactions.findFirst({
        where: {
          performance_management_project_id: id,
          personnel_target_id: target.id
        }
      });

      const currentBoss = existingTrx?.realization_boss_who_create_an_activity_percentage ?? 0;
      const currentSelf = existingTrx?.realization_self_percentage ?? 0;
      const currentTotal = currentBoss + currentSelf;

      // Jika sudah 100, tolak penambahan
      if (currentTotal === 100 && (addBoss > 0 || addSelf > 0)) {
        errors.push({
          personnel_target_id: target.id,
          reason: 'Progres sudah 100% (Completed). Tidak bisa menambah lagi.'
        });
        continue;
      }

      // Jika transaksi baru, pastikan addBoss + addSelf <= 100
      if (!existingTrx) {
        if (addBoss + addSelf > 100) {
          errors.push({
            personnel_target_id: target.id,
            reason: `Total penambahan (${addBoss + addSelf}%) melebihi 100%. Maksimal 100%.`
          });
        }
        continue;
      }

      // Jika existing, pastikan current + tambahan <= 100
      const attempted = currentTotal + addBoss + addSelf;
      if (attempted > 100) {
        errors.push({
          personnel_target_id: target.id,
          reason: `Total progres akan menjadi ${attempted}%, melebihi 100%. Sisa kuota yang boleh ditambahkan: ${Math.max(0, 100 - currentTotal)}%.`,
          current_total: currentTotal,
          attempted_add: addBoss + addSelf
        });
      }
    }

    if (errors.length > 0) {
      return reply.code(400).send({
        message: 'Total progres tidak boleh melebihi 100%. Silakan sesuaikan penambahan.',
        details: errors
      });
    }

    /** ---------- Transaction untuk update project & create transaksi ---------- */
    const result = await this.prisma.$transaction(async (tx) => {
      // 1) Update meta project
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
          ...(due_date ? { due_date: new Date(due_date) } : {})
        }
      });

      // 2) Buat atau update transaksi (setelah lolos validasi)
      const transactions = [];
      const personnelsToAssign = previewTargets;
      let maxCombinedUpdatedThisRequest = 0;

      for (const target of personnelsToAssign) {
        const existingTrx = await tx.performance_Management_Plan_Transactions.findFirst({
          where: {
            performance_management_project_id: project.id,
            personnel_target_id: target.id
          }
        });

        let trx;
        if (existingTrx) {
          const newBoss = Math.min(
            (existingTrx.realization_boss_who_create_an_activity_percentage ?? 0) + addBoss,
            100
          );
          const newSelf = Math.min(
            (existingTrx.realization_self_percentage ?? 0) + addSelf,
            100
          );
          const combined = Math.min(newBoss + newSelf, 100);
          const trxApproval = getApprovalStatus(combined);

          trx = await tx.performance_Management_Plan_Transactions.update({
            where: { id: existingTrx.id },
            data: {
              realization_boss_who_create_an_activity_percentage: newBoss,
              realization_self_percentage: newSelf,
              approved_status: trxApproval,
              ...(note !== undefined && { note }),
              due_date: due_date ? new Date(due_date) : existingTrx.due_date,
              activity_project: activity_project ?? existingTrx.activity_project,
              activity_unit: activity_unit ?? existingTrx.activity_unit,
            },
          });

          maxCombinedUpdatedThisRequest = Math.max(maxCombinedUpdatedThisRequest, combined);
        } else {
          const initBoss = Math.min(addBoss, 100);
          const initSelf = Math.min(addSelf, 100);
          const combined = Math.min(initBoss + initSelf, 100);
          const trxApproval = getApprovalStatus(combined);

          trx = await tx.performance_Management_Plan_Transactions.create({
            data: {
              performance_management_project_id: project.id,
              performance_management_project_parent_id: project.id,
              approved_status: trxApproval,
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
              performance_management_plan_program_id:
                performance_management_plan_program_id ?? oldProject.performance_management_plan_program_id ?? '',
              realization_boss_who_create_an_activity_percentage: initBoss,
              realization_self_percentage: initSelf,
              note: note ?? oldProject.note
            }
          });

          maxCombinedUpdatedThisRequest = Math.max(maxCombinedUpdatedThisRequest, combined);
        }

        transactions.push(trx);
      }

      // 3) Tentukan status PROJECT dari progress yang DITAMBAHKAN pada request ini
      const approval_status = getApprovalStatus(maxCombinedUpdatedThisRequest);

      // 4) Ambil nama status dari tabel StatusRealisasi (berdasarkan ID di atas)
      const statusRow = await tx.statusRealisasi.findUnique({
        where: { id: approval_status },
        select: { nama_status_realisasi: true }
      });
      const project_status = statusRow?.nama_status_realisasi ?? 'Not Started';

      // 5) Update project dengan status final
      const updatedProject = await tx.performance_Management_Plan_Projects.update({
        where: { id: project.id },
        data: {
          approval_status,
          project_status
        }
      });

      return { project: updatedProject, transactions };
    });

    return this.sendResponse(reply, result);

  } catch (error) {
    return this.handleError(error, reply, 'Failed to update assign project');
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
      where: { id: id },
      include: {
        performance_management_plan_transaction: {
          include: {
            personnel_target: true,
            personnel_from: true,
            position_target: true,
            position_from: true,
          },
        },
      },
    });

    if (!project) {
      return reply.status(404).send({ message: "Assign project not found" });
    }

    return this.sendResponse(reply, project);
  } catch (error) {
    return this.handleError(error, reply, "Failed to get assign project by id");
  }
}



/* ---- READ ASSIGN TABEL ---- */
async getAssignTable(req: FastifyRequest, reply: FastifyReply) {
  try {
    const transactions =
      await this.prisma.performance_Management_Plan_Transactions.findMany({
        include: {
          performance_management_project: true,
          personnel_target: true,
        },
      });

    const formatted = transactions.map((t) => ({
      status:
        t.performance_management_project?.project_status ??
        t.approved_status ??
        "-",                                                              // langsung pakai status dari project
      key: t.performance_management_project?.key || "-",                  // Key
      project: t.performance_management_project?.name || "-",             // Project
      program: t.performance_management_plan_program_id || "-",           // Program (sementara ID)
      information: t.description || "-",                                  // Information
      assign_to: t.personnel_target?.name || "-",                         // Assign To
      target: t.activity_target || "-",                                   // Target
      unit: t.activity_unit || "-",                                       // Unit
    }));

    return this.sendResponse(reply, formatted);
  } catch (error) {
    return this.handleError(error, reply, "Failed to get transaction table");
  }
}



  /* ---- READ TREE DIVISI ---- */
async getTreeDivision(req: FastifyRequest, reply: FastifyReply) {
  try {
    const transactions = await this.prisma.performance_Management_Plan_Transactions.findMany({

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

    // simpan transaksi terbaru per program_id + project_id
    const latestMap = new Map<string, typeof transactions[0]>();

    for (const t of transactions) {
      const key = `${t.performance_management_plan_program_id}-${t.performance_management_project_id}`;
      if (!latestMap.has(key)) {
        latestMap.set(key, t); // karena sudah sorted desc, otomatis yg pertama = terbaru
      }
    }

    const uniqueTransactions = Array.from(latestMap.values());

    const formatted = uniqueTransactions.map((t) => ({
      status:
        t.performance_management_project?.project_status ??
        t.approved_status ??
        "-",                                                              // langsung ambil status asli
      project: t.performance_management_project?.name || "-",             // kolom Project
      program: t.performance_management_plan_program_id || "-",           // kolom Program
      target: t.activity_target || "-",                                   // kolom Target
      note: t.note || "-",                                                // kolom Note
      realization: t.realization || "-",                                  // kolom Realization
      realization_percentage:
        (t.realization_self_percentage ?? 0) +
        (t.realization_boss_who_create_an_activity_percentage ?? 0),      // gabungan dua kolom
      due_date: t.due_date ? t.due_date.toISOString().split("T")[0] : "-",// kolom Due Date
      information: t.description || "-",                                  // kolom Information
      explanation: t.activity_unit || "-",                                // kolom Explanation
    }));

    return this.sendResponse(reply, formatted);
  } catch (error) {
    return this.handleError(error, reply, 'Failed to get transaction table');
  }
}




/* ---------- READ TREE PROGRAM ---------- */
  async getTreeProgram(req: FastifyRequest, reply: FastifyReply) {
  try {
    const transactions = await this.prisma.performance_Management_Plan_Transactions.findMany({

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

      include: {
        personnel_target: true,
        position_target: {
          include: { unit: true },
        },
        performance_management_project: true,
      },
    });

    const formatted = transactions.map((t) => ({
      status:
        t.performance_management_project?.project_status ??
        t.approved_status ??
        "-",
      division: t.position_target?.unit?.name || "-",
      personnel_name: t.personnel_target?.name || "-",
      position: t.position_target?.name || "-",
    }));

    return this.sendResponse(reply, formatted);
  } catch (error) {
    return this.handleError(error, reply, "Failed to get data (status, division, personnel, position)");
  }
}



/* ----------  GET LIST PROJECT TRANSACTIONS ---------- */
async getKPIProjects(req: FastifyRequest, reply: FastifyReply) {
  try {
    const transactions =
      await this.prisma.performance_Management_Plan_Transactions.findMany({
        orderBy: { created_at: "desc" },
        include: {
          personnel_target: true,
          position_target: {
            include: { unit: true },
          },
          performance_management_project: true,
        },
      });

    const formatted = transactions.map((t) => ({
      status:
        t.performance_management_project?.project_status ??
        t.approved_status ??
        "-",
      kpi_project: t.performance_management_project?.name || "-",
      assign_to: t.personnel_target?.name || "-",
      directorate: t.position_target?.unit?.name || "-",
      target: t.activity_target ?? 0,
      realization: t.realization ?? 0,
      due_date: t.due_date
        ? t.due_date.toISOString().split("T")[0]
        : "-",
      information: t.description || "-",
    }));

    return this.sendResponse(reply, formatted);
  } catch (error) {
    return this.handleError(error, reply, "Failed to get KPI projects transactions");
  }
}

}
