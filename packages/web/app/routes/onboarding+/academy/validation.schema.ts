import { z } from 'zod'

export const educationSchema = z
	.object({
		educationLevel: z.enum(['Postgraduate', 'Graduate', 'Diploma'], {
			required_error: 'Education level is required',
		}),
		institution: z.string({
			required_error: 'Institution is required',
		}),
		degreeName: z.string({
			required_error: 'Degree name is required',
		}),
		fieldOfStudy: z.string({
			required_error: 'Field of study is required',
		}),
		educationStartYear: z
			.string({
				required_error: 'Start year is required',
			})
			.transform((val) => parseInt(val, 10)),
		educationEndYear: z
			.string()
			.optional()
			.transform((val) => {
				if (!val) return undefined

				return parseInt(val, 10)
			}),
		isOngoing: z.boolean().optional().transform(Boolean),
	})
	.superRefine((data, ctx) => {
		if (!data.isOngoing && data.educationEndYear === undefined) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'Education end year is required when not ongoing',
				path: ['educationEndYear'],
			})
		}
	})

const proCertSchema = z.object({
	proInstitute: z.string({
		required_error: 'Institute is required',
	}),
	proCertificationName: z.string({
		required_error: 'Certification name is required',
	}),
})

const membershipSchema = z.object({
	membershipBodyName: z.string({
		required_error: 'Membership body name is required',
	}),
	membershipJoiningYear: z
		.string({
			required_error: 'Joining year is required',
		})
		.transform((val) => parseInt(val, 10)),
	membershipCertificate: z.string({
		required_error: 'Membership certificate number is required',
	}),
})

export const academySchema = z.object({
	educationFieldList: z
		.array(educationSchema)
		.min(1, 'You must have at least one education'),
	proCertFieldList: z.array(proCertSchema),
	membershipFieldList: z.array(membershipSchema),
})
