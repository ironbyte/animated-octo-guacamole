import { bigint, customType, timestamp as rawTs } from 'drizzle-orm/pg-core'

// Custom ULID type for Drizzle ORM
export const ulidType = customType<{
	data: string
	notNull: true
	default: true
}>({
	dataType() {
		return 'text'
	},
	toDriver(value: string): string {
		return value
	},
	fromDriver(value: unknown): string {
		if (typeof value !== 'string') {
			throw new Error('Invalid ULID value from database')
		}
		return value
	},
})

export const timestamp = (name: string) =>
	rawTs(name, { precision: 3, mode: 'date' })

export const dollar = (name: string) => bigint(name, { mode: 'number' })

export const timestamps = {
	timeCreated: timestamp('time_created').notNull().defaultNow(),
	timeUpdated: timestamp('time_updated').notNull().defaultNow(),
	timeDeleted: timestamp('time_deleted'),
}
