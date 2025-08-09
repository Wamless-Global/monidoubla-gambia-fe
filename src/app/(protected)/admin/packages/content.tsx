'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import { PackageModal } from './PackageModal';
import PackagesLoading from './loading';
import { toast } from 'sonner';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { logger } from '@/lib/logger';
import { getCurrencyFromLocalStorage, handleFetchMessage, getSettings } from '@/lib/helpers';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

// NOTE: All original interfaces and logic are preserved.
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
	const [currentPage, setCurrentPage] = useState(1);
	const [isLoading, setIsLoading] = useState(true);
	const [deleteLoading, setDeleteLoading] = useState(false);
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
	const [packageToDelete, setPackageToDelete] = useState<Package | null>(null);
	const [packageModalOpen, setPackageModalOpen] = useState(false);
	const [editingPackage, setEditingPackage] = useState<Package | null>(null);

	const itemsPerPage = 10;

	useEffect(() => {
		loadPackages();
	}, []);

	const loadPackages = async () => {
		setIsLoading(true);
		try {
			const res = await fetchWithAuth('/api/packages');
			if (!res.ok) throw new Error(handleFetchMessage(await res.json(), 'Failed to fetch packages'));
			const json = await res.json();
			if (json.status !== 'success' || !Array.isArray(json.data)) throw new Error('Invalid response');
			const apiPackages: Package[] = json.data.map((pkg: any) => ({
				id: pkg.id,
				name: pkg.name,
				type: pkg.meta?.type || 'PH',
				gain: parseFloat(pkg.gain),
				minAmount: parseFloat(pkg.min),
				maxAmount: parseFloat(pkg.max),
				maturity: pkg.maturity,
				status: pkg.status?.charAt(0).toUpperCase() + pkg.status?.slice(1) || 'Inactive',
			}));
			setPackages(apiPackages);
		} catch (err: any) {
			toast.error('Failed to load packages');
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		let filtered = packages;
		if (searchQuery) {
			filtered = filtered.filter((pkg) => pkg.name.toLowerCase().includes(searchQuery.toLowerCase()));
		}
		setFilteredPackages(filtered);
		setCurrentPage(1);
	}, [searchQuery, packages]);

	const handleDeletePackage = (pkg: Package) => {
		setPackageToDelete(pkg);
		setDeleteModalOpen(true);
	};

	const confirmDelete = async () => {
		if (!packageToDelete) return;
		setDeleteLoading(true);
		try {
			const res = await fetchWithAuth(`/api/packages/${packageToDelete.id}`, { method: 'DELETE' });
			if (!res.ok) throw new Error(handleFetchMessage(await res.json(), 'Failed to delete package'));
			await loadPackages();
			toast.success('Package deleted successfully');
		} catch (err: any) {
			toast.error(handleFetchMessage(err, 'Failed to delete package'));
		} finally {
			setDeleteModalOpen(false);
			setDeleteLoading(false);
			setPackageToDelete(null);
		}
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
			const url = editingPackage ? `/api/packages/${editingPackage.id}` : '/api/packages';
			const method = editingPackage ? 'PUT' : 'POST';
			const res = await fetchWithAuth(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(apiData) });
			if (!res.ok) throw new Error(handleFetchMessage(await res.json(), `Failed to ${editingPackage ? 'update' : 'add'} package`));
			await loadPackages();
			toast.success(`Package ${editingPackage ? 'updated' : 'added'} successfully`);
			setPackageModalOpen(false);
			setEditingPackage(null);
		} catch (err: any) {
			toast.error(handleFetchMessage(err, `Failed to ${editingPackage ? 'update' : 'add'} package`));
		}
	};

	const totalPages = Math.ceil(filteredPackages.length / itemsPerPage);
	const currentPackages = filteredPackages.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

	if (isLoading) {
		return <PackagesLoading />;
	}

	return (
		<div className="space-y-6">
			<header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
				<div>
					<h1 className="text-3xl font-bold text-slate-800">Packages</h1>
					<p className="text-slate-500 mt-1">Create, manage, and view all system packages.</p>
				</div>
				<Button onClick={handleAddPackage}>
					<i className="ri-add-line mr-2"></i>Add Package
				</Button>
			</header>

			<Card>
				<CardHeader>
					<div className="relative w-full sm:max-w-xs">
						<i className="ri-search-line absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"></i>
						<input type="text" placeholder="Search by package name..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10" />
					</div>
				</CardHeader>
				<CardContent className="p-0">
					<div className="overflow-x-auto">
						<table className="min-w-full divide-y divide-slate-200">
							<thead className="bg-slate-50">
								<tr>
									<th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Package Name</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Gain</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Amount Range</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Maturity</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
									<th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Actions</th>
								</tr>
							</thead>
							<tbody className="bg-white divide-y divide-slate-200">
								{currentPackages.length === 0 ? (
									<tr>
										<td colSpan={6} className="text-center py-12 text-slate-500">
											No packages found.
										</td>
									</tr>
								) : (
									currentPackages.map((pkg) => (
										<tr key={pkg.id}>
											<td className="px-6 py-4 whitespace-nowrap">
												<div className="text-sm font-medium text-slate-900">{pkg.name}</div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{pkg.gain}%</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
												{pkg.minAmount} - {pkg.maxAmount}
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{pkg.maturity}</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<Badge variant={pkg.status === 'Active' ? 'success' : 'secondary'}>{pkg.status}</Badge>
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-right">
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button variant="ghost" size="icon">
															<i className="ri-more-2-fill"></i>
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align="end">
														<DropdownMenuItem onClick={() => handleEditPackage(pkg)}>Edit Package</DropdownMenuItem>
														<DropdownMenuItem onClick={() => handleDeletePackage(pkg)} className="text-red-600">
															Delete Package
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</td>
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>
				</CardContent>
				{totalPages > 1 && (
					<CardFooter className="justify-between items-center">
						<p className="text-sm text-slate-500">
							Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredPackages.length)} of {filteredPackages.length} results
						</p>
						<div className="flex items-center gap-2">
							<Button variant="outline" size="icon" onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
								<i className="ri-arrow-left-s-line"></i>
							</Button>
							<Button variant="outline" size="icon" onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages}>
								<i className="ri-arrow-right-s-line"></i>
							</Button>
						</div>
					</CardFooter>
				)}
			</Card>
			<ConfirmationModal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} onConfirm={confirmDelete} title="Delete Package" message={`Are you sure you want to delete "${packageToDelete?.name}"?`} confirmVariant="destructive" loading={deleteLoading} />
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
