import { Label } from './ui/label'

export function Marker({ key, value }: { key: string; value: string }) {
	return (
		<Label
			className="bg-secondary text-secondary-foreground mb-4 mr-4 flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium"
			key={key}
		>
			{value}
		</Label>
	)
}
