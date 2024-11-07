import { relations } from 'drizzle-orm'
import {
	boolean,
	foreignKey,
	index,
	integer,
	jsonb,
	pgEnum,
	pgTable,
	text,
	time,
	timestamp,
	unique,
} from 'drizzle-orm/pg-core'
import { ulid } from 'ulidx'

import { timestamps, ulidType } from '../types'
import { companies } from './companies'
import { education } from './education'
import { membershipBodies } from './membership_bodies'
import { moderatorAssignments } from './moderator-assignments'
import { publications } from './publications'
import { users } from './users'
import { workExperience } from './work-experience'

// ----------------------
// Enum Definitions
// ----------------------

export const skillEnum = [
	'Chartering',
	'Ship broking',
	'Post-fixture',
	'Commercial managers',
	'Technical managers',
	'Crewing',
	'Bunkering',
	'Ship Chandling',
	'Stevedoring',
	'Customs clearance',
	'Port agents',
	'Container Line',
	'NVOCC',
	'Freight Forwarder',
	'Project cargo / Break-bulk',
	'Cruise industry',
	'Manufacturing',
	'Trading',
	'Road Transport',
	'Warehousing',
	'Oil / Chemicals Terminal',
	'Container Terminal',
	'Port',
	'Back office',
	'Customer Service',
	'IT solutions',
	'Legal',
	'Finance',
	'Training / Teaching',
	'Consultancy',
] as const

export const seaRankEnum = [
	'Chief Officer',
	'Chief Engineer',
	'2nd Officer',
	'2nd Engineer',
	'3rd Officer',
	'3rd Engineer',
	'4th Engineer',
	'Cadet',
	'Radio Officer',
] as const

const dayEnum = [
	'Monday',
	'Tuesday',
	'Wednesday',
	'Thursday',
	'Friday',
	'Saturday',
	'Sunday',
] as const

export const peopleManagementExperienceInYearsEnum = [
	'5+ years',
	'1-5 years',
	'No experience',
] as const

export const emiratesPreferencesEnum = [
	'Abu Dhabi',
	'Dubai',
	'Sharjah',
	'Ajman',
	'Umm Al Quwain',
	'Ras Al Khaimah',
	'Fujairah',
] as const

export const skillPgEnum = pgEnum('skill', skillEnum)
export const seaRankPgEnum = pgEnum('seaRank', seaRankEnum)
export const peopleManagementExperiencePgEnum = pgEnum(
	'people_management_experience',
	peopleManagementExperienceInYearsEnum,
)
export const emiratesPrefsPgEnum = pgEnum(
	'emirates_prefs',
	emiratesPreferencesEnum,
)
export const dayPgEnum = pgEnum('day', dayEnum)

// ----------------------
// Table Definitions
// ----------------------

// Main JobSeeker table
export const jobSeeker = pgTable(
	'job_seeker',
	{
		id: ulidType('id')
			.primaryKey()
			.$defaultFn(() => ulid())
			.notNull()
			.unique(),
		userId: ulidType('user_id').notNull().unique(),
		candidateNumber: integer('candidate_number').generatedAlwaysAsIdentity({
			startWith: 1000,
		}),
		totalYearsExperience: integer('total_years_experience'),
		arabicSpeaking: boolean('arabic_speaking'),
		dubaiTradePortal: boolean('dubai_trade_portal'),
		uaeCustoms: boolean('uae_customs'),
		freeZoneProcess: boolean('free_zone_process'),
		personalWebsiteUrl: text('personal_website_url'),
		availableFrom: timestamp('available_from'),
		cvFileS3Key: text('cv_file_s3_key'),
		cvFileName: text('cv_file_name'),
		cvUploadedAt: timestamp('cv_uploaded_at'),
		videoCVUrl: text('video_cv_url'),
		emiratesPreference: emiratesPrefsPgEnum('emirates_prefs')
			.array()
			.default([]),
		peopleManagementExperience: peopleManagementExperiencePgEnum(
			'people_management_experience',
		)
			.notNull()
			.default('No experience'),
		...timestamps,
	},
	(table) => ({
		userFk: foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
		}),
		candidateNumberIdx: index('idx_candidate_number').on(table.candidateNumber),
	}),
)

export const availabilitySlots = pgTable('availability_slots', {
	id: ulidType('id')
		.primaryKey()
		.$defaultFn(() => ulid())
		.notNull()
		.unique(),
	jobSeekerId: ulidType('job_seeker_id')
		.references(() => jobSeeker.id, {
			onDelete: 'cascade',
		})
		.notNull(),
	day: dayPgEnum('day').notNull(),
	startTime: time('start_time').notNull(),
	endTime: time('end_time').notNull(),
	...timestamps,
})

export const seagoingExperience = pgTable('seagoing_experience', {
	id: ulidType('id')
		.primaryKey()
		.$defaultFn(() => ulid()),
	jobSeekerId: ulidType('job_seeker_id')
		.references(() => jobSeeker.id, {
			onDelete: 'cascade',
		})
		.notNull()
		.unique(),
	seaRank: seaRankPgEnum('sea_rank').notNull(),
	totalYearsSeaGoingExperience: integer('total_years_sea_going_experience'),
})

// ProfessionalCertification table
export const professionalCertification = pgTable('professional_certification', {
	id: ulidType('id')
		.primaryKey()
		.$defaultFn(() => ulid()),
	jobSeekerId: ulidType('job_seeker_id')
		.references(() => jobSeeker.id, {
			onDelete: 'cascade',
		})
		.notNull(),
	proInstitute: text('institute').notNull(),
	proCertificationName: text('certification_name').notNull(),
	...timestamps,
})

// Membership table
export const membership = pgTable('membership', {
	id: ulidType('id')
		.primaryKey()
		.$defaultFn(() => ulid()),
	jobSeekerId: ulidType('job_seeker_id')
		.references(() => jobSeeker.id, {
			onDelete: 'cascade',
		})
		.notNull(),
	membershipBodyName: text('membership_body_name').notNull(),
	membershipJoiningYear: integer('year_of_joining').notNull(),
	membershipCertificate: text('membership_certificate').notNull(),
	...timestamps,
})

// JobSeekerSkill table
export const jobSeekerSkill = pgTable(
	'job_seeker_skill',
	{
		id: ulidType('id')
			.primaryKey()
			.$defaultFn(() => ulid()),
		jobSeekerId: ulidType('job_seeker_id').references(() => jobSeeker.id, {
			onDelete: 'cascade',
		}),
		skill: skillPgEnum('skill').notNull(),
		...timestamps,
	},
	(table) => ({
		// This ensures a job seeker can't have the same skill twice
		uniqueJobSeekerSkill: unique().on(table.jobSeekerId, table.skill),
	}),
)

// TargetCompany table
export const targetCompany = pgTable(
	'target_company',
	{
		id: ulidType('id')
			.primaryKey()
			.$defaultFn(() => ulid()),
		jobSeekerId: ulidType('job_seeker_id').references(() => jobSeeker.id, {
			onDelete: 'cascade',
		}),
		companyId: ulidType('company_id')
			.notNull()
			.references(() => companies.id),
		...timestamps,
	},
	(table) => ({
		uniqueJobSeekerCompany: unique().on(table.jobSeekerId, table.companyId),
	}),
)

export const jobSeekerQuestions = pgTable('job_seeker_questions', {
	id: ulidType('id')
		.primaryKey()
		.$defaultFn(() => ulid()),
	jobSeekerId: ulidType('job_seeker_id')
		.references(() => jobSeeker.id, {
			onDelete: 'cascade',
		})
		.notNull()
		.unique(),
	nextJobSeek: text('next_job_seek'),
	motivation: text('motivation'),
	workEnvironment: text('work_environment'),
	topValuesInNextJob: jsonb('top_values_in_next_job').$type<string[]>(),
	...timestamps,
})

// ----------------------
// Relations
// ----------------------

export const jobSeekerRelations = relations(jobSeeker, ({ one, many }) => ({
	user: one(users, {
		fields: [jobSeeker.userId],
		references: [users.id],
	}),
	skills: many(jobSeekerSkill),
	workExperiences: many(workExperience),
	professionalCertifications: many(professionalCertification),
	memberships: many(membership),
	targetCompanies: many(targetCompany),
	education: many(education),
	publications: many(publications),
	seagoingExperience: one(seagoingExperience, {
		fields: [jobSeeker.id],
		references: [seagoingExperience.jobSeekerId],
	}),
	jobSeekerQuestions: one(jobSeekerQuestions, {
		fields: [jobSeeker.id],
		references: [jobSeekerQuestions.jobSeekerId],
	}),
	moderatorAssignment: one(moderatorAssignments, {
		fields: [jobSeeker.id],
		references: [moderatorAssignments.jobSeekerId],
	}),
	availabilitySlots: many(availabilitySlots),
}))

export const jobSeekerSkillRelations = relations(jobSeekerSkill, ({ one }) => ({
	jobSeeker: one(jobSeeker, {
		fields: [jobSeekerSkill.jobSeekerId],
		references: [jobSeeker.id],
	}),
}))

export const professionalCertificationRelations = relations(
	professionalCertification,
	({ one }) => ({
		jobSeeker: one(jobSeeker, {
			fields: [professionalCertification.jobSeekerId],
			references: [jobSeeker.id],
		}),
	}),
)

export const membershipRelations = relations(membership, ({ one }) => ({
	jobSeeker: one(jobSeeker, {
		fields: [membership.jobSeekerId],
		references: [jobSeeker.id],
	}),
}))

export const targetCompanyRelations = relations(targetCompany, ({ one }) => ({
	jobSeeker: one(jobSeeker, {
		fields: [targetCompany.jobSeekerId],
		references: [jobSeeker.id],
	}),
	company: one(companies, {
		fields: [targetCompany.companyId],
		references: [companies.id],
	}),
}))

export const jobSeekerQuestionsRelations = relations(
	jobSeekerQuestions,
	({ one }) => ({
		jobSeeker: one(jobSeeker, {
			fields: [jobSeekerQuestions.jobSeekerId],
			references: [jobSeeker.id],
		}),
	}),
)

export const membershipBodiesRelations = relations(
	membershipBodies,
	({ many }) => ({
		memberships: many(membership),
	}),
)

export const availabilitySlotsRelations = relations(
	availabilitySlots,
	({ one }) => ({
		jobSeeker: one(jobSeeker, {
			fields: [availabilitySlots.jobSeekerId],
			references: [jobSeeker.id],
		}),
	}),
)

// ----------------------
// Types
// ----------------------

export type JobSeekerModel = typeof jobSeeker.$inferSelect
export type InsertJobSeekerModel = typeof jobSeeker.$inferInsert

export type SeagoingExperienceModel = typeof seagoingExperience.$inferSelect
export type InsertSeagoingExperienceModel =
	typeof seagoingExperience.$inferInsert

export type ProfessionalCertificationModel =
	typeof professionalCertification.$inferSelect
export type InsertProfessionalCertificationModel =
	typeof professionalCertification.$inferInsert

export type MembershipModel = typeof membership.$inferSelect
export type InsertMembershipModel = typeof membership.$inferInsert

export type JobSeekerSkillModel = typeof jobSeekerSkill.$inferSelect
export type InsertJobSeekerSkillModel = typeof jobSeekerSkill.$inferInsert

export type TargetCompanyModel = typeof targetCompany.$inferSelect
export type InsertTargetCompanyModel = typeof targetCompany.$inferInsert

export type JobSeekerQuestionsModel = typeof jobSeekerQuestions.$inferSelect
export type InsertJobSeekerQuestionsModel =
	typeof jobSeekerQuestions.$inferInsert

export type AvailabilitySlotModel = typeof availabilitySlots.$inferSelect
export type InsertAvailabilitySlotModel = typeof availabilitySlots.$inferInsert
