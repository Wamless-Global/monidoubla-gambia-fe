'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import { CustomLink } from '@/components/CustomLink';
import { toast } from 'sonner';
import Image from 'next/image';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { handleFetchMessage, getCurrencyFromLocalStorage, getSettings } from '@/lib/helpers';
import { cn } from '@/lib/utils';

// NOTE: All original interfaces and logic are preserved.
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
	const [formData, setFormData] = useState<MarketplaceItem | null>(item);
	const [loading, setLoading] = useState(false);
	const [errors, setErrors] = useState<Record<string, string>>({});

	useEffect(() => {
		if (item) setFormData(item);
	}, [item]);

	const validateForm = () => {
		if (!formData) return false;
		const newErrors: Record<string, string> = {};
		if (!formData.title.trim() || formData.title.length < 3) newErrors.title = 'Title must be at least 3 characters';
		if (!formData.price || formData.price <= 0) newErrors.price = 'Price must be greater than 0';
		if (!formData.category.trim()) newErrors.category = 'Category is required';
		if (!formData.location.trim()) newErrors.location = 'Location is required';
		if (!formData.description.trim() || formData.description.length < 10) newErrors.description = 'Description must be at least 10 characters';
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!validateForm() || !formData) return;
		setLoading(true);
		try {
			// This is where the API call to save would go.
			// For now, we just pass it to the parent.
			onSave(formData);
			toast.success('Item updated successfully');
			onClose();
		} catch (error) {
			toast.error('Failed to update item');
		} finally {
			setLoading(false);
		}
	};

	if (!isOpen || !formData) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-in fade-in-0 !m-0">
			<Card className="max-w-lg w-full">
				<CardHeader>
					<div className="flex justify-between items-start">
						<div>
							<CardTitle>Edit Marketplace Item</CardTitle>
							<CardDescription>Update the details for "{formData.title}".</CardDescription>
						</div>
						<Button variant="ghost" size="icon" onClick={onClose} className="-mr-2 -mt-2">
							<i className="ri-close-line text-lg"></i>
						</Button>
					</div>
				</CardHeader>
				<form onSubmit={handleSubmit}>
					<CardContent className="max-h-[60vh] overflow-y-auto p-6 space-y-4">
						<div>
							<label>Title</label>
							<input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className={cn(errors.title && 'border-red-500')} />
							{errors.title && <p className="form-error">{errors.title}</p>}
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div>
								<label>Price ({getSettings()?.baseCurrency})</label>
								<input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })} className={cn(errors.price && 'border-red-500')} />
								{errors.price && <p className="form-error">{errors.price}</p>}
							</div>
							<div>
								<label>Category</label>
								<select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className={cn(errors.category && 'border-red-500')}>
									<option value="">Select</option>
									<option>Electronics</option>
									<option>Clothing</option>
									<option>Vehicles</option>
								</select>
								{errors.category && <p className="form-error">{errors.category}</p>}
							</div>
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div>
								<label>Location</label>
								<input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className={cn(errors.location && 'border-red-500')} />
								{errors.location && <p className="form-error">{errors.location}</p>}
							</div>
							<div>
								<label>Status</label>
								<select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as MarketplaceItem['status'] })}>
									<option>Active</option>
									<option>Inactive</option>
									<option>Sold</option>
								</select>
							</div>
						</div>
						<div>
							<label>Description</label>
							<textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={4} className={cn('resize-none', errors.description && 'border-red-500')} />
							{errors.description && <p className="form-error">{errors.description}</p>}
						</div>
					</CardContent>
					<CardFooter className="justify-end gap-3">
						<Button type="button" variant="outline" onClick={onClose}>
							Cancel
						</Button>
						<Button type="submit" disabled={loading}>
							{loading ? 'Saving...' : 'Save Changes'}
						</Button>
					</CardFooter>
				</form>
			</Card>
		</div>
	);
}

export default function AdminMarketplace() {
	const [items, setItems] = useState<MarketplaceItem[]>([]);
	const [filteredItems, setFilteredItems] = useState<MarketplaceItem[]>([]);
	const [loading, setLoading] = useState(true);
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

	useEffect(() => {
		let filtered = items.filter((item) => {
			const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || item.seller.toLowerCase().includes(searchTerm.toLowerCase());
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
	}, [items, searchTerm, categoryFilter, statusFilter, sortBy]);

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
		setLoading(true);
		setCurrentPage(page);

		setTimeout(() => {
			setLoading(false);
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

	const getStatusVariant = (status: string): 'success' | 'destructive' | 'info' | 'secondary' => {
		switch (status) {
			case 'Active':
				return 'success';
			case 'Inactive':
				return 'destructive';
			case 'Sold':
				return 'info';
			default:
				return 'secondary';
		}
	};

	const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
	const currentItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

	return (
		<div className="space-y-6">
			<header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
				<div>
					<h1 className="text-3xl font-bold text-slate-800">Marketplace Management</h1>
					<p className="text-slate-500 mt-1">Review, manage, and approve marketplace listings.</p>
				</div>
				<CustomLink href="/admin/marketplace/approve-uploads">
					<Button>
						<i className="ri-check-double-line mr-2"></i>Approve New Uploads
					</Button>
				</CustomLink>
			</header>

			<Card>
				<CardHeader>
					<div className="flex flex-col lg:flex-row gap-4">
						<div className="relative flex-1">
							<i className="ri-search-line absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"></i>
							<input type="text" placeholder="Search items..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10" />
						</div>
						<div className="flex flex-col sm:flex-row gap-3">
							<select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="w-full sm:w-auto">
								<option value="All">All Categories</option>
								<option>Electronics</option>
								<option>Clothing</option>
							</select>
							<select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full sm:w-auto">
								<option value="All">All Statuses</option>
								<option>Active</option>
								<option>Inactive</option>
								<option>Sold</option>
							</select>
							<select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full sm:w-auto">
								<option value="date">Sort by Date</option>
								<option value="price-low">Price: Low-High</option>
								<option value="price-high">Price: High-Low</option>
							</select>
							<Button variant="outline" onClick={resetFilters} className="w-full sm:w-auto">
								Reset
							</Button>
						</div>
					</div>
				</CardHeader>
				<CardContent className="p-0">
					{loading ? (
						<div className="text-center py-20 text-slate-500">Loading items...</div>
					) : currentItems.length === 0 ? (
						<div className="text-center py-20 text-slate-500">No items found.</div>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
							{currentItems.map((item) => (
								<Card key={item.id} className="group overflow-hidden">
									<div className="aspect-video bg-slate-100 relative">
										<Image src={item.image || '/placeholder.png'} alt={item.title} layout="fill" className="object-cover" />
										<div className="absolute top-2 right-2">
											<Badge variant={getStatusVariant(item.status)}>{item.status}</Badge>
										</div>
									</div>
									<div className="p-4">
										<p className="text-xs text-slate-500">{item.category}</p>
										<h3 className="font-semibold text-slate-800 truncate">{item.title}</h3>
										<p className="text-lg font-bold text-indigo-600 mt-1">
											{getCurrencyFromLocalStorage()?.symbol}
											{item.price.toLocaleString()}
										</p>
										<p className="text-xs text-slate-500 mt-2">
											By {item.seller} in {item.location}
										</p>
									</div>
									<CardFooter className="flex gap-2">
										<Button variant="outline" size="sm" className="flex-1" onClick={() => handleEditItem(item)}>
											Edit
										</Button>
										<Button variant="destructive" size="sm" onClick={() => handleDeleteItem(item)}>
											<i className="ri-delete-bin-line"></i>
										</Button>
									</CardFooter>
								</Card>
							))}
						</div>
					)}
				</CardContent>
				{totalPages > 1 && (
					<CardFooter className="justify-between items-center">
						<p className="text-sm text-slate-500">
							Page {currentPage} of {totalPages}
						</p>
						<div className="flex items-center gap-2">
							<Button variant="outline" size="icon" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
								<i className="ri-arrow-left-s-line"></i>
							</Button>
							<Button variant="outline" size="icon" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
								<i className="ri-arrow-right-s-line"></i>
							</Button>
						</div>
					</CardFooter>
				)}
			</Card>

			<ConfirmationModal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} onConfirm={confirmDelete} title="Delete Item" message={`Are you sure you want to delete "${selectedItem?.title}"?`} confirmVariant="destructive" loading={deleteLoading} />
			<EditItemModal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} item={selectedItem} onSave={handleSaveItem} />
		</div>
	);
}
