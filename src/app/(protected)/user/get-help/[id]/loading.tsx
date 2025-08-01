export default function GetHelpDetailLoading() {
	return (
		<div className="p-4 lg:p-6 space-y-6 bg-background min-h-screen">
			<div className="max-w-6xl mx-auto">
				<div className="animate-pulse">
					{/* Header */}
					<div className="flex items-center gap-4 mb-6">
						<div className="h-9 w-9 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
						<div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64"></div>
					</div>

					{/* Summary Cards */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
						{[...Array(3)].map((_, index) => (
							<div key={index} className="bg-card rounded-lg p-6 border-0 shadow-sm">
								<div className="flex items-center gap-3">
									<div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
									<div>
										<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
										<div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
									</div>
								</div>
							</div>
						))}
					</div>

					{/* Progress Bar */}
					<div className="bg-card rounded-lg p-6 mb-8 border-0 shadow-sm">
						<div className="flex items-center justify-between mb-4">
							<div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
							<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
						</div>
						<div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
							<div className="bg-gray-300 dark:bg-gray-600 h-3 rounded-full w-1/3"></div>
						</div>
					</div>

					{/* PH Users Section */}
					<div className="bg-card border-0 shadow-sm rounded-lg mb-8">
						<div className="p-6 border-b border-border">
							<div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-2"></div>
							<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64"></div>
						</div>

						<div className="p-6">
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
								{[...Array(2)].map((_, index) => (
									<div key={index} className="border border-border rounded-lg p-6">
										<div className="flex items-center justify-between mb-4">
											<div className="flex items-center gap-3">
												<div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
												<div>
													<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-1"></div>
													<div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
												</div>
											</div>
											<div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
										</div>

										<div className="space-y-3">
											{[...Array(4)].map((_, i) => (
												<div key={i} className="flex justify-between">
													<div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
													<div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
												</div>
											))}
										</div>
									</div>
								))}
							</div>
						</div>
					</div>

					{/* Matched Users */}
					<div className="bg-card border-0 shadow-sm rounded-lg">
						<div className="p-6 border-b border-border">
							<div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
							<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
						</div>

						<div className="p-6">
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
								{[...Array(3)].map((_, index) => (
									<div key={index} className="border border-border rounded-lg p-6">
										<div className="flex items-center justify-between mb-4">
											<div className="flex items-center gap-3">
												<div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
												<div>
													<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-1"></div>
													<div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
												</div>
											</div>
											<div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
										</div>

										<div className="space-y-3 mb-4">
											{[...Array(4)].map((_, i) => (
												<div key={i} className="flex justify-between">
													<div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
													<div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
												</div>
											))}
										</div>

										<div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>

										<div className="flex gap-3">
											<div className="h-8 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
											<div className="h-8 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
										</div>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
