import { Button } from '@/components/ui/button';
import { GHRequest } from './types';
import { getCurrencyFromLocalStorage, getSettings } from '@/lib/helpers';

interface GHRequestsTableProps {
	requests: GHRequest[];
	currentPage: number;
	itemsPerPage: number;
	pageLoading: boolean;
	matchLoading: { [key: string]: boolean };
	handleEditRequest: (request: GHRequest) => void;
	handleMatchRequest: (request: GHRequest) => void;
	handleDeleteRequest: (request: GHRequest) => void;
}

export default function GHRequestsTable({ requests, currentPage, itemsPerPage, pageLoading, matchLoading, handleEditRequest, handleMatchRequest, handleDeleteRequest }: GHRequestsTableProps) {
	const getStatusColor = (status: string) => {
		switch (status) {
			case 'pending':
				return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
			case 'matched':
				return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
			case 'completed':
				return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
			default:
				return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
		}
	};

	const startIndex = (currentPage - 1) * itemsPerPage;
	const currentRequests = requests;

	if (pageLoading) {
		return (
			<div className="flex items-center justify-center py-20">
				<div className="flex flex-col items-center gap-4">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
					<span className="text-gray-600 dark:text-gray-400">Loading requests...</span>
				</div>
			</div>
		);
	}

	if (currentRequests?.length === 0) {
		return (
			<div className="text-center py-12">
				<i className="ri-search-line w-12 h-12 flex items-center justify-center mx-auto text-gray-400 mb-4"></i>
				<h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No requests found</h3>
				<p className="text-gray-500 dark:text-gray-400">Try adjusting your search or filters</p>
			</div>
		);
	}

	return (
		<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border-0 overflow-hidden">
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
								<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{startIndex + index + 1}</td>
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
								<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
									{new Date(request.dateCreated).toLocaleDateString('en-US', {
										year: 'numeric',
										month: 'short',
										day: 'numeric',
									})}
								</td>
								<td className="px-6 py-4 whitespace-nowrap">
									<span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>{request.status}</span>
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm">
									<div className="flex items-center gap-2">
										<Button onClick={() => handleEditRequest(request)} variant="outline" className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 text-sm px-3 py-1 whitespace-nowrap">
											Edit
										</Button>
										{(request.status === 'pending' || request.status === 'partial-match') && (
											<Button onClick={() => handleMatchRequest(request)} disabled={matchLoading[request.id]} className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 whitespace-nowrap">
												{matchLoading[request.id] ? (
													<div className="flex items-center gap-2">
														<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
														<span>Matching...</span>
													</div>
												) : (
													'Match'
												)}
											</Button>
										)}
										{request.status === 'matched' && (
											<Button onClick={() => handleMatchRequest(request)} variant="outline" className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 text-sm px-3 py-1 whitespace-nowrap">
												Edit Match
											</Button>
										)}
										<button onClick={() => handleDeleteRequest(request)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors cursor-pointer">
											<i className="ri-delete-bin-line w-4 h-4 flex items-center justify-center"></i>
										</button>
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
