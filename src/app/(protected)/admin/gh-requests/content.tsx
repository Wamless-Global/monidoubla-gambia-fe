'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { logger } from '@/lib/logger';
import { GHRequest } from './types';
import GHRequestsFilters from './GHRequestsFilters';
import GHRequestsTable from './GHRequestsTable';
import GHRequestsPagination from './GHRequestsPagination';
import EditGHRequestModal from './EditGHRequestModal';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import MatchUsersModal from '@/components/MatchUsersModal';
import { Button } from '@/components/ui/button';
import { CustomLink } from '@/components/CustomLink';
import { Package } from '../../user/provide-help/content';
import AddGHRequestModal from '@/components/AddGHRequestModal';
import { PHRequest } from '../ph-requests/multiple-match/types';
import { getCurrencyFromLocalStorage, handleFetchMessage, getSettings } from '@/lib/helpers';

export default function GHRequestsPage() {
	const [requests, setRequests] = useState<GHRequest[]>([]);
	const [filteredRequests, setFilteredRequests] = useState<GHRequest[]>([]);
	const [loading, setLoading] = useState(true);
	const [pageLoading, setPageLoading] = useState(false);
	const [matchLoading, setMatchLoading] = useState<{ [key: string]: boolean }>({});
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [searchTerm, setSearchTerm] = useState('');
	const [statusFilter, setStatusFilter] = useState('All');
	const [locationFilter, setLocationFilter] = useState('All');
	const [sortBy, setSortBy] = useState('dateCreated');
	const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; request: GHRequest | null }>({
		isOpen: false,
		request: null,
	});
	const [editModal, setEditModal] = useState<{ isOpen: boolean; request: GHRequest | null }>({
		isOpen: false,
		request: null,
	});
	const [matchModal, setMatchModal] = useState<{
		isOpen: boolean;
		request: GHRequest | null;
		existingMatches: PHRequest[];
	}>({
		isOpen: false,
		request: null,
		existingMatches: [],
	});
	const [addModal, setAddModal] = useState(false);
	const [deleteLoading, setDeleteLoading] = useState(false);
	const [isMounted, setIsMounted] = useState(false);
	const [packages, setPackages] = useState<Package[]>([]);

	const itemsPerPage = 10;

	useEffect(() => {
		setIsMounted(true);
		fetchRequests(1);
		fetchPackages();
	}, []);

	const fetchPackages = async () => {
		try {
			const pkgRes = await fetchWithAuth('/api/packages');
			const pkgJson = await pkgRes.json();
			if (!pkgRes.ok) {
				throw new Error(handleFetchMessage(pkgJson));
			}
			const apiPackages = (pkgJson.data || []).map((pkg: any) => ({
				id: pkg.id,
				name: pkg.name,
				profitPercentage: Number(pkg.gain),
				maturityPeriod: parseInt((pkg.maturity || '0').match(/(\d+)/)?.[1] || '0', 10),
				minAmount: Number(pkg.min),
				maxAmount: Number(pkg.max),
				raw: pkg,
			}));
			setPackages(apiPackages);
		} catch (e) {
			toast.error(handleFetchMessage(e, 'Failed to load packages'));
			logger.error('Failed to load packages', e);
		}
	};

	const fetchRequests = async (page: number) => {
		setPageLoading(true);
		try {
			const res = await fetchWithAuth(`/api/gh-requests/all?page=${page}&limit=${itemsPerPage}`);
			const json = await res.json();
			if (!res.ok) {
				throw new Error(handleFetchMessage(await res.json(), 'Failed to create matches'));
			}
			const requests: GHRequest[] = (json.data.requests || []).map((req: any) => ({
				id: req.id,
				user: {
					id: req.user?.id || '',
					name: req.user?.name || '',
					username: req.user?.username || '',
					email: req.user?.email || '',
					phoneNumber: req.user?.phoneNumber || '',
					location: req.user?.location || '',
				},
				amount: Number(req.amount),
				remainingAmount: Number(req.amount) - (req.matchedAmount || 0),
				dateCreated: req.created_at,
				status: req.status || 'pending',
				notes: req.notes || '',
			}));

			setRequests(requests);
			setTotalPages(Math.max(1, Math.ceil((json.data.count || 0) / itemsPerPage)));
		} catch (error) {
			toast.error(handleFetchMessage(error, 'Failed to load GH requests'));
			logger.error('Failed to load GH requests', error);
			setRequests([]);
		} finally {
			setLoading(false);
			setPageLoading(false);
		}
	};

	const filterRequests = () => {
		let filtered = requests.filter((request) => {
			const matchesSearch = request.user.name.toLowerCase().includes(searchTerm.toLowerCase()) || request.user.email.toLowerCase().includes(searchTerm.toLowerCase()) || request.user.location.toLowerCase().includes(searchTerm.toLowerCase());
			const matchesStatus = statusFilter === 'All' || request.status === statusFilter;
			const matchesLocation = locationFilter === 'All' || request.user.location.includes(locationFilter);

			return matchesSearch && matchesStatus && matchesLocation;
		});

		filtered.sort((a, b) => {
			switch (sortBy) {
				case 'amount-low':
					return a.remainingAmount - b.remainingAmount;
				case 'amount-high':
					return b.remainingAmount - a.remainingAmount;
				case 'name':
					return a.user.name.localeCompare(b.user.name);
				case 'dateCreated':
				default:
					return new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime();
			}
		});

		setFilteredRequests(filtered);
	};

	useEffect(() => {
		filterRequests();
	}, [requests, searchTerm, statusFilter, locationFilter, sortBy]);

	const handlePageChange = (page: number) => {
		setCurrentPage(page);
		fetchRequests(page);
	};

	const handleDeleteRequest = (request: GHRequest) => {
		setDeleteModal({ isOpen: true, request });
	};

	const confirmDelete = async () => {
		if (!deleteModal.request) return;

		setDeleteLoading(true);
		try {
			const res = await fetchWithAuth(`/api/gh-requests/${deleteModal.request.id}`, {
				method: 'DELETE',
			});

			if (!res.ok) {
				const data = await res.json();
				throw new Error(handleFetchMessage(data, 'Failed to delete GH request'));
			}

			setRequests(requests.filter((request) => request.id !== deleteModal.request!.id));
			toast.success('GH request deleted successfully');
			setDeleteModal({ isOpen: false, request: null });
		} catch (error: any) {
			toast.error(handleFetchMessage(error, 'Failed to delete request'));
			logger.error('Failed to delete GH request', error);
		} finally {
			setDeleteLoading(false);
		}
	};

	const handleEditRequest = (request: GHRequest) => {
		setEditModal({ isOpen: true, request });
	};

	const handleSaveRequest = (updatedRequest: GHRequest) => {
		setRequests(requests.map((r) => (r.id === updatedRequest.id ? updatedRequest : r)));
		setEditModal({ isOpen: false, request: null });
	};

	const handleMatchRequest = async (request: GHRequest) => {
		setMatchLoading((prev) => ({ ...prev, [request.id]: true }));
		try {
			const res = await fetchWithAuth(`/api/matches/all?ghId=${request.id}`);
			const json = await res.json();
			if (!res.ok) {
				throw new Error(handleFetchMessage(json, 'Failed to fetch matches'));
			}
			logger.warn('Existing matches for GH request:', json);
			const existingMatches: PHRequest[] = (json.data?.matches || []).map((match: any) => ({
				id: match.phRequest.id,
				user: {
					id: match.userInfo?.id || '',
					name: match.userInfo?.name || '',
					username: match.userInfo?.username || '',
					email: match.userInfo?.email || '',
					phoneNumber: match.userInfo?.phoneNumber || '',
					location: match.userInfo?.location || '',
				},
				amount: Number(match.amount),
				availableAmount: Number(match.phRequest.availableAmount || match.amount),
				dateCreated: match.phRequest.created_at,
				status: match.phRequest.status || 'pending',
				packageName: match.phRequest.packageInfo?.name || 'Default Package',
				packageId: match.phRequest.packageInfo?.id || '',
				expectedMaturity: match.phRequest.expectedMaturity || '',
				profitPercentage: Number(match.phRequest.packageInfo?.gain || 0),
				maturityPeriod: parseInt((match.phRequest.packageInfo?.maturity || '0').match(/(\d+)/)?.[1] || '0', 10),
				matchingProgress: match.phRequest.amount > 0 ? Math.min(100, Math.round(((match.phRequest.amount - match.phRequest.availableAmount) / match.phRequest.amount) * 100)) : 0,
				assignedUsers: [],
				notes: match.phRequest.notes || '',
			}));
			setMatchModal({
				isOpen: true,
				request,
				existingMatches,
			});
		} catch (error) {
			toast.error(handleFetchMessage(error, 'Failed to load existing matches'));
			logger.error('Failed to load matches for GH request', error);
		} finally {
			setMatchLoading((prev) => ({ ...prev, [request.id]: false }));
		}
	};

	const handleMatchUsers = async (ghRequest: GHRequest, selectedPHRequests: PHRequest[]) => {
		try {
			const res = await fetchWithAuth('/api/matches', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					matches: selectedPHRequests.map((ph) => ({
						phRequestId: ph.id,
						ghRequestId: ghRequest.id,
						amount: Math.min(ph.availableAmount, ghRequest.remainingAmount),
					})),
				}),
			});
			if (!res.ok) {
				throw new Error(handleFetchMessage(await res.json(), 'Failed to create matches'));
			}
			setRequests(
				requests.map((r) =>
					r.id === ghRequest.id
						? {
								...r,
								status: r.remainingAmount === selectedPHRequests.reduce((sum, ph) => sum + Math.min(ph.availableAmount, r.remainingAmount), 0) ? 'matched' : 'pending',
						  }
						: r
				)
			);
			setMatchModal({ isOpen: false, request: null, existingMatches: [] });
			toast.success('Successfully matched users');
		} catch (error) {
			toast.error(handleFetchMessage(error, 'Failed to match users'));
			logger.error('Failed to match users', error);
		}
	};

	const handleAddRequests = (newRequests: GHRequest[]) => {
		setRequests([...newRequests, ...requests]);
		setAddModal(false);
	};

	const resetFilters = () => {
		setSearchTerm('');
		setStatusFilter('All');
		setLocationFilter('All');
		setSortBy('dateCreated');
		toast.success('Filters reset successfully');
	};

	if (!isMounted) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
			</div>
		);
	}

	return (
		<div className="p-6 space-y-6 min-h-screen" suppressHydrationWarning={true}>
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
				<h1 className="text-2xl font-bold text-gray-900 dark:text-white">GH Requests</h1>
				<div className="flex gap-2">
					<Button onClick={() => setAddModal(true)} className="bg-green-600 hover:bg-green-700 text-white whitespace-nowrap">
						<i className="ri-add-line w-4 h-4 flex items-center justify-center mr-2"></i>
						Add Request
					</Button>
					<CustomLink href="/admin/gh-requests/multiple-match">
						<Button className="bg-blue-600 hover:bg-blue-700 text-white whitespace-nowrap">
							<i className="ri-group-line w-4 h-4 flex items-center justify-center mr-2"></i>
							Multiple Match
						</Button>
					</CustomLink>
				</div>
			</div>

			<GHRequestsFilters searchTerm={searchTerm} setSearchTerm={setSearchTerm} statusFilter={statusFilter} setStatusFilter={setStatusFilter} locationFilter={locationFilter} setLocationFilter={setLocationFilter} sortBy={sortBy} setSortBy={setSortBy} resetFilters={resetFilters} />

			<GHRequestsTable requests={filteredRequests} currentPage={currentPage} itemsPerPage={itemsPerPage} pageLoading={pageLoading} matchLoading={matchLoading} handleEditRequest={handleEditRequest} handleMatchRequest={handleMatchRequest} handleDeleteRequest={handleDeleteRequest} />

			{totalPages > 1 && !pageLoading && <GHRequestsPagination currentPage={currentPage} totalPages={totalPages} handlePageChange={handlePageChange} />}

			<ConfirmationModal
				isOpen={deleteModal.isOpen}
				onClose={() => setDeleteModal({ isOpen: false, request: null })}
				onConfirm={confirmDelete}
				title="Delete GH Request"
				message={`Are you sure you want to delete ${deleteModal.request?.user.name}'s request for ${deleteModal.request?.remainingAmount} ${getSettings()?.baseCurrency ? getSettings()?.baseCurrency : getCurrencyFromLocalStorage()?.code}? This action cannot be undone.`}
				confirmText="Delete"
				cancelText="Cancel"
				confirmVariant="destructive"
				loading={deleteLoading}
			/>

			<EditGHRequestModal isOpen={editModal.isOpen} onClose={() => setEditModal({ isOpen: false, request: null })} request={editModal.request} onSave={handleSaveRequest} />

			<MatchUsersModal isOpen={matchModal.isOpen} onClose={() => setMatchModal({ isOpen: false, request: null, existingMatches: [] })} ghRequest={matchModal.request} onMatch={handleMatchUsers} existingMatches={matchModal.existingMatches} />

			<AddGHRequestModal isOpen={addModal} onClose={() => setAddModal(false)} onAdd={handleAddRequests} />
		</div>
	);
}
