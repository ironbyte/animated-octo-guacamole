import { relations } from 'drizzle-orm'
import { foreignKey, pgTable, text } from 'drizzle-orm/pg-core'
import { ulid } from 'ulidx'

import { timestamps, ulidType } from '../types'
import { jobApplications } from './job-applications'
import { organizations } from './organizations'
import { users } from './users'

// Job Postings Table
export const jobPostings = pgTable(
	'job_postings',
	{
		id: ulidType('id')
			.primaryKey()
			.$defaultFn(() => ulid()),
		organizationId: ulidType('organization_id').notNull(),
		title: text('title').notNull(),
		description: text('description').notNull(),
		createdBy: ulidType('created_by').notNull(),
		...timestamps,
	},
	(table) => ({
		orgFk: foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organizations.id],
		}),
		createdByFk: foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
		}),
	}),
)

export const jobPostingsRelations = relations(jobPostings, ({ one, many }) => ({
	organization: one(organizations, {
		fields: [jobPostings.organizationId],
		references: [organizations.id],
	}),
	createdBy: one(users, {
		fields: [jobPostings.createdBy],
		references: [users.id],
	}),
	applications: many(jobApplications),
}))
