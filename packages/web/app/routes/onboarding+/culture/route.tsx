import {
	json,
	type ActionFunctionArgs,
	type MetaFunction,
} from '@remix-run/node'
import { useActionData, useFetcher } from '@remix-run/react'
import { getFormProps, getTextareaProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'

import { DatePickerConform } from '~/components/conform/date-picker'
import { CounterDisplay } from '~/components/counter-display'
import { Divider } from '~/components/divider'
import {
	CheckboxGroupField,
	MultiSelectField,
	RadioGroupField,
	TextareaField,
} from '~/components/forms'
import { Spacer } from '~/components/spacer'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { requireUserSession } from '~/lib/auth.server'
import { createToastHeaders } from '~/lib/toast.server'
import { useListOfCompaniesData, useOnboardingInfo } from '~/lib/utils'
import { AppName } from '~/root'
import { upsertJobSeekerQA } from './queries.server'
import {
	cultureSchema,
	emiratesPreferencesEnum,
	jobValuesOptions,
	workEnvironmentOptions,
} from './validation.schema'

export const ROUTE_PATH = '/onboarding/culture' as const

const schema = cultureSchema

export const meta: MetaFunction = () => {
	return [
		{
			title: `${AppName} | Onboarding - Culture`,
		},
	]
}

export async function action({ request }: ActionFunctionArgs) {
	const userSession = requireUserSession(request)

	const formData = await request.formData()
	const submission = await parseWithZod(formData, {
		schema,
	})

	// Send the submission back to the client if the status is not successful
	if (submission.status !== 'success') {
		return json(submission.reply(), {
			status: submission.status === 'error' ? 400 : 200,
		})
	}

	const { jobSeekerQA, targetCompaniesList, jobSeekerFieldSet } =
		submission.value

	await upsertJobSeekerQA({
		jobSeekerQA,
		targetCompaniesList,
		userId: (await userSession).user.id,
		jobSeekerData: jobSeekerFieldSet,
	})

	return json(submission.reply({ fieldErrors: {} }), {
		headers: await createToastHeaders({
			type: 'success',
			title: 'Success',
			description: 'Your changes have been saved',
		}),
	})
}

const TEXTAREA_MAX_LENGTH = 500

function OnboardingCultureForm() {
	const lastResult = useActionData<typeof action>()
	const onboardingInfo = useOnboardingInfo()
	const companiesList = useListOfCompaniesData()
	const fetcher = useFetcher()

	const [form, fields] = useForm({
		lastResult,
		onValidate({ formData }) {
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
		shouldValidate: 'onBlur',
		shouldRevalidate: 'onInput',
		defaultValue: {
			jobSeekerFieldSet: {
				availableFrom: onboardingInfo?.availableFrom,
				emiratesPreference: onboardingInfo?.emiratesPreference ?? [],
			},
			jobSeekerQA: {
				nextJobSeek: onboardingInfo?.jobSeekerQuestions?.nextJobSeek,
				motivation: onboardingInfo?.jobSeekerQuestions?.motivation,
				workEnvironment: onboardingInfo?.jobSeekerQuestions?.workEnvironment,
				topValuesInNextJob:
					onboardingInfo?.jobSeekerQuestions?.topValuesInNextJob,
			},
			targetCompaniesList: onboardingInfo?.targetCompanies?.map(
				(i) => i.companyId,
			),
		},
	})

	const jobSeekerQA = fields.jobSeekerQA.getFieldset()
	const jobSeekerFieldSet = fields.jobSeekerFieldSet.getFieldset()

	return (
		<Card className="w-full">
			<CardHeader>
				<CardTitle className="mb-8 text-center text-4xl">Culture</CardTitle>
			</CardHeader>
			<CardContent className="mx-auto flex h-full w-full max-w-2xl flex-col">
				<fetcher.Form method="POST" {...getFormProps(form)}>
					<MultiSelectField
						labelProps={{
							children: 'Target Companies (Up to 2)*',
						}}
						meta={fields.targetCompaniesList}
						options={companiesList.map((i) => ({
							label: i.name,
							value: i.id,
						}))}
						placeholder="Select..."
						errors={fields.targetCompaniesList.errors}
						// handleValueChange={(search) => {
						// 	companyFetcher.submit(
						// 		{
						// 			q: search ?? '',
						// 		},
						// 		{
						// 			method: 'get',
						// 			action: '/company-search',
						// 		},
						// 	)
						// }}
					/>

					<MultiSelectField
						labelProps={{
							children: 'Which All Emirates preferred to be posted in*',
						}}
						meta={jobSeekerFieldSet.emiratesPreference}
						maxCount={8}
						options={emiratesPreferencesEnum.map((i) => ({
							value: i,
							label: i,
						}))}
						errors={jobSeekerFieldSet.emiratesPreference.errors}
					/>

					<DatePickerConform
						meta={jobSeekerFieldSet.availableFrom}
						labelProps={{
							children: 'Available From*',
						}}
						calendarProps={{
							disabled: {
								before: new Date(),
							},
						}}
						errors={jobSeekerFieldSet.availableFrom.errors}
					/>

					<Divider />

					<div className="mb-4 flex flex-col">
						<TextareaField
							labelProps={{
								children:
									'What are you seeking in your next job?* (Maximum 500 characters)',
							}}
							textareaProps={{
								...getTextareaProps(jobSeekerQA.nextJobSeek, {}),
								rows: 8,
								maxLength: TEXTAREA_MAX_LENGTH,
							}}
							errors={jobSeekerQA.nextJobSeek.errors}
						/>

						<CounterDisplay
							count={jobSeekerQA?.nextJobSeek?.value?.length}
							maxLength={TEXTAREA_MAX_LENGTH}
						/>
					</div>

					<div className="mb-4 flex flex-col">
						<TextareaField
							labelProps={{
								children:
									'What motivates you the most?* (Maximum 500 characters)',
							}}
							textareaProps={{
								...getTextareaProps(jobSeekerQA.motivation, {}),
								rows: 8,
							}}
							errors={jobSeekerQA.motivation.errors}
						/>
						<CounterDisplay
							count={jobSeekerQA?.motivation?.value?.length}
							maxLength={TEXTAREA_MAX_LENGTH}
						/>
					</div>

					<RadioGroupField
						labelProps={{
							children: 'What type of work environment do you thrive in?*',
						}}
						meta={jobSeekerQA.workEnvironment}
						items={workEnvironmentOptions.map((i) => ({
							label: i,
							value: i,
						}))}
						errors={jobSeekerQA.workEnvironment.errors}
					/>

					<CheckboxGroupField
						labelProps={{
							children: 'Interests*',
						}}
						meta={jobSeekerQA.topValuesInNextJob}
						errors={jobSeekerQA.topValuesInNextJob.errors}
						items={jobValuesOptions.map((i) => ({
							value: i,
							name: i,
						}))}
					/>
					<Spacer size="xs" />
					<div className="mt-2 flex w-full gap-2">
						<Button
							type="submit"
							className="w-full"
							variant="secondary"
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

export default function Culture() {
	return <OnboardingCultureForm />
}
