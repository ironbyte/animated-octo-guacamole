import { relations } from 'drizzle-orm'
import { integer, pgEnum, pgTable, text } from 'drizzle-orm/pg-core'
import { ulid } from 'ulidx'

import { timestamps, ulidType } from '../types'
import { countries } from './countries'
import { jobSeeker } from './job-seeker'

// ----------------------
// Enum Definitions
// ----------------------

export const jobTypeEnum = [
	'Internship',
	'Consultant',
	'Part-time',
	'Full-time',
] as const

export const jobTypePgEnum = pgEnum('job_type', jobTypeEnum)

// ----------------------
// Table Definitions
// ----------------------

export const workExperience = pgTable('work_experience', {
	id: ulidType('id')
		.primaryKey()
		.$defaultFn(() => ulid()),
	jobSeekerId: ulidType('job_seeker_id')
		.references(() => jobSeeker.id, {
			onDelete: 'cascade',
		})
		.notNull(),
	company: text('company').notNull(),
	location: text('location'),
	state: text('state'),
	countryId: ulidType('country_id')
		.references(() => countries.id)
		.notNull(),
	role: text('role').notNull(),
	measurableAchievements: text('measurable_achievements').notNull(),
	workStartYear: integer('work_start_year').notNull(),
	workStartMonth: integer('work_start_month').notNull(),
	workEndYear: integer('work_end_year'),
	workEndMonth: integer('work_end_month'),
	jobType: jobTypePgEnum('job_type').notNull(),
	...timestamps,
})

// ----------------------
// Relations
// ----------------------

export const workExperienceRelations = relations(workExperience, ({ one }) => ({
	jobSeeker: one(jobSeeker, {
		fields: [workExperience.jobSeekerId],
		references: [jobSeeker.id],
	}),
	country: one(countries, {
		fields: [workExperience.countryId],
		references: [countries.id],
	}),
}))

// ----------------------
// Types
// ----------------------

export type WorkExperienceModel = typeof workExperience.$inferSelect
export type InsertWorkExperienceModel = typeof workExperience.$inferInsert
