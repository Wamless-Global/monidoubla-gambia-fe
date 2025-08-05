'use client';

import { useState, useEffect } from 'react';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import { toast } from 'sonner';
import { CustomLink } from '@/components/CustomLink';
import Image from 'next/image';
import { getCurrencyFromLocalStorage, handleFetchMessage, getSettings } from '@/lib/helpers';

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

function ItemDetailModal({ isOpen, onClose, item, onApprove, onDisapprove }: ItemDetailModalProps) {
	const [approveLoading, setApproveLoading] = useState(false);
	const [disapproveLoading, setDisapproveLoading] = useState(false);

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

	const handleApprove = async () => {
		if (!item) return;

		setApproveLoading(true);

		try {
			await onApprove(item);
			toast.success('Item approved successfully');
			onClose();
		} catch (error) {
			toast.error('Failed to approve item');
		} finally {
			setApproveLoading(false);
		}
	};

	const handleDisapprove = async () => {
		if (!item) return;
		setDisapproveLoading(true);

		try {
			await onDisapprove(item);
			toast.success('Item disapproved successfully');
			onClose();
		} catch (error) {
			toast.error('Failed to disapprove item');
		} finally {
			setDisapproveLoading(false);
		}
	};

	if (!isOpen || !item) return null;

	let contactInfo: ContactDetails | null = null;
	try {
		contactInfo = JSON.parse(item.contactDetails);
	} catch (error) {
		console.error('Failed to parse contact details:', error);
	}

	return (
		<>
			<div className="fixed inset-0 bg-black bg-opacity-50 z-50 !mt-0" onClick={onClose} />

			<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
					<div className="p-6">
						<div className="flex items-center justify-between mb-6">
							<h3 className="text-xl font-bold text-gray-900 dark:text-white">Product Details</h3>
							<button onClick={onClose} disabled={approveLoading || disapproveLoading} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50">
								<i className="ri-close-line w-6 h-6 flex items-center justify-center text-gray-600 dark:text-gray-400"></i>
							</button>
						</div>

						<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
							{/* Left Column - Images */}
							<div className="space-y-4">
								<div className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
									<img src={item.image} alt={item.title} className="w-full h-full object-cover" />
								</div>

								<div className="grid grid-cols-4 gap-2">
									{[1, 2, 3, 4].map((i) => (
										<div key={i} className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
											<img src={item.image} alt={`${item.title} ${i}`} className="w-full h-full object-cover opacity-60" />
										</div>
									))}
								</div>
							</div>

							{/* Right Column - Details */}
							<div className="space-y-6">
								<div>
									<h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{item.title}</h1>
									<p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
										{getSettings()?.baseCurrency ? getSettings()?.baseCurrency : getCurrencyFromLocalStorage()?.code} {item.price}
									</p>
								</div>

								<div className="grid grid-cols-2 gap-4">
									<div>
										<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
										<div className="flex items-center gap-2">
											<i className="ri-price-tag-3-line w-4 h-4 flex items-center justify-center text-gray-500"></i>
											<span className="text-gray-900 dark:text-white">{item.category}</span>
										</div>
									</div>

									<div>
										<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Condition</label>
										<div className="flex items-center gap-2">
											<i className="ri-shield-check-line w-4 h-4 flex items-center justify-center text-gray-500"></i>
											<span className="text-gray-900 dark:text-white">{item.condition}</span>
										</div>
									</div>

									<div>
										<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
										<div className="flex items-center gap-2">
											<i className="ri-map-pin-line w-4 h-4 flex items-center justify-center text-gray-500"></i>
											<span className="text-gray-900 dark:text-white">{item.location}</span>
										</div>
									</div>

									<div>
										<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Seller</label>
										<div className="flex items-center gap-2">
											<i className="ri-user-line w-4 h-4 flex items-center justify-center text-gray-500"></i>
											<span className="text-gray-900 dark:text-white">{item.seller}</span>
										</div>
									</div>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tags</label>
									<div className="flex flex-wrap gap-2">
										{item.tags.map((tag, index) => (
											<span key={index} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm">
												{tag}
											</span>
										))}
									</div>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Contact Details</label>
									<div className="space-y-2">
										{contactInfo ? (
											<>
												<div className="flex items-center gap-2">
													<i className="ri-phone-line w-4 h-4 flex items-center justify-center text-gray-500"></i>
													<span className="text-gray-900 dark:text-white">{contactInfo.phone}</span>
												</div>
												<div className="flex items-center gap-2">
													<i className="ri-mail-line w-4 h-4 flex items-center justify-center text-gray-500"></i>
													<span className="text-gray-900 dark:text-white">{contactInfo.email}</span>
												</div>
											</>
										) : (
											<span className="text-gray-500 dark:text-gray-400">No contact information available</span>
										)}
									</div>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
									<p className="text-gray-900 dark:text-white">{item.description}</p>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Preview Description</label>
									<p className="text-gray-600 dark:text-gray-400 text-sm italic">This text will be displayed below the product name</p>
									<p className="text-gray-900 dark:text-white mt-1">{item.previewDescription}</p>
								</div>

								<div className="flex gap-4 pt-4">
									<Button onClick={handleApprove} disabled={approveLoading || disapproveLoading} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white whitespace-nowrap">
										{approveLoading ? (
											<div className="flex items-center gap-2">
												<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
												<span>Approving...</span>
											</div>
										) : (
											<div className="flex items-center gap-2">
												<i className="ri-check-line w-4 h-4 flex items-center justify-center"></i>
												<span>Approve</span>
											</div>
										)}
									</Button>

									<Button onClick={handleDisapprove} disabled={approveLoading || disapproveLoading} className="flex-1 bg-red-600 hover:bg-red-700 text-white whitespace-nowrap">
										{disapproveLoading ? (
											<div className="flex items-center gap-2">
												<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
												<span>Disapproving...</span>
											</div>
										) : (
											<div className="flex items-center gap-2">
												<i className="ri-close-line w-4 h-4 flex items-center justify-center"></i>
												<span>Disapprove</span>
											</div>
										)}
									</Button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}

export default function ApproveUploadsPage() {
	const [items, setItems] = useState<PendingItem[]>([]);
	const [filteredItems, setFilteredItems] = useState<PendingItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [pageLoading, setPageLoading] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);
	const [searchTerm, setSearchTerm] = useState('');
	const [categoryFilter, setCategoryFilter] = useState('All');
	const [sortBy, setSortBy] = useState('date');
	const [detailModalOpen, setDetailModalOpen] = useState(false);
	const [selectedItem, setSelectedItem] = useState<PendingItem | null>(null);
	const [approveModal, setApproveModal] = useState<{ isOpen: boolean; item: PendingItem | null }>({
		isOpen: false,
		item: null,
	});
	const [disapproveModal, setDisapproveModal] = useState<{ isOpen: boolean; item: PendingItem | null }>({
		isOpen: false,
		item: null,
	});
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
	}, [items, searchTerm, categoryFilter, sortBy, isMounted]);

	const loadItems = async () => {
		setLoading(true);
		try {
			const res = await fetchWithAuth('/api/marketplace?status=pending');
			if (!res.ok) {
				throw new Error(handleFetchMessage(await res.json(), 'Failed to fetch pending items'));
			}
			const data = await res.json();
			const items: PendingItem[] = (Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : data.products || []).map((item: any) => ({
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
				tags:
					typeof item.tags === 'string'
						? item.tags
								.split(',')
								.map((tag: string) => tag.trim())
								.filter(Boolean)
						: Array.isArray(item.tags)
						? item.tags
						: [],
				contactDetails: item.contactDetails || '',
				previewDescription: item.previewDescription || '',
			}));
			setItems(items);
		} catch (error) {
			toast.error(handleFetchMessage(error, 'Failed to fetch pending items'));
		} finally {
			setLoading(false);
		}
	};

	const filterItems = () => {
		let filtered = items.filter((item) => {
			const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || item.seller.toLowerCase().includes(searchTerm.toLowerCase()) || item.location.toLowerCase().includes(searchTerm.toLowerCase());
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

		setFilteredItems(filtered);
	};

	const handlePageChange = (page: number) => {
		setPageLoading(true);
		setCurrentPage(page);

		setTimeout(() => {
			setPageLoading(false);
		}, 800);
	};

	const handleItemClick = (item: PendingItem) => {
		setSelectedItem(item);
		setDetailModalOpen(true);
	};

	const handleApprove = async (item: PendingItem) => {
		if (!item) return;
		try {
			const formData = new FormData();
			formData.append('status', 'active');
			const res = await fetchWithAuth(`/api/marketplace/${item.id}`, {
				method: 'PUT',
				body: formData,
			});
			if (!res.ok) {
				const errMsg = handleFetchMessage(await res.json(), 'Failed to approve item.');
				toast.error(errMsg);
				return;
			}
			setItems(items.filter((i) => i.id !== item.id));
			setDetailModalOpen(false);
			setSelectedItem(null);
			setApproveModal({ isOpen: false, item: null });
			toast.success('Item approved successfully');
		} catch (error) {
			toast.error(handleFetchMessage(error, 'Failed to approve item'));
		}
	};

	const handleDisapprove = async (item: PendingItem) => {
		if (!item) return;
		try {
			const formData = new FormData();
			formData.append('status', 'delist');
			const res = await fetchWithAuth(`/api/marketplace/${item.id}`, {
				method: 'PUT',
				body: formData,
			});
			if (!res.ok) {
				const errMsg = handleFetchMessage(await res.json(), 'Failed to disapprove item.');
				toast.error(errMsg);
				return;
			}
			setItems(items.filter((i) => i.id !== item.id));
			setDetailModalOpen(false);
			setSelectedItem(null);
			setDisapproveModal({ isOpen: false, item: null });
			toast.success('Item disapproved successfully');
		} catch (error) {
			toast.error(handleFetchMessage(error, 'Failed to disapprove item'));
		}
	};

	const resetFilters = () => {
		setSearchTerm('');
		setCategoryFilter('All');
		setSortBy('date');
		toast.success('Filters reset successfully');
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
						<div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
						<div className="flex gap-2">
							<div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
							<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
						</div>
					</div>
					<div className="flex gap-4 mb-6">
						<div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
						<div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
						{[...Array(12)].map((_, i) => (
							<div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-lg h-80 animate-pulse"></div>
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
				<h1 className="text-2xl font-bold text-gray-900 dark:text-white">Approve New Uploads</h1>
				<div className="flex gap-2">
					<CustomLink href="/admin/marketplace">
						<Button variant="outline" className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 whitespace-nowrap">
							<i className="ri-arrow-left-line w-4 h-4 flex items-center justify-center mr-2"></i>
							Back to Live Listings
						</Button>
					</CustomLink>
					<div className="text-sm text-gray-600 dark:text-gray-400 flex items-center">{filteredItems.length} items pending approval</div>
				</div>
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
						<select className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm pr-8" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
							<option value="date">Sort by Date</option>
							<option value="price-low">Price: Low to High</option>
							<option value="price-high">Price: High to Low</option>
							<option value="title">Title: A to Z</option>
						</select>
						<Button variant="outline" onClick={resetFilters} className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 whitespace-nowrap">
							<i className="ri-filter-off-line w-4 h-4 flex items-center justify-center mr-2"></i>
							Reset
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
							<div className="relative cursor-pointer" onClick={() => handleItemClick(item)}>
								<img src={item.image} alt={item.title} className="w-full h-48 object-cover" />
								<div className="absolute top-3 right-3">
									<span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">Pending</span>
								</div>
							</div>

							<div className="p-4">
								<h3 className="font-semibold text-gray-900 dark:text-white mb-2 truncate">{item.title}</h3>
								<div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
									<i className="ri-price-tag-3-line w-4 h-4 flex items-center justify-center"></i>
									<span className="font-medium text-blue-600 dark:text-blue-400">
										{getSettings()?.baseCurrency ? getSettings()?.baseCurrency : getCurrencyFromLocalStorage()?.code} {item.price}
									</span>
								</div>
								<div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
									<i className="ri-user-line w-4 h-4 flex items-center justify-center"></i>
									<span>{item.seller}</span>
								</div>
								<div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
									<i className="ri-map-pin-line w-4 h-4 flex items-center justify-center"></i>
									<span>{item.location}</span>
								</div>

								<div className="flex items-center gap-2">
									<button
										onClick={(e) => {
											e.stopPropagation();
											setApproveModal({ isOpen: true, item });
										}}
										className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer flex items-center justify-center gap-2"
									>
										<i className="ri-check-line w-4 h-4 flex items-center justify-center"></i>
										<span>Approve</span>
									</button>
									<button
										onClick={(e) => {
											e.stopPropagation();
											setDisapproveModal({ isOpen: true, item });
										}}
										className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer"
									>
										<i className="ri-close-line w-4 h-4 flex items-center justify-center"></i>
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
					<i className="ri-inbox-line w-12 h-12 flex items-center justify-center mx-auto text-gray-400 mb-4"></i>
					<h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No pending items</h3>
					<p className="text-gray-500 dark:text-gray-400">All items have been reviewed</p>
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
			<ItemDetailModal isOpen={detailModalOpen} onClose={() => setDetailModalOpen(false)} item={selectedItem} onApprove={handleApprove} onDisapprove={handleDisapprove} />

			<ConfirmationModal
				isOpen={approveModal.isOpen}
				onClose={() => setApproveModal({ isOpen: false, item: null })}
				onConfirm={() => handleApprove(approveModal.item!)}
				title="Approve Item"
				message={`Are you sure you want to approve "${approveModal.item?.title}"? This will make it available in the marketplace.`}
				confirmText="Approve"
				cancelText="Cancel"
				confirmVariant="default"
			/>

			<ConfirmationModal
				isOpen={disapproveModal.isOpen}
				onClose={() => setDisapproveModal({ isOpen: false, item: null })}
				onConfirm={() => handleDisapprove(disapproveModal.item!)}
				title="Disapprove Item"
				message={`Are you sure you want to disapprove "${disapproveModal.item?.title}"? This action cannot be undone.`}
				confirmText="Disapprove"
				cancelText="Cancel"
				confirmVariant="destructive"
			/>
		</div>
	);
}
