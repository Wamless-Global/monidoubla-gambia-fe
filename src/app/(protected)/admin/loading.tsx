export default function AdminDashboardLoading() {
	return (
		<div className="p-6 space-y-6  min-h-screen">
			{/* Stats Cards Skeleton */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				{[...Array(4)].map((_, index) => (
					<div key={index} className="bg-gray-200 dark:bg-gray-800 rounded-lg p-6 animate-pulse">
						<div className="flex items-center justify-between">
							<div className="space-y-3">
								<div className="flex items-center gap-2">
									<div className="w-5 h-5 bg-gray-300 dark:bg-gray-700 rounded"></div>
									<div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-24"></div>
								</div>
								<div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
								<div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-32"></div>
							</div>
							<div className="text-right">
								<div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
							</div>
						</div>
					</div>
				))}
			</div>

			{/* Quick Actions Skeleton */}
			<div className="p-6 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse">
				<div className="flex items-center justify-between mb-6">
					<div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-32"></div>
				</div>
				<div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
					<div className="flex items-center gap-2">
						<div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-24"></div>
						<div className="h-6 w-11 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
					</div>
					<div className="flex flex-wrap gap-2">
						<div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-24"></div>
						<div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-32"></div>
					</div>
				</div>
			</div>

			{/* Charts Skeleton */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* User Registration Trend Skeleton */}
				<div className="p-6 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse">
					<div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-48 mb-2"></div>
					<div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-32 mb-6"></div>
					<div className="h-64">
						<div className="flex items-end justify-between h-full">
							{[...Array(6)].map((_, index) => (
								<div key={index} className="flex flex-col items-center">
									<div className="w-12 bg-gray-300 dark:bg-gray-700 rounded-t-sm mb-2 animate-pulse" style={{ height: `${Math.random() * 80 + 20}%` }}></div>
									<div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-8"></div>
								</div>
							))}
						</div>
					</div>
				</div>

				{/* GH vs PH Requests Skeleton */}
				<div className="p-6 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse">
					<div className="flex items-center justify-between mb-2">
						<div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-40"></div>
						<div className="flex items-center gap-4">
							<div className="flex items-center gap-2">
								<div className="w-3 h-3 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
								<div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-20"></div>
							</div>
							<div className="flex items-center gap-2">
								<div className="w-3 h-3 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
								<div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-20"></div>
							</div>
						</div>
					</div>
					<div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-64 mb-6"></div>
					<div className="h-64">
						<div className="flex items-end justify-between h-full">
							{[...Array(6)].map((_, index) => (
								<div key={index} className="flex flex-col items-center">
									<div className="flex items-end gap-1 mb-2">
										<div className="w-5 bg-gray-300 dark:bg-gray-700 rounded-t-sm animate-pulse" style={{ height: `${Math.random() * 80 + 20}%` }}></div>
										<div className="w-5 bg-gray-300 dark:bg-gray-700 rounded-t-sm animate-pulse" style={{ height: `${Math.random() * 80 + 20}%` }}></div>
									</div>
									<div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-8"></div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
