import { z } from 'zod'

export const UsernameSchema = z
	.string()
	.trim()
	.toLowerCase()
	.min(3, { message: 'Username is too short' })
	.max(20, { message: 'Username is too long' })
	.regex(/^[a-zA-Z0-9_]+$/, {
		message: 'Username can only include letters, numbers, and underscores',
	})

export const PasswordSchema = z
	.string({
		required_error: 'Password is required',
	})
	.min(8, { message: 'Password must be at least 8 characters' })
	.max(100, { message: 'Password is too long!' })

export const EmailSchema = z
	.string({
		required_error: 'Email is required',
	})
	.email({ message: 'Email is invalid' })
	.min(3, { message: 'Email is too short' })
	.max(100, { message: 'Email is too long' })
	.transform((value) => value.toLowerCase())
