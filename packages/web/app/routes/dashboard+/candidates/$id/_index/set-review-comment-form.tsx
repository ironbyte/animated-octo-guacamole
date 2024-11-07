import { useFetcher, useLoaderData } from '@remix-run/react'
import {
	getFormProps,
	getInputProps,
	getTextareaProps,
	useForm,
} from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'

import { ErrorList } from '~/components/error-list'
import { TextareaField } from '~/components/forms'
import { Button } from '~/components/ui/button'
import { CandidateActionIntent, type action, type loader } from './route'
import {
	setReviewCommentSchema,
	type ReviewSectionType,
} from './validation.schema'

type SetReviewCommentProps = {
	section: ReviewSectionType
	jobSeekerId: string
}

export function SetReviewCommentForm({
	section,
	jobSeekerId,
}: SetReviewCommentProps) {
	const { moderatorReviewsList, currentUser } = useLoaderData<typeof loader>()

	const setReviewCommentFetcher = useFetcher<typeof action>()
	const review = moderatorReviewsList.find((i) => i.section === section)

	const [form, fields] = useForm({
		lastResult:
			setReviewCommentFetcher.state === 'idle'
				? setReviewCommentFetcher?.data?.result
				: null,
		onValidate({ formData }) {
			const submission = parseWithZod(formData, {
				schema: setReviewCommentSchema,
			})

			if (submission.status !== 'success') {
				console.log('submission errors:', submission.error)
				console.log('submission payload: ', submission.payload)
				console.log('submission reply: ', submission.reply())
				console.log('submission status: ', submission.status)
			}

			return submission
		},
		constraint: getZodConstraint(setReviewCommentSchema),
		shouldRevalidate: 'onInput',
		defaultValue: {
			jobSeekerId,
			section,
			comment: review?.comment,
		},
	})

	if (!review) return null

	const isModeratorCurrentUser = currentUser?.id === review?.moderatorId

	return (
		<setReviewCommentFetcher.Form
			method="POST"
			{...getFormProps(form)}
			className="w-full"
		>
			<input
				{...getInputProps(fields.jobSeekerId, {
					type: 'hidden',
				})}
			/>
			<input
				{...getInputProps(fields.section, {
					type: 'hidden',
				})}
			/>

			<TextareaField
				labelProps={{
					children: isModeratorCurrentUser
						? 'Add/Edit Review Comment'
						: `Reviewed by Moderator (${review?.moderator.email})`,
				}}
				textareaProps={{
					...getTextareaProps(fields.comment),
					disabled: !isModeratorCurrentUser,
				}}
			/>
			<ErrorList errors={fields.comment.errors} />
			{isModeratorCurrentUser && (
				<div className="flex w-full gap-2">
					<Button
						type="submit"
						name="intent"
						value={CandidateActionIntent.SetReviewComment}
						disabled={setReviewCommentFetcher.state === 'submitting'}
					>
						{setReviewCommentFetcher.state === 'idle'
							? 'Submit'
							: 'Submitting...'}
					</Button>
				</div>
			)}
		</setReviewCommentFetcher.Form>
	)
}
