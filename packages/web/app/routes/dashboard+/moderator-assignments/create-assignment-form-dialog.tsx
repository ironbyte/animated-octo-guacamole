import { useFetcher, useLoaderData } from '@remix-run/react'
import {
	getFormProps,
	getInputProps,
	getTextareaProps,
	useForm,
} from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { UserPlus } from 'lucide-react'

import { CounterDisplay } from '~/components/counter-display'
import { Field, SelectField, TextareaField } from '~/components/forms'
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
	ModeratorAssignmentActionIntent,
	type action,
	type loader,
} from './route'
import { createModeratorAssignmentSchema } from './validation.schema'

type CreateModeratorAssignmentFormDialogProps = {
	jobSeekerId: string
}

export function CreateModeratorAssignmentFormDialog({
	jobSeekerId,
}: CreateModeratorAssignmentFormDialogProps) {
	const createAssignmentFetcher = useFetcher<typeof action>()
	const { jobSeekers, moderators } = useLoaderData<typeof loader>()

	const jobSeeker = jobSeekers.find((i) => i.id === jobSeekerId)

	const [form, fields] = useForm({
		id: 'revoke-invitation-form',
		lastResult:
			createAssignmentFetcher.state === 'idle'
				? createAssignmentFetcher?.data?.result
				: null,
		onValidate({ formData }) {
			const submission = parseWithZod(formData, {
				schema: createModeratorAssignmentSchema,
			})

			if (submission.status !== 'success') {
				console.log('submission errors:', submission.error)
				console.log('submission payload: ', submission.payload)
				console.log('submission reply: ', submission.reply())
				console.log('submission status: ', submission.status)
			}

			return submission
		},
		constraint: getZodConstraint(createModeratorAssignmentSchema),
		defaultValue: {
			jobSeekerId,
			moderatorId: jobSeeker?.moderatorAssignment?.moderatorId,
			notes: jobSeeker?.moderatorAssignment?.notes,
		},
	})

	const TEXTAREA_MAX_LENGTH = 400

	if (!jobSeeker) {
		return null
	}

	const moderatorOptions = moderators.map((m) => ({
		name: m.email,
		value: m.id,
	}))

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant="outline" size="sm" onClick={() => {}}>
					<UserPlus className="mr-2 h-4 w-4" />
					Assign
				</Button>
			</DialogTrigger>

			<DialogContent className="sm:max-w-xl">
				<DialogHeader>
					<DialogTitle>Assign Moderator to Candidate</DialogTitle>
					<DialogDescription>
						Select a moderator to evaluate the onboarded candidate. The assigned
						moderator will receive an email notification.
					</DialogDescription>
				</DialogHeader>

				<createAssignmentFetcher.Form
					method="POST"
					{...getFormProps(form)}
					className="flex h-full w-full max-w-2xl flex-col"
				>
					<input
						{...getInputProps(fields.jobSeekerId, {
							type: 'hidden',
						})}
					/>

					<Field
						labelProps={{
							children: 'Job Candidate',
						}}
						inputProps={{
							disabled: true,
							defaultValue: `${jobSeeker.user.profile?.firstName ?? 'N\\A'}`,
						}}
					/>

					<SelectField
						labelProps={{
							children: 'Select a moderator to evaluate the candidate',
						}}
						className="w-full"
						placeholder="Select..."
						meta={fields.moderatorId}
						items={moderatorOptions}
						errors={fields.moderatorId.errors}
					/>

					<div className="mb-4 flex flex-col">
						<TextareaField
							labelProps={{
								children: 'Notes (Optional)',
							}}
							textareaProps={{
								...getTextareaProps(fields.notes, {}),
								rows: 4,
								maxLength: TEXTAREA_MAX_LENGTH,
							}}
							errors={fields.notes.errors}
						/>
						<CounterDisplay
							count={fields.notes?.value?.length}
							maxLength={TEXTAREA_MAX_LENGTH}
						/>
					</div>

					<DialogFooter className="flex gap-2">
						<DialogClose asChild>
							<Button type="button" variant="secondary">
								Close
							</Button>
						</DialogClose>
						<Button
							type="submit"
							name="intent"
							value={ModeratorAssignmentActionIntent.CreateAssignment}
							disabled={createAssignmentFetcher.state === 'submitting'}
						>
							{createAssignmentFetcher.state === 'idle'
								? 'Submit'
								: 'Submitting...'}
						</Button>
					</DialogFooter>
				</createAssignmentFetcher.Form>
			</DialogContent>
		</Dialog>
	)
}
