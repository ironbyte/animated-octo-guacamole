import { relations } from 'drizzle-orm'
import {
	boolean,
	foreignKey,
	index,
	pgEnum,
	pgTable,
	text,
	timestamp,
	unique,
	varchar,
} from 'drizzle-orm/pg-core'
import { ulid } from 'ulidx'

import { timestamps, ulidType } from '../types'
import { jobSeeker } from './job-seeker'
import { organizations } from './organizations'
import { verifications } from './verifications'

// ----------------------
// Enum Definitions
// ----------------------

export const USER_ROLES = [
	'admin',
	'job_seeker',
	'org_member',
	'moderator',
] as const

export type UserRole = (typeof USER_ROLES)[number]

export const userRoleEnum = pgEnum('user_role', USER_ROLES)
export const orgRoleEnum = pgEnum('org_role', ['owner', 'recruiter', 'member'])
export const invitationStatusEnum = pgEnum('invitation_status', [
	'pending',
	'accepted',
	'declined',
	'revoked',
])

// ----------------------
// Table Definitions
// ----------------------

// Users Table
export const users = pgTable(
	'users',
	{
		id: ulidType('id')
			.primaryKey()
			.$defaultFn(() => ulid()),
		email: text('email').notNull().unique(),
		// Used to determine if the user has access to the product—it's turn on/off by the Stripe webhook
		hasAccess: boolean('has_access').default(false),
		isVerified: boolean('is_verified').default(false),
		isOnboarded: boolean('is_onboarded').default(false),
		role: userRoleEnum('role').notNull().default('job_seeker'),
		// Used in the Stripe webhook to identify the user in Stripe and later create Customer Portal or prefill user credit card details
		stripeCustomerId: text('stripe_customer_id').unique(),
		// Used in the Stripe webhook. should match a plan in config.js file.
		stripePriceId: text('stripe_price_id'),
		...timestamps,
	},
	(table) => ({
		stripeCustomerIdIdx: index().on(table.stripeCustomerId),
	}),
)

// User Organizations Table
export const userOrganizations = pgTable(
	'user_organizations',
	{
		id: ulidType('id')
			.primaryKey()
			.$defaultFn(() => ulid()),
		userId: ulidType('user_id').notNull(),
		organizationId: ulidType('organization_id').notNull(),
		role: orgRoleEnum('role').notNull(),
		...timestamps,
	},
	(table) => ({
		userFk: foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
		}),
		orgFk: foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organizations.id],
		}),
		uniqueUserOrg: unique().on(table.userId, table.organizationId),
	}),
)

// User Profiles Table
export const userProfiles = pgTable(
	'user_profiles',
	{
		id: ulidType('id')
			.primaryKey()
			.$defaultFn(() => ulid()),
		userId: ulidType('user_id').notNull(),
		firstName: text('first_name'),
		lastName: text('last_name'),
		mobile: varchar('mobile', { length: 20 }).notNull(),
		linkedinUrl: text('linkedin_url'),
		...timestamps,
	},
	(table) => ({
		userFk: foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
		}),
	}),
)

// Passwords Table
export const passwords = pgTable('passwords', {
	userId: ulidType('user_id')
		.primaryKey()
		.references(() => users.id, { onDelete: 'cascade' }),
	hash: varchar('hash', { length: 255 }).notNull(),
	...timestamps,
})

// User Sessions Table
export const userSessions = pgTable(
	'user_sessions',
	{
		id: ulidType('id')
			.primaryKey()
			.$defaultFn(() => ulid()),
		userId: ulidType('user_id')
			.notNull()
			.references(() => users.id),
		expiresAt: timestamp('expires_at').notNull(),
		lastActivityAt: timestamp('last_activity_at').defaultNow(),
		ipAddress: varchar('ip_address', { length: 45 }),
		userAgent: varchar('user_agent', { length: 255 }),
		...timestamps,
	},
	(t) => ({
		userIdIdx: index().on(t.userId),
		expiresAtIdx: index().on(t.expiresAt),
	}),
)

export const userInvitations = pgTable('user_invitations', {
	id: ulidType('id')
		.primaryKey()
		.$defaultFn(() => ulid()),
	verificationId: ulidType('verification_id').references(
		() => verifications.id,
		{
			onDelete: 'set null',
		},
	),
	email: text('email').unique().notNull(),
	role: userRoleEnum('role').notNull(),
	senderId: ulidType('sender_id')
		.references(() => users.id)
		.notNull(),
	status: invitationStatusEnum('status').default('pending').notNull(),
	...timestamps,
})

// ----------------------
// Relations
// ----------------------

export const usersRelations = relations(users, ({ one, many }) => ({
	profile: one(userProfiles, {
		fields: [users.id],
		references: [userProfiles.userId],
	}),
	password: one(passwords, {
		fields: [users.id],
		references: [passwords.userId],
	}),
	sessions: many(userSessions),
	organizations: many(userOrganizations),
	jobSeeker: one(jobSeeker, {
		fields: [users.id],
		references: [jobSeeker.userId],
	}),
}))

export const userOrganizationsRelations = relations(
	userOrganizations,
	({ one }) => ({
		user: one(users, {
			fields: [userOrganizations.userId],
			references: [users.id],
		}),
		organization: one(organizations, {
			fields: [userOrganizations.organizationId],
			references: [organizations.id],
		}),
	}),
)

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
	user: one(users, {
		fields: [userProfiles.userId],
		references: [users.id],
	}),
}))

export const passwordsRelations = relations(passwords, ({ one }) => ({
	user: one(users, {
		fields: [passwords.userId],
		references: [users.id],
	}),
}))

export const sessionsRelations = relations(userSessions, ({ one }) => ({
	user: one(users, {
		fields: [userSessions.userId],
		references: [users.id],
	}),
}))

export const userInvitationsRelations = relations(
	userInvitations,
	({ one }) => ({
		sender: one(users, {
			fields: [userInvitations.senderId],
			references: [users.id],
		}),
		verification: one(verifications, {
			fields: [userInvitations.verificationId],
			references: [verifications.id],
		}),
	}),
)

// ----------------------
// Types
// ----------------------

export type UserModel = typeof users.$inferSelect
export type InsertUserModel = typeof users.$inferInsert

export type UserProfileModel = typeof userProfiles.$inferSelect
export type InsertUserProfileModel = typeof userProfiles.$inferInsert

export type PasswordModel = typeof passwords.$inferSelect
export type InsertPasswordModel = typeof passwords.$inferInsert

export type UserSessionModel = typeof userSessions.$inferSelect
export type InsertUserSessionModel = typeof userSessions.$inferInsert

export type UserInvitationModel = typeof userInvitations.$inferSelect
export type InsertUserInvitationModel = typeof userInvitations.$inferInsert
