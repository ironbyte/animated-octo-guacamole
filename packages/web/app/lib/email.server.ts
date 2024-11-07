import * as E from '@react-email/components'
import { Resend } from 'resend'
import { Resource } from 'sst'

export const PRIMARY_DOMAIN = 'shippingjobs.ae'
export const FROM_ADDRESS_WELCOME = `welcome@${PRIMARY_DOMAIN}`
export const FROM_ADDRESS_SUPPORT = `support@${PRIMARY_DOMAIN}`

const RESEND_DEBUG = true
const RESEND_DEV_EMAIL = 'delivered@resend.dev'

const isProd = Resource.App.stage === 'prod'
const resend = new Resend(Resource.ResendApiKey.value)

export async function sendEmail({
	from,
	to,
	subject,
	react,
}: {
	from: string
	to: string
	subject: string
	react: JSX.Element
}) {
	try {
		const emailPayload = {
			from,
			to: isProd ? to : RESEND_DEV_EMAIL,
			subject,
			react,
		}

		if (RESEND_DEBUG) {
			console.debug("Email is not sent in 'debug' mode")

			const plaintext = E.render(react, {
				plainText: true,
			})

			console.debug('Email plaintext: ', plaintext)
		}

		const data = await resend.emails.send(emailPayload)

		console.debug('Email sent: ', data)

		return data
	} catch (error) {
		throw error
	}
}
