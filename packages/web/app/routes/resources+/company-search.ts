import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { db } from '@nautikos/core/db'
import { companies } from '@nautikos/core/schema/companies'
import { sql } from 'drizzle-orm'

import { requireUserSession } from '~/lib/auth.server'

export const ROUTE_PATH = '/resources/company-search' as const

export const loader = async ({ request }: LoaderFunctionArgs) => {
	await requireUserSession(request)

	const url = new URL(request.url)
	const searchTerm = url.searchParams.get('q')

	if (!searchTerm) {
		return json({ companies: [] })
	}

	const companiesList = await db
		.select({
			id: companies.id,
			name: companies.name,
		})
		.from(companies)
		.where(sql`${companies.name} ILIKE ${`%${searchTerm}%`}`)
		.limit(10)
		.execute()

	return json(
		{ companies: companiesList },
		{
			headers: {
				'Cache-Control': 'max-age=60',
			},
		},
	)
}
