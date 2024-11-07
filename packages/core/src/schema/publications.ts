import { relations } from 'drizzle-orm'
import { pgTable, text } from 'drizzle-orm/pg-core'
import { ulid } from 'ulidx'

import { timestamps, ulidType } from '../types'
import { jobSeeker } from './job-seeker'

// ----------------------
// Table Definitions
// ----------------------

export const publications = pgTable('publications', {
	id: ulidType('id')
		.primaryKey()
		.$defaultFn(() => ulid()),
	jobSeekerId: ulidType('job_seeker_id')
		.references(() => jobSeeker.id, {
			onDelete: 'cascade',
		})
		.notNull(),
	publicationLink: text('publication_link'),
	...timestamps,
})

// ----------------------
// Relations
// ----------------------

export const publicationsRelations = relations(publications, ({ one }) => ({
	jobSeeker: one(jobSeeker, {
		fields: [publications.jobSeekerId],
		references: [jobSeeker.id],
	}),
}))

// ----------------------
// Types
// ----------------------

export type PublicationModel = typeof publications.$inferSelect
export type InsertPublicationModel = typeof publications.$inferInsert
