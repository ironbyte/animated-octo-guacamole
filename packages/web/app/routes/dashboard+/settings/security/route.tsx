import { Card, CardContent } from '~/components/ui/card'
import { SecuritySettings } from './security'

export const ROUTE_PATH = '/dashboard/settings/security' as const

export default function Route() {
	return (
		<div className="">
			<Card className="mb-6">
				<CardContent className="flex items-center p-6">
					<div>
						<h2 className="mb-2 text-2xl font-bold">Settings / Security</h2>
						<p className="mb-2 text-gray-600">
							Security settings for your account
						</p>
					</div>
				</CardContent>
			</Card>
			<SecuritySettings />
		</div>
	)
}
