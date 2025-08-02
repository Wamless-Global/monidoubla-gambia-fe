'use client';

import { useState, useEffect } from 'react';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import { ListingsSkeleton } from '@/components/LoadingSkeleton';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CustomLink } from '@/components/CustomLink';
import { logger } from '@/lib/logger';
import { getCurrentUser } from '@/lib/userUtils';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { toast } from 'sonner';
import { getCurrencyFromLocalStorage } from '@/lib/helpers';

interface Product {
	id: string;
	name: string;
	price: number;
	image: string;
	description: string;
	location: string;
	category: string;
	condition: string;
	datePosted: string;
	views: number;
	status: 'active' | 'inactive' | 'sold';
}

export default function MyListingsPage() {
	const [searchQuery, setSearchQuery] = useState('');
	const [products, setProducts] = useState<Product[]>([]);
	const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [productToDelete, setProductToDelete] = useState<string | null>(null);

	useEffect(() => {
		const fetchProducts = async () => {
			setIsLoading(true);
			try {
				const user = getCurrentUser();
				if (!user?.id) {
					toast.error('Could not determine current user.');
					setProducts([]);
					setFilteredProducts([]);
					return;
				}
				const res = await fetchWithAuth(`/api/marketplace/?user=${user.id}`);
				if (!res.ok) {
					toast.error('Failed to fetch your listings.');
					setProducts([]);
					setFilteredProducts([]);
					return;
				}
				const data = await res.json();
				const items: Product[] = (data?.data || []).map((item: any) => ({
					id: item.id,
					name: item.name,
					price: item.price,
					image: JSON.parse(item.Images)?.[0] || '',
					description: item.description,
					location: item.location,
					category: item.category,
					condition: item.condition,
					datePosted: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '',
					views: item.views || 0,
					status: item.status || 'active',
				}));
				setProducts(items);
				logger.log('Fetched products:', items);
				setFilteredProducts(items);
			} catch (error) {
				logger.error('Error fetching products:', error);
				toast.error('Error fetching your listings.');
				setProducts([]);
				setFilteredProducts([]);
			} finally {
				setIsLoading(false);
			}
		};
		fetchProducts();
	}, []);

	const handleSearch = (query: string) => {
		setSearchQuery(query);
		if (query.trim() === '') {
			setFilteredProducts(products);
		} else {
			const filtered = products.filter((product) => product.name.toLowerCase().includes(query.toLowerCase()) || product.description.toLowerCase().includes(query.toLowerCase()));
			setFilteredProducts(filtered);
		}
	};

	const handleDeleteClick = (productId: string) => {
		setProductToDelete(productId);
		setIsDeleteModalOpen(true);
	};

	const handleDeleteConfirm = async () => {
		if (productToDelete) {
			try {
				setIsLoading(true);
				const res = await fetchWithAuth(`/api/marketplace/${productToDelete}`, {
					method: 'DELETE',
				});
				if (!res.ok) {
					const errMsg = (await res.json())?.message || 'Failed to delete product.';
					toast.error(errMsg);
				} else {
					toast.success('Product deleted successfully.');
					const updatedProducts = products.filter((product) => product.id !== productToDelete);
					setProducts(updatedProducts);
					const updatedFilteredProducts = filteredProducts.filter((product) => product.id !== productToDelete);
					setFilteredProducts(updatedFilteredProducts);
				}
			} catch (error) {
				logger.error('Error deleting product:', error);
				toast.error('Error deleting product.');
			} finally {
				setIsLoading(false);
				setProductToDelete(null);
				setIsDeleteModalOpen(false);
			}
		}
	};

	const handleEditProduct = (productId: string) => {
		logger.log('Edit product:', productId);
		// Implement edit logic or navigation here
	};

	if (isLoading) {
		return <ListingsSkeleton />;
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-emerald-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 py-0 px-0">
			<div className="max-w-6xl mx-auto py-10 px-4 space-y-8">
				{/* Header & Search */}
				<div className="flex flex-col md:flex-row gap-6 md:items-center md:justify-between mb-6">
					<div className="flex-1 flex flex-col gap-2">
						<h1 className="text-3xl md:text-4xl font-extrabold text-indigo-900 dark:text-indigo-100 drop-shadow-lg mb-1">My Listings</h1>
						<p className="text-lg text-indigo-700 dark:text-indigo-200 font-medium">Manage and showcase your marketplace products</p>
					</div>
					<div className="flex flex-col md:flex-row gap-3 md:items-center">
						<div className="relative flex-1 md:w-72">
							<i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-400 w-5 h-5 flex items-center justify-center"></i>
							<input
								type="text"
								placeholder="Search for items"
								value={searchQuery}
								onChange={(e) => handleSearch(e.target.value)}
								className="w-full pl-10 pr-4 py-2.5 border-2 border-indigo-100 dark:border-indigo-900 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 text-base bg-white/80 dark:bg-gray-900/80 text-indigo-900 dark:text-indigo-100 shadow"
							/>
						</div>
						<CustomLink href="/user/add-product">
							<Button className="bg-gradient-to-tr from-indigo-600 via-purple-600 to-emerald-500 hover:from-indigo-700 hover:to-emerald-600 text-white font-bold rounded-xl px-6 py-2 shadow-lg whitespace-nowrap">
								<i className="ri-add-line w-5 h-5 flex items-center justify-center mr-2"></i>
								Add New Product
							</Button>
						</CustomLink>
					</div>
				</div>

				{/* Listings Grid */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
					{filteredProducts.map((product) => (
						<Card key={product.id} className="rounded-3xl shadow-2xl bg-white/90 dark:bg-gray-900/90 border-2 border-indigo-100 dark:border-indigo-900 h-full group hover:scale-105 hover:shadow-2xl transition-all duration-300">
							<CardContent className="p-4">
								<div className="aspect-square mb-4 bg-gradient-to-tr from-indigo-100 via-purple-100 to-emerald-100 dark:from-indigo-900 dark:via-purple-900 dark:to-emerald-900 rounded-2xl overflow-hidden flex items-center justify-center">
									<img src={product.image} alt={product.name} className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-300" />
								</div>
								<div className="space-y-2">
									<h3 className="font-extrabold text-indigo-900 dark:text-indigo-100 line-clamp-1 text-lg">{product.name}</h3>
									<p className="text-2xl font-black text-emerald-700 dark:text-emerald-300">
										{product.price} {getCurrencyFromLocalStorage()?.code}
									</p>
									<p className="text-sm text-indigo-700 dark:text-indigo-200 line-clamp-2">{product.description}</p>
									<div className="flex items-center gap-2 text-sm text-indigo-400 dark:text-indigo-200">
										<i className="ri-map-pin-line w-4 h-4 flex items-center justify-center"></i>
										<span className="line-clamp-1">{product.location}</span>
									</div>
									<div className="flex items-center gap-2 text-sm text-indigo-400 dark:text-indigo-200">
										<i className="ri-calendar-line w-4 h-4 flex items-center justify-center"></i>
										<span>{product.datePosted}</span>
									</div>
									<div className="flex items-center justify-between pt-2">
										<div className="flex items-center gap-2">
											<button onClick={() => handleEditProduct(product.id)} className="p-2 hover:bg-indigo-50 dark:hover:bg-indigo-900 rounded-lg transition-colors" title="Edit product">
												<i className="ri-edit-line w-5 h-5 flex items-center justify-center text-indigo-600 dark:text-indigo-300"></i>
											</button>
											<button onClick={() => handleDeleteClick(product.id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors" title="Delete product">
												<i className="ri-delete-bin-line w-5 h-5 flex items-center justify-center text-red-600 dark:text-red-300"></i>
											</button>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>

				{/* Empty State */}
				{filteredProducts.length === 0 && !isLoading && (
					<div className="flex flex-col items-center justify-center py-24 text-center">
						<i className="ri-store-line w-20 h-20 flex items-center justify-center text-indigo-200 dark:text-indigo-900 mb-6"></i>
						<h3 className="text-2xl font-bold text-indigo-900 dark:text-indigo-100 mb-2">No listings found</h3>
						<p className="text-indigo-700 dark:text-indigo-200 mb-6 text-lg">{searchQuery ? 'No items match your search criteria' : "You haven't created any listings yet"}</p>
						<CustomLink href="/user/add-product">
							<Button className="bg-gradient-to-tr from-indigo-600 via-purple-600 to-emerald-500 hover:from-indigo-700 hover:to-emerald-600 text-white font-bold rounded-xl px-6 py-2 shadow-lg whitespace-nowrap">
								<i className="ri-add-line w-5 h-5 flex items-center justify-center mr-2"></i>
								Add New Product
							</Button>
						</CustomLink>
					</div>
				)}

				{/* Delete Confirmation Modal */}
				<ConfirmationModal
					isOpen={isDeleteModalOpen}
					onClose={() => setIsDeleteModalOpen(false)}
					onConfirm={handleDeleteConfirm}
					title="Remove Product"
					message="Are you sure you want to remove this product from your listings permanently?"
					confirmText="Yes, remove"
					cancelText="Cancel"
					confirmVariant="destructive"
				/>
			</div>
		</div>
	);
}
