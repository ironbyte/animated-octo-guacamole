import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { db } from '@nautikos/core/db'
import { jobSeeker } from '@nautikos/core/schema/job-seeker'
import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { eq } from 'drizzle-orm'
import { Resource } from 'sst'
import invariant from 'tiny-invariant'
import { ulid } from 'ulidx'

import { requireUserSession } from '~/lib/auth.server'
import { s3Client } from '~/lib/s3.server'

const EXPIRES_IN_SECONDS = 3600

export async function loader({ request }: LoaderFunctionArgs) {
	const userSession = await requireUserSession(request)

	const url = new URL(request.url)
	const fileName = url.searchParams.get('filename')
	const fileType = url.searchParams.get('filetype')

	invariant(fileName, 'Filename is required')
	invariant(fileType, 'File type is required')

	const decodedFileName = decodeURIComponent(fileName)

	console.log('userSession: ', JSON.stringify(userSession, null, 2))

	// get job seeker id from the user
	const [existingJobSeeker] = await db
		.insert(jobSeeker)
		.values({
			userId: userSession.user.id,
		})
		.returning()
		.onConflictDoUpdate({
			target: jobSeeker.userId,
			set: {
				userId: userSession.user.id,
			},
		})

	if (!existingJobSeeker) {
		throw new Error('Failed to create or fetch job seeker')
	}

	const s3Key = `job-seekers/${existingJobSeeker.id}/cv/file.pdf`

	const command = new PutObjectCommand({
		Key: s3Key,
		Bucket: Resource.NautikosMainBucket.name,
		ContentType: fileType,
		Metadata: {
			userId: userSession.id,
			originalFileName: decodedFileName,
		},
	})

	const uploadUrl = await getSignedUrl(s3Client, command, {
		expiresIn: EXPIRES_IN_SECONDS,
	})

	// Generate a pre-signed URL for viewing/downloading
	const getCommand = new GetObjectCommand({
		Bucket: Resource.NautikosMainBucket.name,
		Key: s3Key,
	})

	const viewUrl = await getSignedUrl(s3Client, getCommand, {
		expiresIn: EXPIRES_IN_SECONDS,
	})

	return json({
		s3Key,
		uploadUrl,
		viewUrl,
		expiresAt: new Date(Date.now() + EXPIRES_IN_SECONDS * 1000).toISOString(),
	})
}
