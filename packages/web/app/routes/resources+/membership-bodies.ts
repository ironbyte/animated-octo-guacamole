import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { db } from '@nautikos/core/db'
import { membershipBodies } from '@nautikos/core/schema/membership_bodies'

import { requireUserSession } from '~/lib/auth.server'

export const ROUTE_PATH = '/resources/membership-bodies' as const

export const loader = async ({ request }: LoaderFunctionArgs) => {
	await requireUserSession(request)

	const allMembershipBodies = await db
		.select({
			id: membershipBodies.id,
			name: membershipBodies.name,
			category: membershipBodies.category,
		})
		.from(membershipBodies)
		.orderBy(membershipBodies.name)
		.execute()

	return json(
		{ membershipBodies: allMembershipBodies },
		{
			headers: {
				'Cache-Control': 'public, max-age=86400, s-maxage=86400, immutable',
			},
		},
	)
}
