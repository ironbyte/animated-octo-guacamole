import { redirect } from '@remix-run/node'
import { db } from '@nautikos/core/db'
import {
	passwords,
	userProfiles,
	users,
	userSessions,
	type UserModel,
	type UserProfileModel,
	type UserRole,
} from '@nautikos/core/schema/users'
import { type TxOrDb } from '@nautikos/core/transaction'
import bcrypt from 'bcryptjs'
import { addHours } from 'date-fns'
import { eq, sql } from 'drizzle-orm'
import { getClientIPAddress } from 'remix-utils/get-client-ip-address'

import { generatePasswordHash, getUserAgent } from '~/utils.ts'
import { sessionStorage } from './session.server.ts'

export const sessionKey = 'sessionId'

export function getSessionExpirationDate(): Date {
	const SESSION_EXPIRATION_TIME = 1000 * 60 * 60 * 24 * 7

	const expirationDate = new Date(Date.now() + SESSION_EXPIRATION_TIME)

	return expirationDate
}

export const getUserSession = async (request: Request) => {
	const cookie = request.headers.get('Cookie')
	const session = await sessionStorage.getSession(cookie)

	const userSessionId = session.get(sessionKey)

	if (!userSessionId) return null

	const userSession = await db.query.userSessions.findFirst({
		where: (userSessions, { eq }) => {
			return eq(userSessions.id, userSessionId)
		},
		columns: {
			id: true,
			expiresAt: true,
		},
		with: {
			user: {
				with: {
					profile: true,
				},
				columns: {
					id: true,
					email: true,
					isVerified: true,
					isOnboarded: true,
					hasAccess: true,
					role: true,
				},
			},
		},
	})

	if (!userSession?.user) {
		// Instead of throwing a redirect, return null or a specific error object
		await sessionStorage.destroySession(session)
		return null
	}

	return userSession
}

export async function requireUserSession(
	request: Request,
	redirectTo: string = new URL(request.url).pathname,
) {
	const userSession = await getUserSession(request)

	if (!userSession) {
		const searchParams = new URLSearchParams([['redirectTo', redirectTo]])

		throw redirect(`/sign-in?${searchParams}`)
	}

	return userSession
}

export async function requireAnonymous(request: Request) {
	const userId = await getUserSession(request)

	if (userId) throw redirect('/')
}

export const getUser = async (userId: UserModel['id']) => {
	const user = await db.query.users.findFirst({
		where: (users, { eq }) => {
			return eq(users.id, userId)
		},
		with: {
			profile: true,
			sessions: true,
		},
	})

	return user || null
}

export const createUserSession = async ({
	request,
	userId,
	rememberMe,
	redirectTo,
}: {
	request: Request
	userId: string
	rememberMe: boolean
	redirectTo: string
}) => {
	const session = await sessionStorage.getSession()
	const headers = new Headers()

	const ua = getUserAgent(request) || ''
	const clientIp = getClientIPAddress(request) || ''

	const now = new Date()
	const expiresAt = rememberMe ? getSessionExpirationDate() : addHours(now, 2) // 2 hours for non-remembered sessions

	try {
		const [userSession] = await db
			.insert(userSessions)
			.values({
				userId,
				expiresAt,
				lastActivityAt: now,
				ipAddress: clientIp,
				userAgent: ua,
			})
			.returning()

		if (!userSession) {
			throw new Error('Failed to create user session')
		}

		session.set(sessionKey, userSession.id)
		const sessionCookie = await sessionStorage.commitSession(session, {
			expires: expiresAt,
		})

		headers.append('Set-Cookie', sessionCookie)

		return redirect(redirectTo, {
			headers: headers,
		})
	} catch (error) {
		// Log the error
		console.error('Failed to create user session:', error)
		// You might want to redirect to an error page or handle this differently
		return redirect('/login?error=session_creation_failed')
	}
}

export async function destroyUserSession(request: Request) {
	const cookie = request.headers.get('Cookie')
	const session = await sessionStorage.getSession(cookie)

	try {
		const userSessionId = session.get(sessionKey)

		if (userSessionId) {
			await db.delete(userSessions).where(eq(userSessions.id, userSessionId))
		}

		return redirect('/', {
			headers: {
				'Set-Cookie': await sessionStorage.destroySession(session),
			},
		})
	} catch (error) {
		console.error('Failed to destroy user session:', error)
		// You might want to handle this error differently, perhaps by redirecting to an error page
		return redirect('/error', {
			headers: {
				'Set-Cookie': await sessionStorage.destroySession(session),
			},
		})
	}
}

export const getAuthSessionId = async (request: Request) => {
	const authSession = await sessionStorage.getSession(
		request.headers.get('Cookie'),
	)

	const id = authSession.get(sessionKey)

	if (!id) {
		return null
	}

	return id
}

export const getUserId = async (request: Request) => {
	const cookie = request.headers.get('Cookie')
	const session = await sessionStorage.getSession(cookie)

	const userSessionId = session.get(sessionKey)

	if (!userSessionId) return null

	const userSession = await db.query.userSessions.findFirst({
		where: (userSessions, { eq }) => {
			return eq(userSessions.id, userSessionId)
		},
		columns: {
			id: true,
		},
		with: {
			user: true,
		},
	})

	if (!userSession?.user) {
		throw redirect('/', {
			headers: {
				'Set-Cookie': await sessionStorage.destroySession(session),
			},
		})
	}

	return userSession.user.id
}

export async function DestroyAllUserSessions({
	userId,
}: {
	userId: UserModel['id']
}) {
	await db.delete(userSessions).where(eq(userSessions.userId, userId))
}

export async function isEmailAvailable({
	email,
}: {
	email: UserModel['email']
}): Promise<boolean> {
	try {
		const [result] = await db
			.select({ count: sql`count(*)` })
			.from(users)
			.where(sql`lower(email) = lower(${email})`)
			.limit(1)

		return result?.count === '0'
	} catch (error) {
		console.error('Error checking email availability:', error)
		// Depending on your error handling strategy, you might want to throw this error
		// or return a default value
		throw new Error('Unable to check email availability')
	}
}

type SignUpInput = Pick<UserModel, 'email'> &
	Pick<UserProfileModel, 'firstName' | 'lastName'> & {
		password: string
		role?: UserRole
	}

export async function signup({
	data: { email, password, firstName, lastName, role },
	trx = db,
}: {
	data: SignUpInput
	trx: TxOrDb
}): Promise<UserModel['id']> {
	let hashedPassword: string | undefined

	hashedPassword = await generatePasswordHash(password)

	try {
		return await trx.transaction(async (trx) => {
			const [insertedUser] = await trx
				.insert(users)
				.values({
					email: sql`lower(${email})`, // Ensure email is lowercase
					isVerified: true,
					isOnboarded: Boolean(role),
					role,
				})
				.returning({ id: users.id })

			if (!insertedUser) {
				throw new Error('Failed to insert user')
			}

			await trx.insert(passwords).values({
				hash: hashedPassword,
				userId: insertedUser.id,
			})

			await trx.insert(userProfiles).values({
				userId: insertedUser.id,
				firstName,
				lastName,
				mobile: '',
			})

			return insertedUser.id
		})
	} catch (error) {
		if (error instanceof Error && error.message.includes('unique constraint')) {
			throw new Error('Email already in use')
		}
		console.error('Error during signup:', error)
		throw new Error('Signup failed')
	}
}

export async function authenticate({
	email,
	password,
}: {
	email: UserModel['email']
	password: string
}): Promise<{ id: string } | null> {
	try {
		const existingUserWithPassword = await db.query.users.findFirst({
			where: (users, { eq }) =>
				eq(sql`lower(${users.email})`, sql`lower(${email})`),
			columns: {
				id: true,
				isVerified: true,
			},
			with: {
				password: true,
			},
		})

		if (!existingUserWithPassword || !existingUserWithPassword.isVerified) {
			await bcrypt.compare(password, '$2b$10$' + 'X'.repeat(53))

			return null
		}

		const isPasswordValid = await bcrypt.compare(
			password,
			existingUserWithPassword.password.hash,
		)

		if (!isPasswordValid) {
			return null
		}

		return {
			id: existingUserWithPassword.id,
		}
	} catch (error) {
		console.error('Error during authentication:', error)
		throw new Error('Authentication failed')
	}
}
