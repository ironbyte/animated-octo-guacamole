import {
	json,
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
	type MetaFunction,
} from '@remix-run/node'
import { useActionData, useFetcher, useLoaderData } from '@remix-run/react'
import * as React from 'react'
import { db } from '@nautikos/core/db'
import { membershipBodies } from '@nautikos/core/schema/membership_bodies'
import {
	getFieldsetProps,
	getFormProps,
	getInputProps,
	useForm,
} from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { Plus } from 'lucide-react'

import { YearPicker } from '~/components/conform/year-picker'
import { Divider } from '~/components/divider'
import { ErrorList } from '~/components/error-list'
import { FileInput } from '~/components/file-input'
import { CheckboxField, Field, SelectField } from '~/components/forms'
import { Marker } from '~/components/marker'
import { Spacer } from '~/components/spacer'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Label } from '~/components/ui/label'
import { requireUserSession } from '~/lib/auth.server'
import { createToastHeaders } from '~/lib/toast.server'
import { useOnboardingInfo } from '~/lib/utils'
import { AppName } from '~/root'
import { MembershipBodyComboBox } from './membership-body-combo-box'
import { upsertAcademyData } from './queries.server'
import { academySchema } from './validation.schema'

export const ROUTE_PATH = '/onboarding/academy' as const

const schema = academySchema

export const meta: MetaFunction = () => {
	return [
		{
			title: `${AppName} | Onboarding - Academy`,
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

	const { membershipFieldList, proCertFieldList, educationFieldList } =
		submission.value

	await upsertAcademyData({
		userId: (await userSession).user.id,
		jobSeekerData: {},
		membershipDataList: membershipFieldList,
		proCertDataList: proCertFieldList,
		educationDataList: educationFieldList,
	})

	return json(submission.reply({ fieldErrors: {} }), {
		headers: await createToastHeaders({
			type: 'success',
			title: 'Success',
			description: 'Your changes have been saved',
		}),
	})
}

export async function loader({ request }: LoaderFunctionArgs) {
	await requireUserSession(request)

	const allMembershipBodies = await db
		.select({
			id: membershipBodies.id,
			name: membershipBodies.name,
			category: membershipBodies.category,
		})
		.from(membershipBodies)
		.orderBy(membershipBodies.name)
		.execute()

	return json(
		{ membershipBodies: allMembershipBodies },
		{
			headers: {
				'Cache-Control': 'public, max-age=86400, s-maxage=86400, immutable',
			},
		},
	)
}

function OnboardingAcademyForm() {
	const lastResult = useActionData<typeof action>()
	const onboardingInfo = useOnboardingInfo()
	const loaderData = useLoaderData<typeof loader>()
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
		shouldValidate: 'onBlur',
		shouldRevalidate: 'onInput',
		defaultValue: {
			proCertFieldList: [...(onboardingInfo?.professionalCertifications || [])],
			educationFieldList: [
				...(onboardingInfo?.education.map((item) => ({
					...item,
					educationEndYear: item.educationEndYear?.toString(),
					educationStartYear: item.educationStartYear?.toString(),
				})) || []),
			],
			membershipFieldList: [
				...(onboardingInfo?.memberships.map((item) => ({
					...item,
					membershipJoiningYear: item.membershipJoiningYear?.toString(),
				})) || []),
			],
		},
	})

	const membershipFieldList = fields.membershipFieldList.getFieldList()
	const proCertFieldList = fields.proCertFieldList.getFieldList()
	const educationFieldList = fields.educationFieldList.getFieldList()

	const memoizedBodiesList = React.useMemo(() => {
		return loaderData.membershipBodies.map((i) => i.name)
	}, [])

	return (
		<Card className="w-full">
			<CardHeader>
				<CardTitle className="mb-8 text-center text-4xl">Academic</CardTitle>
			</CardHeader>
			<CardContent>
				<fetcher.Form
					method="POST"
					{...getFormProps(form)}
					className="mx-auto flex h-full w-full max-w-2xl flex-col"
				>
					{/**
					 * EDUCATION FIELD LIST
					 */}

					<ErrorList errors={fields.educationFieldList.errors} />
					<>
						<div className="mb-4 flex items-center justify-between">
							<h1 className="text-lg font-semibold">Education</h1>

							<Button
								{...form.insert.getButtonProps({
									name: fields.educationFieldList.name,
								})}
							>
								<Plus className="mr-2 h-4 w-4" />
								Add
							</Button>
						</div>

						{educationFieldList.map((field, index) => {
							const educationFields = field.getFieldset()

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

									<SelectField
										labelProps={{
											children: 'Education Level*',
										}}
										className="w-full"
										placeholder="Select..."
										meta={educationFields.educationLevel}
										items={['Postgraduate', 'Graduate', 'Diploma'].map((i) => ({
											value: i,
											name: i,
										}))}
										errors={educationFields.educationLevel.errors}
									/>
									<div className="flex gap-2">
										<Field
											className="w-full"
											labelProps={{ children: 'Institution*' }}
											inputProps={{
												...getInputProps(educationFields.institution, {
													type: 'text',
												}),
											}}
											key={educationFields.institution.key}
											errors={educationFields.institution.errors}
										/>
										<Field
											className="w-full"
											labelProps={{ children: 'Degree name*' }}
											inputProps={{
												...getInputProps(educationFields.degreeName, {
													type: 'text',
												}),
											}}
											key={educationFields.degreeName.key}
											errors={educationFields.degreeName.errors}
										/>
									</div>

									<Field
										labelProps={{ children: 'Field of Study*' }}
										inputProps={{
											...getInputProps(educationFields.fieldOfStudy, {
												type: 'text',
											}),
										}}
										key={educationFields.fieldOfStudy.key}
										errors={educationFields.fieldOfStudy.errors}
									/>
									<div className="flex gap-2">
										<YearPicker
											key={educationFields.educationStartYear.key}
											meta={educationFields.educationStartYear}
											className="w-full"
											labelProps={{ children: 'Start Year*' }}
											errors={educationFields.educationStartYear.errors}
										/>

										{Boolean(educationFields.isOngoing.value) ? (
											<div className="w-full" />
										) : (
											<YearPicker
												key={educationFields.educationEndYear.key}
												meta={educationFields.educationEndYear}
												className="w-full"
												labelProps={{ children: 'End Year*' }}
												errors={educationFields.educationEndYear.errors}
											/>
										)}
									</div>

									<CheckboxField
										labelProps={{ children: 'Ongoing' }}
										buttonProps={getInputProps(educationFields.isOngoing, {
											type: 'checkbox',
										})}
										errors={educationFields.isOngoing.errors}
									/>

									<div className="flex gap-2">
										<Button
											variant="secondary"
											{...form.reorder.getButtonProps({
												name: fields.educationFieldList.name,
												from: index,
												to: 0,
											})}
										>
											Move to top
										</Button>
										<Button
											variant="destructive"
											{...form.remove.getButtonProps({
												name: fields.educationFieldList.name,
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

					<Divider />

					{/**
					 * MEMBERSHIP FIELD LIST
					 */}

					<ErrorList errors={fields.membershipFieldList.errors} />
					<>
						<div className="mb-4 flex items-center justify-between">
							<h1 className="text-lg font-semibold">Membership</h1>

							<Button
								{...form.insert.getButtonProps({
									name: fields.membershipFieldList.name,
								})}
							>
								<Plus className="mr-2 h-4 w-4" />
								Add
							</Button>
						</div>

						{membershipFieldList.map((field, index) => {
							const membershipFields = field.getFieldset()

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

									<MembershipBodyComboBox
										options={[
											...memoizedBodiesList,
											membershipFields.membershipBodyName.value ?? '',
										]}
										meta={membershipFields.membershipBodyName}
										key={membershipFields.membershipBodyName.key}
										errors={membershipFields.membershipBodyName.errors}
									/>

									<YearPicker
										key={membershipFields.membershipJoiningYear.key}
										meta={membershipFields.membershipJoiningYear}
										className="w-full"
										labelProps={{ children: 'Year of Joining*' }}
										errors={membershipFields.membershipJoiningYear.errors}
									/>

									<Field
										key={membershipFields.membershipCertificate.key}
										labelProps={{ children: 'Membership Certificate Number*' }}
										inputProps={{
											...getInputProps(membershipFields.membershipCertificate, {
												type: 'text',
											}),
										}}
										errors={membershipFields.membershipCertificate.errors}
									/>
									<Label>Upload Membership Certificate</Label>
									<FileInput
										title=""
										inputProps={{
											accept:
												'image/jpeg,image/gif,image/png,application/pdf,image/x-eps',
										}}
									/>
									<div className="flex gap-2">
										<Button
											variant="secondary"
											{...form.reorder.getButtonProps({
												name: fields.membershipFieldList.name,
												from: index,
												to: 0,
											})}
										>
											Move to top
										</Button>
										<Button
											variant="destructive"
											{...form.remove.getButtonProps({
												name: fields.membershipFieldList.name,
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

					<Divider />

					{/**
					 * PROFESSIONAL CERTIFICATE FIELD LIST
					 */}
					<ErrorList errors={fields.proCertFieldList.errors} />
					<>
						<div className="mb-4 flex items-center justify-between">
							<h1 className="text-lg font-semibold">
								Professional Certification
							</h1>

							<Button
								{...form.insert.getButtonProps({
									name: fields.proCertFieldList.name,
								})}
							>
								<Plus className="mr-2 h-4 w-4" />
								Add
							</Button>
						</div>
						{proCertFieldList.map((field, index) => {
							const proCertFields = field.getFieldset()

							return (
								<fieldset
									{...getFieldsetProps(field)}
									key={`${field.key}+${index}`}
									className="mb-8 w-full px-2"
								>
									<Marker
										key={`${field.key}+${index}`}
										value={`${index + 1}`}
									/>
									<Field
										labelProps={{ children: 'Institute*' }}
										inputProps={{
											...getInputProps(proCertFields.proInstitute, {
												type: 'text',
											}),
										}}
										key={proCertFields.proInstitute.key}
										errors={proCertFields.proInstitute.errors}
									/>
									<Field
										labelProps={{ children: 'Certification*' }}
										inputProps={{
											...getInputProps(proCertFields.proCertificationName, {
												type: 'text',
											}),
										}}
										key={proCertFields.proCertificationName.key}
										errors={proCertFields.proCertificationName.errors}
									/>
									<Label>Upload Professional Certificate</Label>
									<FileInput
										title=""
										inputProps={{
											accept:
												'image/jpeg,image/gif,image/png,application/pdf,image/x-eps',
										}}
									/>
									<div className="flex gap-2">
										<Button
											variant="secondary"
											{...form.reorder.getButtonProps({
												name: fields.proCertFieldList.name,
												from: index,
												to: 0,
											})}
										>
											Move to top
										</Button>
										<Button
											variant="destructive"
											{...form.remove.getButtonProps({
												name: fields.proCertFieldList.name,
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
	return <OnboardingAcademyForm />
}
