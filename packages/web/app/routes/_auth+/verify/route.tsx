import {
	json,
	redirect,
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
	type MetaFunction,
} from '@remix-run/node'
import {
	Form,
	useActionData,
	useLoaderData,
	useNavigation,
} from '@remix-run/react'
import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { z } from 'zod'

import { OTPField } from '~/components/forms'
import { Spacer } from '~/components/spacer.tsx'
import { Button } from '~/components/ui/button.tsx'
import { requireAnonymous } from '~/lib/auth.server'
import { verifySessionStorage } from '~/lib/verify-session.server.ts'
import { AppName } from '~/root'
import { getVerification } from '~/verification.server'
import { deleteVerification, isCodeValid } from '../queries.server'
import { createVerifySession } from '../utils.server'
import {
	VerificationFormSchema,
	VerificationParamsSchema,
} from '../validation.schema'

export const meta: MetaFunction = () => [
	{
		title: `Verify | ${AppName}`,
	},
]

export async function action({ request }: ActionFunctionArgs) {
	await requireAnonymous(request)

	const formData = await request.formData()

	const submission = await parseWithZod(formData, {
		schema: VerificationFormSchema.superRefine(async (data, ctx) => {
			const isCodeValidResult = await isCodeValid({
				code: data.code,
				target: data.target,
				type: data.type,
			})

			if (!isCodeValidResult) {
				ctx.addIssue({
					path: ['code'],
					code: z.ZodIssueCode.custom,
					message: 'Invalid code',
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

	// !AT THIS POINT, PROVIDED CODE IS ASSUMED TO BE VALID
	const { target, type } = submission.value

	switch (type) {
		case 'onboarding': {
			const verification = await getVerification({
				target,
				type,
			})

			if (!verification) {
				throw redirect('/sign-up')
			}

			const verifySession = await createVerifySession({
				target,
				type,
				role: verification.userInvitation?.role,
			})

			await deleteVerification({
				target,
				type,
			})

			return redirect('/onboarding/profile', {
				headers: {
					'Set-Cookie': await verifySessionStorage.commitSession(verifySession),
				},
			})
		}

		case 'reset-password': {
			await deleteVerification({
				target,
				type,
			})

			const verifySession = await createVerifySession({
				target,
				type,
			})

			return redirect('/reset-password', {
				headers: {
					'Set-Cookie': await verifySessionStorage.commitSession(verifySession),
				},
			})
		}

		case 'change-email': {
			return redirect('/')
		}

		case '2fa': {
			return redirect('/')
		}
	}
}

export async function loader({ request }: LoaderFunctionArgs) {
	await requireAnonymous(request)

	const params = new URL(request.url).searchParams

	const payload = Object.fromEntries(params)

	const verificationParamsResult = VerificationParamsSchema.safeParse(payload)

	if (!verificationParamsResult.success) {
		console.error(verificationParamsResult.error)

		throw new Error('Invalid verification params')
	}

	return json({
		status: 'idle',
		submission: {
			intent: '',
			payload,
			error: {},
		},
	} as const)
}

export default function VerifyRoute() {
	const { submission } = useLoaderData<typeof loader>()
	const actionData = useActionData<typeof action>()

	const [form, fields] = useForm({
		id: 'verify-form',
		constraint: getZodConstraint(VerificationFormSchema),
		lastResult: actionData?.result,
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: VerificationFormSchema })
		},
		defaultValue: {
			code: submission?.payload?.code ?? '',
			target: submission?.payload.target,
			type: submission?.payload.type,
		},
	})

	const submitting = useNavigation().state === 'submitting'

	return (
		<div className="container flex flex-col justify-center pb-32 pt-20">
			<div className="flex flex-col gap-3 text-center">
				<h1 className="text-h1 text-4xl font-bold">Check your email</h1>
				<p className="text-body-md text-muted-foreground">
					We've sent you a 6-digit one-time code to verify your email address.
				</p>
			</div>
			<Spacer size="xs" />
			<div className="mx-auto flex w-72">
				<div className="flex w-full gap-2">
					<Form method="POST" className="flex-1" {...getFormProps(form)}>
						<div className="flex items-center justify-center">
							<OTPField
								labelProps={{
									htmlFor: fields.code.id,
									children: 'Code',
								}}
								inputProps={{
									...getInputProps(fields.code, { type: 'text' }),
									autoComplete: 'one-time-code',
									autoFocus: true,
								}}
								errors={fields.code.errors}
							/>
						</div>
						<input
							{...getInputProps(fields.target, {
								type: 'hidden',
							})}
						/>
						<input
							{...getInputProps(fields.type, {
								type: 'hidden',
							})}
						/>

						<Button type="submit" disabled={submitting} className="w-full">
							Submit
						</Button>
					</Form>
				</div>
			</div>
		</div>
	)
}
