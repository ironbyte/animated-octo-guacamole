import { useLoaderData } from '@remix-run/react'
import * as React from 'react'
import { format } from 'date-fns'
import { BarChart2, Building2, Plus, UserPlus, Users } from 'lucide-react'

import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Dialog, DialogTrigger } from '~/components/ui/dialog'
import { Input } from '~/components/ui/input'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '~/components/ui/table'
import { type loader } from './route'

const DATETIME_FORMAT = 'dd/MM/yyyy HH:mm:ss'

export function AdminOverview() {
	const { users } = useLoaderData<typeof loader>()

	const [inviteDialogOpen, setInviteDialogOpen] = React.useState(false)

	const recentUsers: typeof users = users

	const recentOrganizations = [
		{
			id: 1,
			name: 'OceanTech Shipping',
			admin: 'Alice Brown',
			createdAt: '2023-09-12',
		},
	]

	return (
		<div>
			<div className="mb-8 flex items-center justify-between">
				<div className="flex-1 pr-4">
					<Input type="search" placeholder="Search..." className="max-w-sm" />
				</div>
			</div>

			<div className="mb-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Users</CardTitle>
						<Users className="text-muted-foreground h-4 w-4" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{users.length}</div>
						<p className="text-muted-foreground text-xs">
							+20% from last month
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Organizations</CardTitle>
						<Building2 className="text-muted-foreground h-4 w-4" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">1</div>
						<p className="text-muted-foreground text-xs">+1 this week</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
						<BarChart2 className="text-muted-foreground h-4 w-4" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">0</div>
						<p className="text-muted-foreground text-xs">+0% from last week</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							New Applications
						</CardTitle>
						<UserPlus className="text-muted-foreground h-4 w-4" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">0</div>
						<p className="text-muted-foreground text-xs">+0% from yesterday</p>
					</CardContent>
				</Card>
			</div>

			<div className="mb-8 grid gap-6 md:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle>Recent Users</CardTitle>
					</CardHeader>
					<CardContent>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>First Name</TableHead>
									<TableHead>Last Name</TableHead>
									<TableHead>Email</TableHead>
									<TableHead>Role</TableHead>
									<TableHead>Joined</TableHead>
									<TableHead>Onboarding Status</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{recentUsers.map((user) => {
									let role = ''

									switch (user.role) {
										case 'job_seeker':
											role = 'Job Seeker'
											break
										case 'admin':
											role = 'Admin'
											break
										case 'org_member':
											role = 'Organization Member'
											break
									}

									return (
										<TableRow key={user.id}>
											<TableCell>{user.profile.firstName}</TableCell>
											<TableCell>{user.profile.lastName}</TableCell>
											<TableCell>{user.email}</TableCell>
											<TableCell>{role}</TableCell>
											<TableCell>
												{format(user.timeCreated, DATETIME_FORMAT)}
											</TableCell>
											<TableCell>
												{user.isOnboarded ? 'Onboarded' : 'Not Onboarded'}
											</TableCell>
										</TableRow>
									)
								})}
							</TableBody>
						</Table>
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Recent Organizations</CardTitle>
					</CardHeader>
					<CardContent>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Name</TableHead>
									<TableHead>Admin</TableHead>
									<TableHead>Created</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{recentOrganizations.map((org) => (
									<TableRow key={org.id}>
										<TableCell>{org.name}</TableCell>
										<TableCell>{org.admin}</TableCell>
										<TableCell>{org.createdAt}</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
