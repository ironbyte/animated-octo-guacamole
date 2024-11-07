import { db } from '@nautikos/core/db'
import {
	jobSeeker,
	jobSeekerQuestions,
	targetCompany,
	type InsertJobSeekerModel,
	type InsertJobSeekerQuestionsModel,
	type InsertTargetCompanyModel,
} from '@nautikos/core/schema/job-seeker'
import { users } from '@nautikos/core/schema/users'
import { eq } from 'drizzle-orm'

export async function upsertJobSeekerQA({
	userId,
	jobSeekerQA,
	targetCompaniesList,
	jobSeekerData,
}: {
	userId: string
	jobSeekerQA: InsertJobSeekerQuestionsModel
	targetCompaniesList: InsertTargetCompanyModel[]
	jobSeekerData: Pick<
		InsertJobSeekerModel,
		'availableFrom' | 'emiratesPreference'
	>
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

		await Promise.all([
			trx
				.delete(targetCompany)
				.where(eq(targetCompany.jobSeekerId, currentJobSeeker.id)),
		])

		const targetCompaniesListInsert = targetCompaniesList.map((i) => ({
			...i,
			jobSeekerId: currentJobSeeker.id,
		}))

		const [insertedJobSeekerQA] = await trx
			.insert(jobSeekerQuestions)
			.values({
				...jobSeekerQA,
				jobSeekerId: currentJobSeeker.id,
			})
			.onConflictDoUpdate({
				target: jobSeekerQuestions.jobSeekerId,
				set: jobSeekerQA,
			})
			.returning()

		const [insertTargetCompanies] = await Promise.all([
			targetCompaniesListInsert.length > 0
				? trx
						.insert(targetCompany)
						.values(targetCompaniesListInsert)
						.returning()
				: Promise.resolve([]),
		])

		return {
			jobSeekerQA: insertedJobSeekerQA,
			insertTargetCompanies,
		}
	})
}
