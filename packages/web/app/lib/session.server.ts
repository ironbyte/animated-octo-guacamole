import { createCookieSessionStorage } from '@remix-run/node'

//Todo: Move  the secrets value to AWS SSM
export const sessionStorage = createCookieSessionStorage({
	cookie: {
		name: '_session',
		sameSite: 'lax',
		path: '/',
		httpOnly: true,
		secrets:
			'kwDj0dwaSSWwJ5s2qNDQ0,8xiK24I8h7DWycNdI_CYY, JhM1RIODeBmHA8lYVzP51'.split(
				',',
			),
		secure: process.env.NODE_ENV === 'production',
	},
})

export const { getSession, commitSession, destroySession } = sessionStorage
