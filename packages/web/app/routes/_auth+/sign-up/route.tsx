import {
	json,
	redirect,
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
	type MetaFunction,
} from '@remix-run/node'
import { Form, useActionData } from '@remix-run/react'
import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { generateTOTP } from '@epic-web/totp'
import { add } from 'date-fns'
import { z } from 'zod'

import { VerifyEmailTemplate } from '~/components/email-templates'
import { Field } from '~/components/forms'
import { Spacer } from '~/components/spacer'
import { Button } from '~/components/ui/button'
import { isEmailAvailable, requireAnonymous } from '~/lib/auth.server'
import { FROM_ADDRESS_WELCOME, sendEmail } from '~/lib/email.server'
import { AppName } from '~/root'
import { upsertVerification } from '../queries.server'
import { generateVerificationUrl } from '../utils.server'

export const ROUTE_PATH = '/sign-up' as const

export const meta: MetaFunction = () => [
	{
		title: `Sign Up | ${AppName}`,
	},
]

export const schema = z.object({
	email: z
		.string({
			required_error: 'Email address is required',
		})
		.email('Invalid email address'),

	mobileNo: z.number().optional(),
	whatsapp: z.boolean().optional(),
	whatsappNo: z.string().optional(),
	password: z.string().optional(),
})

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData()

	const submission = await parseWithZod(formData, {
		schema: schema.superRefine(async (data, ctx) => {
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

	const { email } = submission.value

	const intent = formData.get('intent')

	const totpPayload = await generateTOTP({
		period: process.env.NODE_ENV === 'production' ? 10 * 60 : 120 * 60,
	})

	const verifyUrl = generateVerificationUrl(request, {
		target: email,
		type: 'onboarding',
	})

	const expiresAt = add(new Date(), { seconds: totpPayload.period })

	await upsertVerification({
		data: {
			algorithm: totpPayload.algorithm,
			digits: totpPayload.digits,
			expiresAt,
			period: totpPayload.period,
			secret: totpPayload.secret,
			target: email,
			type: 'onboarding',
		},
	})

	await sendEmail({
		from: FROM_ADDRESS_WELCOME,
		to: email,
		subject: `Welcome to ${AppName}`,
		react: <VerifyEmailTemplate emailAddress={email} otp={totpPayload.otp} />,
	})

	console.log('totpPayload.otp: ', totpPayload.otp)
	console.log('intent: ', intent)
	console.log('email: ', email)

	return redirect(`${verifyUrl.pathname}${verifyUrl.search}`)
}

export async function loader({ request }: LoaderFunctionArgs) {
	await requireAnonymous(request)

	return json({})
}

export default function SignUp() {
	const actionData = useActionData<typeof action>()

	const [form, fields] = useForm({
		id: 'sign-up-form',
		lastResult: actionData?.result,
		onValidate({ formData }) {
			// Run the same validation logic on client
			return parseWithZod(formData, { schema })
		},
		constraint: getZodConstraint(schema),
		// Validate field once user leaves the field
		shouldValidate: 'onBlur',
	})

	return (
		<div className="flex h-full flex-col items-center justify-center">
			<div className="flex flex-col gap-3 text-center">
				<h1 className="text-h1 text-4xl font-bold">
					Let's start your journey!
				</h1>
				<p className="text-body-md text-muted-foreground">
					Create a new account.
				</p>
			</div>
			<Spacer size="xs" />

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
						placeholder: 'you@example.com',
						autoFocus: true,
						autoComplete: 'email',
					}}
					errors={fields.email.errors}
				/>
				<Button type="submit" className="w-full">
					Submit
				</Button>
				<div className="text-destructive flex justify-center py-2 text-sm font-semibold">
					{form.errors}
				</div>
			</Form>
		</div>
	)
}
