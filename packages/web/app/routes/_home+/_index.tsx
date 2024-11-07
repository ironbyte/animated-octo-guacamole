import {
	json,
	type LoaderFunctionArgs,
	type MetaFunction,
} from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import { ExternalLink } from 'lucide-react'

import { PublicHeader } from '~/components/public-header'
import { useTheme } from '~/components/theme-switch'
import { buttonVariants } from '~/components/ui/button'
import { getUserSession } from '~/lib/auth.server'
import { AppName } from '~/root'
import { cn } from '~/utils'
import { ROUTE_PATH as SIGNUP_PATH } from '../_auth+/sign-up/route'
import ShadowPNG from '/images/shadow.png'

export const meta: MetaFunction = () => {
	return [
		{ title: `${AppName}` },
		{ name: 'description', content: `${AppName}` },
	]
}

export async function loader({ request }: LoaderFunctionArgs) {
	const sessionUser = await getUserSession(request)

	return json({ user: sessionUser } as const)
}

export default function Index() {
	const { user } = useLoaderData<typeof loader>()
	const theme = useTheme()

	return (
		<div className="bg-card relative flex h-full w-full flex-col">
			{/* Navigation */}
			<PublicHeader username={user?.user.email} />

			{/* Content */}
			<div className="z-10 mx-auto flex w-full max-w-screen-lg flex-col gap-4 px-6">
				<div className="z-10 flex h-full w-full flex-col items-center justify-center gap-4 p-12 md:p-24">
					<h1 className="text-center text-6xl font-bold leading-tight text-black md:text-7xl lg:leading-tight dark:text-white">
						Get access to the top
						<br />
						shipping jobs in the UAE
					</h1>
					<p className="text-muted-foreground max-w-screen-md text-center text-lg !leading-normal md:text-xl">
						We ensure{' '}
						<span className="font-semibold text-black dark:text-white">
							top shipping professionals
						</span>{' '}
						in the region are connected with high impact roles across a{' '}
						<span className="font-semibold text-black dark:text-white">
							diverse set of companies
						</span>{' '}
						in the UAE.
					</p>
					<div className="mt-2 flex w-full items-center justify-center gap-2">
						<Link
							to={SIGNUP_PATH}
							className={cn(buttonVariants({ size: 'lg' }), 'hidden sm:flex')}
						>
							<ExternalLink className="mr-2 h-4 w-4" />
							Get hired for AED 99
						</Link>
					</div>
				</div>
			</div>

			{/* Background */}
			<img
				src={ShadowPNG}
				alt="Hero"
				className={`fixed left-0 top-0 z-0 h-full w-full opacity-60 ${theme === 'dark' ? 'invert' : ''}`}
			/>
			<div className="base-grid fixed h-screen w-screen opacity-40" />
			<div className="fixed bottom-0 h-screen w-screen bg-gradient-to-t from-[hsl(var(--card))] to-transparent" />
		</div>
	)
}
