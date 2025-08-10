'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { NetworkSkeleton } from '@/components/LoadingSkeleton';
import { Button } from '@/components/ui/button';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { logger } from '@/lib/logger';
import { formatCurrency, getCurrencyFromLocalStorage, getSettings, handleFetchMessage } from '@/lib/helpers';
import { getCurrentUser } from '@/lib/userUtils';
import { toast } from 'sonner';
import nProgress from 'nprogress';
import { useRouter } from 'next/navigation';

// NOTE: All original interfaces and logic are preserved.
interface NetworkMember {
	id: string;
	name: string;
	username: string;
	avatar: string;
	joinDate: string;
	level: number;
	status: 'active' | 'inactive';
	totalHelp: number;
}

interface NetworkStats {
	totalMembers: number;
	activeMembers: number;
	totalHelpProvided: number;
	totalBonusWithdrawn?: number;
}

export default function NetworkPage() {
	// NOTE: All original state and hooks are preserved.
	const [isLoading, setIsLoading] = useState(true);
	const [networkStats, setNetworkStats] = useState<(NetworkStats & { totalBonusWithdrawn?: number }) | null>(null);
	const [networkMembers, setNetworkMembers] = useState<NetworkMember[]>([]);
	const [searchQuery, setSearchQuery] = useState('');
	const [searchLoading, setSearchLoading] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);
	const [totalCount, setTotalCount] = useState(0);
	const [pageLoading, setPageLoading] = useState(false);
	const [isRequestingGH, setIsRequestingGH] = useState<string | null>(null);

	const availableAmount = (networkStats?.totalHelpProvided || 0) - (networkStats?.totalBonusWithdrawn || 0);
	const threshold = Number(getSettings()?.bonusThreshold || 0);
	const router = useRouter();

	const usersPerPage = 15;

	// NOTE: All original functions and effects are preserved.
	const fetchNetworkData = useCallback(async (searchTerm = '', page = 1) => {
		if (searchTerm) setSearchLoading(true);
		else if (page > 1) setPageLoading(true);
		else setIsLoading(true);
		try {
			const params = new URLSearchParams();
			if (searchTerm) params.append('searchTerm', searchTerm);
			params.append('page', page.toString());
			params.append('pageSize', usersPerPage.toString());
			const res = await fetchWithAuth(`/api/referrals?${params.toString()}`);
			let members: any[] = [];
			let stats: NetworkStats | null = null;
			let total = 0;
			if (res.ok) {
				const data = await res.json();
				logger.log('API Response:', data);
				members = data.referrals || [];
				total = data.count || members.length;
				stats = {
					totalMembers: data.count ?? members.length,
					activeMembers: members.filter((m) => m.status === 'active').length,
					totalHelpProvided: members.reduce((sum, m) => sum + (m.amount ? Number(m.amount) : 0), 0),
					totalBonusWithdrawn: data.totalBonusAmountReceived ?? 0,
				};
			} else {
				throw new Error(handleFetchMessage(await res.json(), 'Failed to fetch referrals'));
			}
			const mappedMembers: NetworkMember[] = members.map((m) => ({
				id: m.id,
				name: m.name,
				username: m.username || m.name,
				avatar: m.avatar,
				joinDate: m.joinedDate,
				level: m.level || 1,
				status: m.status || 'active',
				totalHelp: m.amount ? Number(m.amount) : 0,
			}));
			setNetworkStats(stats);
			setNetworkMembers(mappedMembers);
			setTotalCount(total);
		} catch (error) {
			logger.error('Error fetching network data:', error);
			setNetworkStats(null);
			setNetworkMembers([]);
			setTotalCount(0);
			toast.error(handleFetchMessage(error, 'Failed to fetch network data'));
		} finally {
			setSearchLoading(false);
			setPageLoading(false);
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchNetworkData('', 1);
	}, [fetchNetworkData]);

	useEffect(() => {
		const delayDebounce = setTimeout(() => {
			setCurrentPage(1);
			fetchNetworkData(searchQuery.trim(), 1);
		}, 400);
		return () => clearTimeout(delayDebounce);
	}, [searchQuery, fetchNetworkData]);

	const handlePageChange = (page: number) => {
		if (page >= 1 && page <= totalPages) {
			setCurrentPage(page);
			fetchNetworkData(searchQuery.trim(), page);
		}
	};

	const handleSearch = (query: string) => {
		setSearchQuery(query);
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		});
	};

	const totalPages = Math.ceil(totalCount / usersPerPage);

	const generatePageNumbers = () => {
		const pages: (number | string)[] = [];
		const showPages = 5;

		if (totalPages <= showPages) {
			for (let i = 1; i <= totalPages; i++) {
				pages.push(i);
			}
		} else {
			if (currentPage <= 3) {
				pages.push(1, 2, 3, 4, '...', totalPages);
			} else if (currentPage >= totalPages - 2) {
				pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
			} else {
				pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
			}
		}
		return pages;
	};

	if (isLoading) {
		return <NetworkSkeleton />;
	}

	if (!networkStats) {
		return (
			<div className="bg-gray-50 min-h-screen flex items-center justify-center">
				<div className="text-center p-8">
					<i className="ri-cloud-off-line text-4xl text-gray-400 mx-auto mb-4"></i>
					<h3 className="text-xl font-semibold text-gray-700 mb-2">Could Not Load Network Data</h3>
					<p className="text-gray-500">There was an issue fetching your data. Please refresh the page to try again.</p>
				</div>
			</div>
		);
	}

	return (
		<div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8">
			<div className="max-w-7xl mx-auto">
				{/* Page Header */}
				<header className="mb-8">
					<h1 className="text-3xl font-bold text-gray-800">My Network</h1>
					<p className="text-gray-500 mt-1">An overview of your network members and bonus earnings.</p>
				</header>

				{/* Main Content Grid (Two-Column Layout) */}
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* Left Column: Stats & Actions */}
					<aside className="lg:col-span-1 space-y-6">
						<Card className="shadow-sm border-gray-200 bg-white">
							<CardHeader>
								<CardTitle className="text-lg font-semibold text-gray-700">Network Overview</CardTitle>
							</CardHeader>
							<CardContent className="space-y-5">
								<div className="flex items-center justify-between">
									<span className="text-gray-500">Total Members</span>
									<span className="font-semibold text-gray-800">{networkStats.totalMembers.toLocaleString()}</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-gray-500">Active Members</span>
									<span className="font-semibold text-gray-800">{networkStats.activeMembers.toLocaleString()}</span>
								</div>
								<hr className="border-t border-gray-200" />
								<div className="flex items-center justify-between">
									<span className="text-gray-500">Total Bonus Earned</span>
									<span className="font-semibold text-teal-600">{formatCurrency(networkStats.totalHelpProvided)}</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-gray-500">Total Bonus Withdrawn</span>
									<span className="font-semibold text-gray-800">{formatCurrency(networkStats.totalBonusWithdrawn ?? 0)}</span>
								</div>
								<div className="p-4 bg-gray-100 rounded-lg text-center">
									<p className="text-sm text-gray-500">Available for Withdrawal</p>
									<p className="text-2xl font-bold text-gray-800 mt-1">{formatCurrency(availableAmount)}</p>
								</div>
							</CardContent>
						</Card>

						<Card className="shadow-sm border-gray-200 bg-white">
							<CardHeader>
								<CardTitle className="text-lg font-semibold text-gray-700">Request Withdrawal</CardTitle>
								<CardDescription>Withdraw your available bonus earnings.</CardDescription>
							</CardHeader>
							<CardContent>
								<p className="text-xs text-gray-500 mb-4">
									A minimum of <span className="font-semibold text-gray-600">{formatCurrency(threshold)}</span> is required for withdrawal.
								</p>
								<Button
									className="w-full bg-teal-600 hover:bg-teal-700 text-white"
									onClick={async () => {
										setIsRequestingGH('bonus');
										try {
											const user = getCurrentUser();
											if (!user) {
												toast.error('User not found. Please log in again.');
												return;
											}
											if (availableAmount < threshold) throw Error(`You need at least ${formatCurrency(threshold)} to request GH.`);
											const res = await fetchWithAuth('/api/gh-requests', {
												method: 'POST',
												headers: { 'Content-Type': 'application/json' },
												body: JSON.stringify({ user: user.id, amount: availableAmount, status: 'pending', requestId: 'bonus' }),
											});
											const data = await res.json();
											if (!res.ok) throw new Error(handleFetchMessage(data, 'Failed to request GH'));
											nProgress.start();
											router.push('/user/get-help');
											toast.success('GH request submitted successfully!');
										} catch (err: any) {
											toast.error(handleFetchMessage(err, 'Failed to request GH'));
										} finally {
											setIsRequestingGH(null);
										}
									}}
									disabled={availableAmount < threshold || isRequestingGH === 'bonus'}
								>
									{isRequestingGH ? (
										<div className="flex items-center justify-center gap-2">
											<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
											<span>Processing...</span>
										</div>
									) : (
										'Request GH'
									)}
								</Button>
							</CardContent>
						</Card>
					</aside>

					{/* Right Column: Members List */}
					<div className="lg:col-span-2">
						<Card className="shadow-sm border-gray-200 bg-white">
							<CardHeader>
								<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
									<div>
										<CardTitle className="text-lg font-semibold text-gray-700">Network Members ({totalCount})</CardTitle>
										<CardDescription>View and search for members in your network.</CardDescription>
									</div>
									<div className="relative w-full sm:max-w-xs">
										<i className="ri-search-line absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"></i>
										<input
											type="text"
											placeholder="Search by name or username..."
											value={searchQuery}
											onChange={(e) => handleSearch(e.target.value)}
											className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm bg-white placeholder-gray-400"
										/>
										{searchLoading && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">...</span>}
									</div>
								</div>
							</CardHeader>
							<CardContent>
								{/* START: Redesigned Table-like list */}
								<div className="flow-root">
									{pageLoading ? (
										<div className="flex items-center justify-center h-64">
											<div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600"></div>
										</div>
									) : networkMembers.length > 0 ? (
										<div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
											<div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
												<div className="relative">
													{/* Table Header */}
													<div className="grid grid-cols-6 gap-x-6 border-b border-gray-200 px-6 pb-3">
														<div className="col-span-3 text-left text-sm font-semibold text-gray-900">Member</div>
														<div className="col-span-1 text-center text-sm font-semibold text-gray-900 hidden sm:block">Level</div>
														<div className="col-span-2 text-right text-sm font-semibold text-gray-900">Bonus Earned</div>
													</div>
													{/* Table Body */}
													<div className="divide-y divide-gray-200">
														{networkMembers.map((member) => (
															<div key={member.id} className="grid grid-cols-6 gap-x-6 px-6 py-4 hover:bg-gray-50 transition-colors">
																{/* Member Info */}
																<div className="col-span-3 flex items-center gap-4">
																	<div className="relative flex-shrink-0">
																		<img src={member.avatar} alt={member.name} className="w-10 h-10 rounded-full object-cover" />
																		<span className={`absolute -bottom-0.5 -right-0.5 block h-3 w-3 rounded-full border-2 border-white ${member.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
																	</div>
																	<div className="min-w-0">
																		<p className="font-medium text-gray-900 truncate">{member.name}</p>
																		<p className="text-xs text-gray-500 sm:hidden">Level {member.level}</p>
																		<p className="text-xs text-gray-500 hidden sm:block">Joined: {formatDate(member.joinDate)}</p>
																	</div>
																</div>
																{/* Level */}
																<div className="col-span-1 text-center self-center text-sm text-gray-500 hidden sm:block">
																	<span className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs font-medium">{member.level}</span>
																</div>
																{/* Bonus */}
																<div className="col-span-2 text-right self-center">
																	<p className="text-sm font-medium text-gray-900">{formatCurrency(member.totalHelp)}</p>
																</div>
															</div>
														))}
													</div>
												</div>
											</div>
										</div>
									) : (
										<div className="text-center py-16">
											<i className="ri-group-line text-4xl text-gray-400 mx-auto mb-4"></i>
											<h3 className="text-lg font-semibold text-gray-700">No Members Found</h3>
											<p className="text-gray-500 mt-1">{searchQuery ? 'Try a different search term.' : 'Your network is currently empty.'}</p>
										</div>
									)}
								</div>
								{/* END: Redesigned Table-like list */}

								{/* Pagination */}
								{totalPages > 1 && !pageLoading && (
									<div className="flex justify-center items-center gap-2 mt-8 text-sm">
										<button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
											<i className="ri-arrow-left-s-line"></i>
										</button>
										{generatePageNumbers().map((page, index) => (
											<button
												key={index}
												onClick={() => typeof page === 'number' && handlePageChange(page)}
												disabled={page === '...'}
												className={`w-9 h-9 rounded-lg transition-colors ${page === currentPage ? 'bg-teal-600 text-white font-semibold' : 'text-gray-600 hover:bg-gray-200'} ${page === '...' ? 'cursor-default' : ''}`}
											>
												{page}
											</button>
										))}
										<button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
											<i className="ri-arrow-right-s-line"></i>
										</button>
									</div>
								)}
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
}
