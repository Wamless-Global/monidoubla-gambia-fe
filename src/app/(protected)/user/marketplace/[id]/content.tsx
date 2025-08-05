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

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 dark:from-[#181f2e] dark:via-[#232e48] dark:to-[#232e48]">
			<div className="max-w-7xl mx-auto py-10 px-4 lg:px-0">
				{/* Header */}
				<div className="flex items-center gap-4 mb-8">
					<Button
						variant="outline"
						onClick={() => {
							nProgress.start();
							router.push('/user/marketplace');
						}}
						className="p-2 rounded-lg border-blue-200 dark:border-indigo-700 bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-indigo-900/30"
					>
						<i className="ri-arrow-left-line w-5 h-5 flex items-center justify-center"></i>
					</Button>
					<h1 className="text-2xl md:text-3xl font-extrabold text-blue-900 dark:text-white">{product.name}</h1>
				</div>
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
					{/* Product Images */}
					<div className="flex flex-col gap-6">
						<div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden shadow-lg">
							{product.images && product.images.length > 0 && <Image width={600} height={600} src={product.images[selectedImageIndex]} alt={product.name} className="w-full h-full object-cover object-center" />}
						</div>
						{product.images && product.images.length > 1 && (
							<div className="flex gap-3">
								{product.images.map((image, index) => (
									<button key={index} onClick={() => setSelectedImageIndex(index)} className={`aspect-square w-20 h-20 rounded-xl overflow-hidden border-2 transition-colors ${selectedImageIndex === index ? 'border-blue-900' : 'border-transparent hover:border-blue-300'}`}>
										<Image width={80} height={80} src={image} alt={`${product.name} view ${index + 1}`} className="w-full h-full object-cover object-center" />
									</button>
								))}
							</div>
						)}
					</div>
					{/* Product Details */}
					<div className="flex flex-col gap-8">
						<div>
							<div className="flex items-center gap-3 mb-2">
								<span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 dark:bg-indigo-900/30 text-blue-700 dark:text-indigo-200 text-xs font-semibold">
									<i className="ri-price-tag-3-line"></i>
									{product.category}
								</span>
								{product.location && (
									<span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 dark:bg-indigo-900/30 text-blue-700 dark:text-indigo-200 text-xs font-semibold">
										<i className="ri-map-pin-line"></i>
										{product.location}
									</span>
								)}
							</div>
							<div className="text-4xl font-black text-blue-900 dark:text-white mb-4">
								{product.price} {getSettings()?.baseCurrency ? getSettings()?.baseCurrency : getCurrencyFromLocalStorage()?.code}
							</div>
							<p className="text-lg text-blue-900/80 dark:text-indigo-100 mb-4">{product.description}</p>
						</div>
						{/* Vendor Card */}
						{(product.vendor?.name || product.vendor?.avatar) && (
							<Card className="bg-white dark:bg-gray-900 border-0 shadow-lg rounded-xl">
								<CardContent className="p-5 flex items-center gap-4">
									{product.vendor.avatar && <Image width={56} height={56} src={product.vendor.avatar} alt={product.vendor.name} className="w-14 h-14 rounded-full object-cover border border-blue-100 dark:border-indigo-900/30" />}
									<div>
										<div className="font-bold text-blue-900 dark:text-white">{product.vendor.name}</div>
										<div className="flex items-center gap-2 text-sm text-blue-700 dark:text-indigo-200">
											{product.vendor.rating ? (
												<>
													<i className="ri-star-fill text-yellow-500"></i>
													<span>{product.vendor.rating}</span>
												</>
											) : null}
											{product.vendor.rating && product.vendor.totalSales ? <span>•</span> : null}
											{product.vendor.totalSales ? <span>{product.vendor.totalSales} sales</span> : null}
										</div>
									</div>
								</CardContent>
							</Card>
						)}
						{/* Seller Contact Info */}
						{product.contactInfo && (
							<Card className="bg-white dark:bg-gray-900 border-0 shadow-lg rounded-xl">
								<CardContent className="p-5">
									<h3 className="font-semibold text-blue-900 dark:text-white mb-3">Contact Seller</h3>
									<div className="flex flex-col gap-2">
										{product.contactInfo.phone && (
											<div className="flex items-center gap-2 text-blue-900 dark:text-indigo-100">
												<i className="ri-phone-line"></i>
												<span>{product.contactInfo.phone}</span>
											</div>
										)}
										{product.contactInfo.email && (
											<div className="flex items-center gap-2 text-blue-900 dark:text-indigo-100">
												<i className="ri-mail-line"></i>
												<span>{product.contactInfo.email}</span>
											</div>
										)}
									</div>
								</CardContent>
							</Card>
						)}
						{/* Specifications */}
						{product.specifications && Object.keys(product.specifications).length > 0 && (
							<Card className="bg-white dark:bg-gray-900 border-0 shadow-lg rounded-xl">
								<CardContent className="p-5">
									<h3 className="font-semibold text-blue-900 dark:text-white mb-3">Specifications</h3>
									<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
										{Object.entries(product.specifications).map(([key, value]) => (
											<div key={key} className="flex justify-between border-b border-blue-50 dark:border-indigo-900/30 py-1 last:border-b-0">
												<span className="text-blue-900/80 dark:text-indigo-100">{key}:</span>
												<span className="font-medium text-blue-900 dark:text-white">{value}</span>
											</div>
										))}
									</div>
								</CardContent>
							</Card>
						)}
					</div>
				</div>
				{/* Full Description */}
				{product.fullDescription && (
					<div className="mt-14">
						<Card className="bg-white dark:bg-gray-900 border-0 shadow-lg rounded-xl">
							<CardContent className="p-8">
								<h2 className="text-2xl font-bold text-blue-900 dark:text-white mb-4">Description</h2>
								<p className="text-blue-900/80 dark:text-indigo-100 leading-relaxed">{product.fullDescription}</p>
							</CardContent>
						</Card>
					</div>
				)}
			</div>
		</div>
	);
}
