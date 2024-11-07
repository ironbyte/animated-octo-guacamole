import bcrypt from 'bcryptjs'

export async function generatePasswordHash(password: string): Promise<string> {
	const hash = await bcrypt.hash(password, 10)
	return hash
}
