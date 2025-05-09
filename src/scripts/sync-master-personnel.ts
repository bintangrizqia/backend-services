import HRISDBPool from '../utils/hris/connectdb'
import DB from '../utils/local/connectdb'
import bcrypt from 'bcrypt'
import pLimit from 'p-limit'

const limit = pLimit(100)

async function fetchPersonnels() {
    const query = `
        SELECT npp, nama_lengkap, kode_unit, kode_jabatan, 
               email_intranet, kode_eselon, kode_jenis_jabatan
        FROM master_personil`
    const results = await HRISDBPool.query(query)
    const salt = await bcrypt.genSalt(10)

    const personnels = results.rows.map((row) =>
        limit(async () =>
            DB.personnels.upsert({
                where: {
                    npp: row.npp
                },
                create: {
                    npp: row.npp,
                    name: row.nama_lengkap,
                    position_id: row.kode_jabatan === -1 ? null : row.kode_jabatan,
                    eselon: parseInt(row.kode_eselon) || -1,
                    password: await bcrypt.hash('initial01!', salt),
                    unit_id: row.kode_unit || undefined,
                    email: row.email_intranet,
                    position_type: row.kode_jenis_jabatan
                    
                },
                update: {
                    name: row.nama_lengkap,
                    position_id: row.kode_jabatan === -1 ? null : row.kode_jabatan,
                    eselon: parseInt(row.kode_eselon) || -1,
                    unit_id: row.kode_unit || undefined,
                    email: row.email_intranet,
                    position_type: row.kode_jenis_jabatan
                }
            }).catch((error) => {
                throw error
            })
        )
    )

    await Promise.all(personnels)
}


fetchPersonnels().then(() => process.exit(0))
