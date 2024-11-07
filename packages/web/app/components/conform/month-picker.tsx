import * as React from 'react'
import { useInputControl, type FieldMetadata } from '@conform-to/react'
import { CalendarIcon, Check } from 'lucide-react'

import { ErrorList, type ListOfErrors } from '~/components/error-list'
import { Button } from '~/components/ui/button'
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandItem,
	CommandList,
} from '~/components/ui/command'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '~/components/ui/popover'
import { cn } from '~/utils'
import { Label } from '../ui/label'

export enum Month {
	January = 1,
	February = 2,
	March = 3,
	April = 4,
	May = 5,
	June = 6,
	July = 7,
	August = 8,
	September = 9,
	October = 10,
	November = 11,
	December = 12,
}

export const getMonthOptions = () => {
	return Object.entries(Month)
		.filter(([key]) => isNaN(Number(key)))
		.map(([key, value]) => ({ label: key, value: value.toString() }))
}

// New helper function to get a list of all month names
export function getMonthNames(): string[] {
	return Object.keys(Month).filter((key) => isNaN(Number(key)))
}

// Helper function to get month name from number
export function getMonthName(monthNumber: number): string {
	const monthName = Month[monthNumber]

	if (!monthName) {
		throw new Error(`Invalid month number: ${monthNumber}`)
	}

	return monthName
}

// Helper function to get month number from name
export function getMonthNumber(monthName: string): number {
	return Month[monthName as keyof typeof Month]
}

interface MonthPickerProps {
	className?: string
	placeholder?: string
	labelProps?: React.LabelHTMLAttributes<HTMLLabelElement>
	errors?: ListOfErrors
	meta: FieldMetadata<string>
	disabled?: boolean
}

export function MonthPicker({
	placeholder,
	className,
	labelProps,
	errors,
	meta,
	disabled,
}: MonthPickerProps) {
	const id = React.useId()
	const input = useInputControl(meta)
	const [open, setOpen] = React.useState(false)
	const errorId = errors?.length ? `${id}-error` : undefined
	const monthNames = React.useMemo(() => getMonthNames(), [])

	const handleMonthChange = (newMonth: string, autoClose: boolean = true) => {
		input.change(newMonth)

		if (autoClose) {
			setOpen(false)
		}
	}

	return (
		<div className={cn('block', className)}>
			{labelProps && <label htmlFor={id}>{labelProps.children}</label>}
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild disabled={disabled}>
					<Button
						variant="outline"
						role="combobox"
						aria-expanded={open}
						className="text-muted-foreground w-full justify-between"
					>
						{input.value || 'Pick a month'}
						<CalendarIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-[200px] p-0" id={id}>
					<Command>
						<CommandList>
							<CommandEmpty>No year found.</CommandEmpty>
							<CommandGroup>
								{monthNames.map((y) => (
									<CommandItem
										key={y}
										value={y}
										onSelect={(currentValue) => {
											handleMonthChange(currentValue, false)
										}}
									>
										<Check
											className={cn(
												'mr-2 h-4 w-4',
												y === input.value ? 'opacity-100' : 'opacity-0',
											)}
										/>
										{y}
									</CommandItem>
								))}
							</CommandGroup>
						</CommandList>
					</Command>
				</PopoverContent>
			</Popover>
			<div className="text-destructive-foreground min-h-[32px] px-4 pb-3 pt-1">
				{errorId ? <ErrorList id={errorId} errors={errors} /> : null}
			</div>
		</div>
	)
}
