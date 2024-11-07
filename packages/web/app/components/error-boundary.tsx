import {
	isRouteErrorResponse,
	useParams,
	useRouteError,
	type ErrorResponse,
} from '@remix-run/react'
import { CircleAlert } from 'lucide-react'

import { getErrorMessage } from '~/utils'

type StatusHandler = (info: {
	error: ErrorResponse
	params: Record<string, string | undefined>
}) => JSX.Element | null

type GeneralErrorBoundaryFunctionArgs = {
	defaultStatusHandler?: StatusHandler
	statusHandlers?: Record<number, StatusHandler>
	unexpectedErrorHandler?: (error: unknown) => JSX.Element | null
}

export function GeneralErrorBoundary({
	defaultStatusHandler = ({ error }) => (
		<p>
			{error.status} {error.data}
		</p>
	),
	statusHandlers,
	unexpectedErrorHandler = (error) => <ErrorUI error={error} />,
}: GeneralErrorBoundaryFunctionArgs) {
	const error = useRouteError()
	const params = useParams()

	if (typeof document !== 'undefined') {
		console.error(error)
	}

	return (
		<div className="text-h2 container flex items-center justify-center p-20">
			{isRouteErrorResponse(error)
				? (statusHandlers?.[error.status] ?? defaultStatusHandler)({
						error,
						params,
					})
				: unexpectedErrorHandler(error)}
		</div>
	)
}

function ErrorUI({ error }: { error: unknown }) {
	const errorMessage = getErrorMessage(error)

	return (
		<div className="flex h-full w-full flex-col items-center gap-4">
			<div className="flex w-full flex-col items-center gap-2">
				<h1 className="font-bolder text-destructive mb-1 inline-flex items-center gap-4 text-2xl font-semibold">
					<CircleAlert className="h-8 w-8" />
					{errorMessage || 'App Error'}
				</h1>
				<p>
					An error has occurred processing your request. You may try again or
					contact support if the problem persists.
				</p>
			</div>
			{error instanceof Error && error.stack && (
				<div className="my-4 border-2 p-4">
					<pre className="max-w-full overflow-auto">{error.stack}</pre>
					<p className="mt-4 italic">
						Stack trace only displayed in DEVELOPMENT
					</p>
				</div>
			)}
		</div>
	)
}
