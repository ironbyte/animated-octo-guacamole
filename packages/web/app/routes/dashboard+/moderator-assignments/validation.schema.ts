import { z } from 'zod'

const assignmentStatusEnum = ['active', 'completed'] as const

export const moderatorAssignmentSchema = z.object({
	jobSeekerId: z.string(),
	moderatorId: z.string(),
	notes: z.string().optional(),
})

export const createModeratorAssignmentSchema = moderatorAssignmentSchema

export const editModeratorAssignmentSchema = moderatorAssignmentSchema.extend({
	id: z.string(),
	status: z.enum(assignmentStatusEnum),
})
