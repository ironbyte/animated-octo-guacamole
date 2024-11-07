import {
	membershipBodies,
	type InsertMembershipBody,
} from '../schema/membership_bodies'
import { type Transaction } from '../transaction'
import { extractCSVData } from './utils'

type MyCustomType = {
	name: string
	category: string
}

const csvFilePath = 'src/seed/data/membership-bodies.csv'

export async function seedMembershipBodies(trx: Transaction) {
	try {
		const data = await extractCSVData<MyCustomType>(csvFilePath, 'name')
		const membershipInserts: InsertMembershipBody[] = data.map((i) => ({
			name: i.name,
			category: i.category,
		}))

		console.log(
			'Membership bodies to upsert: ',
			JSON.stringify(membershipInserts, null, 2),
		)

		await trx
			.insert(membershipBodies)
			.values(membershipInserts)
			.onConflictDoNothing({ target: membershipBodies.name })

		console.log('Upsert operation completed successfully.')
	} catch (error) {
		console.error('Error during upsert operation:', error)
	}
}
