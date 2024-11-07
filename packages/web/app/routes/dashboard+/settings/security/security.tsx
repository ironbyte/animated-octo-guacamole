import { useState } from 'react'
import { Eye, EyeOff, Lock, LogOut, Smartphone } from 'lucide-react'

import { Button } from '~/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Separator } from '~/components/ui/separator'
import { Switch } from '~/components/ui/switch'

export function SecuritySettings() {
	const [showPassword, setShowPassword] = useState(false)
	const [mfaEnabled, setMfaEnabled] = useState(false)

	// This would typically come from an API call
	const activeSessions = [
		{
			id: 1,
			device: 'MacBook Pro',
			location: 'New York, USA',
			lastActive: '2 hours ago',
		},
		{
			id: 2,
			device: 'iPhone 12',
			location: 'London, UK',
			lastActive: '1 day ago',
		},
		{
			id: 3,
			device: 'Windows PC',
			location: 'Sydney, Australia',
			lastActive: '3 days ago',
		},
	]

	return (
		<div className="">
			<Card>
				<CardHeader>
					<CardTitle>Change Password</CardTitle>
					<CardDescription>
						Ensure your account is using a long, random password to stay secure.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="current-password">Current Password</Label>
						<div className="relative">
							<Input
								id="current-password"
								type={showPassword ? 'text' : 'password'}
								placeholder="Enter your current password"
							/>
							<Button
								variant="ghost"
								size="sm"
								className="absolute right-2 top-1/2 -translate-y-1/2"
								onClick={() => setShowPassword(!showPassword)}
							>
								{showPassword ? (
									<EyeOff className="h-4 w-4" />
								) : (
									<Eye className="h-4 w-4" />
								)}
							</Button>
						</div>
					</div>
					<div className="space-y-2">
						<Label htmlFor="new-password">New Password</Label>
						<Input
							id="new-password"
							type="password"
							placeholder="Enter your new password"
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="confirm-password">Confirm New Password</Label>
						<Input
							id="confirm-password"
							type="password"
							placeholder="Confirm your new password"
						/>
					</div>
				</CardContent>
				<CardFooter>
					<Button>
						<Lock className="mr-2 h-4 w-4" />
						Update Password
					</Button>
				</CardFooter>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Two-Factor Authentication</CardTitle>
					<CardDescription>
						Add an extra layer of security to your account by enabling
						two-factor authentication.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center space-x-2">
						<Switch
							id="mfa"
							checked={mfaEnabled}
							onCheckedChange={setMfaEnabled}
						/>
						<Label htmlFor="mfa">Enable Two-Factor Authentication</Label>
					</div>
					{mfaEnabled && (
						<div className="space-y-2 pl-6">
							<p className="text-sm text-gray-500">
								Scan the QR code with your authenticator app:
							</p>
							<img
								src="/placeholder.svg?height=150&width=150"
								alt="QR Code for 2FA"
								className="h-36 w-36"
							/>
							<div className="space-y-2">
								<Label htmlFor="mfa-code">Enter the 6-digit code:</Label>
								<Input id="mfa-code" placeholder="000000" maxLength={6} />
							</div>
						</div>
					)}
				</CardContent>
				{mfaEnabled && (
					<CardFooter>
						<Button>
							<Smartphone className="mr-2 h-4 w-4" />
							Verify and Enable 2FA
						</Button>
					</CardFooter>
				)}
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Active Sessions</CardTitle>
					<CardDescription>
						Manage your active sessions across different devices.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<ul className="space-y-4">
						{activeSessions.map((session) => (
							<li
								key={session.id}
								className="flex items-center justify-between"
							>
								<div>
									<p className="font-medium">{session.device}</p>
									<p className="text-sm text-gray-500">
										{session.location} • {session.lastActive}
									</p>
								</div>
								<Button variant="outline" size="sm">
									<LogOut className="mr-2 h-4 w-4" />
									Log Out
								</Button>
							</li>
						))}
					</ul>
				</CardContent>
				<CardFooter>
					<Button variant="destructive">
						<LogOut className="mr-2 h-4 w-4" />
						Log Out All Other Sessions
					</Button>
				</CardFooter>
			</Card>
		</div>
	)
}
