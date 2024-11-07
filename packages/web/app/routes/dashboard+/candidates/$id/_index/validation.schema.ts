import { z } from 'zod'

// copied from the core package
// Cant import the original enum because drizzle code would be shipped with the client bundle

const reviewSectionEnum = [
	'personal_info',
	'cv_and_resume',
	'intro_video',
	'education',
	'memberships',
	'professional_certifications',
	'corporate_experience',
	'seagoing_experience',
	'work_experience',
	'culture',
	'questions_and_answers',
	'publications',
] as const

export const ratingValueEnum = ['Good', 'Average', 'Unsatisfactory'] as const

export const placementAreaEnum = [
	'Freight_Forwarding',
	'Warehousing',
	'Chartering_Commercial',
	'Chartering_Operations',
	'Shipbroking',
	'Ship_Management',
	'Customer_Service',
	'Documentation',
	'Pricing',
	'Sales',
] as const

export type ReviewSectionType = (typeof reviewSectionEnum)[number]
export type RatingType = (typeof ratingValueEnum)[number]
export type PlacementAreaType = (typeof placementAreaEnum)[number]

const reviewCommentSchema = z.object({
	comment: z.string().max(400),
	section: z.enum(reviewSectionEnum),
	jobSeekerId: z.string(),
})

export const setReviewCommentSchema = reviewCommentSchema

const candidateEvaluationSchema = z.object({
	communication: z.enum(ratingValueEnum),
	presentation: z.enum(ratingValueEnum),
	industryKnowledge: z.enum(ratingValueEnum),
	areasOfPlacement: z.enum(placementAreaEnum).array().min(1),
	generalComments: z.string().max(400),
	jobSeekerId: z.string(),
})

export const submitCandidateEvaluationSchema = candidateEvaluationSchema
export const editCandidateEvaluationSchema = candidateEvaluationSchema.extend({
	id: z.string(),
})
