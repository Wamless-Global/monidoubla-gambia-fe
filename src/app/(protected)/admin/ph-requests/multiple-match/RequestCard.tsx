import { Card } from '@/components/ui/card';
import { PHRequest, GHRequest } from './types';
import { useEffect, useRef, useState } from 'react';
import { getCurrencyFromLocalStorage, getSettings } from '@/lib/helpers';

interface RequestCardProps {
	type: 'PH' | 'GH';
	requests: (PHRequest | GHRequest)[];
	selectedRequests: (PHRequest | GHRequest)[];
	searchTerm: string;
	currentPage: number;
	totalPages: number;
	loading: boolean;
	totalAmount: number;
	itemsPerPage: number;
	onSearchChange: (value: string) => void;
	onToggleRequest: (request: PHRequest | GHRequest) => void;
	onPageChange: (page: number) => void;
}

export default function RequestCard({ type, requests, selectedRequests, searchTerm, currentPage, totalPages, loading, totalAmount, onSearchChange, onToggleRequest, onPageChange, itemsPerPage }: RequestCardProps) {
	// Calculate pagination range
	const maxButtons = 5; // max number of page buttons to show
	const ending = Math.floor(totalPages / itemsPerPage);
	const [pagination, setPagination] = useState({ startPage: 1, endPage: 1 });

	useEffect(() => {
		let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
		let endPage = ending;
		if (endPage > totalPages) {
			endPage = totalPages;
			startPage = Math.max(1, endPage - maxButtons + 1);
		}
		setPagination({ startPage, endPage });
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentPage, totalPages]);

	const { startPage, endPage } = pagination;

	return (
		<Card className="bg-white dark:bg-gray-800 border-0 shadow-sm rounded-lg">
			<div className="p-4 border-b border-gray-200 dark:border-gray-700">
				<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Available {type} Requests</h3>
				<p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
					Total: {totalPages} Requests | Selected: {selectedRequests.length} | Amount:{' '}
					<span className="font-medium text-gray-900 dark:text-white">
						{totalAmount} {getSettings()?.baseCurrency ? getSettings()?.baseCurrency : getCurrencyFromLocalStorage()?.code}
					</span>
				</p>
				<div className="relative">
					<i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 flex items-center justify-center"></i>
					<input
						type="text"
						placeholder={`Search ${type} requests...`}
						className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
						value={searchTerm}
						onChange={(e) => onSearchChange(e.target.value)}
					/>
				</div>
			</div>
			<div className="p-4">
				{loading ? (
					<div className="flex items-center justify-center py-8">
						<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
						<span className="ml-2 text-gray-600 dark:text-gray-400">Loading...</span>
					</div>
				) : requests.length === 0 ? (
					<div className="text-center py-4 text-gray-500 dark:text-gray-400">{searchTerm ? `No ${type} requests found matching "${searchTerm}"` : `No ${type} requests available`}</div>
				) : (
					<>
						<div className="space-y-3 mb-4">
							{requests.map((request) => {
								const isSelected = selectedRequests.some((r) => r.id === request.id);
								const userName = 'user' in request ? request.user.name : 'n/a';
								const userEmail = 'user' in request ? request.user.email : 'n/a';
								const amount = 'availableAmount' in request ? request.availableAmount : 'remainingAmount' in request ? request.remainingAmount : 'n/a';
								const date = request.dateCreated;
								return (
									<div
										key={request.id}
										className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
											isSelected ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700' : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
										}`}
										onClick={() => onToggleRequest(request)}
									>
										<div className="flex items-center gap-3">
											<input
												type="checkbox"
												checked={isSelected}
												onChange={() => onToggleRequest(request)}
												className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
											/>
											<div>
												<div className="font-medium text-gray-900 dark:text-white text-sm">{userName}</div>
												<div className="text-xs text-gray-500 dark:text-gray-400">{userEmail}</div>
											</div>
										</div>
										<div className="text-right">
											<div className="font-medium text-gray-900 dark:text-white text-sm">
												{amount} {getSettings()?.baseCurrency ? getSettings()?.baseCurrency : getCurrencyFromLocalStorage()?.code}
											</div>
											<div className="text-xs text-gray-500 dark:text-gray-400">{date}</div>
										</div>
									</div>
								);
							})}
						</div>
						{totalPages > 1 && (
							<div className="flex justify-center gap-1">
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
								<button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === ending} className="px-2 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 disabled:opacity-50">
									<i className="ri-arrow-right-s-line w-4 h-4 flex items-center justify-center"></i>
								</button>
							</div>
						)}
					</>
				)}
			</div>
		</Card>
	);
}
