import { db } from '@nautikos/core/db'
import {
	jobSeeker,
	type InsertJobSeekerModel,
} from '@nautikos/core/schema/job-seeker'
import { users } from '@nautikos/core/schema/users'
import { eq } from 'drizzle-orm'

export async function upsertVideoCvData({
	jobSeekerData,
	userId,
}: {
	userId: string
	jobSeekerData: Partial<InsertJobSeekerModel>
}) {
	await db.transaction(async (trx) => {
		const existingUser = await trx.query.users.findFirst({
			where: eq(users.id, userId),
		})

		if (!existingUser) {
			throw new Error('User not found')
		}

		const jobSeekInsert = {
			...jobSeekerData,
			userId,
		}
		// TODO: INSERT CV S3 KEY INTO THE JOB SEEKER

		// Insert or do nothing for job seeker
		const [currentJobSeeker] = await trx
			.insert(jobSeeker)
			.values(jobSeekInsert)
			.returning()
			.onConflictDoUpdate({
				target: jobSeeker.userId,
				set: jobSeekInsert,
			})

		if (!currentJobSeeker) {
			throw new Error('Failed to create or fetch job seeker')
		}
	})
}
