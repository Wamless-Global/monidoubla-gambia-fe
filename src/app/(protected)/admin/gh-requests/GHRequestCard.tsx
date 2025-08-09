'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { GHRequest } from './types';
import { getCurrencyFromLocalStorage, getSettings } from '@/lib/helpers';
import { cn } from '@/lib/utils';

// NOTE: All original props and logic are preserved.
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

	const getStatusVariant = (status: string) => {
		switch (status) {
			case 'completed':
				return 'success';
			case 'pending':
				return 'warning';
			case 'matched':
				return 'info';
			default:
				return 'secondary';
		}
	};

	return (
		<div className="space-y-6">
			{/* Page Header */}
			<header>
				<h1 className="text-3xl font-bold text-slate-800">Get Help Requests</h1>
				<p className="text-slate-500 mt-1">Manage and match all incoming GH requests.</p>
			</header>

			{/* Filter Toolbar */}
			<div className="flex flex-col md:flex-row gap-3">
				<div className="relative flex-1">
					<i className="ri-search-line absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"></i>
					<input type="text" placeholder="Search by user..." value={searchTerm} onChange={(e) => onSearchChange(e.target.value)} className="w-full pl-10" />
				</div>
				<div className="flex flex-col sm:flex-row gap-3">
					<select value={statusFilter} onChange={(e) => onStatusFilterChange(e.target.value)} className="w-full sm:w-auto">
						<option value="All">All Statuses</option>
						<option value="pending">Pending</option>
						<option value="matched">Matched</option>
						<option value="completed">Completed</option>
					</select>
					<select value={locationFilter} onChange={(e) => onLocationFilterChange(e.target.value)} className="w-full sm:w-auto">
						<option value="All">All Locations</option>
						<option value="Monrovia">Monrovia</option>
						<option value="Gbarnga">Gbarnga</option>
					</select>
					<select value={sortBy} onChange={(e) => onSortChange(e.target.value)} className="w-full sm:w-auto">
						<option value="date">Sort by Date</option>
						<option value="amount-low">Amount: Low-High</option>
						<option value="amount-high">Amount: High-Low</option>
					</select>
					<Button variant="outline" onClick={onResetFilters} className="whitespace-nowrap">
						<i className="ri-filter-off-line mr-2"></i>Reset
					</Button>
				</div>
			</div>

			{/* Main Data Card */}
			<Card>
				<CardContent className="p-0">
					<div className="overflow-x-auto">
						<table className="min-w-full divide-y divide-slate-200">
							<thead className="bg-slate-50">
								<tr>
									<th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">User</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Amount</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
									<th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Actions</th>
								</tr>
							</thead>
							<tbody className="bg-white divide-y divide-slate-200">
								{loading ? (
									<tr>
										<td colSpan={5} className="text-center py-20 text-slate-500">
											Loading requests...
										</td>
									</tr>
								) : currentRequests.length === 0 ? (
									<tr>
										<td colSpan={5} className="text-center py-20 text-slate-500">
											No requests found.
										</td>
									</tr>
								) : (
									currentRequests.map((request) => (
										<tr key={request.id}>
											<td className="px-6 py-4 whitespace-nowrap">
												<div className="flex items-center gap-3">
													<img className="h-10 w-10 rounded-full object-cover" src={`https://ui-avatars.com/api/?name=${request.user.name.replace(' ', '+')}`} alt={request.user.name} />
													<div>
														<div className="text-sm font-medium text-slate-900">{request.user.name}</div>
														<div className="text-xs text-slate-500">{request.user.email}</div>
													</div>
												</div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">
												{request.remainingAmount.toLocaleString()} {getSettings()?.baseCurrency || getCurrencyFromLocalStorage()?.code}
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{request.dateCreated}</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<Badge variant={getStatusVariant(request.status)} className="capitalize">
													{request.status}
												</Badge>
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-right">
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button variant="ghost" size="icon">
															<i className="ri-more-2-fill"></i>
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align="end">
														<DropdownMenuItem onClick={() => onMatchRequest(request)}>{request.status === 'matched' ? 'Edit Match' : 'Match Request'}</DropdownMenuItem>
														<DropdownMenuItem onClick={() => onDeleteRequest(request)} className="text-red-600">
															Delete Request
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</td>
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>
				</CardContent>
				{totalPages > 1 && (
					<CardFooter className="justify-between items-center">
						<p className="text-sm text-slate-500">
							Page {currentPage} of {totalPages}
						</p>
						<div className="flex items-center gap-2">
							<Button variant="outline" size="icon" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
								<i className="ri-arrow-left-s-line"></i>
							</Button>
							<Button variant="outline" size="icon" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>
								<i className="ri-arrow-right-s-line"></i>
							</Button>
						</div>
					</CardFooter>
				)}
			</Card>
		</div>
	);
}
