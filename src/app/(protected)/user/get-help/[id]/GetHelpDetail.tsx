'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { CustomLink } from '@/components/CustomLink';
import { logger } from '@/lib/logger';
import { getCurrencyFromLocalStorage } from '@/lib/helpers';

type RequestsStatus = 'pending' | 'submitted' | 'confirmed' | 'declined' | 'partial-match' | 'proof-submitted';

interface UserInfo {
	id: string;
	name: string;
	email: string;
	username: string;
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
	accountNumber: string;
	accountName: string;
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
}

interface ApiResponse {
	status: string;
	data: {
		ghInfo: GHInfo;
		myPHs: MyPH[];
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

	useEffect(() => {
		setIsMounted(true);
		loadPHRecord();
	}, [phId]);

	const loadPHRecord = async () => {
		setLoading(true);
		try {
			const response = await fetch(`/api/gh-requests/${phId}/more`);
			if (!response.ok) throw new Error('Failed to fetch data');
			const result: ApiResponse = await response.json();
			setData(result);
		} catch (error) {
			toast.error('Failed to load help request details');
		} finally {
			setLoading(false);
		}
	};

	const handlePaymentAction = async (matchId: string, action: 'confirm' | 'decline') => {
		setProcessingPayment(matchId);
		try {
			const formData = new FormData();
			formData.append('status', action === 'confirm' ? 'completed' : 'declined');

			const response = await fetch(`/api/matches/${matchId}`, {
				method: 'PUT',
				body: formData,
			});
			if (!response.ok) throw new Error(`Failed to ${action} payment`);
			const updatedMatch = await response.json();
			if (data) {
				setData({
					...data,
					data: {
						...data.data,
						matches: data.data.matches.map((match) => (match.id === matchId ? { ...match, status: updatedMatch.data.status } : match)),
					},
				});
			}
			toast.success(`Payment ${action === 'confirm' ? 'confirmed' : 'declined'} successfully!`);
		} catch (error) {
			toast.error(`Failed to ${action} payment`);
		} finally {
			setProcessingPayment(null);
		}
	};

	const getPaymentStatusColor = (status: string) => {
		switch (status) {
			case 'confirmed':
			case 'Paid':
				return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
			case 'submitted':
			case 'proof-submitted':
				return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
			case 'declined':
				return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
			default:
				return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
		}
	};

	const getTotalConfirmedAmount = () => {
		return data?.data.matches.filter((match) => match.status === 'confirmed').reduce((sum, match) => sum + match.amount, 0) || 0;
	};

	const getTotalPendingAmount = () => {
		return data?.data.matches.filter((match) => match.status === 'pending' || match.status === 'submitted' || match.status === 'proof-submitted').reduce((sum, match) => sum + match.amount, 0) || 0;
	};

	logger.log(data?.data);

	const getMaturedAmount = () => {
		return getTotalConfirmedAmount() + getTotalPendingAmount();
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
			<div className="p-4 lg:p-6 space-y-6 min-h-screen bg-gradient-to-br from-white/80 to-blue-50/40 dark:from-blue-900/30 dark:to-blue-950/10">
				<div className="animate-pulse">
					<div className="flex items-center gap-4 mb-6">
						<div className="h-10 w-10 bg-blue-100/60 dark:bg-blue-900/30 rounded-xl shadow"></div>
						<div className="h-8 bg-blue-100/60 dark:bg-blue-900/30 rounded-xl w-64 shadow"></div>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
						{[...Array(3)].map((_, index) => (
							<div key={index} className="bg-blue-100/60 dark:bg-blue-900/30 rounded-xl p-6 shadow">
								<div className="h-4 bg-blue-200/60 dark:bg-blue-900/40 rounded w-24 mb-2"></div>
								<div className="h-8 bg-blue-200/60 dark:bg-blue-900/40 rounded w-20"></div>
							</div>
						))}
					</div>
					<div className="bg-blue-100/60 dark:bg-blue-900/30 rounded-xl p-6 shadow">
						<div className="h-6 bg-blue-200/60 dark:bg-blue-900/40 rounded w-32 mb-6"></div>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							{[...Array(3)].map((_, index) => (
								<div key={index} className="bg-blue-200/60 dark:bg-blue-900/40 rounded-xl p-4">
									<div className="h-4 bg-blue-300/60 dark:bg-blue-900/50 rounded"></div>
									<div className="space-y-2">
										<div className="h-3 bg-blue-300/60 dark:bg-blue-900/50 rounded"></div>
										<div className="h-3 bg-blue-300/60 dark:bg-blue-900/50 rounded w-3/4"></div>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (!data || data.data.matches.length === 0) {
		return (
			<div className="p-4 lg:p-6 min-h-screen bg-gradient-to-br from-white/80 to-red-50/40 dark:from-red-900/30 dark:to-red-950/10">
				<div className="max-w-2xl mx-auto text-center py-20">
					<div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
						<i className="ri-error-warning-line w-10 h-10 flex items-center justify-center text-red-600 dark:text-red-400"></i>
					</div>
					<h1 className="text-3xl font-extrabold text-foreground mb-4">Help Request Not Found</h1>
					<p className="text-muted-foreground text-lg mb-8">The help request you're looking for doesn't exist or has been removed.</p>
					<CustomLink href="/user/get-help">
						<Button className="bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white py-3 rounded-xl shadow-lg text-lg font-semibold">Back to Get Help</Button>
					</CustomLink>
				</div>
			</div>
		);
	}

	const firstPH = Array.isArray(data.data.myPHs) ? data.data.myPHs[0] : data.data.myPHs;
	const packageName = firstPH?.packageInfo?.name || 'Unknown Package';

	return (
		<div className="p-4 lg:p-6 min-h-screen bg-gradient-to-br from-white/80 to-blue-50/40 dark:from-blue-900/30 dark:to-blue-950/10" suppressHydrationWarning={true}>
			<div className="max-w-6xl mx-auto">
				{/* Header */}
				<div className="flex items-center gap-4 mb-8">
					<CustomLink href="/user/get-help" className="p-3 hover:bg-blue-100/60 dark:hover:bg-blue-900/20 rounded-xl transition-colors shadow">
						<i className="ri-arrow-left-line w-6 h-6 flex items-center justify-center text-blue-400"></i>
					</CustomLink>
					<h1 className="text-3xl font-extrabold text-foreground tracking-tight">Help Request Details - {packageName}</h1>
				</div>

				{/* Summary Cards */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
					<Card className="border-0 shadow-2xl rounded-2xl bg-gradient-to-br from-white/80 to-blue-50/40 dark:from-blue-900/30 dark:to-blue-950/10">
						<CardContent className="p-8">
							<div className="flex items-center gap-4">
								<div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center shadow">
									<i className="ri-money-dollar-circle-line w-7 h-7 flex items-center justify-center text-blue-600 dark:text-blue-400"></i>
								</div>
								<div>
									<div className="text-base text-blue-600 dark:text-blue-400 font-semibold">Total Expected</div>
									<div className="text-3xl font-extrabold text-blue-900 dark:text-blue-300 mt-1">
										{getMaturedAmount()} {getCurrencyFromLocalStorage()?.code}
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
					<Card className="border-0 shadow-2xl rounded-2xl bg-gradient-to-br from-white/80 to-green-50/40 dark:from-green-900/30 dark:to-green-950/10">
						<CardContent className="p-8">
							<div className="flex items-center gap-4">
								<div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center shadow">
									<i className="ri-check-double-line w-7 h-7 flex items-center justify-center text-green-600 dark:text-green-400"></i>
								</div>
								<div>
									<div className="text-base text-green-600 dark:text-green-400 font-semibold">Confirmed</div>
									<div className="text-3xl font-extrabold text-green-900 dark:text-green-300 mt-1">
										{getTotalConfirmedAmount()} {getCurrencyFromLocalStorage()?.code}
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
					<Card className="border-0 shadow-2xl rounded-2xl bg-gradient-to-br from-white/80 to-yellow-50/40 dark:from-yellow-900/30 dark:to-yellow-950/10">
						<CardContent className="p-8">
							<div className="flex items-center gap-4">
								<div className="w-14 h-14 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center shadow">
									<i className="ri-time-line w-7 h-7 flex items-center justify-center text-yellow-600 dark:text-yellow-400"></i>
								</div>
								<div>
									<div className="text-base text-yellow-600 dark:text-yellow-400 font-semibold">Pending</div>
									<div className="text-3xl font-extrabold text-yellow-900 dark:text-yellow-300 mt-1">
										{getTotalPendingAmount()} {getCurrencyFromLocalStorage()?.code}
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Progress Bar */}
				<Card className="border-0 shadow-2xl rounded-2xl bg-gradient-to-br from-white/80 to-green-50/40 dark:from-green-900/30 dark:to-green-950/10 mb-10">
					<CardContent className="p-8">
						<div className="flex items-center justify-between mb-4">
							<h3 className="text-lg font-bold text-foreground">Payment Progress</h3>
							<span className="text-base text-muted-foreground font-semibold">{((getTotalConfirmedAmount() / getMaturedAmount()) * 100).toFixed(1)}% Complete</span>
						</div>
						<div className="w-full bg-blue-100 dark:bg-blue-900/20 rounded-full h-4 shadow-inner">
							<div className="bg-gradient-to-r from-green-400 to-green-600 h-4 rounded-full transition-all duration-300 shadow" style={{ width: `${Math.min((getTotalConfirmedAmount() / getMaturedAmount()) * 100, 100)}%` }}></div>
						</div>
					</CardContent>
				</Card>

				{/* PH Users (who provided help to you) */}
				{data.data.myPHs.length > 0 && (
					<Card className="border-0 shadow-2xl rounded-2xl bg-gradient-to-br from-white/80 to-blue-50/40 dark:from-blue-900/30 dark:to-blue-950/10 mb-10">
						<div className="p-8 border-b border-blue-100 dark:border-blue-900/20">
							<h2 className="text-2xl font-bold text-foreground">Users Who Provided Help</h2>
							<p className="text-base text-muted-foreground mt-1">{data.data.myPHs[0].details.length} users who helped you with this request</p>
						</div>
						<div className="p-8">
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
								{data.data.myPHs[0].details.map((detail) => (
									<div key={detail.id} className="border-0 shadow rounded-2xl bg-gradient-to-br from-white/80 to-green-50/40 dark:from-green-900/30 dark:to-green-950/10 p-6">
										<div className="flex items-center justify-between mb-4">
											<div className="flex items-center gap-3">
												<div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center shadow">
													<i className="ri-hand-heart-line w-6 h-6 flex items-center justify-center text-green-600 dark:text-green-400"></i>
												</div>
												<div>
													<h4 className="font-bold text-lg text-foreground">{detail?.name}</h4>
													<p className="text-base text-muted-foreground break-words max-w-[200px]">{detail?.username}</p>
												</div>
											</div>
											<span className={`px-3 py-1 rounded-full text-xs font-bold max-w-[100px] text-center truncate ${getPaymentStatusColor(detail.status)}`}>{detail.status}</span>
										</div>
										<div className="space-y-3">
											<div className="flex justify-between text-base">
												<span className="text-muted-foreground">Phone:</span>
												<span className="text-foreground">{detail.phoneNumber}</span>
											</div>
											<div className="flex justify-between text-base">
												<span className="text-muted-foreground">Account Name:</span>
												<span className="text-foreground">{detail.accountName}</span>
											</div>
											<div className="flex justify-between text-base">
												<span className="text-muted-foreground">Account Number:</span>
												<span className="text-foreground">{detail.accountNumber}</span>
											</div>
											<div className="flex justify-between text-base">
												<span className="text-muted-foreground">Amount:</span>
												<span className="text-foreground font-bold">
													{detail.amount} {getCurrencyFromLocalStorage()?.code}
												</span>
											</div>
											<div className="flex justify-between text-base">
												<span className="text-muted-foreground">Date:</span>
												<span className="text-foreground">{new Date(detail.timeAssigned).toLocaleDateString()}</span>
											</div>
										</div>
									</div>
								))}
							</div>
						</div>
					</Card>
				)}

				{/* Matched Users */}
				<Card className="border-0 shadow-2xl rounded-2xl bg-gradient-to-br from-white/80 to-blue-50/40 dark:from-blue-900/30 dark:to-blue-950/10">
					<div className="p-8 border-b border-blue-100 dark:border-blue-900/20">
						<h2 className="text-2xl font-bold text-foreground">Matched Users</h2>
						<p className="text-base text-muted-foreground mt-1">{data.data.matches.length} users matched to fulfill your request</p>
					</div>
					<div className="p-8">
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
							{data.data.matches.map((match) => (
								<div key={match.id} className="border-0 shadow rounded-2xl bg-gradient-to-br from-white/80 to-blue-50/40 dark:from-blue-900/20 dark:to-blue-950/5 p-6">
									<div className="flex items-center justify-between mb-4">
										<div className="flex items-center gap-3">
											<div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center shadow">
												<i className="ri-user-line w-6 h-6 flex items-center justify-center text-blue-600 dark:text-blue-400"></i>
											</div>
											<div>
												<h4 className="font-bold text-lg text-foreground">{match.userInfo?.name}</h4>
												<p className="text-base text-muted-foreground break-words max-w-[200px]">{match.userInfo.email}</p>
											</div>
										</div>
										<span className={`px-3 py-1 rounded-full text-xs font-bold max-w-[100px] text-center truncate ${getPaymentStatusColor(match.status)}`}>{match.status}</span>
									</div>
									<div className="space-y-3 mb-4">
										<div className="flex justify-between text-base">
											<span className="text-muted-foreground">Username:</span>
											<span className="text-foreground">{match.userInfo.username}</span>
										</div>
										<div className="flex justify-between text-base">
											<span className="text-muted-foreground">Amount:</span>
											<span className="text-foreground font-bold">
												{match.amount} {getCurrencyFromLocalStorage()?.code}
											</span>
										</div>
										<div className="flex justify-between text-base">
											<span className="text-muted-foreground">Date:</span>
											<span className="text-foreground">{new Date(match.created_at).toLocaleDateString()}</span>
										</div>
									</div>
									{match.proof_of_payment && (match.status === 'submitted' || match.status === 'proof-submitted') && (
										<div className="space-y-4">
											<div className="text-base font-bold text-foreground">Payment Proof:</div>
											<img src={match.proof_of_payment} alt="Payment proof" className="w-full h-40 object-cover rounded-xl border border-blue-100 dark:border-blue-900/20 shadow" />
											<div className="flex gap-3">
												<Button
													onClick={() => handlePaymentAction(match.id, 'confirm')}
													disabled={processingPayment === match.id}
													className="bg-gradient-to-r from-green-600 to-green-400 hover:from-green-700 hover:to-green-500 text-white flex-1 rounded-xl shadow-lg text-lg font-semibold"
												>
													{processingPayment === match.id ? (
														<div className="flex items-center gap-2">
															<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
															<span>Processing...</span>
														</div>
													) : (
														<>
															<i className="ri-check-line w-4 h-4 flex items-center justify-center mr-2"></i>
															Confirm
														</>
													)}
												</Button>
												<Button
													onClick={() => handlePaymentAction(match.id, 'decline')}
													disabled={processingPayment === match.id}
													variant="outline"
													className="bg-white/80 border-blue-100 dark:bg-blue-900/10 dark:border-blue-900/20 text-foreground hover:bg-blue-50/40 flex-1 rounded-xl text-lg font-semibold"
												>
													<i className="ri-close-line w-4 h-4 flex items-center justify-center mr-2"></i>
													Decline
												</Button>
											</div>
										</div>
									)}
									{match.status === 'confirmed' && (
										<div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-base font-semibold">
											<i className="ri-check-double-line w-4 h-4 flex items-center justify-center"></i>
											<span>Payment confirmed</span>
										</div>
									)}
									{match.status === 'declined' && (
										<div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-base font-semibold">
											<i className="ri-close-circle-line w-4 h-4 flex items-center justify-center"></i>
											<span>Payment declined</span>
										</div>
									)}
									{match.status === 'pending' && (
										<div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400 text-base font-semibold">
											<i className="ri-time-line w-4 h-4 flex items-center justify-center"></i>
											<span>Awaiting payment</span>
										</div>
									)}
								</div>
							))}
						</div>
					</div>
				</Card>
			</div>
		</div>
	);
}
