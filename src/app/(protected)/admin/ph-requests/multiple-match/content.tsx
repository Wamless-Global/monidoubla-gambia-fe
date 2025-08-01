'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { logger } from '@/lib/logger';
import { CustomLink } from '@/components/CustomLink';
import { PHRequest, GHRequest } from './types';
import RequestCard from './RequestCard';
import { getCurrencyFromLocalStorage } from '@/lib/helpers';

export const formatRequests = (data: any[]): PHRequest[] =>
	data.map((req: any) => {
		const assignedUsers = Array.isArray(req.details)
			? req.details.map((u: any) => ({
					id: u.id,
					name: u.name,
					username: u.username,
					phoneNumber: u.phoneNumber,
					amount: Number(u.amount),
					bankName: u.bankName,
					accountNumber: u.accountNumber,
					accountName: u.accountName,
					timeAssigned: u.timeAssigned || '',
					status: u.status,
			  }))
			: [];
		const totalAssigned = assignedUsers.reduce((sum: number, u: (typeof assignedUsers)[number]) => sum + (Number(u.amount) || 0), 0);
		const reqAmount = Number(req.amount);
		const availableAmount = reqAmount - totalAssigned;

		const pkg = req.packageInfo || req.package;
		let profitPercentage = 0;
		let maturityPeriod = 0;
		let packageName = 'Default Package';
		let packageId = '';

		if (pkg) {
			profitPercentage = Number(pkg.gain || pkg.profitPercentage || 0);
			maturityPeriod = parseInt((pkg.maturity || '0').match(/(\d+)/)?.[1] || '0', 10);
			packageName = pkg.name || 'Default Package';
			packageId = pkg.id || '';
		}

		let expectedMaturity = '';
		if (req.created_at && maturityPeriod > 0) {
			const created = new Date(req.created_at);
			created.setDate(created.getDate() + maturityPeriod);
			expectedMaturity = created.toISOString().split('T')[0];
		}

		let status: PHRequest['status'] = 'pending';
		switch (req.status) {
			case 'pending':
				status = 'pending';
				break;
			case 'completed':
				status = 'completed';
				break;
			case 'active':
				status = 'active';
				break;
			case 'cancelled':
				status = 'expired';
				break;
			default:
				status = 'pending';
		}

		return {
			id: req.id,
			user: {
				id: req.user?.id || '',
				name: req.user?.name || '',
				username: req.user?.username || '',
				email: req.user?.email || '',
				phoneNumber: req.user?.phoneNumber || '',
				location: req.user?.location || '',
			},
			amount: reqAmount,
			availableAmount,
			dateCreated: req.created_at,
			status,
			packageName,
			packageId,
			expectedMaturity,
			profitPercentage,
			maturityPeriod,
			matchingProgress: reqAmount > 0 ? Math.min(100, Math.round((totalAssigned / reqAmount) * 100)) : 0,
			assignedUsers,
			notes: req.notes || '',
		};
	});

export default function PHMultipleMatchPage({ to = 'ph-requests' }) {
	const [allPHRequests, setAllPHRequests] = useState<PHRequest[]>([]);
	const [allGHRequests, setAllGHRequests] = useState<GHRequest[]>([]);
	const [selectedPHRequests, setSelectedPHRequests] = useState<PHRequest[]>([]);
	const [selectedGHRequests, setSelectedGHRequests] = useState<GHRequest[]>([]);
	const [phSearchTerm, setPHSearchTerm] = useState('');
	const [ghSearchTerm, setGHSearchTerm] = useState('');
	const [filteredPHRequests, setFilteredPHRequests] = useState<PHRequest[]>([]);
	const [filteredGHRequests, setFilteredGHRequests] = useState<GHRequest[]>([]);
	const [matching, setMatching] = useState(false);
	const [phCurrentPage, setPHCurrentPage] = useState(1);
	const [ghCurrentPage, setGHCurrentPage] = useState(1);
	const [phTotalPages, setPHTotalPages] = useState(1);
	const [ghTotalPages, setGHTotalPages] = useState(1);
	const [phLoading, setPHLoading] = useState(false);
	const [ghLoading, setGHLoading] = useState(false);
	const [loading, setLoading] = useState(true);

	const itemsPerPage = 10;

	useEffect(() => {
		loadData();
	}, []);

	const loadData = async () => {
		setLoading(true);
		try {
			await Promise.all([fetchPHRequests(1), fetchGHRequests(1)]);
		} catch (error) {
			toast.error('Failed to load initial data');
			logger.error('Failed to load initial data', error);
		} finally {
			setLoading(false);
		}
	};

	const fetchPHRequests = async (page: number) => {
		setPHLoading(true);
		try {
			const res = await fetchWithAuth(`/api/ph-requests/all?status=not-complete&page=${page}&limit=${itemsPerPage}`);
			const json = await res.json();

			const requests: PHRequest[] = formatRequests(json.data.requests || []);

			setAllPHRequests(requests);
			setPHTotalPages(json.data.count);
			filterPHRequests(requests, phSearchTerm);
		} catch (error) {
			toast.error('Failed to load PH requests');
			logger.error('Failed to load PH requests', error);
			setAllPHRequests([]);
			setFilteredPHRequests([]);
		} finally {
			setPHLoading(false);
		}
	};

	const fetchGHRequests = async (page: number) => {
		setGHLoading(true);
		try {
			const res = await fetchWithAuth(`/api/gh-requests/all?page=${page}&limit=${itemsPerPage}`);
			const json = await res.json();
			const requests: GHRequest[] = (json.data.requests || []).map((req: any) => {
				const matchedAmount = req.matchedAmount || 0; // Adjust based on actual API response
				return {
					id: req.id,
					user: {
						id: req.user?.id || '',
						name: req.user?.name || '',
						username: req.user?.username || '',
						email: req.user?.email || '',
						phoneNumber: req.user?.phoneNumber || '',
						location: req.user?.location || '',
					},
					amount: Number(req.amount),
					remainingAmount: Number(req.amount) - matchedAmount,
					dateCreated: req.created_at,
					status: req.status || 'pending',
					notes: req.notes || '',
				};
			});

			setAllGHRequests(requests);
			setGHTotalPages(json.data.count);
			filterGHRequests(requests, ghSearchTerm);
		} catch (error) {
			toast.error('Failed to load GH requests');
			logger.error('Failed to load GH requests', error);
			setAllGHRequests([]);
			setFilteredGHRequests([]);
		} finally {
			setGHLoading(false);
		}
	};

	const filterPHRequests = (requests: PHRequest[], search: string) => {
		logger.log(requests);
		const filtered = requests.filter((request) => {
			const matchesSearch = request.user.name.toLowerCase().includes(search.toLowerCase()) || request.user.email.toLowerCase().includes(search.toLowerCase());
			return matchesSearch && (request.availableAmount || 0) > 0 && request.status === 'pending';
		});
		setFilteredPHRequests(filtered);
	};

	const filterGHRequests = (requests: GHRequest[], search: string) => {
		const filtered = requests.filter((request) => {
			const matchesSearch = request.user.name.toLowerCase().includes(search.toLowerCase()) || request.user.email.toLowerCase().includes(search.toLowerCase());
			return matchesSearch && (request.remainingAmount || 0) > 0 && request.status === 'pending';
		});
		setFilteredGHRequests(filtered);
	};

	useEffect(() => {
		filterPHRequests(allPHRequests, phSearchTerm);
	}, [allPHRequests, phSearchTerm]);

	useEffect(() => {
		filterGHRequests(allGHRequests, ghSearchTerm);
	}, [allGHRequests, ghSearchTerm]);

	const handlePHRequestToggle = (request: PHRequest | GHRequest) => {
		if ('availableAmount' in request) {
			setSelectedPHRequests((prev) => (prev.some((r) => r.id === request.id) ? prev.filter((r) => r.id !== request.id) : [...prev, request]));
		}
	};

	const handleGHRequestToggle = (request: PHRequest | GHRequest) => {
		if ('remainingAmount' in request) {
			setSelectedGHRequests((prev) => (prev.some((r) => r.id === request.id) ? prev.filter((r) => r.id !== request.id) : [...prev, request]));
		}
	};

	const canMatch = () => {
		if (selectedPHRequests.length === 0 || selectedGHRequests.length === 0) {
			return false;
		}
		const totalPHAmount = selectedPHRequests.reduce((sum, r) => sum + (r.availableAmount || 0), 0);
		const totalGHAmount = selectedGHRequests.reduce((sum, r) => sum + (r.remainingAmount || 0), 0);
		return totalPHAmount >= totalGHAmount;
	};

	const generateMatches = () => {
		const matches: { phRequestId: string; ghRequestId: string; amount: number }[] = [];
		const phRequests = [...selectedPHRequests].sort((a, b) => (b.availableAmount || 0) - (a.availableAmount || 0));
		const ghRequests = [...selectedGHRequests].sort((a, b) => (b.remainingAmount || 0) - (a.remainingAmount || 0));

		let phIndex = 0;
		let ghIndex = 0;

		while (phIndex < phRequests.length && ghIndex < ghRequests.length) {
			const ph = phRequests[phIndex];
			const gh = ghRequests[ghIndex];
			const phAvailable = ph.availableAmount || 0;
			const ghNeeded = gh.remainingAmount || 0;

			if (phAvailable <= 0) {
				phIndex++;
				continue;
			}
			if (ghNeeded <= 0) {
				ghIndex++;
				continue;
			}

			const matchAmount = Math.min(phAvailable, ghNeeded);
			matches.push({
				phRequestId: ph.id,
				ghRequestId: gh.id,
				amount: matchAmount,
			});

			phRequests[phIndex] = { ...ph, availableAmount: phAvailable - matchAmount };
			ghRequests[ghIndex] = { ...gh, remainingAmount: ghNeeded - matchAmount };

			if (phRequests[phIndex].availableAmount === 0) phIndex++;
			if (ghRequests[ghIndex].remainingAmount === 0) ghIndex++;
		}

		return matches;
	};

	const handleConfirmMatch = async () => {
		if (!canMatch()) {
			toast.error('Cannot match: insufficient PH amount or no selections');
			return;
		}

		setMatching(true);
		try {
			const matches = generateMatches();
			const res = await fetchWithAuth('/api/match-users', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ matches }),
			});

			if (!res.ok) {
				const data = await res.json();
				throw new Error(data?.message || 'Failed to create matches');
			}

			// Update local state
			const updatedPHRequests = allPHRequests.map((req) => {
				const match = matches.find((m) => m.phRequestId === req.id);
				if (match) {
					const newAvailableAmount = (req.availableAmount || 0) - match.amount;
					return {
						...req,
						availableAmount: newAvailableAmount,
						status: newAvailableAmount > 0 ? 'partial-match' : ('matched' as PHRequest['status']),
					};
				}
				return req;
			});

			const updatedGHRequests = allGHRequests.map((req) => {
				const match = matches.find((m) => m.ghRequestId === req.id);
				if (match) {
					const newRemainingAmount = (req.remainingAmount || 0) - match.amount;
					return {
						...req,
						remainingAmount: newRemainingAmount,
						status: newRemainingAmount > 0 ? 'pending' : 'matched',
					} as GHRequest;
				}
				return req;
			});

			setAllPHRequests(updatedPHRequests);
			setAllGHRequests(updatedGHRequests);
			setSelectedPHRequests([]);
			setSelectedGHRequests([]);
			toast.success(`Successfully matched ${matches.length} pairs!`);
		} catch (error: any) {
			toast.error(error?.message || 'Failed to match users');
			logger.error('Failed to match users', error);
		} finally {
			setMatching(false);
		}
	};

	const handlePHPageChange = async (page: number) => {
		if (page < 1 || page > phTotalPages) return;
		await fetchPHRequests(page);
		setPHCurrentPage(page);
	};

	const handleGHPageChange = async (page: number) => {
		if (page < 1 || page > ghTotalPages) return;
		await fetchGHRequests(page);
		setGHCurrentPage(page);
	};

	const totalPHAmount = selectedPHRequests.reduce((sum, r) => sum + (r.availableAmount || 0), 0);
	const totalGHAmount = selectedGHRequests.reduce((sum, r) => sum + (r.remainingAmount || 0), 0);

	if (loading) {
		return (
			<div className="p-6 space-y-6 min-h-screen">
				<div className="animate-pulse">
					<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
						<div className="flex items-center gap-4">
							<div className="h-9 w-9 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
							<div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
						</div>
						<div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
					</div>
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						{Array.from({ length: 2 }).map((_, index) => (
							<div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border-0">
								<div className="p-4 border-b border-gray-200 dark:border-gray-700">
									<div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-2"></div>
									<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4"></div>
									<div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
								</div>
								<div className="p-4">
									<div className="space-y-3 mb-4">
										{Array.from({ length: 5 }).map((_, i) => (
											<div key={i} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
												<div className="flex items-center gap-3">
													<div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
													<div>
														<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-1"></div>
														<div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
													</div>
												</div>
												<div className="text-right">
													<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-1"></div>
													<div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
												</div>
											</div>
										))}
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="p-6 space-y-6 min-h-screen">
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
				<div className="flex items-center gap-4">
					<CustomLink href={`/admin/${to}`} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
						<i className="ri-arrow-left-line w-5 h-5 flex items-center justify-center text-gray-500 dark:text-gray-400"></i>
					</CustomLink>
					<h1 className="text-2xl font-bold text-gray-900 dark:text-white">Multiple Match</h1>
				</div>
				<Button onClick={handleConfirmMatch} disabled={matching || !canMatch()} className="bg-blue-600 hover:bg-blue-700 text-white whitespace-nowrap min-w-[140px]">
					{matching ? (
						<div className="flex items-center gap-2">
							<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
							<span>Matching...</span>
						</div>
					) : (
						'Confirm match'
					)}
				</Button>
			</div>

			{(selectedPHRequests.length > 0 || selectedGHRequests.length > 0) && (
				<Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700">
					<div className="flex items-center justify-between text-sm">
						<div className="flex items-center gap-4">
							<span className="text-blue-700 dark:text-blue-300">
								PH Selected: {selectedPHRequests.length} ({totalPHAmount} {getCurrencyFromLocalStorage()?.code})
							</span>
							<span className="text-blue-700 dark:text-blue-300">
								GH Selected: {selectedGHRequests.length} ({totalGHAmount} {getCurrencyFromLocalStorage()?.code})
							</span>
						</div>
						<div className={`font-medium ${canMatch() ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>{canMatch() ? 'Ready to match' : 'Cannot match'}</div>
					</div>
				</Card>
			)}

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<RequestCard
					type="PH"
					requests={filteredPHRequests}
					selectedRequests={selectedPHRequests}
					searchTerm={phSearchTerm}
					currentPage={phCurrentPage}
					totalPages={phTotalPages}
					loading={phLoading}
					totalAmount={totalPHAmount}
					onSearchChange={setPHSearchTerm}
					onToggleRequest={handlePHRequestToggle}
					onPageChange={handlePHPageChange}
					itemsPerPage={itemsPerPage}
				/>
				<RequestCard
					type="GH"
					requests={filteredGHRequests}
					selectedRequests={selectedGHRequests}
					searchTerm={ghSearchTerm}
					currentPage={ghCurrentPage}
					totalPages={ghTotalPages}
					loading={ghLoading}
					totalAmount={totalGHAmount}
					onSearchChange={setGHSearchTerm}
					onToggleRequest={handleGHRequestToggle}
					onPageChange={handleGHPageChange}
					itemsPerPage={itemsPerPage}
				/>
			</div>
		</div>
	);
}
