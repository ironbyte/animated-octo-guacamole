import {
	json,
	type ActionFunctionArgs,
	type MetaFunction,
} from '@remix-run/node'
import { useActionData, useFetcher } from '@remix-run/react'
import * as React from 'react'
import {
	getFieldsetProps,
	getFormProps,
	useForm,
	type FieldMetadata,
} from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { Plus } from 'lucide-react'
import { z } from 'zod'

import { ErrorList } from '~/components/error-list'
import { SelectField } from '~/components/forms'
import { Marker } from '~/components/marker'
import { Spacer } from '~/components/spacer'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { requireUserSession } from '~/lib/auth.server'
import { createToastHeaders } from '~/lib/toast.server'
import { useOnboardingInfo } from '~/lib/utils'
import { AppName } from '~/root'
import { insertAvailabilitySlot } from './queries.server'
import { AvailabilitySlotsSchema, dayEnum } from './validation.schema'

export const ROUTE_PATH = '/onboarding/screening' as const

const schema = z.object({
	availabilitySlots: AvailabilitySlotsSchema,
})

export const meta: MetaFunction = () => {
	return [
		{
			title: `${AppName} | Onboarding - Interview`,
		},
	]
}

export async function action({ request }: ActionFunctionArgs) {
	const userSession = await requireUserSession(request)
	const userId = userSession.user.id

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

	const { availabilitySlots } = submission.value

	console.log('availabilitySlots: ', availabilitySlots)

	// enum != string in zod. TODO: FIX THIS
	await insertAvailabilitySlot({
		availabilitySlotsInput: availabilitySlots,
		userId,
	})
	return json(submission.reply(), {
		headers: await createToastHeaders({
			type: 'success',
			title: 'Success',
			description: 'Your changes have been saved',
		}),
	})
}

// TODO: CLEANUP
function TimePicker({
	meta,
	labelProps,
}: {
	meta: FieldMetadata<string>

	labelProps: React.LabelHTMLAttributes<HTMLLabelElement>
}) {
	const timeValueOptions = React.useMemo(() => {
		return Array.from({ length: 96 }).map((_, i) => {
			const hour = Math.floor(i / 4)
				.toString()
				.padStart(2, '0')
			const minute = ((i % 4) * 15).toString().padStart(2, '0')
			return `${hour}:${minute}`
		})
	}, []) // Empty dependency array added here

	return (
		<SelectField
			labelProps={labelProps}
			className="w-[140px] font-normal"
			placeholder="Select..."
			meta={meta}
			items={timeValueOptions.map((i) => ({
				value: i,
				name: i,
			}))}
			errors={meta.errors}
		/>
	)
}

function OnboardingInterview() {
	const onboardingInfo = useOnboardingInfo()
	const lastResult = useActionData<typeof action>()
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
			availabilitySlots: [
				...(onboardingInfo?.availabilitySlots.map((item) => ({
					...item,
					startTime: item.startTime.slice(0, -3),
					endTime: item.endTime.slice(0, -3),
				})) || []),
			],
		},
	})

	console.log(
		'onboardingInfo?.availabilitySlots',
		onboardingInfo?.availabilitySlots,
	)

	const availabilitySlotsFieldList = fields.availabilitySlots.getFieldList()

	return (
		<Card className="w-full">
			<CardHeader>
				<CardTitle className="mb-8 text-center text-4xl">Screening</CardTitle>
			</CardHeader>
			<CardContent className="flex w-full justify-center">
				<fetcher.Form
					method="POST"
					{...getFormProps(form)}
					className="mx-auto flex h-full w-full max-w-2xl flex-col"
				>
					<ErrorList errors={fields.availabilitySlots.errors} />

					<div className="mb-4 flex items-center justify-between">
						<h1 className="text-lg font-semibold">Availability Slots</h1>

						<Button
							{...form.insert.getButtonProps({
								name: fields.availabilitySlots.name,
							})}
						>
							<Plus className="mr-2 h-4 w-4" />
							Add
						</Button>
					</div>

					{availabilitySlotsFieldList.map((field, index) => {
						const availabilitySlotField = field.getFieldset()

						return (
							<fieldset
								key={field.key}
								{...getFieldsetProps(field)}
								className="mb-8 w-full px-2"
							>
								<Marker key={`${field.key}+${index}`} value={`${index + 1}`} />

								<div className="flex-col gap-2 md:flex md:flex-row">
									<div className="flex-1">
										<SelectField
											labelProps={{
												children: 'Day',
											}}
											className="w-full"
											placeholder="Select..."
											meta={availabilitySlotField.day}
											items={dayEnum.map((i) => ({
												value: i,
												name: i,
											}))}
											errors={availabilitySlotField.day.errors}
										/>
									</div>

									<TimePicker
										meta={availabilitySlotField.startTime}
										labelProps={{
											children: 'Start Time',
										}}
									/>

									<TimePicker
										meta={availabilitySlotField.endTime}
										labelProps={{
											children: 'End Time',
										}}
									/>
								</div>
								<div className="flex gap-2">
									<Button
										variant="secondary"
										{...form.reorder.getButtonProps({
											name: fields.availabilitySlots.name,
											from: index,
											to: 0,
										})}
									>
										Move to top
									</Button>
									<Button
										variant="destructive"
										{...form.remove.getButtonProps({
											name: fields.availabilitySlots.name,
											index,
										})}
									>
										Remove
									</Button>
								</div>
							</fieldset>
						)
					})}

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
	return <OnboardingInterview />
}
