'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { GHRequest } from '@/app/(protected)/admin/gh-requests/types';
import { getCurrencyFromLocalStorage, handleFetchMessage } from '@/lib/helpers';
import { formatRequests } from '@/app/(protected)/admin/ph-requests/multiple-match/content';
import { PHRequest } from '@/app/(protected)/admin/ph-requests/multiple-match/types';
import { cn } from '@/lib/utils';

// NOTE: All original interfaces and logic are preserved.
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

	const fetchPHRequests = useCallback(
		async (search: string) => {
			setSearchLoading(true);
			try {
				const url = search ? `/api/ph-requests/all?status=not-complete&limit=10&searchTerm=${encodeURIComponent(search)}` : '/api/ph-requests/all?status=not-complete&limit=10';
				const res = await fetchWithAuth(url);
				const json = await res.json();
				const requests: PHRequest[] = formatRequests(json.data.requests || []);
				const uniqueRequests = requests.filter((req) => !existingMatches.some((match) => match.id === req.id));
				setAvailablePHRequests(uniqueRequests);
			} catch (error) {
				toast.error('Failed to load PH requests');
			} finally {
				setSearchLoading(false);
				setInitialLoading(false);
			}
		},
		[existingMatches]
	);

	const debouncedFetch = useCallback((fn: (search: string) => void, delay: number) => {
		let timeoutId: NodeJS.Timeout;
		return (search: string) => {
			clearTimeout(timeoutId);
			timeoutId = setTimeout(() => fn(search), delay);
		};
	}, []);

	const debouncedFetchPHRequests = useCallback(debouncedFetch(fetchPHRequests, 300), [fetchPHRequests]);

	useEffect(() => {
		if (isOpen && ghRequest) {
			setInitialLoading(true);
			const totalMatched = existingMatches.reduce((sum, req) => sum + req.amount, 0);
			setRemainingAmount(ghRequest.amount - totalMatched);
			setSelectedPHRequests(existingMatches.map((em) => ({ ...em, availableAmount: em.amount })));
			fetchPHRequests('');
		} else {
			setSelectedPHRequests([]);
			setAvailablePHRequests([]);
			setSearchTerm('');
			setRemainingAmount(0);
			setInitialLoading(false);
		}
	}, [isOpen, ghRequest, existingMatches, fetchPHRequests]);

	useEffect(() => {
		if (isOpen && !initialLoading) {
			debouncedFetchPHRequests(searchTerm);
		}
	}, [searchTerm, isOpen, initialLoading, debouncedFetchPHRequests]);

	const totalSelectedAmount = selectedPHRequests.reduce((sum, req) => sum + req.availableAmount, 0);
	const currentRemainingAmount = ghRequest ? ghRequest.amount - totalSelectedAmount : 0;

	const handlePHRequestToggle = (phRequest: PHRequest) => {
		if (phRequest.status === 'completed' || phRequest.status === 'active') {
			toast.error('Cannot unselect a completed or paid PH request');
			return;
		}

		setSelectedPHRequests((prev) => {
			const isSelected = prev.some((req) => req.id === phRequest.id);
			if (isSelected) {
				return prev.filter((req) => req.id !== phRequest.id);
			} else {
				if (currentRemainingAmount <= 0) {
					toast.error('No remaining amount to match');
					return prev;
				}
				const amountToMatch = Math.min(phRequest.availableAmount, currentRemainingAmount);
				return [...prev, { ...phRequest, availableAmount: amountToMatch }];
			}
		});
	};

	const isRequestSelected = (phRequest: PHRequest) => selectedPHRequests.some((req) => req.id === phRequest.id);
	const isRequestDisabled = (phRequest: PHRequest) => !isRequestSelected(phRequest) && currentRemainingAmount <= 0;

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
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-in fade-in-0 !m-0">
			<Card className="max-w-4xl w-full bg-white shadow-lg border-slate-200 animate-in fade-in-0 zoom-in-95 max-h-[90vh] flex flex-col">
				<CardHeader>
					<div className="flex justify-between items-start">
						<div>
							<CardTitle>Match GH Request</CardTitle>
							<CardDescription>
								Select available PH requests to fulfill the GH request for <span className="font-semibold text-slate-800">{ghRequest.user.name}</span>.
							</CardDescription>
						</div>
						<button onClick={handleClose} disabled={loading} className="p-1 rounded-full text-slate-500 hover:bg-slate-100">
							<i className="ri-close-line text-xl"></i>
						</button>
					</div>
				</CardHeader>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-6 pb-4 border-b">
					<div className="p-4 bg-slate-50 rounded-lg">
						<p className="text-xs text-slate-500">GH Request Amount</p>
						<p className="text-xl font-bold text-slate-800">
							{ghRequest.amount.toLocaleString()} {getCurrencyFromLocalStorage()?.code}
						</p>
					</div>
					<div className="p-4 bg-indigo-50 rounded-lg">
						<p className="text-xs text-indigo-600">Total Selected from PH</p>
						<p className="text-xl font-bold text-indigo-800">
							{totalSelectedAmount.toLocaleString()} {getCurrencyFromLocalStorage()?.code}
						</p>
					</div>
					<div className={cn('p-4 rounded-lg', currentRemainingAmount > 0 ? 'bg-amber-50' : 'bg-green-50')}>
						<p className={cn('text-xs', currentRemainingAmount > 0 ? 'text-amber-600' : 'text-green-600')}>Remaining to Match</p>
						<p className={cn('text-xl font-bold', currentRemainingAmount > 0 ? 'text-amber-800' : 'text-green-800')}>
							{currentRemainingAmount.toLocaleString()} {getCurrencyFromLocalStorage()?.code}
						</p>
					</div>
				</div>

				<CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
					<div>
						<label htmlFor="ph-search" className="block text-sm font-medium text-slate-700 mb-2">
							Find Available PH Requests
						</label>
						<div className="relative">
							<i className="ri-search-line absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"></i>
							<input id="ph-search" type="text" placeholder="Search by name or email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10" disabled={loading} />
						</div>
					</div>
					<div className="border border-slate-200 rounded-lg overflow-hidden">
						<div className="overflow-y-auto max-h-64">
							<table className="min-w-full divide-y divide-slate-200">
								<thead className="bg-slate-50 sticky top-0">
									<tr>
										<th className="w-12 px-4 py-2 text-left"></th>
										<th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">User</th>
										<th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Available Amount</th>
									</tr>
								</thead>
								<tbody className="bg-white divide-y divide-slate-200">
									{initialLoading || searchLoading ? (
										<tr>
											<td colSpan={3} className="text-center p-8 text-slate-500">
												Loading...
											</td>
										</tr>
									) : availablePHRequests.length === 0 && existingMatches.length === 0 ? (
										<tr>
											<td colSpan={3} className="text-center p-8 text-slate-500">
												No available PH requests found.
											</td>
										</tr>
									) : (
										[...existingMatches, ...availablePHRequests].map((phRequest) => {
											const isSelected = isRequestSelected(phRequest);
											const isDisabled = isRequestDisabled(phRequest);
											const isCompleted = ['completed', 'active'].includes(phRequest.status);

											return (
												<tr key={phRequest.id} onClick={() => !isCompleted && handlePHRequestToggle(phRequest)} className={cn('cursor-pointer', isSelected ? 'bg-indigo-50' : isDisabled ? 'bg-slate-50 opacity-50 cursor-not-allowed' : 'hover:bg-slate-50')}>
													<td className="px-4 py-3">
														<input type="checkbox" checked={isSelected} readOnly disabled={isDisabled || isCompleted} className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
													</td>
													<td className="px-4 py-3">
														<div className="font-medium text-slate-800">{phRequest.user.name}</div>
														<div className="text-xs text-slate-500">{phRequest.user.email}</div>
													</td>
													<td className="px-4 py-3">
														<div className="font-medium text-slate-800">{phRequest.availableAmount.toLocaleString()}</div>
													</td>
												</tr>
											);
										})
									)}
								</tbody>
							</table>
						</div>
					</div>
				</CardContent>
				<CardFooter className="justify-end gap-3">
					<Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
						Cancel
					</Button>
					<Button onClick={handleSubmit} disabled={loading || selectedPHRequests.length === 0} className="min-w-[140px]">
						{loading ? 'Processing...' : 'Confirm Match'}
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
}
