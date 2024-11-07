import React from 'react'
import { CloudUpload } from 'lucide-react'

export function FileInput({
	title,
	inputProps,
}: {
	title: string
	inputProps: React.InputHTMLAttributes<HTMLInputElement>
}) {
	return (
		<div className="flex w-full items-center justify-center">
			<label
				htmlFor="dropzone-file"
				className="mb-4 flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:hover:border-gray-500 dark:hover:bg-gray-600 dark:hover:bg-gray-800"
			>
				<div className="flex flex-col items-center justify-center pb-6 pt-5">
					<CloudUpload />
					<p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
						<span className="font-semibold">Click to upload</span> or drag and
						drop files
					</p>
					<p className="text-xs text-gray-500 dark:text-gray-400">{title}</p>
				</div>
				<input
					id="dropzone-file"
					type="file"
					className="hidden"
					accept="application/pdf"
					{...inputProps}
				/>
			</label>
		</div>
	)
}
