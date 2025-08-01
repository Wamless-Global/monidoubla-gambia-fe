export default function MultipleMatchLoading() {
	return (
		<div className="p-6 space-y-6  min-h-screen">
			<div className="animate-pulse">
				{/* Header */}
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
					<div className="flex items-center gap-4">
						<div className="h-9 w-9 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
						<div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
					</div>
					<div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
				</div>

				{/* Content */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{/* GH Requests */}
					<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border-0">
						<div className="p-4 border-b border-gray-200 dark:border-gray-700">
							<div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-2"></div>
							<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4"></div>
							<div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
						</div>
						<div className="p-4">
							<div className="space-y-3 mb-4">
								{Array.from({ length: 5 }).map((_, index) => (
									<div key={index} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
										<div className="flex items-center gap-3">
											<div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
											<div>
												<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-1"></div>
												<div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
											</div>
										</div>
										<div className="text-right">
											<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-1"></div>
											<div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
										</div>
									</div>
								))}
							</div>
							{/* Pagination skeleton */}
							<div className="flex justify-center gap-1">
								<div className="h-7 w-7 bg-gray-200 dark:bg-gray-700 rounded"></div>
								<div className="h-7 w-7 bg-gray-200 dark:bg-gray-700 rounded"></div>
								<div className="h-7 w-7 bg-gray-200 dark:bg-gray-700 rounded"></div>
								<div className="h-7 w-7 bg-gray-200 dark:bg-gray-700 rounded"></div>
							</div>
						</div>
					</div>

					{/* PH Requests */}
					<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border-0">
						<div className="p-4 border-b border-gray-200 dark:border-gray-700">
							<div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-2"></div>
							<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4"></div>
							<div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
						</div>
						<div className="p-4">
							<div className="space-y-3 mb-4">
								{Array.from({ length: 5 }).map((_, index) => (
									<div key={index} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
										<div className="flex items-center gap-3">
											<div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
											<div>
												<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-1"></div>
												<div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
											</div>
										</div>
										<div className="text-right">
											<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-1"></div>
											<div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
										</div>
									</div>
								))}
							</div>
							{/* Pagination skeleton */}
							<div className="flex justify-center gap-1">
								<div className="h-7 w-7 bg-gray-200 dark:bg-gray-700 rounded"></div>
								<div className="h-7 w-7 bg-gray-200 dark:bg-gray-700 rounded"></div>
								<div className="h-7 w-7 bg-gray-200 dark:bg-gray-700 rounded"></div>
								<div className="h-7 w-7 bg-gray-200 dark:bg-gray-700 rounded"></div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
