import {
	json,
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
	type MetaFunction,
} from '@remix-run/node'
import { useActionData, useFetcher, useLoaderData } from '@remix-run/react'
import * as React from 'react'
import { db } from '@nautikos/core/db'
import { countries } from '@nautikos/core/schema/countries'
import {
	getFieldsetProps,
	getFormProps,
	getInputProps,
	getTextareaProps,
	useForm,
} from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { Plus } from 'lucide-react'

import { getMonthName, MonthPicker } from '~/components/conform/month-picker'
import { YearPicker } from '~/components/conform/year-picker'
import { CounterDisplay } from '~/components/counter-display'
import { Divider } from '~/components/divider'
import { ErrorList } from '~/components/error-list'
import {
	CheckboxField,
	Field,
	MultiSelectField,
	RadioGroupField,
	SelectField,
	TextareaField,
} from '~/components/forms'
import { Marker } from '~/components/marker'
import { Spacer } from '~/components/spacer'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { requireUserSession } from '~/lib/auth.server'
import { createToastHeaders } from '~/lib/toast.server'
import { useListOfCompaniesData, useOnboardingInfo } from '~/lib/utils'
import { AppName } from '~/root'
import { CompanyComboBox } from './company-combo-box'
import { upsertExperienceData } from './queries.server'
import { StateComboBox } from './state-combo-box'
import {
	jobTypeEnum,
	peopleManagementExperienceInYearsEnum,
	seaRankEnum,
	skillEnum,
	workSchema,
	YesOrNoOptionsList,
} from './validation.schema'

export const ROUTE_PATH = '/onboarding/experience' as const

const schema = workSchema
const TEXTAREA_MAX_LENGTH = 500

export const meta: MetaFunction = () => {
	return [
		{
			title: `${AppName} | Onboarding - Experience`,
		},
	]
}

export async function action({ request }: ActionFunctionArgs) {
	const userSession = requireUserSession(request)

	const formData = await request.formData()
	const submission = await parseWithZod(formData, { schema })

	// Send the submission back to the client if the status is not successful
	if (submission.status !== 'success') {
		return json(submission.reply(), {
			status: submission.status === 'error' ? 400 : 200,
		})
	}

	const {
		workExperienceFieldList,
		skills,
		seaGoingExperienceSet,
		jobSeekerFieldSet,
	} = submission.value

	await upsertExperienceData({
		userId: (await userSession).user.id,
		jobSeekerData: jobSeekerFieldSet,
		workExperienceList: workExperienceFieldList,
		jobSeekerSkillsList: skills,
		seaGoingExperienceData: seaGoingExperienceSet,
	})

	return json(submission.reply({ fieldErrors: {} }), {
		headers: await createToastHeaders({
			type: 'success',
			title: 'Success',
			description: 'Your changes have been saved',
		}),
	})
}

function Title({ title }: { title: string }) {
	return <h1 className="mb-6 text-xl">{title}</h1>
}

export async function loader({ request }: LoaderFunctionArgs) {
	await requireUserSession(request)

	const allCountries = await db
		.select({
			id: countries.id,
			name: countries.name,
			code: countries.code,
		})
		.from(countries)
		.orderBy(countries.name)
		.execute()

	return json(
		{ countries: allCountries },
		{
			headers: {
				'Cache-Control': 'public, max-age=86400, s-maxage=86400, immutable',
			},
		},
	)
}

function OnboardingExperienceForm() {
	const lastResult = useActionData<typeof action>()
	const onboardingInfo = useOnboardingInfo()
	const loaderData = useLoaderData<typeof loader>()
	const companiesList = useListOfCompaniesData()
	const fetcher = useFetcher()

	// The useForm hook will return all the metadata we need to render the form
	// and put focus on the first invalid field when the form is submitted
	const [form, fields] = useForm({
		// This not only syncs the error from the server
		// But is also used as the default value of the form
		// in case the document is reloaded for progressive enhancement
		lastResult,
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
				totalYearsExperience: onboardingInfo?.totalYearsExperience,
				arabicSpeaking: onboardingInfo?.arabicSpeaking ? 'yes' : 'no',
				dubaiTradePortal: onboardingInfo?.dubaiTradePortal ? 'yes' : 'no',
				uaeCustoms: onboardingInfo?.uaeCustoms ? 'yes' : 'no',
				freeZoneProcess: onboardingInfo?.freeZoneProcess ? 'yes' : 'no',
				peopleManagementExperience: onboardingInfo?.peopleManagementExperience,
			},
			seaGoingExperienceSet: {
				totalYearsSeaGoingExperience:
					onboardingInfo?.seagoingExperience?.totalYearsSeaGoingExperience,
				seaRank: onboardingInfo?.seagoingExperience?.seaRank,
			},
			skills: onboardingInfo?.skills.map((i) => i.skill),
			workExperienceFieldList: [
				...(onboardingInfo?.workExperiences.map((item) => ({
					...item,
					workStartYear: item.workStartYear?.toString(),
					workEndYear: item.workEndYear?.toString(),
					workStartMonth: getMonthName(item.workStartMonth),
					workEndMonth: item?.workEndMonth && getMonthName(item.workEndMonth),
				})) || []),
			],
		},
	})

	const seaGoingExperienceFieldSet = fields.seaGoingExperienceSet.getFieldset()
	const workExperienceFieldList = fields.workExperienceFieldList.getFieldList()
	const jobSeekerFieldSet = fields.jobSeekerFieldSet.getFieldset()

	const memoizedCompaniesList = React.useMemo(() => {
		return companiesList.map((i) => i.name)
	}, [])

	const memoizedCountriesList = React.useMemo(() => {
		return loaderData.countries.map((i) => ({
			name: i.name,
			value: i.id,
		}))
	}, [])

	const isSelectedCountryIndia = (value: string | undefined) => {
		if (!value) {
			return false
		}

		return (
			memoizedCountriesList.find((i) => {
				return i.value === value
			})?.name === 'India'
		)
	}

	const isSelectedCountryUAE = (value: string | undefined) => {
		if (!value) {
			return false
		}

		return (
			memoizedCountriesList.find((i) => {
				return i.value === value
			})?.name === 'United Arab Emirates'
		)
	}

	const emiratesStates = [
		'Abu Dhabi',
		'Dubai',
		'Sharjah',
		'Ajman',
		'Umm Al Quwain',
		'Ras Al Khaimah',
		'Fujairah',
	]

	return (
		<Card className="w-full">
			<CardHeader>
				<CardTitle className="mb-8 text-center text-4xl">Experience</CardTitle>
			</CardHeader>
			<CardContent>
				<fetcher.Form
					method="POST"
					{...getFormProps(form)}
					className="mx-auto flex h-full w-full max-w-2xl flex-col"
				>
					<h1 className="text-lg font-semibold">Corporate Experience</h1>

					<Field
						labelProps={{
							children: 'Total number of years of work experience*',
						}}
						inputProps={{
							...getInputProps(jobSeekerFieldSet.totalYearsExperience, {
								type: 'number',
							}),
						}}
						errors={jobSeekerFieldSet.totalYearsExperience.errors}
					/>

					<SelectField
						labelProps={{
							children: 'People Management Experience*',
						}}
						className="w-full"
						placeholder="Select..."
						meta={jobSeekerFieldSet.peopleManagementExperience}
						items={peopleManagementExperienceInYearsEnum.map((i) => ({
							value: i,
							name: i,
						}))}
						errors={jobSeekerFieldSet.peopleManagementExperience.errors}
					/>

					<MultiSelectField
						labelProps={{
							children: 'Skills *',
						}}
						meta={fields.skills}
						maxCount={40}
						options={skillEnum.map((i) => ({
							label: i,
							value: i,
						}))}
						placeholder="Select..."
						errors={fields.skills.errors}
					/>

					<Divider />
					<h1 className="text-lg font-semibold">
						Sea-going Experience (Optional)
					</h1>

					<SelectField
						labelProps={{
							children: 'Highest Achieved Rank',
						}}
						className="w-full"
						placeholder="Select..."
						meta={seaGoingExperienceFieldSet.seaRank}
						items={seaRankEnum.map((i) => ({
							value: i,
							name: i,
						}))}
						errors={seaGoingExperienceFieldSet.seaRank.errors}
					/>

					<Field
						labelProps={{
							children: 'Years of sea-going experience',
						}}
						inputProps={{
							...getInputProps(
								seaGoingExperienceFieldSet.totalYearsSeaGoingExperience,
								{
									type: 'number',
								},
							),
						}}
						errors={
							seaGoingExperienceFieldSet.totalYearsSeaGoingExperience.errors
						}
					/>

					<Divider />
					<h1 className="text-lg font-semibold">Local Market Experience</h1>

					<RadioGroupField
						labelProps={{
							children: 'Arabic Speaking*',
						}}
						meta={jobSeekerFieldSet.arabicSpeaking}
						items={YesOrNoOptionsList}
						errors={jobSeekerFieldSet.arabicSpeaking.errors}
					/>
					<RadioGroupField
						labelProps={{
							children: 'Dubai Trade Portal*',
						}}
						meta={jobSeekerFieldSet.dubaiTradePortal}
						items={YesOrNoOptionsList}
						errors={jobSeekerFieldSet.dubaiTradePortal.errors}
					/>
					<RadioGroupField
						labelProps={{
							children: 'UAE Customs Process*',
						}}
						meta={jobSeekerFieldSet.uaeCustoms}
						items={YesOrNoOptionsList}
						errors={jobSeekerFieldSet.uaeCustoms.errors}
					/>
					<RadioGroupField
						labelProps={{
							children: 'UAE Free Zone Process*',
						}}
						meta={jobSeekerFieldSet.freeZoneProcess}
						items={YesOrNoOptionsList}
						errors={jobSeekerFieldSet.freeZoneProcess.errors}
					/>
					<Divider />

					<>
						<div className="mb-4 flex items-center justify-between">
							<h1 className="text-lg font-semibold">Experience</h1>

							<div>
								<Button
									{...form.insert.getButtonProps({
										name: fields.workExperienceFieldList.name,
									})}
								>
									<Plus className="mr-2 h-4 w-4" />
									Add
								</Button>
							</div>
						</div>

						<ErrorList errors={fields.workExperienceFieldList.errors} />

						{workExperienceFieldList.map((field, index) => {
							const workExperienceFields = field.getFieldset()

							return (
								<fieldset
									key={field.key}
									{...getFieldsetProps(field)}
									className="mb-8 w-full px-2"
								>
									<Marker
										key={`${field.key}+${index}`}
										value={`${index + 1}`}
									/>

									<CompanyComboBox
										options={[
											...memoizedCompaniesList,
											workExperienceFields.company.value ?? '',
										]}
										meta={workExperienceFields.company}
										key={workExperienceFields.company.key}
										errors={workExperienceFields.company.errors}
									/>
									<SelectField
										className="w-full"
										meta={workExperienceFields.countryId}
										key={workExperienceFields.countryId.key}
										items={memoizedCountriesList}
										labelProps={{ children: 'Country*' }}
										placeholder="Select..."
										errors={workExperienceFields.countryId.errors}
									/>
									{isSelectedCountryUAE(
										workExperienceFields.countryId.value,
									) && (
										<StateComboBox
											options={emiratesStates}
											meta={workExperienceFields.state}
											key={workExperienceFields.state.key}
											errors={workExperienceFields.state.errors}
										/>
									)}
									{isSelectedCountryIndia(
										workExperienceFields.countryId.value,
									) && (
										<StateComboBox
											options={[
												'Andhra Pradesh',
												'Arunachal Pradesh',
												'Assam',
												'Bihar',
												'Chhattisgarh',
												'Goa',
												'Gujarat',
												'Haryana',
												'Himachal Pradesh',
												'Jammu and Kashmir',
												'Jharkhand',
												'Karnataka',
												'Kerala',
												'Madhya Pradesh',
												'Maharashtra',
												'Manipur',
												'Meghalaya',
												'Mizoram',
												'Nagaland',
												'Odisha',
												'Punjab',
												'Rajasthan',
												'Sikkim',
												'Tamil Nadu',
												'Telangana',
												'Tripura',
												'Uttarakhand',
												'Uttar Pradesh',
												'West Bengal',
												'Andaman and Nicobar Islands',
												'Chandigarh',
												'Dadra and Nagar Haveli',
												'Daman and Diu',
												'Delhi',
												'Lakshadweep',
												'Puducherry',
											]}
											meta={workExperienceFields.state}
											key={workExperienceFields.state.key}
											errors={workExperienceFields.state.errors}
										/>
									)}
									<Field
										className="w-full"
										labelProps={{ children: 'Designation*' }}
										inputProps={{
											...getInputProps(workExperienceFields.role, {
												type: 'text',
											}),
										}}
										key={workExperienceFields.role.key}
										errors={workExperienceFields.role.errors}
									/>
									<SelectField
										labelProps={{
											children: 'Job Type*',
										}}
										className="w-full"
										placeholder="Select..."
										meta={workExperienceFields.jobType}
										items={jobTypeEnum.map((i) => ({
											value: i,
											name: i,
										}))}
										errors={workExperienceFields.jobType.errors}
									/>
									<div className="flex gap-2">
										<MonthPicker
											meta={workExperienceFields.workStartMonth}
											className="w-full"
											labelProps={{ children: 'Start Month*' }}
											errors={workExperienceFields.workStartMonth.errors}
										/>
										<YearPicker
											key={workExperienceFields.workStartYear.key}
											meta={workExperienceFields.workStartYear}
											className="w-full"
											labelProps={{ children: 'Start Year*' }}
											errors={workExperienceFields.workStartYear.errors}
										/>
									</div>
									{Boolean(workExperienceFields.isOngoing.value) ? (
										<div className="w-full" />
									) : (
										<div className="flex gap-2">
											<MonthPicker
												meta={workExperienceFields.workEndMonth}
												className="w-full"
												labelProps={{ children: 'End Month*' }}
												errors={workExperienceFields.workEndMonth.errors}
											/>
											<YearPicker
												key={workExperienceFields.workEndYear.key}
												meta={workExperienceFields.workEndYear}
												className="w-full"
												labelProps={{ children: 'End Year*' }}
												errors={workExperienceFields.workEndYear.errors}
											/>
										</div>
									)}
									<CheckboxField
										labelProps={{ children: 'Ongoing' }}
										buttonProps={getInputProps(workExperienceFields.isOngoing, {
											type: 'checkbox',
										})}
										errors={workExperienceFields.isOngoing.errors}
									/>
									<TextareaField
										labelProps={{
											children:
												'Measurable Achievements (Maximum 500 characters)',
										}}
										textareaProps={{
											...getTextareaProps(
												workExperienceFields.measurableAchievements,
												{},
											),
											rows: 8,
											maxLength: 500,
										}}
										errors={workExperienceFields.measurableAchievements.errors}
									/>
									<CounterDisplay
										count={
											workExperienceFields.measurableAchievements.value?.length
										}
										maxLength={TEXTAREA_MAX_LENGTH}
									/>
									<div className="flex gap-2">
										<Button
											variant="secondary"
											{...form.reorder.getButtonProps({
												name: fields.workExperienceFieldList.name,
												from: index,
												to: 0,
											})}
										>
											Move to top
										</Button>
										<Button
											variant="destructive"
											{...form.remove.getButtonProps({
												name: fields.workExperienceFieldList.name,
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

export default function Onboarding() {
	return <OnboardingExperienceForm />
}
