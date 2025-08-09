'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { CustomLink } from '@/components/CustomLink';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { logger } from '@/lib/logger';
import { getCurrencyFromLocalStorage, handleFetchMessage, parseMaturityDays, getSettings } from '@/lib/helpers';

interface PHRecord {
	id: string;
	amount: number;
	dateProvided: string;
	maturityDate: string;
	status: 'pending' | 'waiting-match' | 'partial-match' | 'matched' | 'active' | 'completed' | 'cancelled';
	package: string;
	profitPercentage: number;
	maturedAmount: number;
	ghRequestId?: string;
	originalAmount?: number;
	matchedUsers?: MatchedUser[];
}

interface MatchedUser {
	id: string;
	name: string;
	email: string;
	amount: number;
	paymentProof?: string;
	paymentStatus: 'pending' | 'proof-submitted' | 'confirmed' | 'declined' | 'cancelled';
	paymentDate?: string;
}

export default function GetHelpPage() {
	const [userState, setUserState] = useState<'no-ph' | 'ph-not-matured' | 'ph-matured' | 'gh-requested' | 'gh-matched'>('no-ph');
	const [phRecords, setPHRecords] = useState<PHRecord[]>([]);
	const [loading, setLoading] = useState(true);
	const [pageLoading, setPageLoading] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);
	const [totalCount, setTotalCount] = useState(0);
	const recordsPerPage = 10;
	const [requestingHelp, setRequestingHelp] = useState<string | null>(null);
	const [isMounted, setIsMounted] = useState(false);

	const loadUserData = useCallback(async (page = 1) => {
		if (page > 1) setPageLoading(true);
		else setLoading(true);
		try {
			const params = new URLSearchParams();
			params.append('page', page.toString());
			params.append('limit', recordsPerPage.toString());
			const phRes = await fetchWithAuth(`/api/gh-requests?${params.toString()}`);
			const phJson = await phRes.json();

			if (!phRes.ok) {
				throw new Error(handleFetchMessage(phJson, 'Failed to fetch help records'));
			}

			const phData = phJson.data?.requests || [];
			const total = phJson.data.count || phData.length;

			const mappedPH: PHRecord[] = phData.map((req: any) => {
				let status: PHRecord['status'] = 'pending';
				switch (req.status) {
					case 'pending':
						status = 'pending';
						break;
					case 'waiting-match':
						status = 'waiting-match';
						break;
					case 'partial-match':
						status = 'partial-match';
						break;
					case 'matched':
						status = 'matched';
						break;
					case 'active':
						status = 'active';
						break;
					case 'completed':
						status = 'completed';
						break;
					case 'cancelled':
						status = 'cancelled';
						break;
					default:
						status = 'pending';
				}

				const maturityPeriod = req.phRequest?.packageInfo?.maturity ? parseMaturityDays(req.phRequest?.packageInfo?.maturity) : 0;
				const dateProvided = req.created_at || new Date().toISOString();
				const maturityDate = new Date(dateProvided);
				maturityDate.setDate(maturityDate.getDate() + maturityPeriod);

				const profitPercentage = Number(req.packageInfo?.gain || 0);
				const maturedAmount = Number(req.amount) * (1 + profitPercentage / 100);

				return {
					id: req.id,
					amount: Number(req.amount),
					originalAmount: req.phRequest?.amount || 0,
					dateProvided,
					maturityDate: maturityDate.toISOString().split('T')[0],
					status,
					package: req.phRequest?.packageInfo?.name || 'Bonus',
					profitPercentage,
					maturedAmount,
					ghRequestId: req.ghRequestId,
					matchedUsers: req.details?.map((u: any) => ({
						id: u.id,
						name: u.name,
						email: u.email || '',
						amount: Number(u.amount),
						paymentProof: u.paymentProof,
						paymentStatus: u.status === 'proof-submitted' ? 'proof-submitted' : u.status,
						paymentDate: u.paymentDate,
					})),
				};
			});

			const hasPH = mappedPH.length > 0;
			const hasMaturedPH = mappedPH.some((record) => record.status === 'active');
			const hasRequestedPH = mappedPH.some((record) => record.status === 'pending' || record.status === 'waiting-match');
			const hasMatchedPH = mappedPH.some((record) => record.status === 'matched' || record.status === 'partial-match');

			if (!hasPH) {
				setUserState('no-ph');
			} else if (hasMatchedPH) {
				setUserState('gh-matched');
			} else if (hasRequestedPH) {
				setUserState('gh-requested');
			} else if (hasMaturedPH) {
				setUserState('ph-matured');
			} else {
				setUserState('ph-not-matured');
			}

			setPHRecords(mappedPH);
			setTotalCount(total);
			logger.log('Total Count:', total, 'Total Pages:', Math.ceil(total / recordsPerPage));
		} catch (error) {
			logger.error('Failed to load data:', error);
			toast.error(handleFetchMessage(error, 'Failed to load help records'));
			setPHRecords([]);
			setTotalCount(0);
		} finally {
			setLoading(false);
			setPageLoading(false);
		}
	}, []);

	useEffect(() => {
		setIsMounted(true);
		loadUserData(1);
	}, [loadUserData]);

	const handlePageChange = (page: number) => {
		if (page >= 1 && page <= totalPages) {
			setCurrentPage(page);
			loadUserData(page);
		}
	};

	const handleRequestHelp = async (phId: string) => {
		setRequestingHelp(phId);
		try {
			const response = await fetchWithAuth('/api/gh-requests', {
				method: 'POST',
				body: JSON.stringify({ phId }),
			});

			if (!response.ok) {
				throw new Error(handleFetchMessage(await response.json(), 'Failed to submit help request'));
			}
			setPHRecords((prevRecords) => prevRecords.map((record) => (record.id === phId ? { ...record, status: 'pending', ghRequestId: `gh-${Date.now()}` } : record)));

			toast.success('Help request submitted successfully!');
			setUserState('gh-requested');
		} catch (error) {
			logger.error('Failed to submit help request:', error);
			toast.error(handleFetchMessage(error, 'Failed to submit help request'));
		} finally {
			setRequestingHelp(null);
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'pending':
			case 'waiting-match':
				return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
			case 'partial-match':
				return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
			case 'matched':
				return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
			case 'active':
				return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
			case 'completed':
				return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
			case 'cancelled':
				return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
			default:
				return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
		}
	};

	const getStatusText = (status: string) => {
		switch (status) {
			case 'pending':
			case 'waiting-match':
				return 'Waiting for Match';
			case 'partial-match':
				return 'Partially Matched';
			case 'matched':
				return 'Fully Matched';
			case 'active':
				return 'Active';
			case 'completed':
				return 'Completed';
			case 'cancelled':
				return 'Cancelled';
			default:
				return status;
		}
	};

	const getDaysUntilMaturity = (maturityDate: string) => {
		const today = new Date();
		const maturity = new Date(maturityDate);
		const diffTime = maturity.getTime() - today.getTime();
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		return diffDays;
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		});
	};

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: getSettings()?.baseCurrency || getCurrencyFromLocalStorage()?.code || 'GHS',
			minimumFractionDigits: 0,
		}).format(amount);
	};

	const totalPages = Math.ceil(totalCount / recordsPerPage);

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

	if (!isMounted) {
		return (
			<div className="flex items-center justify-center min-h-screen bg-background">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
			</div>
		);
	}

	if (loading) {
		return (
			<div className="p-4 lg:p-6 space-y-6 bg-background min-h-screen">
				<div className="animate-pulse">
					<div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-6"></div>
					<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
						{[...Array(4)].map((_, index) => (
							<div key={index} className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
								<div className="flex items-center gap-3">
									<div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
									<div>
										<div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-2"></div>
										<div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
									</div>
								</div>
							</div>
						))}
					</div>
					<div className="bg-card rounded-lg border border-border p-4 lg:p-6">
						<div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-6"></div>
						<div className="overflow-x-auto">
							<table className="w-full">
								<thead className="bg-gray-50 dark:bg-gray-700">
									<tr>
										{[...Array(6)].map((_, index) => (
											<th key={index} className="px-6 py-3">
												<div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-20"></div>
											</th>
										))}
									</tr>
								</thead>
								<tbody className="bg-background divide-y divide-gray-200 dark:divide-gray-700">
									{[...Array(5)].map((_, index) => (
										<tr key={index}>
											{[...Array(6)].map((_, cellIndex) => (
												<td key={cellIndex} className="px-6 py-4">
													<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
												</td>
											))}
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (userState === 'no-ph') {
		return (
			<div className="p-4 lg:p-6 bg-background min-h-screen">
				<div className="max-w-2xl mx-auto text-center py-20">
					<div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
						<i className="ri-hand-heart-line w-10 h-10 flex items-center justify-center text-blue-600 dark:text-blue-400"></i>
					</div>
					<h1 className="text-2xl font-bold text-foreground mb-4">Provide Help First</h1>
					<p className="text-muted-foreground mb-8">To get help, you need to provide help first. Start by helping others in the community and watch your donation grow.</p>
					<CustomLink href="/user/provide-help">
						<Button className="bg-blue-600 hover:bg-blue-700 text-white">
							<i className="ri-hand-heart-line w-4 h-4 flex items-center justify-center mr-2"></i>
							Provide Help Now
						</Button>
					</CustomLink>
				</div>
			</div>
		);
	}

	return (
		<div className="p-4 lg:p-6 bg-background min-h-screen" suppressHydrationWarning={true}>
			<div className="max-w-6xl mx-auto">
				<h1 className="text-2xl font-bold text-foreground mb-6">Get Help</h1>

				<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
					<Card className="p-4 bg-blue-50 dark:bg-blue-900/20">
						<CardContent className="p-0">
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
									<i className="ri-wallet-line w-5 h-5 flex items-center justify-center text-blue-600 dark:text-blue-400"></i>
								</div>
								<div>
									<div className="text-sm text-blue-600 dark:text-blue-400">Total Provided</div>
									<div className="text-lg font-semibold text-blue-900 dark:text-blue-300">{formatCurrency(phRecords.reduce((sum, record) => sum + (record?.originalAmount || record.amount), 0))}</div>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className="p-4 bg-green-50 dark:bg-green-900/20">
						<CardContent className="p-0">
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
									<i className="ri-money-dollar-circle-line w-5 h-5 flex items-center justify-center text-green-600 dark:text-green-400"></i>
								</div>
								<div>
									<div className="text-sm text-green-600 dark:text-green-400">Available to Request</div>
									<div className="text-lg font-semibold text-green-900 dark:text-green-300">{formatCurrency(phRecords.filter((r) => r.status === 'active').reduce((sum, record) => sum + record.maturedAmount, 0))}</div>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className="p-4 bg-yellow-50 dark:bg-yellow-900/20">
						<CardContent className="p-0">
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
									<i className="ri-time-line w-5 h-5 flex items-center justify-center text-yellow-600 dark:text-yellow-400"></i>
								</div>
								<div>
									<div className="text-sm text-yellow-600 dark:text-yellow-400">Pending Requests</div>
									<div className="text-lg font-semibold text-yellow-900 dark:text-yellow-300">{phRecords.filter((r) => r.status === 'pending' || r.status === 'waiting-match').length}</div>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className="p-4 bg-purple-50 dark:bg-purple-900/20">
						<CardContent className="p-0">
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
									<i className="ri-group-line w-5 h-5 flex items-center justify-center text-purple-600 dark:text-purple-400"></i>
								</div>
								<div>
									<div className="text-sm text-purple-600 dark:text-purple-400">Matched Requests</div>
									<div className="text-lg font-semibold text-purple-900 dark:text-purple-300">{phRecords.filter((r) => r.status === 'matched' || r.status === 'partial-match').length}</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				<Card className="bg-card border-0 shadow-sm rounded-lg overflow-hidden">
					<div className="p-6 border-b border-border">
						<h2 className="text-lg font-semibold text-foreground">Your Help Records</h2>
					</div>

					<div className="overflow-x-auto">
						<table className="w-full">
							<thead className="bg-gray-50 dark:bg-gray-700">
								<tr>
									<th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Package</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Amount</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Matured Amount</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Maturity Date</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
								</tr>
							</thead>
							<tbody className="bg-card divide-y divide-border">
								{phRecords.map((record) => (
									<tr key={record.id} className="hover:bg-accent/50">
										<td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">{record.package}</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
											<span className="font-medium">{formatCurrency(record?.originalAmount || record.amount)}</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 dark:text-green-400">
											<span className="font-medium">{formatCurrency(record.maturedAmount)}</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">{formatDate(record.maturityDate)}</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>{getStatusText(record.status)}</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm">
											<div className="flex items-center gap-2">
												{record.status === 'active' && (
													<Button onClick={() => handleRequestHelp(record.id)} disabled={requestingHelp === record.id} className="bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-1 whitespace-nowrap">
														{requestingHelp === record.id ? (
															<div className="flex items-center gap-2">
																<div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
																<span>Requesting...</span>
															</div>
														) : (
															<>
																<i className="ri-hand-heart-line w-3 h-3 flex items-center justify-center mr-1"></i>
																Request Help
															</>
														)}
													</Button>
												)}
												{(record.status === 'matched' || record.status === 'partial-match' || record.status === 'completed') && (
													<CustomLink href={`/user/get-help/${record.id}`}>
														<Button variant="outline" className="bg-card border-border text-foreground hover:bg-accent text-sm px-3 py-1 whitespace-nowrap">
															<i className="ri-eye-line w-3 h-3 flex items-center justify-center mr-1"></i>
															View Details
														</Button>
													</CustomLink>
												)}
												{(record.status === 'pending' || record.status === 'waiting-match') && <span className="text-xs text-muted-foreground">Waiting for match...</span>}
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>

					{/* Pagination */}
					{totalPages > 1 && !pageLoading && (
						<div className="flex justify-center items-center gap-2 mt-6 p-6">
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
				</Card>
				{pageLoading && (
					<div className="flex items-center justify-center py-10">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
					</div>
				)}
			</div>
		</div>
	);
}
