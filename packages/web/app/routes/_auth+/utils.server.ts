import { redirect } from '@remix-run/node'
import { type UserRole } from '@nautikos/core/schema/users'
import { type VerificationModel } from '@nautikos/core/schema/verifications'
import invariant from 'tiny-invariant'

import { verifySessionStorage } from '~/lib/verify-session.server'
import { getFullHostUrl } from '~/utils'
import {
	type VerificationParamsType,
	type VerificationType,
} from './validation.schema'

type UrlParams = Partial<VerificationParamsType> & {
	[key: string]: string | number | boolean
}

function createVerificationUrlWithParams(
	baseUrl: string,
	params: UrlParams,
): URL {
	const url = new URL(baseUrl)

	for (const [key, value] of Object.entries(params)) {
		url.searchParams.set(key, value.toString())
	}

	return url
}

export function generateVerificationUrl(
	request: Request,
	verificationParams: VerificationParamsType,
): URL {
	const fullHostUrlString = getFullHostUrl(request)

	const url = createVerificationUrlWithParams(`${fullHostUrlString}/verify`, {
		...verificationParams,
	})

	return url
}

export async function createVerifySession({
	type,
	target,
	role,
}: Pick<VerificationModel, 'type' | 'target'> & {
	type: VerificationType
	role?: UserRole
}) {
	const verifySession = await verifySessionStorage.getSession()

	verifySession.set('type', type)
	verifySession.set('target', target)
	verifySession.set('role', role)

	return verifySession
}

export async function requireVerifySession({
	request,
	requiredType,
	redirectUrl, // when the session is not valid, redirect to this url
}: {
	request: Request
	requiredType: VerificationType
	redirectUrl: string
}) {
	const verifySession = await verifySessionStorage.getSession(
		request.headers.get('Cookie'),
	)

	const target = verifySession.get('target')
	const type = verifySession.get('type')
	const role = verifySession.get('role')

	invariant(target, 'target must be set')
	invariant(type, 'type must be set')

	if (type !== requiredType) {
		throw redirect(redirectUrl)
	}

	return {
		target,
		type,
		role,
	}
}
