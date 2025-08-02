// Completely new design for AddBankLoading
export default function AddBankLoading() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 flex flex-col items-center justify-center py-10 px-2">
			<div className="w-full max-w-3xl rounded-3xl shadow-2xl bg-white/90 dark:bg-gray-900/90 border border-gray-200 dark:border-gray-800 overflow-hidden animate-pulse">
				{/* Top Banner */}
				<div className="bg-gradient-to-r from-cyan-400 to-indigo-500 dark:from-cyan-800 dark:to-indigo-900 py-8 px-8 flex flex-col items-center gap-2">
					<div className="w-16 h-16 rounded-full bg-white/30 dark:bg-gray-800/40 flex items-center justify-center mb-2">
						<div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full" />
					</div>
					<div className="h-6 w-40 bg-white/60 dark:bg-gray-700 rounded mb-1" />
					<div className="h-4 w-64 bg-white/40 dark:bg-gray-800 rounded" />
				</div>

				{/* Main Content */}
				<div className="flex flex-col md:flex-row gap-0 md:gap-8 px-8 py-10">
					{/* Left: Form Skeleton */}
					<div className="flex-1 flex flex-col gap-8">
						{/* Account Number */}
						<div>
							<div className="h-4 w-36 bg-indigo-100 dark:bg-gray-800 rounded mb-3" />
							<div className="h-12 bg-indigo-100 dark:bg-gray-800 rounded-xl" />
						</div>
						{/* Bank Name */}
						<div>
							<div className="h-4 w-28 bg-indigo-100 dark:bg-gray-800 rounded mb-3" />
							<div className="h-12 bg-indigo-100 dark:bg-gray-800 rounded-xl" />
						</div>
						{/* Account Name */}
						<div>
							<div className="h-4 w-32 bg-indigo-100 dark:bg-gray-800 rounded mb-3" />
							<div className="h-12 bg-indigo-100 dark:bg-gray-800 rounded-xl" />
						</div>
						{/* Submit Button */}
						<div className="h-12 bg-gradient-to-r from-cyan-400 to-indigo-500 dark:from-cyan-800 dark:to-indigo-900 rounded-xl w-full mt-2" />
					</div>

					{/* Right: Info Card */}
					<div className="flex-1 flex flex-col gap-6 mt-10 md:mt-0">
						{/* Security Notice */}
						<div className="bg-cyan-50 dark:bg-cyan-900/30 border border-cyan-200 dark:border-cyan-800 rounded-2xl p-6 flex gap-4 items-start">
							<div className="w-8 h-8 bg-cyan-200 dark:bg-cyan-700 rounded-full mt-1" />
							<div className="flex-1">
								<div className="h-4 w-40 bg-cyan-200 dark:bg-cyan-700 rounded mb-2" />
								<div className="h-3 w-full bg-cyan-100 dark:bg-cyan-800 rounded mb-1" />
								<div className="h-3 w-3/4 bg-cyan-100 dark:bg-cyan-800 rounded" />
							</div>
						</div>
						{/* Help Section */}
						<div className="bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 rounded-2xl p-6">
							<div className="h-5 w-32 bg-indigo-200 dark:bg-indigo-700 rounded mb-3" />
							<div className="h-4 w-full bg-indigo-100 dark:bg-indigo-800 rounded mb-4" />
							<div className="space-y-3">
								{[...Array(3)].map((_, i) => (
									<div key={i} className="flex items-center gap-3">
										<div className="w-5 h-5 bg-indigo-200 dark:bg-indigo-700 rounded-full" />
										<div className="h-4 flex-1 bg-indigo-100 dark:bg-indigo-800 rounded" />
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
