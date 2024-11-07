export const CounterDisplay = ({
	count,
	maxLength,
}: {
	count: number | undefined
	maxLength: number | undefined
}) => {
	if (!count) {
		return (
			<div className="text-muted-foreground text-right text-sm">
				{`0/${maxLength} character(s)`}
			</div>
		)
	}

	return (
		<div className="text-muted-foreground text-right text-sm">
			{`${count ?? 0}/${maxLength} character(s)`}
		</div>
	)
}
