import { NavLink } from '@remix-run/react'
import { twMerge } from 'tailwind-merge'

import { Button } from './ui/button'

export type SidebarNavLinkItem = {
	to: string
	label: string
	icon: JSX.Element
}

type SidebarProps = {
	open?: boolean
	onOpenChange?: (open: boolean) => void
	navlinkItems: SidebarNavLinkItem[]
}

export function Sidebar(props: SidebarProps) {
	const baseStyle =
		'hover:bg-accent hover:text-accent-foreground w-full h-10 px-4 py-2 inline-flex items-center whitespace-nowrap rounded-md font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'
	const activeStyle = twMerge(baseStyle, 'bg-secondary ')
	const inactiveStyle = twMerge(baseStyle, 'text-muted-foreground')

	return (
		<aside className="my-4 hidden w-64 shadow-md lg:block">
			<nav className="space-y-2 sm:px-2 lg:px-4">
				{props.navlinkItems.map((i) => {
					return (
						<button key={i.to} className="w-full">
							<div className="w-full">
								<NavLink
									to={i.to}
									className={({ isActive }) => {
										return isActive ? activeStyle : inactiveStyle
									}}
								>
									{i.icon}
									{i.label}
								</NavLink>
							</div>
						</button>
					)
				})}
			</nav>
		</aside>
	)
}

export function MobileSidebar(props: SidebarProps) {
	return (
		<nav className="bg-muted/40 flex h-full flex-col">
			<div className="flex-1 overflow-auto py-2">
				{props.navlinkItems.map((i) => (
					<Button
						key={i.to}
						variant="ghost"
						className="w-full justify-start text-lg"
						asChild
					>
						<NavLink to={i.to}>
							{i.icon}
							{i.label}
						</NavLink>
					</Button>
				))}
			</div>
		</nav>
	)
}
