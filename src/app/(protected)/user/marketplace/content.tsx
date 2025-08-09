'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FilterModal, FilterContent } from '@/components/FilterModal';
import { MarketplaceSkeleton } from '@/components/LoadingSkeleton';
import { CustomLink } from '@/components/CustomLink';
import Image from 'next/image';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { getCurrencyFromLocalStorage, handleFetchMessage, getSettings } from '@/lib/helpers';
import { logger } from '@/lib/logger';

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
	status: 'available' | 'sold';
	seller: string;
}

interface FilterState {
	location: string;
	priceRange: { min: string; max: string };
	priceCategory: string;
	condition: string;
	datePosted: string;
}

export default function MarketplacePage() {
	const [searchQuery, setSearchQuery] = useState('');
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
				if (!res.ok) throw new Error(handleFetchMessage(await res.json(), 'Failed to fetch products'));
				const data = await res.json();
				const items: Product[] = (Array.isArray(data?.data) ? data.data : []).map((item: any) => ({
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
			} catch (error) {
				logger.error('Error fetching products:', error);
				setProducts([]);
			} finally {
				setIsLoading(false);
			}
		};
		fetchProducts();
	}, []);

	useEffect(() => {
		let filtered = [...products];

		// Apply search query
		if (searchQuery) {
			const lowercasedQuery = searchQuery.toLowerCase();
			filtered = filtered.filter((product) => product.name.toLowerCase().includes(lowercasedQuery) || product.description.toLowerCase().includes(lowercasedQuery) || product.location.toLowerCase().includes(lowercasedQuery));
		}

		// Apply filters from state
		if (currentFilters.condition) {
			filtered = filtered.filter((product) => product.condition === currentFilters.condition);
		}
		if (currentFilters.priceRange.min) {
			filtered = filtered.filter((product) => product.price >= Number(currentFilters.priceRange.min));
		}
		if (currentFilters.priceRange.max) {
			filtered = filtered.filter((product) => product.price <= Number(currentFilters.priceRange.max));
		}

		// Apply sorting
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
				// 'newest' is the default
				filtered.sort((a, b) => new Date(b.datePosted).getTime() - new Date(a.datePosted).getTime());
				break;
		}

		setFilteredProducts(filtered);
	}, [searchQuery, sortBy, products, currentFilters]);

	const handleFilterApply = (filters: FilterState) => {
		setCurrentFilters(filters);
	};

	const handleFilterReset = () => {
		setCurrentFilters({ location: '', priceRange: { min: '', max: '' }, priceCategory: '', condition: '', datePosted: '' });
		setSearchQuery('');
	};

	if (isLoading) {
		return <MarketplaceSkeleton />;
	}

	return (
		<div className="bg-gray-50 min-h-screen">
			<div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
				<header className="mb-8">
					<h1 className="text-3xl font-bold text-gray-800">Marketplace</h1>
					<p className="text-gray-500 mt-1">Discover items from sellers in the community.</p>
				</header>

				<div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
					{/* Desktop Filter Sidebar */}
					<aside className="hidden lg:block lg:col-span-1">
						<Card>
							<CardHeader>
								<CardTitle>Filters</CardTitle>
							</CardHeader>
							<CardContent>
								<FilterContent currentFilters={currentFilters} onFiltersChange={setCurrentFilters} />
							</CardContent>
						</Card>
					</aside>

					{/* Main Content Area */}
					<main className="lg:col-span-3">
						{/* Toolbar */}
						<div className="flex flex-col md:flex-row gap-4 mb-6">
							<div className="relative flex-1">
								<i className="ri-search-line absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"></i>
								<input type="text" placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500" />
							</div>
							<div className="flex items-center gap-4">
								<Button variant="outline" onClick={() => setIsFilterModalOpen(true)} className="lg:hidden flex-1">
									<i className="ri-filter-3-line mr-2"></i>Filters
								</Button>
								<Button variant="outline" onClick={handleFilterReset} className="flex-1 md:flex-none">
									<i className="ri-refresh-line mr-2"></i>Reset
								</Button>
							</div>
						</div>

						{/* Results Info */}
						<div className="flex justify-between items-center mb-4">
							<p className="text-sm text-gray-600">
								Showing <span className="font-semibold">{filteredProducts.length}</span> results
							</p>
							<select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="text-sm border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500">
								<option value="newest">Newest</option>
								<option value="popular">Most Popular</option>
								<option value="price-low">Price: Low to High</option>
								<option value="price-high">Price: High to Low</option>
							</select>
						</div>

						{/* Products Grid */}
						{filteredProducts.length > 0 ? (
							<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
								{filteredProducts.map((product) => (
									<CustomLink key={product.id} href={`/user/marketplace/${product.id}`}>
										<Card className="group overflow-hidden h-full flex flex-col">
											<div className="aspect-video bg-gray-100 overflow-hidden">
												<Image src={product.image || '/placeholder.png'} alt={product.name} width={400} height={225} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
											</div>
											<CardContent className="p-4 flex-grow flex flex-col">
												<h3 className="font-semibold text-gray-800 line-clamp-1">{product.name}</h3>
												<p className="text-sm text-gray-500 mb-2 capitalize">{product.condition}</p>
												<div className="flex-grow"></div>
												<p className="text-xl font-bold text-teal-600 mt-2">
													{product.price.toLocaleString()} {getSettings()?.baseCurrency}
												</p>
												<div className="flex items-center gap-2 text-xs text-gray-500 mt-2 pt-2 border-t">
													<i className="ri-map-pin-line"></i>
													<span className="line-clamp-1">{product.location}</span>
												</div>
											</CardContent>
										</Card>
									</CustomLink>
								))}
							</div>
						) : (
							<div className="text-center py-20">
								<i className="ri-search-2-line text-5xl text-gray-400 mb-4"></i>
								<h3 className="text-xl font-semibold text-gray-700">No Products Found</h3>
								<p className="text-gray-500 mt-2">Try adjusting your search or filters to find what you're looking for.</p>
							</div>
						)}
					</main>
				</div>
			</div>
			<FilterModal isOpen={isFilterModalOpen} onClose={() => setIsFilterModalOpen(false)} onApplyFilters={handleFilterApply} currentFilters={currentFilters} />
		</div>
	);
}
