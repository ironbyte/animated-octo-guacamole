import { relations } from 'drizzle-orm'
import { integer, pgTable, text, timestamp, unique } from 'drizzle-orm/pg-core'
import { ulid } from 'ulidx'

import { timestamps, ulidType } from '../types'
import { userInvitations } from './users'

export const verifications = pgTable(
	'verifications',
	{
		id: ulidType('id')
			.primaryKey()
			.$defaultFn(() => ulid()),
		type: text('type').notNull(),
		secret: text('secret').notNull(),
		target: text('target').notNull(),
		period: integer('period').notNull(),
		algorithm: text('algorithm').notNull(),
		digits: integer('digits').notNull(),
		expiresAt: timestamp('expires_at'),
		...timestamps,
	},
	(t) => ({
		unq: unique().on(t.target, t.type),
	}),
)

// ----------------------
// Relations
// ----------------------

export const verificationsRelations = relations(verifications, ({ one }) => ({
	userInvitation: one(userInvitations),
}))

// ----------------------
// Types
// ----------------------

export type VerificationModel = typeof verifications.$inferSelect
export type InsertVerificationModel = typeof verifications.$inferInsert
