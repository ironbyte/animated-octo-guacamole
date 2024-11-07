import { Link, Outlet } from '@remix-run/react'
import { Bell, Settings, Shield, User } from 'lucide-react'

import { Button } from '~/components/ui/button'

const navItems = [
	{ icon: Settings, label: 'General', href: '/dashboard/settings' },
	{ icon: User, label: 'Profile', href: '/dashboard/settings/profile' },
	{ icon: Shield, label: 'Security', href: '/dashboard/settings/security' },
	{
		icon: Bell,
		label: 'Notifications',
		href: '/dashboard/settings/notifications',
	},
]

export default function SettingsLayout() {
	return (
		<div>
			<nav className="mb-6 flex space-x-4">
				{navItems.map((item) => (
					<Button key={item.href} asChild variant="outline">
						<Link to={item.href}>
							<item.icon className="mr-2 h-4 w-4" />
							{item.label}
						</Link>
					</Button>
				))}
			</nav>
			<Outlet />
		</div>
	)
}
