'use client';

import { useState, useEffect } from 'react';
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
import { CustomLink } from '@/components/CustomLink';
import { Package } from '../../user/provide-help/content';
import { getCurrencyFromLocalStorage, handleFetchMessage, parseMaturityDays, getSettings } from '@/lib/helpers';
import { PHRequest } from './multiple-match/types';

export default function PHRequestsPage() {
	const [requests, setRequests] = useState<PHRequest[]>([]);
	const [filteredRequests, setFilteredRequests] = useState<PHRequest[]>([]);
	const [loading, setLoading] = useState(true);
	const [pageLoading, setPageLoading] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [searchTerm, setSearchTerm] = useState('');
	const [statusFilter, setStatusFilter] = useState('All');
	const [locationFilter, setLocationFilter] = useState('All');
	const [sortBy, setSortBy] = useState('dateCreated');
	const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; request: PHRequest | null }>({
		isOpen: false,
		request: null,
	});
	const [editModal, setEditModal] = useState<{ isOpen: boolean; request: PHRequest | null }>({
		isOpen: false,
		request: null,
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

	useEffect(() => {
		filterRequests();
	}, [requests, searchTerm, statusFilter, locationFilter, sortBy]);

	const fetchPackages = async () => {
		try {
			// Fetch packages
			const pkgRes = await fetchWithAuth('/api/packages');
			const pkgJson = await pkgRes.json();
			if (!pkgRes.ok) {
				throw new Error(handleFetchMessage(pkgJson, 'Failed to create matches'));
			}
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

	const fetchRequests = async (page: number) => {
		setPageLoading(true);
		try {
			const res = await fetchWithAuth(`/api/ph-requests/all?page=${page}&limit=${itemsPerPage}`);
			const json = await res.json();
			if (!res.ok) {
				throw new Error(handleFetchMessage(await res.json(), 'Failed to get PH requests'));
			}
			const requests: PHRequest[] = (json.data.requests || []).map((req: any) => {
				const assignedUsers = Array.isArray(req.details)
					? req.details.map((u: any) => ({
							id: u.id,
							name: u.name,
							username: u.username,
							phoneNumber: u.phoneNumber,
							amount: Number(u.amount),
							bankName: u.bankName,
							accountNumber: u.accountNumber,
							accountName: u.accountName,
							timeAssigned: u.timeAssigned || '',
							status: u.status,
					  }))
					: [];
				const totalAssigned = assignedUsers.reduce((sum: number, u: (typeof assignedUsers)[number]) => sum + (Number(u.amount) || 0), 0);
				const reqAmount = Number(req.amount);
				const matchingProgress = reqAmount > 0 ? Math.min(100, Math.round((totalAssigned / reqAmount) * 100)) : 0;

				const pkg = req.packageInfo || req.package;
				let profitPercentage = 0;
				let maturityPeriod = 0;
				let packageName = '';
				if (pkg) {
					profitPercentage = Number(pkg.gain || pkg.profitPercentage || 0);
					maturityPeriod = parseInt((pkg.maturity || '0').match(/(\d+)/)?.[1] || '0', 10);
					packageName = pkg.name || '';
				}

				let expectedMaturity = '';
				if (req.created_at && maturityPeriod > 0) {
					const created = new Date(req.created_at);
					created.setDate(created.getDate() + maturityPeriod);
					expectedMaturity = created.toISOString().split('T')[0];
				}

				let status: PHRequest['status'] = 'pending';
				switch (req.status) {
					case 'pending':
						status = 'pending';
						break;
					case 'matched':
						status = 'matched';
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
					default:
						status = 'pending';
				}

				return {
					id: req.id,
					user: {
						id: req.user?.id || '',
						name: req.user?.name || '',
						username: req.user?.username || '',
						email: req.user?.email || '',
						phoneNumber: req.user?.phoneNumber || '',
						location: req.user?.location || '',
					},
					amount: reqAmount,
					dateCreated: req.created_at,
					status,
					packageName,
					expectedMaturity,
					profitPercentage,
					maturityPeriod,
					matchingProgress,
					assignedUsers,
				};
			});

			setRequests(requests);
			setTotalPages(Math.max(1, Math.ceil((json.data.count || 0) / itemsPerPage)));
		} catch (error) {
			toast.error(handleFetchMessage(error, 'Failed to load PH requests'));
			logger.error('Failed to load PH requests', error);
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
					return a.amount - b.amount;
				case 'amount-high':
					return b.amount - a.amount;
				case 'name':
					return a.user.name.localeCompare(b.user.name);
				case 'dateCreated':
				default:
					if (!a.dateCreated && !b.dateCreated) return 0;
					if (!a.dateCreated) return 1;
					if (!b.dateCreated) return -1;
					return new Date(b.dateCreated.split('-').reverse().join('-')).getTime() - new Date(a.dateCreated.split('-').reverse().join('-')).getTime();
			}
		});

		setFilteredRequests(filtered);
	};

	const handlePageChange = (page: number) => {
		setCurrentPage(page);
		fetchRequests(page);
	};

	const handleDeleteRequest = (request: PHRequest) => {
		setDeleteModal({ isOpen: true, request });
	};

	const confirmDelete = async () => {
		if (!deleteModal.request) return;

		setDeleteLoading(true);
		try {
			const res = await fetchWithAuth(`/api/ph-requests/${deleteModal.request.id}`, {
				method: 'DELETE',
			});

			if (!res.ok) {
				const data = await res.json();
				throw new Error(handleFetchMessage(data, 'Failed to delete PH request'));
			}

			setRequests(requests.filter((request) => request.id !== deleteModal.request!.id));
			toast.success('PH request deleted successfully');
			setDeleteModal({ isOpen: false, request: null });
		} catch (error: any) {
			toast.error(handleFetchMessage(error, 'Failed to delete request'));
			logger.error('Failed to delete PH request', error);
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
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
			</div>
		);
	}

	return (
		<div className="p-6 space-y-6 min-h-screen" suppressHydrationWarning={true}>
			{/* Header */}
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
				<h1 className="text-2xl font-bold text-gray-900 dark:text-white">PH Requests</h1>
				<div className="flex gap-2">
					<Button onClick={() => setAddModal(true)} className="bg-green-600 hover:bg-green-700 text-white whitespace-nowrap">
						<i className="ri-add-line w-4 h-4 flex items-center justify-center mr-2"></i>
						Add Request
					</Button>
					<CustomLink href="/admin/ph-requests/multiple-match">
						<Button className="bg-blue-600 hover:bg-blue-700 text-white whitespace-nowrap">
							<i className="ri-group-line w-4 h-4 flex items-center justify-center mr-2"></i>
							Multiple Match
						</Button>
					</CustomLink>
				</div>
			</div>

			{/* Filters */}
			<PHRequestsFilters searchTerm={searchTerm} setSearchTerm={setSearchTerm} statusFilter={statusFilter} setStatusFilter={setStatusFilter} locationFilter={locationFilter} setLocationFilter={setLocationFilter} sortBy={sortBy} setSortBy={setSortBy} resetFilters={resetFilters} />

			{/* Table */}
			<PHRequestsTable requests={filteredRequests} currentPage={currentPage} itemsPerPage={itemsPerPage} pageLoading={pageLoading} handleEditRequest={handleEditRequest} handleDeleteRequest={handleDeleteRequest} />

			{/* Pagination */}
			{totalPages > 1 && !pageLoading && <PHRequestsPagination currentPage={currentPage} totalPages={totalPages} handlePageChange={handlePageChange} />}

			{/* Delete Confirmation Modal */}
			<ConfirmationModal
				isOpen={deleteModal.isOpen}
				onClose={() => setDeleteModal({ isOpen: false, request: null })}
				onConfirm={confirmDelete}
				title="Delete PH Request"
				message={`Are you sure you want to delete ${deleteModal.request?.user.name}'s request for ${deleteModal.request?.amount} ${getSettings()?.baseCurrency ? getSettings()?.baseCurrency : getCurrencyFromLocalStorage()?.code}? This action cannot be undone.`}
				confirmText="Delete"
				cancelText="Cancel"
				confirmVariant="destructive"
				loading={deleteLoading}
			/>

			{/* Edit Modal */}
			<EditPHRequestModal isOpen={editModal.isOpen} onClose={() => setEditModal({ isOpen: false, request: null })} request={editModal.request} onSave={handleSaveRequest} />

			{/* Add Request Modal */}
			<AddPHRequestModal packages={packages} isOpen={addModal} onClose={() => setAddModal(false)} onAdd={handleAddRequests} />
		</div>
	);
}
