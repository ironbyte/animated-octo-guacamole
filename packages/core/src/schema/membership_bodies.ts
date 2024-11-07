import { boolean, index, pgTable, text, varchar } from 'drizzle-orm/pg-core'
import { ulid } from 'ulidx'

import { timestamps, ulidType } from '../types'

// ----------------------
// Table Definitions
// ----------------------

export const membershipBodies = pgTable(
	'membership_bodies',
	{
		id: ulidType('id')
			.primaryKey()
			.$defaultFn(() => ulid()),
		name: varchar('name', { length: 255 }).notNull().unique(),
		category: varchar('category', { length: 100 }).notNull().default(''),
		isVerified: boolean('is_verified').notNull().default(false),
		...timestamps,
	},
	(table) => {
		return {
			membershipBodyCategoryIdx: index('membership_category_idx').on(
				table.category,
			),
			membershipBodyNameIdx: index('membership_body_name_idx').on(table.name),
		}
	},
)

// ----------------------
// Types
// ----------------------

export type MembershipBody = typeof membershipBodies.$inferSelect
export type InsertMembershipBody = typeof membershipBodies.$inferInsert
