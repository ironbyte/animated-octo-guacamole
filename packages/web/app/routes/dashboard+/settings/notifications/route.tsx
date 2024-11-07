import { Card, CardContent } from '~/components/ui/card'

export const ROUTE_PATH = '/dashboard/settings/notifications' as const

export default function Route() {
	return (
		<div className="">
			<Card className="mb-6">
				<CardContent className="flex items-center p-6">
					<div>
						<h2 className="mb-2 text-2xl font-bold">
							Settings / Notifications
						</h2>
						<p className="mb-2 text-gray-600">
							Notification settings for your account
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
