'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { NetworkSkeleton } from '@/components/LoadingSkeleton';
import { Button } from '@/components/ui/button';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { logger } from '@/lib/logger';
import { formatCurrency, getCurrencyFromLocalStorage, getSettings, handleFetchMessage } from '@/lib/helpers';
import { getCurrentUser } from '@/lib/userUtils';
import { toast } from 'sonner';
import nProgress from 'nprogress';
import { useRouter } from 'next/navigation';

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

	const usersPerPage = 10;

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
				total = data.count || members.length; // Use 'count' from API response
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
				username: m.username || m.name, // Fallback to name if username is missing
				avatar: m.avatar,
				joinDate: m.joinedDate,
				level: m.level || 1,
				status: m.status || 'active',
				totalHelp: m.amount ? Number(m.amount) : 0,
			}));
			setNetworkStats(stats);
			setNetworkMembers(mappedMembers);
			setTotalCount(total);
			logger.log('Total Count:', total, 'Total Pages:', Math.ceil(total / usersPerPage));
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
		return new Date(dateString).toLocaleDateString('en-GH', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		});
	};

	const getLevelBadgeClass = (level: number) => {
		const colors = [
			'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200',
			'bg-teal-100 text-teal-800 dark:bg-teal-900/20 dark:text-teal-200',
			'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-200',
			'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-200',
			'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200',
			'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-200',
			'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200',
			'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200',
			'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-200',
			'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-100',
		];
		return colors[(level - 1) % colors.length];
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
				for (let i = 1; i <= 4; i++) {
					pages.push(i);
				}
				pages.push('...');
				pages.push(totalPages - 1);
				pages.push(totalPages);
			} else if (currentPage >= totalPages - 2) {
				pages.push(1);
				pages.push(2);
				pages.push('...');
				for (let i = totalPages - 3; i <= totalPages; i++) {
					pages.push(i);
				}
			} else {
				pages.push(1);
				pages.push('...');
				for (let i = currentPage - 1; i <= currentPage + 1; i++) {
					pages.push(i);
				}
				pages.push('...');
				pages.push(totalPages);
			}
		}

		return pages;
	};

	if (isLoading) {
		return <NetworkSkeleton />;
	}

	if (!networkStats) {
		return (
			<div className="p-4 lg:p-6 flex items-center justify-center min-h-screen">
				<div className="text-center">
					<i className="ri-error-warning-line w-12 h-12 flex items-center justify-center mx-auto mb-4 text-destructive"></i>
					<h3 className="text-lg font-semibold text-foreground mb-2">Failed to load network data</h3>
					<p className="text-muted-foreground">Please try refreshing the page</p>
				</div>
			</div>
		);
	}

	return (
		<div className="p-4 lg:p-6">
			<div className="max-w-6xl mx-auto space-y-6">
				{/* Header */}
				<div className="flex items-center justify-between">
					<h1 className="text-2xl font-bold text-foreground">My Network</h1>
				</div>

				{/* Stats Cards */}
				<div className="grid grid-cols-1 md:grid-cols-4 gap-4 lg:gap-6">
					<Card>
						<CardContent className="p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-muted-foreground">Total Members</p>
									<p className="text-2xl font-bold text-foreground">{networkStats.totalMembers}</p>
								</div>
								<div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
									<i className="ri-group-line w-6 h-6 flex items-center justify-center text-blue-600 dark:text-blue-400"></i>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-muted-foreground">Active Members</p>
									<p className="text-2xl font-bold text-foreground">{networkStats.activeMembers.toLocaleString()}</p>
								</div>
								<div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
									<i className="ri-user-star-line w-6 h-6 flex items-center justify-center text-green-600 dark:text-green-400"></i>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-muted-foreground">Total Bonus</p>
									<p className="text-2xl font-bold text-foreground">{formatCurrency(networkStats.totalHelpProvided)}</p>
								</div>
								<div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
									<i className="ri-hand-heart-line w-6 h-6 flex items-center justify-center text-purple-600 dark:text-purple-400"></i>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-muted-foreground">Total Bonus Withdrawn</p>
									<p className="text-2xl font-bold text-foreground">{formatCurrency(networkStats.totalBonusWithdrawn ?? 0)}</p>
								</div>
								<div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center">
									<i className="ri-wallet-3-line w-6 h-6 flex items-center justify-center text-yellow-600 dark:text-yellow-400"></i>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Members List */}
				<Card>
					<CardContent className="p-6">
						<div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between mb-6">
							<h2 className="text-xl font-semibold text-foreground">Network Members</h2>
							<div className="relative flex-1 lg:max-w-md">
								<i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 flex items-center justify-center"></i>
								<input type="text" placeholder="Search members..." value={searchQuery} onChange={(e) => handleSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-ring text-sm bg-background" />
								{searchLoading && <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground">Searching...</span>}
							</div>
							<Button
								size="sm"
								className="ml-2 bg-green-600 hover:bg-green-700 text-white px-3 py-1 text-xs"
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
										if (!res.ok) {
											throw new Error(handleFetchMessage(data, 'Failed to request GH'));
										} else {
											nProgress.start();
											router.push('/user/get-help');
										}
										toast.success('GH request submitted successfully!');
									} catch (err: any) {
										toast.error(handleFetchMessage(err, 'Failed to request GH'));
									} finally {
										setIsRequestingGH(null);
									}
								}}
								disabled={availableAmount < threshold || isRequestingGH === 'bonus'}
							>
								{isRequestingGH === 'bonus' ? (
									<div className="flex items-center gap-2">
										<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
										<span>Requesting...</span>
									</div>
								) : (
									'Request GH'
								)}
							</Button>
						</div>

						<div className="space-y-4">
							{pageLoading ? (
								<div className="flex items-center justify-center py-10">
									<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
								</div>
							) : networkMembers.length > 0 ? (
								networkMembers.map((member, index) => (
									<div key={member.id} className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors">
										<div className="relative">
											<img src={member.avatar} alt={member.name} className="w-12 h-12 rounded-full object-cover" />
											<div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${member.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
										</div>
										<div className="flex-1 min-w-0">
											<div className="flex items-center gap-2 mb-1">
												<h3 className="font-medium text-foreground">{member.name}</h3>
												<span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${getLevelBadgeClass(member.level)}`}>Level {member.level}</span>
											</div>
											<p className="text-xs text-muted-foreground">Joined {formatDate(member.joinDate)}</p>
										</div>
										<div className="text-right">
											<p className="text-sm font-medium text-foreground">{formatCurrency(member.totalHelp)}</p>
											<p className="text-xs text-muted-foreground">Bonus Earned</p>
										</div>
									</div>
								))
							) : (
								<div className="text-center py-8">
									<i className="ri-user-search-line w-12 h-12 flex items-center justify-center mx-auto mb-4 text-muted-foreground"></i>
									<h3 className="text-lg font-medium text-foreground mb-2">No members found</h3>
									<p className="text-muted-foreground">{searchQuery ? 'Try adjusting your search terms' : 'Your network is empty'}</p>
								</div>
							)}
						</div>

						{/* Pagination */}
						{totalPages > 1 && !pageLoading && (
							<div className="flex justify-center items-center gap-2 mt-6">
								<button
									onClick={() => handlePageChange(currentPage - 1)}
									disabled={currentPage === 1}
									className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
								>
									<i className="ri-arrow-left-line w-4 h-4 flex items-center justify-center"></i>
								</button>
								{generatePageNumbers().map((page, index) => (
									<button
										key={index}
										onClick={() => typeof page === 'number' && handlePageChange(page)}
										disabled={page === '...' || page === currentPage}
										className={`px-3 py-2 rounded-lg border cursor-pointer ${page === currentPage ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'} ${
											page === '...' ? 'cursor-default' : ''
										}`}
									>
										{page}
									</button>
								))}
								<button
									onClick={() => handlePageChange(currentPage + 1)}
									disabled={currentPage === totalPages}
									className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
								>
									<i className="ri-arrow-right-line w-4 h-4 flex items-center justify-center"></i>
								</button>
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
