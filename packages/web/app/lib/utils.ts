import { type SerializeFrom } from '@remix-run/node'
import { useRouteLoaderData } from '@remix-run/react'

import { type loader as rootLoader } from '~/root'
import { type loader as onboardingLoader } from '~/routes/onboarding+/_layout'

function isUser(user: any): user is SerializeFrom<typeof rootLoader>['user'] {
	return user && typeof user === 'object' && typeof user.id === 'string'
}

export function useOptionalUser() {
	const data = useRouteLoaderData<typeof rootLoader>('root')
	if (!data || !isUser(data.user)) {
		return undefined
	}
	return data.user
}

export function useUser() {
	const maybeUser = useOptionalUser()
	if (!maybeUser) {
		throw new Error(
			'No user found in root loader, but user is required by useUser. If user is optional, try useOptionalUser instead.',
		)
	}
	return maybeUser
}

export function getDomainPathname(request: Request) {
	const pathname = new URL(request.url).pathname
	if (!pathname) return null
	return pathname
}

export function useRequestInfo() {
	const data = useRouteLoaderData('root') as SerializeFrom<typeof rootLoader>

	return data?.requestInfo
}

export function useOnboardingInfo() {
	const data = useRouteLoaderData(
		'routes/onboarding+/_layout',
	) as SerializeFrom<typeof onboardingLoader>

	return {
		...data?.jobSeekerData,
		hasAccess: data?.hasAccess,
	}
}

export function useListOfCompaniesData() {
	const data = useRouteLoaderData(
		'routes/onboarding+/_layout',
	) as SerializeFrom<typeof onboardingLoader>

	return data?.companiesList
}

export function useOnboardingCompletionStatus() {
	const data = useRouteLoaderData(
		'routes/onboarding+/_layout',
	) as SerializeFrom<typeof onboardingLoader>

	return {
		academyCompletion: data?.academyCompletion,
		cultureCompletion: data?.cultureCompletion,
		videoCvCompletion: data?.videoCvCompletion,
		publicationCompletion: data?.publicationCompletion,
		workExperienceCompletion: data?.workExperienceCompletion,
		availabilitySlotsCompletion: data?.availabilitySlotsCompletion,
	}
}
