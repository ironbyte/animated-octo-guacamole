import { Link } from '@remix-run/react'
import * as React from 'react'
import { Anchor, Bell, Menu } from 'lucide-react'

import { MobileSidebar, type SidebarNavLinkItem } from '~/components/sidebar'
import { ThemeSwitch, useTheme } from '~/components/theme-switch'
import { Button } from '~/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '~/components/ui/sheet'
import { UserDropdown } from '~/components/user-dropdown'
import { AppName } from '~/root'
import { Wordmark } from './logo'

type OnboardingHeaderProps = {
	sidebarNavlinkItems: SidebarNavLinkItem[]
}

export function Header(props: OnboardingHeaderProps) {
	const theme = useTheme()
	const [sidebarOpen, setSidebarOpen] = React.useState(false)

	return (
		<header className="sticky top-0 z-40 flex h-24 items-center shadow-sm sm:px-6 lg:px-8">
			<Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
				<SheetTrigger asChild>
					<Button variant="ghost" size="icon" className="lg:hidden">
						<Menu className="h-6 w-6" />
						<span className="sr-only">Toggle sidebar</span>
					</Button>
				</SheetTrigger>
			</Sheet>
			<nav className="flex flex-1 items-center justify-between">
				<Link
					className="hidden items-center justify-center gap-2 lg:flex"
					to="/"
				>
					<span className="sr-only">{AppName}</span>
					<Wordmark />
				</Link>
				<div className="flex items-center gap-2">
					<Button variant="ghost" size="icon">
						<Bell className="h-5 w-5" />
						<span className="sr-only">Notifications</span>
					</Button>
					<ThemeSwitch userPreferences={theme} />
					<UserDropdown />
				</div>
			</nav>
			{/* Sidebar */}
			<Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
				<SheetContent side="left" className="w-[240px] p-0">
					<MobileSidebar navlinkItems={props.sidebarNavlinkItems} />
				</SheetContent>
			</Sheet>
		</header>
	)
}
