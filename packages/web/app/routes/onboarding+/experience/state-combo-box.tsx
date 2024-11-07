import * as React from 'react'
import { useInputControl, type FieldMetadata } from '@conform-to/react'

import { Combobox, type ComboboxOption } from '~/components/combobox'
import { ErrorList, type ListOfErrors } from '~/components/error-list'

type Props = {
	options: string[]
	meta: FieldMetadata<string>
	errors?: ListOfErrors
}

const OPTIONS: ComboboxOption[] = []

export function StateComboBox(props: Props) {
	const input = useInputControl(props.meta)
	const id = React.useId()
	const errorId = props.errors?.length ? `${id}-error` : undefined

	const [, setNewOption] = React.useState<{
		label: string
		value: string
	} | null>(null)

	const newOptions: ComboboxOption[] = Array.isArray(props.options)
		? props.options.map((i) => ({
				label: i,
				value: i,
			}))
		: []

	return (
		<div>
			<Combobox
				labelProps={{
					children: 'State',
				}}
				className="w-full"
				options={[...OPTIONS, ...newOptions]}
				placeholder="Select State*"
				selected={input.value ?? ''} // string or array
				onChange={(value) => {
					if (Array.isArray(value)) return

					input.change(value)
				}}
				onCreate={(value: string) => {
					input.change(undefined)

					const newOption = {
						label: `${value} - New`,
						value,
					}
					setNewOption(newOption)
					input.change(newOption.value)

					OPTIONS.unshift(newOption)
				}}
			/>
			<div className="text-foreground-destructive px-4 pb-3 pt-1">
				{errorId ? <ErrorList id={errorId} errors={props.errors} /> : null}
			</div>
		</div>
	)
}
