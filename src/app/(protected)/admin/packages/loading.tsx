export default function PackagesLoading() {
	return (
		<div className="p-6 space-y-6  min-h-screen">
			{/* Header Section */}
			<div className="flex justify-between items-center">
				<div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
				<div className="h-10 bg-gray-300 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
			</div>

			{/* Search Bar */}
			<div className="relative">
				<div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-lg w-full animate-pulse"></div>
			</div>

			{/* Table */}
			<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
				{/* Table Header */}
				<div className="bg-gray-50 dark:bg-gray-700 px-6 py-4">
					<div className="grid grid-cols-9 gap-4">
						<div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-4 animate-pulse"></div>
						<div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24 animate-pulse"></div>
						<div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-12 animate-pulse"></div>
						<div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20 animate-pulse"></div>
						<div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20 animate-pulse"></div>
						<div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-16 animate-pulse"></div>
						<div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-12 animate-pulse"></div>
						<div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-16 animate-pulse"></div>
					</div>
				</div>

				{/* Table Rows */}
				<div className="divide-y divide-gray-200 dark:divide-gray-700">
					{[...Array(8)].map((_, index) => (
						<div key={index} className="px-6 py-4 animate-pulse">
							<div className="grid grid-cols-9 gap-4 items-center">
								<div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-4"></div>
								<div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-32"></div>
								<div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-10"></div>
								<div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-12"></div>
								<div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
								<div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-12"></div>
								<div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
								<div className="flex gap-2">
									<div className="h-8 w-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
									<div className="h-8 w-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Pagination */}
			<div className="flex justify-between items-center">
				<div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
				<div className="flex gap-2">
					<div className="h-10 w-10 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
					<div className="h-10 w-10 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
					<div className="h-10 w-10 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
					<div className="h-10 w-10 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
					<div className="h-10 w-10 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
				</div>
			</div>
		</div>
	);
}
