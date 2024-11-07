import { db } from '@nautikos/core/db'
import {
	verifications,
	type InsertVerificationModel,
	type VerificationModel,
} from '@nautikos/core/schema/verifications'
import { type TxOrDb } from '@nautikos/core/transaction'
import { verifyTOTP } from '@epic-web/totp'
import { and, eq } from 'drizzle-orm'

import { type VerificationParamsType } from './validation.schema'

export async function getVerification({
	target,
	type,
}: Pick<
	VerificationModel,
	'target' | 'type'
>): Promise<VerificationModel | null> {
	const verification = await db.query.verifications.findFirst({
		where: (verifications, { eq, and, gt }) =>
			and(
				eq(verifications.target, target),
				eq(verifications.type, type),
				gt(verifications.expiresAt, new Date()),
			),
	})

	if (!verification) return null

	return verification
}

export async function deleteVerification({
	target,
	type,
}: Pick<VerificationModel, 'target' | 'type'>): Promise<void> {
	await db
		.delete(verifications)
		.where(and(eq(verifications.type, type), eq(verifications.target, target)))
		.returning()
}

export async function isCodeValid({
	code,
	type,
	target,
}: VerificationParamsType) {
	console.log('isCodeValid code: ', code)
	console.log('isCodeValid type: ', type)
	console.log('isCodeValid target: ', target)

	if (!code) return false

	const verification = await getVerification({
		target,
		type,
	})

	if (!verification) return false

	const isValid = await verifyTOTP({
		otp: code,
		...verification,
	})

	if (!isValid) return false

	return true
}

export async function upsertVerification({
	trx = db,
	data,
}: {
	data: Omit<InsertVerificationModel, 'id'>
	trx?: TxOrDb
}): Promise<VerificationModel> {
	try {
		const { secret, algorithm, target, expiresAt, digits, type, period } = data

		const [insertVerification] = await trx
			.insert(verifications)
			.values({
				period,
				secret,
				algorithm,
				target,
				expiresAt,
				digits,
				type,
			})
			.onConflictDoUpdate({
				target: [verifications.target, verifications.type],
				set: {
					expiresAt,
					secret,
					timeCreated: new Date(),
				},
			})
			.returning()

		if (!insertVerification) {
			throw new Error('Failed to insert verification')
		}

		return insertVerification
	} catch (error) {
		console.error(error)
		throw error
	}
}
