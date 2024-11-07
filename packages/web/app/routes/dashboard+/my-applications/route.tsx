import { useState } from 'react'
import {
	Calendar,
	Clock,
	FileText,
	MapPin,
	MoreVertical,
	Ship,
	Trash2,
} from 'lucide-react'

import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from '~/components/ui/card'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '~/components/ui/select'

export const ROUTE_PATH = '/dashboard/my-applications' as const

export default function Route() {
	return (
		<div className="">
			<Card className="mb-6">
				<CardContent className="flex items-center p-6">
					<div>
						<h2 className="mb-2 text-2xl font-bold">My Applications</h2>
						<p className="mb-2 text-gray-600">
							List of all your job applications
						</p>
						<div className="flex space-x-2"></div>
					</div>
				</CardContent>
			</Card>
			<MyApplications />
		</div>
	)
}

function MyApplications() {
	const [filter, setFilter] = useState('all')

	// This would typically come from an API call
	const applications = [
		{
			id: 1,
			jobTitle: 'Chief Engineer',
			company: 'OceanTech Shipping',
			location: 'International',
			appliedDate: '2023-09-15',
			status: 'Under Review',
			nextStep: 'Technical Interview',
			nextStepDate: '2023-09-30',
		},
		{
			id: 2,
			jobTitle: 'Second Officer',
			company: 'Global Marine Services',
			location: 'Asia-Pacific',
			appliedDate: '2023-09-10',
			status: 'Interview Scheduled',
			nextStep: 'Video Interview',
			nextStepDate: '2023-09-25',
		},
		{
			id: 3,
			jobTitle: 'Able Seaman',
			company: 'Atlantic Freight Lines',
			location: 'North America',
			appliedDate: '2023-09-05',
			status: 'Application Submitted',
			nextStep: 'Awaiting Review',
			nextStepDate: null,
		},
		{
			id: 4,
			jobTitle: 'Marine Engineer',
			company: 'Pacific Cruises',
			location: 'Worldwide',
			appliedDate: '2023-08-28',
			status: 'Rejected',
			nextStep: null,
			nextStepDate: null,
		},
	]

	const filteredApplications = applications.filter((app) => {
		if (filter === 'all') return true
		return app.status.toLowerCase().includes(filter.toLowerCase())
	})

	const getStatusColor = (status) => {
		switch (status.toLowerCase()) {
			case 'under review':
				return 'bg-yellow-100 text-yellow-800'
			case 'interview scheduled':
				return 'bg-green-100 text-green-800'
			case 'application submitted':
				return 'bg-blue-100 text-blue-800'
			case 'rejected':
				return 'bg-red-100 text-red-800'
			default:
				return 'bg-gray-100 text-gray-800'
		}
	}

	return (
		<div className="">
			<div className="mb-6 flex items-center justify-between">
				<Select value={filter} onValueChange={setFilter}>
					<SelectTrigger className="w-[180px]">
						<SelectValue placeholder="Filter by status" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Applications</SelectItem>
						<SelectItem value="review">Under Review</SelectItem>
						<SelectItem value="interview">Interview Scheduled</SelectItem>
						<SelectItem value="submitted">Application Submitted</SelectItem>
						<SelectItem value="rejected">Rejected</SelectItem>
					</SelectContent>
				</Select>
			</div>

			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
				{filteredApplications.map((application) => (
					<Card key={application.id}>
						<CardHeader>
							<CardTitle className="flex items-center justify-between">
								<span>{application.jobTitle}</span>
								<Ship className="h-5 w-5 text-blue-500" />
							</CardTitle>
							<p className="text-sm text-gray-500">{application.company}</p>
						</CardHeader>
						<CardContent>
							<div className="space-y-2 text-sm">
								<div className="flex items-center">
									<MapPin className="mr-2 h-4 w-4 text-gray-400" />
									{application.location}
								</div>
								<div className="flex items-center">
									<Calendar className="mr-2 h-4 w-4 text-gray-400" />
									Applied on {application.appliedDate}
								</div>
								<div className="flex items-center">
									<Badge className={`${getStatusColor(application.status)}`}>
										{application.status}
									</Badge>
								</div>
								{application.nextStep && (
									<div className="flex items-center">
										<Clock className="mr-2 h-4 w-4 text-gray-400" />
										Next: {application.nextStep}{' '}
										{application.nextStepDate
											? `on ${application.nextStepDate}`
											: ''}
									</div>
								)}
							</div>
						</CardContent>
						<CardFooter className="flex justify-end">
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="ghost" size="icon">
										<MoreVertical className="h-4 w-4" />
										<span className="sr-only">Open menu</span>
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									<DropdownMenuLabel>Actions</DropdownMenuLabel>
									<DropdownMenuItem>
										<FileText className="mr-2 h-4 w-4" />
										View Details
									</DropdownMenuItem>
									<DropdownMenuItem>
										<Calendar className="mr-2 h-4 w-4" />
										Schedule Interview
									</DropdownMenuItem>
									<DropdownMenuSeparator />
									<DropdownMenuItem className="text-red-600">
										<Trash2 className="mr-2 h-4 w-4" />
										Withdraw Application
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</CardFooter>
					</Card>
				))}
			</div>

			{filteredApplications.length === 0 && (
				<div className="py-10 text-center">
					<p className="text-gray-500">
						No applications found matching the selected filter.
					</p>
				</div>
			)}
		</div>
	)
}
