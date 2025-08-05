'use client';

import { fetchWithAuth } from '@/lib/fetchWithAuth';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import { toast } from 'sonner';
import { CustomLink } from '@/components/CustomLink';
import { getCurrencyFromLocalStorage, handleFetchMessage, getSettings } from '@/lib/helpers';

interface MarketplaceItem {
	id: string;
	title: string;
	price: number;
	category: string;
	seller: string;
	location: string;
	date: string;
	status: 'Active' | 'Inactive' | 'Sold';
	image: string;
	description: string;
}

interface EditModalProps {
	isOpen: boolean;
	onClose: () => void;
	item: MarketplaceItem | null;
	onSave: (item: MarketplaceItem) => void;
}

function EditItemModal({ isOpen, onClose, item, onSave }: EditModalProps) {
	const [formData, setFormData] = useState<MarketplaceItem>({
		id: '',
		title: '',
		price: 0,
		category: '',
		seller: '',
		location: '',
		date: '',
		status: 'Active',
		image: '',
		description: '',
	});
	const [loading, setLoading] = useState(false);
	const [delistLoading, setDelistLoading] = useState(false);
	const [errors, setErrors] = useState<Record<string, string>>({});

	useEffect(() => {
		if (item) {
			setFormData(item);
		}
		setErrors({});
	}, [item]);

	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = 'unset';
		}

		return () => {
			document.body.style.overflow = 'unset';
		};
	}, [isOpen]);

	const validateForm = () => {
		const newErrors: Record<string, string> = {};

		if (!formData.title.trim()) {
			newErrors.title = 'Title is required';
		} else if (formData.title.length < 3) {
			newErrors.title = 'Title must be at least 3 characters';
		}

		if (!formData.price || formData.price <= 0) {
			newErrors.price = 'Price must be greater than 0';
		}

		if (!formData.category.trim()) {
			newErrors.category = 'Category is required';
		}

		if (!formData.location.trim()) {
			newErrors.location = 'Location is required';
		}

		if (!formData.description.trim()) {
			newErrors.description = 'Description is required';
		} else if (formData.description.length < 10) {
			newErrors.description = 'Description must be at least 10 characters';
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) return;

		setLoading(true);

		try {
			await new Promise((resolve) => setTimeout(resolve, 1500));

			onSave(formData);
			toast.success('Item updated successfully');
			setLoading(false);
			onClose();
		} catch (error) {
			toast.error('Failed to update item');
			setLoading(false);
		}
	};

	const handleDelist = async () => {
		setDelistLoading(true);

		try {
			await new Promise((resolve) => setTimeout(resolve, 1500));

			const delistedItem = { ...formData, status: 'Inactive' as const };
			onSave(delistedItem);
			toast.success('Item delisted successfully');
			setDelistLoading(false);
			onClose();
		} catch (error) {
			toast.error('Failed to delist item');
			setDelistLoading(false);
		}
	};

	if (!isOpen || !item) return null;

	return (
		<>
			<div className="fixed inset-0 bg-black bg-opacity-50 z-50 !mt-0" onClick={onClose} />

			<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
					<div className="p-6">
						<div className="flex items-center justify-between mb-6">
							<h3 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Item</h3>
							<button onClick={onClose} disabled={loading || delistLoading} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50">
								<i className="ri-close-line w-5 h-5 flex items-center justify-center text-gray-600 dark:text-gray-400"></i>
							</button>
						</div>

						<form onSubmit={handleSubmit} className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
								<input
									type="text"
									value={formData.title}
									onChange={(e) => setFormData({ ...formData, title: e.target.value })}
									className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${errors.title ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
									disabled={loading || delistLoading}
									required
								/>
								{errors.title && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title}</p>}
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price ({getSettings()?.baseCurrency ? getSettings()?.baseCurrency : getCurrencyFromLocalStorage()?.code})</label>
									<input
										type="number"
										min="0"
										step="0.01"
										value={formData.price}
										onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
										className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${errors.price ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
										disabled={loading || delistLoading}
										required
									/>
									{errors.price && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.price}</p>}
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
									<select
										value={formData.category}
										onChange={(e) => setFormData({ ...formData, category: e.target.value })}
										className={`w-full px-3 py-2 pr-8 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
											errors.category ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
										}`}
										disabled={loading || delistLoading}
										required
									>
										<option value="">Select category</option>
										<option value="Electronics">Electronics</option>
										<option value="Clothing">Clothing</option>
										<option value="Vehicles">Vehicles</option>
										<option value="Houses">Houses</option>
										<option value="Books">Books</option>
										<option value="Other">Other</option>
									</select>
									{errors.category && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.category}</p>}
								</div>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
									<input
										type="text"
										value={formData.location}
										onChange={(e) => setFormData({ ...formData, location: e.target.value })}
										className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
											errors.location ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
										}`}
										disabled={loading || delistLoading}
										required
									/>
									{errors.location && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.location}</p>}
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
									<select
										value={formData.status}
										onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Active' | 'Inactive' | 'Sold' })}
										className="w-full px-3 py-2 pr-8 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
										disabled={loading || delistLoading}
									>
										<option value="active">Active</option>
										<option value="pending">Inactive</option>
									</select>
								</div>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
								<textarea
									value={formData.description}
									onChange={(e) => setFormData({ ...formData, description: e.target.value })}
									rows={4}
									className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none ${
										errors.description ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
									}`}
									disabled={loading || delistLoading}
									required
								/>
								{errors.description && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description}</p>}
							</div>

							<div className="flex flex-col gap-3 pt-4">
								<Button type="submit" disabled={loading || delistLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white whitespace-nowrap">
									{loading ? (
										<div className="flex items-center gap-2">
											<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
											<span>Updating...</span>
										</div>
									) : (
										'Save Changes'
									)}
								</Button>

								<Button
									type="button"
									variant="outline"
									onClick={handleDelist}
									disabled={loading || delistLoading || formData.status === 'Inactive'}
									className="w-full bg-white dark:bg-gray-700 border-orange-300 dark:border-orange-600 text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 whitespace-nowrap"
								>
									{delistLoading ? (
										<div className="flex items-center gap-2">
											<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
											<span>Delisting...</span>
										</div>
									) : (
										<div className="flex items-center gap-2">
											<i className="ri-close-circle-line w-4 h-4 flex items-center justify-center"></i>
											<span>Delist Item</span>
										</div>
									)}
								</Button>
							</div>
						</form>
					</div>
				</div>
			</div>
		</>
	);
}

export default function AdminMarketplace() {
	const [items, setItems] = useState<MarketplaceItem[]>([]);
	const [filteredItems, setFilteredItems] = useState<MarketplaceItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [pageLoading, setPageLoading] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);
	const [searchTerm, setSearchTerm] = useState('');
	const [categoryFilter, setCategoryFilter] = useState('All');
	const [statusFilter, setStatusFilter] = useState('All');
	const [sortBy, setSortBy] = useState('date');
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
	const [editModalOpen, setEditModalOpen] = useState(false);
	const [selectedItem, setSelectedItem] = useState<MarketplaceItem | null>(null);
	const [deleteLoading, setDeleteLoading] = useState(false);
	const [isMounted, setIsMounted] = useState(false);

	const itemsPerPage = 12;

	useEffect(() => {
		setIsMounted(true);
		loadItems();
	}, []);

	useEffect(() => {
		if (isMounted) {
			filterItems();
		}
	}, [items, searchTerm, categoryFilter, statusFilter, sortBy, isMounted]);

	const loadItems = async () => {
		setLoading(true);
		try {
			const res = await fetchWithAuth('/api/marketplace?status=active');
			if (!res.ok) {
				throw new Error(handleFetchMessage(await res.json(), 'Failed to fetch marketplace items'));
			}
			const data = await res.json();
			// Map API data to MarketplaceItem interface
			const items: MarketplaceItem[] = (Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : data.products || []).map((item: any) => ({
				id: item.id,
				title: item.name || item.title,
				price: item.price,
				category: item.category,
				seller: item.seller || item.user?.name || '',
				location: item.location,
				date: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '',
				status: (item.status === 'available' ? 'Active' : item.status === 'sold' ? 'Sold' : item.status) || 'Active',
				image: typeof item.Images === 'string' ? JSON.parse(item.Images)?.[0] || '' : item.Images?.[0] || '',
				description: item.description,
			}));
			setItems(items);
		} catch (error) {
			toast.error(handleFetchMessage(error));
			setItems([]);
		} finally {
			setLoading(false);
		}
	};

	const filterItems = () => {
		let filtered = items.filter((item) => {
			const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || item.seller.toLowerCase().includes(searchTerm.toLowerCase()) || item.location.toLowerCase().includes(searchTerm.toLowerCase());
			const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
			const matchesStatus = statusFilter === 'All' || item.status === statusFilter;

			return matchesSearch && matchesCategory && matchesStatus;
		});

		filtered.sort((a, b) => {
			switch (sortBy) {
				case 'price-low':
					return a.price - b.price;
				case 'price-high':
					return b.price - a.price;
				case 'title':
					return a.title.localeCompare(b.title);
				case 'date':
				default:
					return new Date(b.date).getTime() - new Date(a.date).getTime();
			}
		});

		setFilteredItems(filtered);
	};

	const handlePageChange = (page: number) => {
		setPageLoading(true);
		setCurrentPage(page);

		setTimeout(() => {
			setPageLoading(false);
		}, 800);
	};

	const handleDeleteItem = (item: MarketplaceItem) => {
		setSelectedItem(item);
		setDeleteModalOpen(true);
	};

	const confirmDelete = async () => {
		if (!selectedItem) return;
		setDeleteLoading(true);
		try {
			const res = await fetchWithAuth(`/api/marketplace/${selectedItem.id}`, {
				method: 'DELETE',
			});
			if (!res.ok) {
				const errMsg = handleFetchMessage(await res.json(), 'Failed to delete item.');
				toast.error(errMsg);
			} else {
				toast.success('Item deleted successfully');
				setItems(items.filter((item) => item.id !== selectedItem.id));
				setSelectedItem(null);
				setDeleteModalOpen(false);
			}
		} catch (error) {
			toast.error(handleFetchMessage(error, 'Failed to delete item'));
		} finally {
			setDeleteLoading(false);
		}
	};

	const handleEditItem = (item: MarketplaceItem) => {
		setSelectedItem(item);
		setEditModalOpen(true);
	};

	const handleSaveItem = async (updatedItem: MarketplaceItem) => {
		// Send PUT request to update item
		try {
			const formData = new FormData();
			formData.append('name', updatedItem.title);
			formData.append('price', String(updatedItem.price));
			formData.append('category', updatedItem.category);
			formData.append('location', updatedItem.location);
			formData.append('status', updatedItem.status === 'Active' ? 'active' : updatedItem.status === 'Inactive' ? 'delisted' : updatedItem.status.toLowerCase());
			formData.append('description', updatedItem.description);
			// If you want to support image upload, add: formData.append('image', ...)
			const res = await fetchWithAuth(`/api/marketplace/${updatedItem.id}`, {
				method: 'PUT',
				body: formData,
			});
			if (!res.ok) {
				const errMsg = handleFetchMessage(await res.json(), 'Failed to update item.');
				toast.error(errMsg);
				return;
			}
			// Optionally, get the updated item from the response
			// const data = await res.json();
			setItems(items.map((item) => (item.id === updatedItem.id ? updatedItem : item)));
			toast.success('Item updated successfully');
			setEditModalOpen(false);
			setSelectedItem(null);
		} catch (error) {
			toast.error(handleFetchMessage(error, 'Failed to update item'));
		}
	};

	const resetFilters = () => {
		setSearchTerm('');
		setCategoryFilter('All');
		setStatusFilter('All');
		setSortBy('date');
		toast.success('Filters reset successfully');
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'Active':
				return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
			case 'Inactive':
				return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
			case 'Sold':
				return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
			default:
				return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
		}
	};

	if (!isMounted) {
		return (
			<div className="flex items-center justify-center min-h-screen ">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
			</div>
		);
	}

	const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
	const startIndex = (currentPage - 1) * itemsPerPage;
	const endIndex = startIndex + itemsPerPage;
	const currentItems = filteredItems.slice(startIndex, endIndex);

	if (loading) {
		return (
			<div className="p-6 space-y-6  min-h-screen">
				<div className="animate-pulse">
					<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
						<div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
						<div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
					</div>
					<div className="p-6 bg-gray-100 dark:bg-gray-800 rounded-lg mb-6">
						<div className="flex flex-col lg:flex-row gap-4 mb-4">
							<div className="flex-1">
								<div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
							</div>
							<div className="flex flex-wrap gap-2">
								<div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
								<div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-28"></div>
								<div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-36"></div>
								<div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
							</div>
						</div>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
						{[...Array(12)].map((_, i) => (
							<div key={i} className="bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
								<div className="h-48 bg-gray-200 dark:bg-gray-700"></div>
								<div className="p-4 space-y-3">
									<div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
									<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
									<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
									<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
									<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
									<div className="flex items-center gap-2 pt-2">
										<div className="flex-1 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
										<div className="h-8 w-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="p-6 space-y-6  min-h-screen" suppressHydrationWarning={true}>
			{/* Header */}
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
				<h1 className="text-2xl font-bold text-gray-900 dark:text-white">Live Listings</h1>
				<CustomLink href="/admin/marketplace/approve-uploads">
					<Button className="bg-blue-600 hover:bg-blue-700 text-white whitespace-nowrap">
						<i className="ri-add-line w-4 h-4 flex items-center justify-center mr-2"></i>
						Approve New Uploads
					</Button>
				</CustomLink>
			</div>

			{/* Search and Filters */}
			<Card className="p-6 bg-white dark:bg-gray-800 border-0 shadow-sm rounded-lg">
				<div className="flex flex-col lg:flex-row gap-4 mb-4">
					<div className="flex-1">
						<div className="relative">
							<i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 flex items-center justify-center"></i>
							<input
								type="text"
								placeholder="Search for items..."
								className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
							/>
						</div>
					</div>
					<div className="flex flex-wrap gap-2">
						<select
							className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm pr-8"
							value={categoryFilter}
							onChange={(e) => setCategoryFilter(e.target.value)}
						>
							<option value="All">All Categories</option>
							<option value="Electronics">Electronics</option>
							<option value="Clothing">Clothing</option>
							<option value="Vehicles">Vehicles</option>
							<option value="Houses">Houses</option>
							<option value="Books">Books</option>
							<option value="Other">Other</option>
						</select>
						<select
							className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm pr-8"
							value={statusFilter}
							onChange={(e) => setStatusFilter(e.target.value)}
						>
							<option value="All">All Status</option>
							<option value="Active">Active</option>
							<option value="Inactive">Inactive</option>
							<option value="Sold">Sold</option>
						</select>
						<select className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm pr-8" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
							<option value="date">Sort by Date</option>
							<option value="price-low">Price: Low to High</option>
							<option value="price-high">Price: High to Low</option>
							<option value="title">Title: A to Z</option>
						</select>
						<Button variant="outline" onClick={resetFilters} className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 whitespace-nowrap">
							<i className="ri-filter-off-line w-4 h-4 flex items-center justify-center mr-2"></i>
							Filter
						</Button>
					</div>
				</div>
			</Card>

			{/* Items Grid */}
			{pageLoading ? (
				<div className="flex items-center justify-center py-20">
					<div className="flex flex-col items-center gap-4">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
						<span className="text-gray-600 dark:text-gray-400">Loading items...</span>
					</div>
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
					{currentItems.map((item) => (
						<Card key={item.id} className="p-0 bg-white dark:bg-gray-800 border-0 shadow-sm rounded-lg overflow-hidden hover:shadow-md transition-shadow">
							<div className="relative">
								<img src={item.image} alt={item.title} className="w-full h-48 object-cover" />
								<div className="absolute top-3 right-3">
									<span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>{item.status}</span>
								</div>
							</div>

							<div className="p-4">
								<h3 className="font-semibold text-gray-900 dark:text-white mb-2 truncate">{item.title}</h3>
								<div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
									<i className="ri-price-tag-3-line w-4 h-4 flex items-center justify-center"></i>
									<span className="font-medium text-blue-600 dark:text-blue-400">GH₵ {item.price}</span>
								</div>
								<div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
									<i className="ri-user-line w-4 h-4 flex items-center justify-center"></i>
									<span>{item.seller}</span>
								</div>
								<div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
									<i className="ri-map-pin-line w-4 h-4 flex items-center justify-center"></i>
									<span>{item.location}</span>
								</div>
								<div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
									<i className="ri-calendar-line w-4 h-4 flex items-center justify-center"></i>
									<span>{item.date}</span>
								</div>

								<div className="flex items-center gap-2">
									<button onClick={() => handleEditItem(item)} className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer flex items-center justify-center gap-2">
										<i className="ri-edit-line w-4 h-4 flex items-center justify-center"></i>
										<span>Edit</span>
									</button>
									<button onClick={() => handleDeleteItem(item)} className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer">
										<i className="ri-delete-bin-line w-4 h-4 flex items-center justify-center"></i>
									</button>
								</div>
							</div>
						</Card>
					))}
				</div>
			)}

			{/* Empty State */}
			{filteredItems.length === 0 && !pageLoading && (
				<div className="text-center py-12">
					<i className="ri-search-line w-12 h-12 flex items-center justify-center mx-auto text-gray-400 mb-4"></i>
					<h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No items found</h3>
					<p className="text-gray-500 dark:text-gray-400">Try adjusting your search or filters</p>
				</div>
			)}

			{/* Pagination */}
			{totalPages > 1 && !pageLoading && (
				<div className="flex justify-center items-center gap-2 mt-8">
					<button
						onClick={() => handlePageChange(currentPage - 1)}
						disabled={currentPage === 1}
						className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
					>
						<i className="ri-arrow-left-line w-4 h-4 flex items-center justify-center"></i>
					</button>

					{[...Array(totalPages)].map((_, index) => (
						<button
							key={index}
							onClick={() => handlePageChange(index + 1)}
							className={`px-3 py-2 rounded-lg border cursor-pointer ${currentPage === index + 1 ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
						>
							{index + 1}
						</button>
					))}

					<button
						onClick={() => handlePageChange(currentPage + 1)}
						disabled={currentPage === totalPages}
						className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
					>
						<i className="ri-arrow-right-line w-4 h-4 flex items-center justify-center"></i>
					</button>
				</div>
			)}

			{/* Modals */}
			<ConfirmationModal
				isOpen={deleteModalOpen}
				onClose={() => setDeleteModalOpen(false)}
				onConfirm={confirmDelete}
				title="Delete Item"
				message={`Are you sure you want to delete "${selectedItem?.title}"? This action cannot be undone.`}
				confirmText="Delete"
				cancelText="Cancel"
				confirmVariant="destructive"
				loading={deleteLoading}
			/>

			<EditItemModal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} item={selectedItem} onSave={handleSaveItem} />
		</div>
	);
}
