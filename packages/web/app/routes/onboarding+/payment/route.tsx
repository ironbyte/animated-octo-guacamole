import { type MetaFunction } from '@remix-run/node'
import { Check, Zap } from 'lucide-react'

import { Button } from '~/components/ui/button'
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from '~/components/ui/card'
import { useOnboardingInfo } from '~/lib/utils'
import { AppName } from '~/root'
import { useStripeCheckout } from '~/routes/stripe+/pay'

export const ROUTE_PATH = '/onboarding/payment' as const

export const meta: MetaFunction = () => {
	return [
		{
			title: `${AppName} | Onboarding - Payment`,
		},
	]
}

export default function OnboardingRoute() {
	const stripeCheckoutFetcher = useStripeCheckout()
	const onboardingInfo = useOnboardingInfo()

	console.log('onboardingInfo: ', onboardingInfo.hasAccess)

	return (
		<div className="flex h-full w-full items-center justify-center">
			<Card className="mx-auto w-full max-w-xl">
				<CardHeader>
					<CardTitle className="text-center text-2xl font-bold">
						Lifetime Access
					</CardTitle>
					<p className="text-primary text-center text-4xl font-bold">AED 99</p>
				</CardHeader>
				<CardContent>
					<ul className="space-y-2">
						{[
							'Lifetime access',
							'Access to top shipping jobs',
							'Ease of interviewing',
							'Resume analytics and suggestions',
							'Smart job alerting',
							'Priority support',
						].map((feature, index) => (
							<li key={index} className="flex items-center space-x-2">
								<Check className="text-primary h-5 w-5" />
								<span>{feature}</span>
							</li>
						))}
					</ul>
				</CardContent>
				<CardFooter>
					<Button
						className="w-full text-lg"
						size="lg"
						onClick={() => stripeCheckoutFetcher.submit()}
						disabled={onboardingInfo.hasAccess}
					>
						<Zap className="mr-2 h-5 w-5" />
						{onboardingInfo.hasAccess ? 'Paid' : 'Pay Now'}
					</Button>
				</CardFooter>
			</Card>
		</div>
	)
}
