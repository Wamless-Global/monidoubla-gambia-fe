'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import { CustomLink } from '@/components/CustomLink';
import { toast } from 'sonner';
import Image from 'next/image';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { handleFetchMessage, getCurrencyFromLocalStorage, getSettings } from '@/lib/helpers';
import { cn } from '@/lib/utils';

// Interfaces
interface ContactDetails {
	phone: string;
	email: string;
}

interface PendingItem {
	id: string;
	title: string;
	price: number;
	category: string;
	seller: string;
	location: string;
	date: string;
	image: string;
	description: string;
	condition: string;
	tags: string[];
	contactDetails: string;
	previewDescription: string;
}

interface ItemDetailModalProps {
	isOpen: boolean;
	onClose: () => void;
	item: PendingItem | null;
	onApprove: (item: PendingItem) => void;
	onDisapprove: (item: PendingItem) => void;
}

// Internal Modal Component
function ItemDetailModal({ isOpen, onClose, item, onApprove, onDisapprove }: ItemDetailModalProps) {
	const [actionLoading, setActionLoading] = useState(false);

	const handleAction = async (action: 'approve' | 'disapprove') => {
		if (!item) return;
		setActionLoading(true);
		try {
			if (action === 'approve') {
				await onApprove(item);
			} else {
				await onDisapprove(item);
			}
			onClose();
		} finally {
			setActionLoading(false);
		}
	};

	if (!isOpen || !item) return null;

	const contactInfo: ContactDetails | null = useMemo(() => {
		try {
			return JSON.parse(item.contactDetails);
		} catch {
			return null;
		}
	}, [item.contactDetails]);

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-in fade-in-0 !m-0">
			<Card className="max-w-4xl w-full bg-white shadow-lg border-slate-200 animate-in fade-in-0 zoom-in-95 max-h-[90vh] flex flex-col">
				<CardHeader>
					<div className="flex justify-between items-start">
						<div>
							<CardTitle>Review Product Upload</CardTitle>
							<CardDescription>Approve or disapprove this pending marketplace item.</CardDescription>
						</div>
						<Button variant="ghost" size="icon" onClick={onClose} className="-mr-2 -mt-2">
							<i className="ri-close-line text-lg"></i>
						</Button>
					</div>
				</CardHeader>
				<CardContent className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
					<div>
						<div className="aspect-square rounded-lg overflow-hidden bg-slate-100">
							<Image src={item.image} alt={item.title} width={600} height={600} className="w-full h-full object-cover" />
						</div>
					</div>
					<div className="space-y-4">
						<div className="p-4 bg-slate-50 rounded-lg">
							<p className="text-xs text-slate-500">Seller</p>
							<p className="font-semibold text-slate-800">{item.seller}</p>
						</div>
						<div>
							<h1 className="text-2xl font-bold text-slate-800">{item.title}</h1>
							<p className="text-2xl font-bold text-indigo-600">
								{getCurrencyFromLocalStorage()?.symbol}
								{item.price.toLocaleString()}
							</p>
						</div>
						<div className="grid grid-cols-2 gap-4 text-sm">
							<div>
								<p className="text-slate-500">Category</p>
								<p className="font-medium text-slate-800">{item.category}</p>
							</div>
							<div>
								<p className="text-slate-500">Condition</p>
								<p className="font-medium text-slate-800">{item.condition}</p>
							</div>
							<div className="col-span-2">
								<p className="text-slate-500">Location</p>
								<p className="font-medium text-slate-800">{item.location}</p>
							</div>
						</div>
						<div>
							<p className="text-sm font-medium text-slate-700">Description</p>
							<p className="text-sm text-slate-600">{item.description}</p>
						</div>
						{contactInfo && (
							<div className="pt-4 border-t">
								<p className="text-sm font-medium text-slate-700 mb-2">Contact Details</p>
								<p className="text-sm text-slate-600">Phone: {contactInfo.phone}</p>
								<p className="text-sm text-slate-600">Email: {contactInfo.email}</p>
							</div>
						)}
					</div>
				</CardContent>
				<CardFooter className="justify-end gap-3">
					<Button variant="destructive" onClick={() => handleAction('disapprove')} disabled={actionLoading}>
						{actionLoading ? 'Working...' : 'Disapprove'}
					</Button>
					<Button onClick={() => handleAction('approve')} disabled={actionLoading}>
						{actionLoading ? 'Working...' : 'Approve Item'}
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
}

// Main Page Component
export default function ApproveUploadsPage() {
	const [items, setItems] = useState<PendingItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [currentPage, setCurrentPage] = useState(1);
	const [searchTerm, setSearchTerm] = useState('');
	const [categoryFilter, setCategoryFilter] = useState('All');
	const [sortBy, setSortBy] = useState('date');
	const [detailModalOpen, setDetailModalOpen] = useState(false);
	const [selectedItem, setSelectedItem] = useState<PendingItem | null>(null);
	const [isMounted, setIsMounted] = useState(false);

	const itemsPerPage = 12;

	useEffect(() => {
		setIsMounted(true);
		loadItems();
	}, []);

	const loadItems = async () => {
		setLoading(true);
		try {
			const res = await fetchWithAuth('/api/marketplace?status=pending');
			if (!res.ok) {
				throw new Error(handleFetchMessage(await res.json(), 'Failed to fetch pending items'));
			}
			const data = await res.json();
			const parsedItems: PendingItem[] = (Array.isArray(data?.data) ? data.data : []).map((item: any) => ({
				id: item.id,
				title: item.name || item.title,
				price: item.price,
				category: item.category,
				seller: item.seller || item.user?.name || '',
				location: item.location,
				date: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '',
				image: typeof item.Images === 'string' ? JSON.parse(item.Images)?.[0] || '' : item.Images?.[0] || '',
				description: item.description,
				condition: item.condition || '',
				tags: Array.isArray(item.tags) ? item.tags : [],
				contactDetails: item.contactDetails || '',
				previewDescription: item.previewDescription || '',
			}));
			setItems(parsedItems);
		} catch (error) {
			toast.error(handleFetchMessage(error, 'Failed to fetch pending items'));
		} finally {
			setLoading(false);
		}
	};

	const filteredItems = useMemo(() => {
		let filtered = items.filter((item) => {
			const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || item.seller.toLowerCase().includes(searchTerm.toLowerCase());
			const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
			return matchesSearch && matchesCategory;
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
		return filtered;
	}, [items, searchTerm, categoryFilter, sortBy]);

	const handlePageChange = (page: number) => {
		setCurrentPage(page);
	};

	const handleItemClick = (item: PendingItem) => {
		setSelectedItem(item);
		setDetailModalOpen(true);
	};

	const handleApprove = async (item: PendingItem) => {
		try {
			const formData = new FormData();
			formData.append('status', 'active');
			const res = await fetchWithAuth(`/api/marketplace/${item.id}`, { method: 'PUT', body: formData });
			if (!res.ok) throw new Error(handleFetchMessage(await res.json(), 'Failed to approve item.'));
			setItems(items.filter((i) => i.id !== item.id));
			toast.success('Item approved successfully');
		} catch (error) {
			toast.error(handleFetchMessage(error, 'Failed to approve item'));
		}
	};

	const handleDisapprove = async (item: PendingItem) => {
		try {
			const formData = new FormData();
			formData.append('status', 'delist');
			const res = await fetchWithAuth(`/api/marketplace/${item.id}`, { method: 'PUT', body: formData });
			if (!res.ok) throw new Error(handleFetchMessage(await res.json(), 'Failed to disapprove item.'));
			setItems(items.filter((i) => i.id !== item.id));
			toast.success('Item disapproved successfully');
		} catch (error) {
			toast.error(handleFetchMessage(error, 'Failed to disapprove item'));
		}
	};

	const resetFilters = () => {
		setSearchTerm('');
		setCategoryFilter('All');
		setSortBy('date');
		toast.success('Filters reset');
	};

	if (!isMounted) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
			</div>
		);
	}

	const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
	const currentItems = filteredItems.slice((currentPage - 1) * itemsPerPage, (currentPage - 1) * itemsPerPage + itemsPerPage);

	return (
		<div className="space-y-6">
			<header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
				<div>
					<h1 className="text-3xl font-bold text-slate-800">Approve New Uploads</h1>
					<p className="text-slate-500 mt-1">{filteredItems.length} items are pending approval.</p>
				</div>
				<CustomLink href="/admin/marketplace">
					<Button variant="outline">
						<i className="ri-arrow-left-line mr-2"></i>Back to Live Listings
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
								<option>Vehicles</option>
							</select>
							<select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full sm:w-auto">
								<option value="date">Sort by Date</option>
								<option value="price-low">Price: Low-High</option>
								<option value="price-high">Price: High-Low</option>
							</select>
							<Button variant="outline" onClick={resetFilters}>
								Reset
							</Button>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					{loading ? (
						<div className="text-center py-20 text-slate-500">Loading items...</div>
					) : currentItems.length > 0 ? (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
							{currentItems.map((item) => (
								<Card key={item.id} className="group overflow-hidden">
									<div className="aspect-video bg-slate-100 relative">
										<Image src={item.image || '/placeholder.png'} alt={item.title} layout="fill" className="object-cover" />
									</div>
									<div className="p-4">
										<p className="text-xs text-slate-500">{item.category}</p>
										<h3 className="font-semibold text-slate-800 truncate">{item.title}</h3>
										<p className="text-lg font-bold text-indigo-600 mt-1">
											{getCurrencyFromLocalStorage()?.symbol}
											{item.price.toLocaleString()}
										</p>
									</div>
									<CardFooter>
										<Button variant="outline" className="w-full" onClick={() => handleItemClick(item)}>
											Review
										</Button>
									</CardFooter>
								</Card>
							))}
						</div>
					) : (
						<div className="text-center py-20">
							<i className="ri-inbox-2-line text-5xl text-slate-300 mb-4"></i>
							<h3 className="text-xl font-semibold text-slate-700">All Clear!</h3>
							<p className="text-slate-500 mt-2">There are no pending items to review.</p>
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
			<ItemDetailModal isOpen={detailModalOpen} onClose={() => setDetailModalOpen(false)} item={selectedItem} onApprove={handleApprove} onDisapprove={handleDisapprove} />
		</div>
	);
}
