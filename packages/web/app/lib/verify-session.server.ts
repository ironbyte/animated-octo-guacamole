import { createCookieSessionStorage } from '@remix-run/node'
import { type UserRole } from '@nautikos/core/schema/users'
import { type VerificationModel } from '@nautikos/core/schema/verifications'

export type SessionFlashData = {
	error: string
}

export type VerifySessionData = {
	target: VerificationModel['target']
	type: VerificationModel['type']
	role?: UserRole
}

export const verifySessionStorage = createCookieSessionStorage<
	VerifySessionData,
	SessionFlashData
>({
	cookie: {
		httpOnly: true,
		name: '_verification',
		path: '/',
		sameSite: 'lax',
		maxAge: process.env.NODE_ENV === 'production' ? 10 * 60 : 120 * 60, // 10 minutes
		secrets:
			'kwDj0dwaSSWwJ5s2qNDQ0,8xiK24I8h7DWycNdI_CYY, JhM1RIODeBmHA8lYVzP51'.split(
				',',
			),
		secure: process.env.NODE_ENV === 'production',
	},
})
