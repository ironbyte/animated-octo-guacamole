import { relations } from 'drizzle-orm'
import { pgEnum, pgTable, text, unique } from 'drizzle-orm/pg-core'
import { ulid } from 'ulidx'

import { timestamp, timestamps, ulidType } from '../types'
import { jobSeeker } from './job-seeker'
import { users } from './users'

// ----------------------
// Enum Definitions
// ----------------------

export const reviewSectionEnum = [
	'personal_info',
	'cv_and_resume',
	'intro_video',
	'education',
	'memberships',
	'professional_certifications',
	'corporate_experience',
	'seagoing_experience',
	'work_experience',
	'culture',
	'questions_and_answers',
	'publications',
] as const

export const reviewStatusEnum = ['Pending', 'Resolved'] as const

export const reviewSectionPgEnum = pgEnum('review_section', reviewSectionEnum)
export const reviewStatusPgEnum = pgEnum('review_status', reviewStatusEnum)

// ----------------------
// Table Definitions
// ----------------------

export const moderatorReviews = pgTable(
	'moderator_reviews',
	{
		id: ulidType('id')
			.primaryKey()
			.$defaultFn(() => ulid()),
		jobSeekerId: ulidType('job_seeker_id')
			.references(() => jobSeeker.id, {
				onDelete: 'cascade',
			})
			.notNull(),
		moderatorId: ulidType('moderator_id')
			.references(() => users.id)
			.notNull(),
		section: reviewSectionPgEnum('section').notNull(),
		status: reviewStatusPgEnum('status').default('Pending').notNull(),
		comment: text('comments'),
		reviewedAt: timestamp('reviewed_at'),
		...timestamps,
	},
	(table) => ({
		uniqueJobSeekerSection: unique().on(table.jobSeekerId, table.section),
	}),
)

// ----------------------
// Relations
// ----------------------

export const moderatorReviewsRelations = relations(
	moderatorReviews,
	({ one }) => ({
		jobSeeker: one(jobSeeker, {
			fields: [moderatorReviews.jobSeekerId],
			references: [jobSeeker.id],
		}),
		moderator: one(users, {
			fields: [moderatorReviews.moderatorId],
			references: [users.id],
		}),
	}),
)

// ----------------------
// Types
// ----------------------

export type ModeratorReviewModel = typeof moderatorReviews.$inferSelect
export type InsertModeratorReviewModel = typeof moderatorReviews.$inferInsert
