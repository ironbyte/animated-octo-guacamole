import {
	Anchor,
	Compass,
	FileText,
	Settings,
	Users,
	Users2Icon,
} from 'lucide-react'

import { type SidebarNavLinkItem } from '~/components/sidebar'
import { ROUTE_PATH as CANDIDATES_ROUTE_PATH } from './candidates/_index/route'
import { ROUTE_PATH as FIND_JOBS_ROUTE_PATH } from './find-jobs/_index/route'
import { ROUTE_PATH as INVITATIONS_ROUTE_PATH } from './invitations/route'
import { ROUTE_PATH as MODERATOR_ASSIGNMENTS } from './moderator-assignments/route'
import { ROUTE_PATH as MY_APPLICATIONS_ROUTE_PATH } from './my-applications/route'
import { ROUTE_PATH as DASHBOARD_OVERVIEW_ROUTE_PATH } from './overview/route'
import { ROUTE_PATH as SETTINGS_ROUTE_PATH } from './settings/index/route'
import { ROUTE_PATH as USER_SUBSCRIPTIONS_ROUTE_PATH } from './user-subscriptions/route'

export type UserRole = 'job_seeker' | 'admin' | 'org_member' | 'moderator'
export type RoleToNavLinksMap = Record<UserRole, SidebarNavLinkItem[]>

export function isValidUserRole(role: any): role is UserRole {
	return ['job_seeker', 'admin', 'org_member'].includes(role)
}

export const createNavLinksByRole = (): RoleToNavLinksMap => ({
	job_seeker: [
		{
			label: 'Overview',
			to: DASHBOARD_OVERVIEW_ROUTE_PATH,
			icon: <Compass className="mr-2 h-4 w-4" aria-label="Overview" />,
		},
		{
			label: 'Find Jobs',
			to: FIND_JOBS_ROUTE_PATH,
			icon: <Anchor className="mr-2 h-4 w-4" aria-label="Find Jobs" />,
		},
		{
			label: 'My Applications',
			to: MY_APPLICATIONS_ROUTE_PATH,
			icon: <FileText className="mr-2 h-4 w-4" aria-label="My Applications" />,
		},
		{
			label: 'Settings',
			to: SETTINGS_ROUTE_PATH,
			icon: <Settings className="mr-2 h-4 w-4" aria-label="Settings" />,
		},
	],
	admin: [
		{
			label: 'Overview',
			to: DASHBOARD_OVERVIEW_ROUTE_PATH,
			icon: <Compass className="mr-2 h-4 w-4" aria-label="Overview" />,
		},

		{
			label: 'Job Candidates',
			to: MODERATOR_ASSIGNMENTS,
			icon: (
				<Users className="mr-2 h-4 w-4" aria-label="Moderator Assignments" />
			),
		},
		{
			label: 'Invitations',
			to: INVITATIONS_ROUTE_PATH,
			icon: <Compass className="mr-2 h-4 w-4" aria-label="Invitations" />,
		},
		{
			label: 'Subscriptions',
			to: USER_SUBSCRIPTIONS_ROUTE_PATH,
			icon: <Compass className="mr-2 h-4 w-4" aria-label="Subscriptions" />,
		},

		{
			label: 'Settings',
			to: SETTINGS_ROUTE_PATH,
			icon: <Settings className="mr-2 h-4 w-4" aria-label="Settings" />,
		},
	],
	org_member: [
		{
			label: 'Settings',
			to: SETTINGS_ROUTE_PATH,
			icon: <Settings className="mr-2 h-4 w-4" aria-label="Settings" />,
		},
	],
	moderator: [
		{
			label: 'Job Candidates',
			to: CANDIDATES_ROUTE_PATH,
			icon: <Compass className="mr-2 h-4 w-4" aria-label="Review" />,
		},
		{
			label: 'Settings',
			to: SETTINGS_ROUTE_PATH,
			icon: <Settings className="mr-2 h-4 w-4" aria-label="Settings" />,
		},
	],
})

export const getNavLinksByRole = (role: UserRole) => {
	return createNavLinksByRole()[role]
}

// todo: this is a mess. Need to refactor this
export const getAllowedRoutesByRole = (role: UserRole) => {
	const navLinks = getNavLinksByRole(role)

	// convert to path patterns
	const routePatterns = navLinks.map((navLink) => navLink.to)

	if (role === 'moderator') {
		routePatterns.push('/dashboard/candidates/:id')
	}

	return routePatterns
}
