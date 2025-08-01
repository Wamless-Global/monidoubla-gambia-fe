export default function GetHelpLoading() {
	return (
		<div className="p-4 lg:p-6 space-y-6 bg-background min-h-screen">
			<div className="animate-pulse max-w-6xl mx-auto">
				<div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-6"></div>
				<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
					{[...Array(4)].map((_, index) => (
						<div key={index} className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
								<div>
									<div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-2"></div>
									<div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
								</div>
							</div>
						</div>
					))}
				</div>
				<div className="bg-card rounded-lg border border-border p-4 lg:p-6">
					<div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-6"></div>
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead className="bg-gray-50 dark:bg-gray-700">
								<tr>
									{[...Array(5)].map((_, index) => (
										<th key={index} className="px-6 py-3">
											<div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-20"></div>
										</th>
									))}
								</tr>
							</thead>
							<tbody className="bg-background divide-y divide-gray-200 dark:divide-gray-700">
								{[...Array(5)].map((_, index) => (
									<tr key={index}>
										{[...Array(5)].map((_, cellIndex) => (
											<td key={cellIndex} className="px-6 py-4">
												<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
											</td>
										))}
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
