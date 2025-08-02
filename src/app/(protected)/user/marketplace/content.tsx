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
				const res = await fetchWithAuth('/api/marketplace');
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
		return <MarketplaceSkeleton />;
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-emerald-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 py-0 px-0">
			<div className="max-w-6xl mx-auto py-10 px-4 space-y-10">
				{/* Search and Filter */}
				<div className="flex flex-col md:flex-row gap-6 md:items-center md:justify-between mb-6">
					<div className="flex-1 flex flex-col gap-2">
						<h1 className="text-3xl md:text-4xl font-extrabold text-indigo-900 dark:text-indigo-100 drop-shadow-lg mb-1">Marketplace</h1>
						<p className="text-lg text-indigo-700 dark:text-indigo-200 font-medium">Discover, buy, and sell products in your community</p>
					</div>
					<div className="flex flex-col md:flex-row gap-3 md:items-center">
						<div className="relative flex-1 md:w-72">
							<i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-400 w-5 h-5 flex items-center justify-center"></i>
							<input
								type="text"
								placeholder="Search products, categories, or locations..."
								value={searchQuery}
								onChange={(e) => handleSearch(e.target.value)}
								className="w-full pl-10 pr-4 py-2.5 border-2 border-indigo-100 dark:border-indigo-900 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 text-base bg-white/80 dark:bg-gray-900/80 text-indigo-900 dark:text-indigo-100 shadow"
							/>
						</div>
						<Button variant="outline" onClick={() => setIsFilterModalOpen(true)} className="whitespace-nowrap border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-100 font-bold rounded-xl px-6 py-2 shadow-lg">
							<i className="ri-filter-line w-5 h-5 flex items-center justify-center mr-2"></i>
							Filters
						</Button>
						<Button variant="outline" onClick={handleFilterReset} className="whitespace-nowrap border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-100 font-bold rounded-xl px-6 py-2 shadow-lg">
							<i className="ri-refresh-line w-5 h-5 flex items-center justify-center mr-2"></i>
							Reset
						</Button>
					</div>
				</div>

				{/* Results count */}
				<div className="flex items-center justify-between mb-4">
					<p className="text-base text-indigo-700 dark:text-indigo-200 font-semibold">
						Showing {filteredProducts.length} of {products.length} products
					</p>
					{(searchQuery || selectedCategory) && (
						<p className="text-base text-indigo-400 dark:text-indigo-200">
							{searchQuery && `Search: "${searchQuery}"`}
							{searchQuery && selectedCategory && ' • '}
							{selectedCategory && `Category: ${selectedCategory}`}
						</p>
					)}
				</div>

				{/* Products Grid */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
					{filteredProducts.map((product) => (
						<CustomLink key={product.id} href={`/user/marketplace/${product.id}`}>
							<Card className="rounded-3xl shadow-2xl bg-white/90 dark:bg-gray-900/90 border-2 border-indigo-100 dark:border-indigo-900 h-full group hover:scale-105 hover:shadow-2xl transition-all duration-300 cursor-pointer">
								<CardContent className="p-4">
									<div className="aspect-square mb-4 bg-gradient-to-tr from-indigo-100 via-purple-100 to-emerald-100 dark:from-indigo-900 dark:via-purple-900 dark:to-emerald-900 rounded-2xl overflow-hidden flex items-center justify-center">
										<Image src={product.image} alt={product.name} width={400} height={400} className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-300" />
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
											<i className="ri-user-line w-4 h-4 flex items-center justify-center"></i>
											<span className="line-clamp-1">{product.seller}</span>
										</div>
										<div className="flex items-center justify-between pt-2">
											<span className="text-xs text-indigo-400 dark:text-indigo-200">{product.datePosted}</span>
											<div className="flex items-center gap-1 text-xs text-indigo-400 dark:text-indigo-200">
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
					<div className="flex flex-col items-center justify-center py-24 text-center">
						<i className="ri-search-line w-20 h-20 flex items-center justify-center text-indigo-200 dark:text-indigo-900 mb-6"></i>
						<h3 className="text-2xl font-bold text-indigo-900 dark:text-indigo-100 mb-2">No products found</h3>
						<p className="text-indigo-700 dark:text-indigo-200 mb-6 text-lg">Try adjusting your search terms or filters</p>
						<Button onClick={handleFilterReset} variant="outline" className="whitespace-nowrap border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-100 font-bold rounded-xl px-6 py-2 shadow-lg">
							Clear filters
						</Button>
					</div>
				)}

				<FilterModal isOpen={isFilterModalOpen} onClose={() => setIsFilterModalOpen(false)} onApplyFilters={handleFilterApply} currentFilters={currentFilters} />
			</div>
		</div>
	);
}
