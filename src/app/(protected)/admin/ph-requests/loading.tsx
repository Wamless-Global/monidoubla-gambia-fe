export default function PHRequestsLoading() {
	return (
		<div className="p-6 space-y-6  min-h-screen">
			<div className="animate-pulse">
				{/* Header */}
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
					<div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
					<div className="flex gap-2">
						<div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
						<div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
					</div>
				</div>

				{/* Search and Filters */}
				<div className="p-6 bg-gray-100 dark:bg-gray-800 rounded-lg mb-6">
					<div className="flex flex-col lg:flex-row gap-4 mb-4">
						<div className="flex-1">
							<div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
						</div>
						<div className="flex flex-wrap gap-2">
							<div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-28"></div>
							<div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
							<div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-36"></div>
							<div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-28"></div>
						</div>
					</div>
				</div>

				{/* Table */}
				<div className="bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead className="bg-gray-200 dark:bg-gray-700">
								<tr>
									<th className="px-6 py-3 text-left">
										<div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-4"></div>
									</th>
									<th className="px-6 py-3 text-left">
										<div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
									</th>
									<th className="px-6 py-3 text-left">
										<div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
									</th>
									<th className="px-6 py-3 text-left">
										<div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-12"></div>
									</th>
									<th className="px-6 py-3 text-left">
										<div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-12"></div>
									</th>
									<th className="px-6 py-3 text-left">
										<div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
									</th>
								</tr>
							</thead>
							<tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
								{[...Array(10)].map((_, index) => (
									<tr key={index}>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4"></div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="space-y-2">
												<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
												<div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="flex items-center gap-2">
												<div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
												<div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-8"></div>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</div>
	);
}
