import { z } from 'zod'

export const videoResumeSchema = z.object({
	videoCVUrl: z
		.string({
			required_error: 'Video resume URL is required',
		})
		.url('Video resume URL is not valid'),
})
