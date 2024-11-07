import { db } from '@nautikos/core/db'
import {
	availabilitySlots,
	jobSeeker,
	type InsertAvailabilitySlotModel,
} from '@nautikos/core/schema/job-seeker'
import { users } from '@nautikos/core/schema/users'
import { eq } from 'drizzle-orm'

export async function insertAvailabilitySlot({
	availabilitySlotsInput,
	userId,
}: {
	availabilitySlotsInput: InsertAvailabilitySlotModel[]
	userId: string
}) {
	await db.transaction(async (trx) => {
		const existingUser = await trx.query.users.findFirst({
			where: eq(users.id, userId),
		})

		if (!existingUser) {
			throw new Error('User not found')
		}

		const jobSeekInsert = {
			userId,
		}

		const [currentJobSeeker] = await trx
			.insert(jobSeeker)
			.values(jobSeekInsert)
			.returning()
			.onConflictDoUpdate({
				target: jobSeeker.userId,
				set: {
					...jobSeekInsert,
				},
			})

		if (!currentJobSeeker) {
			throw new Error('Failed to create or fetch job seeker')
		}

		// Delete existing availability slots
		await Promise.all([
			trx
				.delete(availabilitySlots)
				.where(eq(availabilitySlots.jobSeekerId, currentJobSeeker.id)),
		])

		const availabilitySlotsListInsert = availabilitySlotsInput.map((i) => ({
			...i,
			jobSeekerId: currentJobSeeker.id,
		}))

		const [insertAvailabilitySlots] = await Promise.all([
			availabilitySlotsListInsert.length > 0
				? trx
						.insert(availabilitySlots)
						.values(availabilitySlotsListInsert)
						.returning()
				: Promise.resolve([]),
		])

		return {
			insertAvailabilitySlots,
		}
	})
}
