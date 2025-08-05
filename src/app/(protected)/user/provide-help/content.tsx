'use client';

import { useState, useEffect } from 'react';
import TermsAndConditionsModal from './TermsAndConditionsModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PaymentProofModal } from '@/components/PaymentProofModal';
import { toast } from 'sonner';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { logger } from '@/lib/logger';
import { getCurrentUser } from '@/lib/userUtils';
import { getCurrencyFromLocalStorage, parseMaturityDays, getSettings, handleFetchMessage } from '@/lib/helpers';
import { useRouter } from 'next/navigation';
import nProgress from 'nprogress';

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
	accountName: string;
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

export default function ProvideHelpPage({ hideHeader = false }: { hideHeader?: boolean }) {
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
	const itemsPerPage = 2;
	const [totalPages, setTotalPages] = useState(1);
	const [packages, setPackages] = useState<Package[]>([]);
	// Add a ticking state to force re-render every second for countdown
	const [tick, setTick] = useState(0);
	// Terms modal state
	const [showTermsModal, setShowTermsModal] = useState(false);

	const router = useRouter();

	// Fetch packages and PH requests from API
	useEffect(() => {
		const fetchData = async () => {
			setIsLoading(true);
			try {
				// Fetch packages
				const pkgRes = await fetchWithAuth('/api/packages');
				const pkgJson = await pkgRes.json();
				const apiPackages = (pkgJson.data || []).map((pkg: any) => ({
					id: pkg.id,
					name: pkg.name,
					profitPercentage: Number(pkg.gain),
					maturityPeriod: parseMaturityDays(pkg.maturity),
					minAmount: Number(pkg.min),
					maxAmount: Number(pkg.max),
					raw: pkg,
				}));
				setPackages(apiPackages);

				// Fetch PH requests (page 1 by default)
				await fetchPHRequests(1);
			} catch (e) {
				toast.error('Failed to load data');
			} finally {
				setIsLoading(false);
			}
		};
		fetchData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Show terms modal if user has PH requests and hasn't agreed
	useEffect(() => {
		const user = getCurrentUser();
		if (phRequests.length > 0 && user && !user.agreed_to_ph_terms) {
			setShowTermsModal(true);
		} else {
			setShowTermsModal(false);
		}

		logger.log('show modal requests', phRequests);
	}, [phRequests]);

	// Fetch PH requests for a given page
	const fetchPHRequests = async (page: number) => {
		setIsLoading(true);
		try {
			const res = await fetchWithAuth(`/api/ph-requests?page=${page}&limit=${itemsPerPage}`);
			const json = await res.json();

			logger.log('Fetched PH requests:', json);

			// Map API data to UI PHRequest
			const requests: PHRequest[] = (json.data.requests || []).map((req: any) => {
				// Calculate assignedUsers and matchingProgress
				logger.log(req);
				const assignedUsers: AssignedUser[] = Array.isArray(req.details)
					? req.details.map((u: any) => ({
							id: u.id,
							name: u.name,
							username: u.username,
							phoneNumber: u.phoneNumber,
							amount: Number(u.amount),
							bankName: u.bankName,
							momo_number: u.momo_number,
							momo_provider: u.momo_provider,
							timeAssigned: u.timeAssigned || '',
							status: u.status,
					  }))
					: [];
				const totalAssigned = assignedUsers.reduce((sum, u) => sum + (u.amount || 0), 0);
				const reqAmount = Number(req.amount);
				const matchingProgress = reqAmount > 0 ? Math.min(100, Math.round((totalAssigned / reqAmount) * 100)) : 0;

				// Find package info
				const pkg = req.packageInfo || req.package;
				let profitPercentage = 0;
				let maturityPeriod = 0;
				let minAmount = 0;
				let maxAmount = 0;
				let packageName = '';
				if (pkg) {
					profitPercentage = Number(pkg.gain || pkg.profitPercentage || 0);
					maturityPeriod = parseMaturityDays(pkg.maturity || '0');
					minAmount = Number(pkg.min || 0);
					maxAmount = Number(pkg.max || 0);
					packageName = pkg.name || '';
				}

				// Calculate expected maturity date (support minutes and days)
				let expectedMaturity = '';
				if ((req.confirmed_at || req.created_at) && maturityPeriod > 0) {
					const base = new Date(req.confirmed_at || req.created_at);
					logger.log(`Base date for maturity: ${base.toISOString()}`);
					// If maturityPeriod < 1, treat as minutes (e.g. 0.1667 = 10 minutes)
					if (maturityPeriod < 1) {
						logger.log(`Maturity period is in minutes: ${maturityPeriod}`);
						const minutes = Math.round(maturityPeriod * 24 * 60); // e.g. 0.1667 * 24 * 60 = 10
						base.setMinutes(base.getMinutes() + minutes);
					} else {
						logger.log(`Maturity period is in days: ${maturityPeriod}`);
						base.setDate(base.getDate() + maturityPeriod);
					}
					logger.log(`Expected maturity date: ${base.toISOString()}`);
					expectedMaturity = base.toISOString(); // keep full ISO string for timer accuracy
				}

				// Map status
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
						status = 'cancelled';
						break;
					case 'partial-match':
						status = 'partial-match';
						break;
					case 'matched':
						status = 'matched';
						break;
					default:
						status = 'pending';
				}

				return {
					id: req.id,
					packageName,
					amount: reqAmount,
					expectedMaturity,
					dateCreated: req.created_at,
					status,
					profitPercentage,
					maturityPeriod,
					matchingProgress,
					assignedUsers,
				};
			});
			setPHRequests(requests);
			setTotalPages(Math.max(1, Math.ceil((json.data.count || 0) / itemsPerPage)));
		} catch (e) {
			toast.error('Failed to load PH requests');
		} finally {
			setIsLoading(false);
		}
	};

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
				// Animate progress bar
				let progress = 0;
				const interval = setInterval(() => {
					progress += 10;
					setWaitingProgress(progress);
					if (progress >= 100) {
						clearInterval(interval);
					}
				}, 100);

				// Send POST request to create PH request
				const payload = {
					user: user.id,
					amount: Number(amount),
					package: selectedPackage.id,
					status: 'pending',
				};
				const res = await fetchWithAuth('/api/ph-requests', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(payload),
				});
				const data = await res.json();
				if (!res.ok) {
					throw new Error(data?.message || 'Failed to create PH request');
				}
				logger.log(data);
				// Add to local state for instant feedback
				const newRequest: PHRequest = {
					id: data?.data.request.id || `PH-${String(phRequests.length + 1).padStart(3, '0')}`,
					packageName: selectedPackage.name,
					amount: Number(amount),
					expectedMaturity: new Date(Date.now() + selectedPackage.maturityPeriod * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
					dateCreated: new Date().toISOString().split('T')[0],
					status: 'waiting-match',
					profitPercentage: selectedPackage.profitPercentage,
					maturityPeriod: selectedPackage.maturityPeriod,
					matchingProgress: 0,
					assignedUsers: [],
				};
				setTimeout(() => {
					setPHRequests((prev) => [newRequest, ...prev]);
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
			if (file) {
				formData.append('image', file);
			}
			const res = await fetchWithAuth(`/api/matches/${selectedUser.id}`, {
				method: 'PUT',
				body: formData,
			});
			const data = await res.json();
			if (!res.ok) {
				throw new Error(handleFetchMessage(data, 'Failed to upload payment proof'));
			}
			// Update UI to show proof-submitted
			setPHRequests((prev) =>
				prev.map((request) => ({
					...request,
					assignedUsers: request.assignedUsers.map((user) => (user.id === selectedUser.id ? { ...user, status: 'proof-submitted' as const } : user)),
				}))
			);
			toast.success('Payment proof uploaded successfully!');
			setIsPaymentModalOpen(false);
		} catch (err: any) {
			logger.error('Failed to upload payment proof', err);
			toast.error(handleFetchMessage(err, 'Failed to upload payment proof'));
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

	const getUserStatusColor = (status: string) => {
		switch (status) {
			case 'confirmed':
				return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
			case 'proof-submitted':
				return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
			case 'declined':
				return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
			case 'cancelled':
				return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
			default:
				return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
		}
	};

	const getStatusText = (status: string, extra: boolean) => {
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
			default:
				return status;
		}
	};

	// Countdown timer for maturity
	const getCountdown = (dateString: string) => {
		if (!dateString) return 'N/A';
		const now = new Date();
		const target = new Date(dateString);
		const diff = target.getTime() - now.getTime();
		if (diff <= 0) return 'Matured';
		const days = Math.floor(diff / (1000 * 60 * 60 * 24));
		const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
		const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
		const seconds = Math.floor((diff % (1000 * 60)) / 1000);
		let result = '';
		if (days > 0) result += `${days}d `;
		if (hours > 0 || days > 0) result += `${hours}h `;
		if (minutes > 0 || hours > 0 || days > 0) result += `${minutes}m `;
		result += `${seconds}s`;
		return result.trim();
	};

	// When currentPage changes, fetch that page
	useEffect(() => {
		fetchPHRequests(currentPage);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentPage]);

	// Ticking effect for countdown timer
	useEffect(() => {
		const interval = setInterval(() => {
			setTick((t) => t + 1);
		}, 1000);
		return () => clearInterval(interval);
	}, []);

	const paginatedRequests = phRequests;

	const renderSelectPackage = () => (
		<div className="p-4 lg:p-6 min-h-screen bg-gray-50 dark:bg-gray-900">
			<div className="max-w-6xl mx-auto">
				<div className="mb-6">
					<Button onClick={() => setCurrentState('view-requests')} variant="ghost" className="mb-4 whitespace-nowrap text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
						<i className="ri-arrow-left-line w-4 h-4 flex items-center justify-center mr-2"></i>
						Back to Requests
					</Button>
					<h2 className="font-poppins text-2xl font-bold text-gray-900 dark:text-white mb-2">Select a Package</h2>
					<p className="text-gray-600 dark:text-gray-400">Choose a package to provide help. Each package offers different returns and maturity periods.</p>
				</div>

				{packages.length === 0 ? (
					<div className="text-center py-12">
						<div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
							<i className="ri-inbox-line w-8 h-8 flex items-center justify-center text-gray-400"></i>
						</div>
						<h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Packages Available</h3>
						<p className="text-gray-600 dark:text-gray-400 mb-6">There are currently no donation packages available. Please check back later.</p>
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{packages.map((pkg, idx) => (
							<Card key={pkg.id} className={`p-0 border-0 slide-up ${idx % 3 === 0 ? 'bg-gradient-to-br from-[#4F46E5] to-[#6366F1]' : idx % 3 === 1 ? 'bg-gradient-to-br from-[#059669] to-[#10B981]' : 'bg-gradient-to-br from-[#F59E42] to-[#FBBF24]'}`}>
								<CardContent className="p-6 flex flex-col h-full">
									<div className="mb-4 flex items-center gap-2">
										<h3 className="font-poppins text-lg font-semibold text-white">{pkg.name}</h3>
										<i className="ri-crown-line w-4 h-4 flex items-center justify-center text-yellow-300"></i>
									</div>
									<div className="space-y-3 mb-6 text-white">
										<div className="flex items-center gap-2 text-sm">
											<i className="ri-checkbox-circle-line w-4 h-4 flex items-center justify-center text-white/80"></i>
											<span>
												Profit: <span className="font-semibold">{pkg.profitPercentage}%</span>
											</span>
										</div>
										<div className="flex items-center gap-2 text-sm">
											<i className="ri-time-line w-4 h-4 flex items-center justify-center text-white/80"></i>
											<span>
												Maturity: <span className="font-semibold">{pkg.maturityPeriod} days</span>
											</span>
										</div>
										<div className="flex items-center gap-2 text-sm">
											<i className="ri-money-dollar-circle-line w-4 h-4 flex items-center justify-center text-white/80"></i>
											<span>
												Amount:{' '}
												<span className="font-semibold">
													{pkg.minAmount} - {pkg.maxAmount} {getSettings()?.baseCurrency ? getSettings()?.baseCurrency : getCurrencyFromLocalStorage()?.code}
												</span>
											</span>
										</div>
									</div>
									<Button onClick={() => handlePackageSelect(pkg)} className="button-primary bg-white/90 text-[#1F2A44] font-semibold px-6 py-2 rounded transition-colors hover:bg-white">
										Select
									</Button>
								</CardContent>
							</Card>
						))}
					</div>
				)}
			</div>
		</div>
	);

	const renderEnterAmount = () => (
		<div className="p-4 lg:p-6 min-h-screen bg-gray-50 dark:bg-gray-900">
			<div className="max-w-6xl mx-auto">
				<div className="mb-6">
					<Button onClick={() => setCurrentState('select-package')} variant="ghost" className="mb-4 whitespace-nowrap text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
						<i className="ri-arrow-left-line w-4 h-4 flex items-center justify-center mr-2"></i>
						Back to packages
					</Button>
					<h2 className="font-poppins text-2xl font-bold text-gray-900 dark:text-white mb-2">Enter Amount</h2>
					<p className="text-gray-600 dark:text-gray-400">
						Selected package: <span className="font-semibold text-[#1F2A44] dark:text-white">{selectedPackage?.name}</span>
					</p>
				</div>
				<div className="flex flex-col md:flex-row gap-8">
					{/* Package Details Section (now comes first) */}
					<Card className="flex-1 p-0 border-0 slide-up bg-gradient-to-br from-[#059669] to-[#10B981] dark:from-[#1b2e23] dark:to-[#14532d]">
						<CardContent className="p-0">
							<div className="p-8 flex flex-col gap-4 h-full">
								<h3 className="font-bold text-white text-xl mb-2">{selectedPackage?.name}</h3>
								<div className="grid grid-cols-1 gap-4 text-sm">
									<div>
										<span className="block text-xs text-emerald-100">Profit Percentage</span>
										<span className="font-medium text-white">{selectedPackage?.profitPercentage}%</span>
									</div>
									<div>
										<span className="block text-xs text-emerald-100">Maturity Period</span>
										<span className="font-medium text-white">{selectedPackage?.maturityPeriod} days</span>
									</div>
									<div>
										<span className="block text-xs text-emerald-100">Amount Range</span>
										<span className="font-medium text-white">
											{selectedPackage?.minAmount} - {selectedPackage?.maxAmount} {getSettings()?.baseCurrency ? getSettings()?.baseCurrency : getCurrencyFromLocalStorage()?.code}
										</span>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
					{/* Amount Input Section */}
					<Card className="flex-1 p-0 border-0 slide-up bg-gradient-to-br from-[#4F46E5] to-[#6366F1] dark:from-[#232e48] dark:to-[#373f5b]">
						<CardContent className="p-0">
							<div className="space-y-8 p-8">
								<div>
									<label className="block text-sm font-medium text-white mb-2">Amount to Provide ({getSettings()?.baseCurrency ? getSettings()?.baseCurrency : getCurrencyFromLocalStorage()?.code})</label>
									<input
										type="number"
										value={amount}
										onChange={(e) => setAmount(e.target.value)}
										min={selectedPackage?.minAmount}
										max={selectedPackage?.maxAmount}
										placeholder="Enter amount"
										className="w-full px-4 py-3 border-2 border-white/60 dark:border-gray-700 rounded-lg bg-white/90 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent font-semibold text-lg"
									/>
									<p className="text-xs text-white/80 dark:text-gray-300 mt-1">
										Minimum: {selectedPackage?.minAmount} {getSettings()?.baseCurrency ? getSettings()?.baseCurrency : getCurrencyFromLocalStorage()?.code} | Maximum: {selectedPackage?.maxAmount}{' '}
										{getSettings()?.baseCurrency ? getSettings()?.baseCurrency : getCurrencyFromLocalStorage()?.code}
									</p>
									{amount && (Number(amount) < (selectedPackage?.minAmount || 0) || Number(amount) > (selectedPackage?.maxAmount || 0)) && (
										<p className="text-sm mt-2 text-red-600 dark:text-red-400 font-medium">
											Amount must be between {selectedPackage?.minAmount} and {selectedPackage?.maxAmount}
										</p>
									)}
								</div>
								{/* Expected Return */}
								{amount && Number(amount) >= (selectedPackage?.minAmount || 0) && Number(amount) <= (selectedPackage?.maxAmount || 0) && (
									<div className="bg-gradient-to-br from-green-200 to-green-400 dark:from-green-900 dark:to-green-700 p-6 rounded-lg shadow">
										<h4 className="font-medium text-green-900 dark:text-green-200 mb-2">Expected Return</h4>
										<div className="text-md text-green-900 dark:text-green-200 space-y-1">
											<div className="flex justify-between">
												<span>Amount provided:</span>
												<span className="font-semibold">
													{amount} {getSettings()?.baseCurrency ? getSettings()?.baseCurrency : getCurrencyFromLocalStorage()?.code}
												</span>
											</div>
											<div className="flex justify-between">
												<span>Expected profit ({selectedPackage?.profitPercentage}%):</span>
												<span className="font-semibold">
													{((Number(amount) * (selectedPackage?.profitPercentage || 0)) / 100).toFixed(2)} {getSettings()?.baseCurrency ? getSettings()?.baseCurrency : getCurrencyFromLocalStorage()?.code}
												</span>
											</div>
											<div className="flex justify-between font-semibold border-t border-green-300 dark:border-green-800 pt-2 mt-2">
												<span>Total return:</span>
												<span>
													{((Number(amount) * (selectedPackage?.profitPercentage || 0)) / 100 + Number(amount)).toFixed(2)} {getSettings()?.baseCurrency ? getSettings()?.baseCurrency : getCurrencyFromLocalStorage()?.code}
												</span>
											</div>
										</div>
									</div>
								)}
								{/* Submit Button */}
								<Button
									onClick={handleAmountSubmit}
									className="w-full whitespace-nowrap bg-white/90 text-[#1F2A44] font-semibold px-6 py-3 rounded-lg text-lg transition-colors hover:bg-white"
									disabled={!amount || Number(amount) < (selectedPackage?.minAmount || 0) || Number(amount) > (selectedPackage?.maxAmount || 0)}
								>
									Confirm Amount
								</Button>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);

	const renderWaiting = () => (
		<div className="p-4 lg:p-6 min-h-screen bg-gray-50 dark:bg-gray-900">
			<div className="max-w-xl mx-auto">
				<Card className="p-0 border-0 bg-gradient-to-br from-[#4F46E5] to-[#6366F1] dark:from-[#232e48] dark:to-[#373f5b] shadow-xl">
					<CardContent className="p-0">
						<div className="py-10 px-6 flex flex-col items-center">
							<div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-6 shadow-lg">
								<i className="ri-time-line w-10 h-10 flex items-center justify-center text-blue-600 dark:text-blue-300"></i>
							</div>
							<h2 className="text-2xl font-bold text-white mb-2 text-center">Creating Your Request</h2>
							<p className="text-indigo-100 mb-8 text-center">
								Please wait while we create your provide help request.
								<br />
								This usually takes a few seconds.
							</p>

							{/* Progress Bar */}
							<div className="w-full mb-8">
								<div className="w-full bg-indigo-200 dark:bg-indigo-900 rounded-full h-3">
									<div className="bg-green-400 dark:bg-green-600 h-3 rounded-full transition-all duration-500" style={{ width: `${waitingProgress}%` }}></div>
								</div>
								<p className="text-xs text-indigo-100 mt-2 text-center">{waitingProgress}% complete</p>
							</div>

							{/* Info Steps */}
							<div className="space-y-4 w-full">
								<div className="flex items-center gap-3 text-sm">
									<i className="ri-shield-check-line w-5 h-5 flex items-center justify-center text-green-300"></i>
									<span className="text-indigo-100">Your request is secure and encrypted</span>
								</div>
								<div className="flex items-center gap-3 text-sm">
									<i className="ri-group-line w-5 h-5 flex items-center justify-center text-blue-200"></i>
									<span className="text-indigo-100">Creating your PH request</span>
								</div>
								<div className="flex items-center gap-3 text-sm">
									<i className="ri-money-dollar-circle-line w-5 h-5 flex items-center justify-center text-yellow-200"></i>
									<span className="text-indigo-100">
										Amount: {amount} {getSettings()?.baseCurrency ? getSettings()?.baseCurrency : getCurrencyFromLocalStorage()?.code}
									</span>
								</div>
								{selectedPackage && (
									<div className="flex items-center gap-3 text-sm">
										<i className="ri-gift-line w-5 h-5 flex items-center justify-center text-pink-200"></i>
										<span className="text-indigo-100">
											Package: <span className="font-semibold">{selectedPackage.name}</span>
										</span>
									</div>
								)}
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);

	const renderViewRequests = () => {
		if (isLoading) {
			return (
				<div className={`p-4 lg:p-6 ${!hideHeader && 'min-h-screen'}`}>
					<div className="max-w-3xl mx-auto">
						{/* Skeleton loader */}
						{[...Array(2)].map((_, i) => (
							<div key={i} className="animate-pulse mb-8">
								<Card className="p-6 bg-white dark:bg-gray-800 border-0">
									<div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
									<div className="space-y-4">
										{[...Array(4)].map((_, j) => (
											<div key={j} className="h-14 bg-gray-200 dark:bg-gray-700 rounded"></div>
										))}
									</div>
									<div className="space-y-4 mt-6">
										{[...Array(2)].map((_, k) => (
											<div key={k} className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
										))}
									</div>
								</Card>
							</div>
						))}
					</div>
				</div>
			);
		}

		return (
			<div className={`p-4 lg:p-6 ${!hideHeader && 'min-h-screen'}`}>
				<div className="max-w-6xl mx-auto">
					<div className="mb-8 flex flex-col gap-2">
						<h2 className="text-2xl font-bold text-gray-900 dark:text-white">My PH Requests</h2>
						<p className="text-gray-600 dark:text-gray-400">Manage all your provide help requests</p>
						{!hideHeader && (
							<Button onClick={() => setCurrentState('select-package')} className="self-start bg-[#1F2A44] hover:bg-[#25325a] text-white mt-2">
								<i className="ri-add-line w-4 h-4 flex items-center justify-center mr-2"></i>
								Create New Request
							</Button>
						)}
					</div>
					{paginatedRequests.length === 0 ? (
						<Card className="p-8 text-center bg-white dark:bg-gray-800 border-0">
							<CardContent className="p-0">
								<div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
									<i className="ri-file-list-line w-8 h-8 flex items-center justify-center text-gray-400"></i>
								</div>
								<h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No PH Requests Yet</h3>
								<p className="text-gray-600 dark:text-gray-400 mb-6">You haven't created any provide help requests yet. Start by creating your first request.</p>
								<Button onClick={() => setCurrentState('select-package')} className="bg-[#1F2A44] hover:bg-[#25325a] text-white whitespace-nowrap">
									<i className="ri-add-line w-4 h-4 flex items-center justify-center mr-2"></i>
									Create First Request
								</Button>
							</CardContent>
						</Card>
					) : (
						<>
							<div className="space-y-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
								{paginatedRequests.map((request) => {
									const isWaiting = request.status === 'pending' || request.status === 'waiting-match';
									return (
										<Card key={request.id} className="p-0 bg-white dark:bg-gray-800 border-0 slide-up">
											<CardContent className="p-0">
												{/* Request ID and Status */}
												<div className="flex flex-col gap-2 border-b border-gray-200 dark:border-gray-700 px-6 pt-6 pb-4">
													<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
														<div className="flex items-center gap-3">
															<span className="font-poppins text-lg font-semibold text-gray-900 dark:text-white">{request.id}</span>
															<span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>{getStatusText(request.status, new Date() > new Date(request.expectedMaturity))}</span>
														</div>
														<span className="text-sm text-gray-500 dark:text-gray-400">{request.packageName}</span>
													</div>
												</div>

												{/* Key Metrics as horizontal cards */}
												<div className="flex flex-col gap-4 px-6 py-6">
													<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
														<div className="rounded-lg bg-gradient-to-br from-[#4F46E5] to-[#6366F1] p-4 flex flex-col shadow">
															<span className="text-xs text-indigo-100 mb-1">Amount</span>
															<span className="font-semibold text-lg text-white">
																{request.amount} {getSettings()?.baseCurrency ? getSettings()?.baseCurrency : getCurrencyFromLocalStorage()?.code}
															</span>
														</div>
														<div className="rounded-lg bg-gradient-to-br from-[#F59E42] to-[#FBBF24] p-4 flex flex-col shadow">
															<span className="text-xs text-yellow-900 mb-1">Assigned Users</span>
															<span className="font-semibold text-lg text-[#1F2A44]">{request.assignedUsers.length}</span>
														</div>
														{/* Only show these stats if not waiting */}
														{!isWaiting && (
															<>
																<div className="rounded-lg bg-gradient-to-br from-[#059669] to-[#10B981] p-4 flex flex-col shadow">
																	<span className="text-xs text-emerald-100 mb-1">Expected Maturity</span>
																	<span className="font-semibold text-lg text-white">{request.status === 'active' ? getCountdown(request.expectedMaturity) : 'N/A'}</span>
																</div>
																<div className="rounded-lg bg-gradient-to-br from-[#6366F1] to-[#4F46E5] p-4 flex flex-col shadow">
																	<span className="text-xs text-indigo-100 mb-1">Match Progress</span>
																	<span className="font-semibold text-lg text-white">{request.matchingProgress}%</span>
																</div>
															</>
														)}
													</div>
													{/* Waiting message */}
													{isWaiting && (
														<div className="mt-6 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-blue-900 dark:text-blue-200 text-center font-medium">
															Your request is waiting to be matched. Please wait while the system finds a match for you.
														</div>
													)}
												</div>

												{/* Assigned Users List */}
												{request.assignedUsers.length > 0 && (
													<div className="px-6 pb-6">
														<h4 className="font-medium text-gray-900 dark:text-white mb-3">Assigned Users</h4>
														<div className="flex flex-col gap-6">
															{request.assignedUsers.map((user, idx) => (
																<div
																	key={user.id}
																	className={`rounded-xl p-6 flex flex-col gap-4 shadow-md border-0 slide-up ${
																		idx % 2 === 0 ? 'bg-gradient-to-br from-[#e0e7ff] to-[#c7d2fe] dark:from-[#232e48] dark:to-[#373f5b]' : 'bg-gradient-to-br from-[#fef9c3] to-[#fde68a] dark:from-[#2d3b5e] dark:to-[#4b5563]'
																	}`}
																>
																	<div
																		key={user.id}
																		className={`rounded-xl p-6 flex flex-col gap-4 shadow-md border-0 slide-up ${
																			idx % 2 === 0 ? 'bg-gradient-to-br from-[#e0e7ff] to-[#c7d2fe] dark:from-[#232e48] dark:to-[#373f5b]' : 'bg-gradient-to-br from-[#fef9c3] to-[#fde68a] dark:from-[#2d3b5e] dark:to-[#4b5563]'
																		}`}
																	>
																		<div className="flex flex-col gap-1">
																			<span className="font-semibold text-[#1F2A44] dark:text-white text-base">{user.name || 'N/A'}</span>
																			<span className="text-xs text-gray-500 dark:text-gray-400">@{user.username || 'N/A'}</span>
																		</div>
																		<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
																			<div>
																				<span className="block text-xs text-gray-400">Phone</span>
																				<span className="block text-sm text-gray-900 dark:text-white">{user.phoneNumber || 'N/A'}</span>
																			</div>
																			<div>
																				<span className="block text-xs text-gray-400">Momo Provider</span>
																				<span className="block text-sm text-gray-900 dark:text-white">{user.momo_provider || 'N/A'}</span>
																			</div>
																			<div>
																				<span className="block text-xs text-gray-400">Amount</span>
																				<span className="block text-sm font-semibold text-[#1F2A44] dark:text-white">
																					{user.amount != null ? `${user.amount} ${getSettings()?.baseCurrency ? getSettings()?.baseCurrency : getCurrencyFromLocalStorage()?.code}` : 'N/A'}
																				</span>
																			</div>
																			<div>
																				<span className="block text-xs text-gray-400">Momo Number</span>
																				<span className="block text-sm text-gray-900 dark:text-white">{user.momo_number || 'N/A'}</span>
																			</div>
																			<div>
																				<span className="block text-xs text-gray-400">Account Name</span>
																				<span className="block text-sm text-gray-900 dark:text-white">{user.accountName || 'N/A'}</span>
																			</div>
																			<div>
																				<span className="block text-xs text-gray-400">Time Assigned</span>
																				<span className="block text-sm text-gray-900 dark:text-white">{user.timeAssigned ? new Date(user.timeAssigned).toLocaleString() : 'N/A'}</span>
																			</div>
																		</div>
																		<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
																			<span className={`px-2 py-1 rounded-full text-xs font-medium ${getUserStatusColor(user.status)}`}>
																				{user.status === 'proof-submitted' ? 'Proof Submitted' : user.status === 'confirmed' ? 'Payment Confirmed' : user.status.charAt(0).toUpperCase() + user.status.slice(1)}
																			</span>
																			<Button
																				size="sm"
																				onClick={() => handleUploadPayment(user)}
																				disabled={user.status === 'confirmed' || user.status === 'proof-submitted'}
																				className="bg-[#1F2A44] hover:bg-[#25325a] text-white px-4 py-2 rounded font-medium mt-2 sm:mt-0"
																			>
																				{user.status === 'confirmed' ? 'Payment Confirmed' : user.status === 'proof-submitted' ? 'Proof Submitted' : 'I have made payment'}
																			</Button>
																		</div>
																	</div>
																</div>
															))}
														</div>
													</div>
												)}
											</CardContent>
										</Card>
									);
								})}
							</div>
							{/* Pagination */}
							{totalPages > 1 && (
								<div className="flex justify-center items-center gap-2 mt-10">
									<Button
										variant="outline"
										size="sm"
										onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
										disabled={currentPage === 1}
										className="whitespace-nowrap bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
									>
										<i className="ri-arrow-left-line w-4 h-4 flex items-center justify-center mr-1"></i>
										Previous
									</Button>
									<div className="flex items-center gap-1">
										{[...Array(totalPages)].map((_, i) => (
											<Button
												key={i}
												variant={currentPage === i + 1 ? 'default' : 'outline'}
												size="sm"
												onClick={() => setCurrentPage(i + 1)}
												className={`w-8 h-8 p-0 ${currentPage === i + 1 ? 'bg-[#1F2A44] text-white' : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'}`}
											>
												{i + 1}
											</Button>
										))}
									</div>
									<Button
										variant="outline"
										size="sm"
										onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
										disabled={currentPage === totalPages}
										className="whitespace-nowrap bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
									>
										Next
										<i className="ri-arrow-right-line w-4 h-4 flex items-center justify-center ml-1"></i>
									</Button>
								</div>
							)}
						</>
					)}
				</div>
				<PaymentProofModal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} onConfirm={handlePaymentProofUpload} userName={selectedUser?.name || ''} amount={selectedUser?.amount || 0} />
			</div>
		);
	};

	const renderCurrentState = () => {
		if (hideHeader) {
			if (paginatedRequests.length > 0) return renderViewRequests();
		} else {
			switch (currentState) {
				case 'select-package':
					return renderSelectPackage();
				case 'enter-amount':
					return renderEnterAmount();
				case 'waiting':
					return renderWaiting();
				case 'view-requests':
					return renderViewRequests();
				default:
					return renderViewRequests();
			}
		}
	};

	return (
		<>
			<TermsAndConditionsModal isOpen={showTermsModal} onAgree={() => setShowTermsModal(false)} />
			{!showTermsModal && renderCurrentState()}
		</>
	);
}
