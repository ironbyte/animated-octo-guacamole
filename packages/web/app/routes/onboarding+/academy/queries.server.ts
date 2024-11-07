import { db } from '@nautikos/core/db'
import {
	education,
	type InsertEducationModel,
} from '@nautikos/core/schema/education'
import {
	jobSeeker,
	membership,
	professionalCertification,
	type InsertJobSeekerModel,
	type InsertMembershipModel,
	type InsertProfessionalCertificationModel,
} from '@nautikos/core/schema/job-seeker'
import { users } from '@nautikos/core/schema/users'
import { eq } from 'drizzle-orm'

export async function upsertAcademyData({
	jobSeekerData,
	membershipDataList,
	proCertDataList,
	userId,
	educationDataList,
}: {
	userId: string
	jobSeekerData: Partial<InsertJobSeekerModel>
	educationData?: Omit<InsertEducationModel, 'jobSeekerId'>
	membershipDataList: InsertMembershipModel[]
	proCertDataList: InsertProfessionalCertificationModel[]
	educationDataList: Omit<InsertEducationModel, 'jobSeekerId'>[]
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

		/*
				const [updatedEducation] = await trx
			.insert(education)
			.values({
				...educationData,
				jobSeekerId: currentJobSeeker.id,
			})
			.onConflictDoUpdate({
				target: education.jobSeekerId,
				set: educationData,
			})
			.returning()

		*/
		// Delete existing memberships and certifications
		await Promise.all([
			trx
				.delete(membership)
				.where(eq(membership.jobSeekerId, currentJobSeeker.id)),
			trx
				.delete(professionalCertification)
				.where(eq(professionalCertification.jobSeekerId, currentJobSeeker.id)),
			trx
				.delete(education)
				.where(eq(education.jobSeekerId, currentJobSeeker.id)),
		])

		// Prepare insert data for both memberships and certifications
		const membershipInserts = membershipDataList.map((i) => ({
			...i,
			jobSeekerId: currentJobSeeker.id,
		}))

		const certificationInserts = proCertDataList.map((i) => ({
			...i,
			jobSeekerId: currentJobSeeker.id,
		}))

		const educationInserts = educationDataList.map((i) => ({
			...i,
			jobSeekerId: currentJobSeeker.id,
		}))

		// Perform inserts in parallel if there's data
		const [insertedMemberships, insertedCertifications, insertedEducations] =
			await Promise.all([
				membershipInserts.length > 0
					? trx.insert(membership).values(membershipInserts).returning()
					: Promise.resolve([]),
				certificationInserts.length > 0
					? trx
							.insert(professionalCertification)
							.values(certificationInserts)
							.returning()
					: Promise.resolve([]),
				educationInserts.length > 0
					? trx.insert(education).values(educationInserts).returning()
					: Promise.resolve([]),
			])

		return {
			jobSeeker: currentJobSeeker,
			memberships: insertedMemberships,
			certifications: insertedCertifications,
			educations: insertedEducations,
		}
	})
}
