import HRISDBPool from '../utils/hris/connectdb'
import DB from '../utils/local/connectdb'
import pLimit from 'p-limit'
import bcrypt from 'bcrypt'

const limit = pLimit(3)

async function fetchMasterTypePosition() {
    const query = `
        SELECT id_type_jabatan, nama_type_jabatan_s, nama_type_jabatan_f, 
               kode_eselon, level_type_jabatan, actived, keterangan 
        FROM master_type_jabatan`
    const results = await HRISDBPool.query(query)

    const masterTypePositionPromises = results.rows.map((row) =>
        limit(() =>
            DB.masterTypePositions.upsert({
                where: {
                    id: row.id_type_jabatan
                },
                create: {
                    id: row.id_type_jabatan,
                    name_s: row.nama_type_jabatan_s,
                    name_f: row.nama_type_jabatan_f,
                    eselon: parseInt(row.kode_eselon),
                    level_type_position: row.level_type_jabatan,
                    active: row.actived === 1,
                    description: row.keterangan || undefined
                },
                update: {
                    name_s: row.nama_type_jabatan_s,
                    name_f: row.nama_type_jabatan_f,
                    eselon: parseInt(row.kode_eselon),
                    level_type_position: row.level_type_jabatan,
                    active: row.actived === 1,
                    description: row.keterangan || undefined
                }
            })
        )
    )

    await Promise.all(masterTypePositionPromises)
}

;(async () => {
    await fetchMasterTypePosition().then(() => process.exit(0))
})()
