import { z } from 'zod'

import { getMonthNumber } from '~/components/conform/month-picker'

export const YesOrNoOptionsList = [
	{ value: 'yes', label: 'Yes' },
	{ value: 'no', label: 'No' },
]

export const seaRankEnum = [
	'Chief Officer',
	'Chief Engineer',
	'2nd Officer',
	'2nd Engineer',
	'3rd Officer',
	'3rd Engineer',
	'4th Engineer',
	'Cadet',
	'Radio Officer',
] as const

export const skillEnum = [
	'Chartering',
	'Ship broking',
	'Post-fixture',
	'Commercial managers',
	'Technical managers',
	'Crewing',
	'Bunkering',
	'Ship Chandling',
	'Stevedoring',
	'Customs clearance',
	'Port agents',
	'Container Line',
	'NVOCC',
	'Freight Forwarder',
	'Project cargo / Break-bulk',
	'Cruise industry',
	'Manufacturing',
	'Trading',
	'Road Transport',
	'Warehousing',
	'Oil / Chemicals Terminal',
	'Container Terminal',
	'Port',
	'Back office',
	'Customer Service',
	'IT solutions',
	'Legal',
	'Finance',
	'Training / Teaching',
	'Consultancy',
] as const

export const jobTypeEnum = [
	'Internship',
	'Consultant',
	'Part-time',
	'Full-time',
] as const

export const peopleManagementExperienceInYearsEnum = [
	'5+ years',
	'1-5 years',
	'No experience',
] as const

const yesNoSchema = z
	.enum(['yes', 'no'], {
		required_error: 'Please select yes or no',
	})
	.transform((value) => value === 'yes')

export const jobSeekerFieldSet = z.object({
	totalYearsExperience: z
		.number({
			required_error: 'Total years of experience is required',
		})
		.positive('Total years of experience must be a positive number'),
	peopleManagementExperience: z.enum(
		['5+ years', '1-5 years', 'No experience'],
		{
			required_error: 'People management experience is required',
		},
	),
	arabicSpeaking: yesNoSchema,
	dubaiTradePortal: yesNoSchema,
	uaeCustoms: yesNoSchema,
	freeZoneProcess: yesNoSchema,
})

export const seaGoingExperienceSet = z.object({
	seaRank: z.enum(seaRankEnum).optional(),
	totalYearsSeaGoingExperience: z
		.number()
		.positive('Total years of experience must be a positive number')
		.optional(),
})

export const workExperienceSchema = z.object({
	company: z.string({
		required_error: 'Company is required',
	}),
	countryId: z.string({
		required_error: 'Country is required',
	}),
	state: z.string().optional(),
	role: z.string({
		required_error: 'Role is required',
	}),
	jobType: z.enum(jobTypeEnum, {
		required_error: 'Job type is required',
	}),
	workStartMonth: z
		.string({
			required_error: 'Work start month is required',
		})
		.transform((val) => getMonthNumber(val)),
	workStartYear: z
		.string({
			required_error: 'Work start year is required',
		})
		.transform((val) => parseInt(val, 10)),
	workEndYear: z
		.string()
		.optional()
		.transform((val) => {
			if (!val) return undefined

			return parseInt(val, 10)
		}),
	workEndMonth: z
		.string({
			required_error: 'Work end month is required',
		})
		.optional()
		.transform((val) => {
			if (!val) return undefined

			getMonthNumber(val)
		}),
	measurableAchievements: z.string({
		required_error: 'Measurable achievements are required',
	}),
	isOngoing: z.boolean().optional().transform(Boolean),
})

export const workExperienceFieldList = z.array(workExperienceSchema)

export const skillsSchema = z
	.array(z.enum(skillEnum))
	.min(3, 'Please select at least 3 skills')

export const workSchema = z.object({
	jobSeekerFieldSet: jobSeekerFieldSet,
	seaGoingExperienceSet: seaGoingExperienceSet,
	skills: skillsSchema,
	workExperienceFieldList: z
		.array(workExperienceSchema)
		.min(1, 'Please specify at least 1 work experiences')
		.max(3, "You can't have more than 3 work experiences")

		.refine(
			(val) => {
				const ongoingCount = val.filter((exp) => exp.isOngoing).length

				return ongoingCount <= 1
			},
			{
				message: 'You can have at most 1 ongoing work experience',
			},
		),
})
