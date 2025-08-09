'use client';

import { useState, useEffect, useCallback } from 'react';
import { type VariantProps } from 'class-variance-authority'; // Correction: This line is added
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge, badgeVariants } from '@/components/ui/badge'; // Ensure badgeVariants is exported from badge.tsx
import { toast } from 'sonner';
import { CustomLink } from '@/components/CustomLink';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { logger } from '@/lib/logger';
import { getCurrencyFromLocalStorage, handleFetchMessage, parseMaturityDays, getSettings } from '@/lib/helpers';

// NOTE: All original interfaces and logic are preserved.
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
	const recordsPerPage = 5; // Adjusted for a card-based layout
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
			if (!phRes.ok) throw new Error(handleFetchMessage(phJson, 'Failed to fetch help records'));

			const phData = phJson.data?.requests || [];
			const total = phJson.data.count || phData.length;

			const mappedPH: PHRecord[] = phData.map((req: any) => ({
				id: req.id,
				amount: Number(req.amount),
				originalAmount: req.phRequest?.amount || 0,
				dateProvided: req.created_at || new Date().toISOString(),
				maturityDate: new Date(new Date(req.created_at || new Date()).setDate(new Date(req.created_at || new Date()).getDate() + (req.phRequest?.packageInfo?.maturity ? parseMaturityDays(req.phRequest?.packageInfo?.maturity) : 0))).toISOString().split('T')[0],
				status: req.status,
				package: req.phRequest?.packageInfo?.name || 'Bonus',
				profitPercentage: Number(req.packageInfo?.gain || 0),
				maturedAmount: Number(req.amount) * (1 + Number(req.packageInfo?.gain || 0) / 100),
				ghRequestId: req.ghRequestId,
				matchedUsers: req.details?.map((u: any) => ({ id: u.id, name: u.name, email: u.email || '', amount: Number(u.amount), paymentProof: u.paymentProof, paymentStatus: u.status, paymentDate: u.paymentDate })) || [],
			}));

			const hasPH = mappedPH.length > 0;
			const hasMaturedPH = mappedPH.some((record) => record.status === 'active');
			const hasRequestedPH = mappedPH.some((record) => ['pending', 'waiting-match'].includes(record.status));
			const hasMatchedPH = mappedPH.some((record) => ['matched', 'partial-match'].includes(record.status));

			if (!hasPH) setUserState('no-ph');
			else if (hasMatchedPH) setUserState('gh-matched');
			else if (hasRequestedPH) setUserState('gh-requested');
			else if (hasMaturedPH) setUserState('ph-matured');
			else setUserState('ph-not-matured');

			setPHRecords(mappedPH);
			setTotalCount(total);
		} catch (error) {
			toast.error(handleFetchMessage(error, 'Failed to load help records'));
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
		setCurrentPage(page);
		loadUserData(page);
	};

	const handleRequestHelp = async (phId: string) => {
		setRequestingHelp(phId);
		try {
			const response = await fetchWithAuth('/api/gh-requests', { method: 'POST', body: JSON.stringify({ phId }) });
			if (!response.ok) throw new Error(handleFetchMessage(await response.json(), 'Failed to submit help request'));
			setPHRecords((prev) => prev.map((r) => (r.id === phId ? { ...r, status: 'pending' } : r)));
			toast.success('Help request submitted successfully!');
			setUserState('gh-requested');
		} catch (error) {
			toast.error(handleFetchMessage(error, 'Failed to submit help request'));
		} finally {
			setRequestingHelp(null);
		}
	};

	const getStatusVariant = (status: string): VariantProps<typeof badgeVariants>['variant'] => {
		switch (status) {
			case 'active':
			case 'completed':
				return 'success';
			case 'pending':
			case 'waiting-match':
				return 'warning';
			case 'matched':
			case 'partial-match':
				return 'info';
			case 'cancelled':
				return 'destructive';
			default:
				return 'secondary';
		}
	};

	const getStatusText = (status: string) => {
		return status.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
	};

	const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
	const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: getSettings()?.baseCurrency || getCurrencyFromLocalStorage()?.code || 'USD', minimumFractionDigits: 2 }).format(amount);
	const totalPages = Math.ceil(totalCount / recordsPerPage);

	if (!isMounted || loading) {
		return (
			<div className="flex items-center justify-center min-h-screen bg-gray-50">
				<div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600"></div>
			</div>
		);
	}

	if (userState === 'no-ph') {
		return (
			<div className="bg-gray-50 min-h-screen flex items-center justify-center p-4">
				<Card className="max-w-lg w-full text-center p-8">
					<div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
						<i className="ri-hand-heart-line text-3xl text-teal-600"></i>
					</div>
					<CardTitle className="text-2xl mb-2">Provide Help First</CardTitle>
					<CardDescription className="mb-6">To get help, you need to provide help first. Start by helping others in the community and watch your donation grow.</CardDescription>
					<CustomLink href="/user/provide-help">
						<Button>Provide Help Now</Button>
					</CustomLink>
				</Card>
			</div>
		);
	}

	return (
		<div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8">
			<div className="max-w-7xl mx-auto">
				<header className="mb-8">
					<h1 className="text-3xl font-bold text-gray-800">Get Help</h1>
					<p className="text-gray-500 mt-1">Review your matured packages and request help.</p>
				</header>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
					<Card>
						<CardHeader className="flex-row items-center justify-between pb-2">
							<CardTitle className="text-sm font-medium">Total Provided</CardTitle>
							<i className="ri-wallet-3-line text-xl text-gray-400"></i>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{formatCurrency(phRecords.reduce((sum, r) => sum + (r?.originalAmount || r.amount), 0))}</div>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="flex-row items-center justify-between pb-2">
							<CardTitle className="text-sm font-medium">Available to Request</CardTitle>
							<i className="ri-safe-2-line text-xl text-green-500"></i>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold text-green-600">{formatCurrency(phRecords.filter((r) => r.status === 'active').reduce((sum, r) => sum + r.maturedAmount, 0))}</div>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="flex-row items-center justify-between pb-2">
							<CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
							<i className="ri-time-line text-xl text-yellow-500"></i>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{phRecords.filter((r) => ['pending', 'waiting-match'].includes(r.status)).length}</div>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="flex-row items-center justify-between pb-2">
							<CardTitle className="text-sm font-medium">Matched Requests</CardTitle>
							<i className="ri-group-line text-xl text-blue-500"></i>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{phRecords.filter((r) => ['matched', 'partial-match'].includes(r.status)).length}</div>
						</CardContent>
					</Card>
				</div>

				<div className="space-y-6">
					{phRecords.map((record) => (
						<Card key={record.id}>
							<CardHeader className="flex-col sm:flex-row sm:items-center sm:justify-between">
								<div>
									<CardTitle>{record.package}</CardTitle>
									<CardDescription>Created: {formatDate(record.dateProvided)}</CardDescription>
								</div>
								<Badge variant={getStatusVariant(record.status)} className="mt-2 sm:mt-0">
									{getStatusText(record.status)}
								</Badge>
							</CardHeader>
							<CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-0">
								<div>
									<p className="text-sm text-gray-500 mb-1">Original Amount</p>
									<p className="text-lg font-semibold text-gray-800">{formatCurrency(record?.originalAmount || record.amount)}</p>
								</div>
								<div>
									<p className="text-sm text-gray-500 mb-1">Maturity Date</p>
									<p className="text-lg font-semibold text-gray-800">{formatDate(record.maturityDate)}</p>
								</div>
								<div>
									<p className="text-sm text-gray-500 mb-1">Matured Amount</p>
									<p className="text-lg font-semibold text-green-600">{formatCurrency(record.maturedAmount)}</p>
								</div>
							</CardContent>
							<CardFooter>
								<div className="flex-grow"></div>
								{record.status === 'active' && (
									<Button onClick={() => handleRequestHelp(record.id)} disabled={requestingHelp === record.id}>
										{requestingHelp === record.id ? 'Requesting...' : 'Request Help'}
									</Button>
								)}
								{(record.status === 'matched' || record.status === 'partial-match' || record.status === 'completed') && (
									<CustomLink href={`/user/get-help/${record.id}`}>
										<Button variant="outline">View Details</Button>
									</CustomLink>
								)}
							</CardFooter>
						</Card>
					))}
				</div>

				{totalPages > 1 && (
					<div className="flex justify-center items-center gap-2 mt-8 text-sm">
						<Button variant="outline" size="icon" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
							<i className="ri-arrow-left-s-line"></i>
						</Button>
						<span className="text-gray-700 font-medium">
							Page {currentPage} of {totalPages}
						</span>
						<Button variant="outline" size="icon" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
							<i className="ri-arrow-right-s-line"></i>
						</Button>
					</div>
				)}
				{pageLoading && (
					<div className="flex items-center justify-center py-10">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
					</div>
				)}
			</div>
		</div>
	);
}
