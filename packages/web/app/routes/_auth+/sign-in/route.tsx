import {
	json,
	redirect,
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
	type MetaFunction,
} from '@remix-run/node'
import {
	Form,
	Link,
	useActionData,
	useNavigation,
	useSearchParams,
} from '@remix-run/react'
import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { z } from 'zod'

import { CheckboxField, Field } from '~/components/forms'
import { Spacer } from '~/components/spacer'
import { Button } from '~/components/ui/button'
import {
	authenticate,
	createUserSession,
	requireAnonymous,
} from '~/lib/auth.server'
import { AppName } from '~/root'
import { getDomainUrl } from '~/utils'

export const ROUTE_PATH = '/sign-in' as const

const schema = z.object({
	email: z.string().email(),
	password: z.string(),
	rememberMe: z.string().optional().transform(Boolean),
	redirectTo: z.string(),
})

enum INTENT {
	SignInWithGoogle = 'sign-in-with-google',
	SignInUsingEmail = 'sign-in-using-email',
}

export const meta: MetaFunction = () => {
	return [{ title: `Sign In | ${AppName}` }]
}

export async function loader({ request }: LoaderFunctionArgs) {
	await requireAnonymous(request)
	return json({})
}

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData()

	const intent = formData.get('intent')

	const submission = await parseWithZod(formData, {
		schema: (intent) =>
			schema.transform(async (data, ctx) => {
				if (intent !== null) return { ...data, user: null }

				const user = await authenticate(data)

				if (!user) {
					ctx.addIssue({
						path: ['password'],
						code: z.ZodIssueCode.custom,
						message: 'Invalid email or password',
					})

					return z.NEVER
				}

				return { ...data, user }
			}),

		async: true,
	})
	// Send the submission back to the client if the status is not successful
	if (submission.status !== 'success') {
		console.log('submission: ', JSON.stringify(submission, null, 2))
		return submission.reply()
	}

	const { user, redirectTo, rememberMe } = submission.value

	if (!user) {
		console.error("Something's wrong, user shouldn't be null")

		return redirect('/sign-in')
	}

	return await createUserSession({
		userId: user.id,
		redirectTo,
		rememberMe,
		request,
	})
}

export default function SignIn() {
	const lastResult = useActionData<typeof action>()
	const [searchParams] = useSearchParams()
	const redirectTo = searchParams.get('redirectTo') || '/dashboard'
	const submitting = useNavigation().state === 'submitting'

	const [form, fields] = useForm({
		id: 'sign-in-with-email-form',

		lastResult,
		onValidate({ formData }) {
			return parseWithZod(formData, { schema })
		},
		constraint: getZodConstraint(schema),
		shouldValidate: 'onBlur',
		shouldRevalidate: 'onInput',
		defaultValue: {
			redirectTo,
		},
	})

	return (
		<div className="flex min-h-full flex-col justify-center pb-32 pt-20">
			<div className="flex flex-col gap-3 text-center">
				<h1 className="text-h1 text-4xl font-bold">Welcome back!</h1>
				<p className="text-body-md text-muted-foreground">
					Sign in to your account.
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
						autoFocus: true,
					}}
					errors={fields.email.errors}
				/>
				<Field
					labelProps={{ children: 'Password' }}
					inputProps={{
						...getInputProps(fields.password, { type: 'password' }),
						autoComplete: 'current-password',
					}}
					errors={fields.password.errors}
				/>
				<div className="flex justify-between">
					<CheckboxField
						labelProps={{
							children: 'Remember me',
						}}
						buttonProps={getInputProps(fields.rememberMe, {
							type: 'checkbox',
						})}
						errors={fields.rememberMe.errors}
					/>
					<div className="flex justify-between">
						<Link to="/forgot-password" className="text-body-xs font-semibold">
							Forgot password?
						</Link>
					</div>
				</div>
				<input {...getInputProps(fields.redirectTo, { type: 'hidden' })} />

				<Button
					type="submit"
					className="w-full"
					name="intent"
					value={INTENT.SignInUsingEmail}
					disabled={submitting}
				>
					Sign In
				</Button>
				<div className="text-destructive flex justify-center py-2 text-sm font-semibold">
					{form.errors}
				</div>
			</Form>
			{/*
			<div className="mx-auto w-full max-w-md px-8 py-2">
				<Divider />
			</div>
			<div className="mx-auto flex w-full max-w-md flex-col gap-4 px-8 py-2">
				<Form method="post" noValidate>
					<Button
						className="w-full"
						name="intent"
						value={INTENT.SignInWithGoogle}
					>
						Continue with Google
					</Button>
				</Form>
			</div>
				*/}

			<div className="flex items-center justify-center gap-2">
				<span className="text-muted-foreground">
					Don&apos;t have an account?
				</span>
				<Link to="/sign-up" className="text-body-xs font-semibold underline">
					Sign Up Now
				</Link>
			</div>
		</div>
	)
}
