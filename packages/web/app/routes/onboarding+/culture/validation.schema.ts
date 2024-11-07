import { z } from 'zod'

export const workEnvironmentOptions = [
	'Defined roles and responsibilities with consistent feedback from management',
	'Dynamic roles requiring self-initiative and problem-solving',
] as const

export const jobValuesOptions = [
	'Having a say in what I work on and how I work',
	'Opportunities for career progression',
	'Learning from experienced team members',
	'Working for a company with strong growth potential',
	"Influencing the company's or team's direction",
	'Access to mentorship',
	'Developing new skills and knowledge',
	'Tackling challenging logistical problems',
	'Being part of a diverse team',
] as const

export const emiratesPreferencesEnum = [
	'Abu Dhabi',
	'Dubai',
	'Sharjah',
	'Ajman',
	'Umm Al Quwain',
	'Ras Al Khaimah',
	'Fujairah',
] as const

export const cultureSchema = z.object({
	jobSeekerFieldSet: z.object({
		availableFrom: z.date({
			required_error: 'Available from is required',
		}),
		emiratesPreference: z
			.enum(
				[
					'Abu Dhabi',
					'Dubai',
					'Sharjah',
					'Ajman',
					'Umm Al Quwain',
					'Ras Al Khaimah',
					'Fujairah',
				],
				{
					required_error: 'Emirates preference is required',
				},
			)
			.array()
			.min(1, 'Please select at least one Emirates preference'),
	}),
	targetCompaniesList: z
		.array(z.string())
		.min(1, 'Please select at least one target company')
		.max(2, 'You can only select up to two target companies at most')
		.transform((val) => {
			return val.map((i) => ({
				companyId: i,
			}))
		}),
	jobSeekerQA: z.object({
		nextJobSeek: z.string({
			required_error: 'Next job seek is required',
		}),
		motivation: z.string({
			required_error: 'Motivation is required',
		}),
		workEnvironment: z.enum(workEnvironmentOptions, {
			required_error: 'Work environment is required',
		}),
		topValuesInNextJob: z
			.array(z.enum(jobValuesOptions))
			.min(1, 'Please select at least two options')
			.max(2, 'You can only select up to two top job values at most'),
	}),
})
