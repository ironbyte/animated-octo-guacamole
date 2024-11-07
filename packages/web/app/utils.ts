import bcrypt from 'bcryptjs'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

export function getDomainUrl(request: Request) {
	const host =
		request.headers.get('X-Forwarded-Host') ??
		request.headers.get('host') ??
		new URL(request.url).host
	const protocol = request.headers.get('X-Forwarded-Proto') ?? 'http'
	return `${protocol}://${host}`
}

export function getErrorMessage(error: unknown) {
	if (typeof error === 'string') return error
	if (
		error &&
		typeof error === 'object' &&
		'message' in error &&
		typeof error.message === 'string'
	) {
		return error.message
	}
	console.error('Unable to get error message for error', error)
	return 'Unknown Error'
}

export function getUserAgent(request: Request) {
	const userAgent = request.headers.get('User-Agent')

	return userAgent
}

export async function generatePasswordHash(password: string): Promise<string> {
	const hash = await bcrypt.hash(password, 10)
	return hash
}

export function getFullHostUrl(request: Request) {
	const host = request.headers.get('host')
	const protocol = host?.includes('localhost') ? 'http' : 'https'

	return `${protocol}://${host}`
}

/**
 * Combines multiple header objects into one (Headers are appended not overwritten).
 */
export function combineHeaders(
	...headers: Array<ResponseInit['headers'] | null | undefined>
) {
	const combined = new Headers()
	for (const header of headers) {
		if (!header) continue
		for (const [key, value] of new Headers(header).entries()) {
			combined.append(key, value)
		}
	}
	return combined
}
