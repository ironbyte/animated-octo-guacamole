import {
	Form,
	useActionData,
	useLoaderData,
	useNavigation,
} from '@remix-run/react'
import * as React from 'react'
import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { AlertCircle, FileText, Upload } from 'lucide-react'
import { z } from 'zod'

import { Field } from '~/components/forms'
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Label } from '~/components/ui/label'
import { type action, type loader } from './route'

export const pdfFileSchema = z
	.instanceof(File, { message: 'PDF file is required' })
	.refine((file) => file.type === 'application/pdf', 'Only PDF file is allowed')

const SUPPORTED_CV_FILE_TYPES: string[] = ['pdf'] as const
type FILE_TYPES_UNION = (typeof SUPPORTED_CV_FILE_TYPES)[number]

const FILE_TYPE_ICONS: Record<FILE_TYPES_UNION, React.ReactNode> = {
	pdf: <FileText className="h-4 w-4" />,
}

export const ROUTE_PATH = '/onboarding/cv' as const

export const schema = z.object({
	cvFile: pdfFileSchema,
})

function CvFileForm() {
	const lastResult = useActionData<typeof action>()
	const loaderData = useLoaderData<typeof loader>()
	const navigation = useNavigation()

	const isPendingState = navigation.state !== 'idle'

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
				schema,
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

		// Then, revalidate field as user types again
		shouldRevalidate: 'onInput',
	})

	return (
		<Card className="w-full">
			<CardHeader>
				<CardTitle className="mb-8 text-center text-4xl">CV</CardTitle>
			</CardHeader>
			<CardContent>
				<Form
					method="POST"
					{...getFormProps(form)}
					encType="multipart/form-data"
					className="mx-auto flex h-full max-w-lg flex-col"
				>
					<div className="w-full space-y-4">
						<Label htmlFor="file-upload" className="text-lg font-semibold">
							Upload your most up-to-date CV/Resume
						</Label>
						{loaderData?.cvS3Url && (
							<div className="mt-4">
								<div className="mt-2 rounded-md border-gray-200 p-2 dark:border-gray-700">
									<a
										href={loaderData?.cvS3Url}
										target="_blank"
										rel="noopener noreferrer"
										className="break-all text-sm font-medium text-blue-500 hover:underline"
									>
										View your uploaded CV file here
									</a>
									<span>{` or upload a new one below.`}</span>
								</div>
							</div>
						)}
						<div className="relative">
							<Field
								labelProps={{
									children: 'Upload your most up-to-date CV/Resume',
								}}
								inputProps={{
									className: 'h-18 cursor-pointer opacity-0',
									accept: SUPPORTED_CV_FILE_TYPES.map(
										(type) => `.${type}`,
									).join(','),
									...getInputProps(fields.cvFile, {
										type: 'file',
									}),
								}}
								errors={fields.cvFile.errors}
							/>

							<div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center rounded-md border-2 border-dashed border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-700">
								<Upload className="h-10 w-10 text-gray-400 dark:text-gray-300" />
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

						{lastResult?.previewUrl && (
							<div className="mt-4">
								<div className="mt-2 rounded-md border border-gray-200 p-2 dark:border-gray-700">
									<a
										href={lastResult?.previewUrl}
										target="_blank"
										rel="noopener noreferrer"
										className="break-all text-sm font-medium text-blue-500 hover:underline"
									>
										Preview URL
									</a>
								</div>
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
							type="submit"
							className="w-full"
							name="intent"
							value="upload-cv-file"
							disabled={isPendingState}
						>
							{isPendingState ? 'Uploading...' : 'Upload'}
						</Button>
					</div>
				</Form>
			</CardContent>
		</Card>
	)
}

export default function Onboarding() {
	return <CvFileForm />
}
