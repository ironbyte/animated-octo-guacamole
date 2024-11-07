import { db } from '@nautikos/core/db'
import {
	jobSeeker,
	jobSeekerSkill,
	seagoingExperience,
	type InsertJobSeekerModel,
	type InsertJobSeekerSkillModel,
	type InsertSeagoingExperienceModel,
	type skillEnum,
} from '@nautikos/core/schema/job-seeker'
import { users } from '@nautikos/core/schema/users'
import {
	workExperience,
	type InsertWorkExperienceModel,
} from '@nautikos/core/schema/work-experience'
import { eq } from 'drizzle-orm'

type SkillEnum = (typeof skillEnum)[number]

export async function upsertExperienceData({
	jobSeekerData,
	workExperienceList,
	userId,
	jobSeekerSkillsList,
	seaGoingExperienceData,
}: {
	userId: string
	jobSeekerData: Partial<InsertJobSeekerModel>
	workExperienceList: InsertWorkExperienceModel[]
	jobSeekerSkillsList: SkillEnum[]
	seaGoingExperienceData: Partial<InsertSeagoingExperienceModel>
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

		let updatedSeagoingExperience = null

		if (
			seaGoingExperienceData.seaRank &&
			seaGoingExperienceData.totalYearsSeaGoingExperience
		) {
			// Stupid TS
			updatedSeagoingExperience = await trx
				.insert(seagoingExperience)
				.values({
					...seaGoingExperienceData,
					jobSeekerId: currentJobSeeker.id,
				})
				.onConflictDoUpdate({
					target: seagoingExperience.jobSeekerId,
					set: seaGoingExperienceData,
				})
				.returning()
		}

		// Delete existing workExperiences
		await Promise.all([
			trx
				.delete(workExperience)
				.where(eq(workExperience.jobSeekerId, currentJobSeeker.id)),
		])

		// Delete existing job seeker skills
		await Promise.all([
			trx
				.delete(jobSeekerSkill)
				.where(eq(jobSeekerSkill.jobSeekerId, currentJobSeeker.id)),
		])

		// Prepare insert data for both memberships and certifications
		const workExperienceInserts = workExperienceList.map((i) => ({
			...i,
			jobSeekerId: currentJobSeeker.id,
		}))

		const jobSeekerSkillsInserts: InsertJobSeekerSkillModel[] =
			jobSeekerSkillsList.map((i) => ({
				skill: i,
				jobSeekerId: currentJobSeeker.id,
			}))

		const [insertedWorkExperiences, insertedSkills] = await Promise.all([
			workExperienceInserts.length > 0
				? trx.insert(workExperience).values(workExperienceInserts).returning()
				: Promise.resolve([]),

			jobSeekerSkillsInserts.length > 0
				? trx.insert(jobSeekerSkill).values(jobSeekerSkillsInserts).returning()
				: Promise.resolve([]),
		])

		return {
			jobSeeker: currentJobSeeker,
			workExperience: insertedWorkExperiences,
			skills: insertedSkills,
			updatedSeagoingExperience,
		}
	})
}
