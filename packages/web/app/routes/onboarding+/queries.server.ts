import { db } from '@nautikos/core/db'
import { companies } from '@nautikos/core/schema/companies'
import { education } from '@nautikos/core/schema/education'
import {
	availabilitySlots,
	jobSeeker,
	jobSeekerQuestions,
	jobSeekerSkill,
	targetCompany,
} from '@nautikos/core/schema/job-seeker'
import { workExperience } from '@nautikos/core/schema/work-experience'
import { asc, count, eq } from 'drizzle-orm'

export async function checkAvailabilitySlotsCompletion(jobSeekerId: string) {
	const [availabilitySlotsList] = await db
		.select({ count: count() })
		.from(availabilitySlots)
		.where(eq(availabilitySlots.jobSeekerId, jobSeekerId))

	const availabilitySlotsStatus =
		availabilitySlotsList?.count && availabilitySlotsList.count === 3

	return {
		isComplete: availabilitySlotsStatus,
	}
}

export async function checkWorkExperienceCompletion(jobSeekerId: string) {
	const [jobSeekerData] = await db
		.select({
			dubaiTradePortal: jobSeeker.dubaiTradePortal,
			arabicSpeaking: jobSeeker.arabicSpeaking,
			uaeCustoms: jobSeeker.uaeCustoms,
			freeZoneProcess: jobSeeker.freeZoneProcess,
			totalYearsExperience: jobSeeker.totalYearsExperience,
			peopleManagementExperience: jobSeeker.peopleManagementExperience,
		})
		.from(jobSeeker)
		.where(eq(jobSeeker.id, jobSeekerId))
		.limit(1)

	const dubaiTradePortalStatus = jobSeekerData?.dubaiTradePortal !== null
	const arabicSpeakingStatus = jobSeekerData?.arabicSpeaking !== null
	const uaeCustomsStatus = jobSeekerData?.uaeCustoms !== null
	const freeZoneProcessStatus = jobSeekerData?.freeZoneProcess !== null
	const totalYearsExperienceStatus = jobSeekerData?.totalYearsExperience
	const peopleManagementExperienceStatus = Boolean(
		jobSeekerData?.peopleManagementExperience,
	)

	const [workExperienceList] = await db
		.select({ count: count() })
		.from(workExperience)
		.where(eq(workExperience.jobSeekerId, jobSeekerId))

	const [skillsList] = await db
		.select({
			count: count(),
		})
		.from(jobSeekerSkill)
		.where(eq(jobSeekerSkill.jobSeekerId, jobSeekerId))

	const workExperienceStatus =
		workExperienceList?.count && workExperienceList?.count > 4

	const skillsStatus = skillsList?.count && skillsList?.count > 2

	return {
		isComplete:
			dubaiTradePortalStatus &&
			arabicSpeakingStatus &&
			uaeCustomsStatus &&
			freeZoneProcessStatus &&
			totalYearsExperienceStatus &&
			peopleManagementExperienceStatus &&
			skillsStatus,

		dubaiTradePortalStatus,
		arabicSpeakingStatus,
		uaeCustomsStatus,
		freeZoneProcessStatus,
		totalYearsExperienceStatus,
		peopleManagementExperienceStatus,
		workExperienceStatus,
		skillsStatus,
	}
}

export async function checkAcademyCompletion(jobSeekerId: string) {
	const [educationCount] = await db
		.select({ count: count() })
		.from(education)
		.where(eq(education.jobSeekerId, jobSeekerId))

	const educationStatus = educationCount && educationCount.count > 0

	return {
		isComplete: educationStatus,
	}
}

export async function checkPublicationCompletion(jobSeekerId: string) {
	const [jobSeekerData] = await db
		.select({
			cvFileS3Key: jobSeeker.cvFileS3Key,
			personalWebsiteUrl: jobSeeker.personalWebsiteUrl,
		})
		.from(jobSeeker)
		.where(eq(jobSeeker.id, jobSeekerId))
		.limit(1)

	const cvFileStatus = jobSeekerData?.cvFileS3Key
	const personalWebsiteUrlStatus = jobSeekerData?.personalWebsiteUrl

	return {
		isComplete: cvFileStatus && personalWebsiteUrlStatus,
		cvFileStatus,
	}
}

export async function checkVideoCvCompletion(jobSeekerId: string) {
	const [jobSeekerData] = await db
		.select({
			videoCVUrl: jobSeeker.videoCVUrl,
		})
		.from(jobSeeker)
		.where(eq(jobSeeker.id, jobSeekerId))
		.limit(1)

	const videoCVUrlStatus = jobSeekerData?.videoCVUrl

	return {
		isComplete: videoCVUrlStatus,
		videoCVUrlStatus,
	}
}

export async function checkCultureCompletion(jobSeekerId: string) {
	const [targetCompanyCount] = await db
		.select({ count: count() })
		.from(targetCompany)
		.where(eq(targetCompany.jobSeekerId, jobSeekerId))

	const [jobSeekerData] = await db
		.select({
			availableFrom: jobSeeker.availableFrom,
			emiratesPreference: jobSeeker.emiratesPreference,
		})
		.from(jobSeeker)
		.where(eq(jobSeeker.id, jobSeekerId))
		.limit(1)

	const [jobSeekerQuestionsCount] = await db
		.select({ count: count() })
		.from(jobSeekerQuestions)
		.where(eq(jobSeekerQuestions.jobSeekerId, jobSeekerId))

	const targetCompanyStatus = targetCompanyCount && targetCompanyCount.count > 0
	const availableFromStatus = jobSeekerData?.availableFrom
	const emiratesPreferenceStatus =
		Array.isArray(jobSeekerData?.emiratesPreference) &&
		jobSeekerData?.emiratesPreference.length > 0
	const jobSeekerQuestionsStatus =
		jobSeekerQuestionsCount && jobSeekerQuestionsCount.count > 0

	return {
		isComplete:
			jobSeekerQuestionsStatus &&
			availableFromStatus &&
			emiratesPreferenceStatus &&
			targetCompanyStatus,
		availableFromStatus,
		jobSeekerQuestionsStatus,
		emiratesPreferenceStatus,
		targetCompanyStatus,
	}
}

export async function getListOfCompanies() {
	const companiesList = await db.query.companies.findMany({
		columns: {
			id: true,
			name: true,
		},
		orderBy: [asc(companies.name)],
	})

	return companiesList
}

export async function getOnboardingInfoByUserId({
	userId,
}: {
	userId: string
}) {
	const jobSeekerData = await db.query.jobSeeker.findFirst({
		where: eq(jobSeeker.userId, userId),
		with: {
			availabilitySlots: true,
			workExperiences: {
				with: {
					country: {
						columns: {
							name: true,
							code: true,
							id: true,
						},
					},
				},
			},
			memberships: true,
			professionalCertifications: true,
			education: true,
			skills: true,
			publications: true,
			seagoingExperience: true,
			targetCompanies: {
				columns: {
					companyId: true,
				},
				with: {
					company: {
						columns: {
							name: true,
						},
					},
				},
			},
			jobSeekerQuestions: true,
		},
	})

	return jobSeekerData
}

type RelatedDataOptions = {
	includeAvailabilitySlots?: boolean
	includeWorkExperiences?: boolean
	includeMemberships?: boolean
	includeProfessionalCertifications?: boolean
	includeEducation?: boolean
	includeSkills?: boolean
	includePublications?: boolean
	includeSeagoingExperience?: boolean
	includeTargetCompanies?: boolean
	includeJobSeekerQuestions?: boolean
}

export async function getOnboardingInfoByUserIdV2({
	userId,
	includeRelatedData = {},
}: {
	userId: string
	includeRelatedData?: RelatedDataOptions
}) {
	try {
		const jobSeekerData = await db.query.jobSeeker.findFirst({
			where: eq(jobSeeker.userId, userId),
			with: {
				availabilitySlots: includeRelatedData.includeAvailabilitySlots
					? true
					: undefined,
				workExperiences: includeRelatedData.includeWorkExperiences
					? {
							with: {
								country: {
									columns: {
										name: true,
										code: true,
										id: true,
									},
								},
							},
						}
					: undefined,
				memberships: includeRelatedData.includeMemberships ? true : undefined,
				professionalCertifications:
					includeRelatedData.includeProfessionalCertifications
						? true
						: undefined,
				education: includeRelatedData.includeEducation ? true : undefined,
				skills: includeRelatedData.includeSkills ? true : undefined,
				publications: includeRelatedData.includePublications ? true : undefined,
				seagoingExperience: includeRelatedData.includeSeagoingExperience
					? true
					: undefined,
				targetCompanies: includeRelatedData.includeTargetCompanies
					? {
							columns: {
								companyId: true,
							},
							with: {
								company: {
									columns: {
										name: true,
									},
								},
							},
						}
					: undefined,
				jobSeekerQuestions: true,
			},
		})

		return jobSeekerData
	} catch (error) {
		console.error('Error fetching onboarding info:', error)
		throw new Error('Failed to fetch onboarding information')
	}
}
