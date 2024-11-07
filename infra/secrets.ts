/// <reference path="../.sst/platform/config.d.ts" />

export const secrets = {
	databaseUrl: new sst.Secret('DatabaseUrl'),
	resendApiKey: new sst.Secret('ResendApiKey'),
	stripeApiKey: new sst.Secret('StripeApiKey'),
	stripeWebhookSigningSecret: new sst.Secret('StripeWebhookSigningSecret'),
}
