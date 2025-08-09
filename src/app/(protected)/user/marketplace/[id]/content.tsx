'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { logger } from '@/lib/logger';
import nProgress from 'nprogress';
import Image from 'next/image';
import { getCurrencyFromLocalStorage, handleFetchMessage, getSettings } from '@/lib/helpers';
import { fetchWithAuth } from '@/lib/fetchWithAuth';

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
	const [quantity, setQuantity] = useState(1);
	const router = useRouter();

	useEffect(() => {
		const fetchProduct = async () => {
			setLoading(true);
			try {
				const res = await fetchWithAuth(`/api/marketplace/${productId}`);
				if (!res.ok) throw new Error(handleFetchMessage(await res.json(), `Failed to fetch product`));
				const data = await res.json();
				// Map API fields to Product interface
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
				logger.log(product);
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
		if (newQuantity >= 1) {
			setQuantity(newQuantity);
		}
	};

	const handleBuyNow = () => {
		// Handle buy now action
		logger.log('Buy now clicked for product:', productId, 'quantity:', quantity);
	};

	const handleAddToCart = () => {
		// Handle add to cart action
		logger.log('Add to cart clicked for product:', productId, 'quantity:', quantity);
	};

	if (loading) {
		return (
			<div className="flex h-screen bg-gray-50">
				{/* Loading Content */}
				<div className="flex-1 flex items-center justify-center">
					<div className="text-center">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto mb-4"></div>
						<p className="text-gray-600">Loading product details...</p>
					</div>
				</div>
			</div>
		);
	}

	if (!product) {
		return (
			<div className="flex h-screen bg-gray-50">
				<div className="flex-1 flex items-center justify-center">
					<div className="text-center">
						<i className="ri-error-warning-line w-16 h-16 flex items-center justify-center text-red-500 mx-auto mb-4"></i>
						<h2 className="text-xl font-semibold text-gray-900 mb-2">Product Not Found</h2>
						<p className="text-gray-600 mb-4">The product you're looking for doesn't exist.</p>
						<Button
							onClick={() => {
								nProgress.start();
								router.push('/user/marketplace');
							}}
							className="bg-blue-900 hover:bg-blue-800"
						>
							Back to Marketplace
						</Button>
					</div>
				</div>
			</div>
		);
	}
	logger.log(product);
	return (
		<div className="flex min-h-screen bg-gray-50">
			<div className="flex-1 flex flex-col min-w-0">
				<header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4">
					<div className="flex items-center gap-4">
						<button
							onClick={() => {
								nProgress.start();
								router.push('/user/marketplace');
							}}
							className="p-2 hover:bg-gray-100 rounded-lg"
						>
							<i className="ri-arrow-left-line w-5 h-5 flex items-center justify-center"></i>
						</button>
						<h1 className="text-xl lg:text-2xl font-bold text-gray-900">{product.name}</h1>
					</div>
				</header>
				<main className="flex-1 overflow-auto">
					<div className="p-4 lg:p-6">
						<div className="max-w-7xl mx-auto">
							<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
								{/* Product Images */}
								<div className="space-y-4">
									<div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
										{product.images && product.images.length > 0 && <Image width={400} height={400} src={product.images[selectedImageIndex]} alt={product.name} className="w-full h-full object-cover object-top" />}
									</div>
									{product.images && product.images.length > 1 && (
										<div className="grid grid-cols-4 gap-2">
											{product.images.map((image, index) => (
												<button
													key={index}
													onClick={() => setSelectedImageIndex(index)}
													className={`aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 transition-colors ${selectedImageIndex === index ? 'border-blue-900' : 'border-transparent hover:border-gray-300'}`}
												>
													<Image width={400} height={400} src={image} alt={`${product.name} view ${index + 1}`} className="w-full h-full object-cover object-top" />
												</button>
											))}
										</div>
									)}
								</div>
								{/* Product Details */}
								<div className="space-y-6">
									<div>
										<h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
										{product.location && (
											<div className="flex items-center gap-2 mb-4">
												<i className="ri-map-pin-line w-4 h-4 flex items-center justify-center text-gray-500"></i>
												<span className="text-gray-600">{product.location}</span>
											</div>
										)}
										<div className="text-4xl font-bold text-blue-900 mb-4">
											{product.price} {getSettings()?.baseCurrency ? getSettings()?.baseCurrency : getCurrencyFromLocalStorage()?.code}
										</div>
										{product.description && <p className="text-gray-600 mb-4">{product.description}</p>}
									</div>
									{/* Vendor Details */}
									{(product.vendor?.name || product.vendor?.avatar) && (
										<Card>
											<CardContent className="p-4">
												<h3 className="font-semibold text-gray-900 mb-3">Vendor details</h3>
												<div className="flex items-center gap-3 mb-3">
													{product.vendor.avatar && <Image width={400} height={400} src={product.vendor.avatar} alt={product.vendor.name} className="w-12 h-12 rounded-full object-cover" />}
													<div>
														<div className="font-medium text-gray-900">{product.vendor.name}</div>
														{(product.vendor.rating || product.vendor.totalSales) && (
															<div className="flex items-center gap-1 text-sm text-gray-600">
																{product.vendor.rating ? (
																	<>
																		<i className="ri-star-fill w-4 h-4 flex items-center justify-center text-yellow-500"></i>
																		<span>{product.vendor.rating}</span>
																	</>
																) : null}
																{product.vendor.rating && product.vendor.totalSales ? <span>•</span> : null}
																{product.vendor.totalSales ? <span>{product.vendor.totalSales} sales</span> : null}
															</div>
														)}
													</div>
												</div>
												{product.fullDescription && <p className="text-sm text-gray-600">{product.fullDescription}</p>}
											</CardContent>
										</Card>
									)}
									{/* Specifications */}
									{product.specifications && Object.keys(product.specifications).length > 0 && (
										<Card>
											<CardContent className="p-4">
												<h3 className="font-semibold text-gray-900 mb-3">Specifications</h3>
												<div className="space-y-2">
													{Object.entries(product.specifications).map(([key, value]) => (
														<div key={key} className="flex justify-between py-1 border-b border-gray-100 last:border-b-0">
															<span className="text-gray-600">{key}:</span>
															<span className="font-medium text-gray-900">{value}</span>
														</div>
													))}
												</div>
											</CardContent>
										</Card>
									)}
									{/* Buyer Information */}
									{product && product.vendor && (
										<Card>
											<CardContent className="p-4">
												<h3 className="font-semibold text-gray-900 mb-3">Seller Information</h3>
												<div className="flex items-center gap-3 mb-3">
													{product.vendor.avatar && <Image width={400} height={400} src={product.vendor.avatar} alt={product.vendor.name} className="w-12 h-12 rounded-full object-cover" />}
													<div>
														{
															<>
																<div className="flex items-center gap-2">
																	<i className="ri-phone-line w-4 h-4 flex items-center justify-center text-gray-500"></i>
																	<span className="text-gray-900 dark:text-white">{product.contactInfo.phone}</span>
																</div>
																<div className="flex items-center gap-2">
																	<i className="ri-mail-line w-4 h-4 flex items-center justify-center text-gray-500"></i>
																	<span className="text-gray-900 dark:text-white">{product.contactInfo.email}</span>
																</div>
															</>
														}
													</div>
												</div>
											</CardContent>
										</Card>
									)}
								</div>
							</div>
							{/* Description Section */}
							{product.fullDescription && (
								<div className="mt-12">
									<Card>
										<CardContent className="p-6">
											<h2 className="text-2xl font-bold text-gray-900 mb-4">Description</h2>
											<p className="text-gray-600 leading-relaxed">{product.fullDescription}</p>
										</CardContent>
									</Card>
								</div>
							)}
						</div>
					</div>
				</main>
			</div>
		</div>
	);
}
