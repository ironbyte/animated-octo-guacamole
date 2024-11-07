import { relations } from 'drizzle-orm'
import { pgEnum, pgTable, text, unique } from 'drizzle-orm/pg-core'
import { ulid } from 'ulidx'

import { timestamps, ulidType } from '../types'
import { jobSeeker } from './job-seeker'
import { users } from './users'

// ----------------------
// Enum Definitions
// ----------------------
export const ratingEnum = ['Good', 'Average', 'Unsatisfactory'] as const
export const ratingPgEnum = pgEnum('rating_type', ratingEnum)

export const placementAreaEnum = [
	'Freight_Forwarding',
	'Warehousing',
	'Chartering_Commercial',
	'Chartering_Operations',
	'Shipbroking',
	'Ship_Management',
	'Customer_Service',
	'Documentation',
	'Pricing',
	'Sales',
] as const

export const placementAreaPgEnum = pgEnum('placement_area', placementAreaEnum)

// ----------------------
// Table Definition
// ----------------------
export const moderatorEvaluations = pgTable(
	'moderator_evaluations',
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

		communication: ratingPgEnum('communication').notNull(),
		presentation: ratingPgEnum('presentation').notNull(),
		industryKnowledge: ratingPgEnum('industry_knowledge').notNull(),

		// Store areas of placement as an array of enum values
		areasOfPlacement: placementAreaPgEnum('areas_of_placement')
			.array()
			.notNull(),

		generalComments: text('general_comments'),

		...timestamps,
	},
	(table) => ({
		uniqueJobSeekerModerator: unique().on(table.jobSeekerId, table.moderatorId),
	}),
)

// ----------------------
// Relations
// ----------------------
export const moderatorEvaluationsRelations = relations(
	moderatorEvaluations,
	({ one }) => ({
		jobSeeker: one(jobSeeker, {
			fields: [moderatorEvaluations.jobSeekerId],
			references: [jobSeeker.id],
		}),
		moderator: one(users, {
			fields: [moderatorEvaluations.moderatorId],
			references: [users.id],
		}),
	}),
)

// ----------------------
// Types
// ----------------------
export type ModeratorEvaluationModel = typeof moderatorEvaluations.$inferSelect
export type InsertModeratorEvaluationModel =
	typeof moderatorEvaluations.$inferInsert

// ----------------------
// Helpful Type Guards
// ----------------------
export const isValidRating = (
	rating: unknown,
): rating is (typeof ratingEnum)[number] => {
	return typeof rating === 'string' && ratingEnum.includes(rating as any)
}

export const isValidPlacementArea = (
	area: unknown,
): area is (typeof placementAreaEnum)[number] => {
	return typeof area === 'string' && placementAreaEnum.includes(area as any)
}
