import { relations, sql } from 'drizzle-orm'
import {
	check,
	pgEnum,
	pgTable,
	text,
	timestamp,
	unique,
} from 'drizzle-orm/pg-core'
import { ulid } from 'ulidx'

import { timestamps, ulidType } from '../types'
import { jobSeeker } from './job-seeker'
import { users } from './users'

export const assignmentStatusEnum = ['active', 'completed'] as const
export const assignmentStatusPgEnum = pgEnum(
	'assignment_status',
	assignmentStatusEnum,
)

// ----------------------
// Assignment Table
// ----------------------

export const moderatorAssignments = pgTable(
	'moderator_assignments',
	{
		id: ulidType('id')
			.primaryKey()
			.$defaultFn(() => ulid()),
		jobSeekerId: ulidType('job_seeker_id')
			.references(() => jobSeeker.id, {
				onDelete: 'cascade',
			})
			.notNull()
			.unique(),
		moderatorId: ulidType('moderator_id')
			.references(() => users.id, {
				onDelete: 'restrict', // Prevent deletion of users with active assignments
			})
			.notNull(),
		assignedBy: ulidType('assigned_by')
			.references(() => users.id, {
				onDelete: 'set null', // If the admin is deleted, keep the assignment but set assignedBy to null
			})
			.notNull(),
		assignedAt: timestamp('assigned_at').defaultNow().notNull(),
		status: assignmentStatusPgEnum('status').default('active').notNull(),
		endedAt: timestamp('ended_at'),
		notes: text('notes'),
		...timestamps,
	},
	(table) => ({
		statusEndedAtCheck: check(
			'statusEndedAtCheck',
			sql`(${table.status} = 'active' AND ${table.endedAt} IS NULL) OR
        (${table.status} IN ('completed', 'transferred') AND ${table.endedAt} IS NOT NULL)`,
		),

		// Ensure endedAt is after assignedAt when present
		dateOrderCheck: check(
			'dateOrderCheck',
			sql`${table.endedAt} IS NULL OR ${table.endedAt} >= ${table.assignedAt}`,
		),
	}),
)

// ----------------------
// Relations
// ----------------------

export const moderatorAssignmentsRelations = relations(
	moderatorAssignments,
	({ one }) => ({
		jobSeeker: one(jobSeeker, {
			fields: [moderatorAssignments.jobSeekerId],
			references: [jobSeeker.id],
		}),
		moderator: one(users, {
			fields: [moderatorAssignments.moderatorId],
			references: [users.id],
		}),
		assignedByAdmin: one(users, {
			fields: [moderatorAssignments.assignedBy],
			references: [users.id],
		}),
	}),
)

// ----------------------
// Types
// ----------------------

export type ModeratorAssignmentModel = typeof moderatorAssignments.$inferSelect
export type InsertModeratorAssignmentModel =
	typeof moderatorAssignments.$inferInsert
