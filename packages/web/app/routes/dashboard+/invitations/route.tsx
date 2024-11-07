import {
	json,
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
} from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { useState } from 'react'
import * as React from 'react'
import { db } from '@nautikos/core/db'
import {
	userInvitations,
	type InsertUserInvitationModel,
} from '@nautikos/core/schema/users'
import { verifications } from '@nautikos/core/schema/verifications'
import { parseWithZod } from '@conform-to/zod'
import { generateTOTP } from '@epic-web/totp'
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
import * as changeCase from 'change-case'
import { add, formatDate } from 'date-fns'
import { eq } from 'drizzle-orm'
import { UserPlus } from 'lucide-react'
import { z } from 'zod'

import { VerifyEmailInvitationTemplate } from '~/components/email-templates'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
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
import { isEmailAvailable, requireUserSession } from '~/lib/auth.server'
import { FROM_ADDRESS_WELCOME, sendEmail } from '~/lib/email.server'
import { createToastHeaders } from '~/lib/toast.server'
import { AppName } from '~/root'
import { upsertVerification } from '~/routes/_auth+/queries.server'
import { generateVerificationUrl } from '~/routes/_auth+/utils.server'
import { InviteUserFormDialogContent } from './invite-user-form'
import { RevokeInvitationDialog } from './revoke-invitation-dialog'
import {
	inviteUserSchema,
	revokeInvitationSchema,
	type invitationStatusEnum,
} from './validation.schema'

export const ROUTE_PATH = '/dashboard/invitations' as const

const DATETIME_FORMAT = 'dd/MM/yyyy HH:mm:ss'

export enum InvitationActionIntent {
	SendInvitation = 'send-invitation',
	ResendInvitation = 'resend-invitation',
	RevokeInvitation = 'revoke-invitation',
}

async function revokeInvitation({
	formData,
	userId,
	request,
}: {
	formData: FormData
	userId: string
	request: Request
}) {
	const submission = await parseWithZod(formData, {
		schema: revokeInvitationSchema,
	})

	if (submission.status !== 'success') {
		return json(
			{ result: submission.reply() },
			{ status: submission.status === 'error' ? 400 : 200 },
		)
	}

	const { userInvitationId } = submission.value

	console.log('userInvitationId: ', userInvitationId)

	const fetchedUserInvitation = await db.query.userInvitations.findFirst({
		where: eq(userInvitations.id, userInvitationId),
	})

	if (!fetchedUserInvitation) {
		throw new Error('User invitation not found')
	}

	await db.transaction(async (trx) => {
		await trx
			.delete(verifications)
			.where(eq(verifications.id, fetchedUserInvitation.verificationId))

		await trx
			.update(userInvitations)
			.set({
				status: 'revoked',
			})
			.where(eq(userInvitations.id, userInvitationId))
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
				description: 'Invitation revoked successfully',
			}),
		},
	)
}

async function sendInvitation({
	formData,
	userId,
	request,
}: {
	formData: FormData
	userId: string
	request: Request
}) {
	const submission = await parseWithZod(formData, {
		schema: inviteUserSchema.superRefine(async (data, ctx) => {
			const canUseEmailAddress = await isEmailAvailable({
				email: data.email,
			})

			if (!canUseEmailAddress) {
				ctx.addIssue({
					path: ['email'],
					code: z.ZodIssueCode.custom,
					message: 'An account with that email already exists',
				})
			}

			return
		}),
		async: true,
	})

	if (submission.status !== 'success') {
		return json(
			{ result: submission.reply() },
			{ status: submission.status === 'error' ? 400 : 200 },
		)
	}

	const { value } = submission

	// period - The number of seconds
	const totpPayload = await generateTOTP({
		period: 120 * 60, // TODO: to be adjusted
	})

	try {
		await db.transaction(async (trx) => {
			const verifyUrl = generateVerificationUrl(request, {
				target: value.email,
				type: 'onboarding',
				code: totpPayload.otp,
			})

			const expiresAt = add(new Date(), { seconds: totpPayload.period })

			const verification = await upsertVerification({
				trx,
				data: {
					algorithm: totpPayload.algorithm,
					digits: totpPayload.digits,
					expiresAt,
					period: totpPayload.period,
					secret: totpPayload.secret,
					target: value.email,
					type: 'onboarding',
				},
			})

			const invitationInsert: InsertUserInvitationModel = {
				...value,
				senderId: userId,
				verificationId: verification.id,
			}

			await trx.insert(userInvitations).values(invitationInsert)

			// Todo: clean this up
			let role:
				| 'Administrator'
				| 'Content Moderator'
				| 'Organization Member'
				| 'Job Candidate'

			switch (invitationInsert.role) {
				case 'admin':
					role = 'Administrator'
					break
				case 'moderator':
					role = 'Content Moderator'
					break
				case 'org_member':
					role = 'Organization Member'
					break
				default:
					role = 'Job Candidate'
			}

			await sendEmail({
				from: FROM_ADDRESS_WELCOME,
				to: value.email,
				subject: `Welcome to ${AppName}`,
				react: (
					<VerifyEmailInvitationTemplate
						emailAddress={invitationInsert.email}
						verificationUrl={verifyUrl}
						role={role}
					/>
				),
			})
		})
	} catch (error) {
		console.error(error)

		return json(
			{
				result: submission.reply({
					formErrors: ['Something went wrong while sending invitation'],
				}),
			},

			{
				status: 500,
				headers: await createToastHeaders({
					type: 'error',
					title: 'Something went wrong',
					description: 'Error while sending invitation',
				}),
			},
		)
	}

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
				description: `Sent invite to ${value.email} successfully`,
			}),
		},
	)
}

export async function loader({}: LoaderFunctionArgs) {
	const invitations = await db.query.userInvitations.findMany({
		with: {
			verification: true,
			sender: {
				with: {
					profile: true,
				},
			},
		},
	})

	return json({
		invitations,
	})
}

export async function action({ request }: ActionFunctionArgs) {
	const userSession = await requireUserSession(request)
	const formData = await request.formData()
	const intent = formData.get('intent')

	switch (intent) {
		case InvitationActionIntent.SendInvitation: {
			return sendInvitation({
				formData,
				userId: userSession.user.id,
				request,
			})
		}

		case InvitationActionIntent.RevokeInvitation: {
			return revokeInvitation({
				formData,
				userId: userSession.user.id,
				request,
			})
		}

		default: {
			throw new Response(`Invalid intent "${intent}"`, { status: 400 })
		}
	}
}

function UserInvitations() {
	const loaderData = useLoaderData<typeof loader>()

	const [sorting, setSorting] = React.useState<SortingState>([])
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
		[],
	)

	const [isDialogOpen, setIsDialogOpen] = useState(false)

	type InvitationData = (typeof loaderData.invitations)[number]
	const columnHelper = createColumnHelper<InvitationData>()

	const columns = React.useMemo(
		() => [
			columnHelper.accessor('email', {
				cell: (info) => info.getValue(),
				header: 'Email Recipient',
			}),

			columnHelper.accessor('role', {
				cell: (info) => changeCase.capitalCase(info.getValue()),
				header: 'Role',
			}),

			columnHelper.accessor('status', {
				cell: (info) => getStatusBadge(info.getValue()),
				header: 'Status',
			}),

			columnHelper.accessor('timeCreated', {
				cell: (info) => formatDate(info.getValue(), DATETIME_FORMAT),
				header: 'Sent Date',
			}),

			columnHelper.accessor('sender.email', {
				cell: (info) => info.getValue(),
				header: 'Sender',
			}),

			columnHelper.accessor('sender.role', {
				cell: (info) => changeCase.capitalCase(info.getValue()),
				header: 'Sender Role',
			}),

			columnHelper.accessor('id', {
				header: 'Actions',
				enableHiding: false,
				cell: ({ row }) => {
					return (
						<div className="flex gap-2">
							{row.original.status === 'pending' && (
								<>
									<RevokeInvitationDialog
										userInvitationId={row.original.id}
										email={row.original.email}
									/>
								</>
							)}
						</div>
					)
				},
			}),
		],
		[],
	)

	const tableInstance = useReactTable({
		data: loaderData.invitations,
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

	const getStatusBadge = (status: (typeof invitationStatusEnum)[number]) => {
		switch (status) {
			case 'pending':
				return (
					<Badge variant="secondary">{changeCase.capitalCase(status)}</Badge>
				)
			case 'accepted':
				return <Badge variant="default">{changeCase.capitalCase(status)}</Badge>
			case 'declined':
				return (
					<Badge variant="destructive">{changeCase.capitalCase(status)}</Badge>
				)
			case 'revoked':
				return (
					<Badge variant="destructive">{changeCase.capitalCase(status)}</Badge>
				)
			default:
				return <Badge>{status}</Badge>
		}
	}

	return (
		<div className="flex flex-col p-4">
			<h1 className="mb-20 text-4xl font-black">{'Invitations'}</h1>

			<div className="flex justify-end">
				<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
					<DialogTrigger asChild>
						<Button>
							<UserPlus className="mr-2 h-4 w-4" />
							Invite User
						</Button>
					</DialogTrigger>
					<InviteUserFormDialogContent />
				</Dialog>
			</div>

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
	return <UserInvitations />
}
