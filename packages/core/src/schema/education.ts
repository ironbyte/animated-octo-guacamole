import { relations } from 'drizzle-orm'
import { integer, pgEnum, pgTable, text } from 'drizzle-orm/pg-core'
import { ulid } from 'ulidx'

import { timestamps, ulidType } from '../types'
import { jobSeeker } from './job-seeker'

// ----------------------
// Enum Definitions
// ----------------------

export const educationLevelEnum = [
	'Postgraduate',
	'Graduate',
	'Diploma',
] as const

export const educationLevelPgEnum = pgEnum(
	'education_level',
	educationLevelEnum,
)
// ----------------------
// Table Definitions
// ----------------------

export const education = pgTable('education', {
	id: ulidType('id')
		.primaryKey()
		.$defaultFn(() => ulid()),
	jobSeekerId: ulidType('job_seeker_id')
		.references(() => jobSeeker.id, {
			onDelete: 'cascade',
		})
		.notNull(),
	educationLevel: educationLevelPgEnum('education_level').notNull(),
	institution: text('institution'),
	degreeName: text('degree_name'),
	fieldOfStudy: text('field_of_study'),
	educationStartYear: integer('education_start_year'),
	educationEndYear: integer('education_end_year'),
	...timestamps,
})

// ----------------------
// Relations
// ----------------------

export const educationRelations = relations(education, ({ one }) => ({
	jobSeeker: one(jobSeeker, {
		fields: [education.jobSeekerId],
		references: [jobSeeker.id],
	}),
}))

// ----------------------
// Types
// ----------------------

export type EducationModel = typeof education.$inferSelect
export type InsertEducationModel = typeof education.$inferInsert
