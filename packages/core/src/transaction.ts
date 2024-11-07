import { type ExtractTablesWithRelations } from 'drizzle-orm'
import { type NeonQueryResultHKT } from 'drizzle-orm/neon-serverless'
import { type PgTransaction } from 'drizzle-orm/pg-core'

import { type DB } from './db'
import type * as schema from './schema'

type DatabaseSchema = typeof schema

export type Transaction = PgTransaction<
	NeonQueryResultHKT,
	DatabaseSchema,
	ExtractTablesWithRelations<DatabaseSchema>
>

export type TxOrDb = Transaction | DB
