'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { GHRequest } from '@/app/(protected)/admin/gh-requests/types';
import { getCurrencyFromLocalStorage, handleFetchMessage } from '@/lib/helpers';
import { formatRequests } from '@/app/(protected)/admin/ph-requests/multiple-match/content';
import { PHRequest } from '@/app/(protected)/admin/ph-requests/multiple-match/types';

interface MatchUsersModalProps {
	isOpen: boolean;
	onClose: () => void;
	ghRequest: GHRequest | null;
	onMatch: (ghRequest: GHRequest, selectedPHRequests: PHRequest[]) => void;
	existingMatches: PHRequest[] | undefined;
}

export default function MatchUsersModal({ isOpen, onClose, ghRequest, onMatch, existingMatches = [] }: MatchUsersModalProps) {
	const [selectedPHRequests, setSelectedPHRequests] = useState<PHRequest[]>([]);
	const [availablePHRequests, setAvailablePHRequests] = useState<PHRequest[]>([]);
	const [loading, setLoading] = useState(false);
	const [searchLoading, setSearchLoading] = useState(false);
	const [searchTerm, setSearchTerm] = useState('');
	const [remainingAmount, setRemainingAmount] = useState(0);
	const [initialLoading, setInitialLoading] = useState(true);
	const isSubmitting = useRef(false);
	const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

	// Fetch pending PH requests
	const fetchPHRequests = async (search: string) => {
		setSearchLoading(true);
		try {
			const url = search ? `/api/ph-requests/all?status=not-complete&limit=10&searchTerm=${encodeURIComponent(search)}` : '/api/ph-requests/all?status=not-complete&limit=10';
			const res = await fetchWithAuth(url);
			const json = await res.json();
			logger.log('PH Requests API Response:', json);
			const requests: PHRequest[] = formatRequests(json.data.requests || []);
			// Filter out duplicates from existingMatches
			const uniqueRequests = requests.filter((req) => !existingMatches.some((match) => match.id === req.id));
			setAvailablePHRequests(uniqueRequests);
		} catch (error) {
			toast.error('Failed to load PH requests');
			logger.error('Failed to load PH requests:', error);
			setAvailablePHRequests([]);
		} finally {
			setSearchLoading(false);
			setInitialLoading(false);
		}
	};

	// Initialize modal state
	useEffect(() => {
		fetchPHRequests('');
	}, [isOpen, ghRequest, existingMatches]);

	useEffect(() => {
		if (isOpen && ghRequest) {
			setInitialLoading(true);
			const totalMatched = existingMatches.reduce((sum, req) => sum + req.availableAmount, 0);
			setRemainingAmount(ghRequest.remainingAmount - totalMatched);
			setSelectedPHRequests(existingMatches);
		} else {
			setSelectedPHRequests([]);
			setAvailablePHRequests([]);
			setSearchTerm('');
			setRemainingAmount(0);
			setInitialLoading(false);
		}
	}, [isOpen, ghRequest, existingMatches]);

	useEffect(() => {
		if (isOpen && !initialLoading) {
			if (debounceTimeout.current) {
				clearTimeout(debounceTimeout.current);
			}
			debounceTimeout.current = setTimeout(() => {
				fetchPHRequests(searchTerm);
			}, 300);
		}
		return () => {
			if (debounceTimeout.current) {
				clearTimeout(debounceTimeout.current);
			}
		};
	}, [searchTerm, isOpen, initialLoading]);

	const handlePHRequestToggle = (phRequest: PHRequest) => {
		if (phRequest.status === 'completed' || phRequest.status === 'active') {
			toast.error('Cannot unselect a completed or paid PH request');
			return;
		}

		setSelectedPHRequests((prev) => {
			const isSelected = prev.some((req) => req.id === phRequest.id);
			let newSelected: PHRequest[];
			let adjustedAmount = Math.min(phRequest.availableAmount, remainingAmount);

			if (isSelected) {
				newSelected = prev.filter((req) => req.id !== phRequest.id);
			} else {
				if (adjustedAmount <= 0) {
					toast.error('No remaining amount to match');
					return prev;
				}
				newSelected = [...prev, { ...phRequest, availableAmount: adjustedAmount }];
			}

			const totalSelected = newSelected.reduce((sum, req) => sum + req.availableAmount, 0);
			setRemainingAmount(ghRequest!.remainingAmount - totalSelected);
			return newSelected;
		});
	};

	const isRequestSelected = (phRequest: PHRequest) => {
		return selectedPHRequests.some((req) => req.id === phRequest.id);
	};

	const isRequestDisabled = (phRequest: PHRequest) => {
		if (isRequestSelected(phRequest)) return false;
		if (remainingAmount <= 0) return true;
		return false;
	};

	const handleSubmit = async () => {
		if (!ghRequest || selectedPHRequests.length === 0) {
			toast.error('Please select at least one PH request');
			return;
		}

		if (isSubmitting.current) {
			logger.warn('Submit already in progress, ignoring');
			return;
		}

		isSubmitting.current = true;
		setLoading(true);
		logger.log('Submit initiated:', { selectedPHRequests });

		try {
			const payload = {
				matches: selectedPHRequests.map((ph) => ({
					user: ph.user.id,
					gh_user: ghRequest.user.id,
					ph_request: ph.id,
					gh_request: ghRequest.id,
					amount: Math.min(ph.availableAmount, ghRequest.remainingAmount),
				})),
			};
			logger.log('POST /api/matches payload:', payload);
			const res = await fetchWithAuth('/api/matches', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			});
			const data = await res.json();
			if (!res.ok) {
				throw new Error(handleFetchMessage(data?.message || 'Failed to create matches'));
			}
			logger.log('Match created successfully:', data);
			onMatch(ghRequest, selectedPHRequests);
			toast.success('Users matched successfully!');
			onClose();
		} catch (error: any) {
			toast.error(error.message || 'Failed to match users');
			logger.error('Failed to match users:', error);
		} finally {
			setLoading(false);
			isSubmitting.current = false;
		}
	};

	const handleClose = () => {
		setSelectedPHRequests([]);
		setAvailablePHRequests([]);
		setSearchTerm('');
		setRemainingAmount(0);
		setInitialLoading(false);
		onClose();
	};

	if (!isOpen || !ghRequest) return null;

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto !mt-0">
			<div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
				<div className="p-6">
					{initialLoading ? (
						<div className="flex items-center justify-center py-20">
							<div className="flex flex-col items-center gap-4">
								<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
								<span className="text-gray-600 dark:text-gray-400">Loading modal...</span>
							</div>
						</div>
					) : (
						<>
							<div className="flex items-center justify-between mb-6">
								<h2 className="text-xl font-semibold text-gray-900 dark:text-white">Match Users</h2>
								<button onClick={handleClose} disabled={loading} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50">
									<i className="ri-close-line w-5 h-5 flex items-center justify-center text-gray-500 dark:text-gray-400"></i>
								</button>
							</div>

							<div className="space-y-6">
								{/* GH Request Details */}
								<div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
									<h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">GH Request Details</h3>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div className="flex items-center gap-2">
											<i className="ri-user-line w-4 h-4 flex items-center justify-center text-gray-500"></i>
											<span className="text-gray-900 dark:text-white font-medium">{ghRequest.user.name}</span>
										</div>
										<div className="flex items-center gap-2">
											<i className="ri-money-dollar-circle-line w-4 h-4 flex items-center justify-center text-gray-500"></i>
											<span className="text-gray-900 dark:text-white font-medium">
												{ghRequest.remainingAmount} {getCurrencyFromLocalStorage()?.code}
											</span>
										</div>
										<div className="flex items-center gap-2">
											<i className="ri-calendar-line w-4 h-4 flex items-center justify-center text-gray-500"></i>
											<span className="text-gray-900 dark:text-white">
												{new Date(ghRequest.dateCreated).toLocaleDateString('en-US', {
													year: 'numeric',
													month: 'short',
													day: 'numeric',
												})}
											</span>
										</div>
										<div className="flex items-center gap-2">
											<i className="ri-user-settings-line w-4 h-4 flex items-center justify-center text-gray-500"></i>
											<span
												className={`px-2 py-1 rounded-full text-xs font-medium ${
													ghRequest.status === 'pending'
														? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
														: ghRequest.status === 'matched'
														? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
														: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
												}`}
											>
												{ghRequest.status}
											</span>
										</div>
									</div>
								</div>

								{/* Remaining Amount */}
								<div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
									<div className="flex items-center justify-between">
										<span className="text-blue-900 dark:text-blue-300 font-medium">Remaining Amount to Match:</span>
										<span className="text-blue-900 dark:text-blue-300 font-bold text-lg">
											{remainingAmount} {getCurrencyFromLocalStorage()?.code}
										</span>
									</div>
								</div>

								{/* Available PH Requests */}
								<div>
									<h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Available PH Requests</h3>
									<div className="relative mb-3">
										<i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 flex items-center justify-center"></i>
										<input
											type="text"
											placeholder="Search PH requests by user or email..."
											value={searchTerm}
											onChange={(e) => setSearchTerm(e.target.value)}
											className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
											disabled={loading}
										/>
									</div>
									<div className="overflow-x-auto">
										<table className="w-full border border-gray-200 dark:border-gray-700 rounded-lg">
											<thead className="bg-gray-50 dark:bg-gray-700">
												<tr>
													<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">#</th>
													<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">PH User</th>
													<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
													<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
													<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Select</th>
												</tr>
											</thead>
											<tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
												{searchLoading ? (
													<tr>
														<td colSpan={5} className="px-4 py-3 text-center text-sm text-gray-500 dark:text-gray-400">
															<div className="flex items-center justify-center gap-2">
																<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
																<span>Loading PH requests...</span>
															</div>
														</td>
													</tr>
												) : availablePHRequests.length === 0 && existingMatches.length === 0 ? (
													<tr>
														<td colSpan={5} className="px-4 py-3 text-center text-sm text-gray-500 dark:text-gray-400">
															{searchTerm ? `No PH requests found matching "${searchTerm}"` : 'No available PH requests'}
														</td>
													</tr>
												) : (
													[...existingMatches, ...availablePHRequests].map((phRequest, index) => {
														const isSelected = isRequestSelected(phRequest);
														const isDisabled = isRequestDisabled(phRequest);
														const isCompleted = phRequest.status === 'completed' || phRequest.status === 'active';

														return (
															<tr key={phRequest.id} className={`${isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : isDisabled ? 'bg-gray-50 dark:bg-gray-700/50 opacity-50' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
																<td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{index + 1}</td>
																<td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
																	<div>
																		<div className="font-medium">{phRequest.user.name}</div>
																		<div className="text-gray-500 dark:text-gray-400 text-xs">{phRequest.user.email}</div>
																	</div>
																</td>
																<td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
																	<span className="font-medium">
																		{isSelected ? selectedPHRequests.find((req) => req.id === phRequest.id)?.availableAmount || phRequest.availableAmount : phRequest.availableAmount} {getCurrencyFromLocalStorage()?.code}
																	</span>
																</td>
																<td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{new Date(phRequest.dateCreated).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
																<td className="px-4 py-3 text-sm">
																	<div className="flex items-center gap-2">
																		<input
																			type="checkbox"
																			checked={isSelected}
																			onChange={() => handlePHRequestToggle(phRequest)}
																			disabled={isDisabled || (isCompleted && !isSelected)}
																			className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
																		/>
																		{isCompleted && <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">{phRequest.status === 'active' ? 'Paid' : 'Completed'}</span>}
																	</div>
																</td>
															</tr>
														);
													})
												)}
											</tbody>
										</table>
									</div>
								</div>

								{/* Selected Summary */}
								{selectedPHRequests.length > 0 && (
									<div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
										<h4 className="text-green-900 dark:text-green-300 font-medium mb-2">Selected PH Requests ({selectedPHRequests.length})</h4>
										<div className="space-y-2">
											{selectedPHRequests.map((req) => (
												<div key={req.id} className="flex items-center justify-between text-sm">
													<span className="text-green-900 dark:text-green-300">{req.user.name}</span>
													<span className="text-green-900 dark:text-green-300 font-medium">
														{req.availableAmount} {getCurrencyFromLocalStorage()?.code}
													</span>
												</div>
											))}
											<div className="border-t border-green-200 dark:border-green-700 pt-2 mt-2">
												<div className="flex items-center justify-between font-medium">
													<span className="text-green-900 dark:text-green-300">Total Selected:</span>
													<span className="text-green-900 dark:text-green-300">
														{selectedPHRequests.reduce((sum, req) => sum + req.availableAmount, 0)} {getCurrencyFromLocalStorage()?.code}
													</span>
												</div>
											</div>
										</div>
									</div>
								)}

								{/* Action Buttons */}
								<div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
									<Button onClick={handleClose} variant="outline" disabled={loading} className="whitespace-nowrap bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600">
										Cancel
									</Button>
									<Button onClick={handleSubmit} disabled={loading || selectedPHRequests.length === 0} className="whitespace-nowrap min-w-[120px] bg-blue-600 hover:bg-blue-700 text-white">
										{loading ? (
											<div className="flex items-center gap-2">
												<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
												<span>Matching...</span>
											</div>
										) : (
											'Match Users'
										)}
									</Button>
								</div>
							</div>
						</>
					)}
				</div>
			</div>
		</div>
	);
}
