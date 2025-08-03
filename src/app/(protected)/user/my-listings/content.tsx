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
				// API returns { data: Product[] }
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
		return (
			<div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background to-blue-50 dark:to-blue-950/40">
				<div className="w-full max-w-6xl px-4 lg:px-0">
					<div className="animate-pulse space-y-8">
						<div className="h-8 w-48 rounded-lg bg-gradient-to-r from-blue-200/60 to-blue-100/30 mb-6" />
						<div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
							{[...Array(4)].map((_, i) => (
								<div key={i} className="rounded-xl bg-gradient-to-br from-white/60 to-blue-100/30 dark:from-blue-900/30 dark:to-blue-950/10 shadow-lg p-4 h-72" />
							))}
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-background to-blue-50 dark:to-blue-950/40 py-8 px-2 lg:px-0">
			<div className="max-w-6xl mx-auto w-full space-y-8">
				<div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
					<div className="relative flex-1 lg:max-w-md">
						<i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 w-5 h-5 flex items-center justify-center" />
						<input
							type="text"
							placeholder="Search for items"
							value={searchQuery}
							onChange={(e) => handleSearch(e.target.value)}
							className="w-full pl-12 pr-4 py-3 border-0 rounded-xl shadow bg-gradient-to-r from-white/80 to-blue-50/40 dark:from-blue-900/30 dark:to-blue-950/10 text-base focus:ring-2 focus:ring-blue-400 focus:outline-none"
						/>
					</div>
					<CustomLink href="/user/add-product">
						<Button className="bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white px-8 py-3 text-base font-semibold rounded-xl shadow-lg">
							<i className="ri-add-line w-5 h-5 flex items-center justify-center mr-2" />
							Add New Product
						</Button>
					</CustomLink>
				</div>

				<div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
					{filteredProducts.map((product) => (
						<Card key={product.id} className="group hover:shadow-2xl transition-shadow h-full cursor-pointer bg-gradient-to-br from-white/80 to-blue-50/40 dark:from-blue-900/30 dark:to-blue-950/10 border-0 rounded-xl">
							<CardContent className="p-4">
								<div className="aspect-square mb-4 bg-gradient-to-br from-blue-100/60 to-white/40 dark:from-blue-900/20 dark:to-blue-950/5 rounded-lg overflow-hidden flex items-center justify-center">
									<img src={product.image} alt={product.name} className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300" />
								</div>
								<div className="space-y-2">
									<h3 className="font-bold text-foreground line-clamp-1">{product.name}</h3>
									<p className="text-2xl font-extrabold text-blue-900 dark:text-blue-200">
										{product.price} {getCurrencyFromLocalStorage()?.code}
									</p>
									<p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
									<div className="flex items-center gap-1 text-sm text-muted-foreground">
										<i className="ri-map-pin-line w-4 h-4 flex items-center justify-center" />
										<span className="line-clamp-1">{product.location}</span>
									</div>
									<div className="flex items-center gap-1 text-sm text-muted-foreground">
										<i className="ri-calendar-line w-4 h-4 flex items-center justify-center" />
										<span>{product.datePosted}</span>
									</div>
									<div className="flex items-center justify-between pt-2">
										<div className="flex items-center gap-2">
											<button onClick={() => handleEditProduct(product.id)} className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg transition-colors" title="Edit product">
												<i className="ri-edit-line w-5 h-5 flex items-center justify-center text-blue-600 dark:text-blue-300" />
											</button>
											<button onClick={() => handleDeleteClick(product.id)} className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Delete product">
												<i className="ri-delete-bin-line w-5 h-5 flex items-center justify-center text-red-600 dark:text-red-300" />
											</button>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>

				{filteredProducts.length === 0 && !isLoading && (
					<div className="flex flex-col items-center justify-center py-16 text-center">
						<i className="ri-store-line w-16 h-16 flex items-center justify-center text-gray-400 mb-4" />
						<h3 className="text-lg font-semibold text-foreground mb-2">No listings found</h3>
						<p className="text-muted-foreground mb-4">{searchQuery ? 'No items match your search criteria' : "You haven't created any listings yet"}</p>
						<CustomLink href="/user/add-product">
							<Button className="bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white px-8 py-3 text-base font-semibold rounded-xl shadow-lg">
								<i className="ri-add-line w-5 h-5 flex items-center justify-center mr-2" />
								Add New Product
							</Button>
						</CustomLink>
					</div>
				)}

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
