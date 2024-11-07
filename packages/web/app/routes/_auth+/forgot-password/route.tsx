import {
	json,
	redirect,
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
	type MetaFunction,
} from '@remix-run/node'
import { Form, useActionData, useNavigation } from '@remix-run/react'
import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { generateTOTP } from '@epic-web/totp'
import { add } from 'date-fns'
import { z } from 'zod'

import { ResetPasswordRequestEmailTemplate } from '~/components/email-templates.tsx'
import { Field } from '~/components/forms'
import { Spacer } from '~/components/spacer.tsx'
import { Button } from '~/components/ui/button.tsx'
import { requireAnonymous } from '~/lib/auth.server.ts'
import { FROM_ADDRESS_SUPPORT, sendEmail } from '~/lib/email.server.ts'
import { EmailSchema } from '~/lib/validation-schemas'
import { AppName } from '~/root'
import { upsertVerification } from '../queries.server'
import { generateVerificationUrl } from '../utils.server'

export const meta: MetaFunction = () => {
	return [{ title: `Forgot Password | ${AppName}` }]
}

const forgotPasswordFormSchema = z.object({
	email: EmailSchema,
})

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData()

	const submission = parseWithZod(formData, {
		schema: forgotPasswordFormSchema,
	})

	if (submission.status !== 'success') {
		return json(
			{ result: submission.reply() },
			{ status: submission.status === 'error' ? 400 : 200 },
		)
	}

	const { email } = submission.value

	const totpPayload = await generateTOTP({
		period: process.env.NODE_ENV === 'production' ? 10 * 60 : 120 * 60,
	})

	const verifyUrl = generateVerificationUrl(request, {
		target: email,
		type: 'reset-password',
	})

	const expiresAt = add(new Date(), { seconds: totpPayload.period })

	await upsertVerification({
		data: {
			...totpPayload,
			target: email,
			type: 'reset-password',
			expiresAt,
		},
	})

	await sendEmail({
		from: FROM_ADDRESS_SUPPORT,
		to: email,
		subject: 'Reset your password',
		react: (
			<ResetPasswordRequestEmailTemplate
				emailAddress={email}
				otp={totpPayload.otp}
			/>
		),
	})

	return redirect(`${verifyUrl.pathname}${verifyUrl.search}`)
}

export async function loader({ request }: LoaderFunctionArgs) {
	await requireAnonymous(request)

	return json({})
}

export default function ForgotPasswordRoute() {
	const actionData = useActionData<typeof action>()

	const [form, fields] = useForm({
		id: 'forgot-password-form',
		lastResult: actionData?.result,
		constraint: getZodConstraint(forgotPasswordFormSchema),
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: forgotPasswordFormSchema })
		},
		shouldRevalidate: 'onBlur',
	})

	const submitting = useNavigation().state === 'submitting'

	return (
		<div className="flex min-h-full flex-col justify-center pb-32 pt-20">
			<div className="flex flex-col gap-3 text-center">
				<h1 className="text-h1 text-4xl font-bold">Reset password</h1>
				<p className="text-body-md text-muted-foreground">
					No worries, we'll send you reset instructions.
				</p>
			</div>
			<Spacer size="xs" />

			{/*
            <div className="mb-4">
              <Button className="w-full" onClick={handleGitHubLogin}>
                Continue with GitHub
              </Button>
            </div>
            <hr className="my-10" />
              */}
			<Form
				method="post"
				{...getFormProps(form)}
				className="mx-auto w-full max-w-md px-8 py-2"
			>
				<Field
					labelProps={{ children: 'Email' }}
					inputProps={{
						...getInputProps(fields.email, {
							type: 'email',
						}),
						autoFocus: true,
					}}
					errors={fields.email.errors}
				/>

				<Button type="submit" disabled={submitting} className="w-full">
					Sign In
				</Button>
				{/*
          {lastSubmission?.status === 'error' && (
            <div className="mb-6">
              <ErrorMessage message={lastSubmission.message} />
              </div>
              )}
            */}
				<hr className="my-8" />
			</Form>
		</div>
	)
}
