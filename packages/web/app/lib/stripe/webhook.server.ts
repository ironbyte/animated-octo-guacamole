import { db } from '@nautikos/core/db'
import { users } from '@nautikos/core/schema/users'
import { eq } from 'drizzle-orm'
import { Resource } from 'sst'
import type Stripe from 'stripe'

import { stripe } from './stripe.server'

const getStripeEventOrThrow = async (request: Request) => {
	const signature = request.headers.get('stripe-signature')
	const payload = await request.text()
	let event: Stripe.Event

	if (!signature || !payload) {
		throw new Response('Invalid Stripe payload/signature', {
			status: 400,
		})
	}

	try {
		event = stripe.webhooks.constructEvent(
			payload,
			signature,
			Resource.StripeWebhookSigningSecret.value,
		)
	} catch (err: any) {
		throw new Response(err.message, {
			status: 400,
		})
	}

	return event
}

/**
 * Handles events from Stripe emitted via webhooks.
 * @param request - The incoming request object.
 */
export const handleStripeWebhook = async (request: Request) => {
	const event = await getStripeEventOrThrow(request)

	console.log('Webhook received: ', event.type)

	try {
		switch (event.type) {
			case 'checkout.session.completed': {
				const paymentIntent = event.data.object
				console.log('PaymentIntent succeeded: ', paymentIntent.id)

				const session = event.data.object

				if (!session.metadata?.userId) {
					throw new Error('User ID not found in session metadata')
				}

				const userId = session.metadata.userId

				const user = await db.query.users.findFirst({
					where: eq(users.id, userId),
				})

				if (!user) {
					throw new Error('User not found')
				}

				await db
					.update(users)
					.set({
						stripeCustomerId: session.customer as string,
						hasAccess: true,
					})
					.where(eq(users.id, userId))

				break
			}

			case 'payment_intent.payment_failed': {
				const paymentIntent = event.data.object
				console.log('PaymentIntent failed: ', paymentIntent.id)
				break
			}
			default:
			//console.log('Unhandled event: ', event.type)
		}
	} catch (error: unknown) {
		if (error instanceof Error) {
			console.error(
				'Error handling Stripe webhook: ' +
					error.message +
					'| EVENT TYPER: ' +
					event.type,
			)
		}
	}

	// We return null here, you could return a response as well, up to you
	return null
}
