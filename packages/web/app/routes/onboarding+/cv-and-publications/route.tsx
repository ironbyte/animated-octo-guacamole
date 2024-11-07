import {
	json,
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
} from '@remix-run/node'
import { useActionData, useFetcher, useLoaderData } from '@remix-run/react'
import { db } from '@nautikos/core/db'
import { jobSeeker } from '@nautikos/core/schema/job-seeker'
import {
	DeleteObjectCommand,
	GetObjectCommand,
	PutObjectCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import {
	getFieldsetProps,
	getFormProps,
	getInputProps,
	useForm,
} from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { format } from 'date-fns'
import { eq } from 'drizzle-orm'
import { AlertCircle, FileUpIcon, Plus } from 'lucide-react'
import { Resource } from 'sst'

import { Divider } from '~/components/divider'
import { ErrorList } from '~/components/error-list'
import { Field } from '~/components/forms'
import { Marker } from '~/components/marker'
import { Spacer } from '~/components/spacer'
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Label } from '~/components/ui/label'
import { requireUserSession } from '~/lib/auth.server'
import { s3Client } from '~/lib/s3.server'
import { createToastHeaders } from '~/lib/toast.server'
import { useOnboardingInfo } from '~/lib/utils'
import { upsertMedia } from './queries.server'
import { cvFileSchema, publicationSchema } from './validation.schema'

export const ROUTE_PATH = '/onboarding/cv-and-publications' as const
const EXPIRES_IN_SECONDS = 3600
const SUPPORTED_CV_FILE_TYPES: string[] = ['pdf'] as const
const schema = publicationSchema

export enum MediaActionIntent {
	saveForm = 'save-form',
	deleteCvFile = 'delete-cv-file',
	uploadCvFile = 'upload-cv-file',
}

async function handleSaveAction({
	userId,
	formData,
	request,
}: {
	userId: string
	formData: FormData
	request: Request
}) {
	const userSession = await requireUserSession(request)
	const submission = await parseWithZod(formData, { schema })

	// Send the submission back to the client if the status is not successful
	if (submission.status !== 'success') {
		return json(
			{ result: submission.reply() },
			{ status: submission.status === 'error' ? 400 : 200 },
		)
	}

	const { jobSeekerFieldSet, publicationsFieldList } = submission.value

	const jobSeekerData = await db.query.jobSeeker.findFirst({
		where: eq(jobSeeker.userId, userSession.user.id),
		columns: {
			cvFileS3Key: true,
		},
	})

	if (!jobSeekerData?.cvFileS3Key) {
		return json(
			{
				result: submission.reply({
					formErrors: ['Please upload your CV file'],
				}),
			},
			{
				status: 400,
			},
		)
	}

	await upsertMedia({
		jobSeekerData: jobSeekerFieldSet,
		publicationsDataList: publicationsFieldList,
		userId,
	})

	return json(
		{
			result: submission.reply(),
		},
		{
			headers: await createToastHeaders({
				type: 'success',
				title: 'Success',
				description: 'Your changes have been saved',
			}),
		},
	)
}

async function handleDeleteCVFileAction({
	formData,
	request,
}: {
	formData: FormData
	request: Request
}) {
	const userSession = await requireUserSession(request)
	const s3Key = formData.get('cvFileS3Key')?.toString()

	console.log('s3Key: ', s3Key)
	if (!s3Key) return null

	const deleteS3ObjectCommand = new DeleteObjectCommand({
		Key: s3Key,
		Bucket: Resource.NautikosMainBucket.name,
	})

	await s3Client.send(deleteS3ObjectCommand)

	await db.update(jobSeeker).set({
		cvFileName: null,
		cvFileS3Key: null,
		cvUploadedAt: null,
	})

	return null
}

async function handleUploadCVFileAction({
	formData,
	request,
}: {
	formData: FormData
	request: Request
}) {
	const userSession = await requireUserSession(request)

	const submission = await parseWithZod(formData, {
		schema: cvFileSchema,
	})

	// Send the submission back to the client if the status is not successful
	if (submission.status !== 'success') {
		return json(
			{ result: submission.reply() },
			{ status: submission.status === 'error' ? 400 : 200 },
		)
	}

	const { cvFile } = submission.value

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

	// Todo: use submission.reply() to return error message
	if (!existingJobSeeker) {
		throw new Error('Failed to create or fetch job seeker')
	}

	const s3Key = `job-seekers/${existingJobSeeker.id}/cv/file.pdf`
	const cvFileArrBuffer = await cvFile.arrayBuffer()

	const putS3ObjectCommand = new PutObjectCommand({
		Bucket: Resource.NautikosMainBucket.name,
		Key: s3Key,
		ContentType: cvFile.type,
		Body: new Uint8Array(cvFileArrBuffer),
		Metadata: {
			userId: userSession.id,
			originalFileName: cvFile.name,
		},
	})

	await s3Client.send(putS3ObjectCommand)

	await db.update(jobSeeker).set({
		cvFileName: cvFile.name,
		cvFileS3Key: s3Key,
		cvUploadedAt: new Date(),
	})

	return json(
		{
			result: submission.reply(),
		},
		{
			headers: await createToastHeaders({
				type: 'success',
				title: 'Success',
				description: 'CV file has been uploaded successfully',
			}),
		},
	)
}

export async function action({ request }: ActionFunctionArgs) {
	const userSession = await requireUserSession(request)
	const userId = userSession.user.id

	const formData = await request.formData()
	const intent = formData.get('intent')

	switch (intent) {
		case MediaActionIntent.saveForm:
			return handleSaveAction({
				userId,
				formData,
				request,
			})

		case MediaActionIntent.uploadCvFile:
			return handleUploadCVFileAction({
				request,
				formData,
			})

		case MediaActionIntent.deleteCvFile:
			return handleDeleteCVFileAction({
				request,
				formData,
			})

		default:
			throw new Response(`Invalid intent "${intent}"`, { status: 400 })
	}
}

export async function loader({ request }: LoaderFunctionArgs) {
	const userSession = await requireUserSession(request)

	const jobSeekerData = await db.query.jobSeeker.findFirst({
		where: eq(jobSeeker.userId, userSession.user.id),
		columns: {
			cvFileName: true,
			cvFileS3Key: true,
		},
	})

	if (!jobSeekerData) return null

	if (!jobSeekerData.cvFileS3Key) return null

	const getS3ObjectCommand = new GetObjectCommand({
		Key: jobSeekerData.cvFileS3Key,
		Bucket: Resource.NautikosMainBucket.name,
	})

	const presignedGetUrl = await getSignedUrl(s3Client, getS3ObjectCommand, {
		expiresIn: EXPIRES_IN_SECONDS,
	})

	return json({
		cvS3Url: presignedGetUrl,
	})
}

function OnboardingMediaForm() {
	// const lastResult = useActionData<typeof action>()
	const onboardingInfo = useOnboardingInfo()
	const fetcher = useFetcher()

	// The useForm hook will return all the metadata we need to render the form
	// and put focus on the first invalid field when the form is submitted
	const [form, fields] = useForm({
		// This not only syncs the error from the server
		// But is also used as the default value of the form
		// in case the document is reloaded for progressive enhancement
		lastResult: fetcher.data?.result,
		onValidate({ formData }) {
			// Run the same validation logic on client
			const submission = parseWithZod(formData, { schema })

			if (submission.status !== 'success') {
				console.log('submission errors:', submission.error)
				console.log('submission payload: ', submission.payload)
				console.log('submission reply: ', submission.reply())
				console.log('submission status: ', submission.status)
			}

			return submission
		},
		constraint: getZodConstraint(schema),
		// Validate field once user leaves the field
		shouldValidate: 'onBlur',
		// Then, revalidate field as user types again
		shouldRevalidate: 'onInput',
		defaultValue: {
			jobSeekerFieldSet: {
				personalWebsiteUrl: onboardingInfo?.personalWebsiteUrl,
			},
			publicationsFieldList: [...(onboardingInfo?.publications || [])],
		},
	})

	const jobSeekerFieldSet = fields.jobSeekerFieldSet.getFieldset()
	const publicationsFieldList = fields.publicationsFieldList.getFieldList()

	return (
		<fetcher.Form
			method="POST"
			{...getFormProps(form)}
			encType="multipart/form-data"
		>
			<Field
				labelProps={{ children: 'Linkedin URL*' }}
				inputProps={{
					...getInputProps(jobSeekerFieldSet.personalWebsiteUrl, {
						type: 'text',
					}),
				}}
				errors={jobSeekerFieldSet.personalWebsiteUrl.errors}
			/>
			{/**
			 * PUBLICATIONS FIELD LIST
			 */}

			<div className="text-foreground-destructive text-[10px]">
				{fields.publicationsFieldList.errors}
			</div>

			<>
				<div className="mb-4 flex items-center justify-between">
					<h1 className="text-lg font-semibold">Publications</h1>
					<Button
						{...form.insert.getButtonProps({
							name: fields.publicationsFieldList.name,
						})}
					>
						<Plus className="mr-2 h-4 w-4" />
						Add
					</Button>
				</div>

				{publicationsFieldList.map((field, index) => {
					const publicationsFields = field.getFieldset()

					return (
						<fieldset
							{...getFieldsetProps(field)}
							key={field.key}
							className="mb-8 w-full px-2"
						>
							<Marker key={`${field.key}+${index}`} value={`${index + 1}`} />

							<Field
								labelProps={{ children: `Website URL` }}
								inputProps={{
									...getInputProps(publicationsFields.publicationLink, {
										type: 'text',
									}),
								}}
								errors={publicationsFields.publicationLink.errors}
							/>
							<div className="flex gap-2">
								<Button
									variant="secondary"
									{...form.reorder.getButtonProps({
										name: fields.publicationsFieldList.name,
										from: index,
										to: 0,
									})}
								>
									Move to top
								</Button>
								<Button
									variant="destructive"
									{...form.remove.getButtonProps({
										name: fields.publicationsFieldList.name,
										index,
									})}
								>
									Remove
								</Button>
							</div>
						</fieldset>
					)
				})}
			</>

			<ErrorList errors={form.errors} />

			<Spacer size="xs" />

			<div className="mt-2 flex w-full gap-2">
				<Button
					type="submit"
					className="w-full"
					variant="secondary"
					name="intent"
					value={MediaActionIntent.saveForm}
					disabled={fetcher.state === 'submitting'}
				>
					{fetcher.state === 'submitting' ? 'Saving...' : 'Save'}
				</Button>
			</div>
		</fetcher.Form>
	)
}

function CvFileForm() {
	const lastResult = useActionData<typeof action>()
	const loaderData = useLoaderData<typeof loader>()
	const uploadCvFileFormFetcher = useFetcher()
	const deleteCvFileFormFetcher = useFetcher()
	const onboardingInfo = useOnboardingInfo()

	const cvFileUrl = loaderData?.cvS3Url
	const cvFileS3Key = onboardingInfo?.cvFileS3Key
	const cvFileUploadedAt = onboardingInfo?.cvUploadedAt
		? format(onboardingInfo?.cvUploadedAt, 'dd/MM/yyyy HH:mm')
		: null

	const isUploadPendingState = uploadCvFileFormFetcher.state !== 'idle'
	const isDeletePendingState = deleteCvFileFormFetcher.state !== 'idle'

	// The useForm hook will return all the metadata we need to render the form
	// and put focus on the first invalid field when the form is submitted
	const [form, fields] = useForm({
		// This not only syncs the error from the server
		// But is also used as the default value of the form
		// in case the document is reloaded for progressive enhancement
		lastResult: lastResult?.result,
		onValidate({ formData }) {
			// Run the same validation logic on client
			const submission = parseWithZod(formData, {
				schema: cvFileSchema,
			})

			if (submission.status !== 'success') {
				console.log('submission errors:', submission.error)
				console.log('submission payload: ', submission.payload)
				console.log('submission reply: ', submission.reply())
				console.log('submission status: ', submission.status)
			}

			return submission
		},
		constraint: getZodConstraint(cvFileSchema),

		// Then, revalidate field as user types again
		shouldRevalidate: 'onInput',
	})

	return (
		<div className="flex flex-col space-y-4">
			<uploadCvFileFormFetcher.Form
				method="POST"
				{...getFormProps(form)}
				encType="multipart/form-data"
			>
				<div className="w-full space-y-4">
					<Label htmlFor="file-upload" className="text-lg font-semibold">
						Upload your most up-to-date CV/Resume
					</Label>
					{cvFileUrl && (
						<div className="">
							<div className="flex flex-col space-y-2 rounded-md border-gray-200 p-2 dark:border-gray-700">
								<a
									href={cvFileUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="text-sm font-medium text-blue-500 hover:underline"
								>
									{`View your uploaded CV file here`}
								</a>
								<span className="text-muted-foreground text-xs">{`Last updated: ${cvFileUploadedAt}`}</span>
							</div>
						</div>
					)}
					<div className="relative">
						<Field
							labelProps={{
								children: '',
							}}
							inputProps={{
								className: 'h-18 cursor-pointer opacity-0',
								accept: SUPPORTED_CV_FILE_TYPES.map((type) => `.${type}`).join(
									',',
								),
								...getInputProps(fields.cvFile, {
									type: 'file',
								}),
							}}
							errors={fields.cvFile.errors}
						/>

						<div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center rounded-md border-2 border-dashed border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-700">
							<FileUpIcon className="h-10 w-10 text-gray-400 dark:text-gray-300" />
							<span className="mt-2 text-sm text-gray-500 dark:text-gray-400">
								{fields.cvFile?.value
									? fields.cvFile?.value.name
									: 'Click or drag file to upload'}
							</span>
						</div>
					</div>
					<p className="text-sm text-gray-500">
						{`Supported file types: ${SUPPORTED_CV_FILE_TYPES.join(', ').toUpperCase()}`}
					</p>

					{fields.cvFile.value?.name && (
						<div className="flex items-center justify-between space-x-2">
							<span className="truncate text-sm">
								Selected file: {fields.cvFile.value?.name}
							</span>
							<Button variant="outline" size="sm" type="reset">
								Clear
							</Button>
						</div>
					)}

					{fields.cvFile.errors && (
						<Alert variant="destructive">
							<AlertCircle className="h-4 w-4" />
							<AlertTitle>Error</AlertTitle>
							<AlertDescription>{fields.cvFile.errors}</AlertDescription>
						</Alert>
					)}
					<Button
						className="w-full"
						type="submit"
						name="intent"
						value={MediaActionIntent.uploadCvFile}
						disabled={isUploadPendingState}
					>
						{isUploadPendingState ? 'Uploading...' : 'Upload'}
					</Button>
				</div>
			</uploadCvFileFormFetcher.Form>
			{cvFileS3Key && (
				<deleteCvFileFormFetcher.Form method="POST" className="font-semibold">
					<input type="hidden" name="cvFileS3Key" value={cvFileS3Key} />
					<Button
						size={'sm'}
						variant={'link'}
						className="text-destructive"
						name="intent"
						value={MediaActionIntent.deleteCvFile}
					>
						{isDeletePendingState ? 'Deleting CV file...' : 'Delete CV File'}
					</Button>
				</deleteCvFileFormFetcher.Form>
			)}
		</div>
	)
}

export default function Onboarding() {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="mb-8 text-center text-4xl">
					CV + Publications
				</CardTitle>
			</CardHeader>
			<CardContent className="mx-auto flex h-full w-full max-w-2xl flex-col">
				<CvFileForm />
				<Divider />
				<OnboardingMediaForm />
			</CardContent>
		</Card>
	)
}
