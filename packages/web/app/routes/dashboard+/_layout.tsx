import { json, redirect, type LoaderFunctionArgs } from '@remix-run/node'
import { Outlet, useLoaderData } from '@remix-run/react'
import * as React from 'react'
import { match } from 'path-to-regexp'

import { Header } from '~/components/header'
import { Sidebar } from '~/components/sidebar'
import { requireUserSession } from '~/lib/auth.server'
import { getDomainPathname } from '~/lib/utils'
import { ROUTE_PATH as DASHBOARD_ROUTE_PATH } from './_index/route'
import { getAllowedRoutesByRole, getNavLinksByRole } from './utils'

export async function loader({ request }: LoaderFunctionArgs) {
	const userSession = await requireUserSession(request)

	if (!userSession.user.isOnboarded && userSession.user.role === 'job_seeker')
		throw redirect('/onboarding')

	const { user } = userSession
	const allowedRoutePatterns = getAllowedRoutesByRole(user.role)
	const pathname = getDomainPathname(request)

	if (
		pathname &&
		!allowedRoutePatterns.some((pattern) => {
			/*
			const fn = match('/dashboard/candidates/:id')
			console.log(JSON.stringify(fn('/dashboard/candidates/123'), null, 2))
			*/

			const fn = match(pattern)
			const isMatch = fn(pathname)

			return isMatch
		})
	) {
		return redirect(DASHBOARD_ROUTE_PATH)
	}

	return json({
		user,
	})
}

export default function DashboardLayout() {
	const loaderData = useLoaderData<typeof loader>()
	const { user } = loaderData

	const navLinks = React.useMemo(
		() => getNavLinksByRole(user.role),
		[user.role],
	)

	return (
		<div className="flex h-screen flex-col">
			<Header sidebarNavlinkItems={navLinks} />

			<div className="flex flex-1 overflow-hidden">
				{/* Permanent sidebar for larger screens */}
				<Sidebar navlinkItems={navLinks} />

				{/* Main content area */}
				<main className="bg-muted/25 flex-1 overflow-y-auto overflow-x-hidden">
					<div className="mx-auto py-6 sm:px-6 lg:px-8">
						<Outlet />
					</div>
				</main>
			</div>
		</div>
	)
}
