import HRISDBPool from '../utils/hris/connectdb'
import DB from '../utils/local/connectdb'
import bcrypt from 'bcrypt'


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
    const query = `SELECT kode_unit, id_type_unit, nama_unit, parent_unit, status_aktif_unit FROM master_unit`
    const results = await HRISDBPool.query(query)

    // First pass: Create all units without parent relationships
    const unitCreationPromises = results.rows.map(async (row) => {
        return await DB.units.upsert({
            where: { id: row.kode_unit },
            update: { 
                name: row.nama_unit,
                active: row.status_aktif_unit === 1,
                // Don't update parent_id yet
            },
            create: {
                id: row.kode_unit,
                name: row.nama_unit,
                active: row.status_aktif_unit === 1,
                // Don't set parent_id yet
            }
        });
    });

    await Promise.all(unitCreationPromises);

    // Second pass: Now set parent relationships after all units exist
    const parentUpdatePromises = results.rows.map(async (row) => {
        if (row.parent_unit) {
            return await DB.units.update({
                where: { id: row.kode_unit },
                data: { parent_id: row.parent_unit }
            });
        }
    });

    await Promise.all(parentUpdatePromises);
}




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
 * 
 * @remarks
 * The upsert operation matches records based on external_id and updates or creates
 * position records with name, unit_id, and active status.
 */
async function fetchPosition() {
    const query = `SELECT kode_jabatan, nama_jabatan, id_type_jabatan, kode_unit FROM master_jabatan`
    const results = await HRISDBPool.query(query)

    results.rows.forEach(async (row) => {
        await DB.positions.upsert({
            where: {
                id: row.kode_jabatan,
            },
            create: {
                id: row.kode_jabatan,
                name: row.nama_jabatan,
                unit_id: row.kode_unit,
                active: row.status_aktif_jabatan === 1
            },
            update: {
                name: row.nama_jabatan,
                unit_id: row.kode_unit,
                active: row.status_aktif_jabatan === 1
            },
        })
    })
}



async function fetchPersonnels() {
    const query = `SELECT npp, nama_lengkap, kode_unit, kode_jabatan, email_intranet FROM master_personil`
    const results = await HRISDBPool.query(query)
    const salt = await bcrypt.genSalt(10)

    results.rows.forEach(async (row) => {
        await DB.personnels.upsert({
            where: {
                npp: row.npp
            },
            create: {
                npp: row.npp,
                name: row.nama_lengkap,
                position_id: row.kode_jabatan,
                eselon: row.kode_eselon,
                password: await bcrypt.hash('initial01!', salt),
                unit_id: row.kode_unit,
                email: row.email_intranet
            },
            update: {
                name: row.nama_lengkap,
                position_id: row.kode_jabatan,
                eselon: row.kode_eselon,
                unit_id: row.kode_unit,
                email: row.email_intranet
            },
        })
    })
}

(async () => {
    await fetchOrganizations()
    await fetchPosition()
    await fetchPersonnels()
    console.log('Sync completed')
})