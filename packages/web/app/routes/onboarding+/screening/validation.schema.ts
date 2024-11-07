import { z } from 'zod'

// TODO: LOCALIZE THESE STRINGS
export const dayEnum = [
	'Monday',
	'Tuesday',
	'Wednesday',
	'Thursday',
	'Friday',
	'Saturday',
	'Sunday',
] as const

export const AvailabilitySlotSchema = z.object({
	day: z.string({
		required_error: 'Day is required',
	}),
	startTime: z.string({
		required_error: 'Start time is required',
	}),
	endTime: z.string({
		required_error: 'End time is required',
	}),
})

export const AvailabilitySlotsSchema = z
	.array(AvailabilitySlotSchema)
	.min(3, 'Please add 3 availability slots')
	.max(3, 'You can only add 3 availability slots')
