'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { logger } from '@/lib/logger';
import nProgress from 'nprogress';
import Image from 'next/image';
import { getCurrencyFromLocalStorage } from '@/lib/helpers';

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
				const res = await fetch(`/api/marketplace/${productId}`);
				if (!res.ok) throw new Error('Failed to fetch product');
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
			<div className="flex h-screen min-h-screen bg-gradient-to-br from-white/80 to-blue-50/40 dark:from-blue-900/30 dark:to-blue-950/10">
				<div className="flex-1 flex items-center justify-center">
					<div className="text-center">
						<div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 shadow-xl bg-white/60 mx-auto mb-6"></div>
						<p className="text-blue-600 text-lg font-semibold">Loading product details...</p>
					</div>
				</div>
			</div>
		);
	}

	if (!product) {
		return (
			<div className="flex h-screen min-h-screen bg-gradient-to-br from-white/80 to-red-50/40 dark:from-red-900/30 dark:to-red-950/10">
				<div className="flex-1 flex items-center justify-center">
					<div className="text-center">
						<i className="ri-error-warning-line w-20 h-20 flex items-center justify-center text-red-500 mx-auto mb-6"></i>
						<h2 className="text-3xl font-extrabold text-foreground mb-2">Product Not Found</h2>
						<p className="text-muted-foreground text-lg mb-6">The product you're looking for doesn't exist.</p>
						<Button
							onClick={() => {
								nProgress.start();
								router.push('/user/marketplace');
							}}
							className="bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white py-3 rounded-xl shadow-lg text-lg font-semibold"
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
		<div className="flex min-h-screen bg-gradient-to-br from-white/80 to-blue-50/40 dark:from-blue-900/30 dark:to-blue-950/10">
			<div className="flex-1 flex flex-col min-w-0">
				<header className="bg-gradient-to-r from-white/80 to-blue-50/40 dark:from-blue-900/20 dark:to-blue-950/5 border-0 px-6 py-6 shadow rounded-b-2xl">
					<div className="flex items-center gap-4">
						<button
							onClick={() => {
								nProgress.start();
								router.push('/user/marketplace');
							}}
							className="p-3 hover:bg-blue-100/60 dark:hover:bg-blue-900/20 rounded-xl transition-colors shadow"
						>
							<i className="ri-arrow-left-line w-6 h-6 flex items-center justify-center text-blue-400"></i>
						</button>
						<h1 className="text-3xl font-extrabold text-foreground tracking-tight">{product.name}</h1>
					</div>
				</header>
				<main className="flex-1 overflow-auto">
					<div className="p-6">
						<div className="max-w-7xl mx-auto">
							<div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
								{/* Product Images */}
								<div className="space-y-6">
									<div className="aspect-square bg-gradient-to-br from-blue-100/60 to-white/40 dark:from-blue-900/20 dark:to-blue-950/5 rounded-2xl overflow-hidden shadow-xl">
										{product.images && product.images.length > 0 && <Image width={400} height={400} src={product.images[selectedImageIndex]} alt={product.name} className="w-full h-full object-cover object-top" />}
									</div>
									{product.images && product.images.length > 1 && (
										<div className="grid grid-cols-4 gap-3">
											{product.images.map((image, index) => (
												<button
													key={index}
													onClick={() => setSelectedImageIndex(index)}
													className={`aspect-square bg-gradient-to-br from-blue-100/60 to-white/40 dark:from-blue-900/20 dark:to-blue-950/5 rounded-xl overflow-hidden border-2 transition-colors shadow ${
														selectedImageIndex === index ? 'border-blue-600' : 'border-transparent hover:border-blue-300'
													}`}
												>
													<Image width={400} height={400} src={image} alt={`${product.name} view ${index + 1}`} className="w-full h-full object-cover object-top" />
												</button>
											))}
										</div>
									)}
								</div>
								{/* Product Details */}
								<div className="space-y-8">
									<div>
										<h1 className="text-4xl font-extrabold text-foreground mb-3">{product.name}</h1>
										{product.location && (
											<div className="flex items-center gap-2 mb-4">
												<i className="ri-map-pin-line w-5 h-5 flex items-center justify-center text-blue-400"></i>
												<span className="text-blue-600 font-semibold">{product.location}</span>
											</div>
										)}
										<div className="text-5xl font-extrabold text-blue-700 mb-6">
											{product.price} {getCurrencyFromLocalStorage()?.code}
										</div>
										{product.description && <p className="text-blue-900/80 text-lg mb-6">{product.description}</p>}
									</div>
									{/* Vendor Details */}
									{(product.vendor?.name || product.vendor?.avatar) && (
										<Card className="border-0 shadow-2xl rounded-2xl bg-gradient-to-br from-white/80 to-green-50/40 dark:from-green-900/30 dark:to-green-950/10">
											<CardContent className="p-6">
												<h3 className="font-bold text-lg text-foreground mb-4">Vendor details</h3>
												<div className="flex items-center gap-4 mb-4">
													{product.vendor.avatar && <Image width={400} height={400} src={product.vendor.avatar} alt={product.vendor.name} className="w-14 h-14 rounded-full object-cover shadow" />}
													<div>
														<div className="font-bold text-lg text-foreground">{product.vendor.name}</div>
														{(product.vendor.rating || product.vendor.totalSales) && (
															<div className="flex items-center gap-2 text-base text-blue-400">
																{product.vendor.rating ? (
																	<>
																		<i className="ri-star-fill w-5 h-5 flex items-center justify-center text-yellow-400"></i>
																		<span>{product.vendor.rating}</span>
																	</>
																) : null}
																{product.vendor.rating && product.vendor.totalSales ? <span>•</span> : null}
																{product.vendor.totalSales ? <span>{product.vendor.totalSales} sales</span> : null}
															</div>
														)}
													</div>
												</div>
												{product.fullDescription && <p className="text-base text-muted-foreground">{product.fullDescription}</p>}
											</CardContent>
										</Card>
									)}
									{/* Specifications */}
									{product.specifications && Object.keys(product.specifications).length > 0 && (
										<Card className="border-0 shadow-2xl rounded-2xl bg-gradient-to-br from-white/80 to-blue-50/40 dark:from-blue-900/30 dark:to-blue-950/10">
											<CardContent className="p-6">
												<h3 className="font-bold text-lg text-foreground mb-4">Specifications</h3>
												<div className="space-y-2">
													{Object.entries(product.specifications).map(([key, value]) => (
														<div key={key} className="flex justify-between py-2 border-b border-blue-100 dark:border-blue-900/20 last:border-b-0">
															<span className="text-blue-400 font-semibold">{key}:</span>
															<span className="font-bold text-foreground">{value}</span>
														</div>
													))}
												</div>
											</CardContent>
										</Card>
									)}
									{/* Buyer Information */}
									{product && product.vendor && (
										<Card className="border-0 shadow-2xl rounded-2xl bg-gradient-to-br from-white/80 to-blue-50/40 dark:from-blue-900/30 dark:to-blue-950/10">
											<CardContent className="p-6">
												<h3 className="font-bold text-lg text-foreground mb-4">Seller Information</h3>
												<div className="flex items-center gap-4 mb-4">
													{product.vendor.avatar && <Image width={400} height={400} src={product.vendor.avatar} alt={product.vendor.name} className="w-14 h-14 rounded-full object-cover shadow" />}
													<div>
														<div className="flex items-center gap-3 mb-2">
															<i className="ri-phone-line w-5 h-5 flex items-center justify-center text-blue-400"></i>
															<span className="text-foreground font-semibold">{product.contactInfo.phone}</span>
														</div>
														<div className="flex items-center gap-3">
															<i className="ri-mail-line w-5 h-5 flex items-center justify-center text-blue-400"></i>
															<span className="text-foreground font-semibold">{product.contactInfo.email}</span>
														</div>
													</div>
												</div>
											</CardContent>
										</Card>
									)}
								</div>
							</div>
							{/* Description Section */}
							{product.fullDescription && (
								<div className="mt-16">
									<Card className="border-0 shadow-2xl rounded-2xl bg-gradient-to-br from-white/80 to-blue-50/40 dark:from-blue-900/30 dark:to-blue-950/10">
										<CardContent className="p-8">
											<h2 className="text-2xl font-bold text-foreground mb-4">Description</h2>
											<p className="text-lg text-muted-foreground leading-relaxed">{product.fullDescription}</p>
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
