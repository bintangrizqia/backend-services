import HRISDBPool from '../utils/hris/connectdb'
import DB from '../utils/local/connectdb'
import pLimit from 'p-limit'

const limit = pLimit(3)

async function fetchMasterTypeUnit() {
    const query = `SELECT id_type_unit, nama_type_unit, level_type_unit, actived, keterangan FROM master_type_unit`
    const results = await HRISDBPool.query(query)

    const masterTypeUnitPromises = results.rows.map((row) =>
        limit(() =>
            DB.masterTypeUnits.upsert({
                where: {
                    id: row.id_type_unit
                },
                create: {
                    id: row.id_type_unit,
                    name: row.nama_type_unit,
                    level_type_unit: row.level_type_unit,
                    active: row.actived === 1,
                    description: row.keterangan || undefined
                },
                update: {
                    name: row.nama_type_unit,
                    level_type_unit: row.level_type_unit,
                    active: row.actived === 1,
                    description: row.keterangan || undefined
                }
            })
        )
    )

    await Promise.all(masterTypeUnitPromises)
}


fetchMasterTypeUnit().then(() => process.exit(0))
