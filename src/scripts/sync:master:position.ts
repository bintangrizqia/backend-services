import HRISDBPool from '../utils/hris/connectdb'
import DB from '../utils/local/connectdb'
import pLimit from 'p-limit'

const limit = pLimit(5)

/**
 * Fetches position data from HRIS database and synchronizes it with the local database.
 * This function performs an upsert operation for each position record.
 * 
 * The function queries the following fields from master_jabatan:
 * - kode_jabatan (used as external_id)
 * - nama_jabatan (used as name)
 * - id_type_jabatan
 * - kode_unit (used as unit_id)
 * 
 * @async
 * @returns {Promise<void>}
 */
async function fetchPosition() {
    const query = `SELECT kode_jabatan, nama_jabatan, id_type_jabatan, kode_unit, status_aktif_jabatan FROM master_jabatan`
    const results = await HRISDBPool.query(query)

    const positionUpserts = results.rows.map((row) =>
        limit(() =>
            DB.positions.upsert({
                where: { id: row.kode_jabatan },
                create: {
                    id: row.kode_jabatan,
                    name: row.nama_jabatan,
                    unit_id: row.kode_unit || undefined,
                    active: row.status_aktif_jabatan === 1,
                    type_position_id: row.id_type_jabatan || undefined
                },
                update: {
                    name: row.nama_jabatan,
                    unit_id: row.kode_unit || undefined,
                    active: row.status_aktif_jabatan === 1,
                    type_position_id: row.id_type_jabatan || undefined
                },
            })
        )
    )

    await Promise.all(positionUpserts)
}

;(async () => {
    await fetchPosition().then(() => process.exit(0))
})()
