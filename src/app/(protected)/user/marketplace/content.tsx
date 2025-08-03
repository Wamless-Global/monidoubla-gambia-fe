'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FilterModal } from '@/components/FilterModal';
import { MarketplaceSkeleton } from '@/components/LoadingSkeleton';
import { CustomLink } from '@/components/CustomLink';
import Image from 'next/image';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
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
	status: 'available' | 'sold';
	seller: string;
}

interface FilterState {
	location: string;
	priceRange: {
		min: string;
		max: string;
	};
	priceCategory: string;
	condition: string;
	datePosted: string;
}

export default function MarketplacePage() {
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedCategory, setSelectedCategory] = useState('');
	const [sortBy, setSortBy] = useState('newest');
	const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
	const [products, setProducts] = useState<Product[]>([]);
	const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	const [currentFilters, setCurrentFilters] = useState<FilterState>({
		location: '',
		priceRange: { min: '', max: '' },
		priceCategory: '',
		condition: '',
		datePosted: '',
	});

	useEffect(() => {
		const fetchProducts = async () => {
			setIsLoading(true);
			try {
				const res = await fetchWithAuth('/api/marketplace?status=active');
				if (!res.ok) throw new Error('Failed to fetch products');
				const data = await res.json();
				// Map API data to Product interface, as in the main marketplace page
				const items: Product[] = (Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : data.products || []).map((item: any) => ({
					id: item.id,
					name: item.name,
					price: item.price,
					image: typeof item.Images === 'string' ? JSON.parse(item.Images)?.[0] || '' : item.Images?.[0] || '',
					description: item.description,
					location: item.location,
					category: item.category,
					condition: item.condition,
					datePosted: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '',
					views: item.views || 0,
					status: item.status || 'available',
					seller: item.seller || item.user?.name || '',
				}));
				setProducts(items);
				setFilteredProducts(items);
			} catch (error) {
				console.error('Error fetching products:', error);
				setProducts([]);
				setFilteredProducts([]);
			} finally {
				setIsLoading(false);
			}
		};
		fetchProducts();
	}, []);

	useEffect(() => {
		let filtered = products;

		if (searchQuery) {
			filtered = filtered.filter((product) => product.name.toLowerCase().includes(searchQuery.toLowerCase()) || product.description.toLowerCase().includes(searchQuery.toLowerCase()) || product.location.toLowerCase().includes(searchQuery.toLowerCase()));
		}

		if (selectedCategory) {
			filtered = filtered.filter((product) => product.category === selectedCategory);
		}

		switch (sortBy) {
			case 'price-low':
				filtered.sort((a, b) => a.price - b.price);
				break;
			case 'price-high':
				filtered.sort((a, b) => b.price - a.price);
				break;
			case 'popular':
				filtered.sort((a, b) => b.views - a.views);
				break;
			default:
				break;
		}

		setFilteredProducts(filtered);
	}, [searchQuery, selectedCategory, sortBy, products]);

	const handleSearch = (query: string) => {
		setSearchQuery(query);
	};

	const handleFilterApply = (filters: FilterState) => {
		setCurrentFilters(filters);
		setSelectedCategory(filters.priceCategory || '');
		setSortBy('newest');
	};

	const handleFilterReset = () => {
		setCurrentFilters({
			location: '',
			priceRange: { min: '', max: '' },
			priceCategory: '',
			condition: '',
			datePosted: '',
		});
		setSelectedCategory('');
		setSortBy('newest');
		setSearchQuery('');
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
				{/* Search and Filter */}
				<div className="flex flex-col lg:flex-row gap-4">
					<div className="flex-1">
						<div className="relative">
							<i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 w-5 h-5 flex items-center justify-center" />
							<input
								type="text"
								placeholder="Search products, categories, or locations..."
								value={searchQuery}
								onChange={(e) => handleSearch(e.target.value)}
								className="w-full pl-12 pr-4 py-3 border-0 rounded-xl shadow bg-gradient-to-r from-white/80 to-blue-50/40 dark:from-blue-900/30 dark:to-blue-950/10 text-base focus:ring-2 focus:ring-blue-400 focus:outline-none"
							/>
						</div>
					</div>
					<div className="flex gap-2">
						<Button onClick={() => setIsFilterModalOpen(true)} className="bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white px-6 py-2 text-base font-semibold rounded-xl shadow-lg">
							<i className="ri-filter-line w-5 h-5 flex items-center justify-center mr-2" />
							Filters
						</Button>
						<Button onClick={handleFilterReset} className="bg-gradient-to-r from-gray-300 to-gray-100 hover:from-gray-400 hover:to-gray-200 text-gray-800 px-6 py-2 text-base font-semibold rounded-xl shadow-lg">
							<i className="ri-refresh-line w-5 h-5 flex items-center justify-center mr-2" />
							Reset
						</Button>
					</div>
				</div>

				{/* Results count */}
				<div className="flex items-center justify-between">
					<p className="text-base text-muted-foreground">
						Showing {filteredProducts.length} of {products.length} products
					</p>
					{(searchQuery || selectedCategory) && (
						<p className="text-base text-muted-foreground">
							{searchQuery && `Search: "${searchQuery}"`}
							{searchQuery && selectedCategory && ' • '}
							{selectedCategory && `Category: ${selectedCategory}`}
						</p>
					)}
				</div>

				{/* Products Grid */}
				<div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
					{filteredProducts.map((product) => (
						<CustomLink key={product.id} href={`/user/marketplace/${product.id}`}>
							<Card className="group hover:shadow-2xl transition-shadow h-full cursor-pointer bg-gradient-to-br from-white/80 to-blue-50/40 dark:from-blue-900/30 dark:to-blue-950/10 border-0 rounded-xl">
								<CardContent className="p-4">
									<div className="aspect-square mb-4 bg-gradient-to-br from-blue-100/60 to-white/40 dark:from-blue-900/20 dark:to-blue-950/5 rounded-lg overflow-hidden flex items-center justify-center">
										<Image src={product.image} alt={product.name} width={400} height={400} className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300" />
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
											<i className="ri-user-line w-4 h-4 flex items-center justify-center" />
											<span className="line-clamp-1">{product.seller}</span>
										</div>
										<div className="flex items-center justify-between pt-2">
											<span className="text-xs text-muted-foreground">{product.datePosted}</span>
											<div className="flex items-center gap-1 text-xs text-muted-foreground">
												<i className="ri-eye-line w-4 h-4 flex items-center justify-center" />
												<span>{product.views}</span>
											</div>
										</div>
									</div>
								</CardContent>
							</Card>
						</CustomLink>
					))}
				</div>

				{/* No results */}
				{filteredProducts.length === 0 && !isLoading && (
					<div className="flex flex-col items-center justify-center py-16 text-center">
						<i className="ri-search-line w-16 h-16 flex items-center justify-center text-gray-400 mb-4" />
						<h3 className="text-lg font-semibold text-foreground mb-2">No products found</h3>
						<p className="text-muted-foreground mb-4">Try adjusting your search terms or filters</p>
						<Button onClick={handleFilterReset} className="bg-gradient-to-r from-gray-300 to-gray-100 hover:from-gray-400 hover:to-gray-200 text-gray-800 px-6 py-2 text-base font-semibold rounded-xl shadow-lg">
							Clear filters
						</Button>
					</div>
				)}
			</div>

			<FilterModal isOpen={isFilterModalOpen} onClose={() => setIsFilterModalOpen(false)} onApplyFilters={handleFilterApply} currentFilters={currentFilters} />
		</div>
	);
}
