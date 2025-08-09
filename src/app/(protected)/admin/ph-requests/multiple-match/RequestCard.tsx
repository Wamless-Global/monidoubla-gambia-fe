'use client';

import { useEffect, useState } from 'react';
import { PHRequest, GHRequest } from './types';
import { getCurrencyFromLocalStorage, getSettings } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// NOTE: All original interfaces and logic are preserved.
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

export default function RequestCard({ type, requests, selectedRequests, searchTerm, currentPage, totalPages, loading, onSearchChange, onToggleRequest, onPageChange, itemsPerPage }: RequestCardProps) {
	const [pagination, setPagination] = useState({ startPage: 1, endPage: 1 });

	useEffect(() => {
		const maxButtons = 5;
		let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
		let endPage = Math.min(totalPages, startPage + maxButtons - 1);
		if (endPage - startPage + 1 < maxButtons && startPage > 1) {
			startPage = Math.max(1, endPage - maxButtons + 1);
		}
		setPagination({ startPage, endPage });
	}, [currentPage, totalPages]);

	return (
		<div className="flex flex-col h-full">
			<div className="p-4 border-b border-slate-200">
				<div className="relative">
					<i className="ri-search-line absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"></i>
					<input type="text" placeholder={`Search ${type} requests...`} className="w-full pl-10" value={searchTerm} onChange={(e) => onSearchChange(e.target.value)} />
				</div>
			</div>
			<div className="flex-grow p-4">
				{loading ? (
					<div className="flex items-center justify-center h-full text-slate-500">Loading...</div>
				) : requests.length === 0 ? (
					<div className="text-center py-10 text-slate-500">{searchTerm ? `No requests matching "${searchTerm}"` : `No available ${type} requests`}</div>
				) : (
					<div className="space-y-2">
						{requests.map((request) => {
							const isSelected = selectedRequests.some((r) => r.id === request.id);
							const userName = 'user' in request ? request.user.name : 'n/a';
							const userEmail = 'user' in request ? request.user.email : 'n/a';
							const amount = 'availableAmount' in request ? request.availableAmount : 'remainingAmount' in request ? request.remainingAmount : 0;
							const date = new Date(request.dateCreated).toLocaleDateString();

							return (
								<div key={request.id} className={cn('flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors', isSelected ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-200 hover:bg-slate-50')} onClick={() => onToggleRequest(request)}>
									<div className="flex items-center gap-3 min-w-0">
										<input type="checkbox" checked={isSelected} readOnly className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 flex-shrink-0" />
										<img src={`https://ui-avatars.com/api/?name=${userName.replace(' ', '+')}`} alt={userName} className="w-8 h-8 rounded-full flex-shrink-0" />
										<div className="min-w-0">
											<p className="font-medium text-slate-800 text-sm truncate">{userName}</p>
											<p className="text-xs text-slate-500 truncate">{userEmail}</p>
										</div>
									</div>
									<div className="text-right flex-shrink-0 ml-2">
										<p className="font-semibold text-slate-800 text-sm">
											{amount?.toLocaleString()} {getSettings()?.baseCurrency || getCurrencyFromLocalStorage()?.code}
										</p>
										<p className="text-xs text-slate-500">{date}</p>
									</div>
								</div>
							);
						})}
					</div>
				)}
			</div>
			{totalPages > 1 && (
				<div className="p-4 border-t border-slate-200 flex justify-center items-center gap-2">
					<Button variant="outline" size="icon" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
						<i className="ri-arrow-left-s-line"></i>
					</Button>
					<span className="text-sm text-slate-600 font-medium">
						Page {currentPage} of {totalPages}
					</span>
					<Button variant="outline" size="icon" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>
						<i className="ri-arrow-right-s-line"></i>
					</Button>
				</div>
			)}
		</div>
	);
}
