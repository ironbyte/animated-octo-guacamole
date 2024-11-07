import { Anchor, Compass, FileText, Filter, Search, User } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '~/components/ui/table'
import { useUser } from '~/lib/utils'

export function JobCandidateOverview() {
	const user = useUser()

	const userName = `${user.profile?.firstName}	${user.profile?.lastName}`

	return (
		<div>
			{/* Profile summary */}
			<Card className="mb-6">
				<CardContent className="flex items-center p-6">
					<Avatar className="mr-6 h-24 w-24">
						<AvatarImage
							src="/placeholder.svg?height=96&width=96"
							alt={userName}
						/>
						<AvatarFallback>SJ</AvatarFallback>
					</Avatar>
					<div>
						<h2 className="mb-2 text-2xl font-bold">{userName}</h2>
						<p className="mb-2 text-gray-600">
							Chief Officer | 10 years experience
						</p>
						<div className="flex space-x-2">
							<Badge>STCW Certified</Badge>
							<Badge variant="secondary">Tanker Experience</Badge>
							<Badge variant="secondary">Offshore</Badge>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Quick action buttons */}
			<div className="mb-6 flex space-x-4">
				<Button>
					<Search className="mr-2 h-4 w-4" />
					Search Jobs
				</Button>
				<Button variant="outline">
					<FileText className="mr-2 h-4 w-4" />
					Update Resume
				</Button>
				<Button variant="outline">
					<Filter className="mr-2 h-4 w-4" />
					Set Job Alerts
				</Button>
			</div>

			{/* Metrics */}
			<div className="mb-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Job Views</CardTitle>
						<User className="text-muted-foreground h-4 w-4" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">1,259</div>
						<p className="text-muted-foreground text-xs">
							+20.1% from last month
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Applications</CardTitle>
						<FileText className="text-muted-foreground h-4 w-4" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">23</div>
						<p className="text-muted-foreground text-xs">+3 since last week</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Interviews</CardTitle>
						<Compass className="text-muted-foreground h-4 w-4" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">5</div>
						<p className="text-muted-foreground text-xs">
							2 upcoming this week
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Saved Jobs</CardTitle>
						<Anchor className="text-muted-foreground h-4 w-4" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">38</div>
						<p className="text-muted-foreground text-xs">+7 new listings</p>
					</CardContent>
				</Card>
			</div>

			{/* Recent job postings table */}
			<h2 className="mb-4 text-xl font-semibold">Recent Job Postings</h2>
			<Card>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Position</TableHead>
								<TableHead>Company</TableHead>
								<TableHead>Location</TableHead>
								<TableHead>Salary</TableHead>
								<TableHead>Posted</TableHead>
								<TableHead className="text-right">Action</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							<TableRow>
								<TableCell className="font-medium">Chief Engineer</TableCell>
								<TableCell>OceanTech Shipping</TableCell>
								<TableCell>International</TableCell>
								<TableCell>AED 8,000 - AED 12,000/month</TableCell>
								<TableCell>2 days ago</TableCell>
								<TableCell className="text-right">
									<Button size="sm">Apply</Button>
								</TableCell>
							</TableRow>
							<TableRow>
								<TableCell className="font-medium">Second Officer</TableCell>
								<TableCell>Global Marine Services</TableCell>
								<TableCell>Asia-Pacific</TableCell>
								<TableCell>AED 5,000 - AED 7,000/month</TableCell>
								<TableCell>3 days ago</TableCell>
								<TableCell className="text-right">
									<Button size="sm">Apply</Button>
								</TableCell>
							</TableRow>
							<TableRow>
								<TableCell className="font-medium">Able Seaman</TableCell>
								<TableCell>Atlantic Freight Lines</TableCell>
								<TableCell>North America</TableCell>
								<TableCell>AED 3,500 - AED 4,500/month</TableCell>
								<TableCell>5 days ago</TableCell>
								<TableCell className="text-right">
									<Button size="sm">Apply</Button>
								</TableCell>
							</TableRow>
							<TableRow>
								<TableCell className="font-medium">Marine Engineer</TableCell>
								<TableCell>Pacific Cruises</TableCell>
								<TableCell>Worldwide</TableCell>
								<TableCell>AED 6,000 - AED 9,000/month</TableCell>
								<TableCell>1 week ago</TableCell>
								<TableCell className="text-right">
									<Button size="sm">Apply</Button>
								</TableCell>
							</TableRow>
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	)
}
