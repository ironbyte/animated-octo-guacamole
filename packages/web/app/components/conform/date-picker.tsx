import * as React from 'react'
import {
	unstable_useControl as useControl,
	type FieldMetadata,
} from '@conform-to/react'
import { format } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'

import { ErrorList, type ListOfErrors } from '~/components/error-list'
import { Button } from '~/components/ui/button'
import { Calendar, type CalendarProps } from '~/components/ui/calendar'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '~/components/ui/popover'
import { cn } from '~/utils'
import { Label } from '../ui/label'

export function DatePickerConform({
	meta,
	labelProps,
	errors,
	calendarProps,
}: {
	meta: FieldMetadata<Date>
	errors?: ListOfErrors
	labelProps: React.LabelHTMLAttributes<HTMLLabelElement>
	calendarProps?: CalendarProps
}) {
	const triggerRef = React.useRef<HTMLButtonElement>(null)
	const control = useControl(meta)
	const id = React.useId()
	const errorId = errors?.length ? `${id}-error` : undefined

	return (
		<div className="flex flex-col gap-2">
			<Label htmlFor={id} {...labelProps} />

			<input
				id={id}
				className="sr-only"
				aria-hidden
				tabIndex={-1}
				ref={control.register}
				name={meta.name}
				defaultValue={
					meta.initialValue ? new Date(meta.initialValue).toISOString() : ''
				}
				onFocus={() => {
					triggerRef.current?.focus()
				}}
			/>

			<Popover>
				<PopoverTrigger asChild>
					<Button
						ref={triggerRef}
						variant={'outline'}
						className={cn(
							'w-full justify-start text-left font-normal focus:ring-2 focus:ring-stone-950 focus:ring-offset-2',
							!control.value && 'text-muted-foreground',
						)}
					>
						<CalendarIcon className="mr-2 h-4 w-4" />
						{control.value ? (
							format(control.value, 'PPP')
						) : (
							<span>Pick a date</span>
						)}
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-auto p-0">
					<Calendar
						mode="single"
						selected={new Date(control.value ?? '')}
						onSelect={(value) => control.change(value?.toISOString() ?? '')}
						initialFocus
						{...calendarProps}
					/>
				</PopoverContent>
			</Popover>

			<div className="text-foreground-destructive min-h-[32px] px-4 pb-3 pt-1">
				{errorId ? <ErrorList id={errorId} errors={errors} /> : null}
			</div>
		</div>
	)
}
