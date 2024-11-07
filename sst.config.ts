/// <reference path="./.sst/platform/config.d.ts" />

const appName = 'nautikos'
// const awsRegion = 'eu-central-1'
export const awsRegion = 'ap-south-1'

export default $config({
	app(input) {
		const isProd = input?.stage === 'production'

		return {
			name: appName,
			removal: isProd ? 'retain' : 'remove',
			home: 'aws',
			providers: {
				aws: {
					profile: process.env.GITHUB_ACTIONS
						? undefined
						: isProd
							? 'prod'
							: 'dev',
					region: awsRegion,
				},
				cloudflare: '5.39.0',
			},
		}
	},
	async run() {
		const infra = await import('./infra')
		return {
			webUrl: infra.web.url,
		}
	},
})
