import { json } from '@remix-run/node'
import { Outlet } from '@remix-run/react'

export const ROUTE_PATH = '/' as const

export async function loader() {
	return json({})
}

export default function Home() {
	return <Outlet />
}
