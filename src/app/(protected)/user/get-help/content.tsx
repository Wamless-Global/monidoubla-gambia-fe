'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { CustomLink } from '@/components/CustomLink';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { logger } from '@/lib/logger';
import { getCurrencyFromLocalStorage } from '@/lib/helpers';

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
	}, []);

	const loadUserData = async () => {
		setLoading(true);
		try {
			const phRes = await fetchWithAuth('/api/gh-requests');
			const phJson = await phRes.json();
			logger.log('PH Requests:', phJson);
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

				const maturityPeriod = req.packageInfo?.maturity ? Number(String(req.packageInfo.maturity).match(/(\d+)/)?.[1] || 0) : 0;
				const dateProvided = req.created_at || new Date().toISOString();
				const maturityDate = new Date(dateProvided);
				maturityDate.setDate(maturityDate.getDate() + maturityPeriod);

				const profitPercentage = Number(req.packageInfo?.gain || 0);
				const maturedAmount = Number(req.amount) * (1 + profitPercentage / 100);

				return {
					id: req.id,
					amount: Number(req.amount),
					dateProvided,
					maturityDate: maturityDate.toISOString().split('T')[0],
					status,
					package: req.packageInfo?.name || 'Unknown Package',
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

	if (!isMounted) {
		return (
			<div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-white to-emerald-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
			</div>
		);
	}

	if (loading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-emerald-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center">
				<div className="w-full max-w-6xl mx-auto p-8 animate-pulse">
					<div className="h-10 bg-indigo-100 dark:bg-indigo-900 rounded w-56 mb-8"></div>
					<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
						{[...Array(4)].map((_, index) => (
							<div key={index} className="bg-indigo-50 dark:bg-indigo-900 rounded-2xl p-6 shadow-lg"></div>
						))}
					</div>
					<div className="bg-white/90 dark:bg-gray-900/90 rounded-3xl border-2 border-indigo-100 dark:border-indigo-900 p-8">
						<div className="h-8 bg-indigo-100 dark:bg-indigo-900 rounded w-48 mb-6"></div>
						<div className="overflow-x-auto">
							<table className="w-full">
								<thead>
									<tr>
										{[...Array(6)].map((_, index) => (
											<th key={index} className="px-6 py-3">
												<div className="h-4 bg-indigo-100 dark:bg-indigo-900 rounded w-20"></div>
											</th>
										))}
									</tr>
								</thead>
								<tbody>
									{[...Array(5)].map((_, index) => (
										<tr key={index}>
											{[...Array(6)].map((_, cellIndex) => (
												<td key={cellIndex} className="px-6 py-4">
													<div className="h-4 bg-indigo-100 dark:bg-indigo-900 rounded w-16"></div>
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
			<div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-emerald-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center">
				<div className="max-w-2xl mx-auto text-center py-20">
					<div className="w-24 h-24 bg-gradient-to-tr from-indigo-200 via-blue-200 to-emerald-200 dark:from-indigo-900 dark:via-blue-900 dark:to-emerald-900 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
						<i className="ri-hand-heart-line w-12 h-12 flex items-center justify-center text-indigo-600 dark:text-indigo-300"></i>
					</div>
					<h1 className="text-3xl font-extrabold text-indigo-900 dark:text-indigo-100 mb-4 drop-shadow">Provide Help First</h1>
					<p className="text-indigo-700 dark:text-indigo-200 mb-8 text-lg">To get help, you need to provide help first. Start by helping others in the community and watch your donation grow.</p>
					<CustomLink href="/user/provide-help">
						<Button className="bg-gradient-to-tr from-indigo-600 via-purple-600 to-emerald-500 hover:from-indigo-700 hover:to-emerald-600 text-white font-bold rounded-xl px-8 py-4 shadow-lg text-lg">
							<i className="ri-hand-heart-line w-5 h-5 flex items-center justify-center mr-2"></i>
							Provide Help Now
						</Button>
					</CustomLink>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-emerald-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 py-0 px-0" suppressHydrationWarning={true}>
			<div className="max-w-6xl mx-auto py-10 px-4">
				<h1 className="text-3xl font-extrabold text-indigo-900 dark:text-indigo-100 mb-10 drop-shadow">Get Help</h1>

				<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
					<Card className="rounded-2xl shadow bg-gradient-to-tr from-indigo-100 via-blue-100 to-emerald-100 dark:from-indigo-900 dark:via-blue-900 dark:to-emerald-900 p-6">
						<CardContent className="p-0">
							<div className="flex items-center gap-4">
								<div className="w-12 h-12 bg-indigo-200 dark:bg-indigo-800 rounded-full flex items-center justify-center">
									<i className="ri-wallet-line w-6 h-6 flex items-center justify-center text-indigo-600 dark:text-indigo-300"></i>
								</div>
								<div>
									<div className="text-base text-indigo-700 dark:text-indigo-200 font-bold">Total Provided</div>
									<div className="text-xl font-extrabold text-indigo-900 dark:text-indigo-100">
										{phRecords.reduce((sum, record) => sum + record.amount, 0)}
										{getCurrencyFromLocalStorage()?.code}
									</div>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className="rounded-2xl shadow bg-gradient-to-tr from-green-100 via-emerald-100 to-indigo-100 dark:from-green-900 dark:via-emerald-900 dark:to-indigo-900 p-6">
						<CardContent className="p-0">
							<div className="flex items-center gap-4">
								<div className="w-12 h-12 bg-green-200 dark:bg-green-800 rounded-full flex items-center justify-center">
									<i className="ri-money-dollar-circle-line w-6 h-6 flex items-center justify-center text-green-600 dark:text-green-300"></i>
								</div>
								<div>
									<div className="text-base text-green-700 dark:text-green-200 font-bold">Available to Request</div>
									<div className="text-xl font-extrabold text-green-900 dark:text-green-100">
										{phRecords
											.filter((r) => r.status === 'active')
											.reduce((sum, record) => sum + record.maturedAmount, 0)
											.toFixed(2)}{' '}
										{getCurrencyFromLocalStorage()?.code}
									</div>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className="rounded-2xl shadow bg-gradient-to-tr from-yellow-100 via-yellow-200 to-emerald-100 dark:from-yellow-900 dark:via-yellow-800 dark:to-emerald-900 p-6">
						<CardContent className="p-0">
							<div className="flex items-center gap-4">
								<div className="w-12 h-12 bg-yellow-200 dark:bg-yellow-800 rounded-full flex items-center justify-center">
									<i className="ri-time-line w-6 h-6 flex items-center justify-center text-yellow-600 dark:text-yellow-300"></i>
								</div>
								<div>
									<div className="text-base text-yellow-700 dark:text-yellow-200 font-bold">Pending Requests</div>
									<div className="text-xl font-extrabold text-yellow-900 dark:text-yellow-100">{phRecords.filter((r) => r.status === 'pending' || r.status === 'waiting-match').length}</div>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className="rounded-2xl shadow bg-gradient-to-tr from-purple-100 via-indigo-100 to-emerald-100 dark:from-purple-900 dark:via-indigo-900 dark:to-emerald-900 p-6">
						<CardContent className="p-0">
							<div className="flex items-center gap-4">
								<div className="w-12 h-12 bg-purple-200 dark:bg-purple-800 rounded-full flex items-center justify-center">
									<i className="ri-group-line w-6 h-6 flex items-center justify-center text-purple-600 dark:text-purple-300"></i>
								</div>
								<div>
									<div className="text-base text-purple-700 dark:text-purple-200 font-bold">Matched Requests</div>
									<div className="text-xl font-extrabold text-purple-900 dark:text-purple-100">{phRecords.filter((r) => r.status === 'matched' || r.status === 'partial-match').length}</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				<Card className="rounded-3xl shadow-2xl bg-white/90 dark:bg-gray-900/90 border-2 border-indigo-100 dark:border-indigo-900 overflow-hidden">
					<div className="p-8 border-b border-indigo-100 dark:border-indigo-900">
						<h2 className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">Your Help Records</h2>
					</div>

					<div className="overflow-x-auto">
						<table className="w-full">
							<thead>
								<tr>
									<th className="px-6 py-4 text-left text-base font-bold text-indigo-700 dark:text-indigo-200 uppercase tracking-wider">Package</th>
									<th className="px-6 py-4 text-left text-base font-bold text-indigo-700 dark:text-indigo-200 uppercase tracking-wider">Amount</th>
									<th className="px-6 py-4 text-left text-base font-bold text-indigo-700 dark:text-indigo-200 uppercase tracking-wider">Matured Amount</th>
									<th className="px-6 py-4 text-left text-base font-bold text-indigo-700 dark:text-indigo-200 uppercase tracking-wider">Maturity Date</th>
									<th className="px-6 py-4 text-left text-base font-bold text-indigo-700 dark:text-indigo-200 uppercase tracking-wider">Status</th>
									<th className="px-6 py-4 text-left text-base font-bold text-indigo-700 dark:text-indigo-200 uppercase tracking-wider">Actions</th>
								</tr>
							</thead>
							<tbody>
								{phRecords.map((record) => (
									<tr key={record.id} className="hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all">
										<td className="px-6 py-4 whitespace-nowrap text-base text-indigo-900 dark:text-indigo-100 font-bold">{record.package}</td>
										<td className="px-6 py-4 whitespace-nowrap text-base text-indigo-900 dark:text-indigo-100 font-bold">
											{record.amount}
											{getCurrencyFromLocalStorage()?.code}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-base text-emerald-700 dark:text-emerald-300 font-black">
											{record.maturedAmount.toFixed(2)}
											{getCurrencyFromLocalStorage()?.code}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-base text-indigo-900 dark:text-indigo-100 font-bold">{formatDate(record.maturityDate)}</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<span className={`px-3 py-1 rounded-full text-sm font-bold ${getStatusColor(record.status)} shadow`}>{getStatusText(record.status)}</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-base">
											<div className="flex items-center gap-2">
												{record.status === 'active' && (
													<Button
														onClick={() => handleRequestHelp(record.id)}
														disabled={requestingHelp === record.id}
														className="bg-gradient-to-tr from-green-600 via-emerald-500 to-indigo-500 hover:from-green-700 hover:to-indigo-700 text-white font-bold rounded-xl px-4 py-2 shadow-lg"
													>
														{requestingHelp === record.id ? (
															<div className="flex items-center gap-2">
																<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
																<span>Requesting...</span>
															</div>
														) : (
															<>
																<i className="ri-hand-heart-line w-4 h-4 flex items-center justify-center mr-2"></i>
																Request Help
															</>
														)}
													</Button>
												)}

												{(record.status === 'matched' || record.status === 'partial-match' || record.status === 'completed') && (
													<CustomLink href={`/user/get-help/${record.id}`}>
														<Button variant="outline" className="bg-white/80 dark:bg-gray-900/80 border-2 border-indigo-100 dark:border-indigo-900 text-indigo-900 dark:text-indigo-100 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 font-bold rounded-xl px-4 py-2 shadow">
															<i className="ri-eye-line w-4 h-4 flex items-center justify-center mr-2"></i>
															View Details
														</Button>
													</CustomLink>
												)}

												{(record.status === 'pending' || record.status === 'waiting-match') && <span className="text-sm text-indigo-700 dark:text-indigo-200 font-bold">Waiting for match...</span>}
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
