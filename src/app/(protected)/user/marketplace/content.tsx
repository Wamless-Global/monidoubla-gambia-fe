'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FilterModal } from '@/components/FilterModal';
import { MarketplaceSkeleton } from '@/components/LoadingSkeleton';
import { CustomLink } from '@/components/CustomLink';
import Image from 'next/image';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { getCurrencyFromLocalStorage, handleFetchMessage, getSettings } from '@/lib/helpers';
import { logger } from '@/lib/logger';

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

				if (!res.ok) {
					throw new Error(handleFetchMessage(await res.json(), 'Failed to fetch products'));
				}
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
				logger.error('Error fetching products:', error);
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
		return <MarketplaceSkeleton />;
	}

	return (
		<div className="p-4 lg:p-6">
			<div className="max-w-6xl mx-auto space-y-6">
				{/* Search and Filter */}
				<div className="flex flex-col lg:flex-row gap-4">
					<div className="flex-1">
						<div className="relative">
							<i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 flex items-center justify-center"></i>
							<input
								type="text"
								placeholder="Search products, categories, or locations..."
								value={searchQuery}
								onChange={(e) => handleSearch(e.target.value)}
								className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
							/>
						</div>
					</div>
					<div className="flex gap-2">
						<Button variant="outline" onClick={() => setIsFilterModalOpen(true)} className="whitespace-nowrap">
							<i className="ri-filter-line w-4 h-4 flex items-center justify-center mr-2"></i>
							Filters
						</Button>
						<Button variant="outline" onClick={handleFilterReset} className="whitespace-nowrap">
							<i className="ri-refresh-line w-4 h-4 flex items-center justify-center mr-2"></i>
							Reset
						</Button>
					</div>
				</div>

				{/* Results count */}
				<div className="flex items-center justify-between">
					<p className="text-sm text-gray-600">
						Showing {filteredProducts.length} of {products.length} products
					</p>
					{(searchQuery || selectedCategory) && (
						<p className="text-sm text-gray-500">
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
							<Card className="group hover:shadow-lg transition-shadow h-full cursor-pointer">
								<CardContent className="p-4">
									<div className="aspect-square mb-4 bg-gray-100 rounded-lg overflow-hidden">
										<Image src={product.image} alt={product.name} width={400} height={400} className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300" />
										import Image from 'next/image';
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
											<i className="ri-user-line w-3 h-3 flex items-center justify-center"></i>
											<span className="line-clamp-1">{product.seller}</span>
										</div>

										<div className="flex items-center justify-between pt-2">
											<span className="text-xs text-gray-500">{product.datePosted}</span>
											<div className="flex items-center gap-1 text-xs text-gray-500">
												<i className="ri-eye-line w-3 h-3 flex items-center justify-center"></i>
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
						<i className="ri-search-line w-16 h-16 flex items-center justify-center text-gray-400 mb-4"></i>
						<h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
						<p className="text-gray-500 mb-4">Try adjusting your search terms or filters</p>
						<Button onClick={handleFilterReset} variant="outline" className="whitespace-nowrap">
							Clear filters
						</Button>
					</div>
				)}
			</div>

			<FilterModal isOpen={isFilterModalOpen} onClose={() => setIsFilterModalOpen(false)} onApplyFilters={handleFilterApply} currentFilters={currentFilters} />
		</div>
	);
}
