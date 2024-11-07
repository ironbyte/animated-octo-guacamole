import { type ActionFunctionArgs } from '@remix-run/node'
import { Form, useActionData } from '@remix-run/react'
import * as React from 'react'
import { getFormProps, useForm, useInputControl } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { z } from 'zod'

import { Calendar } from '~/components/calendar'
import { Combobox, type ComboboxOption } from '~/components/combobox'
import { getMonthNumber, MonthPicker } from '~/components/conform/month-picker'
import { YearPicker } from '~/components/conform/year-picker'
import { Divider } from '~/components/divider'
import { Button } from '~/components/ui/button'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '~/components/ui/popover'
import { YearMonthPicker } from '~/components/year-month-picker'
import { cn } from '~/utils'

export function SampleDatePicker() {
	const [date, setDate] = React.useState<Date>()

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					variant={'outline'}
					className={cn(
						'w-[240px] justify-start text-left font-normal',
						!date && 'text-muted-foreground',
					)}
				>
					<CalendarIcon className="mr-2 h-4 w-4" />
					{date ? format(date, 'PPP') : <span>Pick a date</span>}
				</Button>
			</PopoverTrigger>
			<PopoverContent align="start" className="w-auto p-0">
				<Calendar
					mode="single"
					captionLayout="dropdown-buttons"
					selected={date}
					onSelect={setDate}
					fromYear={1960}
					toYear={2030}
				/>
			</PopoverContent>
		</Popover>
	)
}

const TARGET_SEGMENT_ITEMS = [
	'Back office',
	'Bunkering',
	'Chartering',
	'Commercial managers',
	'Consultancy',
	'Container Line',
	'Container Terminal',
	'Crewing',
	'Cruise industry',
	'Customer Service',
	'Customs clearance',
	'Finance',
	'Freight Forwarder',
	'IT solutions',
	'Legal',
	'Manufacturing',
	'NVOCC',
	'Oil / Chemicals Terminal',
	'Port agents',
	'Port',
	'Post-fixture',
	'Project cargo / Break-bulk',
	'Road Transport',
	'Ship broking',
	'Ship Chandling',
	'Stevedoring',
	'Technical managers',
	'Trading',
	'Training / Teaching',
	'Warehousing',
]

const schema = z.object({
	startYear: z
		.string({
			required_error: 'You must provide a year',
		})
		.transform((val) => parseInt(val, 10)),
	endYear: z
		.string({
			required_error: 'You must provide a year',
		})
		.transform((val) => parseInt(val, 10)),
	startMonth: z
		.string({
			required_error: 'You must provide a month',
		})
		.transform((val) => {
			return getMonthNumber(val)
		}),
	endMonth: z
		.string({
			required_error: 'You must provide a month',
		})
		.transform((val) => {
			return getMonthNumber(val)
		}),
	segment: z.string({
		required_error: 'You must provide a target segment',
	}),
})

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData()

	const submission = await parseWithZod(formData, {
		schema,
	})
	// Send the submission back to the client if the status is not successful
	if (submission.status !== 'success') {
		console.log('submission: ', JSON.stringify(submission, null, 2))
		return submission.reply()
	}

	console.log('submission: ', JSON.stringify(submission, null, 2))
	return null
}

const OPTIONS: ComboboxOption[] = []

export default function DesignSystem() {
	const [, setNewOption] = React.useState<{
		label: string
		value: string
	} | null>(null)

	const lastResult = useActionData<typeof action>()

	// The useForm hook will return all the metadata we need to render the form
	// and put focus on the first invalid field when the form is submitted
	const [form, fields] = useForm({
		id: 'design-system-form-demo',

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
	})

	const newOptions: ComboboxOption[] = Array.isArray(TARGET_SEGMENT_ITEMS)
		? TARGET_SEGMENT_ITEMS.map((i) => ({
				label: i,
				value: i,
			}))
		: []

	const segmentInput = useInputControl(fields.segment)

	return (
		<div className="container flex w-full flex-col items-center">
			<h1 className="mb-20 text-4xl font-black">Design System</h1>
			<Form
				method="POST"
				{...getFormProps(form)}
				className="mx-auto flex h-full w-full max-w-2xl flex-col px-8 py-2"
			>
				<YearMonthPicker />
				<div className="mb-4 flex flex-col gap-2">
					<span>{`${fields.startMonth.value ?? ''} ${fields.startYear.value ?? ''}`}</span>
					<span>{`${fields.endMonth.value ?? ''} ${fields.endYear.value ?? ''}`}</span>
				</div>

				<div className="flex gap-2">
					<MonthPicker
						meta={fields.startMonth}
						className="w-full"
						labelProps={{ children: 'Start Month*' }}
						errors={fields.startMonth.errors}
					/>
					<YearPicker
						meta={fields.startYear}
						className="w-full"
						labelProps={{ children: 'Start Year*' }}
						errors={fields.startYear.errors}
					/>
				</div>

				<div className="flex gap-2">
					<MonthPicker
						meta={fields.endMonth}
						className="w-full"
						labelProps={{ children: 'End Month*' }}
						errors={fields.endMonth.errors}
					/>
					<YearPicker
						meta={fields.endYear}
						className="w-full"
						labelProps={{ children: 'Start Year*' }}
						errors={fields.endYear.errors}
					/>
				</div>
				<Divider />
				<div className="flex flex-col gap-2">
					<div className="flex flex-col gap-2">
						<span>{segmentInput.value}</span>
					</div>
					<Combobox
						labelProps={{
							children: 'Items',
						}}
						className="w-full"
						options={[...OPTIONS, ...newOptions]}
						placeholder="Select or add item..."
						selected={segmentInput.value ?? ''} // string or array
						onChange={(value) => {
							if (Array.isArray(value)) return

							segmentInput.change(value)
						}}
						onCreate={(value: string) => {
							segmentInput.change(undefined)

							const newOption = {
								label: `${value} - New`,
								value,
							}
							setNewOption(newOption)
							segmentInput.change(newOption.value)

							OPTIONS.unshift(newOption)
						}}
					/>
					<div>{fields.segment.errors}</div>
					<div>{form.errors}</div>
					<Button>Submit</Button>
				</div>
			</Form>
		</div>
	)
}
