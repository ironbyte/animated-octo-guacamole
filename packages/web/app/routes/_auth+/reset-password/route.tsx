import {
	json,
	redirect,
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
} from '@remix-run/node'
import {
	Form,
	useActionData,
	useLoaderData,
	useNavigation,
} from '@remix-run/react'
import { db } from '@nautikos/core/db'
import { passwords } from '@nautikos/core/schema/users'
import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

import { Field } from '~/components/forms'
import { Spacer } from '~/components/spacer.tsx'
import { Button } from '~/components/ui/button.tsx'
import { DestroyAllUserSessions, requireAnonymous } from '~/lib/auth.server.ts'
import { PasswordSchema } from '~/lib/validation-schemas'
import { generatePasswordHash } from '~/utils'
import { requireVerifySession } from '../utils.server'

const schema = z.object({
	password: PasswordSchema,
})

export async function action({ request }: ActionFunctionArgs) {
	const verifySessionData = await requireVerifySession({
		request,
		requiredType: 'reset-password',
		redirectUrl: '/signup',
	})

	const email = verifySessionData.target

	if (typeof email !== 'string' || !email) {
		return redirect('/signup')
	}

	const formData = await request.formData()

	const submission = await parseWithZod(formData, {
		schema,
	})

	if (submission.status !== 'success') {
		return json(
			{ result: submission.reply() },
			{ status: submission.status === 'error' ? 400 : 200 },
		)
	}
	const { password } = submission.value

	// update user password elminster122!
	const userWithPassword = await db.query.users.findFirst({
		where: (users, { eq }) => eq(users.email, email),
		with: {
			password: true,
		},
	})

	// elminster122!
	if (!userWithPassword) {
		return redirect('/signup')
	}

	await db
		.update(passwords)
		.set({
			hash: await generatePasswordHash(password),
			timeUpdated: new Date(),
		})
		.where(eq(passwords.userId, userWithPassword.id))

	await DestroyAllUserSessions({
		userId: userWithPassword.id,
	})

	return redirect('/sign-in')
}

export async function loader({ request }: LoaderFunctionArgs) {
	await requireAnonymous(request)
	const verifySessionData = await requireVerifySession({
		request,
		requiredType: 'reset-password',
		redirectUrl: '/sign-in',
	})

	const email = verifySessionData.target

	return json({
		email,
	} as const)
}

export default function ResetPasswordRoute() {
	const data = useLoaderData<typeof loader>()
	const actionData = useActionData<typeof action>()

	const [form, fields] = useForm({
		id: 'reset-password-form',
		constraint: getZodConstraint(schema),
		lastResult: actionData?.result,
		onValidate({ formData }) {
			const result = parseWithZod(formData, { schema })

			return result
		},
		shouldRevalidate: 'onBlur',
	})

	const submitting = useNavigation().state === 'submitting'

	return (
		<div className="flex min-h-full flex-col justify-center pb-32 pt-20">
			<div className="flex flex-col gap-3 text-center">
				<h1 className="text-h1 text-4xl font-bold">
					{`Password Reset - ${data.email}`}
				</h1>
				<p className="text-body-md text-muted-foreground">
					No worries. It happens all the time.
				</p>
			</div>
			<Spacer size="xs" />

			<Form
				method="post"
				{...getFormProps(form)}
				className="mx-auto w-full max-w-md px-8 py-2"
			>
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
				<Button type="submit" disabled={submitting} className="w-full">
					Submit
				</Button>
			</Form>
		</div>
	)
}
