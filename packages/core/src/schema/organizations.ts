import { relations } from 'drizzle-orm'
import { pgEnum, pgTable, text } from 'drizzle-orm/pg-core'
import { ulid } from 'ulidx'

import { timestamps, ulidType } from '../types'
import { jobPostings } from './job-postings'
import { userOrganizations } from './users'

/*
export const organizations = pgTable('organizations', {
  // ... other fields ...
}, (table) => ({
  nameIdx: index('name_idx').on(table.name),
}))
*/

export const organizationTypeEnum = pgEnum('organization_type', [
	'company',
	'individual',
])

// Organizations Table
export const organizations = pgTable('organizations', {
	id: ulidType('id')
		.primaryKey()
		.$defaultFn(() => ulid()),
	name: text('name').notNull(),
	type: organizationTypeEnum('type').notNull(),
	...timestamps,
})

export const organizationsRelations = relations(organizations, ({ many }) => ({
	userOrganizations: many(userOrganizations),
	jobPostings: many(jobPostings),
}))

export type OrganizationModel = typeof organizations.$inferSelect
export type InsertOrganizationModel = typeof organizations.$inferInsert
