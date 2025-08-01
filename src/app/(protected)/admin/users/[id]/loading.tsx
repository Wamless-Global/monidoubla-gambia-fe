export default function UserDetailLoading() {
	return (
		<div className="p-6 space-y-6  min-h-screen">
			<div className="animate-pulse">
				{/* Header */}
				<div className="flex items-center justify-between mb-6">
					<div className="flex items-center gap-4">
						<div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
						<div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
					</div>
					<div className="flex items-center gap-2">
						<div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
						<div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-28"></div>
						<div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
					</div>
				</div>

				{/* User Info Card */}
				<div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 mb-6">
					<div className="flex items-center gap-6 mb-6">
						<div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
						<div className="flex-1">
							<div className="flex items-center gap-3 mb-2">
								<div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
								<div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
							</div>
							<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-1"></div>
							<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
							<div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-28 mt-2"></div>
						</div>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
						{[...Array(4)].map((_, i) => (
							<div key={i}>
								<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-1"></div>
								<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
							</div>
						))}
					</div>
				</div>

				{/* Tabs */}
				<div className="border-b border-gray-200 dark:border-gray-700 mb-6">
					<div className="flex space-x-8">
						<div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
						<div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
						<div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
					</div>
				</div>

				{/* Tab Content */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{[...Array(3)].map((_, i) => (
						<div key={i} className="bg-gray-100 dark:bg-gray-800 rounded-lg h-32"></div>
					))}
				</div>
			</div>
		</div>
	);
}
