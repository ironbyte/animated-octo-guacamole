import { useFetcher } from '@remix-run/react'
import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import * as changeCase from 'change-case'

import { Field, SelectField } from '~/components/forms'
import { Button } from '~/components/ui/button'
import {
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '~/components/ui/dialog'
import { InvitationActionIntent, type action } from './route'
import { inviteUserSchema, userRoleEnum } from './validation.schema'

export function InviteUserFormDialogContent() {
	const inviteUserFetcher = useFetcher<typeof action>()

	const [form, fields] = useForm({
		id: 'invite-user-form',
		lastResult:
			inviteUserFetcher.state === 'idle'
				? inviteUserFetcher?.data?.result
				: null,
		constraint: getZodConstraint(inviteUserSchema),
		shouldValidate: 'onBlur',
		shouldRevalidate: 'onInput',
		onValidate({ formData }) {
			const submission = parseWithZod(formData, {
				schema: inviteUserSchema,
			})

			if (submission.status !== 'success') {
				console.log('submission errors:', submission.error)
				console.log('submission payload: ', submission.payload)
				console.log('submission reply: ', submission.reply())
				console.log('submission status: ', submission.status)
			}

			return submission
		},
	})

	return (
		<DialogContent>
			<DialogHeader>
				<DialogTitle>Invite a New User</DialogTitle>
				<DialogDescription>
					Send an invitation to a new user to join the platform.
				</DialogDescription>
			</DialogHeader>
			<inviteUserFetcher.Form method="post" {...getFormProps(form)}>
				<Field
					labelProps={{
						children: 'Email',
					}}
					inputProps={{
						...getInputProps(fields.email, {
							type: 'text',
						}),
						placeholder: 'john@example.com',
					}}
					errors={fields.email.errors}
				/>

				<SelectField
					labelProps={{
						children: 'User Role',
					}}
					className="w-full"
					placeholder="Select..."
					meta={fields.role}
					items={userRoleEnum
						.filter((i) => ['admin', 'moderator', 'org_member'].includes(i))
						.map((i) => ({
							value: i,
							name: changeCase.capitalCase(
								i === 'org_member' ? 'Organization Member' : i,
							),
						}))}
					errors={fields.role.errors}
				/>

				{fields.role.value === 'org_member' && (
					<Field
						labelProps={{
							children: 'Organization Name',
						}}
						inputProps={{
							...getInputProps(fields.organizationName, {
								type: 'text',
							}),
							placeholder: 'Maersk',
						}}
						errors={fields.organizationName.errors}
					/>
				)}

				<DialogFooter>
					<Button
						type="submit"
						name="intent"
						value={InvitationActionIntent.SendInvitation}
						disabled={inviteUserFetcher.state === 'submitting'}
					>
						{inviteUserFetcher.state === 'idle'
							? 'Send Invitation'
							: 'Sending...'}
					</Button>
				</DialogFooter>
			</inviteUserFetcher.Form>
		</DialogContent>
	)
}
