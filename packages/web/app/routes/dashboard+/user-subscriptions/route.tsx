import { useState } from 'react'
import * as React from 'react'
import {
	CheckCircle,
	CreditCard,
	DollarSign,
	MoreHorizontal,
	RefreshCw,
	Search,
	TrendingUp,
	Users,
	UserX,
	XCircle,
} from 'lucide-react'

import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { Input } from '~/components/ui/input'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '~/components/ui/table'

export const ROUTE_PATH = '/dashboard/user-subscriptions' as const

// This would typically come from an API call
const subscriptions = [
	{
		id: 1,
		user: 'John Doe',
		role: 'Job Candidate',
		email: 'john@example.com',
		plan: 'Premium',
		status: 'Active',
		startDate: '2023-06-01',
		nextBilling: '2023-07-01',
		amount: 99,
	},
	{
		id: 2,
		user: 'Jane Smith',
		role: 'Job Candidate',
		email: 'jane@example.com',
		plan: 'Premium',
		status: 'Cancelled',
		startDate: '2023-05-15',
		nextBilling: '2023-06-15',
		amount: 99,
	},
	{
		id: 3,
		user: 'Bob Johnson',
		role: 'Job Candidate',
		email: 'bob@example.com',
		plan: 'Premium',
		status: 'Active',
		startDate: '2023-06-10',
		nextBilling: '2023-07-10',
		amount: 99,
	},
]

function UserSubscriptions() {
	const [searchTerm, setSearchTerm] = useState('')

	const filteredSubscriptions = subscriptions.filter(
		(sub) =>
			sub.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
			sub.email.toLowerCase().includes(searchTerm.toLowerCase()),
	)

	const activeSubscriptions = subscriptions.filter(
		(sub) => sub.status === 'Active',
	).length
	const totalRevenue = subscriptions.reduce((sum, sub) => sum + sub.amount, 0)
	const averageRevenue = totalRevenue / subscriptions.length

	return (
		<div className="">
			<div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Total Subscriptions
						</CardTitle>
						<Users className="text-muted-foreground h-4 w-4" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{subscriptions.length}</div>
						<p className="text-muted-foreground text-xs">
							+2.5% from last month
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Active Subscriptions
						</CardTitle>
						<CheckCircle className="text-muted-foreground h-4 w-4" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{activeSubscriptions}</div>
						<p className="text-muted-foreground text-xs">
							+1.2% from last month
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
						<DollarSign className="text-muted-foreground h-4 w-4" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">AED {totalRevenue}</div>
						<p className="text-muted-foreground text-xs">
							+5.1% from last month
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Average Revenue
						</CardTitle>
						<TrendingUp className="text-muted-foreground h-4 w-4" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							AED {averageRevenue.toFixed(2)}
						</div>
						<p className="text-muted-foreground text-xs">Per subscription</p>
					</CardContent>
				</Card>
			</div>

			<div className="mb-6 flex items-center justify-between">
				<div className="relative w-64">
					<Search className="absolute left-2 top-1/2 -translate-y-1/2 transform text-gray-400" />
					<Input
						type="text"
						placeholder="Search..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="pl-8"
					/>
				</div>
			</div>

			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>User</TableHead>
						<TableHead>Role</TableHead>
						<TableHead>Plan</TableHead>
						<TableHead>Status</TableHead>
						<TableHead>Start Date</TableHead>
						<TableHead>Next Billing</TableHead>
						<TableHead>Amount</TableHead>
						<TableHead className="text-right">Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{filteredSubscriptions.map((sub) => (
						<TableRow key={sub.id}>
							<TableCell className="font-medium">
								{sub.user}
								<br />
								<span className="text-sm text-gray-500">{sub.email}</span>
							</TableCell>
							<TableCell>{sub.role}</TableCell>
							<TableCell>{sub.plan}</TableCell>
							<TableCell>
								<Badge
									variant={
										sub.status === 'Active'
											? 'default'
											: sub.status === 'Cancelled'
												? 'destructive'
												: 'secondary'
									}
								>
									{sub.status}
								</Badge>
							</TableCell>
							<TableCell>{sub.startDate}</TableCell>
							<TableCell>{sub.nextBilling}</TableCell>
							<TableCell>AED {sub.amount}</TableCell>
							<TableCell className="text-right">
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant="ghost" className="h-8 w-8 p-0">
											<span className="sr-only">Open menu</span>
											<MoreHorizontal className="h-4 w-4" />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										<DropdownMenuLabel>Actions</DropdownMenuLabel>
										<DropdownMenuItem>
											<CreditCard className="mr-2 h-4 w-4" />
											View Payment History
										</DropdownMenuItem>
										<DropdownMenuItem>
											<RefreshCw className="mr-2 h-4 w-4" />
											Renew Subscription
										</DropdownMenuItem>
										<DropdownMenuSeparator />
										<DropdownMenuItem>
											{sub.status === 'Active' ? (
												<>
													<XCircle className="mr-2 h-4 w-4" />
													Cancel Subscription
												</>
											) : (
												<>
													<CheckCircle className="mr-2 h-4 w-4" />
													Reactivate Subscription
												</>
											)}
										</DropdownMenuItem>
										<DropdownMenuSeparator />
										<DropdownMenuItem className="text-red-600">
											<UserX className="mr-2 h-4 w-4" />
											Suspend User
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	)
}

export default function Route() {
	return <UserSubscriptions />
}
