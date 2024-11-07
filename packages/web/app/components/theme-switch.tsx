import { useFetcher, useFetchers } from '@remix-run/react'
import { getFormProps, useForm } from '@conform-to/react'
import { parseWithZod } from '@conform-to/zod'
import { MoonStarIcon, SunIcon } from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import { z } from 'zod'

import { type action as rootAction } from '~/root'
import { useRequestInfo } from '../lib/utils'

export const ThemeFormSchema = z.object({
	theme: z.enum(['light', 'dark']),
})

type Theme = 'light' | 'dark'

type ThemeSwitchProps = {
	userPreferences: Theme | null
}

/**
 * If the user's changing their theme mode preference, this will return the
 * value it's being changed to.
 */
export function useOptimisticThemeMode() {
	const fetchers = useFetchers()
	const themeFetcher = fetchers.find((f) => f.formAction === '/')

	if (themeFetcher && themeFetcher.formData) {
		const submission = parseWithZod(themeFetcher.formData, {
			schema: ThemeFormSchema,
		})

		if (submission.status === 'success') {
			return submission.value.theme
		}
	}
}

export function useTheme() {
	const requestInfo = useRequestInfo()
	const optimisticMode = useOptimisticThemeMode()

	if (optimisticMode) {
		return optimisticMode
	}

	return requestInfo?.session?.theme
}

export function ThemeSwitch({ userPreferences }: ThemeSwitchProps) {
	const fetcher = useFetcher<typeof rootAction>()

	const [form] = useForm({
		id: 'theme-switch',
	})

	const optimisticMode = useOptimisticThemeMode()

	const mode = optimisticMode ?? userPreferences ?? 'dark'
	const nextMode =
		mode === 'light' ? 'dark' : mode === 'dark' ? 'light' : 'dark'

	const modeLabel = {
		light: (
			<div>
				<SunIcon />
				<span className="sr-only">Light</span>
			</div>
		),
		dark: (
			<div>
				<MoonStarIcon />
				<span className="sr-only">Light</span>
			</div>
		),
	}

	return (
		<fetcher.Form method="POST" action="/" {...getFormProps(form)}>
			<input type="hidden" name="theme" value={nextMode} />
			<button
				type="submit"
				className={twMerge(
					'flex cursor-pointer items-center justify-center transition',
					mode === 'light'
						? 'text-slate-800 hover:text-slate-800/80'
						: 'text-slate-400 hover:text-slate-400/80',
				)}
			>
				{modeLabel[mode]}
			</button>
		</fetcher.Form>
	)
}
