import { relations } from 'drizzle-orm'
import { boolean, index, pgTable, text } from 'drizzle-orm/pg-core'
import { ulid } from 'ulidx'

import { timestamps, ulidType } from '../types'
import { targetCompany } from './job-seeker'

// ----------------------
// Table Definitions
// ----------------------

export const companies = pgTable(
	'companies',
	{
		id: ulidType('id')
			.primaryKey()
			.$defaultFn(() => ulid()),
		name: text('name').notNull().unique(),
		isVerified: boolean('is_verified').notNull().default(false),
		...timestamps,
	},
	(table) => {
		return {
			nameIdx: index('name_idx').on(table.name),
		}
	},
)

// ----------------------
// Relations
// ----------------------

export const companyRelations = relations(companies, ({ many }) => ({
	targetedBy: many(targetCompany),
}))

// ----------------------
// Types
// ----------------------

export type CompanyModel = typeof companies.$inferSelect
export type InsertCompanyModel = typeof companies.$inferInsert
