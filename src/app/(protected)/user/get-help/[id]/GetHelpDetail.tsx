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
		const firstPH = data?.data.myPHs[0];
		return firstPH ? firstPH.amount + firstPH.packageInfo.gain : 0;
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
					<div className="flex items-center gap-4 mb-6">
						<div className="h-9 w-9 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
						<div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64"></div>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
						{[...Array(3)].map((_, index) => (
							<div key={index} className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6">
								<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
								<div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
							</div>
						))}
					</div>
					<div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6">
						<div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-6"></div>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							{[...Array(3)].map((_, index) => (
								<div key={index} className="bg-gray-200 dark:bg-gray-700 rounded-lg p-4">
									<div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20 mb-4"></div>
									<div className="space-y-2">
										<div className="h-3 bg-gray-300 dark:bg-gray-600 rounded"></div>
										<div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
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
			<div className="p-4 lg:p-6 bg-background min-h-screen">
				<div className="max-w-2xl mx-auto text-center py-20">
					<div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
						<i className="ri-error-warning-line w-10 h-10 flex items-center justify-center text-red-600 dark:text-red-400"></i>
					</div>
					<h1 className="text-2xl font-bold text-foreground mb-4">Help Request Not Found</h1>
					<p className="text-muted-foreground mb-8">The help request you're looking for doesn't exist or has been removed.</p>
					<CustomLink href="/user/get-help">
						<Button className="bg-blue-600 hover:bg-blue-700 text-white">Back to Get Help</Button>
					</CustomLink>
				</div>
			</div>
		);
	}

	const firstPH = Array.isArray(data.data.myPHs) ? data.data.myPHs[0] : data.data.myPHs;
	const packageName = firstPH?.packageInfo.name || 'Unknown Package';

	return (
		<div className="p-4 lg:p-6 bg-background min-h-screen" suppressHydrationWarning={true}>
			<div className="max-w-6xl mx-auto">
				{/* Header */}
				<div className="flex items-center gap-4 mb-6">
					<CustomLink href="/user/get-help" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
						<i className="ri-arrow-left-line w-5 h-5 flex items-center justify-center text-muted-foreground"></i>
					</CustomLink>
					<h1 className="text-2xl font-bold text-foreground">Help Request Details - {packageName}</h1>
				</div>

				{/* Summary Cards */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
					<Card className="p-6 bg-blue-50 dark:bg-blue-900/20">
						<CardContent className="p-0">
							<div className="flex items-center gap-3">
								<div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
									<i className="ri-money-dollar-circle-line w-6 h-6 flex items-center justify-center text-blue-600 dark:text-blue-400"></i>
								</div>
								<div>
									<div className="text-sm text-blue-600 dark:text-blue-400">Total Expected</div>
									<div className="text-2xl font-bold text-blue-900 dark:text-blue-300">
										{getMaturedAmount()} {getCurrencyFromLocalStorage()?.code}
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
					<Card className="p-6 bg-green-50 dark:bg-green-900/20">
						<CardContent className="p-0">
							<div className="flex items-center gap-3">
								<div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
									<i className="ri-check-double-line w-6 h-6 flex items-center justify-center text-green-600 dark:text-green-400"></i>
								</div>
								<div>
									<div className="text-sm text-green-600 dark:text-green-400">Confirmed</div>
									<div className="text-2xl font-bold text-green-900 dark:text-green-300">
										{getTotalConfirmedAmount()} {getCurrencyFromLocalStorage()?.code}
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
					<Card className="p-6 bg-yellow-50 dark:bg-yellow-900/20">
						<CardContent className="p-0">
							<div className="flex items-center gap-3">
								<div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
									<i className="ri-time-line w-6 h-6 flex items-center justify-center text-yellow-600 dark:text-yellow-400"></i>
								</div>
								<div>
									<div className="text-sm text-yellow-600 dark:text-yellow-400">Pending</div>
									<div className="text-2xl font-bold text-yellow-900 dark:text-yellow-300">
										{getTotalPendingAmount()} {getCurrencyFromLocalStorage()?.code}
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Progress Bar */}
				<Card className="p-6 mb-8">
					<CardContent className="p-0">
						<div className="flex items-center justify-between mb-4">
							<h3 className="text-lg font-semibold text-foreground">Payment Progress</h3>
							<span className="text-sm text-muted-foreground">{((getTotalConfirmedAmount() || 0 / getMaturedAmount() || 0) * 100).toFixed(1)}% Complete</span>
						</div>
						<div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
							<div className="bg-green-600 h-3 rounded-full transition-all duration-300" style={{ width: `${Math.min((getTotalConfirmedAmount() / getMaturedAmount()) * 100, 100)}%` }}></div>
						</div>
					</CardContent>
				</Card>

				{/* PH Users (who provided help to you) */}
				{data.data.myPHs.length > 0 && (
					<Card className="bg-card border-0 shadow-sm rounded-lg mb-8">
						<div className="p-6 border-b border-border">
							<h2 className="text-lg font-semibold text-foreground">Users Who Provided Help</h2>
							<p className="text-sm text-muted-foreground mt-1">{data.data.myPHs[0].details.length} users who helped you with this request</p>
						</div>
						<div className="p-6">
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
								{data.data.myPHs[0].details.map((detail) => (
									<div key={detail.id} className="border border-border rounded-lg p-6">
										<div className="flex items-center justify-between mb-4">
											<div className="flex items-center gap-3">
												<div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
													<i className="ri-hand-heart-line w-5 h-5 flex items-center justify-center text-green-600 dark:text-green-400"></i>
												</div>
												<div>
													<h4 className="font-semibold text-foreground">{detail.name}</h4>
													<p className="text-sm text-muted-foreground break-words max-w-[200px]">{detail.username}</p>
												</div>
											</div>
											<span className={`px-2 py-1 rounded-full text-xs font-medium max-w-[100px] text-center truncate ${getPaymentStatusColor(detail.status)}`}>{detail.status}</span>
										</div>
										<div className="space-y-3">
											<div className="flex justify-between text-sm">
												<span className="text-muted-foreground">Phone:</span>
												<span className="text-foreground">{detail.phoneNumber}</span>
											</div>
											<div className="flex justify-between text-sm">
												<span className="text-muted-foreground">Account Name:</span>
												<span className="text-foreground">{detail.accountName}</span>
											</div>
											<div className="flex justify-between text-sm">
												<span className="text-muted-foreground">Account Number:</span>
												<span className="text-foreground">{detail.accountNumber}</span>
											</div>
											<div className="flex justify-between text-sm">
												<span className="text-muted-foreground">Amount:</span>
												<span className="text-foreground font-semibold">
													{detail.amount} {getCurrencyFromLocalStorage()?.code}
												</span>
											</div>
											<div className="flex justify-between text-sm">
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
				<Card className="bg-card border-0 shadow-sm rounded-lg">
					<div className="p-6 border-b border-border">
						<h2 className="text-lg font-semibold text-foreground">Matched Users</h2>
						<p className="text-sm text-muted-foreground mt-1">{data.data.matches.length} users matched to fulfill your request</p>
					</div>
					<div className="p-6">
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{data.data.matches.map((match) => (
								<div key={match.id} className="border border-border rounded-lg p-6">
									<div className="flex items-center justify-between mb-4">
										<div className="flex items-center gap-3">
											<div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
												<i className="ri-user-line w-5 h-5 flex items-center justify-center text-blue-600 dark:text-blue-400"></i>
											</div>
											<div>
												<h4 className="font-semibold text-foreground">{match.ghUserInfo.name}</h4>
												<p className="text-sm text-muted-foreground break-words max-w-[200px]">{match.ghUserInfo.email}</p>
											</div>
										</div>
										<span className={`px-2 py-1 rounded-full text-xs font-medium max-w-[100px] text-center truncate ${getPaymentStatusColor(match.status)}`}>{match.status}</span>
									</div>
									<div className="space-y-3 mb-4">
										<div className="flex justify-between text-sm">
											<span className="text-muted-foreground">Username:</span>
											<span className="text-foreground">{match.ghUserInfo.username}</span>
										</div>
										<div className="flex justify-between text-sm">
											<span className="text-muted-foreground">Amount:</span>
											<span className="text-foreground font-semibold">
												{match.amount} {getCurrencyFromLocalStorage()?.code}
											</span>
										</div>
										<div className="flex justify-between text-sm">
											<span className="text-muted-foreground">Date:</span>
											<span className="text-foreground">{new Date(match.created_at).toLocaleDateString()}</span>
										</div>
									</div>
									{match.proof_of_payment && (match.status === 'submitted' || match.status === 'proof-submitted') && (
										<div className="space-y-4">
											<div className="text-sm font-medium text-foreground">Payment Proof:</div>
											<img src={match.proof_of_payment} alt="Payment proof" className="w-full h-40 object-cover rounded-lg border border-border" />
											<div className="flex gap-3">
												<Button onClick={() => handlePaymentAction(match.id, 'confirm')} disabled={processingPayment === match.id} className="bg-green-600 hover:bg-green-700 text-white flex-1">
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
												<Button onClick={() => handlePaymentAction(match.id, 'decline')} disabled={processingPayment === match.id} variant="outline" className="bg-card border-border text-foreground hover:bg-accent flex-1">
													<i className="ri-close-line w-4 h-4 flex items-center justify-center mr-2"></i>
													Decline
												</Button>
											</div>
										</div>
									)}
									{match.status === 'confirmed' && (
										<div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm">
											<i className="ri-check-double-line w-4 h-4 flex items-center justify-center"></i>
											<span>Payment confirmed</span>
										</div>
									)}
									{match.status === 'declined' && (
										<div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
											<i className="ri-close-circle-line w-4 h-4 flex items-center justify-center"></i>
											<span>Payment declined</span>
										</div>
									)}
									{match.status === 'pending' && (
										<div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400 text-sm">
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
