'use client';

import { useState, useEffect } from 'react';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import { ListingsSkeleton } from '@/components/LoadingSkeleton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CustomLink } from '@/components/CustomLink';
import { logger } from '@/lib/logger';
import { getCurrentUser } from '@/lib/userUtils';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { toast } from 'sonner';
import { getCurrencyFromLocalStorage, getSettings } from '@/lib/helpers';
import Image from 'next/image';

// NOTE: All original interfaces and logic are preserved.
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
					image: (typeof item.Images === 'string' ? JSON.parse(item.Images)?.[0] : item.Images?.[0]) || '',
					description: item.description,
					location: item.location,
					category: item.category,
					condition: item.condition,
					datePosted: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '',
					views: item.views || 0,
					status: item.status || 'active',
				}));
				setProducts(items);
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
				const res = await fetchWithAuth(`/api/marketplace/${productToDelete}`, { method: 'DELETE' });
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
				setProductToDelete(null);
				setIsDeleteModalOpen(false);
			}
		}
	};

	const handleEditProduct = (productId: string) => {
		logger.log('Edit product:', productId);
		// Implement edit logic or navigation here, e.g., router.push(`/user/edit-product/${productId}`);
	};

	if (isLoading) {
		return <ListingsSkeleton />;
	}

	// ===============================================
	// START: Redesigned JSX
	// ===============================================
	return (
		<div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8">
			<div className="max-w-7xl mx-auto">
				<header className="mb-8">
					<h1 className="text-3xl font-bold text-gray-800">My Listings</h1>
					<p className="text-gray-500 mt-1">Manage all the products you've listed for sale.</p>
				</header>

				<div className="flex flex-col md:flex-row gap-4 mb-8">
					<div className="relative flex-1">
						<i className="ri-search-line absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"></i>
						<input type="text" placeholder="Search your listings..." value={searchQuery} onChange={(e) => handleSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500" />
					</div>
					<CustomLink href="/user/add-product">
						<Button className="whitespace-nowrap w-full md:w-auto">
							<i className="ri-add-line mr-2"></i>
							Add New Product
						</Button>
					</CustomLink>
				</div>

				{filteredProducts.length > 0 ? (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
						{filteredProducts.map((product) => (
							<Card key={product.id} className="group flex flex-col overflow-hidden">
								<div className="aspect-square bg-gray-100 overflow-hidden">
									<Image src={product.image || '/placeholder.png'} alt={product.name} width={400} height={400} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
								</div>
								<CardContent className="p-4 flex-grow flex flex-col">
									<div className="flex justify-between items-start gap-2">
										<h3 className="font-semibold text-gray-800 line-clamp-2 flex-1">{product.name}</h3>
										<Badge variant={product.status === 'active' ? 'success' : 'secondary'} className="capitalize">
											{product.status}
										</Badge>
									</div>
									<div className="flex-grow"></div>
									<p className="text-xl font-bold text-teal-600 my-2">
										{product.price.toLocaleString()} {getSettings()?.baseCurrency}
									</p>
									<div className="flex items-center gap-2 text-xs text-gray-500">
										<i className="ri-calendar-line"></i>
										<span>Listed: {product.datePosted}</span>
									</div>
								</CardContent>
								<CardFooter className="flex gap-2">
									<Button variant="outline" size="sm" className="flex-1" onClick={() => handleEditProduct(product.id)}>
										Edit
									</Button>
									<Button variant="destructive" size="sm" className="flex-1" onClick={() => handleDeleteClick(product.id)}>
										Delete
									</Button>
								</CardFooter>
							</Card>
						))}
					</div>
				) : (
					<div className="text-center py-20">
						<div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
							<i className="ri-store-2-line text-3xl text-gray-500"></i>
						</div>
						<h3 className="text-xl font-semibold text-gray-700">No Listings Found</h3>
						<p className="text-gray-500 mt-2 mb-6">{searchQuery ? 'No items match your search criteria.' : "You haven't listed any products yet."}</p>
						<CustomLink href="/user/add-product">
							<Button>
								<i className="ri-add-line mr-2"></i>
								List Your First Product
							</Button>
						</CustomLink>
					</div>
				)}

				<ConfirmationModal
					isOpen={isDeleteModalOpen}
					onClose={() => setIsDeleteModalOpen(false)}
					onConfirm={handleDeleteConfirm}
					title="Delete Product"
					message="Are you sure you want to permanently delete this product from your listings?"
					confirmText="Yes, Delete"
					confirmVariant="destructive"
				/>
			</div>
		</div>
	);
}
