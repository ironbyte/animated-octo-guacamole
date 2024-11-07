import { db } from './db'
import { seedCompanyList } from './seed/company-list'
import { seedCountries } from './seed/countries'
import { seedMembershipBodies } from './seed/membership-bodies'
import { seedUsers } from './seed/users'

async function seed() {
	await db.transaction(async (trx) => {
		const startTime = Date.now()

		await seedCompanyList(trx)
		await seedCountries(trx)
		await seedMembershipBodies(trx)
		await seedUsers(trx)

		const endTime = Date.now()
		const totalTime = endTime - startTime
		console.log(`Seeding completed in ${totalTime}ms`)
	})
}

seed()
	.then(() => {
		console.log('Seeding completed successfully')
		process.exit(0)
	})
	.catch((error) => {
		console.error('Error seeding database:', error)
		process.exit(1)
	})
