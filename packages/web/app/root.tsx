import {
	json,
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
} from '@remix-run/node'
import {
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	useLoaderData,
} from '@remix-run/react'
import { parseWithZod } from '@conform-to/zod'
import { getClientIPAddress } from 'remix-utils/get-client-ip-address'

import { GeneralErrorBoundary } from '~/components/error-boundary'
import { ThemeFormSchema, useTheme } from '~/components/theme-switch'
import { useToast } from '~/components/toaster'
import { Toaster } from '~/components/ui/sonner'
import {
	destroyUserSession,
	getAuthSessionId,
	getUser,
	getUserId,
} from '~/lib/auth.server'
import { getTheme, setTheme } from '~/lib/theme-session.server'
import { getToastSession } from '~/lib/toast.server'
import { combineHeaders, getDomainUrl } from '~/utils'

import './tailwind.css'
import './font.css'

export const AppName = 'ShippingJobs.ae'

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData()
	const submission = parseWithZod(formData, {
		schema: ThemeFormSchema,
	})

	if (submission.status !== 'success') {
		return submission.reply()
	}

	const { theme } = submission.value

	const responseInit = {
		headers: { 'set-cookie': setTheme(theme) },
	}

	return json({ result: submission.reply() }, responseInit)
}

export async function loader({ request }: LoaderFunctionArgs) {
	const theme = getTheme(request)
	let user = null
	const userId = await getUserId(request)
	const userSessionId = await getAuthSessionId(request)

	const clientUp = getClientIPAddress(request)

	if (userId) {
		user = await getUser(userId)
	}

	const { toast, headers: toastHeaders } = await getToastSession(request)

	if (userId && !user) {
		// something weird happened...
		// The user is authenticated but we can't find
		// them in the database. Maybe they were deleted?
		// Let's log them out.
		console.error('User not found in DB')
		await destroyUserSession(request)
	}

	return json(
		{
			user: {
				...user,
				userSessionId,
			},
			toast,
			requestInfo: {
				origin: getDomainUrl(request),
				clientUp,
				NODE_ENV: process.env.NODE_ENV ?? 'NOT SET',
				session: {
					theme,
				},
				path: new URL(request.url).pathname,
			},
		} as const,
		{
			headers: combineHeaders(toastHeaders),
		},
	)
}

export function Layout({ children }: { children: React.ReactNode }) {
	const theme = useTheme()

	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<Meta />
				<Links />
			</head>
			<body
				suppressHydrationWarning
				className={`${theme} bg-background text-foreground h-full w-full antialiased transition duration-300`}
			>
				{children}
				<ScrollRestoration />
				<Scripts />
				<Toaster />
			</body>
		</html>
	)
}

export default function App() {
	const { toast } = useLoaderData<typeof loader>()

	useToast(toast)

	return <Outlet />
}

export function ErrorBoundary() {
	return <GeneralErrorBoundary />
}
