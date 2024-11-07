import { sql } from 'drizzle-orm'

import { db } from './db'

type TableNameRow = {
	table_name: string
}

async function nuke() {
	const query = sql<TableNameRow>`SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE';
    `

	const tables = await db.execute<TableNameRow>(query)

	for (const table of tables) {
		const query = sql.raw(`TRUNCATE TABLE "${table.table_name}" CASCADE;`)
		await db.execute(query)
	}
}

nuke()
	.then(() => {
		console.log('The deed is done. Exiting.')
		process.exit(0)
	})
	.catch((e) => {
		console.error(e)
		process.exit(1)
	})
