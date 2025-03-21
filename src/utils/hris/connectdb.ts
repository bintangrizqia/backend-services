import {Pool} from 'pg'
import ConnectionConfig from '../../connection_config'

const pool = new Pool({
    host: ConnectionConfig.DATABASE_HRIS_HOST,
    port: ConnectionConfig.DATABASE_HRIS_PORT,
    user: ConnectionConfig.DATABASE_HRIS_USER,
    password: ConnectionConfig.DATABASE_HRIS_PASSWORD,
    database: ConnectionConfig.DATABASE_HRIS_NAME
    
})
pool.connect()

export default pool