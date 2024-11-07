import { useFetcher, useLoaderData } from '@remix-run/react'
import {
	getFormProps,
	getInputProps,
	getTextareaProps,
	useForm,
} from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { DialogClose } from '@radix-ui/react-dialog'
import { FileCheckIcon } from 'lucide-react'

import { CounterDisplay } from '~/components/counter-display'
import {
	MultiSelectField,
	RadioGroupField,
	TextareaField,
} from '~/components/forms'
import { Button } from '~/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '~/components/ui/dialog'
import { CandidateActionIntent, type action, type loader } from './route'
import {
	placementAreaEnum,
	ratingValueEnum,
	submitCandidateEvaluationSchema,
} from './validation.schema'

type EvaluateCandidateProfileFormDialogProps = {
	jobSeekerId: string
}

export function EvaluateCandidateProfileFormDialog({
	jobSeekerId,
}: EvaluateCandidateProfileFormDialogProps) {
	const { moderatorEvaluationsList } = useLoaderData<typeof loader>()
	const submitCandidateEvaluationFetcher = useFetcher<typeof action>()

	const evaluation = moderatorEvaluationsList.find(
		(i) => i.jobSeekerId === jobSeekerId,
	)

	const [form, fields] = useForm({
		lastResult:
			submitCandidateEvaluationFetcher.state === 'idle'
				? submitCandidateEvaluationFetcher?.data?.result
				: null,
		onValidate({ formData }) {
			const submission = parseWithZod(formData, {
				schema: submitCandidateEvaluationSchema,
			})

			if (submission.status !== 'success') {
				console.log('submission errors:', submission.error)
				console.log('submission payload: ', submission.payload)
				console.log('submission reply: ', submission.reply())
				console.log('submission status: ', submission.status)
			}

			return submission
		},
		constraint: getZodConstraint(submitCandidateEvaluationSchema),
		shouldRevalidate: 'onInput',
		defaultValue: {
			jobSeekerId,
			presentation: evaluation?.presentation,
			communication: evaluation?.communication,
			industryKnowledge: evaluation?.industryKnowledge,
			areasOfPlacement: evaluation?.areasOfPlacement,
			generalComments: evaluation?.generalComments,
		},
	})

	const TEXTAREA_MAX_LENGTH = 400

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button>
					<FileCheckIcon className="mr-2 h-4 w-4" />
					Evaluate Candidate
				</Button>
			</DialogTrigger>

			<DialogContent className="sm:max-w-xl">
				<DialogHeader>
					<DialogTitle>Evaluate Candidate Profile</DialogTitle>
					<DialogDescription>
						Rate the candidate and select appropriate placement areas.
					</DialogDescription>
				</DialogHeader>
				<submitCandidateEvaluationFetcher.Form
					method="POST"
					{...getFormProps(form)}
					className="flex h-full w-full max-w-2xl flex-col"
				>
					<input
						{...getInputProps(fields.jobSeekerId, {
							type: 'hidden',
						})}
					/>
					<RadioGroupField
						labelProps={{
							children: 'Communication',
						}}
						meta={fields.communication}
						items={ratingValueEnum.map((i) => ({
							value: i,
							label: i,
						}))}
						errors={fields.communication.errors}
					/>

					<RadioGroupField
						labelProps={{
							children: 'Presentation',
						}}
						meta={fields.presentation}
						items={ratingValueEnum.map((i) => ({
							value: i,
							label: i,
						}))}
						errors={fields.presentation.errors}
					/>

					<RadioGroupField
						labelProps={{
							children: 'Knowledge of Industry',
						}}
						meta={fields.industryKnowledge}
						items={ratingValueEnum.map((i) => ({
							value: i,
							label: i,
						}))}
						errors={fields.industryKnowledge.errors}
					/>

					<MultiSelectField
						labelProps={{
							children: 'Areas of Placement',
						}}
						meta={fields.areasOfPlacement}
						maxCount={40}
						options={placementAreaEnum.map((i) => ({
							label: i,
							value: i,
						}))}
						placeholder="Select..."
						errors={fields.areasOfPlacement.errors}
					/>

					<div className="mb-4 flex flex-col">
						<TextareaField
							labelProps={{
								children: 'General Comments',
							}}
							textareaProps={{
								...getTextareaProps(fields.generalComments, {}),
								rows: 7,
								maxLength: TEXTAREA_MAX_LENGTH,
							}}
							errors={fields.generalComments.errors}
						/>
						<CounterDisplay
							count={fields.generalComments?.value?.length}
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
							value={CandidateActionIntent.submitCandidateEvaluation}
							disabled={submitCandidateEvaluationFetcher.state === 'submitting'}
						>
							{submitCandidateEvaluationFetcher.state === 'idle'
								? 'Submit'
								: 'Submitting...'}
						</Button>
					</DialogFooter>
				</submitCandidateEvaluationFetcher.Form>
			</DialogContent>
		</Dialog>
	)
}
