import { defineConfig } from 'drizzle-kit'
import { Resource } from 'sst'

export default defineConfig({
	dialect: 'postgresql',
	schema: './src/schema/*',
	out: './migrations',
	dbCredentials: {
		url: Resource.DatabaseUrl.value,
		database: 'postgres',
		port: 5432,
	},
	verbose: true,
	strict: true,

	schemaFilter: ['public'],
})
