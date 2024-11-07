import { generatePasswordHash } from '../../utils'
import {
	passwords,
	userProfiles,
	users,
	type InsertPasswordModel,
	type InsertUserModel,
	type InsertUserProfileModel,
} from '../schema'
import { type Transaction } from '../transaction'

const SUPER_ADMIN_USER_EMAIL_ADDRESS = 'super-admin-user-122@shippingjobs.ae'
const PASSWORD = 'hellowolf122!'
const HASH = await generatePasswordHash(PASSWORD)

const generateUserAccount = ({
	email,
	firstName,
	lastName,
	role,
}: {
	firstName: string
	lastName: string
} & InsertUserModel): {
	user: InsertUserModel
	userProfile: InsertUserProfileModel
} => {
	return {
		user: {
			isVerified: true,
			role: role,
			email,
		},
		userProfile: {
			firstName,
			lastName,
			mobile: 'N/A',
		},
	}
}

const superAdminUser = generateUserAccount({
	email: SUPER_ADMIN_USER_EMAIL_ADDRESS,
	firstName: 'John',
	lastName: 'Wick',
	role: 'admin',
	isVerified: true,
	isOnboarded: true,
})

export async function seedUsers(trx: Transaction) {
	const insertedUsers = await trx
		.insert(users)
		.values([superAdminUser.user])
		.onConflictDoNothing({
			target: users.email,
		})
		.returning({
			insertedId: users.id,
			email: users.email,
		})

	if (insertedUsers.length > 0) {
		const passwordRows: InsertPasswordModel[] = insertedUsers
			.filter((user) => user.insertedId !== undefined)
			.map((user) => ({
				userId: user.insertedId!,
				hash: HASH,
			}))

		const profiles: InsertUserProfileModel[] = insertedUsers
			.filter((user) => user.insertedId !== undefined)
			.map((user) => {
				const matchingUser = [superAdminUser].find(
					(u) => u.user.email === user.email,
				)
				return {
					...matchingUser!.userProfile,
					userId: user.insertedId!,
				}
			})

		await Promise.all([
			trx.insert(userProfiles).values(profiles),
			trx.insert(passwords).values(passwordRows).onConflictDoNothing({
				target: passwords.userId,
			}),
		])
	}
}
