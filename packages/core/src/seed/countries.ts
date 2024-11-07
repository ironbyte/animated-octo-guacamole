import { countries, type InsertCountryModel } from '../schema/countries'
import { type Transaction } from '../transaction'
import { extractCSVData } from './utils'

type MyCustomType = {
	name: string
	['country-code']: string
}

const csvFilePath = 'src/seed/data/countries.csv'

export async function seedCountries(trx: Transaction) {
	try {
		const data = await extractCSVData<MyCustomType>(csvFilePath, 'name')
		const countryInserts: InsertCountryModel[] = data.map((i) => ({
			name: i.name,
			code: i['country-code'],
		}))

		console.log(
			'Countries to upsert: ',
			JSON.stringify(countryInserts, null, 2),
		)

		// Using PostgreSQL's upsert functionality
		await trx
			.insert(countries)
			.values(countryInserts)
			.onConflictDoNothing({ target: countries.name })

		console.log('Upsert operation completed successfully.')
	} catch (error) {
		console.error('Error during upsert operation:', error)
	}
}
