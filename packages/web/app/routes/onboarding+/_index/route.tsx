import { redirect, type LoaderFunctionArgs } from '@remix-run/node'

export async function loader({}: LoaderFunctionArgs) {
	// todo: Determine which incomplete onboarding page the user should be redirected to
	const onboardingIndex = 'academy'

	return redirect(`/onboarding/${onboardingIndex}`)
}
