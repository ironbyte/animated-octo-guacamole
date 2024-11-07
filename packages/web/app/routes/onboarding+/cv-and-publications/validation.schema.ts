import { z } from 'zod'

const MAX_UPLOAD_SIZE = 1024 * 1024 * 3 // 3MB

const pdfFileSchema = z
	.instanceof(File, { message: 'PDF file is required' })
	.refine((file) => file.type === 'application/pdf', 'Only PDF file is allowed')
	.refine(
		(file) => file.size <= MAX_UPLOAD_SIZE,
		'File size should be less than 3MB',
	)

export const cvFileSchema = z.object({
	cvFile: pdfFileSchema,
})

export const publicationSchema = z.object({
	publicationsFieldList: z.array(
		z.object({
			publicationLink: z
				.string({
					required_error: 'Website URL is required',
				})
				.url('Website URL is not valid'),
		}),
	),
	jobSeekerFieldSet: z.object({
		personalWebsiteUrl: z
			.string({
				required_error: 'Linkedin URL is required',
			})
			.url('Linkedin URL is not valid'),
	}),
})
