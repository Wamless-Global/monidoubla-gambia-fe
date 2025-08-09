'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { logger } from '@/lib/logger';
import PHRequestsFilters from './PHRequestsFilters';
import PHRequestsTable from './PHRequestsTable';
import PHRequestsPagination from './PHRequestsPagination';
import AddPHRequestModal from './AddPHRequestModal';
import EditPHRequestModal from './EditPHRequestModal';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { CustomLink } from '@/components/CustomLink';
import { Package } from '../../user/provide-help/content';
import { getCurrencyFromLocalStorage, handleFetchMessage, parseMaturityDays, getSettings } from '@/lib/helpers';
import { PHRequest } from './multiple-match/types';

export default function PHRequestsPage() {
	const [requests, setRequests] = useState<PHRequest[]>([]);
	const [loading, setLoading] = useState(true);
	const [pageLoading, setPageLoading] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [searchTerm, setSearchTerm] = useState('');
	const [statusFilter, setStatusFilter] = useState('All');
	const [locationFilter, setLocationFilter] = useState('All');
	const [sortBy, setSortBy] = useState('dateCreated');
	const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; request: PHRequest | null }>({ isOpen: false, request: null });
	const [editModal, setEditModal] = useState<{ isOpen: boolean; request: PHRequest | null }>({ isOpen: false, request: null });
	const [addModal, setAddModal] = useState(false);
	const [deleteLoading, setDeleteLoading] = useState(false);
	const [isMounted, setIsMounted] = useState(false);
	const [packages, setPackages] = useState<Package[]>([]);

	const itemsPerPage = 10;

	const fetchPackages = async () => {
		try {
			const pkgRes = await fetchWithAuth('/api/packages');
			const pkgJson = await pkgRes.json();
			if (!pkgRes.ok) throw new Error(handleFetchMessage(pkgJson, 'Failed to create matches'));
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
		} catch (e) {
			toast.error(handleFetchMessage(e, 'Failed to load data'));
		}
	};

	const fetchRequests = useCallback(async (page: number) => {
		setPageLoading(true);
		try {
			const params = new URLSearchParams({ page: page.toString(), limit: itemsPerPage.toString() });
			const res = await fetchWithAuth(`/api/ph-requests/all?${params.toString()}`);
			const json = await res.json();
			if (!res.ok) throw new Error(handleFetchMessage(await res.json(), 'Failed to get PH requests'));

			const mappedRequests: PHRequest[] = (json.data.requests || []).map((req: any) => ({
				id: req.id,
				user: { id: req.user?.id || '', name: req.user?.name || 'N/A', username: req.user?.username || '', email: req.user?.email || '', phoneNumber: req.user?.phoneNumber || '', location: req.user?.location || '' },
				amount: Number(req.amount),
				dateCreated: req.created_at,
				status: req.status || 'pending',
				packageName: req.packageInfo?.name || req.package?.name || 'N/A',
				expectedMaturity: '', // This can be calculated if needed
				profitPercentage: 0,
				maturityPeriod: 0,
				matchingProgress: 0,
				assignedUsers: [],
				availableAmount: Number(req.amount),
			}));
			setRequests(mappedRequests);
			setTotalPages(Math.max(1, Math.ceil((json.data.count || 0) / itemsPerPage)));
		} catch (error) {
			toast.error(handleFetchMessage(error, 'Failed to load PH requests'));
			setRequests([]);
		} finally {
			setLoading(false);
			setPageLoading(false);
		}
	}, []);

	useEffect(() => {
		setIsMounted(true);
		fetchRequests(1);
		fetchPackages();
	}, [fetchRequests]);

	const filteredAndSortedRequests = useMemo(() => {
		let filtered = requests.filter((request) => {
			const search = searchTerm.toLowerCase();
			const matchesSearch = request.user.name.toLowerCase().includes(search) || request.user.email.toLowerCase().includes(search);
			const matchesStatus = statusFilter === 'All' || request.status === statusFilter;
			const matchesLocation = locationFilter === 'All' || request.user.location.includes(locationFilter);
			return matchesSearch && matchesStatus && matchesLocation;
		});

		filtered.sort((a, b) => {
			switch (sortBy) {
				case 'amount-low':
					return a.amount - b.amount;
				case 'amount-high':
					return b.amount - a.amount;
				case 'name':
					return a.user.name.localeCompare(b.user.name);
				case 'dateCreated':
				default:
					return new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime();
			}
		});
		return filtered;
	}, [requests, searchTerm, statusFilter, locationFilter, sortBy]);

	const currentRequests = filteredAndSortedRequests.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

	const handlePageChange = (page: number) => {
		setCurrentPage(page);
		// Note: The original logic fetched per page. This example uses client-side pagination.
		// For server-side pagination, you would call `fetchRequests(page)` here.
	};

	const handleDeleteRequest = (request: PHRequest) => {
		setDeleteModal({ isOpen: true, request });
	};

	const confirmDelete = async () => {
		if (!deleteModal.request) return;
		setDeleteLoading(true);
		try {
			const res = await fetchWithAuth(`/api/ph-requests/${deleteModal.request.id}`, { method: 'DELETE' });
			if (!res.ok) throw new Error(handleFetchMessage(await res.json(), 'Failed to delete PH request'));
			setRequests(requests.filter((request) => request.id !== deleteModal.request!.id));
			toast.success('PH request deleted successfully');
			setDeleteModal({ isOpen: false, request: null });
		} catch (error: any) {
			toast.error(handleFetchMessage(error, 'Failed to delete request'));
		} finally {
			setDeleteLoading(false);
		}
	};

	const handleEditRequest = (request: PHRequest) => {
		setEditModal({ isOpen: true, request });
	};

	const handleSaveRequest = (updatedRequest: PHRequest) => {
		setRequests(requests.map((r) => (r.id === updatedRequest.id ? updatedRequest : r)));
		setEditModal({ isOpen: false, request: null });
	};

	const handleAddRequests = (newRequests: PHRequest[]) => {
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
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
				<div>
					<h1 className="text-3xl font-bold text-slate-800">Provide Help Requests</h1>
					<p className="text-slate-500 mt-1">Manage and match all incoming PH requests.</p>
				</div>
				<div className="flex gap-2">
					<Button onClick={() => setAddModal(true)}>
						<i className="ri-add-line mr-2"></i>Add Request
					</Button>
					<CustomLink href="/admin/ph-requests/multiple-match">
						<Button variant="outline">
							<i className="ri-group-line mr-2"></i>Multiple Match
						</Button>
					</CustomLink>
				</div>
			</header>

			<PHRequestsFilters searchTerm={searchTerm} setSearchTerm={setSearchTerm} statusFilter={statusFilter} setStatusFilter={setStatusFilter} locationFilter={locationFilter} setLocationFilter={setLocationFilter} sortBy={sortBy} setSortBy={setSortBy} resetFilters={resetFilters} />

			<Card>
				<CardContent className="p-0">
					<PHRequestsTable requests={currentRequests} pageLoading={loading} handleEditRequest={handleEditRequest} handleDeleteRequest={handleDeleteRequest} />
				</CardContent>
				{totalPages > 1 && !loading && (
					<CardFooter>
						<PHRequestsPagination currentPage={currentPage} totalPages={totalPages} handlePageChange={handlePageChange} totalCount={filteredAndSortedRequests.length} itemsPerPage={itemsPerPage} />
					</CardFooter>
				)}
			</Card>

			<ConfirmationModal
				isOpen={deleteModal.isOpen}
				onClose={() => setDeleteModal({ isOpen: false, request: null })}
				onConfirm={confirmDelete}
				title="Delete PH Request"
				message={`Are you sure you want to delete this request? This action cannot be undone.`}
				confirmText="Delete"
				confirmVariant="destructive"
				loading={deleteLoading}
			/>
			<EditPHRequestModal isOpen={editModal.isOpen} onClose={() => setEditModal({ isOpen: false, request: null })} request={editModal.request} onSave={handleSaveRequest} />
			<AddPHRequestModal packages={packages} isOpen={addModal} onClose={() => setAddModal(false)} onAdd={handleAddRequests} />
		</div>
	);
}
