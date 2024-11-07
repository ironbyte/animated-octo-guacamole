import { Divider } from '~/components/divider'
import { Card, CardContent } from '~/components/ui/card'
import { useUser } from '~/lib/utils'

export const ROUTE_PATH = '/dashboard/settings/profile' as const

export default function Route() {
	const user = useUser()

	return (
		<div className="">
			<div className="">
				<Card className="mb-6">
					<CardContent className="flex items-center p-6">
						<div>
							<h2 className="mb-2 text-2xl font-bold">Settings / Profile</h2>
							<p className="mb-2 text-gray-600">
								Notification settings for your account
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
			<p>{user?.profile?.firstName}</p>
			<p>{user?.email}</p>
			<Divider />
			<code>Todo: Onboarding fields</code>
		</div>
	)
}
