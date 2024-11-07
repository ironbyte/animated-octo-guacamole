import { Outlet } from '@remix-run/react'

import { PublicHeader } from '~/components/public-header'

export default function AuthLayout() {
	return (
		<div className="flex h-screen w-full grid-cols-3 flex-col">
			<PublicHeader />
			<div className="flex-1">
				<Outlet />
			</div>
		</div>
	)
}
