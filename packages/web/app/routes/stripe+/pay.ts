import { json, redirect, type ActionFunctionArgs } from '@remix-run/node'
import { useFetcher } from '@remix-run/react'

import { requireUserSession } from '~/lib/auth.server'
import { createCheckoutSession } from '~/lib/stripe/stripe.server'
import { getDomainUrl } from '~/utils'

export const action = async ({ request }: ActionFunctionArgs) => {
	const domainUrl = getDomainUrl(request)
	const userSession = await requireUserSession(request)
	const { user } = userSession

	const url = await createCheckoutSession({
		priceId: 'price_1QETSiI6bTCypkwMghNNYI21',
		successUrl: `${domainUrl}/onboarding/review`,
		cancelUrl: `${domainUrl}/onboarding/payment`,
		user: {
			id: user.id,
			email: user.email,
		},
	})

	if (!url) {
		return json({ error: 'Something went wrong' }, { status: 500 })
	}
	return redirect(url)
}

/**
 * Used to redirect the user to the Stripe checkout page
 * @returns A custom fetcher with extended submit function
 */
export const useStripeCheckout = () => {
	const fetcher = useFetcher<typeof action>()
	return {
		...fetcher,
		// overwrites the default submit so you don't have to specify the action or method
		submit: () =>
			fetcher.submit(null, { method: 'POST', action: '/stripe/pay' }),
	}
}
