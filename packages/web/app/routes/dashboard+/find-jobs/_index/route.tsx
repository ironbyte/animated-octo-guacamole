import { useState } from 'react'
import {
	Calendar,
	DollarSign,
	Filter,
	MapPin,
	Search,
	Ship,
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
import { Input } from '~/components/ui/input'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '~/components/ui/select'

export const ROUTE_PATH = '/dashboard/find-jobs' as const

export default function Route() {
	return (
		<div className="">
			<Card className="mb-6">
				<CardContent className="flex items-center p-6">
					<div>
						<h2 className="mb-2 text-2xl font-bold">Find Jobs</h2>
						<p className="mb-2 text-gray-600">
							Find jobs that match your skills and experience
						</p>
						<div className="flex space-x-2"></div>
					</div>
				</CardContent>
			</Card>
			<FindJobs />
		</div>
	)
}

function FindJobs() {
	const [searchTerm, setSearchTerm] = useState('')
	const [jobType, setJobType] = useState('')
	const [experience, setExperience] = useState('')

	// This would typically come from an API call
	const jobs = [
		{
			id: 1,
			title: 'Chief Engineer',
			company: 'OceanTech Shipping',
			location: 'International',
			salary: 'AED 8,000 - AED 12,000/month',
			type: 'Full-time',
			experience: '10+ years',
			posted: '2 days ago',
		},
		{
			id: 2,
			title: 'Second Officer',
			company: 'Global Marine Services',
			location: 'Asia-Pacific',
			salary: 'AED 5,000 - AED 7,000/month',
			type: 'Contract',
			experience: '5-7 years',
			posted: '3 days ago',
		},
		{
			id: 3,
			title: 'Able Seaman',
			company: 'Atlantic Freight Lines',
			location: 'North America',
			salary: 'AED 3,500 - AED 4,500/month',
			type: 'Full-time',
			experience: '2-4 years',
			posted: '5 days ago',
		},
		{
			id: 4,
			title: 'Marine Engineer',
			company: 'Pacific Cruises',
			location: 'Worldwide',
			salary: 'AED 6,000 - AED 9,000/month',
			type: 'Full-time',
			experience: '7-10 years',
			posted: '1 week ago',
		},
	]

	return (
		<div className="">
			<div className="mb-6 flex flex-col gap-4 md:flex-row">
				<div className="flex-grow">
					<div className="relative">
						<Search className="absolute left-2 top-1/2 -translate-y-1/2 transform text-gray-400" />
						<Input
							type="text"
							placeholder="Search jobs..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="pl-10"
						/>
					</div>
				</div>
				<Select value={jobType} onValueChange={setJobType}>
					<SelectTrigger className="w-full md:w-[180px]">
						<SelectValue placeholder="Job Type" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="full-time">Full-time</SelectItem>
						<SelectItem value="contract">Contract</SelectItem>
						<SelectItem value="temporary">Temporary</SelectItem>
					</SelectContent>
				</Select>
				<Select value={experience} onValueChange={setExperience}>
					<SelectTrigger className="w-full md:w-[180px]">
						<SelectValue placeholder="Experience" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="entry">Entry Level</SelectItem>
						<SelectItem value="mid">Mid Level</SelectItem>
						<SelectItem value="senior">Senior Level</SelectItem>
					</SelectContent>
				</Select>
				<Button className="w-full md:w-auto">
					<Filter className="mr-2 h-4 w-4" />
					More Filters
				</Button>
			</div>

			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
				{jobs.map((job) => (
					<Card key={job.id}>
						<CardHeader>
							<CardTitle className="flex items-center justify-between">
								<span>{job.title}</span>
								<Ship className="h-5 w-5 text-blue-500" />
							</CardTitle>
							<p className="text-sm text-gray-500">{job.company}</p>
						</CardHeader>
						<CardContent>
							<div className="space-y-2 text-sm">
								<div className="flex items-center">
									<MapPin className="mr-2 h-4 w-4 text-gray-400" />
									{job.location}
								</div>
								<div className="flex items-center">
									<DollarSign className="mr-2 h-4 w-4 text-gray-400" />
									{job.salary}
								</div>
								<div className="flex items-center">
									<Calendar className="mr-2 h-4 w-4 text-gray-400" />
									Posted {job.posted}
								</div>
							</div>
						</CardContent>
						<CardFooter className="flex items-center justify-between">
							<div className="space-x-2">
								<Badge variant="secondary">{job.type}</Badge>
								<Badge variant="outline">{job.experience}</Badge>
							</div>
							<Button>Apply Now</Button>
						</CardFooter>
					</Card>
				))}
			</div>
		</div>
	)
}
