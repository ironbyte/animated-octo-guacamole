import { pgTable, text, varchar } from 'drizzle-orm/pg-core'
import { ulid } from 'ulidx'

import { timestamps, ulidType } from '../types'

// ----------------------
// Table Definitions
// ----------------------

export const countries = pgTable('countries', {
	id: ulidType('id')
		.primaryKey()
		.$defaultFn(() => ulid()),
	name: varchar('name', { length: 255 }).notNull().unique(),
	code: text('code').notNull(),
	...timestamps,
})

// ----------------------
// Types
// ----------------------

export type CountryModel = typeof countries.$inferSelect
export type InsertCountryModel = typeof countries.$inferInsert
