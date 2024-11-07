import { Form, Link } from '@remix-run/react'
import { AnchorIcon, LogInIcon, LogOutIcon } from 'lucide-react'
import { twMerge } from 'tailwind-merge'

import { ThemeSwitch, useTheme } from '~/components/theme-switch'
import { AppName } from '~/root'
import { Wordmark } from './logo'
import { Button } from './ui/button'
import { UserDropdown } from './user-dropdown'

/*
function SignUpButton() {
	return (
		<Button asChild>
			<Link to="/sign-up">
				<span>{`Sign Up`}</span>
			</Link>
		</Button>
	)
}
*/

function SignInButton() {
	return (
		<Button asChild className="flex gap-2" variant="outline">
			<Link to="/sign-in">
				<LogInIcon />
				<span>{`Sign In`}</span>
			</Link>
		</Button>
	)
}

function SignOutButton() {
	return (
		<Form action="/sign-out" method="post">
			<Button type="submit" variant="ghost" className="flex gap-1">
				<LogOutIcon />
				<span>{`Sign Out`}</span>
			</Button>
		</Form>
	)
}

export function PublicHeader({ username }: { username?: string }) {
	const theme = useTheme()

	const baseStyle =
		'hover:text-foreground underline-offset-8 hover:underline hover:transition hover:duration-500 hover:ease-in-out focus:outline-none '

	const activeStyle = twMerge(
		baseStyle,
		'text-active-foreground underline underline-offset-8',
	)

	const inactiveStyle = twMerge(baseStyle, 'text-muted-foreground')

	return (
		<header className="sticky top-0 z-40 mb-2 flex h-24 items-center shadow-sm sm:px-6 lg:px-8">
			<nav className="flex flex-1 items-center justify-between">
				<Link className="flex justify-center gap-2" to="/">
					<span className="sr-only">{AppName}</span>
					<Wordmark />
				</Link>
				<div className="flex cursor-pointer items-center gap-4">
					{username ? (
						<UserDropdown />
					) : (
						<div className="flex items-center gap-2">
							<SignInButton />
						</div>
					)}
					<ThemeSwitch userPreferences={theme} />
				</div>
			</nav>
		</header>
	)
}
