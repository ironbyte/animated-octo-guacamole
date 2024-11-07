import { db } from '@nautikos/core/db'
import {
	jobSeeker,
	type InsertJobSeekerModel,
} from '@nautikos/core/schema/job-seeker'
import {
	publications,
	type InsertPublicationModel,
} from '@nautikos/core/schema/publications'
import { users } from '@nautikos/core/schema/users'
import { eq } from 'drizzle-orm'

export async function upsertMedia({
	jobSeekerData,
	publicationsDataList,
	userId,
}: {
	userId: string
	jobSeekerData: Partial<InsertJobSeekerModel>
	publicationsDataList: InsertPublicationModel[]
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

		// Delete existing publications
		await trx
			.delete(publications)
			.where(eq(publications.jobSeekerId, currentJobSeeker.id))

		const publicationsInsertList = publicationsDataList.map((i) => ({
			...i,
			jobSeekerId: currentJobSeeker.id,
		}))

		if (publicationsInsertList.length === 0) {
			return
		}

		await trx.insert(publications).values(publicationsInsertList)

		if (!currentJobSeeker) {
			throw new Error('Failed to create or fetch job seeker')
		}
	})
}
