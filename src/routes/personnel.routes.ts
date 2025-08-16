import { FastifyPluginAsync } from 'fastify'
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import { PersonnelController } from '../controllers/personnel.controller'
import { CreatePersonnelBody, UpdatePersonnelBody } from '../controllers/personnel.controller';

import { Resource, Permission } from '@prisma/client'

const personnelRoutes: FastifyPluginAsync = async (fastify) => {
  const server = fastify.withTypeProvider<TypeBoxTypeProvider>()
  const personnelController = new PersonnelController(fastify)

  // Authentication hook
  server.addHook('onRequest', fastify.authenticate)
  
  // Get all personnel
  interface GetPersonnelQuery {
    page?: number;
    limit?: number;
    search?: string;
  }

  // ====================== CREATE PERSONNEL ======================
  server.post<{
    Body: CreatePersonnelBody
  }>('/', {
    preHandler: async (request, reply) => {
      if (request.user?.is_superuser) {
        fastify.log.info(`Superuser ${request.user.npp} creating personnel, bypass permission check`);
        return;
      }
      await new Promise<void>((resolve, reject) => {
        fastify.checkPermission(Resource.PERSONNEL, Permission.CAN_CREATE_PERSONNEL)(request, reply, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    },
    schema: {
      tags: ['personnels'],
      description: 'Menambahkan data personel baru',
      security: [{ bearerAuth: [] }],
      body: Type.Object({
        npp: Type.String(),
        name: Type.String(),
        unit_id: Type.Number(), // FIXED: Changed to Number
        position_id: Type.Number(),
        email: Type.Optional(Type.String()),
        eselon: Type.Optional(Type.Number()), // FIXED: Made optional
        photo: Type.Optional(Type.String())
      }),
      response: {
        201: Type.Object({
          message: Type.String(),
          data: Type.Object({
            npp: Type.String(),
            name: Type.String(),
            email: Type.Union([Type.String(), Type.Null()]),
            unit_id: Type.Number(), // FIXED: Changed to Number
            position_id: Type.Number(),
            eselon: Type.Union([Type.Number(), Type.Null()]),
            photo: Type.Union([Type.String(), Type.Null()]),
            created_at: Type.String(),
            updated_at: Type.String()
          })
        })
      }
    }
  }, personnelController.createPersonnel.bind(personnelController));

  // ====================== GET PERSONNEL BY ID ======================
  server.get<{
    Params: { npp: string }
  }>('/:npp', {
    preHandler: async (request, reply) => {
      if (request.user?.is_superuser) return;
      await new Promise<void>((resolve, reject) => {
        fastify.checkPermission(Resource.PERSONNEL, Permission.CAN_READ_PERSONNEL)(request, reply, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    },
    schema: {
      tags: ['personnels'],
      description: 'Mendapatkan detail personel berdasarkan NPP',
      security: [{ bearerAuth: [] }],
      params: Type.Object({
        npp: Type.String()
      }),
      response: {
        200: Type.Object({
          npp: Type.String(),
          name: Type.String(),
          email: Type.Union([Type.String(), Type.Null()]),
          eselon: Type.Union([Type.Number(), Type.Null()]),
          unit: Type.Object({
            id: Type.Number(), // FIXED: Should be Number based on your schema
            name: Type.String(),
            position_type: Type.String(),
            created_at: Type.String()
          }),
          position: Type.Object({
            id: Type.Number(),
            name: Type.String(),
            type_position: Type.Object({
              id: Type.Number(),
              name_f: Type.String(),
              name_s: Type.String(),
              eselon: Type.Number(),
              level_type_position: Type.String(),
              description: Type.String(),
              created_at: Type.String()
            })
          }),
          photo: Type.Union([Type.String(), Type.Null()]),
          created_at: Type.String(),
          updated_at: Type.String()
        })
      }
    }
  }, personnelController.getPersonnelById.bind(personnelController));

  // ====================== UPDATE PERSONNEL ======================
  server.put<{
    Params: { npp: string },
    Body: UpdatePersonnelBody
  }>('/:npp', {
    preHandler: async (request, reply) => {
      if (request.user?.is_superuser) return;
      await new Promise<void>((resolve, reject) => {
        fastify.checkPermission(Resource.PERSONNEL, Permission.CAN_UPDATE_PERSONNEL)(request, reply, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    },
    schema: {
      tags: ['personnels'],
      description: 'Memperbarui data personel',
      security: [{ bearerAuth: [] }],
      params: Type.Object({
        npp: Type.String()
      }),
      body: Type.Object({
        name: Type.Optional(Type.String()),
        email: Type.Optional(Type.String()),
        unit_id: Type.Optional(Type.Number()), // FIXED: Changed to Number
        position_id: Type.Optional(Type.Number()),
        eselon: Type.Optional(Type.Number()), // FIXED: Added eselon field
        photo: Type.Optional(Type.String())
      }),
      response: {
        200: Type.Object({
          message: Type.String(),
          data: Type.Object({
            npp: Type.String(),
            name: Type.String(),
            email: Type.Union([Type.String(), Type.Null()]),
            unit_id: Type.Number(), // FIXED: Changed to Number
            position_id: Type.Number(),
            eselon: Type.Union([Type.Number(), Type.Null()]), // FIXED: Added eselon
            photo: Type.Union([Type.String(), Type.Null()]),
            created_at: Type.String(),
            updated_at: Type.String()
          })
        })
      }
    }
  }, personnelController.updatePersonnel.bind(personnelController));

  // ====================== DELETE PERSONNEL ======================
  server.delete<{
    Params: { npp: string }
  }>('/:npp', {
    preHandler: async (request, reply) => {
      if (request.user?.is_superuser) return;
      await new Promise<void>((resolve, reject) => {
        fastify.checkPermission(Resource.PERSONNEL, Permission.CAN_DELETE_PERSONNEL)(request, reply, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    },
    schema: {
      tags: ['personnels'],
      description: 'Menghapus data personel berdasarkan NPP',
      security: [{ bearerAuth: [] }],
      params: Type.Object({
        npp: Type.String()
      }),
      response: {
        200: Type.Object({
          message: Type.String()
        })
      }
    }
  }, personnelController.deletePersonnel.bind(personnelController));

  // ====================== GET PERSONNEL OPTIONS ======================
  server.get<{
    Querystring: {
      eselon?: string;
    };
  }>('/options', {
    preHandler: async (request, reply) => {
      if (request.user?.is_superuser) return;
      await new Promise<void>((resolve, reject) => {
        fastify.checkPermission(Resource.PERSONNEL, Permission.CAN_READ_PERSONNEL)(request, reply, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    },
    schema: {
      tags: ['personnels'],
      description: 'Mengambil daftar personel (opsi) berdasarkan filter eselon (opsional)',
      security: [{ bearerAuth: [] }],
      querystring: Type.Object({
        eselon: Type.Optional(Type.String({ description: 'Daftar eselon, bisa dipisahkan koma (contoh: "2,3,4")' }))
      }),
      response: {
        200: Type.Object({
          data: Type.Array(
            Type.Object({
              npp: Type.String(),
              name: Type.String()
            })
          )
        })
      }
    }
  }, personnelController.getPersonnelOptions.bind(personnelController));

  // ====================== GET ALL PERSONNEL ======================  
  server.get<{
    Querystring: GetPersonnelQuery
  }>('/', {
    preHandler: async (request, reply) => {
      if (request.user && request.user.is_superuser === true) {
        fastify.log.info(`Superuser ${request.user.npp} accessing personnel list, bypassing permission check`);
        return;
      }
      
      await new Promise<void>((resolve, reject) => {
        fastify.checkPermission(Resource.PERSONNEL, Permission.CAN_READ_PERSONNEL)(request, reply, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    },
    schema: {
      tags: ['personnels'],
      description: 'Mendapatkan daftar semua personel',
      security: [{ bearerAuth: [] }],
      querystring: Type.Object({
        page: Type.Optional(Type.Number({ minimum: 1 })),
        limit: Type.Optional(Type.Number({ minimum: 1, maximum: 100 })),
        search: Type.Optional(Type.String())
      }),
      response: {
        200: Type.Object({
          data: Type.Array(
            Type.Object({
              npp: Type.String(),
              name: Type.String(),
              email: Type.Union([Type.String(), Type.Null()]),
              eselon: Type.Union([Type.Number(), Type.Null()]),
              unit: Type.Object({
                id: Type.Number(), // FIXED: Changed to Number
                name: Type.String(),
                position_type: Type.String(),
                created_at: Type.String()
              }),
              position: Type.Object({
                id: Type.Number(),
                name: Type.String(),
                type_position: Type.Object({
                  id: Type.Number(),
                  name_f: Type.String(),
                  name_s: Type.String(),
                  eselon: Type.Number(),
                  level_type_position: Type.String(),
                  description: Type.String(),
                  created_at: Type.String()
                })
              }),
              photo: Type.Union([Type.String(), Type.Null()]),
              created_at: Type.String(),
              updated_at: Type.String(),
            })
          ),
          meta: Type.Object({
            page: Type.Number(),
            limit: Type.Number(),
            totalCount: Type.Number(),
            totalPages: Type.Number()
          })
        })
      }
    }
  }, personnelController.getAllPersonnel.bind(personnelController))


//   interface GetPersonnelOptionsQuery {
//   eselon?: string
// }

// server.get<{ Querystring: GetPersonnelOptionsQuery }>('/options', {
//   preHandler: async (request, reply) => {
//     if (request.user?.is_superuser) return

//     await new Promise<void>((resolve, reject) => {
//       fastify.checkPermission(Resource.PERSONNEL, Permission.CAN_READ_PERSONNEL)(
//         request, reply, (err) => (err ? reject(err) : resolve())
//       )
//     })
//   },
//   schema: {
//     tags: ['personnel'],
//     description: 'Get list of personnel (npp and name only)',
//     security: [{ bearerAuth: [] }],
//     querystring: Type.Object({
//       eselon: Type.Optional(Type.String())
//     }),
//     response: {
//       200: Type.Object({
//         data: Type.Array(
//           Type.Object({
//             npp: Type.String(),
//             name: Type.String()
//           })
//         )
//       })
//     }
//   }
// }, personnelController.getPersonnelOptions.bind(personnelController))


//   // Get personnel by ID
//   interface GetPersonnelParams {
//     npp: string;
//   }

//   server.get<{
//     Params: GetPersonnelParams
//   }>('/:npp', {
//       // Modifikasi hook untuk membiarkan superuser lewat
//       preHandler: async (request, reply) => {
//         // Superuser bypass checks
//         if (request.user && request.user.is_superuser === true) {
//           fastify.log.info(`Superuser ${request.user.npp} accessing personnel list, bypassing permission check`);
//           return;
//         }
        
//         // Regular users go through permission check
//         await new Promise<void>((resolve, reject) => {
//           fastify.checkPermission(Resource.PERSONNEL, Permission.CAN_READ_PERSONNEL)(request, reply, (err) => {
//             if (err) reject(err);
//             else resolve();
//           });
//         });
//       },
//     schema: {
//       tags: ['personnels'],
//       description: 'Mendapatkan personel berdasarkan NPP',
//       security: [{ bearerAuth: [] }],
//       params: Type.Object({
//         npp: Type.String()
//       }),
//       response: {
//         200: Type.Object({
//           npp: Type.String(),
//           name: Type.String(),
//           email: Type.Union([Type.String(), Type.Null()]),
//           unit: Type.Object({
//             id: Type.String(),
//             name: Type.String(),
//             position_type: Type.String(),
//             created_at: Type.String()
//           }),
//           position: Type.Object({
//             id: Type.Number(),
//             name: Type.String(),
//             type_position: Type.Object({
//               id: Type.Number(),
//               name_f: Type.String(),
//               name_s: Type.String(),
//               eselon: Type.Number(),
//               level_type_position: Type.String(),
//               description: Type.String(),
//               created_at: Type.String()
//             })
//           }),
//           photo: Type.Union([Type.String(), Type.Null()]),
//           created_at: Type.String(),
//           updated_at: Type.String(),
//         })
//       },
//     }
//   }, personnelController.getPersonnelById.bind(personnelController))
// }



}
export default personnelRoutes