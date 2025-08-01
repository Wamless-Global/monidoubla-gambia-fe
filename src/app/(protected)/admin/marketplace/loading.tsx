export default function Loading() {
	return (
		<div className="p-6 space-y-6  min-h-screen">
			<div className="animate-pulse">
				{/* Header */}
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
					<div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
					<div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
				</div>

				{/* Search and Filters */}
				<div className="p-6 bg-gray-100 dark:bg-gray-800 rounded-lg mb-6">
					<div className="flex flex-col lg:flex-row gap-4 mb-4">
						<div className="flex-1">
							<div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
						</div>
						<div className="flex flex-wrap gap-2">
							<div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
							<div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-28"></div>
							<div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-36"></div>
							<div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
						</div>
					</div>
				</div>

				{/* Items Grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
					{[...Array(12)].map((_, i) => (
						<div key={i} className="bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
							{/* Image */}
							<div className="h-48 bg-gray-200 dark:bg-gray-700"></div>

							{/* Content */}
							<div className="p-4 space-y-3">
								<div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
								<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
								<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
								<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
								<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>

								{/* Buttons */}
								<div className="flex items-center gap-2 pt-2">
									<div className="flex-1 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
									<div className="h-8 w-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
