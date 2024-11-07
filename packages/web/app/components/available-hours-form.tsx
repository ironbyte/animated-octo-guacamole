'use client'

import { useState } from 'react'
import { PlusIcon, TrashIcon } from 'lucide-react'

import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'

interface TimeSlot {
	day: string
	startTime: string
	endTime: string
}

export function AvailableHoursForm() {
	const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([
		{ day: '', startTime: '', endTime: '' },
	])

	console.log('timeSlots: ', timeSlots)

	const addTimeSlot = () => {
		setTimeSlots([...timeSlots, { day: '', startTime: '', endTime: '' }])
	}

	const removeTimeSlot = (index: number) => {
		setTimeSlots(timeSlots.filter((_, i) => i !== index))
	}

	const updateTimeSlot = (
		index: number,
		field: keyof TimeSlot,
		value: string,
	) => {
		const updatedSlots = timeSlots.map((slot, i) => {
			if (i === index) {
				return { ...slot, [field]: value }
			}
			return slot
		})
		setTimeSlots(updatedSlots)
	}

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		console.log('Submitted time slots:', timeSlots)
		// Here you would typically send the data to your backend or perform further actions
	}

	return (
		<Card className="mx-auto w-full max-w-2xl">
			<CardHeader>
				<CardTitle className="text-2xl font-bold">Available Hours</CardTitle>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit} className="space-y-4">
					{timeSlots.map((slot, index) => (
						<div
							key={index}
							className="flex flex-wrap items-end gap-4 border-b pb-4"
						>
							<div className="min-w-[200px] flex-1">
								<Label htmlFor={`day-${index}`} className="mb-2 block">
									Day
								</Label>
								<Input
									id={`day-${index}`}
									value={slot.day}
									onChange={(e) => updateTimeSlot(index, 'day', e.target.value)}
									placeholder="e.g., Monday"
									required
								/>
							</div>
							<div className="min-w-[150px] flex-1">
								<Label htmlFor={`start-${index}`} className="mb-2 block">
									Start Time
								</Label>
								<Input
									id={`start-${index}`}
									type="time"
									value={slot.startTime}
									onChange={(e) =>
										updateTimeSlot(index, 'startTime', e.target.value)
									}
									required
								/>
							</div>
							<div className="min-w-[150px] flex-1">
								<Label htmlFor={`end-${index}`} className="mb-2 block">
									End Time
								</Label>
								<Input
									id={`end-${index}`}
									type="time"
									value={slot.endTime}
									onChange={(e) =>
										updateTimeSlot(index, 'endTime', e.target.value)
									}
									required
								/>
							</div>
							{index > 0 && (
								<Button
									type="button"
									variant="destructive"
									size="icon"
									onClick={() => removeTimeSlot(index)}
									className="flex-shrink-0"
									aria-label="Remove time slot"
								>
									<TrashIcon className="h-4 w-4" />
								</Button>
							)}
						</div>
					))}
					<Button
						type="button"
						variant="outline"
						onClick={addTimeSlot}
						className="w-full"
					>
						<PlusIcon className="mr-2 h-4 w-4" />
						Add Another Time Slot
					</Button>
					<Button type="submit" className="w-full">
						Submit Available Hours
					</Button>
				</form>
			</CardContent>
		</Card>
	)
}
