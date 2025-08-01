export default function SettingsLoading() {
	return (
		<div className="p-6 space-y-6  min-h-screen">
			{/* Header */}
			<div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-32 animate-pulse"></div>

			{/* General Settings Card */}
			<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
				<div className="space-y-6">
					<div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-40 animate-pulse"></div>

					{/* Platform Name */}
					<div className="space-y-2">
						<div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
						<div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
					</div>

					{/* Platform Currency */}
					<div className="space-y-2">
						<div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-36 animate-pulse"></div>
						<div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
					</div>

					{/* Auto Matching */}
					<div className="space-y-2">
						<div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-28 animate-pulse"></div>
						<div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-12 animate-pulse"></div>
					</div>

					{/* Commission Rate */}
					<div className="space-y-2">
						<div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
						<div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
					</div>

					{/* Maintenance Mode */}
					<div className="space-y-2">
						<div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-36 animate-pulse"></div>
						<div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-12 animate-pulse"></div>
					</div>

					{/* Save Button */}
					<div className="h-10 bg-gray-300 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
				</div>
			</div>

			{/* Notification Settings Card */}
			<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
				<div className="space-y-6">
					<div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-44 animate-pulse"></div>

					{/* SMS Settings */}
					<div className="space-y-4">
						<div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-28 animate-pulse"></div>
						<div className="space-y-2">
							<div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
							<div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
						</div>
						<div className="space-y-2">
							<div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
							<div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
						</div>
					</div>

					{/* Email Settings */}
					<div className="space-y-4">
						<div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
						<div className="space-y-2">
							<div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-28 animate-pulse"></div>
							<div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
						</div>
						<div className="space-y-2">
							<div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
							<div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
						</div>
					</div>

					{/* Save Button */}
					<div className="h-10 bg-gray-300 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
				</div>
			</div>

			{/* System Settings Card */}
			<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
				<div className="space-y-6">
					<div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-36 animate-pulse"></div>

					{/* Max Transaction Amount */}
					<div className="space-y-2">
						<div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-44 animate-pulse"></div>
						<div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
					</div>

					{/* Min Transaction Amount */}
					<div className="space-y-2">
						<div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-44 animate-pulse"></div>
						<div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
					</div>

					{/* Session Timeout */}
					<div className="space-y-2">
						<div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-36 animate-pulse"></div>
						<div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
					</div>

					{/* Backup Frequency */}
					<div className="space-y-2">
						<div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-36 animate-pulse"></div>
						<div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
					</div>

					{/* Save Button */}
					<div className="h-10 bg-gray-300 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
				</div>
			</div>
		</div>
	);
}
