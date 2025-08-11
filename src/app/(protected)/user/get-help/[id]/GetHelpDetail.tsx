'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge, badgeVariants } from '@/components/ui/badge';
import { toast } from 'sonner';
import { CustomLink } from '@/components/CustomLink';
import { getCurrencyFromLocalStorage, handleFetchMessage, getSettings, getCountdown } from '@/lib/helpers';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { type VariantProps } from 'class-variance-authority';

// Interfaces updated to match original for all features
export const notExpired = ['cancelled', 'completed', 'confirmed'];
type RequestsStatus = 'pending' | 'submitted' | 'confirmed' | 'declined' | 'partial-match' | 'proof-submitted' | 'completed' | 'expired';

interface UserInfo {
	id: string;
	name: string;
	email: string;
	username: string;
	phone_number: string;
}

interface PackageInfo {
	id: string;
	name: string;
	gain: number;
	min: number;
	max: number;
	maturity: string;
	meta: { type: string };
	created_at: string;
	status: string;
}

interface PHDetail {
	name: string;
	username: string;
	phoneNumber: string;
	momo_number: string;
	momo_provider: string;
	amount: number;
	timeAssigned: string;
	status: RequestsStatus;
	id: string;
}

interface MyPH {
	id: string;
	user: UserInfo;
	amount: number;
	package: string;
	created_at: string;
	status: RequestsStatus;
	details: PHDetail[];
	packageInfo: PackageInfo;
}

interface GHInfo {
	userInfo: UserInfo | null;
	id: string;
	user: string;
	amount: string;
	ph_id: string;
	created_at: string;
	status: RequestsStatus;
	details?: Record<string, any> | null;
}

interface Match {
	id: string;
	user: string;
	ph_request: string;
	amount: number;
	gh_request: string;
	gh_user: string;
	created_at: string;
	status: RequestsStatus;
	proof_of_payment: string | null;
	userInfo: UserInfo;
	ghUserInfo: UserInfo;
	phRequest: MyPH;
	expiry: string | null;
}

interface ApiResponse {
	status: string;
	data: {
		ghInfo: GHInfo;
		myPHs: MyPH;
		matches: Match[];
		count: number;
		hasMore: boolean;
	};
}

interface GetHelpDetailProps {
	phId: string;
}

export default function GetHelpDetail({ phId }: GetHelpDetailProps) {
	const [data, setData] = useState<ApiResponse | null>(null);
	const [loading, setLoading] = useState(true);
	const [processingPayment, setProcessingPayment] = useState<string | null>(null);
	const [isMounted, setIsMounted] = useState(false);
	const [tick, setTick] = useState(0);
	const [expiredMatches, setExpiredMatches] = useState<Set<string>>(new Set());

	const loadPHRecord = useCallback(async () => {
		setLoading(true);
		try {
			const response = await fetchWithAuth(`/api/gh-requests/${phId}/more`);
			if (!response.ok) throw new Error(handleFetchMessage(await response.json(), `Failed to fetch data`));
			const result: ApiResponse = await response.json();
			setData(result);
		} catch (error) {
			toast.error('Failed to load help request details');
		} finally {
			setLoading(false);
		}
	}, [phId]);

	useEffect(() => {
		setIsMounted(true);
		loadPHRecord();
	}, [loadPHRecord]);

	const handlePaymentAction = async (matchId: string, action: 'confirm' | 'decline') => {
		setProcessingPayment(matchId);
		try {
			const formData = new FormData();
			formData.append('status', action === 'confirm' ? 'completed' : 'declined');
			const response = await fetchWithAuth(`/api/matches/${matchId}`, { method: 'PUT', body: formData });
			if (!response.ok) throw new Error(handleFetchMessage(await response.json(), `Failed to ${action} payment`));
			await loadPHRecord();
			toast.success(`Payment ${action === 'confirm' ? 'confirmed' : 'declined'} successfully!`);
		} catch (error) {
			toast.error(`Failed to ${action} payment`);
		} finally {
			setProcessingPayment(null);
		}
	};

	useEffect(() => {
		const interval = setInterval(() => {
			setTick((t) => t + 1);
		}, 1000);
		return () => clearInterval(interval);
	}, []);

	useEffect(() => {
		if (!data) return;
		data.data.matches.forEach((match) => {
			if (match.expiry && match.status === 'proof-submitted' && new Date() >= new Date(match.expiry) && !expiredMatches.has(match.id)) {
				fetchWithAuth(`/api/matches/expired/${match.id}`, { method: 'PUT' })
					.then(() => {
						toast.error('The user has been banned for not completing the request on time');
						if (data) {
							setData({ ...data, data: { ...data.data, matches: data.data.matches.map((m) => (m.id === match.id ? { ...m, status: 'expired' } : m)) } });
						}
						setExpiredMatches((prev) => new Set([...prev, match.id]));
					})
					.catch((err) => {
						toast.error('Failed to mark match as expired');
					});
			}
		});
	}, [data, tick, expiredMatches]);

	const getPaymentStatusVariant = (status: string): VariantProps<typeof badgeVariants>['variant'] => {
		switch (status) {
			case 'confirmed':
			case 'completed':
				return 'success';
			case 'submitted':
			case 'proof-submitted':
				return 'info';
			case 'declined':
			case 'expired':
				return 'destructive';
			default:
				return 'warning';
		}
	};

	const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: getSettings()?.baseCurrency || getCurrencyFromLocalStorage()?.code || 'USD', minimumFractionDigits: 2 }).format(amount);
	const getTotalConfirmedAmount = () => data?.data.matches.filter((match) => match.status === 'completed' || match.status === 'confirmed').reduce((sum, match) => sum + match.amount, 0) || 0;
	const getTotalPendingAmount = () => data?.data.matches.filter((match) => ['pending', 'submitted', 'proof-submitted'].includes(match.status)).reduce((sum, match) => sum + match.amount, 0) || 0;
	const getMaturedAmount = () => Number(data?.data.ghInfo.amount || 0);

	if (!isMounted || loading) {
		return (
			<div className="flex items-center justify-center min-h-screen bg-gray-50">
				<div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600"></div>
			</div>
		);
	}

	if (!data || data.data.matches.length === 0) {
		return (
			<div className="bg-gray-50 min-h-screen flex items-center justify-center p-4">
				<Card className="max-w-lg w-full text-center p-8">
					<div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
						<i className="ri-error-warning-line text-3xl text-red-600"></i>
					</div>
					<CardTitle className="text-2xl mb-2">Help Request Not Found</CardTitle>
					<CardDescription className="mb-6">The help request you're looking for doesn't exist, has no matches, or has been removed.</CardDescription>
					<CustomLink href="/user/get-help">
						<Button>Back to Get Help</Button>
					</CustomLink>
				</Card>
			</div>
		);
	}

	const myPHs = data?.data?.myPHs && Object.keys(data.data.myPHs).length > 0 ? data.data.myPHs : { details: [], packageInfo: { name: 'Bonus' } };
	const packageName = myPHs?.packageInfo?.name || 'Bonus';
	const progressPercent = getMaturedAmount() > 0 ? Math.min((getTotalConfirmedAmount() / getMaturedAmount()) * 100, 100) : 0;

	return (
		<div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8">
			<div className="max-w-7xl mx-auto">
				<header className="mb-8">
					<CustomLink href="/user/get-help" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-4 text-sm font-medium">
						<i className="ri-arrow-left-line"></i>Back to All Requests
					</CustomLink>
					<h1 className="text-3xl font-bold text-gray-800">Help Request Details</h1>
					<p className="text-gray-500 mt-1">
						Details for your <span className="font-semibold text-gray-700">{packageName}</span> package request.
					</p>
				</header>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
					<Card>
						<CardHeader className="flex-row items-center justify-between pb-2">
							<CardTitle className="text-sm font-medium">Total Expected</CardTitle>
							<i className="ri-wallet-3-line text-xl text-gray-400"></i>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{formatCurrency(getMaturedAmount())}</div>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="flex-row items-center justify-between pb-2">
							<CardTitle className="text-sm font-medium">Confirmed Received</CardTitle>
							<i className="ri-check-double-line text-xl text-green-500"></i>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold text-green-600">{formatCurrency(getTotalConfirmedAmount())}</div>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="flex-row items-center justify-between pb-2">
							<CardTitle className="text-sm font-medium">Pending Confirmation</CardTitle>
							<i className="ri-time-line text-xl text-yellow-500"></i>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold text-yellow-600">{formatCurrency(getTotalPendingAmount())}</div>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="flex-row items-center justify-between pb-2">
							<CardTitle className="text-sm font-medium">Progress</CardTitle>
							<i className="ri-loader-4-line text-xl text-teal-500"></i>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold text-teal-600 mb-2">{progressPercent.toFixed(1)}%</div>
							<div className="w-full bg-gray-200 rounded-full h-2">
								<div className="bg-teal-600 h-2 rounded-full" style={{ width: `${progressPercent}%` }}></div>
							</div>
						</CardContent>
					</Card>
				</div>

				<div className="space-y-8">
					<Card>
						<CardHeader>
							<CardTitle>Matched Users</CardTitle>
							<CardDescription>{data.data.matches.length} users have been matched to fulfill your request.</CardDescription>
						</CardHeader>
						<CardContent className="p-0">
							<div className="overflow-x-auto">
								<table className="min-w-full divide-y divide-gray-200">
									<thead className="bg-gray-50">
										<tr>
											{/* FIX: Applied full table header styles for proper alignment */}
											<th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
												User
											</th>
											<th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
												Amount
											</th>
											<th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
												Status & Countdown
											</th>
											<th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
												Phone Number
											</th>
											<th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
												Actions
											</th>
										</tr>
									</thead>
									<tbody className="bg-white divide-y divide-gray-200">
										{data.data.matches.map((match) => {
											const countdownText = getCountdown(match.expiry || '');
											const isExpired = countdownText.toLocaleLowerCase() === 'expired';
											const effectiveStatus = !notExpired.includes(match.status) && isExpired ? 'expired' : match.status;

											return (
												<tr key={match.id}>
													<td className="px-6 py-4 whitespace-nowrap">
														<div className="font-medium text-gray-900">{match.userInfo?.name}</div>
														<div className="text-sm text-gray-500">{match.userInfo?.email}</div>
													</td>
													<td className="px-6 py-4 whitespace-nowrap">
														<div className="text-sm text-gray-900 font-medium">{formatCurrency(match.amount)}</div>
													</td>
													<td className="px-6 py-4 whitespace-nowrap">
														<div className="flex items-center gap-2">
															<Badge variant={getPaymentStatusVariant(effectiveStatus)}>{effectiveStatus.replace('-', ' ')}</Badge>
															{match.expiry && effectiveStatus !== 'expired' && !['completed', 'confirmed'].includes(effectiveStatus) && <span className="text-sm font-semibold text-red-600">{countdownText}</span>}
														</div>
													</td>
													<td className="px-6 py-4 whitespace-nowrap">
														<div className="text-sm text-gray-900 font-medium">
															<span className="text-foreground">{match.userInfo.phone_number}</span>
														</div>
													</td>
													<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
														{match.proof_of_payment && ['submitted', 'proof-submitted'].includes(effectiveStatus) ? (
															<div className="flex items-center gap-2 justify-end">
																<a href={match.proof_of_payment} target="_blank" rel="noopener noreferrer">
																	<Button variant="outline" size="sm">
																		View Proof
																	</Button>
																</a>
																<Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handlePaymentAction(match.id, 'confirm')} disabled={processingPayment === match.id}>
																	{processingPayment === match.id ? '...' : 'Confirm'}
																</Button>
																<Button size="sm" variant="destructive" onClick={() => handlePaymentAction(match.id, 'decline')} disabled={processingPayment === match.id}>
																	Decline
																</Button>
															</div>
														) : (
															<span className="text-gray-400 text-xs italic">No action required</span>
														)}
													</td>
												</tr>
											);
										})}
									</tbody>
								</table>
							</div>
						</CardContent>
					</Card>

					{myPHs.details.length > 0 && (
						<Card>
							<CardHeader>
								<CardTitle>Original Providers</CardTitle>
								<CardDescription>These are the users you originally provided help to for this request.</CardDescription>
							</CardHeader>
							<CardContent className="p-0">
								<div className="overflow-x-auto">
									<table className="min-w-full divide-y divide-gray-200">
										<thead className="bg-gray-50">
											<tr>
												{/* FIX: Applied full table header styles for proper alignment */}
												<th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
													User
												</th>
												<th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
													Phone
												</th>
												<th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
													Amount
												</th>
												<th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
													Status
												</th>
											</tr>
										</thead>
										<tbody className="bg-white divide-y divide-gray-200">
											{myPHs.details.map((detail) => (
												<tr key={detail.id}>
													<td className="px-6 py-4 whitespace-nowrap">
														<div className="font-medium text-gray-900">{detail.name}</div>
													</td>
													<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{detail.phoneNumber}</td>
													<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{formatCurrency(detail.amount)}</td>
													<td className="px-6 py-4 whitespace-nowrap">
														<Badge variant={getPaymentStatusVariant(detail.status)}>{detail.status}</Badge>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</CardContent>
						</Card>
					)}
				</div>
			</div>
		</div>
	);
}
