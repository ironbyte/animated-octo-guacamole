import { relations } from 'drizzle-orm'
import { foreignKey, pgTable, text } from 'drizzle-orm/pg-core'
import { ulid } from 'ulidx'

import { timestamps, ulidType } from '../types'
import { jobPostings } from './job-postings'
import { users } from './users'

// Job Applications Table
export const jobApplications = pgTable(
	'job_applications',
	{
		id: ulidType('id')
			.primaryKey()
			.$defaultFn(() => ulid()),
		jobPostingId: ulidType('job_posting_id').notNull(),
		candidateId: ulidType('candidate_id').notNull(),
		status: text('status', {
			enum: ['applied', 'under_review', 'rejected', 'accepted'],
		}).notNull(),
		...timestamps,
	},
	(table) => ({
		jobPostingFk: foreignKey({
			columns: [table.jobPostingId],
			foreignColumns: [jobPostings.id],
		}),
		candidateFk: foreignKey({
			columns: [table.candidateId],
			foreignColumns: [users.id],
		}),
	}),
)

export const jobApplicationsRelations = relations(
	jobApplications,
	({ one }) => ({
		jobPosting: one(jobPostings, {
			fields: [jobApplications.jobPostingId],
			references: [jobPostings.id],
		}),
		candidate: one(users, {
			fields: [jobApplications.candidateId],
			references: [users.id],
		}),
	}),
)
