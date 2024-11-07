import { Form, Link, useSubmit } from '@remix-run/react'
import { useRef } from 'react'
import { ChevronDown, LogInIcon, LogOut, LogOutIcon } from 'lucide-react'

import { useOptionalUser } from '~/lib/utils'
import { Button } from './ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuPortal,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from './ui/dropdown-menu'

export function UserDropdown() {
	const user = useOptionalUser()
	const submit = useSubmit()
	const formRef = useRef<HTMLFormElement>(null)

	return (
		<DropdownMenu>
			{user && (
				<DropdownMenuTrigger asChild>
					<Button asChild variant="outline">
						<div className="flex items-center gap-2">
							<span className="text-lg font-black">
								{`${user.profile?.firstName} ${user.profile?.lastName}`}
							</span>
							<ChevronDown />
						</div>
					</Button>
				</DropdownMenuTrigger>
			)}
			<DropdownMenuPortal>
				<DropdownMenuContent sideOffset={8} align="start" className="w-56 p-2">
					{user?.isOnboarded ? (
						<>
							<DropdownMenuItem asChild className="cursor-pointer text-lg">
								<Link
									to={`/dashboard`}
									// this is for progressive enhancement
									className="flex items-center gap-2"
								>
									<span className="text-body-lg">Dashboard</span>
								</Link>
							</DropdownMenuItem>
						</>
					) : (
						<>
							<DropdownMenuItem asChild className="cursor-pointer text-lg">
								<Link
									to={`/onboarding`}
									// this is for progressive enhancement
									className="flex items-center gap-2"
								>
									<span className="text-body-lg">Onboarding</span>
								</Link>
							</DropdownMenuItem>
						</>
					)}
					<DropdownMenuItem
						className="text-lg"
						asChild
						// this prevents the menu from closing before the form submission is completed
						onSelect={(event) => {
							event.preventDefault()
							submit(formRef.current)
						}}
					>
						<Form action="/sign-out" method="POST" ref={formRef}>
							<LogOut className="mr-2 h-4 w-4" />
							<button type="submit">Sign out</button>
						</Form>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenuPortal>
		</DropdownMenu>
	)
}
