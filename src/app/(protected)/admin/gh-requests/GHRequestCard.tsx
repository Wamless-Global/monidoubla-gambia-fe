import { GHRequest } from './types';
import { getCurrencyFromLocalStorage, getSettings } from '@/lib/helpers';

interface GHRequestCardProps {
	requests: GHRequest[];
	currentPage: number;
	totalPages: number;
	searchTerm: string;
	statusFilter: string;
	locationFilter: string;
	sortBy: string;
	loading: boolean;
	onSearchChange: (value: string) => void;
	onStatusFilterChange: (value: string) => void;
	onLocationFilterChange: (value: string) => void;
	onSortChange: (value: string) => void;
	onPageChange: (page: number) => void;
	onDeleteRequest: (request: GHRequest) => void;
	onMatchRequest: (request: GHRequest) => void;
	onResetFilters: () => void;
}

export default function GHRequestCard({ requests, currentPage, totalPages, searchTerm, statusFilter, locationFilter, sortBy, loading, onSearchChange, onStatusFilterChange, onLocationFilterChange, onSortChange, onPageChange, onDeleteRequest, onMatchRequest, onResetFilters }: GHRequestCardProps) {
	const itemsPerPage = 10;
	const currentRequests = requests.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

	// Calculate pagination range
	const maxButtons = 5;
	const halfRange = Math.floor(maxButtons / 2);
	let startPage = Math.max(1, currentPage - halfRange);
	let endPage = Math.min(totalPages, startPage + maxButtons - 1);
	if (endPage - startPage + 1 < maxButtons && startPage > 1) {
		startPage = Math.max(1, endPage - maxButtons + 1);
	}

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'pending':
				return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
			case 'matched':
				return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
			case 'completed':
				return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
			default:
				return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
		}
	};

	return (
		<div className="bg-white dark:bg-gray-800 border-0 shadow-sm rounded-lg">
			<div className="p-4 border-b border-gray-200 dark:border-gray-700">
				<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">GH Requests</h3>
				<p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Total: {requests.length} requests</p>
				<div className="flex flex-col lg:flex-row gap-4 mb-4">
					<div className="flex-1">
						<div className="relative">
							<i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 flex items-center justify-center"></i>
							<input
								type="text"
								placeholder="Search GH requests..."
								className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
								value={searchTerm}
								onChange={(e) => onSearchChange(e.target.value)}
							/>
						</div>
					</div>
					<div className="flex flex-wrap gap-2">
						<select
							className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm pr-8"
							value={statusFilter}
							onChange={(e) => onStatusFilterChange(e.target.value)}
						>
							<option value="All">All Status</option>
							<option value="pending">Pending</option>
							<option value="matched">Matched</option>
							<option value="completed">Completed</option>
						</select>
						<select
							className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm pr-8"
							value={locationFilter}
							onChange={(e) => onLocationFilterChange(e.target.value)}
						>
							<option value="All">All Locations</option>
							<option value="Monrovia">Monrovia</option>
							<option value="Gbarnga">Gbarnga</option>
							<option value="Buchanan">Buchanan</option>
							<option value="Kakata">Kakata</option>
							<option value="Zwedru">Zwedru</option>
						</select>
						<select className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm pr-8" value={sortBy} onChange={(e) => onSortChange(e.target.value)}>
							<option value="date">Sort by Date</option>
							<option value="amount-low">Amount: Low to High</option>
							<option value="amount-high">Amount: High to Low</option>
							<option value="name">Name: A to Z</option>
						</select>
						<button onClick={onResetFilters} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 text-sm flex items-center">
							<i className="ri-filter-off-line w-4 h-4 flex items-center justify-center mr-2"></i>
							Reset Filters
						</button>
					</div>
				</div>
			</div>
			<div className="p-4">
				{loading ? (
					<div className="flex items-center justify-center py-8">
						<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
						<span className="ml-2 text-gray-600 dark:text-gray-400">Loading...</span>
					</div>
				) : requests.length === 0 ? (
					<div className="text-center py-4 text-gray-500 dark:text-gray-400">{searchTerm ? `No GH requests found matching "${searchTerm}"` : `No GH requests available`}</div>
				) : (
					<>
						<div className="overflow-x-auto">
							<table className="w-full">
								<thead className="bg-gray-50 dark:bg-gray-700">
									<tr>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">#</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">GH User</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
									</tr>
								</thead>
								<tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
									{currentRequests.map((request, index) => (
										<tr key={request.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{(currentPage - 1) * itemsPerPage + index + 1}</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
												<div>
													<div className="font-medium">{request.user.name}</div>
													<div className="text-gray-500 dark:text-gray-400">{request.user.email}</div>
												</div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
												<span className="font-medium">
													{request.remainingAmount} {getSettings()?.baseCurrency ? getSettings()?.baseCurrency : getCurrencyFromLocalStorage()?.code}
												</span>
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{request.dateCreated}</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>{request.status}</span>
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm">
												<div className="flex items-center gap-2">
													{request.status === 'pending' && (
														<button onClick={() => onMatchRequest(request)} className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg">
															Match
														</button>
													)}
													{request.status === 'matched' && (
														<button onClick={() => onMatchRequest(request)} className="px-3 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 text-sm rounded-lg">
															Edit
														</button>
													)}
													<button onClick={() => onDeleteRequest(request)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
														<i className="ri-delete-bin-line w-4 h-4 flex items-center justify-center"></i>
													</button>
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
						{totalPages > 1 && (
							<div className="flex justify-center gap-1 mt-4">
								<button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="px-2 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 disabled:opacity-50">
									<i className="ri-arrow-left-s-line w-4 h-4 flex items-center justify-center"></i>
								</button>
								{Array.from({ length: endPage - startPage + 1 }, (_, i) => {
									const page = startPage + i;
									return (
										<button key={page} onClick={() => onPageChange(page)} className={`px-3 py-1 text-sm rounded border ${currentPage === page ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'}`}>
											{page}
										</button>
									);
								})}
								<button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="px-2 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 disabled:opacity-50">
									<i className="ri-arrow-right-s-line w-4 h-4 flex items-center justify-center"></i>
								</button>
							</div>
						)}
					</>
				)}
			</div>
		</div>
	);
}
