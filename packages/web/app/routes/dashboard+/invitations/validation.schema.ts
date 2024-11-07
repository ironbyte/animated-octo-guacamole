import { z } from 'zod'

export const invitationStatusEnum = [
	'pending',
	'accepted',
	'declined',
	'revoked',
] as const

export const userRoleEnum = [
	'admin',
	'moderator',
	'org_member',
	'job_seeker',
] as const

export const inviteUserSchema = z
	.object({
		email: z
			.string({
				required_error: 'Email is required',
			})
			.email(),
		role: z.enum(userRoleEnum),
		organizationName: z.string().optional(),
	})
	.superRefine((data, ctx) => {
		if (data.role === 'org_member' && data.organizationName === undefined) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'Organization name is required',
				path: ['organizationName'],
			})

			return z.NEVER
		}
	})

export const revokeInvitationSchema = z.object({
	userInvitationId: z.string(),
})
