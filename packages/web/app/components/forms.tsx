import React, {
	useId,
	useRef,
	type ComponentProps,
	type ElementRef,
} from 'react'
import {
	unstable_Control as Control,
	unstable_useControl as useControl,
	useInputControl,
	type FieldMetadata,
} from '@conform-to/react'
import { cva, type VariantProps } from 'class-variance-authority'
import { REGEXP_ONLY_DIGITS_AND_CHARS, type OTPInputProps } from 'input-otp'
import {
	CheckIcon,
	ChevronDown,
	WandSparkles,
	XCircle,
	XIcon,
} from 'lucide-react'

import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
} from '~/components/ui/command'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '~/components/ui/popover'
import { RadioGroup, RadioGroupItem } from '~/components/ui/radio-group'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '~/components/ui/select'
import { Separator } from '~/components/ui/separator'
import { cn } from '~/utils'
import { ErrorList, type ListOfErrors } from './error-list.tsx'
import { Checkbox, type CheckboxProps } from './ui/checkbox.tsx'
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSeparator,
	InputOTPSlot,
} from './ui/input-otp.tsx'
import { Input } from './ui/input.tsx'
import { Label } from './ui/label.tsx'
import { Textarea } from './ui/textarea.tsx'

export function Field({
	labelProps,
	inputProps,
	errors,
	className,
}: {
	labelProps: React.LabelHTMLAttributes<HTMLLabelElement>
	inputProps: React.InputHTMLAttributes<HTMLInputElement>
	errors?: ListOfErrors
	className?: string
}) {
	const fallbackId = useId()
	const id = inputProps.id ?? fallbackId
	const errorId = errors?.length ? `${id}-error` : undefined
	return (
		<div className={className}>
			<Label htmlFor={id} {...labelProps} />
			<Input
				id={id}
				aria-invalid={errorId ? true : undefined}
				aria-describedby={errorId}
				{...inputProps}
			/>
			<div className="text-foreground-destructive min-h-[32px] px-4 pb-3 pt-1">
				{errorId ? <ErrorList id={errorId} errors={errors} /> : null}
			</div>
		</div>
	)
}

export function OTPField({
	labelProps,
	inputProps,
	errors,
	className,
}: {
	labelProps: React.LabelHTMLAttributes<HTMLLabelElement>
	inputProps: Partial<OTPInputProps & { render: never }>
	errors?: ListOfErrors
	className?: string
}) {
	const fallbackId = useId()
	const id = inputProps.id ?? fallbackId
	const errorId = errors?.length ? `${id}-error` : undefined
	return (
		<div className={className}>
			<Label htmlFor={id} {...labelProps} />
			<InputOTP
				pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
				maxLength={6}
				id={id}
				aria-invalid={errorId ? true : undefined}
				aria-describedby={errorId}
				{...inputProps}
			>
				<InputOTPGroup>
					<InputOTPSlot index={0} />
					<InputOTPSlot index={1} />
					<InputOTPSlot index={2} />
				</InputOTPGroup>
				<InputOTPSeparator />
				<InputOTPGroup>
					<InputOTPSlot index={3} />
					<InputOTPSlot index={4} />
					<InputOTPSlot index={5} />
				</InputOTPGroup>
			</InputOTP>
			<div className="min-h-[32px] px-4 pb-3 pt-1">
				{errorId ? <ErrorList id={errorId} errors={errors} /> : null}
			</div>
		</div>
	)
}

export function TextareaField({
	labelProps,
	textareaProps,
	errors,
	className,
}: {
	labelProps: React.LabelHTMLAttributes<HTMLLabelElement>
	textareaProps: React.TextareaHTMLAttributes<HTMLTextAreaElement>
	errors?: ListOfErrors
	className?: string
}) {
	const fallbackId = useId()
	const id = textareaProps.id ?? textareaProps.name ?? fallbackId
	const errorId = errors?.length ? `${id}-error` : undefined
	return (
		<div className={className}>
			<Label htmlFor={id} {...labelProps} />
			<Textarea
				id={id}
				aria-invalid={errorId ? true : undefined}
				aria-describedby={errorId}
				{...textareaProps}
			/>
			<div className="text-foreground-destructive min-h-[32px] px-4 pb-3 pt-1">
				{errorId ? <ErrorList id={errorId} errors={errors} /> : null}
			</div>
		</div>
	)
}

export function CheckboxField({
	labelProps,
	buttonProps,
	errors,
	className,
}: {
	labelProps: JSX.IntrinsicElements['label']
	buttonProps: CheckboxProps & {
		name: string
		form: string
		value?: string
	}
	errors?: ListOfErrors
	className?: string
}) {
	const { key, defaultChecked, ...checkboxProps } = buttonProps
	const fallbackId = useId()
	const checkedValue = buttonProps.value ?? 'on'
	const input = useInputControl({
		key,
		name: buttonProps.name,
		formId: buttonProps.form,
		initialValue: defaultChecked ? checkedValue : undefined,
	})
	const id = buttonProps.id ?? fallbackId
	const errorId = errors?.length ? `${id}-error` : undefined

	return (
		<div className={className}>
			<div className="flex items-center gap-2">
				<Checkbox
					{...checkboxProps}
					id={id}
					aria-invalid={errorId ? true : undefined}
					aria-describedby={errorId}
					checked={input.value === checkedValue}
					onCheckedChange={(state) => {
						input.change(state.valueOf() ? checkedValue : '')
						buttonProps.onCheckedChange?.(state)
					}}
					onFocus={(event) => {
						input.focus()
						buttonProps.onFocus?.(event)
					}}
					onBlur={(event) => {
						input.blur()
						buttonProps.onBlur?.(event)
					}}
					type="button"
				/>
				<label
					htmlFor={id}
					{...labelProps}
					className="text-body-xs self-center"
				/>
			</div>
			<div className="text-foreground-destructive px-4 pb-3 pt-1">
				{errorId ? <ErrorList id={errorId} errors={errors} /> : null}
			</div>
		</div>
	)
}

export const SelectField = ({
	labelProps,
	meta,
	items,
	errors,
	className,
	placeholder,
	...props
}: {
	labelProps: React.LabelHTMLAttributes<HTMLLabelElement>
	meta: FieldMetadata<string>
	items: Array<{ name: string; value: string }>
	errors?: ListOfErrors
	placeholder: string
	className?: string
} & ComponentProps<typeof Select>) => {
	const selectRef = useRef<ElementRef<typeof SelectTrigger>>(null)
	const control = useControl(meta)
	const id = useId()
	const errorId = errors?.length ? `${id}-error` : undefined

	return (
		<div>
			<Label htmlFor={id} {...labelProps} />

			<select
				id={id}
				name={meta.name}
				defaultValue={meta.initialValue ?? ''}
				className="sr-only"
				ref={control.register}
				aria-hidden
				tabIndex={-1}
				onFocus={() => {
					selectRef.current?.focus()
				}}
			>
				<option value="" />
				{items.map((option) => (
					<option key={option.value} value={option.value} />
				))}
			</select>

			<Select
				{...props}
				value={control.value ?? ''}
				onValueChange={control.change}
				onOpenChange={(open) => {
					if (!open) {
						control.blur()
					}
				}}
			>
				<SelectTrigger className={className}>
					<SelectValue placeholder={placeholder} />
				</SelectTrigger>
				<SelectContent>
					{items.map((item) => {
						return (
							<SelectItem key={item.value} value={item.value}>
								{item.name}
							</SelectItem>
						)
					})}
				</SelectContent>
			</Select>
			<div className="text-destructive-foreground min-h-[32px] px-4 pb-3 pt-1">
				{errorId ? <ErrorList id={errorId} errors={errors} /> : null}
			</div>
		</div>
	)
}

export function RadioGroupField({
	meta,
	items,
	errors,
	labelProps,
}: {
	meta: FieldMetadata<string>
	items: Array<{ value: string; label: string }>
	errors?: ListOfErrors
	labelProps: React.LabelHTMLAttributes<HTMLLabelElement>
}) {
	const radioGroupRef = useRef<ElementRef<typeof RadioGroup>>(null)
	const control = useControl(meta)
	const id = useId()
	const errorId = errors?.length ? `${id}-error` : undefined

	return (
		<>
			<Label htmlFor={id} {...labelProps} />

			<input
				ref={control.register}
				name={meta.name}
				defaultValue={meta.initialValue}
				tabIndex={-1}
				className="sr-only"
				onFocus={() => {
					radioGroupRef.current?.focus()
				}}
			/>
			<RadioGroup
				ref={radioGroupRef}
				value={control.value ?? ''}
				onValueChange={control.change}
				onBlur={control.blur}
				className="mt-2"
			>
				{items.map((item) => {
					return (
						<div className="flex items-center space-x-2" key={item.value}>
							<RadioGroupItem
								value={item.value}
								id={`${meta.id}-${item.value}`}
							/>
							<Label htmlFor={`${meta.id}-${item.value}`} className="text-sm">
								{item.label}
							</Label>
						</div>
					)
				})}
			</RadioGroup>
			<div className="text-destructive-foreground min-h-[32px] px-4 pb-3 pt-1">
				{errorId ? <ErrorList id={errorId} errors={errors} /> : null}
			</div>
		</>
	)
}

/**
 * Variants for the multi-select component to handle different styles.
 * Uses class-variance-authority (cva) to define different styles based on "variant" prop.
 */
const multiSelectVariants = cva(
	'm-1 transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-110 duration-300',
	{
		variants: {
			variant: {
				default:
					'border-foreground/10 text-foreground bg-card hover:bg-card/80',
				secondary:
					'border-foreground/10 bg-secondary text-secondary-foreground hover:bg-secondary/80',
				destructive:
					'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
				inverted: 'inverted',
			},
		},
		defaultVariants: {
			variant: 'default',
		},
	},
)

interface MultiSelectProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof multiSelectVariants> {
	meta: FieldMetadata<string[]>
	options: {
		label: string
		value: string
		icon?: React.ComponentType<{ className?: string }>
	}[]
	placeholder?: string
	animation?: number
	maxCount?: number
	modalPopover?: boolean
	asChild?: boolean
	className?: string
	labelProps: React.LabelHTMLAttributes<HTMLLabelElement>
	errors?: ListOfErrors
}

export const MultiSelectField = React.forwardRef<
	HTMLButtonElement,
	MultiSelectProps
>(
	(
		{
			meta,
			options,
			variant,
			placeholder = 'Select options',
			animation = 0,
			maxCount = 3,
			modalPopover = false,
			className,
			labelProps,
			errors,

			...props
		},
		ref,
	) => {
		const input = useInputControl(meta)
		const [isPopoverOpen, setIsPopoverOpen] = React.useState(false)
		const [isAnimating, setIsAnimating] = React.useState(false)
		const id = useId()
		const errorId = errors?.length ? `${id}-error` : undefined

		const handleInputKeyDown = (
			event: React.KeyboardEvent<HTMLInputElement>,
		) => {
			if (event.key === 'Enter') {
				setIsPopoverOpen(true)
			} else if (event.key === 'Backspace' && !event.currentTarget.value) {
				const newSelectedValues = [...(input.value ?? [])]
				newSelectedValues.pop()
				input.change(newSelectedValues)
			}
		}

		const toggleOption = (value: string) => {
			let currentValues: string[]

			if (Array.isArray(input.value)) {
				currentValues = input.value
			} else if (typeof input.value === 'string') {
				currentValues = [input.value]
			} else {
				currentValues = []
			}

			const newSelectedValues = currentValues.includes(value)
				? currentValues.filter((v) => v !== value)
				: [...currentValues, value]

			input.change(newSelectedValues)
		}

		const handleClear = () => {
			input.change([])
		}

		const handleTogglePopover = () => {
			setIsPopoverOpen((prev) => !prev)
		}

		const clearExtraOptions = () => {
			const newSelectedValues = (input.value ?? []).slice(0, maxCount)
			input.change(newSelectedValues)
		}

		const toggleAll = () => {
			if ((input.value?.length ?? 0) === options.length) {
				handleClear()
			} else {
				const allValues = options.map((option) => option.value)
				input.change(allValues)
			}
		}

		return (
			<div>
				<Label htmlFor={id} {...labelProps} />

				<Popover
					open={isPopoverOpen}
					onOpenChange={setIsPopoverOpen}
					modal={modalPopover}
				>
					<PopoverTrigger asChild>
						<Button
							ref={ref}
							{...props}
							onClick={handleTogglePopover}
							className={cn(
								'flex h-auto min-h-10 w-full items-center justify-between rounded-md border bg-inherit p-1 hover:bg-inherit',
								className,
							)}
						>
							{(input.value?.length ?? 0) > 0 ? (
								<div className="flex w-full items-center justify-between">
									<div className="flex flex-wrap items-center">
										{(Array.isArray(input.value)
											? input.value
											: typeof input.value === 'string'
												? [input.value]
												: []
										)
											.slice(0, maxCount)
											.map((value) => {
												const option = options.find((o) => o.value === value)
												const IconComponent = option?.icon
												return (
													<Badge
														key={value}
														className={cn(
															isAnimating ? 'animate-bounce' : '',
															multiSelectVariants({ variant }),
														)}
														style={{ animationDuration: `${animation}s` }}
													>
														{IconComponent && (
															<IconComponent className="mr-2 h-4 w-4" />
														)}
														{option?.label}
														<XCircle
															className="ml-2 h-4 w-4 cursor-pointer"
															onClick={(event) => {
																event.stopPropagation()
																toggleOption(value)
															}}
														/>
													</Badge>
												)
											})}
										{(input.value?.length ?? 0) > maxCount && (
											<Badge
												className={cn(
													'text-foreground border-foreground/1 bg-transparent hover:bg-transparent',
													isAnimating ? 'animate-bounce' : '',
													multiSelectVariants({ variant }),
												)}
												style={{ animationDuration: `${animation}s` }}
											>
												{`+ ${(input.value?.length ?? 0) - maxCount} more`}
												<XCircle
													className="ml-2 h-4 w-4 cursor-pointer"
													onClick={(event) => {
														event.stopPropagation()
														clearExtraOptions()
													}}
												/>
											</Badge>
										)}
									</div>
									<div className="flex items-center justify-between">
										<XIcon
											className="text-muted-foreground mx-2 h-4 cursor-pointer"
											onClick={(event) => {
												event.stopPropagation()
												handleClear()
											}}
										/>
										<Separator
											orientation="vertical"
											className="flex h-full min-h-6"
										/>
										<ChevronDown className="text-muted-foreground mx-2 h-4 cursor-pointer" />
									</div>
								</div>
							) : (
								<div className="mx-auto flex w-full items-center justify-between">
									<span className="text-muted-foreground mx-3 text-sm">
										{placeholder}
									</span>
									<ChevronDown className="text-muted-foreground mx-2 h-4 cursor-pointer" />
								</div>
							)}
						</Button>
					</PopoverTrigger>
					<PopoverContent
						className="w-auto p-0"
						align="start"
						onEscapeKeyDown={() => setIsPopoverOpen(false)}
					>
						<Command>
							<CommandInput
								placeholder="Search..."
								onKeyDown={handleInputKeyDown}
							/>
							<CommandList>
								<CommandEmpty>No results found.</CommandEmpty>
								<CommandGroup>
									<CommandItem
										key="all"
										onSelect={toggleAll}
										className="cursor-pointer"
									>
										<div
											className={cn(
												'border-primary mr-2 flex h-4 w-4 items-center justify-center rounded-sm border',
												(input.value?.length ?? 0) === options.length
													? 'bg-primary text-primary-foreground'
													: 'opacity-50 [&_svg]:invisible',
											)}
										>
											<CheckIcon className="h-4 w-4" />
										</div>
										<span>(Select All)</span>
									</CommandItem>
									{options.map((option) => {
										const isSelected =
											input.value?.includes(option.value) ?? false
										return (
											<CommandItem
												key={option.value}
												onSelect={() => toggleOption(option.value)}
												className="cursor-pointer"
											>
												<div
													className={cn(
														'border-primary mr-2 flex h-4 w-4 items-center justify-center rounded-sm border',
														isSelected
															? 'bg-primary text-primary-foreground'
															: 'opacity-50 [&_svg]:invisible',
													)}
												>
													<CheckIcon className="h-4 w-4" />
												</div>
												{option.icon && (
													<option.icon className="text-muted-foreground mr-2 h-4 w-4" />
												)}
												<span>{option.label}</span>
											</CommandItem>
										)
									})}
								</CommandGroup>
								<CommandSeparator />
								<CommandGroup>
									<div className="flex items-center justify-between">
										{(input.value?.length ?? 0) > 0 && (
											<>
												<CommandItem
													onSelect={handleClear}
													className="flex-1 cursor-pointer justify-center"
												>
													Clear
												</CommandItem>
												<Separator
													orientation="vertical"
													className="flex h-full min-h-6"
												/>
											</>
										)}
										<CommandSeparator />
										<CommandItem
											onSelect={() => setIsPopoverOpen(false)}
											className="flex-1 cursor-pointer justify-center"
										>
											Close
										</CommandItem>
									</div>
								</CommandGroup>
							</CommandList>
						</Command>
					</PopoverContent>
					{animation > 0 && (input.value?.length ?? 0) > 0 && (
						<WandSparkles
							className={cn(
								'text-foreground bg-background my-2 h-3 w-3 cursor-pointer',
								isAnimating ? '' : 'text-muted-foreground',
							)}
							onClick={() => setIsAnimating(!isAnimating)}
						/>
					)}
				</Popover>
				<div className="text-destructive-foreground min-h-[32px] px-4 pb-3 pt-1">
					{errorId ? <ErrorList id={errorId} errors={errors} /> : null}
				</div>
			</div>
		)
	},
)

MultiSelectField.displayName = 'MultiSelect'

export function CheckboxGroupField({
	meta,
	items,
	errors,
	labelProps,
}: {
	meta: FieldMetadata<string[]>
	items: Array<{ name: string; value: string }>
	errors?: ListOfErrors
	labelProps: React.LabelHTMLAttributes<HTMLLabelElement>
}) {
	const initialValue =
		typeof meta.initialValue === 'string'
			? [meta.initialValue]
			: (meta.initialValue ?? [])

	const id = useId()
	const errorId = errors?.length ? `${id}-error` : undefined

	return (
		<>
			<Label htmlFor={id} {...labelProps} />
			<div className="mt-2 flex flex-col gap-1">
				{items.map((item) => (
					<Control
						key={item.value}
						meta={{
							key: meta.key,
							initialValue: initialValue.find((v) => v == item.value)
								? [item.value]
								: '',
						}}
						render={(control) => (
							<div
								className="flex items-center gap-2"
								ref={(element) => {
									control.register(element?.querySelector('input'))
								}}
							>
								<Checkbox
									type="button"
									id={`${meta.name}-${item.value}`}
									name={meta.name}
									value={item.value}
									checked={control.value == item.value}
									onCheckedChange={(value) =>
										control.change(value.valueOf() ? item.value : '')
									}
									onBlur={control.blur}
									className="focus:ring-2 focus:ring-stone-950 focus:ring-offset-2"
								/>
								<label
									htmlFor={`${meta.name}-${item.value}`}
									className="text-sm"
								>
									{item.name}
								</label>
							</div>
						)}
					/>
				))}
			</div>

			<div className="text-destructive-foreground min-h-[32px] px-4 pb-3 pt-1">
				{errorId ? <ErrorList id={errorId} errors={errors} /> : null}
			</div>
		</>
	)
}
