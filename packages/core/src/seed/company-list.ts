import { companies, type InsertCompanyModel } from '../schema/companies'
import { type Transaction } from '../transaction'
import { extractCSVData } from './utils'

type MyCustomType = {
	Company: string
}

const csvFilePath = 'src/seed/data/companies.csv'

export async function seedCompanyList(trx: Transaction) {
	try {
		const data = await extractCSVData<MyCustomType>(csvFilePath, 'Company')
		const companyInserts: InsertCompanyModel[] = data.map((i) => ({
			name: i.Company,
			isVerified: true,
		}))

		await trx
			.insert(companies)
			.values(companyInserts)
			.onConflictDoNothing({ target: companies.name })
		console.log('Upsert operation completed successfully.')
	} catch (error) {
		console.error('Error during upsert operation:', error)
	}
}
