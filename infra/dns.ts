/// <reference path="../.sst/platform/config.d.ts" />

const root = 'shippingjobs.ae'

export const domain =
	{
		production: root,
		dev: `dev.${root}`,
		staging: `staging.${root}`,
	}[$app.stage] || $app.stage + `.dev.${root}`

export const zone = cloudflare.getZoneOutput({
	name: root,
})
