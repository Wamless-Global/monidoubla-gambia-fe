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
import { getCurrencyFromLocalStorage, getSettings } from '@/lib/helpers';

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
		return <ListingsSkeleton />;
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 dark:from-[#181f2e] dark:via-[#232e48] dark:to-[#232e48] py-10">
			<div className="max-w-7xl mx-auto px-4 lg:px-0">
				<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
					<h1 className="text-2xl md:text-3xl font-extrabold text-blue-900 dark:text-white">My Listings</h1>
					<CustomLink href="/user/add-product">
						<Button className="bg-blue-900 hover:bg-blue-800 whitespace-nowrap">
							<i className="ri-add-line w-5 h-5 flex items-center justify-center mr-2"></i>
							Add New Product
						</Button>
					</CustomLink>
				</div>
				{/* Search Bar */}
				<div className="relative max-w-lg mb-10">
					<i className="ri-search-line absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-400 dark:text-indigo-300 w-5 h-5 flex items-center justify-center"></i>
					<input
						type="text"
						placeholder="Search your listings"
						value={searchQuery}
						onChange={(e) => handleSearch(e.target.value)}
						className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-blue-200 dark:border-indigo-700 bg-white dark:bg-gray-800 text-blue-900 dark:text-white text-lg font-medium shadow focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
					/>
				</div>
				{/* Listings Grid */}
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8">
					{filteredProducts.map((product) => (
						<Card key={product.id} className="group h-full border-0 shadow-xl rounded-2xl bg-white dark:bg-gray-900 hover:scale-[1.025] hover:shadow-2xl transition-transform duration-300 cursor-pointer flex flex-col">
							<div className="relative aspect-square rounded-t-2xl overflow-hidden">
								<img src={product.image} alt={product.name} className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-300" />
								{product.status === 'sold' && <span className="absolute top-3 right-3 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow">SOLD</span>}
							</div>
							<CardContent className="flex-1 flex flex-col justify-between p-5">
								<div className="space-y-2">
									<h3 className="font-extrabold text-lg text-blue-900 dark:text-white line-clamp-1">{product.name}</h3>
									<p className="text-2xl font-black text-blue-700 dark:text-blue-300">
										{product.price} {getSettings()?.baseCurrency ? getSettings()?.baseCurrency : getCurrencyFromLocalStorage()?.code}
									</p>
									<p className="text-sm text-blue-900/80 dark:text-indigo-100 line-clamp-2">{product.description}</p>
								</div>
								<div className="flex flex-wrap gap-2 mt-4">
									<span className="flex items-center gap-1 text-xs bg-blue-100 dark:bg-indigo-900/30 text-blue-700 dark:text-indigo-200 px-2 py-1 rounded">
										<i className="ri-map-pin-line"></i>
										{product.location}
									</span>
									<span className="flex items-center gap-1 text-xs bg-blue-100 dark:bg-indigo-900/30 text-blue-700 dark:text-indigo-200 px-2 py-1 rounded">
										<i className="ri-price-tag-3-line"></i>
										{product.category}
									</span>
									<span className="flex items-center gap-1 text-xs bg-blue-100 dark:bg-indigo-900/30 text-blue-700 dark:text-indigo-200 px-2 py-1 rounded">
										<i className="ri-star-line"></i>
										{product.condition}
									</span>
								</div>
								<div className="flex items-center justify-between pt-4 mt-4 border-t border-blue-100 dark:border-indigo-800">
									<span className="text-xs text-blue-700 dark:text-indigo-200">{product.datePosted}</span>
									<span className="flex items-center gap-1 text-xs text-blue-700 dark:text-indigo-200">
										<i className="ri-eye-line"></i>
										{product.views}
									</span>
								</div>
								<div className="flex items-center gap-2 mt-4">
									<button onClick={() => handleEditProduct(product.id)} className="p-2 rounded-lg bg-blue-50 dark:bg-indigo-900/30 text-blue-700 dark:text-indigo-200 hover:bg-blue-100 dark:hover:bg-indigo-800 transition" title="Edit product">
										<i className="ri-edit-line w-5 h-5 flex items-center justify-center"></i>
									</button>
									<button onClick={() => handleDeleteClick(product.id)} className="p-2 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-800 transition" title="Delete product">
										<i className="ri-delete-bin-line w-5 h-5 flex items-center justify-center"></i>
									</button>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
				{/* No Listings */}
				{filteredProducts.length === 0 && !isLoading && (
					<div className="flex flex-col items-center justify-center py-24 text-center">
						<i className="ri-store-line w-20 h-20 flex items-center justify-center text-blue-200 dark:text-indigo-700 mb-6"></i>
						<h3 className="text-2xl font-bold text-blue-900 dark:text-white mb-2">No listings found</h3>
						<p className="text-blue-700 dark:text-indigo-200 mb-4">{searchQuery ? 'No items match your search criteria' : "You haven't created any listings yet"}</p>
						<CustomLink href="/user/add-product">
							<Button className="bg-blue-900 hover:bg-blue-800 whitespace-nowrap">
								<i className="ri-add-line w-5 h-5 flex items-center justify-center mr-2"></i>
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
