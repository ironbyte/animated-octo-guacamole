import { type ActionFunctionArgs } from '@remix-run/node'
import { Form, Link, type ShouldRevalidateFunctionArgs } from '@remix-run/react'
import { db } from '@nautikos/core/db'
import { users } from '@nautikos/core/schema/users'
import { eq } from 'drizzle-orm'
import { CheckCircle, ClockIcon } from 'lucide-react'

import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { requireUserSession } from '~/lib/auth.server'
import { useOnboardingCompletionStatus } from '~/lib/utils'
import { ROUTE_PATH as ACADEMY_ROUTE_PATH } from '../academy/route'
import { ROUTE_PATH as CULTURE_ROUTE_PATH } from '../culture/route'
import { ROUTE_PATH as MEDIA_ROUTE_PATH } from '../cv-and-publications/route'
import { ROUTE_PATH as EXPERIENCE_ROUTE_PATH } from '../experience/route'
import { ROUTE_PATH as PAYMENT_ROUTE_PATH } from '../payment/route'
import { ROUTE_PATH as INTERVIEW_ROUTE_PATH } from '../screening/route'
import { ROUTE_PATH as VIDEO_RESUME_ROUTE_PATH } from '../video-resume/route'

export const ROUTE_PATH = '/onboarding/review'

export enum ReviewActionIntent {
	completeOnboarding = 'complete-onboarding',
}

export async function action({ request }: ActionFunctionArgs) {
	const userSession = await requireUserSession(request)
	// const intent = formData.get('intent')

	await db
		.update(users)
		.set({
			isOnboarded: true,
		})
		.where(eq(users.id, userSession.user.id))

	return { ok: true }
}

export function shouldRevalidate({
	actionResult,
	defaultShouldRevalidate,
}: ShouldRevalidateFunctionArgs) {
	if (actionResult?.ok) {
		return false
	}
	return defaultShouldRevalidate
}

// TODO: MAKE THIS MORE ROBUST
export default function Review() {
	const onboardingCompletionStatus = useOnboardingCompletionStatus()

	const allCompletions =
		onboardingCompletionStatus.academyCompletion?.isComplete &&
		onboardingCompletionStatus.cultureCompletion?.isComplete &&
		onboardingCompletionStatus.videoCvCompletion?.isComplete &&
		onboardingCompletionStatus.publicationCompletion?.isComplete &&
		onboardingCompletionStatus.workExperienceCompletion?.isComplete &&
		onboardingCompletionStatus.availabilitySlotsCompletion?.isComplete

	const CHECKLIST = [
		{
			number: '01',
			title: 'Academy',
			to: ACADEMY_ROUTE_PATH,
			completionStatus:
				onboardingCompletionStatus.academyCompletion?.isComplete,
		},
		{
			number: '02',
			title: 'Work experience',
			to: EXPERIENCE_ROUTE_PATH,
			completionStatus:
				onboardingCompletionStatus.workExperienceCompletion?.isComplete,
		},
		{
			number: '03',
			title: 'Publications + CV',
			to: MEDIA_ROUTE_PATH,
			completionStatus:
				onboardingCompletionStatus.publicationCompletion?.isComplete,
		},
		{
			number: '04',
			title: 'Culture',
			to: CULTURE_ROUTE_PATH,
			completionStatus:
				onboardingCompletionStatus.cultureCompletion?.isComplete,
		},

		{
			number: '05',
			title: 'Video CV',
			to: VIDEO_RESUME_ROUTE_PATH,
			completionStatus:
				onboardingCompletionStatus.videoCvCompletion?.isComplete,
		},
		{
			number: '06',
			title: 'Interview',
			to: INTERVIEW_ROUTE_PATH,
			completionStatus:
				onboardingCompletionStatus?.availabilitySlotsCompletion?.isComplete,
		},
		{
			number: '07',
			title: 'Payment',
			to: PAYMENT_ROUTE_PATH,
			completionStatus: false,
		},
	]

	return (
		<Card className="w-full">
			<CardHeader>
				<CardTitle className="mb-8 text-center text-4xl">Almost done</CardTitle>
			</CardHeader>
			<CardContent>
				<h2 className="text-muted-foreground mb-12 text-center text-xl">
					Please check your progress and make sure you have completed all the
					sections.
				</h2>
				<div className="mx-auto max-w-4xl">
					<nav className="mb-12 space-y-4 border">
						{CHECKLIST.map((item, index) => (
							<Link
								key={index}
								to={item.to}
								className="hover:bg-secondary/80 flex items-center rounded-lg p-4 transition-colors dark:border-gray-700"
							>
								<span className="bg-primary text-primary-foreground mr-4 flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium">
									{item.number}
								</span>
								<span className="text-lg font-medium">{item.title}</span>

								{item.completionStatus ? (
									<CheckCircle
										size={24}
										className="ml-auto text-green-700 dark:text-green-500"
									/>
								) : (
									<ClockIcon
										size={24}
										className="ml-auto text-yellow-700 dark:text-yellow-500"
									/>
								)}
							</Link>
						))}
					</nav>
					<div className="text-center">
						<Form method="POST">
							<Button
								size="lg"
								disabled={!allCompletions}
								className="w-full sm:w-auto"
								name="intent"
								value={ReviewActionIntent.completeOnboarding}
							>
								Complete your Onboarding
							</Button>
						</Form>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}
