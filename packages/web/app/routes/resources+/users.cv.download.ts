import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { db } from '@nautikos/core/db'
import { jobSeeker } from '@nautikos/core/schema/job-seeker'
import { GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { eq } from 'drizzle-orm'
import { Resource } from 'sst'
import invariant from 'tiny-invariant'

import { requireUserSession } from '~/lib/auth.server'
import { s3Client } from '~/lib/s3.server'

const EXPIRES_IN_SECONDS = 3600
const INLINE_TYPES = ['pdf', 'jpg', 'jpeg', 'png', 'gif']

export async function loader({ request }: LoaderFunctionArgs) {
	await requireUserSession(request)

	const url = new URL(request.url)
	const s3Key = url.searchParams.get('s3Key')

	invariant(s3Key, 'S3 key is required')

	const existingJobSeeker = await db.query.jobSeeker.findFirst({
		where: eq(jobSeeker.cvFileS3Key, s3Key),
	})

	if (!jobSeeker || !jobSeeker.cvFileS3Key) {
		throw new Response('CV S3 key not found', { status: 404 })
	}

	// Optional: Check if the user has permission to access this attachment
	// if (!userHasPermission(user, attachment)) {
	//   throw new Response('Unauthorized', { status: 403 })
	// }
	const { cvFileS3Key } = jobSeeker

	const fileExtension = cvFileS3Key.split('.').pop().toLowerCase()
	const filenameASCII = encodeURIComponent(jobSeeker.cvFileS3Key)

	const contentDisposition = INLINE_TYPES.includes(fileExtension)
		? `inline; filename="${filenameASCII}"`
		: `attachment; filename="${filenameASCII}"`

	const getCommand = new GetObjectCommand({
		Bucket: Resource.NautikosMainBucket.name,
		Key: s3Key,
		ResponseContentDisposition: contentDisposition,
	})

	const viewUrl = await getSignedUrl(s3Client, getCommand, {
		expiresIn: EXPIRES_IN_SECONDS,
	})

	return json({
		viewUrl,
		expiresAt: new Date(Date.now() + EXPIRES_IN_SECONDS * 1000).toISOString(),
	})
}
