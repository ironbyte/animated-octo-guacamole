import * as React from 'react'
import { format, setMonth, setYear } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'

import { Button } from '~/components/ui/button'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '~/components/ui/popover'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '~/components/ui/select'
import { cn } from '~/utils'

export function YearMonthPicker() {
	const [date, setDate] = React.useState<Date>(new Date())

	const years = Array.from(
		{ length: 10 },
		(_, i) => new Date().getFullYear() - 5 + i,
	)
	const months = [
		'January',
		'February',
		'March',
		'April',
		'May',
		'June',
		'July',
		'August',
		'September',
		'October',
		'November',
		'December',
	]

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					variant={'outline'}
					className={cn(
						'w-[280px] justify-start text-left font-normal',
						!date && 'text-muted-foreground',
					)}
				>
					<CalendarIcon className="mr-2 h-4 w-4" />
					{date ? format(date, 'MMMM yyyy') : <span>Pick a month</span>}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-auto p-0" align="start">
				<div className="flex gap-2 p-3">
					<Select
						onValueChange={(value) => setDate(setMonth(date, parseInt(value)))}
					>
						<SelectTrigger className="w-[120px]">
							<SelectValue placeholder="Month" />
						</SelectTrigger>
						<SelectContent>
							{months.map((month, index) => (
								<SelectItem key={month} value={index.toString()}>
									{month}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<Select
						onValueChange={(value) => setDate(setYear(date, parseInt(value)))}
					>
						<SelectTrigger className="w-[120px]">
							<SelectValue placeholder="Year" />
						</SelectTrigger>
						<SelectContent>
							{years.map((year) => (
								<SelectItem key={year} value={year.toString()}>
									{year}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</PopoverContent>
		</Popover>
	)
}
