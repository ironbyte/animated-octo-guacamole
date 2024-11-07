import { type ActionFunctionArgs } from '@remix-run/node'

import { handleStripeWebhook } from '~/lib/stripe/webhook.server'

export const action = ({ request }: ActionFunctionArgs) =>
	handleStripeWebhook(request)
