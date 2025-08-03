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
import { getCurrencyFromLocalStorage, parseMaturityDays } from '@/lib/helpers';
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
				throw new Error(data?.message || 'Failed to upload payment proof');
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
			toast.error(err?.message || 'Failed to upload payment proof');
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

	const getStatusText = (status: string) => {
		switch (status) {
			case 'pending':
			case 'waiting-match':
				return 'Waiting for Match';
			case 'partial-match':
				return 'Partially Matched';
			case 'active':
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
		<div className="p-4 lg:p-6 min-h-screen">
			<div className="max-w-6xl mx-auto">
				<div className="mb-6">
					<Button onClick={() => setCurrentState('view-requests')} variant="ghost" className="mb-4 whitespace-nowrap text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
						<i className="ri-arrow-left-line w-4 h-4 flex items-center justify-center mr-2"></i>
						Back to Requests
					</Button>
					<h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Select a package</h2>
					<p className="text-gray-600 dark:text-gray-400">Choose the package that best suits your donation goals</p>
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
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
						{packages.map((pkg) => (
							<Card key={pkg.id} className="p-6 hover:shadow-lg transition-shadow bg-white dark:bg-gray-800 border-0">
								<CardContent className="p-0">
									<div className="mb-4">
										<div className="flex items-center gap-2 mb-2">
											<h3 className="font-semibold text-gray-900 dark:text-white">{pkg.name}</h3>
											<i className="ri-crown-line w-4 h-4 flex items-center justify-center text-yellow-500"></i>
										</div>
									</div>

									<div className="space-y-3 mb-6">
										<div className="flex items-center gap-2 text-sm">
											<i className="ri-checkbox-circle-line w-4 h-4 flex items-center justify-center text-green-500"></i>
											<span className="text-gray-600 dark:text-gray-400">Percentage profit: {pkg.profitPercentage}%</span>
										</div>
										<div className="flex items-center gap-2 text-sm">
											<i className="ri-time-line w-4 h-4 flex items-center justify-center text-blue-500"></i>
											<span className="text-gray-600 dark:text-gray-400">Maturity period: {pkg.maturityPeriod} days</span>
										</div>
										<div className="flex items-center gap-2 text-sm">
											<i className="ri-money-dollar-circle-line w-4 h-4 flex items-center justify-center text-purple-500"></i>
											<span className="text-gray-600 dark:text-gray-400">
												Amount: {pkg.minAmount} - {pkg.maxAmount} {getCurrencyFromLocalStorage()?.code}
											</span>
										</div>
									</div>

									<Button onClick={() => handlePackageSelect(pkg)} variant="outline" className="w-full whitespace-nowrap bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600">
										Select package
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
		<div className="p-4 lg:p-6 min-h-screen">
			<div className="max-w-2xl mx-auto">
				<div className="mb-6">
					<Button onClick={() => setCurrentState('select-package')} variant="ghost" className="mb-4 whitespace-nowrap text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
						<i className="ri-arrow-left-line w-4 h-4 flex items-center justify-center mr-2"></i>
						Back to packages
					</Button>
					<h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Enter Amount</h2>
					<p className="text-gray-600 dark:text-gray-400">Selected package: {selectedPackage?.name}</p>
				</div>

				<Card className="p-6 bg-white dark:bg-gray-800 border-0">
					<CardContent className="p-0">
						<div className="space-y-6">
							<div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
								<h3 className="font-semibold text-gray-900 dark:text-white mb-3">Package Details</h3>
								<div className="space-y-2 text-sm">
									<div className="flex justify-between">
										<span className="text-gray-600 dark:text-gray-400">Profit Percentage:</span>
										<span className="font-medium text-gray-900 dark:text-white">{selectedPackage?.profitPercentage}%</span>
									</div>
									<div className="flex justify-between">
										<span className="text-gray-600 dark:text-gray-400">Maturity Period:</span>
										<span className="font-medium text-gray-900 dark:text-white">{selectedPackage?.maturityPeriod} days</span>
									</div>
									<div className="flex justify-between">
										<span className="text-gray-600 dark:text-gray-400">Amount Range:</span>
										<span className="font-medium text-gray-900 dark:text-white">
											{selectedPackage?.minAmount} - {selectedPackage?.maxAmount} {getCurrencyFromLocalStorage()?.code}
										</span>
									</div>
								</div>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Amount to Provide ({getCurrencyFromLocalStorage()?.code})</label>
								<input
									type="number"
									value={amount}
									onChange={(e) => setAmount(e.target.value)}
									min={selectedPackage?.minAmount}
									max={selectedPackage?.maxAmount}
									placeholder="Enter amount"
									className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								/>
								<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
									Minimum: {selectedPackage?.minAmount} {getCurrencyFromLocalStorage()?.code} | Maximum: {selectedPackage?.maxAmount} {getCurrencyFromLocalStorage()?.code}
								</p>
							</div>

							{amount && (
								<div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
									<h4 className="font-medium text-green-800 dark:text-green-200 mb-2">Expected Return</h4>
									<div className="text-sm text-green-700 dark:text-green-300">
										<div className="flex justify-between">
											<span>Amount provided:</span>
											<span className="font-medium">
												{amount} {getCurrencyFromLocalStorage()?.code}
											</span>
										</div>
										<div className="flex justify-between">
											<span>Expected profit ({selectedPackage?.profitPercentage}%):</span>
											<span className="font-medium">
												{((Number(amount) * (selectedPackage?.profitPercentage || 0)) / 100).toFixed(2)} {getCurrencyFromLocalStorage()?.code}
											</span>
										</div>
										<div className="flex justify-between font-semibold border-t border-green-200 dark:border-green-800 pt-2 mt-2">
											<span>Total return:</span>
											<span>
												{(Number(amount) + (Number(amount) * (selectedPackage?.profitPercentage || 0)) / 100).toFixed(2)} {getCurrencyFromLocalStorage()?.code}
											</span>
										</div>
									</div>
								</div>
							)}

							<Button onClick={handleAmountSubmit} className="w-full whitespace-nowrap bg-blue-600 hover:bg-blue-700 text-white" disabled={!amount || Number(amount) < (selectedPackage?.minAmount || 0) || Number(amount) > (selectedPackage?.maxAmount || 0)}>
								Confirm Amount
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);

	const renderWaiting = () => (
		<div className="p-4 lg:p-6 min-h-screen">
			<div className="max-w-2xl mx-auto">
				<Card className="p-8 text-center bg-white dark:bg-gray-800 border-0">
					<CardContent className="p-0">
						<div className="mb-6">
							<div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
								<i className="ri-time-line w-8 h-8 flex items-center justify-center text-blue-600 dark:text-blue-400"></i>
							</div>
							<h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Creating Your Request</h2>
							<p className="text-gray-600 dark:text-gray-400">Please wait while we create your provide help request. This usually takes a few seconds.</p>
						</div>

						<div className="mb-6">
							<div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
								<div className="bg-blue-600 h-2 rounded-full transition-all duration-500" style={{ width: `${waitingProgress}%` }}></div>
							</div>
							<p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{waitingProgress}% complete</p>
						</div>

						<div className="space-y-4">
							<div className="flex items-center gap-3 text-sm">
								<i className="ri-shield-check-line w-4 h-4 flex items-center justify-center text-green-500"></i>
								<span className="text-gray-600 dark:text-gray-400">Your request is secure and encrypted</span>
							</div>
							<div className="flex items-center gap-3 text-sm">
								<i className="ri-group-line w-4 h-4 flex items-center justify-center text-blue-500"></i>
								<span className="text-gray-600 dark:text-gray-400">Creating your PH request</span>
							</div>
							<div className="flex items-center gap-3 text-sm">
								<i className="ri-money-dollar-circle-line w-4 h-4 flex items-center justify-center text-purple-500"></i>
								<span className="text-gray-600 dark:text-gray-400">
									Amount: {amount} {getCurrencyFromLocalStorage()?.code}
								</span>
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
				<div className="p-4 lg:p-6 min-h-screen">
					<div className="max-w-6xl mx-auto">
						<div className="mb-6 flex justify-between items-center">
							<div>
								<h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">My PH Requests</h2>
								<p className="text-gray-600 dark:text-gray-400">Manage all your provide help requests</p>
							</div>

							{!hideHeader && (
								<Button onClick={() => setCurrentState('select-package')} className="bg-blue-600 hover:bg-blue-700 text-white whitespace-nowrap">
									<i className="ri-add-line w-4 h-4 flex items-center justify-center mr-2"></i>
									Create New Request
								</Button>
							)}
						</div>
						<div className="space-y-6">
							{[...Array(2)].map((_, i) => (
								<div key={i} className="animate-pulse">
									<Card className="p-6 bg-white dark:bg-gray-800 border-0">
										<div className="flex items-center justify-between mb-4">
											<div className="flex items-center gap-3">
												<div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
												<div>
													<div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
													<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
												</div>
											</div>
											<div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
										</div>
										<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
											{[...Array(4)].map((_, j) => (
												<div key={j} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
											))}
										</div>
										<div className="space-y-4">
											{[...Array(2)].map((_, k) => (
												<div key={k} className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
											))}
										</div>
									</Card>
								</div>
							))}
						</div>
					</div>
				</div>
			);
		}

		return (
			<div className="p-4 lg:p-6 min-h-screen">
				<div className="max-w-6xl mx-auto">
					<div className="mb-6 flex justify-between items-center">
						<div>
							<h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">My PH Requests</h2>
							<p className="text-gray-600 dark:text-gray-400">Manage all your provide help requests</p>
						</div>

						{!hideHeader && (
							<Button onClick={() => setCurrentState('select-package')} className="bg-blue-600 hover:bg-blue-700 text-white whitespace-nowrap">
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
								<Button onClick={() => setCurrentState('select-package')} className="bg-blue-600 hover:bg-blue-700 text-white whitespace-nowrap">
									<i className="ri-add-line w-4 h-4 flex items-center justify-center mr-2"></i>
									Create First Request
								</Button>
							</CardContent>
						</Card>
					) : (
						<>
							<div className="space-y-6">
								{paginatedRequests.map((request) => {
									return (
										<Card key={request.id} className="p-6 bg-white dark:bg-gray-800 border-0">
											<CardContent className="p-0">
												<div className="flex items-center justify-between mb-4">
													<div className="flex items-center gap-3">
														<div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
															<i className="ri-hand-heart-line w-6 h-6 flex items-center justify-center text-blue-600 dark:text-blue-400"></i>
														</div>
														<div>
															<h3 className="font-semibold text-gray-900 dark:text-white">{request.id}</h3>
															<p className="text-sm text-gray-600 dark:text-gray-400">{request.packageName}</p>
														</div>
													</div>

													<div className="flex items-center gap-2">
														<span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>{getStatusText(request.status)}</span>

														{request.status === 'active' && new Date() > new Date(request.expectedMaturity) && (
															<Button
																size="sm"
																className="ml-2 bg-green-600 hover:bg-green-700 text-white px-3 py-1 text-xs"
																onClick={async () => {
																	setIsRequestingGH(request.id);
																	try {
																		const user = getCurrentUser();
																		if (!user) {
																			toast.error('User not found. Please log in again.');
																			return;
																		}
																		const gain = (request.amount * (request.profitPercentage || 0)) / 100;
																		const totalAmount = request.amount + gain;
																		const res = await fetchWithAuth('/api/gh-requests', {
																			method: 'POST',
																			headers: { 'Content-Type': 'application/json' },
																			body: JSON.stringify({ user: user.id, amount: totalAmount, status: 'pending', requestId: request.id }),
																		});
																		const data = await res.json();
																		if (!res.ok) {
																			throw new Error(data?.message || 'Failed to request GH');
																		} else {
																			nProgress.start();
																			router.push('/user/get-help');
																		}
																		toast.success('GH request submitted successfully!');
																	} catch (err: any) {
																		toast.error(err?.message || 'Failed to request GH');
																	} finally {
																		setIsRequestingGH(null);
																	}
																}}
																disabled={isRequestingGH === request.id}
															>
																{isRequestingGH === request.id ? (
																	<div className="flex items-center gap-2">
																		<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
																		<span>Requesting...</span>
																	</div>
																) : (
																	'Request GH'
																)}
															</Button>
														)}
													</div>
												</div>
												<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
													<div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
														<div className="flex items-center gap-2 mb-1">
															<i className="ri-money-dollar-circle-line w-4 h-4 flex items-center justify-center text-gray-500 dark:text-gray-400"></i>
															<span className="text-sm text-gray-600 dark:text-gray-400">Amount</span>
														</div>
														<p className="font-semibold text-gray-900 dark:text-white">
															{request.amount} {getCurrencyFromLocalStorage()?.code}
														</p>
													</div>
													<div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
														<div className="flex items-center gap-2 mb-1">
															<i className="ri-calendar-line w-4 h-4 flex items-center justify-center text-gray-500 dark:text-gray-400"></i>
															<span className="text-sm text-gray-600 dark:text-gray-400">Expected Maturity</span>
														</div>
														<p className="font-semibold text-gray-900 dark:text-white">{request.status === 'active' ? getCountdown(request.expectedMaturity) : 'N/A'}</p>
													</div>
													<div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
														<div className="flex items-center gap-2 mb-1">
															<i className="ri-team-line w-4 h-4 flex items-center justify-center text-gray-500 dark:text-gray-400"></i>
															<span className="text-sm text-gray-600 dark:text-gray-400">Assigned Users</span>
														</div>
														<p className="font-semibold text-gray-900 dark:text-white">{request.assignedUsers.length}</p>
													</div>
													<div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
														<div className="flex items-center gap-2 mb-1">
															<i className="ri-bar-chart-line w-4 h-4 flex items-center justify-center text-gray-500 dark:text-gray-400"></i>
															<span className="text-sm text-gray-600 dark:text-gray-400">Match Progress</span>
														</div>
														<p className="font-semibold text-gray-900 dark:text-white">{request.matchingProgress}%</p>
													</div>
												</div>

												{(request.status === 'waiting-match' || request.status === 'pending') && (
													<div className="text-center py-6">
														<div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
															<i className="ri-search-line w-8 h-8 flex items-center justify-center text-blue-600 dark:text-blue-400"></i>
														</div>
														<h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Waiting for Match</h4>
														<p className="text-gray-600 dark:text-gray-400">We're searching for users to match with your request. This process typically takes a few hours.</p>
													</div>
												)}

												{request.assignedUsers.length > 0 && (
													<div>
														<h4 className="font-medium text-gray-900 dark:text-white mb-3">Assigned Users</h4>
														<div className="space-y-4">
															{request.assignedUsers.map((user) => (
																<div key={user.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
																	<div className="flex items-center justify-between mb-3">
																		<div className="flex items-center gap-3">
																			<div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
																				<i className="ri-user-line w-5 h-5 flex items-center justify-center text-blue-600 dark:text-blue-400"></i>
																			</div>
																			<div>
																				<h5 className="font-semibold text-gray-900 dark:text-white">{user.name}</h5>
																				<p className="text-sm text-gray-600 dark:text-gray-400">@{user.username}</p>
																			</div>
																		</div>
																		<span className={`px-2 py-1 rounded-full text-xs font-medium ${getUserStatusColor(user.status)}`}>{user.status === 'proof-submitted' ? 'Proof Submitted' : user.status}</span>
																	</div>

																	<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
																		<div>
																			<span className="text-sm text-gray-600 dark:text-gray-400">Phone: </span>
																			<span className="text-sm text-gray-900 dark:text-white">{user.phoneNumber}</span>
																		</div>
																		<div>
																			<span className="text-sm text-gray-600 dark:text-gray-400">Amount: </span>
																			<span className="text-sm font-semibold text-gray-900 dark:text-white">
																				{user.amount} {getCurrencyFromLocalStorage()?.code}
																			</span>
																		</div>
																		<div>
																			<span className="text-sm text-gray-600 dark:text-gray-400">Momo Provider: </span>
																			<span className="text-sm text-gray-900 dark:text-white">{user.momo_provider}</span>
																		</div>
																		<div>
																			<span className="text-sm text-gray-600 dark:text-gray-400">Momo Number: </span>
																			<span className="text-sm text-gray-900 dark:text-white">{user.momo_number}</span>
																		</div>
																	</div>

																	<div className="flex justify-between items-center">
																		<span className="text-sm text-gray-600 dark:text-gray-400">Assigned {user.timeAssigned}</span>
																		<Button size="sm" onClick={() => handleUploadPayment(user)} disabled={user.status === 'confirmed' || user.status === 'proof-submitted'} className="bg-blue-600 hover:bg-blue-700 text-white whitespace-nowrap">
																			<i className="ri-upload-line w-4 h-4 flex items-center justify-center mr-2"></i>
																			{user.status === 'confirmed' ? 'Payment Confirmed' : user.status === 'proof-submitted' ? 'Proof Submitted' : 'I have made payment'}
																		</Button>
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

							{totalPages > 1 && (
								<div className="flex justify-center items-center gap-2 mt-8">
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
												className={`w-8 h-8 p-0 ${currentPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'}`}
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
