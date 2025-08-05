'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import { PackageModal } from './PackageModal';
import PackagesLoading from './loading';
import { toast } from '@/components/Sonner';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { logger } from '@/lib/logger';
import { getCurrencyFromLocalStorage, handleFetchMessage, getSettings } from '@/lib/helpers';

interface Package {
	id: string;
	name: string;
	type: 'PH' | 'GH';
	gain: number;
	minAmount: number;
	maxAmount: number;
	maturity: string;
	status: 'Active' | 'Inactive';
}

export default function PackagesPage() {
	const [packages, setPackages] = useState<Package[]>([]);
	const [filteredPackages, setFilteredPackages] = useState<Package[]>([]);
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedRole, setSelectedRole] = useState('All Roles');
	const [selectedLocation, setSelectedLocation] = useState('All Locations');
	const [joinedFrom, setJoinedFrom] = useState('');
	const [joinedTo, setJoinedTo] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [isLoading, setIsLoading] = useState(true);
	const [pageLoading, setPageLoading] = useState(false);
	const [deleteLoading, setDeleteLoading] = useState(false);
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
	const [packageToDelete, setPackageToDelete] = useState<Package | null>(null);
	const [packageModalOpen, setPackageModalOpen] = useState(false);
	const [editingPackage, setEditingPackage] = useState<Package | null>(null);
	const [isMounted, setIsMounted] = useState(false);

	const itemsPerPage = 10;

	useEffect(() => {
		setIsMounted(true);
	}, []);

	useEffect(() => {
		if (isMounted) {
			loadPackages();
		}
	}, [isMounted]);

	const loadPackages = async () => {
		setIsLoading(true);
		try {
			const res = await fetchWithAuth('/api/packages');
			if (!res.ok) {
				throw new Error(handleFetchMessage(await res.json(), 'Failed to fetch packages'));
			}
			const json = await res.json();
			logger.log(json);
			if (json.status !== 'success' || !Array.isArray(json.data)) throw new Error('Invalid response');
			// Map API data to local Package type
			const apiPackages: Package[] = json.data.map((pkg: any) => ({
				id: pkg.id,
				name: pkg.name,
				type: pkg.meta?.type || 'PH', // fallback if not present
				gain: parseFloat(pkg.gain),
				minAmount: parseFloat(pkg.min),
				maxAmount: parseFloat(pkg.max),
				maturity: pkg.maturity,
				status: pkg.status?.charAt(0).toUpperCase() + pkg.status?.slice(1) || 'Inactive',
			}));
			setPackages(apiPackages);
			setFilteredPackages(apiPackages);
			// toast.success('Packages loaded successfully');
		} catch (err: any) {
			setPackages([]);
			setFilteredPackages([]);
			toast.error('Failed to load packages');
			console.error('Error loading packages:', err.message || err);
		}
		setIsLoading(false);
	};

	const handlePageChange = async (page: number) => {
		setPageLoading(true);
		setCurrentPage(page);

		// Simulate API call
		await new Promise((resolve) => setTimeout(resolve, 800));

		setPageLoading(false);
	};

	const handleSearch = (query: string) => {
		setSearchQuery(query);
		applyFilters(query, selectedRole, selectedLocation, joinedFrom, joinedTo);
	};

	const applyFilters = (search: string, role: string, location: string, from: string, to: string) => {
		let filtered = packages;

		if (search) {
			filtered = filtered.filter((pkg) => pkg.name.toLowerCase().includes(search.toLowerCase()) || pkg.type.toLowerCase().includes(search.toLowerCase()));
		}

		if (role !== 'All Roles') {
			filtered = filtered.filter((pkg) => pkg.type === role);
		}

		if (location !== 'All Locations') {
			filtered = filtered.filter((pkg) => pkg.status === location);
		}

		setFilteredPackages(filtered);
		setCurrentPage(1);
	};

	const resetFilters = () => {
		setSearchQuery('');
		setSelectedRole('All Roles');
		setSelectedLocation('All Locations');
		setJoinedFrom('');
		setJoinedTo('');
		setFilteredPackages(packages);
		setCurrentPage(1);
	};

	const handleDeletePackage = (pkg: Package) => {
		setPackageToDelete(pkg);
		setDeleteModalOpen(true);
	};

	const confirmDelete = async () => {
		if (!packageToDelete) return;
		setDeleteLoading(true);
		try {
			const res = await fetchWithAuth(`/api/packages/${packageToDelete.id}`, { method: 'DELETE' });

			if (!res.ok) {
				throw new Error(handleFetchMessage(await res.json(), 'Failed to delete package'));
			}
			setPackages(packages.filter((p) => p.id !== packageToDelete.id));
			setFilteredPackages(filteredPackages.filter((p) => p.id !== packageToDelete.id));
			setPackageToDelete(null);
			setDeleteModalOpen(false);
			toast.success('Package deleted successfully');
		} catch (err: any) {
			toast.error(handleFetchMessage(err, 'Failed to delete package'));
			console.error('Error deleting package:', err.message || err);
		}
		setDeleteLoading(false);
	};

	const handleEditPackage = (pkg: Package) => {
		setEditingPackage(pkg);
		setPackageModalOpen(true);
	};

	const handleAddPackage = () => {
		setEditingPackage(null);
		setPackageModalOpen(true);
	};

	const handleSavePackage = async (packageData: Omit<Package, 'id'>) => {
		// Map local data to API format
		const apiData: any = {
			name: packageData.name,
			gain: packageData.gain.toString(),
			min: packageData.minAmount.toString(),
			max: packageData.maxAmount.toString(),
			maturity: packageData.maturity,
			meta: { type: packageData.type },
			status: packageData.status.toLowerCase(),
		};
		try {
			if (editingPackage) {
				// Edit (PUT)
				const res = await fetchWithAuth(`/api/packages/${editingPackage.id}`, {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(apiData),
				});

				if (!res.ok) {
					throw new Error(handleFetchMessage(await res.json(), 'Failed to update package'));
				}
				await loadPackages();
				toast.success('Package updated successfully');
			} else {
				// Add (POST)
				const res = await fetchWithAuth('/api/packages', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(apiData),
				});

				if (!res.ok) {
					throw new Error(handleFetchMessage(await res.json(), 'Failed to add package'));
				}
				await loadPackages();
				toast.success('Package added successfully');
			}
			setPackageModalOpen(false);
			setEditingPackage(null);
		} catch (err: any) {
			toast.error(editingPackage ? 'Failed to update package' : 'Failed to add package');
			logger.error('Error saving package:', err.message || err);
		}
	};

	const totalPages = Math.ceil(filteredPackages.length / itemsPerPage);
	const startIndex = (currentPage - 1) * itemsPerPage;
	const endIndex = startIndex + itemsPerPage;
	const currentPackages = filteredPackages.slice(startIndex, endIndex);

	const renderPaginationButtons = () => {
		const buttons = [];
		const maxVisible = 5;
		let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
		let endPage = Math.min(totalPages, startPage + maxVisible - 1);

		if (endPage - startPage + 1 < maxVisible) {
			startPage = Math.max(1, endPage - maxVisible + 1);
		}

		for (let i = startPage; i <= endPage; i++) {
			buttons.push(
				<button
					key={i}
					onClick={() => handlePageChange(i)}
					disabled={pageLoading}
					className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${currentPage === i ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'} ${
						pageLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
					}`}
				>
					{i}
				</button>
			);
		}

		return buttons;
	};

	if (!isMounted || isLoading) {
		return <PackagesLoading />;
	}

	return (
		<div className="p-6 space-y-6  min-h-screen" suppressHydrationWarning={true}>
			{/* Header */}
			<div className="flex justify-between items-center">
				<h1 className="text-2xl font-bold text-gray-900 dark:text-white">Packages</h1>
				<Button onClick={handleAddPackage} className="bg-blue-600 hover:bg-blue-700 text-white whitespace-nowrap">
					Add Package
				</Button>
			</div>

			{/* Search Bar */}
			<div className="relative">
				<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
					<i className="ri-search-line w-5 h-5 flex items-center justify-center text-gray-400"></i>
				</div>
				<input
					type="text"
					placeholder="Search"
					value={searchQuery}
					onChange={(e) => handleSearch(e.target.value)}
					className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm"
				/>
			</div>

			{/* Table */}
			<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead className="bg-gray-50 dark:bg-gray-700">
							<tr>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">#</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Package name</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">% Gain</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Min amount ({getSettings()?.baseCurrency ? getSettings()?.baseCurrency : getCurrencyFromLocalStorage()?.code})</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Max amount ({getSettings()?.baseCurrency ? getSettings()?.baseCurrency : getCurrencyFromLocalStorage()?.code})</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Maturity</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-200 dark:divide-gray-700">
							{pageLoading
								? [...Array(itemsPerPage)].map((_, index) => (
										<tr key={index} className="animate-pulse">
											<td className="px-6 py-4">
												<div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-4"></div>
											</td>
											<td className="px-6 py-4">
												<div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-32"></div>
											</td>
											<td className="px-6 py-4">
												<div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-12"></div>
											</td>
											<td className="px-6 py-4">
												<div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-12"></div>
											</td>
											<td className="px-6 py-4">
												<div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
											</td>
											<td className="px-6 py-4">
												<div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-12"></div>
											</td>
											<td className="px-6 py-4">
												<div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
											</td>
											<td className="px-6 py-4">
												<div className="flex gap-2">
													<div className="h-8 w-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
													<div className="h-8 w-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
												</div>
											</td>
										</tr>
								  ))
								: currentPackages.map((pkg, index) => (
										<tr key={pkg.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
											<td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{startIndex + index + 1}</td>
											<td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{pkg.name}</td>
											<td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{pkg.gain}%</td>
											<td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{pkg.minAmount}</td>
											<td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{pkg.maxAmount}</td>
											<td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{pkg.maturity}</td>
											<td className="px-6 py-4">
												<span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${pkg.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
													{pkg.status}
												</span>
											</td>
											<td className="px-6 py-4">
												<div className="flex gap-2">
													<button onClick={() => handleEditPackage(pkg)} className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors cursor-pointer">
														<i className="ri-edit-line w-4 h-4 flex items-center justify-center"></i>
													</button>
													<button onClick={() => handleDeletePackage(pkg)} className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors cursor-pointer">
														<i className="ri-delete-bin-line w-4 h-4 flex items-center justify-center"></i>
													</button>
												</div>
											</td>
										</tr>
								  ))}
						</tbody>
					</table>
				</div>
			</div>

			{/* Pagination */}
			<div className="flex justify-between items-center">
				<div className="text-sm text-gray-700 dark:text-gray-300">
					Showing {startIndex + 1} to {Math.min(endIndex, filteredPackages.length)} of {filteredPackages.length} entries
				</div>
				<div className="flex gap-2">{renderPaginationButtons()}</div>
			</div>

			{/* Modals */}
			<ConfirmationModal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} onConfirm={confirmDelete} title="Delete Package" message={`Are you sure you want to delete "${packageToDelete?.name}"? This action cannot be undone.`} loading={deleteLoading} />

			<PackageModal
				isOpen={packageModalOpen}
				onClose={() => {
					setPackageModalOpen(false);
					setEditingPackage(null);
				}}
				onSave={handleSavePackage}
				package={editingPackage}
			/>
		</div>
	);
}
