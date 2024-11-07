import { z } from 'zod'

export const verificationTypesList = [
	'onboarding',
	'reset-password',
	'change-email',
	'2fa',
] as const

export const VerificationTypeSchema = z.enum(verificationTypesList)

export type VerificationType = z.infer<typeof VerificationTypeSchema>

export const VerificationFormSchema = z.object({
	code: z
		.string({
			required_error: 'Code is required',
		})
		.length(6, { message: 'Code must contain exactly 6 characters' }),
	target: z.string(),
	type: VerificationTypeSchema,
})

export const VerificationParamsSchema = z.object({
	code: z.string().optional(),
	target: z.string(),
	type: VerificationTypeSchema,
})

export type VerificationParamsType = z.infer<typeof VerificationParamsSchema>
