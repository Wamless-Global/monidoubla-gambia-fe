'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { CustomLink } from '@/components/CustomLink';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { logger } from '@/lib/logger';
import { getCurrencyFromLocalStorage, parseMaturityDays } from '@/lib/helpers';

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
	const [requestingHelp, setRequestingHelp] = useState<string | null>(null);
	const [isMounted, setIsMounted] = useState(false);

	useEffect(() => {
		setIsMounted(true);
		loadUserData();
		// eslint-disable-next-line
	}, []);

	const loadUserData = async () => {
		setLoading(true);
		try {
			const phRes = await fetchWithAuth('/api/gh-requests');
			const phJson = await phRes.json();
			const phData = phJson.data?.requests || [];
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
					package: req.phRequest?.packageInfo?.name || 'Unknown Package',
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
		} catch (error) {
			logger.error('Failed to load data:', error);
			toast.error('Failed to load data');
		} finally {
			setLoading(false);
		}
	};

	const handleRequestHelp = async (phId: string) => {
		setRequestingHelp(phId);
		try {
			const response = await fetchWithAuth('/api/gh-requests', {
				method: 'POST',
				body: JSON.stringify({ phId }),
			});
			if (!response.ok) throw new Error('Failed to submit help request');
			setPHRecords((prevRecords) => prevRecords.map((record) => (record.id === phId ? { ...record, status: 'pending', ghRequestId: `gh-${Date.now()}` } : record)));
			toast.success('Help request submitted successfully!');
			setUserState('gh-requested');
		} catch (error) {
			logger.error('Failed to submit help request:', error);
			toast.error('Failed to submit help request');
		} finally {
			setRequestingHelp(null);
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'pending':
			case 'waiting-match':
				return 'bg-gradient-to-r from-blue-200/80 to-blue-100/60 text-blue-800 dark:from-blue-900/40 dark:to-blue-900/10 dark:text-blue-200';
			case 'partial-match':
				return 'bg-gradient-to-r from-orange-200/80 to-orange-100/60 text-orange-800 dark:from-orange-900/40 dark:to-orange-900/10 dark:text-orange-200';
			case 'matched':
				return 'bg-gradient-to-r from-purple-200/80 to-purple-100/60 text-purple-800 dark:from-purple-900/40 dark:to-purple-900/10 dark:text-purple-200';
			case 'active':
				return 'bg-gradient-to-r from-green-200/80 to-green-100/60 text-green-800 dark:from-green-900/40 dark:to-green-900/10 dark:text-green-200';
			case 'completed':
				return 'bg-gradient-to-r from-green-200/80 to-green-100/60 text-green-800 dark:from-green-900/40 dark:to-green-900/10 dark:text-green-200';
			case 'cancelled':
				return 'bg-gradient-to-r from-red-200/80 to-red-100/60 text-red-800 dark:from-red-900/40 dark:to-red-900/10 dark:text-red-200';
			default:
				return 'bg-gradient-to-r from-gray-200/80 to-gray-100/60 text-gray-800 dark:from-gray-900/40 dark:to-gray-900/10 dark:text-gray-200';
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

	// Loading state - glassmorphic skeletons
	if (!isMounted || loading) {
		return (
			<div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background to-blue-50 dark:to-blue-950/40">
				<div className="w-full max-w-6xl px-4 lg:px-0">
					<div className="animate-pulse space-y-8">
						<div className="h-8 w-48 rounded-lg bg-gradient-to-r from-blue-200/60 to-blue-100/30 mb-6" />
						<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
							{[...Array(4)].map((_, i) => (
								<div key={i} className="rounded-xl bg-gradient-to-br from-white/60 to-blue-100/30 dark:from-blue-900/30 dark:to-blue-950/10 shadow-lg p-4">
									<div className="flex items-center gap-3">
										<div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-200/60 to-blue-100/30 dark:from-blue-900/30 dark:to-blue-950/10" />
										<div>
											<div className="h-3 w-20 rounded bg-blue-100/60 dark:bg-blue-900/20 mb-2" />
											<div className="h-5 w-16 rounded bg-blue-100/60 dark:bg-blue-900/20" />
										</div>
									</div>
								</div>
							))}
						</div>
						<div className="rounded-xl bg-gradient-to-br from-white/60 to-blue-100/30 dark:from-blue-900/30 dark:to-blue-950/10 shadow-lg p-6">
							<div className="h-6 w-48 rounded bg-blue-100/60 dark:bg-blue-900/20 mb-6" />
							<div className="overflow-x-auto">
								<table className="w-full">
									<thead>
										<tr>
											{[...Array(6)].map((_, i) => (
												<th key={i} className="px-6 py-3">
													<div className="h-4 w-20 rounded bg-blue-100/60 dark:bg-blue-900/20" />
												</th>
											))}
										</tr>
									</thead>
									<tbody>
										{[...Array(5)].map((_, i) => (
											<tr key={i}>
												{[...Array(6)].map((_, j) => (
													<td key={j} className="px-6 py-4">
														<div className="h-4 w-16 rounded bg-blue-100/60 dark:bg-blue-900/20" />
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
			</div>
		);
	}

	// No PH state - glassmorphic card
	if (userState === 'no-ph') {
		return (
			<div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background to-blue-50 dark:to-blue-950/40">
				<div className="max-w-xl w-full mx-auto text-center py-20 px-4">
					<div className="w-24 h-24 bg-gradient-to-br from-blue-200/80 to-blue-100/60 dark:from-blue-900/40 dark:to-blue-950/10 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
						<i className="ri-hand-heart-line w-12 h-12 flex items-center justify-center text-blue-600 dark:text-blue-300" />
					</div>
					<h1 className="text-3xl font-extrabold text-foreground mb-4 tracking-tight">Provide Help First</h1>
					<p className="text-lg text-muted-foreground mb-8">To get help, you need to provide help first. Start by helping others in the community and watch your donation grow.</p>
					<CustomLink href="/user/provide-help">
						<Button className="bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white px-8 py-3 text-base font-semibold rounded-xl shadow-lg">
							<i className="ri-hand-heart-line w-5 h-5 flex items-center justify-center mr-2" />
							Provide Help Now
						</Button>
					</CustomLink>
				</div>
			</div>
		);
	}

	// Main content - glassmorphic, modern, flat design
	return (
		<div className="min-h-screen bg-gradient-to-br from-background to-blue-50 dark:to-blue-950/40 py-8 px-2 lg:px-0" suppressHydrationWarning={true}>
			<div className="max-w-6xl mx-auto w-full">
				<h1 className="text-3xl font-extrabold text-foreground mb-8 tracking-tight">Get Help</h1>
				{/* Stat cards */}
				<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
					<Card className="p-5 bg-gradient-to-br from-blue-100/80 to-white/60 dark:from-blue-900/40 dark:to-blue-950/10 shadow-lg rounded-xl border-0">
						<CardContent className="p-0">
							<div className="flex items-center gap-3">
								<div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-200/80 to-blue-100/60 dark:from-blue-900/40 dark:to-blue-950/10 flex items-center justify-center">
									<i className="ri-wallet-line w-6 h-6 text-blue-600 dark:text-blue-300" />
								</div>
								<div>
									<div className="text-sm font-medium text-blue-600 dark:text-blue-300">Total Provided</div>
									<div className="text-xl font-bold text-blue-900 dark:text-blue-100">
										{phRecords.reduce((sum, record) => sum + (record?.originalAmount || record.amount), 0)}&nbsp;
										{getCurrencyFromLocalStorage()?.code}
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
					<Card className="p-5 bg-gradient-to-br from-green-100/80 to-white/60 dark:from-green-900/40 dark:to-green-950/10 shadow-lg rounded-xl border-0">
						<CardContent className="p-0">
							<div className="flex items-center gap-3">
								<div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-200/80 to-green-100/60 dark:from-green-900/40 dark:to-green-950/10 flex items-center justify-center">
									<i className="ri-money-dollar-circle-line w-6 h-6 text-green-600 dark:text-green-300" />
								</div>
								<div>
									<div className="text-sm font-medium text-green-600 dark:text-green-300">Available to Request</div>
									<div className="text-xl font-bold text-green-900 dark:text-green-100">
										{phRecords
											.filter((r) => r.status === 'active')
											.reduce((sum, record) => sum + record.maturedAmount, 0)
											.toFixed(2)}
										&nbsp;
										{getCurrencyFromLocalStorage()?.code}
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
					<Card className="p-5 bg-gradient-to-br from-yellow-100/80 to-white/60 dark:from-yellow-900/40 dark:to-yellow-950/10 shadow-lg rounded-xl border-0">
						<CardContent className="p-0">
							<div className="flex items-center gap-3">
								<div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-200/80 to-yellow-100/60 dark:from-yellow-900/40 dark:to-yellow-950/10 flex items-center justify-center">
									<i className="ri-time-line w-6 h-6 text-yellow-600 dark:text-yellow-300" />
								</div>
								<div>
									<div className="text-sm font-medium text-yellow-600 dark:text-yellow-300">Pending Requests</div>
									<div className="text-xl font-bold text-yellow-900 dark:text-yellow-100">{phRecords.filter((r) => r.status === 'pending' || r.status === 'waiting-match').length}</div>
								</div>
							</div>
						</CardContent>
					</Card>
					<Card className="p-5 bg-gradient-to-br from-purple-100/80 to-white/60 dark:from-purple-900/40 dark:to-purple-950/10 shadow-lg rounded-xl border-0">
						<CardContent className="p-0">
							<div className="flex items-center gap-3">
								<div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-200/80 to-purple-100/60 dark:from-purple-900/40 dark:to-purple-950/10 flex items-center justify-center">
									<i className="ri-group-line w-6 h-6 text-purple-600 dark:text-purple-300" />
								</div>
								<div>
									<div className="text-sm font-medium text-purple-600 dark:text-purple-300">Matched Requests</div>
									<div className="text-xl font-bold text-purple-900 dark:text-purple-100">{phRecords.filter((r) => r.status === 'matched' || r.status === 'partial-match').length}</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Help records table */}
				<Card className="bg-gradient-to-br from-white/80 to-blue-50/40 dark:from-blue-900/30 dark:to-blue-950/10 border-0 shadow-lg rounded-xl overflow-hidden">
					<div className="p-6 border-b border-border/40 bg-gradient-to-r from-blue-100/40 to-white/10 dark:from-blue-900/20 dark:to-blue-950/5">
						<h2 className="text-xl font-bold text-foreground tracking-tight">Your Help Records</h2>
					</div>
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead className="bg-gradient-to-r from-blue-50/60 to-white/10 dark:from-blue-900/10 dark:to-blue-950/5">
								<tr>
									<th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Package</th>
									<th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Amount</th>
									<th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Matured Amount</th>
									<th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Maturity Date</th>
									<th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
									<th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-border/40">
								{phRecords.map((record) => (
									<tr key={record.id} className="hover:bg-gradient-to-r hover:from-blue-100/40 hover:to-white/10 dark:hover:from-blue-900/10 dark:hover:to-blue-950/5 transition-all">
										<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">{record.package}</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
											<span className="font-semibold">
												{record?.originalAmount || record.amount}&nbsp;
												{getCurrencyFromLocalStorage()?.code}
											</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-green-700 dark:text-green-300">
											<span className="font-semibold">
												{record.maturedAmount.toFixed(2)}&nbsp;
												{getCurrencyFromLocalStorage()?.code}
											</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">{formatDate(record.maturityDate)}</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${getStatusColor(record.status)}`}>{getStatusText(record.status)}</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm">
											<div className="flex items-center gap-2">
												{record.status === 'active' && (
													<Button onClick={() => handleRequestHelp(record.id)} disabled={requestingHelp === record.id} className="bg-gradient-to-r from-green-600 to-green-400 hover:from-green-700 hover:to-green-500 text-white text-sm px-4 py-1.5 rounded-lg shadow-md">
														{requestingHelp === record.id ? (
															<div className="flex items-center gap-2">
																<div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" />
																<span>Requesting...</span>
															</div>
														) : (
															<>
																<i className="ri-hand-heart-line w-4 h-4 flex items-center justify-center mr-1" />
																Request Help
															</>
														)}
													</Button>
												)}
												{(record.status === 'matched' || record.status === 'partial-match' || record.status === 'completed') && (
													<CustomLink href={`/user/get-help/${record.id}`}>
														<Button variant="outline" className="bg-gradient-to-r from-blue-100/60 to-white/10 dark:from-blue-900/10 dark:to-blue-950/5 border border-border text-foreground hover:bg-accent text-sm px-4 py-1.5 rounded-lg shadow-md">
															<i className="ri-eye-line w-4 h-4 flex items-center justify-center mr-1" />
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
				</Card>
			</div>
		</div>
	);
}
