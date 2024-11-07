import { Badge } from './ui/badge'

interface BadgesListProps {
	items: string[]
	direction?: 'horizontal' | 'vertical'
	variant?: 'default' | 'outline' | 'secondary' | 'destructive'
}

export function BadgesList({
	items,
	direction = 'horizontal',
	variant = 'default',
}: BadgesListProps) {
	const containerClasses =
		direction === 'horizontal'
			? 'flex flex-wrap gap-2'
			: 'flex flex-col space-y-2'

	return (
		<div className={containerClasses}>
			{items.map((item) => (
				<Badge key={item} variant={variant} className="w-fit">
					{item}
				</Badge>
			))}
		</div>
	)
}
