'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function DashboardSkeleton() {
	return (
		<div className="flex flex-col items-center justify-center min-h-screen">
			<div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid mb-4"></div>
			<span className="text-lg font-medium text-gray-700 dark:text-gray-200">Loading...</span>
		</div>
	);
}

export function ProfileSkeleton() {
	return (
		<div className="flex flex-col items-center justify-center min-h-screen">
			<div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid mb-4"></div>
			<span className="text-lg font-medium text-gray-700 dark:text-gray-200">Loading...</span>
		</div>
	);
}

export function ListingsSkeleton() {
	return (
		<div className="flex flex-col items-center justify-center min-h-screen">
			<div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid mb-4"></div>
			<span className="text-lg font-medium text-gray-700 dark:text-gray-200">Loading...</span>
		</div>
	);
}

export function HistorySkeleton() {
	return (
		<div className="flex flex-col items-center justify-center min-h-screen">
			<div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid mb-4"></div>
			<span className="text-lg font-medium text-gray-700 dark:text-gray-200">Loading...</span>
		</div>
	);
}

export function MarketplaceSkeleton() {
	return (
		<div className="flex flex-col items-center justify-center min-h-screen">
			<div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid mb-4"></div>
			<span className="text-lg font-medium text-gray-700 dark:text-gray-200">Loading...</span>
		</div>
	);
}

export function NetworkSkeleton() {
	return (
		<div className="flex flex-col items-center justify-center min-h-screen">
			<div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid mb-4"></div>
			<span className="text-lg font-medium text-gray-700 dark:text-gray-200">Loading...</span>
		</div>
	);
}

export function ChangePasswordSkeleton() {
	return (
		<div className="flex flex-col items-center justify-center min-h-screen">
			<div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid mb-4"></div>
			<span className="text-lg font-medium text-gray-700 dark:text-gray-200">Loading...</span>
		</div>
	);
}

export function ProvideHelpSkeleton() {
	return (
		<div className="flex flex-col items-center justify-center min-h-screen">
			<div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid mb-4"></div>
			<span className="text-lg font-medium text-gray-700 dark:text-gray-200">Loading...</span>
		</div>
	);
}
