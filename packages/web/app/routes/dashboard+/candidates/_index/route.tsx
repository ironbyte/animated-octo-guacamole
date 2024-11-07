import {
	json,
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
} from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import * as React from 'react'
import { db } from '@nautikos/core/db'
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
import {
	FileIcon,
	FolderPen,
	Folders,
	ListTodoIcon,
	MoreHorizontal,
	Search,
	User,
} from 'lucide-react'

import { BadgesList } from '~/components/badges-list'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '~/components/ui/dialog'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
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
import { createToastHeaders } from '~/lib/toast.server'

export const ROUTE_PATH = '/dashboard/candidates' as const

export async function loader({}: LoaderFunctionArgs) {
	const jobSeekers = await db.query.jobSeeker.findMany({
		with: {
			seagoingExperience: true,
			user: {
				with: {
					profile: true,
				},
			},
		},
	})

	return json({
		jobSeekers,
	})
}

function DeleteCampaignDialog() {
	return (
		<DialogContent>
			<DialogHeader>
				<DialogTitle>DELETE</DialogTitle>
				<DialogDescription>
					This action cannot be undone. Are you sure you want to permanently
					delete this file from our servers?
				</DialogDescription>
			</DialogHeader>
			<DialogFooter>
				<Button type="submit">Confirm</Button>
			</DialogFooter>
		</DialogContent>
	)
}

function ReviewCandidateProfiles() {
	const loaderData = useLoaderData<typeof loader>()
	const [dialogMenu, setDialogMenu] = React.useState<string>('none')

	const [sorting, setSorting] = React.useState<SortingState>([])
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
		[],
	)

	type JobSeekerData = (typeof loaderData.jobSeekers)[number]

	const handleDialogMenu = (): JSX.Element | null => {
		console.log('called')

		switch (dialogMenu) {
			case 'view':
				return <DeleteCampaignDialog />
			case 'review':
				return null
			default:
				return null
		}
	}

	// https://github.com/radix-ui/primitives/issues/1836
	const columnHelper = createColumnHelper<JobSeekerData>()
	const columns = React.useMemo(
		() => [
			columnHelper.accessor('candidateNumber', {
				cell: (info) => info.getValue(),
				header: 'Candidate No.',
			}),

			columnHelper.accessor('user.profile.firstName', {
				cell: (info) => info.getValue(),
				header: 'First Name',
			}),

			columnHelper.accessor('user.profile.lastName', {
				cell: (info) => info.getValue(),
				header: 'Last Name',
			}),

			columnHelper.accessor('user.timeCreated', {
				cell: (info) => formatDate(info.getValue(), 'dd/MM/yyyy'),
				header: 'Signup Date',
			}),

			columnHelper.accessor('totalYearsExperience', {
				cell: (info) => info.getValue(),
				header: 'Total Years Experience',
			}),

			columnHelper.accessor('peopleManagementExperience', {
				cell: (info) => info.getValue(),
				header: 'People Management Experience',
			}),

			columnHelper.accessor('seagoingExperience.totalYearsSeaGoingExperience', {
				cell: (info) => info.getValue(),
				header: 'Total Years Seagoing Experience',
			}),

			columnHelper.accessor('seagoingExperience.seaRank', {
				cell: (info) => info.getValue(),
				header: 'Highest Sea Rank Achieved',
			}),

			columnHelper.accessor(
				(row) => {
					const emirates = row.emiratesPreference

					if (!emirates) return 'N/A'

					return <BadgesList items={emirates} direction="vertical" />
				},
				{
					header: 'Emirates Preferred',
					cell: ({ getValue }) => getValue(),
				},
			),

			columnHelper.accessor(
				(row) => {
					const {
						arabicSpeaking,
						dubaiTradePortal,
						uaeCustoms,
						freeZoneProcess,
					} = row

					const localMarketExperiences: string[] = []

					if (arabicSpeaking) {
						localMarketExperiences.push('Arabic Speaking')
					}

					if (dubaiTradePortal) {
						localMarketExperiences.push('Dubai Trade Portal')
					}

					if (freeZoneProcess) {
						localMarketExperiences.push('UAE Free Zone Process')
					}

					if (uaeCustoms) {
						localMarketExperiences.push('UAE Custom Process')
					}

					if (localMarketExperiences.length === 0) return 'N/A'

					return (
						<BadgesList items={localMarketExperiences} direction="vertical" />
					)
				},
				{
					header: 'Local Market Experience',
					cell: ({ getValue }) => getValue(),
				},
			),

			columnHelper.accessor('availableFrom', {
				cell: (info) => {
					const date = info.getValue()

					if (!date) return 'N/A'

					return formatDate(date, 'dd/MM/yyyy')
				},
				header: 'Available From',
			}),

			columnHelper.accessor('personalWebsiteUrl', {
				cell: (info) => info.getValue(),
				header: 'Linkedin URL',
			}),

			columnHelper.accessor('id', {
				header: 'Actions',
				enableHiding: false,
				cell: ({ row }) => {
					return (
						<Dialog>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button aria-haspopup="true" size="icon" variant="ghost">
										<MoreHorizontal className="h-4 w-4" />
										<span className="sr-only">Open menu</span>
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent className="w-56">
									<DropdownMenuGroup>
										<DropdownMenuLabel>{'Actions'}</DropdownMenuLabel>
										<DropdownMenuSeparator />
										<DropdownMenuItem asChild>
											<Link
												to={`/dashboard/candidates/${row.original.candidateNumber}`}
											>
												<User className="mr-2 h-4 w-4" />
												View Details
											</Link>
										</DropdownMenuItem>
										<DialogTrigger asChild>
											<DropdownMenuItem
												onSelect={() => setDialogMenu('review')}
											>
												<ListTodoIcon className="mr-2 h-4 w-4" />
												<span>Review</span>
											</DropdownMenuItem>
										</DialogTrigger>
									</DropdownMenuGroup>
								</DropdownMenuContent>
							</DropdownMenu>
							{handleDialogMenu()}
						</Dialog>
					)
				},
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
							(tableInstance.getColumn('email')?.getFilterValue() as string) ??
							''
						}
						onChange={(event) =>
							tableInstance
								.getColumn('email')
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
}

export default function Route() {
	return <ReviewCandidateProfiles />
}
