import * as E from '@react-email/components'

import { AppName } from '~/root'

export function VerifyEmailTemplate({
	emailAddress,
	otp,
}: {
	emailAddress: string
	otp: string
}) {
	return (
		<E.Html lang="en" dir="ltr">
			<E.Head />
			<E.Section style={main}>
				<E.Container style={container}>
					<h1>
						<E.Text style={h1}>{`Welcome to ${AppName}!`}</E.Text>
					</h1>
					<E.Section>
						<E.Text style={text}>
							{`Thank you for signing up with us! Before you get started, we need to verify ${emailAddress} is your email address.`}
						</E.Text>
						<E.Text style={text}>{`Here's your verification code:`}</E.Text>

						<E.Section>
							<E.Text
								style={{
									...bigText,
									textAlign: 'center',
									letterSpacing: '2px',
								}}
							>
								{otp}
							</E.Text>
						</E.Section>
					</E.Section>
				</E.Container>
				<E.Section>
					<E.Text
						style={{
							...smallText,
							margin: 0,
							textAlign: 'center',
						}}
					>
						If you did not request this email, there's no need to take any
						action; you can safely ignore it.
					</E.Text>
					<E.Text
						style={{
							color: '#64748b',
							fontSize: '8px',
							margin: 0,
							textAlign: 'center',
						}}
					>
						{`Copyright © 2023 ${AppName}`}
					</E.Text>
				</E.Section>
			</E.Section>
		</E.Html>
	)
}

export function VerifyEmailInvitationTemplate({
	emailAddress,
	role,
	verificationUrl,
}: {
	emailAddress: string
	role:
		| 'Administrator'
		| 'Content Moderator'
		| 'Organization Member'
		| 'Job Candidate'
	verificationUrl: URL
}) {
	return (
		<E.Html lang="en" dir="ltr">
			<E.Head />
			<E.Section style={main}>
				<E.Container style={container}>
					<h1>
						<E.Text style={h1}>{`Welcome to ${AppName}!`}</E.Text>
					</h1>
					<E.Section>
						<E.Text style={text}>
							{`You've been invited to join ${AppName} as a ${role}! Before you get started, we need to verify ${emailAddress} is your email address.`}
						</E.Text>
						<E.Text style={text}>{`Here's your invitation link:`}</E.Text>
						<E.Section>
							<E.Link href={verificationUrl}>
								<E.Text style={text}>Get Started</E.Text>
							</E.Link>
						</E.Section>
					</E.Section>
				</E.Container>
				<E.Section>
					<E.Text
						style={{
							...smallText,
							margin: 0,
							textAlign: 'center',
						}}
					>
						If you did not request this email, there's no need to take any
						action; you can safely ignore it.
					</E.Text>
					<E.Text
						style={{
							color: '#64748b',
							fontSize: '8px',
							margin: 0,
							textAlign: 'center',
						}}
					>
						{`Copyright © 2023 ${AppName}`}
					</E.Text>
				</E.Section>
			</E.Section>
		</E.Html>
	)
}

export function ResetPasswordRequestEmailTemplate({
	emailAddress,
	otp,
}: {
	emailAddress: string
	otp: string
}) {
	return (
		<E.Html lang="en" dir="ltr">
			<E.Head />
			<E.Section style={main}>
				<E.Container style={container}>
					<h1>
						<E.Text style={h1}>Reset your password</E.Text>
					</h1>
					<E.Section>
						<E.Text style={text}>
							{`Password reset requested for your ${AppName} account linked to ${emailAddress}. No changes yet. Click below to reset your password.`}
						</E.Text>
						<E.Text style={text}>{`Here's your verification code:`}</E.Text>

						<E.Section>
							<E.Text
								style={{
									...bigText,
									textAlign: 'center',
									letterSpacing: '2px',
								}}
							>
								{otp}
							</E.Text>
						</E.Section>
					</E.Section>
				</E.Container>
				<E.Section>
					<E.Text
						style={{
							...smallText,
							margin: 0,
							textAlign: 'center',
						}}
					>
						If you did not request this email, there's no need to take any
						action; you can safely ignore it.
					</E.Text>
					<E.Text
						style={{
							color: '#64748b',
							fontSize: '8px',
							margin: 0,
							textAlign: 'center',
						}}
					>
						`Copyright © 2023 ${AppName}`
					</E.Text>
				</E.Section>
			</E.Section>
		</E.Html>
	)
}

const main = {
	backgroundColor: '#020617',
	margin: '0 auto',
}

const container = {
	border: '1px solid #3b82f6',
	borderRadius: '5px',
	margin: '40px auto',
	padding: '20px',
	width: '465px',
}

const h1 = {
	color: '#FFF',
	fontFamily:
		"-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
	fontSize: '24px',
	fontWeight: 'normal',
	textAlign: 'center' as const,
	margin: '30px 0',
	padding: '0',
}

const smallText = {
	color: '#FFF',
	fontFamily:
		"-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
	fontSize: '8px',
}

const text = {
	color: '#FFF',
	fontFamily:
		"-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
	fontSize: '12px',
	lineHeight: '24px',
}

const bigText = {
	color: '#FFF',
	fontFamily:
		"-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
	fontSize: '18px',
	lineHeight: '24px',
}
