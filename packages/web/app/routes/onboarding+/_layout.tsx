import { json, redirect, type LoaderFunctionArgs } from '@remix-run/node'
import { Outlet, useLoaderData } from '@remix-run/react'
import {
	CheckCircle,
	ClockIcon,
	CreditCardIcon,
	ListCheck,
	TriangleAlert,
} from 'lucide-react'

import { Header } from '~/components/header'
import { Sidebar, type SidebarNavLinkItem } from '~/components/sidebar'
import { Alert, AlertTitle } from '~/components/ui/alert'
import { requireUserSession } from '~/lib/auth.server'
import { ROUTE_PATH as ACADEMY_ROUTE_PATH } from './academy/route'
import { ROUTE_PATH as CULTURE_ROUTE_PATH } from './culture/route'
import { ROUTE_PATH as MEDIA_ROUTE_PATH } from './cv-and-publications/route'
import { ROUTE_PATH as EXPERIENCE_ROUTE_PATH } from './experience/route'
import { ROUTE_PATH as PAYMENT_ROUTE_PATH } from './payment/route'
import {
	checkAcademyCompletion,
	checkAvailabilitySlotsCompletion,
	checkCultureCompletion,
	checkPublicationCompletion,
	checkVideoCvCompletion,
	checkWorkExperienceCompletion,
	getListOfCompanies,
	getOnboardingInfoByUserId,
} from './queries.server'
import { ROUTE_PATH as REVIEW_ROUTE_PATH } from './review/route'
import { ROUTE_PATH as INTERVIEW_ROUTE_PATH } from './screening/route'
import { ROUTE_PATH as VIDEO_RESUME_ROUTE_PATH } from './video-resume/route'

// Todo: Optimization
// !Note: this loader always gets run whenever a route including onboarding is loaded
// !Use getDomainPath to get an actual pathname
export async function loader({ request }: LoaderFunctionArgs) {
	const userSession = await requireUserSession(request)

	if (userSession.user.isOnboarded || userSession.user.role !== 'job_seeker') {
		return redirect('/dashboard')
	}

	const [companiesList, jobSeekerData] = await Promise.all([
		getListOfCompanies(),
		getOnboardingInfoByUserId({ userId: userSession.user.id }),
	])

	if (!jobSeekerData?.id) {
		return json({
			jobSeekerData,
			companiesList,

			academyCompletion: null,
			cultureCompletion: null,
			videoCvCompletion: null,
			publicationCompletion: null,
			availabilitySlotsCompletion: null,
			workExperienceCompletion: null,
			skillsCompletion: null,
		})
	}

	const [
		academyCompletion,
		cultureCompletion,
		videoCvCompletion,
		publicationCompletion,
		workExperienceCompletion,
		availabilitySlotsCompletion,
	] = await Promise.all([
		checkAcademyCompletion(jobSeekerData.id),
		checkCultureCompletion(jobSeekerData.id),
		checkVideoCvCompletion(jobSeekerData.id),
		checkPublicationCompletion(jobSeekerData.id),
		checkWorkExperienceCompletion(jobSeekerData.id),
		checkAvailabilitySlotsCompletion(jobSeekerData.id),
	])

	return json({
		jobSeekerData,
		companiesList,
		academyCompletion,
		cultureCompletion,
		videoCvCompletion,
		publicationCompletion,
		availabilitySlotsCompletion,
		workExperienceCompletion,
		hasAccess: userSession.user.hasAccess ?? false,
	})
}

const NOTICE =
	'Please fill out the following forms to complete your onboarding process.'

export default function Onboarding() {
	const loaderData = useLoaderData<typeof loader>()

	const {
		academyCompletion,
		cultureCompletion,
		videoCvCompletion,
		publicationCompletion,
		workExperienceCompletion,
		availabilitySlotsCompletion,
		hasAccess,
	} = loaderData

	const ONBOARDING_NAVLINKS_LIST: SidebarNavLinkItem[] = [
		{
			label: 'Academic',
			to: ACADEMY_ROUTE_PATH,
			icon: academyCompletion?.isComplete ? (
				<CheckCircle className="mr-2 h-4 w-4 text-green-700 dark:text-green-500" />
			) : (
				<ClockIcon className="mr-2 h-4 w-4 text-yellow-700 dark:text-yellow-500" />
			),
		},
		{
			label: 'Experience',
			to: EXPERIENCE_ROUTE_PATH,
			icon: workExperienceCompletion?.isComplete ? (
				<CheckCircle className="mr-2 h-4 w-4 text-green-700 dark:text-green-500" />
			) : (
				<ClockIcon className="mr-2 h-4 w-4 text-yellow-700 dark:text-yellow-500" />
			),
		},
		{
			label: 'Culture',
			to: CULTURE_ROUTE_PATH,
			icon: cultureCompletion?.isComplete ? (
				<CheckCircle className="mr-2 h-4 w-4 text-green-700 dark:text-green-500" />
			) : (
				<ClockIcon className="mr-2 h-4 w-4 text-yellow-700 dark:text-yellow-500" />
			),
		},
		{
			label: 'CV & Publications',
			to: MEDIA_ROUTE_PATH,
			icon: publicationCompletion?.isComplete ? (
				<CheckCircle className="mr-2 h-4 w-4 text-green-700 dark:text-green-500" />
			) : (
				<ClockIcon className="mr-2 h-4 w-4 text-yellow-700 dark:text-yellow-500" />
			),
		},

		{
			label: 'Video Resume',
			to: VIDEO_RESUME_ROUTE_PATH,
			icon: videoCvCompletion?.isComplete ? (
				<CheckCircle className="mr-2 h-4 w-4 text-green-700 dark:text-green-500" />
			) : (
				<ClockIcon className="mr-2 h-4 w-4 text-yellow-700 dark:text-yellow-500" />
			),
		},
		{
			label: 'Screening',
			to: INTERVIEW_ROUTE_PATH,
			icon: availabilitySlotsCompletion?.isComplete ? (
				<CheckCircle className="mr-2 h-4 w-4 text-green-700 dark:text-green-500" />
			) : (
				<ClockIcon className="mr-2 h-4 w-4 text-yellow-700 dark:text-yellow-500" />
			),
		},

		// hasAccess
		{
			label: 'Payment',
			to: PAYMENT_ROUTE_PATH,
			icon: hasAccess ? (
				<CheckCircle className="mr-2 h-4 w-4 text-green-700 dark:text-green-500" />
			) : (
				<CreditCardIcon className="mr-2 h-4 w-4 text-yellow-700 dark:text-yellow-500" />
			),
		},
		{
			label: 'Review',
			to: REVIEW_ROUTE_PATH,
			icon: <ListCheck className="mr-2 h-4 w-4" />,
		},
	]

	return (
		<div className="bg-background flex h-screen flex-col">
			{/* Header */}
			<Header sidebarNavlinkItems={ONBOARDING_NAVLINKS_LIST} />

			<div className="flex flex-1 overflow-hidden">
				{/* Permanent sidebar for larger screens */}
				<Sidebar navlinkItems={ONBOARDING_NAVLINKS_LIST} />

				{/* Main content area */}
				<main className="bg-muted/40 h-full flex-1 overflow-y-auto overflow-x-hidden border-2">
					<div className="sm:px-6 lg:px-8">
						<Alert className="my-4" variant="alt">
							<TriangleAlert className="h-4 w-4" />
							<AlertTitle>{NOTICE}</AlertTitle>
						</Alert>
						<Outlet />
					</div>
				</main>
			</div>
		</div>
	)
}
