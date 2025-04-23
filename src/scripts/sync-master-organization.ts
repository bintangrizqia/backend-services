import HRISDBPool from '../utils/hris/connectdb'
import DB from '../utils/local/connectdb'
import bcrypt from 'bcrypt'
import pLimit from 'p-limit'

const limit = pLimit(3)

/**
 * Fetches organizations from HRIS database and synchronizes them with the local database.
 * This function performs an upsert operation for each organization based on their external ID.
 * 
 * The function queries the following fields from master_unit table:
 * - kode_unit (used as external_id)
 * - id_type_unit (used as type_unit_organization_id)
 * - nama_unit (used as name)
 * - parent_unit (used as parent_id)
 * - status_aktif_unit (used as active status)
 * 
 * @async
 * @returns {Promise<void>}
 * @throws {Error} If database connection or query fails
 */
async function fetchOrganizations() {
    const query = `
        SELECT kode_unit, id_type_unit, nama_unit, parent_unit, status_aktif_unit 
        FROM master_unit`
    const results = await HRISDBPool.query(query)

    // First pass: Create all units without parent relationships
    const unitCreationPromises = results.rows.map((row) =>
        limit(() =>
            DB.units.upsert({
                where: { id: row.kode_unit },
                update: {
                    name: row.nama_unit,
                    active: row.status_aktif_unit === 1
                    // parent_id intentionally excluded
                },
                create: {
                    id: row.kode_unit,
                    name: row.nama_unit,
                    active: row.status_aktif_unit === 1
                    // parent_id intentionally excluded
                }
            })
        )
    )

    await Promise.all(unitCreationPromises)

    // Second pass: Now set parent relationships after all units exist
    const parentUpdatePromises = results.rows.map((row) =>
        limit(() => {
            if (row.parent_unit) {
                return DB.units.update({
                    where: { id: row.kode_unit },
                    data: { parent_id: row.parent_unit }
                })
            }
        })
    )

    await Promise.all(parentUpdatePromises)
}

;(async () => {
    await fetchOrganizations().then(() => process.exit(0))
})()
