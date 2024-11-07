import { type UserModel } from '@nautikos/core/schema/users'
import { Resource } from 'sst'
import Stripe from 'stripe'

export const stripe = new Stripe(Resource.StripeApiKey.value)

// Todo: add line_items arg
export const createCheckoutSession = async ({
	priceId,
	user,
	successUrl,
	cancelUrl,
}: {
	priceId: string
	user: Pick<UserModel, 'id' | 'email'>
	successUrl?: string
	cancelUrl?: string
}) => {
	const session = await stripe.checkout.sessions.create({
		// your site url where you want user to land after checkout completed
		success_url: successUrl,
		// your site url where you want user to land after checkout canceled
		cancel_url: cancelUrl,
		// users email, if you create a customer before this step you can assign the customer here too.
		customer_email: user.email,
		metadata: {
			userId: user.id,
		},
		// Items to be attached to the subscription
		line_items: [
			{
				price: priceId,
				quantity: 1,
			},
		],
		mode: 'payment',
	})

	return session.url
}

/*
4000007840000001

*/
