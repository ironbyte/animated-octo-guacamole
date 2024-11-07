import { AppName } from '~/root'

export function Footer() {
	return (
		<footer className="container flex w-full shrink-0 flex-col justify-center gap-2 px-4 py-9 sm:flex-row md:px-6">
			<p className="text-muted-foreground text-sm">{`© 2024 ${AppName}. All rights reserved.`}</p>
		</footer>
	)
}
