export default function AddBankLoading() {
	return (
		<div className="p-4 lg:p-6  min-h-screen">
			<div className="max-w-2xl mx-auto">
				<div className="animate-pulse">
					{/* Header */}
					<div className="mb-6">
						<div className="flex items-center gap-2 mb-4">
							<div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
							<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
						</div>
						<div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-2"></div>
						<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-72"></div>
					</div>

					{/* Form Card */}
					<div className="bg-white dark:bg-gray-800 border-0 shadow-sm rounded-lg p-6">
						<div className="space-y-6">
							{/* Account Number Field */}
							<div>
								<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
								<div className="relative">
									<div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
								</div>
							</div>

							{/* Bank Name Field */}
							<div>
								<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
								<div className="relative">
									<div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
								</div>
							</div>

							{/* Account Name Field */}
							<div>
								<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-28 mb-2"></div>
								<div className="relative">
									<div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
								</div>
							</div>

							{/* Security Notice */}
							<div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
								<div className="flex items-start gap-3">
									<div className="w-5 h-5 bg-blue-200 dark:bg-blue-700 rounded mt-0.5"></div>
									<div className="flex-1">
										<div className="h-4 bg-blue-200 dark:bg-blue-700 rounded w-32 mb-2"></div>
										<div className="h-3 bg-blue-200 dark:bg-blue-700 rounded w-full mb-1"></div>
										<div className="h-3 bg-blue-200 dark:bg-blue-700 rounded w-3/4"></div>
									</div>
								</div>
							</div>

							{/* Submit Button */}
							<div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-full"></div>
						</div>
					</div>

					{/* Help Section */}
					<div className="mt-6 bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
						<div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
						<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-3"></div>
						<div className="space-y-2">
							{[...Array(3)].map((_, i) => (
								<div key={i} className="flex items-start gap-2">
									<div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded mt-0.5"></div>
									<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
