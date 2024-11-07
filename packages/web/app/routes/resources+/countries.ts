import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { db } from '@nautikos/core/db'
import { countries } from '@nautikos/core/schema/countries'

import { requireUserSession } from '~/lib/auth.server'

export const ROUTE_PATH = '/resources/countries' as const

export const loader = async ({ request }: LoaderFunctionArgs) => {
	await requireUserSession(request)

	const allCountries = await db
		.select({
			id: countries.id,
			name: countries.name,
			code: countries.code,
		})
		.from(countries)
		.orderBy(countries.name)
		.execute()

	return json(
		{ countries: allCountries },
		{
			headers: {
				'Cache-Control': 'public, max-age=86400, s-maxage=86400, immutable',
			},
		},
	)
}
