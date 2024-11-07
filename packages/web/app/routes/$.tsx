import { type MetaFunction } from '@remix-run/node'
import { Link } from '@remix-run/react'

import { GeneralErrorBoundary } from '~/components/error-boundary.tsx'
import { Spacer } from '~/components/spacer.tsx'
import { Button } from '~/components/ui/button.tsx'
import { AppName } from '~/root'

export const meta: MetaFunction = () => {
	return [{ title: `${AppName} | Not Found` }]
}

export async function loader() {
	throw new Response('Not found', { status: 404 })
}

export default function NotFound() {
	// due to the loader, this component will never be rendered, but we'll return
	// the error boundary just in case.
	return <ErrorBoundary />
}

export function ErrorBoundary() {
	return (
		<GeneralErrorBoundary
			statusHandlers={{
				404: () => (
					<div className="mx-auto flex h-full flex-1 flex-col items-center gap-8">
						<Spacer size="lg" />
						<h1 className="text-4xl md:text-6xl">Page 404</h1>
						<p className="text-muted-foreground text-center text-lg leading-8">
							You might have taken a wrong turn with the URL. No worries, it
							happens to the best of us!
						</p>

						<Link to="/">
							<Button variant="outline" className="text-sm font-semibold">
								Back to Homepage
							</Button>
						</Link>
					</div>
				),
			}}
		/>
	)
}
