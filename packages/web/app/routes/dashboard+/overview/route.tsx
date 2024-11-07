import {
	json,
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
} from '@remix-run/node'
import { db } from '@nautikos/core/db'
import { parseWithZod } from '@conform-to/zod'

import { requireUserSession } from '~/lib/auth.server'
import { createToastHeaders } from '~/lib/toast.server'
import { useUser } from '~/lib/utils'
import { inviteUserSchema } from '../invitations/validation.schema'
import { AdminOverview } from './admin'
import { JobCandidateOverview } from './job-candidate'

export const ROUTE_PATH = '/dashboard/overview'

export enum OverviewActionIntent {
	InviteUser = 'invite-user',
}

async function inviteUser({
	formData,
	userId,
}: {
	formData: FormData
	userId: string
}) {
	const submission = await parseWithZod(formData, {
		schema: inviteUserSchema,
	})

	if (submission.status !== 'success') {
		return json(
			{ result: submission.reply() },
			{ status: submission.status === 'error' ? 400 : 200 },
		)
	}

	const { value } = submission

	return json(
		{
			result: submission.reply({
				resetForm: true,
			}),
		},
		{
			headers: await createToastHeaders({
				type: 'success',
				title: 'Success!',
				description: `Sent invite to ${value.email} successfully`,
			}),
		},
	)
}

export async function action({ request }: ActionFunctionArgs) {
	const userSession = await requireUserSession(request)
	const formData = await request.formData()
	const intent = formData.get('intent')

	switch (intent) {
		case OverviewActionIntent.InviteUser: {
			return inviteUser({
				formData,
				userId: userSession.user.id,
			})
		}

		default: {
			throw new Response(`Invalid intent "${intent}"`, { status: 400 })
		}
	}
}

export async function loader({ request }: LoaderFunctionArgs) {
	const { user } = await requireUserSession(request)

	switch (user.role) {
		case 'admin': {
			const users = await db.query.users.findMany({
				where: (users, { eq, or }) => {
					return or(eq(users.role, 'job_seeker'), eq(users.role, 'org_member'))
				},
				with: {
					profile: true,
				},
				orderBy: (users, { desc }) => {
					return desc(users.timeCreated)
				},
			})

			return json({
				users,
			})
		}

		case 'job_seeker': {
			return json({
				users: [],
			})
		}

		case 'org_member': {
			return json({
				users: [],
			})
		}

		default: {
			return json({
				users: [],
			})
		}
	}
}

export default function Dashboard() {
	const user = useUser()

	switch (user.role) {
		case 'admin': {
			return <AdminOverview />
		}
		case 'job_seeker': {
			return <JobCandidateOverview />
		}
		case 'org_member': {
			return <div>Organization WIP</div>
		}

		default: {
			return <div>You are not authorized to view this page</div>
		}
	}
}
