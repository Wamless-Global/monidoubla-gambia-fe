'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'; // Correction: CardFooter added
import { logger } from '@/lib/logger';
import nProgress from 'nprogress';
import Image from 'next/image';
import { getCurrencyFromLocalStorage, handleFetchMessage, getSettings } from '@/lib/helpers';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// NOTE: All original interfaces and logic are preserved.
interface Product {
	id: string;
	name: string;
	price: number;
	images: string[];
	description: string;
	fullDescription: string;
	location: string;
	category: string;
	specifications: { [key: string]: string };
	contactInfo: { [key: string]: string };
	vendor: {
		name: string;
		avatar: string;
		rating: number;
		totalSales: number;
	};
}

interface ProductDetailProps {
	productId: string;
}

export default function ProductDetail({ productId }: ProductDetailProps) {
	const [selectedImageIndex, setSelectedImageIndex] = useState(0);
	const [product, setProduct] = useState<Product | null>(null);
	const [loading, setLoading] = useState(true);
	const [quantity, setQuantity] = useState(1); // Logic preserved, though UI is removed
	const [activeTab, setActiveTab] = useState('description');
	const router = useRouter();

	useEffect(() => {
		const fetchProduct = async () => {
			setLoading(true);
			try {
				const res = await fetchWithAuth(`/api/marketplace/${productId}`);
				if (!res.ok) throw new Error(handleFetchMessage(await res.json(), `Failed to fetch product`));
				const data = await res.json();
				const item = data?.data || data;
				const images = typeof item.Images === 'string' ? JSON.parse(item.Images) : item.Images || [];
				setProduct({
					id: item.id,
					name: item.name,
					price: item.price,
					contactInfo: JSON.parse(item.contactDetails),
					images: images,
					description: item.description,
					fullDescription: item.fullDescription || item.description || '',
					location: item.location,
					category: item.category,
					specifications: item.specifications || {},
					vendor: {
						name: item.seller || item.user?.name || '',
						avatar: item.user?.avatar || '',
						rating: item.user?.rating || 0,
						totalSales: item.user?.totalSales || 0,
					},
				});
			} catch (error) {
				setProduct(null);
			} finally {
				setLoading(false);
			}
		};
		fetchProduct();
	}, [productId]);

	const handleQuantityChange = (change: number) => {
		const newQuantity = quantity + change;
		if (newQuantity >= 1) setQuantity(newQuantity);
	};
	const handleBuyNow = () => logger.log('Buy now clicked for product:', productId, 'quantity:', quantity);
	const handleAddToCart = () => logger.log('Add to cart clicked for product:', productId, 'quantity:', quantity);
	const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: getSettings()?.baseCurrency || getCurrencyFromLocalStorage()?.code || 'USD', minimumFractionDigits: 2 }).format(amount);

	const handleCopy = (text: string, type: string) => {
		navigator.clipboard.writeText(text);
		toast.success(`${type} copied to clipboard!`);
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen bg-gray-50">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
			</div>
		);
	}

	if (!product) {
		return (
			<div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
				<Card className="max-w-md w-full text-center p-8">
					<div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
						<i className="ri-error-warning-line text-3xl text-red-600"></i>
					</div>
					<h2 className="text-xl font-semibold text-gray-900 mb-2">Product Not Found</h2>
					<p className="text-gray-600 mb-6">The product you're looking for doesn't exist or has been removed.</p>
					<Button onClick={() => router.push('/user/marketplace')}>Back to Marketplace</Button>
				</Card>
			</div>
		);
	}

	return (
		<div className="bg-gray-50 min-h-screen">
			<div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
				<div className="mb-6">
					<button onClick={() => router.push('/user/marketplace')} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 font-medium">
						<i className="ri-arrow-left-s-line text-base"></i>
						Back to Marketplace
					</button>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
					<div className="lg:col-span-2 space-y-8">
						<div className="grid grid-cols-1 gap-4">
							<div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200">{product.images.length > 0 && <Image priority width={800} height={800} src={product.images[selectedImageIndex]} alt={product.name} className="w-full h-full object-cover" />}</div>
							{product.images.length > 1 && (
								<div className="grid grid-cols-5 gap-3">
									{product.images.map((image, index) => (
										<button
											key={index}
											onClick={() => setSelectedImageIndex(index)}
											className={cn('aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 transition-all', selectedImageIndex === index ? 'border-teal-500 ring-2 ring-teal-500/50' : 'border-transparent hover:border-gray-300')}
										>
											<Image width={150} height={150} src={image} alt={`${product.name} view ${index + 1}`} className="w-full h-full object-cover" />
										</button>
									))}
								</div>
							)}
						</div>

						<Card>
							<CardHeader className="border-b p-0">
								<div className="flex">
									<button onClick={() => setActiveTab('description')} className={cn('px-6 py-4 font-semibold text-sm', activeTab === 'description' ? 'border-b-2 border-teal-500 text-teal-600' : 'text-gray-500 hover:text-gray-800')}>
										Description
									</button>
									<button onClick={() => setActiveTab('specifications')} className={cn('px-6 py-4 font-semibold text-sm', activeTab === 'specifications' ? 'border-b-2 border-teal-500 text-teal-600' : 'text-gray-500 hover:text-gray-800')}>
										Specifications
									</button>
								</div>
							</CardHeader>
							<CardContent className="p-6">
								{activeTab === 'description' && (
									<div className="prose prose-sm max-w-none text-gray-600">
										<p>{product.fullDescription}</p>
									</div>
								)}
								{activeTab === 'specifications' && (
									<div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
										{Object.entries(product.specifications).map(([key, value]) => (
											<div key={key} className="flex justify-between py-2 border-b border-gray-100">
												<span className="text-sm text-gray-500">{key}:</span>
												<span className="text-sm font-medium text-gray-800">{value}</span>
											</div>
										))}
									</div>
								)}
							</CardContent>
						</Card>
					</div>

					<div className="lg:col-span-1">
						<div className="sticky top-24 space-y-6">
							<div className="space-y-2">
								<p className="text-sm text-gray-500">{product.category}</p>
								<h1 className="text-3xl font-bold text-gray-800">{product.name}</h1>
								<div className="flex items-center gap-2 text-sm text-gray-500">
									<i className="ri-map-pin-line text-base"></i>
									<span>{product.location}</span>
								</div>
							</div>
							<Card>
								<CardHeader>
									<CardTitle>Seller Information</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="flex items-center gap-3">
										<Image width={48} height={48} src={product.vendor.avatar || '/default-avatar.png'} alt={product.vendor.name} className="w-12 h-12 rounded-full object-cover" />
										<div>
											<p className="font-semibold text-gray-800">{product.vendor.name}</p>
											<p className="text-xs text-gray-500">{product.vendor.totalSales} items sold</p>
										</div>
									</div>
									<div className="space-y-3 pt-4 border-t">
										<div>
											<p className="text-xs text-gray-500">Phone Number</p>
											<div className="flex items-center justify-between gap-2">
												<p className="font-medium text-gray-800">{product.contactInfo.phone}</p>
												<Button variant="ghost" size="sm" onClick={() => handleCopy(product.contactInfo.phone, 'Phone number')}>
													Copy
												</Button>
											</div>
										</div>
										<div>
											<p className="text-xs text-gray-500">Email Address</p>
											<div className="flex items-center justify-between gap-2">
												<p className="font-medium text-gray-800 truncate">{product.contactInfo.email}</p>
												<Button variant="ghost" size="sm" onClick={() => handleCopy(product.contactInfo.email, 'Email')}>
													Copy
												</Button>
											</div>
										</div>
									</div>
								</CardContent>
								<CardFooter>
									<a href={`tel:${product.contactInfo.phone}`} className="w-full">
										<Button asChild size="lg" className="w-full">
											<i className="ri-phone-line mr-2"></i>Call Seller
										</Button>
									</a>
								</CardFooter>
							</Card>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
