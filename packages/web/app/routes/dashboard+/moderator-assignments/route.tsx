import {
	json,
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
} from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import * as React from 'react'
import { db } from '@nautikos/core/db'
import {
	moderatorAssignments,
	type InsertModeratorAssignmentModel,
} from '@nautikos/core/schema/moderator-assignments'
import { users } from '@nautikos/core/schema/users'
import { parseWithZod } from '@conform-to/zod'
import {
	createColumnHelper,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
	type ColumnFiltersState,
	type SortingState,
} from '@tanstack/react-table'
import { formatDate } from 'date-fns'
import { and, eq } from 'drizzle-orm'

import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '~/components/ui/table'
import { requireUserSession } from '~/lib/auth.server'
import { createToastHeaders } from '~/lib/toast.server'
import { CreateModeratorAssignmentFormDialog } from './create-assignment-form-dialog'
import { createModeratorAssignmentSchema } from './validation.schema'

export const ROUTE_PATH = '/dashboard/moderator-assignments' as const

export enum ModeratorAssignmentActionIntent {
	CreateAssignment = 'create-assignment',
}

const DATETIME_FORMAT = 'dd/MM/yyyy HH:mm:ss'

async function createModeratorAssignmentAction({
	formData,
	userId,
}: {
	userId: string
	formData: FormData
}) {
	const submission = await parseWithZod(formData, {
		schema: createModeratorAssignmentSchema,
	})

	if (submission.status !== 'success') {
		console.log('submission.reply():', submission.reply())

		return json({ result: submission.reply() })
	}

	const { value } = submission

	const createModeratorAssignmentInsert: InsertModeratorAssignmentModel = {
		...value,
		assignedBy: userId,
		assignedAt: new Date(),
	}

	console.debug(
		'createModeratorAssignmentInsert: ',
		JSON.stringify(createModeratorAssignmentInsert, null, 2),
	)

	await db
		.insert(moderatorAssignments)
		.values(createModeratorAssignmentInsert)
		.onConflictDoUpdate({
			target: [moderatorAssignments.jobSeekerId],
			set: {
				...value,
				timeUpdated: new Date(),
			},
		})

	return json(
		{
			result: submission.reply({
				resetForm: true,
			}),
		},
		{
			headers: await createToastHeaders({
				type: 'success',
				title: 'Success!',
				description: 'Saved successfully',
			}),
		},
	)
}

export async function action({ request }: ActionFunctionArgs) {
	const userSession = await requireUserSession(request)
	const userId = userSession.user.id

	const formData = await request.formData()
	const intent = formData.get('intent')

	switch (intent) {
		case ModeratorAssignmentActionIntent.CreateAssignment: {
			return createModeratorAssignmentAction({
				userId,
				formData,
			})
		}

		default: {
			throw new Response(`Invalid intent "${intent}"`, { status: 400 })
		}
	}
}

export async function loader({}: LoaderFunctionArgs) {
	const jobSeekersWithAssignments = await db.query.jobSeeker.findMany({
		with: {
			moderatorAssignment: {
				with: {
					moderator: true,
					assignedByAdmin: true,
				},
			},
			user: {
				columns: {
					isVerified: true,
					isOnboarded: true,
				},
				with: {
					profile: true,
				},
			},
		},
	})

	const jobSeekersToBeEvaluated = jobSeekersWithAssignments.filter(
		(jobSeeker) => jobSeeker.user.isOnboarded && jobSeeker.user.isVerified,
	)

	const moderators = await db.query.users.findMany({
		where: and(eq(users.role, 'moderator'), eq(users.isVerified, true)),
	})

	return json({
		jobSeekers: jobSeekersToBeEvaluated,
		moderators,
	})
}

export function AssignCandidatesPage() {
	const loaderData = useLoaderData<typeof loader>()

	const [sorting, setSorting] = React.useState<SortingState>([])
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
		[],
	)

	type JobSeekerData = (typeof loaderData.jobSeekers)[number]
	const columnHelper = createColumnHelper<JobSeekerData>()

	const columns = React.useMemo(
		() => [
			columnHelper.accessor('candidateNumber', {
				cell: (info) => info.getValue(),
				header: 'Onboarded Candidate No.',
			}),

			columnHelper.accessor('user.profile.firstName', {
				cell: (info) => info.getValue(),
				header: 'First Name',
			}),

			columnHelper.accessor('user.profile.lastName', {
				cell: (info) => info.getValue(),
				header: 'Last Name',
			}),

			columnHelper.accessor('moderatorAssignment', {
				cell: (info) => {
					const moderatorAssignment = info.getValue()

					return `${moderatorAssignment?.id ? 'Assigned' : 'Unassigned'}`
				},
				header: 'Status',
			}),

			columnHelper.accessor('moderatorAssignment', {
				cell: (info) => {
					const moderatorAssignment = info.getValue()

					return `${moderatorAssignment ? `${moderatorAssignment.moderator.email} (Moderator)` : 'N/A'}`
				},
				header: 'Assignee',
			}),

			columnHelper.accessor('moderatorAssignment', {
				cell: (info) => {
					const moderatorAssignment = info.getValue()

					return `${moderatorAssignment ? `${moderatorAssignment.assignedByAdmin.email} (Admin)` : 'N/A'}`
				},
				header: 'Assignor',
			}),

			columnHelper.accessor('moderatorAssignment', {
				cell: (info) => {
					const moderatorAssignment = info.getValue()

					return `${moderatorAssignment ? formatDate(moderatorAssignment.assignedAt, DATETIME_FORMAT) : 'N/A'}`
				},
				header: 'Assigned At',
			}),

			columnHelper.accessor('moderatorAssignment.notes', {
				cell: (info) => {
					const notes = info.getValue()

					return notes ?? 'N/A'
				},
				header: 'Admin Notes',
			}),

			columnHelper.accessor('id', {
				cell: (info) => {
					const jobSeekerId = info.getValue()

					return (
						<CreateModeratorAssignmentFormDialog jobSeekerId={jobSeekerId} />
					)
				},
				header: 'Actions',
			}),
		],
		[],
	)

	const tableInstance = useReactTable({
		data: loaderData.jobSeekers,
		columns: columns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		getFilteredRowModel: getFilteredRowModel(),
		getSortedRowModel: getSortedRowModel(),
		state: {
			sorting,
			columnFilters,
		},
	})

	return (
		<div className="flex flex-col p-4">
			<div className="flex items-center justify-between space-x-2 py-4">
				<div className="flex items-center py-4">
					<Input
						placeholder={'Search'}
						value={
							(tableInstance
								.getColumn('firstName')
								?.getFilterValue() as string) ?? ''
						}
						onChange={(event) =>
							tableInstance
								.getColumn('firstName')
								?.setFilterValue(event.target.value)
						}
						className="max-w-sm"
					/>
				</div>
				<div>
					<Button
						variant="outline"
						size="sm"
						onClick={() => tableInstance.previousPage()}
						disabled={!tableInstance.getCanPreviousPage()}
					>
						{'Previous'}
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={() => tableInstance.nextPage()}
						disabled={!tableInstance.getCanNextPage()}
					>
						{'Next'}
					</Button>
				</div>
			</div>

			<div className="rounded-md border">
				<Table>
					<TableHeader>
						{tableInstance.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => {
									return (
										<TableHead key={header.id}>
											{header.isPlaceholder
												? null
												: flexRender(
														header.column.columnDef.header,
														header.getContext(),
													)}
										</TableHead>
									)
								})}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{tableInstance.getRowModel().rows?.length ? (
							tableInstance.getRowModel().rows.map((row) => (
								<TableRow
									key={row.id}
									data-state={row.getIsSelected() && 'selected'}
								>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id}>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext(),
											)}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={columns.length}
									className="h-24 text-center"
								>
									{'No results'}
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
		</div>
	)
	/*
	return (
		<div className="px-4 py-8">
			<div className="mb-4 flex items-center">
				<Input
					type="text"
					placeholder="Search candidates..."
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					className="mr-2 max-w-sm"
				/>
				<Search className="text-gray-400" />
			</div>

			<div className="overflow-x-auto">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Name</TableHead>
							<TableHead>Email</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Action</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{filteredCandidates.map((candidate) => (
							<TableRow key={candidate.id}>
								<TableCell>{candidate.name}</TableCell>
								<TableCell>{candidate.email}</TableCell>
								<TableCell>{candidate.status}</TableCell>
								<TableCell>
									<Dialog>
										<DialogTrigger asChild>
											<Button variant="outline" size="sm" onClick={() => {}}>
												<UserPlus className="mr-2 h-4 w-4" />
												Assign
											</Button>
										</DialogTrigger>
										<DialogContent>
											<DialogHeader>
												<DialogTitle>Assign Candidate to Moderator</DialogTitle>
											</DialogHeader>
											<div className="grid gap-4 py-4">
												<div className="grid grid-cols-4 items-center gap-4">
													<Label htmlFor="candidate" className="text-right">
														Candidate
													</Label>
													<Input
														id="candidate"
														value={selectedCandidate ? 'John' : ''}
														className="col-span-3"
														disabled
													/>
												</div>
												<div className="grid grid-cols-4 items-center gap-4">
													<Label htmlFor="moderator" className="text-right">
														Moderator
													</Label>
													<Select
														value={selectedModerator}
														onValueChange={setSelectedModerator}
													>
														<SelectTrigger className="col-span-3">
															<SelectValue placeholder="Select a moderator" />
														</SelectTrigger>
														<SelectContent>
															{moderators.map((moderator) => (
																<SelectItem
																	key={moderator.id}
																	value={moderator.id.toString()}
																>
																	{moderator.name}
																</SelectItem>
															))}
														</SelectContent>
													</Select>
												</div>
											</div>
											<Button onClick={handleAssign}>Assign</Button>
										</DialogContent>
									</Dialog>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		</div>
	)
		*/
}

export default function Route() {
	return (
		<div className="flex flex-col p-4">
			<AssignCandidatesPage />
		</div>
	)
}
