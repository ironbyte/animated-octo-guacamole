import { Card, CardContent } from '~/components/ui/card'

export const ROUTE_PATH = '/dashboard/settings' as const

export default function Route() {
	return (
		<div className="">
			<Card className="mb-6">
				<CardContent className="flex items-center p-6">
					<div>
						<h2 className="mb-2 text-2xl font-bold">Settings / General</h2>
						<p className="mb-2 text-gray-600">
							General settings for your account
						</p>
						<div className="flex space-x-2"></div>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
