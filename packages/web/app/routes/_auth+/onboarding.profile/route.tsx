import {
	json,
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
	type MetaFunction,
} from '@remix-run/node'
import {
	Form,
	Link,
	useActionData,
	useLoaderData,
	useNavigation,
} from '@remix-run/react'
import { db } from '@nautikos/core/db'
import { userInvitations } from '@nautikos/core/schema/users'
import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

import { CheckboxField, Field } from '~/components/forms'
import { Spacer } from '~/components/spacer.tsx'
import { Button } from '~/components/ui/button.tsx'
import {
	createUserSession,
	requireAnonymous,
	signup,
} from '~/lib/auth.server.ts'
import { PasswordSchema } from '~/lib/validation-schemas'
import { AppName } from '~/root'
import { requireVerifySession } from '../utils.server'

const onboardingFormSchema = z.object({
	firstName: z.string({
		required_error: 'First name is required',
	}),
	lastName: z.string({
		required_error: 'Last name is required',
	}),
	password: PasswordSchema,
	rememberMe: z.string().optional().transform(Boolean),
	tos: z
		.string({
			required_error: 'Please tick this box if you want to proceed',
		})
		.transform(Boolean),
})

export const meta: MetaFunction = () => [
	{
		title: `Onboarding | ${AppName}`,
	},
]

export async function action({ request }: ActionFunctionArgs) {
	const { target: email, role } = await requireVerifySession({
		request,
		requiredType: 'onboarding',
		redirectUrl: '/signup',
	})

	const formData = await request.formData()

	const submission = await parseWithZod(formData, {
		schema: onboardingFormSchema,
	})

	if (submission.status !== 'success') {
		return json(
			{ result: submission.reply() },
			{ status: submission.status === 'error' ? 400 : 200 },
		)
	}

	const { password, firstName, lastName, rememberMe } = submission.value

	// Update invitation status to accepted if user is onboarding via invitation

	try {
		const userId = await db.transaction(async (trx) => {
			if (role) {
				await db
					.update(userInvitations)
					.set({
						status: 'accepted',
					})
					.where(eq(userInvitations.email, email))
			}

			const userId = await signup({
				data: {
					email,
					password,
					firstName,
					lastName,
					role,
				},
				trx,
			})

			return userId
		})

		return await createUserSession({
			request,
			userId,
			rememberMe,
			redirectTo: '/',
		})
	} catch (error) {
		console.error('error: ', error)

		throw new Error('Failed to signup')
	}
}

export async function loader({ request }: LoaderFunctionArgs) {
	await requireAnonymous(request)

	const { target: email, role } = await requireVerifySession({
		request,
		requiredType: 'onboarding',
		redirectUrl: '/sign-up',
	})

	return json({
		email,
		role,
	} as const)
}

export default function OnboardingRoute() {
	const loaderData = useLoaderData<typeof loader>()

	const actionData = useActionData<typeof action>()

	const [form, fields] = useForm({
		id: 'onboarding-form',
		constraint: getZodConstraint(onboardingFormSchema),
		lastResult: actionData?.result,
		onValidate({ formData }) {
			const result = parseWithZod(formData, { schema: onboardingFormSchema })

			return result
		},
		shouldRevalidate: 'onBlur',
	})

	const submitting = useNavigation().state === 'submitting'

	return (
		<div className="flex min-h-full flex-col justify-center pb-32 pt-20">
			<div className="flex flex-col gap-3 text-center">
				{loaderData?.role ? (
					<h1 className="text-h1 text-4xl font-bold">{`Welcome aboard! You've been invited to join ${AppName} as a ${loaderData.role}! `}</h1>
				) : (
					<h1 className="text-h1 text-4xl font-bold">{`Welcome aboard! `}</h1>
				)}
				<p className="text-body-md text-muted-foreground">
					Please enter your details.
				</p>
			</div>
			<Spacer size="xs" />

			<Form
				method="post"
				{...getFormProps(form)}
				className="mx-auto w-full max-w-md px-8 py-2"
			>
				<div className="flex gap-2">
					<Field
						className="w-full"
						labelProps={{ children: 'First Name' }}
						inputProps={{
							...getInputProps(fields.firstName, {
								type: 'text',
							}),
							autoFocus: true,
						}}
						errors={fields.firstName.errors}
					/>
					<Field
						className="w-full"
						labelProps={{ children: 'Last Name' }}
						inputProps={{
							...getInputProps(fields.lastName, {
								type: 'text',
							}),
							autoFocus: true,
						}}
						errors={fields.lastName.errors}
					/>
				</div>

				<Field
					labelProps={{
						children: 'Password',
						htmlFor: fields.password.id,
					}}
					inputProps={{
						...getInputProps(fields.password, {
							type: 'password',
						}),
						required: true,
					}}
					errors={fields.password.errors}
				/>

				<p className="text-muted-foreground mb-6">
					<span>
						{`By registering, you agree to the processing of your personal data by
					${AppName} as described in the`}
					</span>{' '}
					<Link
						to="/legal/privacy-policy"
						className="underline underline-offset-4"
					>
						Privacy Policy
					</Link>
					.
				</p>
				<CheckboxField
					labelProps={{
						children: 'Remember me',
					}}
					buttonProps={getInputProps(fields.rememberMe, {
						type: 'checkbox',
					})}
					errors={fields.rememberMe.errors}
				/>

				<CheckboxField
					labelProps={{
						children: (
							<span>
								I've read and agree to the{' '}
								<Link to="/legal/tos" className="underline underline-offset-4">
									Terms of Service.
								</Link>
							</span>
						),
					}}
					buttonProps={getInputProps(fields.tos, {
						type: 'checkbox',
					})}
					errors={fields.tos.errors}
				/>
				<pre>{form.errors}</pre>

				<Button type="submit" disabled={submitting} className="w-full">
					Submit
				</Button>
				<hr className="my-8 text-sky-500" />
			</Form>
		</div>
	)
}
