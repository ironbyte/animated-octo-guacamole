import { redirect, type LoaderFunctionArgs } from '@remix-run/node'

import { requireUserSession } from '~/lib/auth.server'
import { getNavLinksByRole } from '../utils'

export const ROUTE_PATH = '/dashboard' as const

export async function loader({ request }: LoaderFunctionArgs) {
	const userSession = await requireUserSession(request)
	const { user } = userSession

	const firstLink = getNavLinksByRole(user.role)[0]

	if (!firstLink) {
		console.warn(`No navigation links found for role: ${user.role}`)
		return redirect('/')
	}

	return redirect(firstLink.to)
}
