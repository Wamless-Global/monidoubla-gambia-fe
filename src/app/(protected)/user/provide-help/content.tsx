'use client';

import { useState, useEffect, useCallback } from 'react';
import TermsAndConditionsModal from './TermsAndConditionsModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { PaymentProofModal } from '@/components/PaymentProofModal';
import { toast } from 'sonner';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { logger } from '@/lib/logger';
import { getCurrentUser } from '@/lib/userUtils';
import { getCurrencyFromLocalStorage, parseMaturityDays, getSettings, handleFetchMessage } from '@/lib/helpers';
import { useRouter } from 'next/navigation';
import nProgress from 'nprogress';
import { cn } from '@/lib/utils';

// NOTE: All original interfaces and logic are preserved.
export interface Package {
	id: string;
	name: string;
	profitPercentage: number;
	maturityPeriod: number;
	minAmount: number;
	maxAmount: number;
}

interface AssignedUser {
	id: string;
	name: string;
	username: string;
	phoneNumber: string;
	amount: number;
	momo_provider: string;
	momo_number: string;
	momo_name: string;
	timeAssigned: string;
	status: 'pending' | 'proof-submitted' | 'confirmed' | 'declined' | 'cancelled';
}

interface PHRequest {
	id: string;
	packageName: string;
	amount: number;
	expectedMaturity: string;
	dateCreated: string;
	status: 'pending' | 'waiting-match' | 'partial-match' | 'matched' | 'active' | 'completed' | 'cancelled';
	assignedUsers: AssignedUser[];
	profitPercentage: number;
	maturityPeriod: number;
	matchingProgress: number;
}

type PageState = 'select-package' | 'enter-amount' | 'waiting' | 'view-requests';

export default function ProvideHelpPage({ hideHeader = false, viewMode = 'full', itemsPerPage: itemsPerPageProp }: { hideHeader?: boolean; viewMode?: 'full' | 'compact'; itemsPerPage?: number }) {
	const [currentState, setCurrentState] = useState<PageState>('view-requests');
	const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
	const [amount, setAmount] = useState<string>('');
	const [waitingProgress, setWaitingProgress] = useState(0);
	const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
	const [selectedUser, setSelectedUser] = useState<AssignedUser | null>(null);
	const [phRequests, setPHRequests] = useState<PHRequest[]>([]);
	const [currentPage, setCurrentPage] = useState(1);
	const [isLoading, setIsLoading] = useState(true);
	const [isRequestingGH, setIsRequestingGH] = useState<string | null>(null);
	const itemsPerPage = viewMode === 'compact' ? 2 : itemsPerPageProp || 5;
	const [totalPages, setTotalPages] = useState(1);
	const [packages, setPackages] = useState<Package[]>([]);
	const [tick, setTick] = useState(0);
	const [showTermsModal, setShowTermsModal] = useState(false);
	const router = useRouter();

	const fetchPHRequests = useCallback(
		async (page: number) => {
			setIsLoading(true);
			try {
				const res = await fetchWithAuth(`/api/ph-requests?page=${page}&limit=${itemsPerPage}`);
				const json = await res.json();
				const requests: PHRequest[] = (json.data.requests || []).map((req: any) => {
					const assignedUsers: AssignedUser[] = Array.isArray(req.details)
						? req.details.map((u: any) => ({
								id: u.id,
								name: u.name,
								username: u.username,
								phoneNumber: u.phoneNumber,
								amount: Number(u.amount),
								bankName: u.bankName,
								momo_number: u.momo_number,
								momo_name: u.accountName,
								momo_provider: u.momo_provider,
								timeAssigned: u.timeAssigned || '',
								status: u.status,
						  }))
						: [];
					const totalAssigned = assignedUsers.reduce((sum, u) => sum + (u.amount || 0), 0);
					const reqAmount = Number(req.amount);
					const matchingProgress = reqAmount > 0 ? Math.min(100, Math.round((totalAssigned / reqAmount) * 100)) : 0;
					const pkg = req.packageInfo || req.package;
					let profitPercentage = 0,
						maturityPeriod = 0,
						packageName = '';
					if (pkg) {
						profitPercentage = Number(pkg.gain || pkg.profitPercentage || 0);
						maturityPeriod = parseMaturityDays(pkg.maturity || '0');
						packageName = pkg.name || '';
					}
					let expectedMaturity = '';
					if ((req.confirmed_at || req.created_at) && maturityPeriod > 0) {
						const base = new Date(req.confirmed_at || req.created_at);
						if (maturityPeriod < 1) {
							const minutes = Math.round(maturityPeriod * 24 * 60);
							base.setMinutes(base.getMinutes() + minutes);
						} else {
							base.setDate(base.getDate() + maturityPeriod);
						}
						expectedMaturity = base.toISOString();
					}
					return { id: req.id, packageName, amount: reqAmount, expectedMaturity, dateCreated: req.created_at, status: req.status, profitPercentage, maturityPeriod, matchingProgress, assignedUsers };
				});
				setPHRequests(requests);
				setTotalPages(Math.max(1, Math.ceil((json.data.count || 0) / itemsPerPage)));
			} catch (e) {
				toast.error('Failed to load PH requests');
			} finally {
				setIsLoading(false);
			}
		},
		[itemsPerPage]
	);

	useEffect(() => {
		const fetchData = async () => {
			setIsLoading(true);
			try {
				const pkgRes = await fetchWithAuth('/api/packages');
				const pkgJson = await pkgRes.json();
				const apiPackages = (pkgJson.data || []).map((pkg: any) => ({ id: pkg.id, name: pkg.name, profitPercentage: Number(pkg.gain), maturityPeriod: parseMaturityDays(pkg.maturity), minAmount: Number(pkg.min), maxAmount: Number(pkg.max), raw: pkg }));
				setPackages(apiPackages);
				await fetchPHRequests(1);
			} catch (e) {
				toast.error('Failed to load data');
			} finally {
				setIsLoading(false);
			}
		};
		fetchData();
	}, [fetchPHRequests]);

	useEffect(() => {
		const user = getCurrentUser();
		if (phRequests.length > 0 && user && !user.agreed_to_ph_terms) {
			setShowTermsModal(true);
		} else {
			setShowTermsModal(false);
		}
	}, [phRequests]);

	const handlePackageSelect = (pkg: Package) => {
		setSelectedPackage(pkg);
		setCurrentState('enter-amount');
	};

	const handleAmountSubmit = async () => {
		if (selectedPackage && amount) {
			setCurrentState('waiting');
			setWaitingProgress(0);
			const user = getCurrentUser();
			if (!user) {
				toast.error('User not found. Please log in again.');
				setCurrentState('enter-amount');
				return;
			}
			try {
				let progress = 0;
				const interval = setInterval(() => {
					progress += 10;
					setWaitingProgress(progress);
					if (progress >= 100) clearInterval(interval);
				}, 100);

				const payload = { user: user.id, amount: Number(amount), package: selectedPackage.id, status: 'pending' };
				const res = await fetchWithAuth('/api/ph-requests', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
				const data = await res.json();
				if (!res.ok) throw new Error(data?.message || 'Failed to create PH request');

				setTimeout(() => {
					fetchPHRequests(1);
					setCurrentState('view-requests');
					setSelectedPackage(null);
					setAmount('');
					setWaitingProgress(0);
					toast.success('PH request created successfully! Waiting for match...');
				}, 1000);
			} catch (err: any) {
				logger.error('Failed to create PH request', err);
				toast.error(err?.message || 'Failed to create PH request');
				setCurrentState('enter-amount');
				setWaitingProgress(0);
			}
		}
	};

	const handleUploadPayment = (user: AssignedUser) => {
		setSelectedUser(user);
		setIsPaymentModalOpen(true);
	};

	const handlePaymentProofUpload = async (file?: File) => {
		if (!selectedUser) {
			toast.error('Match request not found.');
			return;
		}
		try {
			const formData = new FormData();
			formData.append('status', 'proof-submitted');
			if (file) formData.append('image', file);
			const res = await fetchWithAuth(`/api/matches/${selectedUser.id}`, { method: 'PUT', body: formData });
			const data = await res.json();
			if (!res.ok) throw new Error(handleFetchMessage(data, 'Failed to upload payment proof'));
			setPHRequests((prev) => prev.map((request) => ({ ...request, assignedUsers: request.assignedUsers.map((user) => (user.id === selectedUser.id ? { ...user, status: 'proof-submitted' as const } : user)) })));
			toast.success('Payment proof uploaded successfully!');
			setIsPaymentModalOpen(false);
		} catch (err: any) {
			logger.error('Failed to upload payment proof', err);
			toast.error(handleFetchMessage(err, 'Failed to upload payment proof'));
		}
	};

	const getStatusClass = (status: string) => {
		switch (status) {
			case 'active':
				return 'bg-green-100 text-green-800';
			case 'pending':
			case 'waiting-match':
			case 'proof-submitted':
				return 'bg-yellow-100 text-yellow-800';
			case 'partial-match':
			case 'matched':
				return 'bg-blue-100 text-blue-800';
			case 'completed':
				return 'bg-gray-100 text-gray-800';
			case 'cancelled':
			case 'declined':
				return 'bg-red-100 text-red-800';
			default:
				return 'bg-gray-100 text-gray-800';
		}
	};

	const getStatusText = (status: string, extra: boolean): string => {
		switch (status) {
			case 'pending':
			case 'waiting-match':
				return 'Waiting for Match';
			case 'partial-match':
				return 'Partially Matched';
			case 'active':
				if (extra) return 'Matured';
				return 'Waiting For Maturity';
			case 'matched':
				return 'Fully Matched';
			case 'completed':
				return 'Completed';
			case 'cancelled':
				return 'Cancelled';
			case 'proof-submitted':
				return 'Proof Submitted';
			default:
				return status.charAt(0).toUpperCase() + status.slice(1);
		}
	};

	const getCountdown = (dateString: string) => {
		if (!dateString) return { text: 'N/A', complete: false };
		const now = new Date();
		const target = new Date(dateString);
		const diff = target.getTime() - now.getTime();
		if (diff <= 0) return { text: 'Matured', complete: true };
		const days = Math.floor(diff / (1000 * 60 * 60 * 24));
		const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
		const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
		const seconds = Math.floor((diff % (1000 * 60)) / 1000);
		let result = '';
		if (days > 0) result += `${days}d `;
		if (hours > 0 || days > 0) result += `${hours}h `;
		if (minutes > 0 || hours > 0 || days > 0) result += `${minutes}m `;
		result += `${seconds}s`;
		return { text: result.trim(), complete: false };
	};

	useEffect(() => {
		fetchPHRequests(currentPage);
	}, [currentPage, fetchPHRequests]);

	useEffect(() => {
		const interval = setInterval(() => setTick((t) => t + 1), 1000);
		return () => clearInterval(interval);
	}, []);

	const renderSelectPackage = () => (
		<div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8">
			<div className="max-w-7xl mx-auto">
				<header className="mb-8">
					<Button onClick={() => setCurrentState('view-requests')} variant="ghost" className="mb-4 -ml-4">
						<i className="ri-arrow-left-line mr-2"></i>Back to Requests
					</Button>
					<h1 className="text-3xl font-bold text-gray-800">Select a Package</h1>
					<p className="text-gray-500 mt-1">Choose a package that best suits your donation goals.</p>
				</header>
				{packages.length === 0 ? (
					<div className="text-center py-16 bg-white rounded-lg shadow-sm">
						<i className="ri-inbox-2-line text-5xl text-gray-400 mx-auto mb-4"></i>
						<h3 className="text-xl font-semibold text-gray-700">No Packages Available</h3>
						<p className="text-gray-500 mt-2">There are currently no donation packages. Please check back later.</p>
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
						{packages.map((pkg) => (
							<Card key={pkg.id} className="bg-white shadow-sm border-gray-200 flex flex-col">
								<CardHeader>
									<CardTitle className="text-lg font-semibold text-gray-800">{pkg.name}</CardTitle>
								</CardHeader>
								<CardContent className="flex-grow space-y-4">
									<div className="p-4 bg-gray-50 rounded-lg space-y-3">
										<div className="flex justify-between text-sm">
											<span className="text-gray-500">Profit</span>
											<span className="font-semibold text-green-600">{pkg.profitPercentage}%</span>
										</div>
										<div className="flex justify-between text-sm">
											<span className="text-gray-500">Maturity</span>
											<span className="font-medium text-gray-700">{pkg.maturityPeriod} days</span>
										</div>
										<div className="flex justify-between text-sm">
											<span className="text-gray-500">Range</span>
											<span className="font-medium text-gray-700">
												{pkg.minAmount} - {pkg.maxAmount} {getSettings()?.baseCurrency || getCurrencyFromLocalStorage()?.code}
											</span>
										</div>
									</div>
								</CardContent>
								<CardFooter className="p-6">
									<Button onClick={() => handlePackageSelect(pkg)} variant="outline" className="w-full border-teal-500 text-teal-600 hover:bg-teal-50 hover:text-teal-700">
										Select Package
									</Button>
								</CardFooter>
							</Card>
						))}
					</div>
				)}
			</div>
		</div>
	);

	const renderEnterAmount = () => (
		<div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8">
			<div className="max-w-4xl mx-auto">
				<header className="mb-8">
					<Button onClick={() => setCurrentState('select-package')} variant="ghost" className="mb-4 -ml-4">
						<i className="ri-arrow-left-line mr-2"></i>Back to Packages
					</Button>
					<h1 className="text-3xl font-bold text-gray-800">Enter Amount</h1>
					<p className="text-gray-500 mt-1">
						You've selected the <span className="font-semibold text-teal-600">{selectedPackage?.name}</span> package.
					</p>
				</header>
				<Card className="bg-white shadow-sm border-gray-200">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
						<div className="p-8 border-b md:border-b-0 md:border-r border-gray-200">
							<div className="space-y-6">
								<div>
									<label htmlFor="amount-input" className="block text-sm font-medium text-gray-700 mb-2">
										Amount to Provide ({getSettings()?.baseCurrency || getCurrencyFromLocalStorage()?.code})
									</label>
									<input
										id="amount-input"
										type="number"
										value={amount}
										onChange={(e) => setAmount(e.target.value)}
										min={selectedPackage?.minAmount}
										max={selectedPackage?.maxAmount}
										placeholder={`e.g. ${selectedPackage?.minAmount}`}
										className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-lg"
									/>
									<p className="text-xs text-gray-500 mt-2">
										Min: {selectedPackage?.minAmount} / Max: {selectedPackage?.maxAmount}
									</p>
								</div>
								<Button onClick={handleAmountSubmit} className="w-full bg-teal-600 hover:bg-teal-700 text-white text-base py-3" disabled={!amount || Number(amount) < (selectedPackage?.minAmount || 0) || Number(amount) > (selectedPackage?.maxAmount || 0)}>
									Confirm Amount
								</Button>
							</div>
						</div>
						<div className="p-8 bg-gray-50 rounded-b-lg md:rounded-r-lg md:rounded-bl-none">
							<div className="space-y-6">
								<div>
									<h3 className="font-semibold text-gray-700 mb-3">Package Details</h3>
									<div className="space-y-2 text-sm">
										<div className="flex justify-between">
											<span className="text-gray-500">Profit:</span>
											<span className="font-medium text-gray-800">{selectedPackage?.profitPercentage}%</span>
										</div>
										<div className="flex justify-between">
											<span className="text-gray-500">Maturity:</span>
											<span className="font-medium text-gray-800">{selectedPackage?.maturityPeriod} days</span>
										</div>
									</div>
								</div>
								{amount && Number(amount) > 0 && (
									<div>
										<h3 className="font-semibold text-gray-700 mb-3">Expected Return</h3>
										<div className="space-y-2 text-sm">
											<div className="flex justify-between">
												<span className="text-gray-500">Your Amount:</span>
												<span className="font-medium text-gray-800">{Number(amount).toLocaleString()}</span>
											</div>
											<div className="flex justify-between">
												<span className="text-gray-500">Profit Gain:</span>
												<span className="font-medium text-gray-800">{((Number(amount) * (selectedPackage?.profitPercentage || 0)) / 100).toLocaleString()}</span>
											</div>
											<hr className="border-t border-gray-200 my-2" />
											<div className="flex justify-between font-semibold">
												<span className="text-gray-600">Total Return:</span>
												<span className="text-green-600">{(Number(amount) + (Number(amount) * (selectedPackage?.profitPercentage || 0)) / 100).toLocaleString()}</span>
											</div>
										</div>
									</div>
								)}
							</div>
						</div>
					</div>
				</Card>
			</div>
		</div>
	);

	const renderWaiting = () => (
		<div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8 flex items-center justify-center">
			<Card className="p-8 text-center bg-white shadow-sm border-gray-200 max-w-md w-full">
				<i className="ri-time-line text-5xl text-teal-500 mx-auto mb-4 block"></i>
				<h2 className="text-2xl font-bold text-gray-800 mb-2">Creating Your Request</h2>
				<p className="text-gray-500 mb-6">Please wait while we set up your request. This should only take a moment.</p>
				<div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
					<div className="bg-teal-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${waitingProgress}%` }}></div>
				</div>
				<p className="text-sm text-gray-500">{waitingProgress}% Complete</p>
			</Card>
		</div>
	);

	const CompactRequestCard = ({ request }: { request: PHRequest }) => (
		<Card key={request.id}>
			<CardContent className="p-4">
				<div className="flex justify-between items-start gap-3">
					<div className="min-w-0">
						<p className="font-semibold text-gray-800 truncate">{request.packageName}</p>
						<p className="text-sm text-gray-500">
							{request.amount.toLocaleString()} {getSettings()?.baseCurrency}
						</p>
					</div>
					<span className={`px-2 py-0.5 text-xs font-medium rounded-full flex-shrink-0 ${getStatusClass(request.status)}`}>{getStatusText(request.status, false)}</span>
				</div>
				<div className="mt-3">
					<div className="flex justify-between items-center mb-1">
						<span className="text-xs text-gray-500">Match Progress</span>
						<span className="text-xs font-semibold text-gray-600">{request.matchingProgress}%</span>
					</div>
					<div className="w-full bg-gray-200 rounded-full h-1.5">
						<div className="bg-teal-500 h-1.5 rounded-full" style={{ width: `${request.matchingProgress}%` }}></div>
					</div>
				</div>
			</CardContent>
		</Card>
	);

	const renderViewRequests = () => {
		if (isLoading) {
			return <div className="p-4 text-center text-sm text-gray-500">Loading...</div>;
		}

		return (
			<div className={cn(viewMode === 'full' && 'bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8')}>
				<div className={cn(viewMode === 'full' && 'max-w-7xl mx-auto')}>
					{!hideHeader && (
						<header className="mb-8 flex justify-between items-center">
							<div>
								<h1 className="text-3xl font-bold text-gray-800">My PH Requests</h1>
								<p className="text-gray-500 mt-1">Manage all your provide help requests.</p>
							</div>
							<Button onClick={() => setCurrentState('select-package')} className="bg-teal-600 hover:bg-teal-700 text-white">
								<i className="ri-add-line mr-2"></i> Create New Request
							</Button>
						</header>
					)}
					{phRequests.length === 0 ? (
						<div className="text-center py-8">
							<div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
								<i className="ri-file-list-3-line text-3xl text-gray-400"></i>
							</div>
							<p className="font-medium text-gray-700">No Active Requests</p>
							<p className="text-sm text-gray-500 mt-1">Your active requests will show here.</p>
						</div>
					) : (
						<div className={cn('space-y-4', viewMode === 'full' && 'space-y-8')}>
							{phRequests.map((request) => {
								if (viewMode === 'compact') {
									return <CompactRequestCard key={request.id} request={request} />;
								}
								const countdown = getCountdown(request.expectedMaturity);
								return (
									<Card key={request.id} className="bg-white shadow-sm border-gray-200 overflow-hidden">
										<CardHeader className="bg-gray-50 border-b border-gray-200">
											<div className="flex justify-between items-center">
												<div>
													<CardTitle className="text-lg font-semibold text-gray-800">{request.id}</CardTitle>
													<CardDescription>{request.packageName}</CardDescription>
												</div>
												<div className="flex items-center gap-2">
													<span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusClass(request.status)}`}>{getStatusText(request.status, countdown.complete)}</span>
													{request.status === 'active' && countdown.complete && (
														<Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" disabled={isRequestingGH === request.id} onClick={() => {}}>
															{isRequestingGH === request.id ? 'Requesting...' : 'Request GH'}
														</Button>
													)}
												</div>
											</div>
										</CardHeader>
										<div className="grid grid-cols-1 lg:grid-cols-3">
											<div className="p-6 border-b lg:border-b-0 lg:border-r border-gray-200">
												<div className="space-y-4">
													<div className="flex justify-between items-baseline">
														<span className="text-sm text-gray-500">Amount</span>
														<span className="text-xl font-semibold text-gray-800">
															{request.amount.toLocaleString()} <span className="text-sm font-normal">{getSettings()?.baseCurrency}</span>
														</span>
													</div>
													<div className="flex justify-between items-baseline">
														<span className="text-sm text-gray-500">Maturity Countdown</span>
														<span className={`font-semibold ${countdown.complete ? 'text-green-600' : 'text-gray-800'}`}>{request.status === 'active' ? countdown.text : 'N/A'}</span>
													</div>
													<div>
														<span className="text-sm text-gray-500">Match Progress</span>
														<div className="flex items-center gap-2 mt-1">
															<div className="w-full bg-gray-200 rounded-full h-2">
																<div className="bg-teal-500 h-2 rounded-full" style={{ width: `${request.matchingProgress}%` }}></div>
															</div>
															<span className="text-sm font-semibold text-gray-700">{request.matchingProgress}%</span>
														</div>
													</div>
												</div>
											</div>
											<div className="p-6 lg:col-span-2">
												{request.assignedUsers.length > 0 ? (
													<div>
														<h4 className="font-medium text-gray-800 mb-4">Assigned Users ({request.assignedUsers.length})</h4>
														<div className="space-y-4">
															{request.assignedUsers.map((user) => (
																<div key={user.id} className="grid grid-cols-4 gap-4 items-center p-4 bg-gray-50 rounded-lg">
																	<div className="col-span-2 sm:col-span-1">
																		<p className="font-semibold text-gray-800">{user.name}</p>
																		<p className="text-xs text-gray-500">@{user.username}</p>
																	</div>
																	<div className="col-span-2 sm:col-span-1">
																		<p className="font-semibold text-gray-800">{user.amount.toLocaleString()}</p>
																		<p className="text-xs text-gray-500">Amount</p>
																	</div>
																	<div className="text-center">
																		<span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getStatusClass(user.status)}`}>{getStatusText(user.status, false)}</span>
																	</div>
																	<div className="text-right">
																		<Button size="sm" onClick={() => handleUploadPayment(user)} disabled={user.status === 'confirmed' || user.status === 'proof-submitted'} className="bg-teal-600 hover:bg-teal-700 text-white">
																			{user.status === 'confirmed' ? 'Confirmed' : user.status === 'proof-submitted' ? 'Pending' : 'Pay Now'}
																		</Button>
																	</div>
																</div>
															))}
														</div>
													</div>
												) : (
													<div className="text-center py-8">
														<i className="ri-search-line text-4xl text-gray-400 mb-3"></i>
														<h4 className="font-semibold text-gray-700">Waiting for Match</h4>
														<p className="text-sm text-gray-500 mt-1">We're searching for users to match with your request.</p>
													</div>
												)}
											</div>
										</div>
									</Card>
								);
							})}
						</div>
					)}
					{viewMode === 'full' && totalPages > 1 && (
						<div className="flex justify-center items-center gap-2 mt-8 text-sm">
							<Button variant="outline" size="icon" onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
								<i className="ri-arrow-left-s-line"></i>
							</Button>
							<span className="text-gray-700 font-medium">
								Page {currentPage} of {totalPages}
							</span>
							<Button variant="outline" size="icon" onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages}>
								<i className="ri-arrow-right-s-line"></i>
							</Button>
						</div>
					)}
				</div>
				<PaymentProofModal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} onConfirm={handlePaymentProofUpload} userName={selectedUser?.name || ''} amount={selectedUser?.amount || 0} />
			</div>
		);
	};

	const renderCurrentState = () => {
		if (hideHeader) return renderViewRequests();

		switch (currentState) {
			case 'select-package':
				return renderSelectPackage();
			case 'enter-amount':
				return renderEnterAmount();
			case 'waiting':
				return renderWaiting();
			case 'view-requests':
			default:
				return renderViewRequests();
		}
	};

	return <>{!showTermsModal && renderCurrentState()}</>;
}
