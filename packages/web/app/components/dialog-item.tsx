import * as React from 'react'
import { type DropdownMenuItemProps } from '@radix-ui/react-dropdown-menu'

import { Dialog, DialogContent, DialogTrigger } from '~/components/ui/dialog'
import { DropdownMenuItem } from '~/components/ui/dropdown-menu'

type DialogItemProps = Omit<
	DropdownMenuItemProps,
	'onSelect' | 'onOpenChange'
> & {
	triggerChildren: React.ReactNode
	children: React.ReactNode
	onSelect?: () => void
	onOpenChange?: (open: boolean) => void
}

export const DialogItem = React.forwardRef<HTMLDivElement, DialogItemProps>(
	(props, forwardedRef) => {
		const { triggerChildren, children, onSelect, onOpenChange, ...itemProps } =
			props

		return (
			<Dialog onOpenChange={onOpenChange}>
				{/**
				 * !Dialog Trigger
				 */}
				<DialogTrigger asChild>
					<DropdownMenuItem
						{...itemProps}
						ref={forwardedRef}
						className="cursor-pointer"
						onSelect={(event) => {
							event.preventDefault()
							onSelect && onSelect()
						}}
					>
						{triggerChildren}
					</DropdownMenuItem>
				</DialogTrigger>
				{/**
				 * !Dialog Content
				 */}
				<DialogContent
					className="max-w-4xl"
					onInteractOutside={(e) => {
						e.preventDefault()
					}}
				>
					{children}
				</DialogContent>
			</Dialog>
		)
	},
)
