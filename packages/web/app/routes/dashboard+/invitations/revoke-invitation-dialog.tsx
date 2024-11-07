import { useFetcher } from '@remix-run/react'
import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { AlertTriangleIcon, BanIcon } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert'
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
import { InvitationActionIntent, type action } from './route'
import { revokeInvitationSchema } from './validation.schema'

export function RevokeInvitationDialog({
	userInvitationId,
	email,
}: {
	userInvitationId: string
	email: string
}) {
	const revokeInvitationFetcher = useFetcher<typeof action>()

	const [form, fields] = useForm({
		id: 'revoke-invitation-form',
		lastResult:
			revokeInvitationFetcher.state === 'idle'
				? revokeInvitationFetcher?.data?.result
				: null,
		onValidate({ formData }) {
			const submission = parseWithZod(formData, {
				schema: revokeInvitationSchema,
			})

			if (submission.status !== 'success') {
				console.log('submission errors:', submission.error)
				console.log('submission payload: ', submission.payload)
				console.log('submission reply: ', submission.reply())
				console.log('submission status: ', submission.status)
			}

			return submission
		},
		constraint: getZodConstraint(revokeInvitationSchema),
		defaultValue: {
			userInvitationId,
		},
	})

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button className="w-full md:w-fit" size="sm" variant="destructive">
					<span className="sr-only">Revoke Invitation</span>
					<BanIcon className="h-4 w-4" />
				</Button>
			</DialogTrigger>

			<DialogContent>
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						Revoke the invitations?
					</DialogTitle>
					<DialogDescription>
						{`Are you sure you want to cancel the invitation for ${email}?`}
					</DialogDescription>
				</DialogHeader>
				<Alert variant="destructive">
					<AlertTriangleIcon className="h-4 w-4" />
					<AlertTitle>Warning</AlertTitle>
					<AlertDescription className="text-sm">
						This action cannot be undone. The invitation will be permanently
						removed and the user will not be able to accept it.
					</AlertDescription>
				</Alert>

				<DialogFooter className="sm:justify-start">
					<revokeInvitationFetcher.Form method="post" {...getFormProps(form)}>
						<input
							{...getInputProps(fields.userInvitationId, {
								type: 'hidden',
							})}
						/>
						<Button
							type="submit"
							variant="destructive"
							name="intent"
							value={InvitationActionIntent.RevokeInvitation}
						>
							{revokeInvitationFetcher.state === 'submitting'
								? 'Revoking'
								: 'Revoke'}
						</Button>
					</revokeInvitationFetcher.Form>
					<DialogClose asChild>
						<Button type="button" variant="secondary">
							Close
						</Button>
					</DialogClose>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
