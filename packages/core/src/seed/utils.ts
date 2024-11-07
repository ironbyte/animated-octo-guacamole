import * as fs from 'fs'
import * as csv from 'csv-parse'

export async function extractCSVData<T extends Record<string, unknown>>(
	filePath: string,
	columnName: keyof T,
): Promise<T[]> {
	return new Promise((resolve, reject) => {
		const names: T[] = []

		fs.createReadStream(filePath)
			.pipe(csv.parse({ columns: true, trim: true }))
			.on('data', (row: T) => {
				const value = row[columnName]

				if (value) {
					names.push(row)
				}
			})
			.on('end', () => {
				resolve(names)
			})
			.on('error', (error: unknown) => {
				reject(error)
			})
	})
}
