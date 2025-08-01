export default function UsersLoading() {
	return (
		<div className="p-6 space-y-6  min-h-screen">
			{/* Header */}
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
				<div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse"></div>
				<div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
			</div>

			{/* Search and Filters Card */}
			<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
				<div className="flex flex-col lg:flex-row gap-4">
					<div className="flex-1">
						<div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-full animate-pulse"></div>
					</div>
					<div className="flex flex-wrap gap-2">
						<div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
						<div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
						<div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-28 animate-pulse"></div>
					</div>
				</div>
			</div>

			{/* Table Card */}
			<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
				<div className="overflow-x-auto">
					{/* Table Header */}
					<div className="bg-gray-50 dark:bg-gray-700 px-6 py-4">
						<div className="grid grid-cols-7 gap-4">
							<div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-4 animate-pulse"></div>
							<div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-16 animate-pulse"></div>
							<div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-28 animate-pulse"></div>
							<div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-12 animate-pulse"></div>
							<div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20 animate-pulse"></div>
							<div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24 animate-pulse"></div>
							<div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-16 animate-pulse"></div>
						</div>
					</div>

					{/* Table Rows */}
					<div className="divide-y divide-gray-200 dark:divide-gray-700">
						{[...Array(10)].map((_, index) => (
							<div key={index} className="px-6 py-4 animate-pulse">
								<div className="grid grid-cols-7 gap-4 items-center">
									<div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-4"></div>
									<div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
									<div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-32"></div>
									<div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-12"></div>
									<div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
									<div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
									<div className="flex gap-2">
										<div className="h-8 w-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
										<div className="h-8 w-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
										<div className="h-8 w-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Pagination */}
			<div className="flex justify-center items-center gap-2 mt-6">
				<div className="h-10 w-10 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
				<div className="h-10 w-10 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
				<div className="h-10 w-10 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
				<div className="h-10 w-10 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
				<div className="h-10 w-10 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
			</div>
		</div>
	);
}
