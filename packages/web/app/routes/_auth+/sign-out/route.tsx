import { redirect, type ActionFunctionArgs } from '@remix-run/node'

import { destroyUserSession } from '~/lib/auth.server'

export async function action({ request }: ActionFunctionArgs) {
	return await destroyUserSession(request)
}

export async function loader() {
	return redirect('/')
}
