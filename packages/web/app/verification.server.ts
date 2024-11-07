import { db } from '@nautikos/core/db'
import { type VerificationModel } from '@nautikos/core/schema/verifications'

import { getFullHostUrl } from './utils'

export async function getVerification({
	target,
	type,
}: Pick<VerificationModel, 'target' | 'type'>) {
	const verification = await db.query.verifications.findFirst({
		with: {
			userInvitation: true,
		},
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
