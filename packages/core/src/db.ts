import { neonConfig, Pool as NeonPool } from '@neondatabase/serverless'
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-serverless'
import { Resource } from 'sst'
import ws from 'ws'

import * as schema from './schema'

neonConfig.webSocketConstructor = ws

export const neonDatabaseUrl = Resource.DatabaseUrl.value

export const db = drizzleNeon<typeof schema>(
	new NeonPool({ connectionString: neonDatabaseUrl }),
	{
		schema,
		// logger: Resource.App.stage !== 'production',
	},
)

export type DB = typeof db
