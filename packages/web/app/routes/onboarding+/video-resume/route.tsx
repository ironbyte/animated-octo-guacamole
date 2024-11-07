import { json, type ActionFunctionArgs } from '@remix-run/node'
import { Form, Link, useActionData, useFetcher } from '@remix-run/react'
import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { AlertCircle } from 'lucide-react'
import { z } from 'zod'

import { Field } from '~/components/forms'
import { Spacer } from '~/components/spacer'
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { requireUserSession } from '~/lib/auth.server'
import { createToastHeaders } from '~/lib/toast.server'
import { useOnboardingInfo } from '~/lib/utils'
import { ROUTE_PATH as INTERVIEW_ROUTE_PATH } from '../screening/route'
import { upsertVideoCvData } from './queries.server'
import { videoResumeSchema } from './validation.schema'

export const ROUTE_PATH = '/onboarding/video-resume' as const

const schema = videoResumeSchema

async function handleSaveAction({
	userId,
	formData,
}: {
	userId: string
	formData: FormData
}) {
	// Note: The superRefine method doesn't work on the client
	// So we need to do the validation on the server
	const submission = await parseWithZod(formData, {
		schema: schema.superRefine((data, ctx) => {
			const parsedUrl = new URL(data.videoCVUrl)

			if (
				parsedUrl.hostname === 'youtu.be' ||
				parsedUrl.hostname === 'www.youtube.com' ||
				parsedUrl.hostname === 'youtube.com' ||
				parsedUrl.hostname === 'vimeo.com' ||
				parsedUrl.hostname === 'www.vimeo.com'
			)
				return true

			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'Please enter a valid YouTube or Vimeo URL',
				path: ['videoCVUrl'],
			})
		}),
	})

	console.log('submission: ', JSON.stringify(submission, null, 2))

	// Send the submission back to the client if the status is not successful
	if (submission.status !== 'success') {
		return json(
			{ result: submission.reply() },
			{ status: submission.status === 'error' ? 400 : 200 },
		)
	}

	console.log('submission: ', JSON.stringify(submission, null, 2))

	const { videoCVUrl } = submission.value

	await upsertVideoCvData({
		jobSeekerData: {
			videoCVUrl,
		},
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

export async function action({ request }: ActionFunctionArgs) {
	const userSession = await requireUserSession(request)
	const userId = userSession.user.id

	const formData = await request.formData()
	const intent = formData.get('intent')

	switch (intent) {
		case 'save':
			return handleSaveAction({
				userId,
				formData,
			})
		default:
			throw new Response(`Invalid intent "${intent}"`, { status: 400 })
	}
}

function OnboardingVideoResumeForm() {
	const lastResult = useActionData<typeof action>()
	const onboardingInfo = useOnboardingInfo()
	const fetcher = useFetcher()

	console.log('onboardingInfo?.videoCVUrl: ', onboardingInfo?.videoCVUrl)

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
				schema: schema,
			})

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
		defaultValue: {
			videoCVUrl: onboardingInfo?.videoCVUrl,
		},
	})

	return (
		<Card className="w-full">
			<CardHeader>
				<CardTitle className="mb-8 text-center text-4xl">
					Video Resume
				</CardTitle>
			</CardHeader>
			<CardContent>
				<fetcher.Form
					method="POST"
					{...getFormProps(form)}
					encType="multipart/form-data"
					className="mx-auto flex h-full w-full max-w-2xl flex-col"
				>
					<Field
						labelProps={{ children: 'Video Resume URL*' }}
						inputProps={{
							...getInputProps(fields.videoCVUrl, {
								type: 'text',
							}),
							placeholder: 'Enter a valid YouTube or Vimeo URL',
						}}
						errors={fields.videoCVUrl.errors}
					/>
					<Alert>
						<AlertCircle className="h-4 w-4" />
						<AlertTitle>
							Your video resume must be under 2 minutes and cover the following:
						</AlertTitle>
						<AlertDescription className="flex flex-col gap-2">
							<ul className="mt-2 list-disc space-y-1 pl-5">
								<li>Introduction</li>
								<li>Experience</li>
								<li>Achievements</li>
								<li>Extra curricular activities</li>
								<li>Goals</li>
							</ul>
							<span className="text-muted-foreground">
								Supported video formats: YouTube and Vimeo
							</span>
						</AlertDescription>
					</Alert>
					<Spacer size="xs" />
					<div className="mt-2 flex w-full gap-2">
						<Button
							type="submit"
							className="w-full"
							variant="secondary"
							name="intent"
							value="save"
							disabled={fetcher.state === 'submitting'}
						>
							{fetcher.state === 'submitting' ? 'Saving...' : 'Save'}
						</Button>
					</div>
				</fetcher.Form>
			</CardContent>
		</Card>
	)
}

export default function Onboarding() {
	return <OnboardingVideoResumeForm />
}
