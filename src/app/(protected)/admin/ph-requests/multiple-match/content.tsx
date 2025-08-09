'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { logger } from '@/lib/logger';
import { CustomLink } from '@/components/CustomLink';
import { PHRequest, GHRequest } from './types';
import RequestCard from './RequestCard';
import { getCurrencyFromLocalStorage, handleFetchMessage, getSettings } from '@/lib/helpers';
import { cn } from '@/lib/utils';

// Format PH requests from API response
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

	const itemsPerPage = 20;

	// Initial data load
	useEffect(() => {
		loadData();
	}, []);

	// Load PH and GH requests
	const loadData = async () => {
		setLoading(true);
		try {
			await Promise.all([fetchPHRequests(1), fetchGHRequests(1)]);
		} catch (error: any) {
			toast.error('Failed to load initial data');
			logger.error('Failed to load initial data', error);
		} finally {
			setLoading(false);
		}
	};

	// Fetch PH requests with pagination
	const fetchPHRequests = async (page: number) => {
		setPHLoading(true);
		try {
			const res = await fetchWithAuth(`/api/ph-requests/all?status=not-complete&limit=${itemsPerPage}`);
			const json = await res.json();
			logger.log('PH Requests API Response:', json);
			const requests: PHRequest[] = formatRequests(json.data.requests || []);
			setAllPHRequests(requests);
			setPHTotalPages(Math.ceil(json.data.count / itemsPerPage));
			filterPHRequests(requests, phSearchTerm);
		} catch (error: any) {
			toast.error('Failed to load PH requests');
			logger.error('Failed to load PH requests', error);
			setAllPHRequests([]);
			setFilteredPHRequests([]);
		} finally {
			setPHLoading(false);
		}
	};

	// Fetch GH requests with pagination
	const fetchGHRequests = async (page: number) => {
		setGHLoading(true);
		try {
			const res = await fetchWithAuth(`/api/gh-requests/all?status=not-complete&page=${page}&limit=${itemsPerPage}`);
			const json = await res.json();
			logger.log('GH Requests API Response:', json);
			const requests: GHRequest[] = (json.data.requests || []).map((req: any) => ({
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
				remainingAmount: req.remainingAmountToReceive ? Number(req.remainingAmountToReceive) : Number(req.amount) - (req.matchedAmount || 0),
				dateCreated: req.created_at,
				status: req.status || 'pending',
				notes: req.notes || '',
			}));
			setAllGHRequests(requests);
			setGHTotalPages(Math.ceil(json.data.count / itemsPerPage));
			filterGHRequests(requests, ghSearchTerm);
		} catch (error: any) {
			toast.error('Failed to load GH requests');
			logger.error('Failed to load GH requests', error);
			setAllGHRequests([]);
			setFilteredGHRequests([]);
		} finally {
			setGHLoading(false);
		}
	};

	// Filter PH requests based on search term
	const filterPHRequests = (requests: PHRequest[], search: string) => {
		const filtered = requests.filter((request) => {
			const matchesSearch = request.user.name.toLowerCase().includes(search.toLowerCase()) || request.user.email.toLowerCase().includes(search.toLowerCase());
			const isValid = (request.availableAmount || request.remainingAmountToPay || 0) > 0 && (request.status === 'pending' || request.status === 'partial-match');
			logger.log('Filtering PH request:', { id: request.id, matchesSearch, isValid });
			return matchesSearch && isValid;
		});
		setFilteredPHRequests(filtered);
		logger.log('Filtered PH requests:', filtered);
	};

	// Filter GH requests based on search term
	const filterGHRequests = (requests: GHRequest[], search: string) => {
		const filtered = requests.filter((request) => {
			const matchesSearch = request.user.name.toLowerCase().includes(search.toLowerCase()) || request.user.email.toLowerCase().includes(search.toLowerCase());
			const isValid = (request.remainingAmount || 0) > 0 && (request.status === 'pending' || request.status === 'partial-match');
			logger.log('Filtering GH request:', { id: request.id, matchesSearch, isValid });
			return matchesSearch && isValid;
		});
		setFilteredGHRequests(filtered);
		logger.log('Filtered GH requests:', filtered);
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

	// Check if matching is possible
	const canMatch = () => {
		if (selectedPHRequests.length === 0 || selectedGHRequests.length === 0) {
			return false;
		}
		const totalPHAmount = selectedPHRequests.reduce((sum, r) => sum + (r.availableAmount || 0), 0);
		const totalGHAmount = selectedGHRequests.reduce((sum, r) => sum + (r.remainingAmount || 0), 0);
		logger.log('canMatch check:', { selectedPHRequests, selectedGHRequests, totalPHAmount, totalGHAmount });
		// return totalPHAmount >= totalGHAmount;
		return true;
	};

	// Generate matches from selected requests
	const generateMatches = () => {
		const matches: { ph_request: string; gh_request: string; user: string; gh_user: string; amount: number }[] = [];
		let remainingGHRequests = [...selectedGHRequests];

		for (const ph of selectedPHRequests) {
			let phAvailable = ph.availableAmount || 0;
			for (let i = 0; i < remainingGHRequests.length && phAvailable > 0; i++) {
				const gh = remainingGHRequests[i];
				const ghNeeded = gh.remainingAmount || 0;
				if (ghNeeded <= 0) continue;
				const matchAmount = Math.min(phAvailable, ghNeeded);
				matches.push({
					ph_request: ph.id,
					gh_request: gh.id,
					user: ph.user.id,
					gh_user: gh.user.id,
					amount: matchAmount,
				});
				phAvailable -= matchAmount;
				remainingGHRequests[i] = { ...gh, remainingAmount: ghNeeded - matchAmount };
			}
		}
		logger.log('Generated matches:', matches);
		return matches;
	};

	// Handle match confirmation
	const handleConfirmMatch = async () => {
		if (!canMatch()) {
			toast.error('Cannot match: insufficient PH amount or no selections');
			return;
		}

		setMatching(true);
		try {
			const matches = generateMatches();
			if (matches.length === 0) {
				throw new Error('No valid matches generated');
			}

			const res = await fetchWithAuth('/api/matches', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ matches }),
			});
			const data = await res.json();
			if (!res.ok) {
				throw new Error(handleFetchMessage(data?.message || 'Failed to create matches'));
			}
			logger.log('Match created successfully:', data);
			await Promise.all([fetchPHRequests(phCurrentPage), fetchGHRequests(ghCurrentPage)]);
			setSelectedPHRequests([]);
			setSelectedGHRequests([]);
			toast.success(`Successfully matched ${matches.length} pairs!`);
		} catch (error: any) {
			toast.error(error.message || 'Failed to match users');
			logger.error('Failed to match users', error);
		} finally {
			setMatching(false);
		}
	};

	// Handle PH page change
	const handlePHPageChange = async (page: number) => {
		if (page < 1 || page > phTotalPages) return;
		await fetchPHRequests(page);
		setPHCurrentPage(page);
	};

	// Handle GH page change
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
		<div className="space-y-6">
			<header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
				<div className="flex items-center gap-4">
					<CustomLink href={`/admin/${to}`}>
						<Button variant="outline" size="icon">
							<i className="ri-arrow-left-line"></i>
						</Button>
					</CustomLink>
					<div>
						<h1 className="text-3xl font-bold text-slate-800">Multiple Match</h1>
						<p className="text-slate-500 mt-1">Select requests from both columns to match them.</p>
					</div>
				</div>
				<Button onClick={handleConfirmMatch} disabled={matching || !canMatch()} className="min-w-[160px]">
					{matching ? 'Matching...' : 'Confirm Match'}
				</Button>
			</header>

			{(selectedPHRequests.length > 0 || selectedGHRequests.length > 0) && (
				<div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
					<div className="flex flex-col sm:flex-row items-center justify-between text-sm gap-4">
						<div className="flex items-center gap-4">
							<span className="font-medium text-indigo-800">
								PH Selected: {selectedPHRequests.length} ({totalPHAmount.toLocaleString()} {getSettings()?.baseCurrency})
							</span>
							<span className="font-medium text-indigo-800">
								GH Selected: {selectedGHRequests.length} ({totalGHAmount.toLocaleString()} {getSettings()?.baseCurrency})
							</span>
						</div>
						<div className={cn('font-semibold', canMatch() ? 'text-green-600' : 'text-amber-600')}>{canMatch() ? 'Ready to Match' : 'Select from both lists'}</div>
					</div>
				</div>
			)}

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
				<Card>
					<CardHeader>
						<CardTitle>Available PH Requests</CardTitle>
						<CardDescription>Select users who are providing help.</CardDescription>
					</CardHeader>
					<CardContent className="p-0">
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
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Available GH Requests</CardTitle>
						<CardDescription>Select users who need to get help.</CardDescription>
					</CardHeader>
					<CardContent className="p-0">
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
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
