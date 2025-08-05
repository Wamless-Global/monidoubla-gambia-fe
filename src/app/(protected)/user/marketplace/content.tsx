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
		<div className="p-0 lg:p-0 min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 dark:from-[#181f2e] dark:via-[#232e48] dark:to-[#232e48]">
			<div className="max-w-7xl mx-auto py-10 px-4 lg:px-0">
				{/* Marketplace Header */}
				<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
					<div>
						<h1 className="text-3xl font-extrabold text-blue-900 dark:text-white mb-2 tracking-tight">Marketplace</h1>
						<p className="text-base text-blue-800 dark:text-indigo-200">Find, buy, and sell products in your community.</p>
					</div>
					<div className="flex gap-2">
						<Button variant="outline" onClick={() => setIsFilterModalOpen(true)} className="flex items-center gap-2 border-blue-200 dark:border-indigo-700 bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-indigo-900/30">
							<i className="ri-filter-line w-5 h-5"></i>
							Filters
						</Button>
						<Button variant="outline" onClick={handleFilterReset} className="flex items-center gap-2 border-blue-200 dark:border-indigo-700 bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-indigo-900/30">
							<i className="ri-refresh-line w-5 h-5"></i>
							Reset
						</Button>
					</div>
				</div>

				{/* Search Bar */}
				<div className="flex flex-col md:flex-row gap-4 mb-8">
					<div className="flex-1">
						<div className="relative">
							<input
								type="text"
								placeholder="Search for anything (products, categories, locations)..."
								value={searchQuery}
								onChange={(e) => handleSearch(e.target.value)}
								className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-blue-200 dark:border-indigo-700 bg-white dark:bg-gray-800 text-blue-900 dark:text-white text-lg font-medium shadow focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
							/>
							<i className="ri-search-line absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-400 dark:text-indigo-300 w-6 h-6"></i>
						</div>
					</div>
					<div className="flex items-center gap-4">
						<select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="rounded-xl border-2 border-blue-200 dark:border-indigo-700 bg-white dark:bg-gray-800 text-blue-900 dark:text-white px-4 py-2 text-base font-medium shadow">
							<option value="newest">Newest</option>
							<option value="price-low">Price: Low to High</option>
							<option value="price-high">Price: High to Low</option>
							<option value="popular">Most Viewed</option>
						</select>
					</div>
				</div>

				{/* Results count and active filters */}
				<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-6">
					<div className="text-blue-900 dark:text-indigo-100 text-sm font-semibold">
						Showing <span className="font-bold">{filteredProducts.length}</span> of <span className="font-bold">{products.length}</span> products
					</div>
					{(searchQuery || selectedCategory) && (
						<div className="flex flex-wrap gap-2">
							{searchQuery && <span className="bg-blue-100 dark:bg-indigo-900/30 text-blue-700 dark:text-indigo-200 px-3 py-1 rounded-full text-xs font-semibold">Search: "{searchQuery}"</span>}
							{selectedCategory && <span className="bg-blue-100 dark:bg-indigo-900/30 text-blue-700 dark:text-indigo-200 px-3 py-1 rounded-full text-xs font-semibold">Category: {selectedCategory}</span>}
						</div>
					)}
				</div>

				{/* Products Masonry Grid */}
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8">
					{filteredProducts.map((product) => (
						<CustomLink key={product.id} href={`/user/marketplace/${product.id}`}>
							<Card className="group h-full border-0 shadow-xl rounded-2xl bg-white dark:bg-gray-900 hover:scale-[1.025] hover:shadow-2xl transition-transform duration-300 cursor-pointer flex flex-col">
								<div className="relative aspect-square rounded-t-2xl overflow-hidden">
									<Image src={product.image} alt={product.name} width={400} height={400} className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-300" />
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
											<i className="ri-user-line"></i>
											{product.seller}
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
								</CardContent>
							</Card>
						</CustomLink>
					))}
				</div>

				{/* No results */}
				{filteredProducts.length === 0 && !isLoading && (
					<div className="flex flex-col items-center justify-center py-24 text-center">
						<i className="ri-search-line w-20 h-20 flex items-center justify-center text-blue-200 dark:text-indigo-700 mb-6"></i>
						<h3 className="text-2xl font-bold text-blue-900 dark:text-white mb-2">No products found</h3>
						<p className="text-blue-700 dark:text-indigo-200 mb-4">Try adjusting your search terms or filters.</p>
						<Button onClick={handleFilterReset} variant="outline" className="whitespace-nowrap">
							Clear filters
						</Button>
					</div>
				)}

				<FilterModal isOpen={isFilterModalOpen} onClose={() => setIsFilterModalOpen(false)} onApplyFilters={handleFilterApply} currentFilters={currentFilters} />
			</div>
		</div>
	);
}
