/// <reference path="../.sst/platform/config.d.ts" />

import { domain } from './dns'
import { mainBucket } from './s3'
import { secrets } from './secrets'

export const web = new sst.aws.Remix('WebApp', {
	path: './packages/web',
	link: [
		secrets.resendApiKey,
		mainBucket,
		secrets.databaseUrl,
		secrets.stripeApiKey,
		secrets.stripeWebhookSigningSecret,
	],
	domain: {
		name: domain,
		redirects: [`www.${domain}`],
		dns: sst.cloudflare.dns(),
	},
})
