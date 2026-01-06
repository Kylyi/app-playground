import { ZenStackClient } from '@zenstackhq/orm'
import { PostgresDialect } from 'kysely'
import { Pool } from 'pg'

const connectionString = import.meta.env.DB_URL

export const db = new ZenStackClient(schema, {
  dialect: new PostgresDialect({ pool: new Pool({ connectionString }) }),
})
