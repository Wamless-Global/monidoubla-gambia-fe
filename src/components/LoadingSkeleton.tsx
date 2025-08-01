'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function DashboardSkeleton() {
	return (
		<div className="p-4 lg:p-8">
			<div className="max-w-6xl mx-auto">
				<div className="space-y-6 lg:space-y-8">
					{/* Welcome message skeleton */}
					<div className="flex items-center justify-between">
						<div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 animate-pulse"></div>
					</div>

					{/* Credit cards skeleton */}
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
						{[...Array(3)].map((_, i) => (
							<Card key={i} className="animate-pulse">
								<CardContent className="p-6">
									<div className="space-y-3">
										<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
										<div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
										<div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
									</div>
								</CardContent>
							</Card>
						))}
					</div>

					{/* Action buttons skeleton */}
					<div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
						<div className="h-10 bg-gray-200 dark:bg-gray-700 rounded flex-1 sm:flex-none animate-pulse"></div>
						<div className="h-10 bg-gray-200 dark:bg-gray-700 rounded flex-1 sm:flex-none animate-pulse"></div>
					</div>

					{/* Recent transactions skeleton */}
					<Card className="animate-pulse">
						<CardContent className="p-4 lg:p-6">
							<div className="space-y-4">
								<div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
								{[...Array(4)].map((_, i) => (
									<div key={i} className="flex items-center gap-4 p-3">
										<div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
										<div className="flex-1 space-y-2">
											<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
											<div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
										</div>
										<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}

export function ProfileSkeleton() {
	return (
		<div className="p-4 lg:p-6 bg-background min-h-screen">
			<div className="max-w-4xl mx-auto">
				<div className="mb-8 flex flex-col items-center lg:items-start lg:flex-row lg:gap-8">
					<div className="mb-6 lg:mb-0">
						<div className="w-32 h-32 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
					</div>

					<div className="text-center lg:text-left lg:flex-1">
						<div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-2 animate-pulse"></div>
						<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4 animate-pulse"></div>
						<div className="flex flex-col sm:flex-row gap-3">
							<div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
							<div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-40 animate-pulse"></div>
						</div>
					</div>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{[...Array(3)].map((_, i) => (
						<Card key={i} className="animate-pulse">
							<CardContent className="p-6">
								<div className="flex items-center justify-between mb-4">
									<div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
									<div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded"></div>
								</div>

								<div className="space-y-4">
									{[...Array(4)].map((_, j) => (
										<div key={j}>
											<div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-1"></div>
											<div className="flex items-center gap-2">
												<div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
												<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
											</div>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		</div>
	);
}

export function ListingsSkeleton() {
	return (
		<div className="p-4 lg:p-6 space-y-6">
			<div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
				<div className="relative flex-1 lg:max-w-md">
					<div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
				</div>
				<div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-40 animate-pulse"></div>
			</div>

			<div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
				{[...Array(8)].map((_, i) => (
					<Card key={i} className="animate-pulse">
						<CardContent className="p-4">
							<div className="aspect-square mb-4 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
							<div className="space-y-2">
								<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
								<div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
								<div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
								<div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
								<div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
								<div className="flex items-center justify-between pt-2">
									<div className="flex items-center gap-2">
										<div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
										<div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}

export function HistorySkeleton() {
	return (
		<div className="p-4 lg:p-6">
			<div className="max-w-6xl mx-auto">
				<Card className="animate-pulse">
					<CardContent className="p-4 lg:p-6">
						<div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-6"></div>

						{/* Action buttons skeleton */}
						<div className="flex flex-col sm:flex-row gap-3 lg:gap-4 mb-6">
							<div className="h-10 bg-gray-200 dark:bg-gray-700 rounded flex-1 sm:flex-none"></div>
							<div className="h-10 bg-gray-200 dark:bg-gray-700 rounded flex-1 sm:flex-none"></div>
						</div>

						<div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4"></div>

						{/* Desktop table skeleton */}
						<div className="hidden lg:block">
							<div className="border-b border-border pb-3 mb-4">
								<div className="flex justify-between">
									<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
									<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
									<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
									<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
								</div>
							</div>
							{[...Array(4)].map((_, i) => (
								<div key={i} className="flex items-center justify-between py-4 border-b border-border">
									<div className="flex items-center gap-3">
										<div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
										<div className="space-y-1">
											<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
											<div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
										</div>
									</div>
									<div className="space-y-1">
										<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
										<div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
									</div>
									<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
									<div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
								</div>
							))}
						</div>

						{/* Mobile cards skeleton */}
						<div className="lg:hidden space-y-4">
							{[...Array(4)].map((_, i) => (
								<div key={i} className="bg-muted/50 rounded-lg p-4">
									<div className="flex items-start justify-between mb-3">
										<div className="flex items-center gap-3">
											<div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
											<div className="space-y-1">
												<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
												<div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
											</div>
										</div>
										<div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
									</div>
									<div className="flex justify-between items-center">
										<div className="space-y-1">
											<div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
											<div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
										</div>
										<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

export function MarketplaceSkeleton() {
	return (
		<div className="p-4 lg:p-6">
			<div className="max-w-6xl mx-auto space-y-6">
				{/* Search and filter skeleton */}
				<div className="flex flex-col lg:flex-row gap-4">
					<div className="flex-1">
						<div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
					</div>
					<div className="flex gap-2">
						<div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
						<div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
					</div>
				</div>

				{/* Products grid skeleton */}
				<div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
					{[...Array(12)].map((_, i) => (
						<Card key={i} className="animate-pulse">
							<CardContent className="p-4">
								<div className="aspect-square mb-4 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
								<div className="space-y-2">
									<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
									<div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
									<div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
									<div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
									<div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		</div>
	);
}

export function NetworkSkeleton() {
	return (
		<div className="p-4 lg:p-6">
			<div className="max-w-6xl mx-auto space-y-6">
				{/* Header skeleton */}
				<div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse"></div>

				{/* Stats cards skeleton */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
					{[...Array(3)].map((_, i) => (
						<Card key={i} className="animate-pulse">
							<CardContent className="p-6">
								<div className="flex items-center justify-between">
									<div className="space-y-2">
										<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
										<div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
									</div>
									<div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>

				{/* Members list skeleton */}
				<Card className="animate-pulse">
					<CardContent className="p-6">
						<div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4"></div>
						<div className="space-y-4">
							{[...Array(6)].map((_, i) => (
								<div key={i} className="flex items-center gap-4 p-3 rounded-lg">
									<div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
									<div className="flex-1 space-y-2">
										<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
										<div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
									</div>
									<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

export function ChangePasswordSkeleton() {
	return (
		<div className="p-4 lg:p-6 min-h-screen bg-background">
			<div className="max-w-md mx-auto">
				<Card className="animate-pulse">
					<CardHeader>
						<div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
					</CardHeader>

					<CardContent className="space-y-6">
						<div className="space-y-4">
							{[...Array(3)].map((_, i) => (
								<div key={i}>
									<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
									<div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
								</div>
							))}
						</div>

						<div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>

						<div className="text-center">
							<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mx-auto"></div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

export function ProvideHelpSkeleton() {
	return (
		<div className="p-4 lg:p-6">
			<div className="max-w-2xl mx-auto">
				<Card className="animate-pulse">
					<CardHeader>
						<div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
					</CardHeader>

					<CardContent className="space-y-6">
						{[...Array(4)].map((_, i) => (
							<div key={i}>
								<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
								<div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
							</div>
						))}

						<div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
