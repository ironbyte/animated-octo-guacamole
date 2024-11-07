import * as React from 'react'
import { useInputControl, type FieldMetadata } from '@conform-to/react'
import { CalendarIcon, Check } from 'lucide-react'

import { ErrorList, type ListOfErrors } from '~/components/error-list'
import { Button } from '~/components/ui/button'
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
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

interface YearPickerProps {
	className?: string
	placeholder?: string
	labelProps: React.LabelHTMLAttributes<HTMLLabelElement>
	errors?: ListOfErrors
	meta: FieldMetadata<string>
	disabled?: boolean
}

export function YearPicker({
	placeholder,
	className,
	labelProps,
	errors,
	meta,
	disabled,
}: YearPickerProps) {
	const id = React.useId()
	const input = useInputControl(meta)

	const [open, setOpen] = React.useState(false)

	const currentYear = new Date().getFullYear()
	const years = React.useMemo(
		() =>
			Array.from({ length: currentYear - 1900 + 1 }, (_, i) =>
				(currentYear - i).toString(),
			),
		[currentYear],
	)
	const errorId = errors?.length ? `${id}-error` : undefined

	const handleYearChange = (newYear: string, autoClose: boolean = true) => {
		input.change(newYear)

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
						{input.value || 'Pick a year'}
						<CalendarIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-[200px] p-0" id={id}>
					<Command>
						<CommandInput
							placeholder={placeholder ?? 'Enter year...'}
							onValueChange={(search) => {
								if (search && !isNaN(Number(search)) && search.length === 4) {
									handleYearChange(search, false)
								}
							}}
						/>
						<CommandList>
							<CommandEmpty>No year found.</CommandEmpty>
							<CommandGroup>
								{years.map((y) => (
									<CommandItem
										key={y}
										value={y}
										onSelect={(currentValue) => {
											handleYearChange(currentValue, false)
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
