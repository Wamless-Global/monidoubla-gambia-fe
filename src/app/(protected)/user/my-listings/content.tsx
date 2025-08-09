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
		<div className="p-4 lg:p-6 space-y-6">
			<div className="max-w-6xl mx-auto space-y-6">
				<div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
					<div className="relative flex-1 lg:max-w-md">
						<i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 flex items-center justify-center"></i>
						<input type="text" placeholder="Search for items" value={searchQuery} onChange={(e) => handleSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm" />
					</div>

					<CustomLink href="/user/add-product">
						<Button className="bg-blue-900 hover:bg-blue-800 whitespace-nowrap">
							<i className="ri-add-line w-4 h-4 flex items-center justify-center mr-2"></i>
							Add New Product
						</Button>
					</CustomLink>
				</div>

				<div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
					{filteredProducts.map((product) => (
						<Card key={product.id} className="group hover:shadow-lg transition-shadow h-full">
							<CardContent className="p-4">
								<div className="aspect-square mb-4 bg-gray-100 rounded-lg overflow-hidden">
									<img src={product.image} alt={product.name} className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300" />
								</div>

								<div className="space-y-2">
									<h3 className="font-semibold text-gray-900 line-clamp-1">{product.name}</h3>
									<p className="text-2xl font-bold text-blue-900">
										{product.price} {getSettings()?.baseCurrency ? getSettings()?.baseCurrency : getCurrencyFromLocalStorage()?.code}
									</p>
									<p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>

									<div className="flex items-center gap-1 text-sm text-gray-500">
										<i className="ri-map-pin-line w-3 h-3 flex items-center justify-center"></i>
										<span className="line-clamp-1">{product.location}</span>
									</div>

									<div className="flex items-center gap-1 text-sm text-gray-500">
										<i className="ri-calendar-line w-3 h-3 flex items-center justify-center"></i>
										<span>{product.datePosted}</span>
									</div>

									<div className="flex items-center justify-between pt-2">
										<div className="flex items-center gap-2">
											<button onClick={() => handleEditProduct(product.id)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors" title="Edit product">
												<i className="ri-edit-line w-4 h-4 flex items-center justify-center text-gray-600"></i>
											</button>
											<button onClick={() => handleDeleteClick(product.id)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors" title="Delete product">
												<i className="ri-delete-bin-line w-4 h-4 flex items-center justify-center text-gray-600"></i>
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
						<i className="ri-store-line w-16 h-16 flex items-center justify-center text-gray-400 mb-4"></i>
						<h3 className="text-lg font-medium text-gray-900 mb-2">No listings found</h3>
						<p className="text-gray-500 mb-4">{searchQuery ? 'No items match your search criteria' : "You haven't created any listings yet"}</p>
						<CustomLink href="/user/add-product">
							<Button className="bg-blue-900 hover:bg-blue-800 whitespace-nowrap">
								<i className="ri-add-line w-4 h-4 flex items-center justify-center mr-2"></i>
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
