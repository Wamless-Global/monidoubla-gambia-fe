'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { getCurrencyFromLocalStorage } from '@/lib/helpers';

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

interface FilterModalProps {
	isOpen: boolean;
	onClose: () => void;
	onApplyFilters: (filters: FilterState) => void;
	currentFilters: FilterState;
}

export function FilterModal({ isOpen, onClose, onApplyFilters, currentFilters }: FilterModalProps) {
	const [filters, setFilters] = useState<FilterState>(currentFilters);
	const [isMounted, setIsMounted] = useState(false);

	useEffect(() => {
		setIsMounted(true);
		setFilters(currentFilters);
	}, [currentFilters]);

	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = 'unset';
		}

		return () => {
			document.body.style.overflow = 'unset';
		};
	}, [isOpen]);

	const locations = ['Banjul, Gambia', 'Brikama, Gambia', 'Bakau, Gambia', 'Serekunda, Gambia', 'Farafenni, Gambia', 'Lamin, Gambia'];

	const priceRanges = [
		{ id: 'under10k', label: 'Under 10k', count: 50 },
		{ id: '5k-100k', label: '5k - 100k', count: 50 },
		{ id: '100k-200k', label: '100k - 200k', count: 50 },
		{ id: 'over200k', label: 'Over 200k', count: 50 },
	];

	const conditions = [
		{ id: 'new', label: 'New', count: 50 },
		{ id: 'used', label: 'Used', count: 50 },
	];

	const dateOptions = [
		{ id: 'today', label: 'Today', count: 50 },
		{ id: 'week', label: 'This week', count: 50 },
		{ id: 'last7days', label: 'Last 7 days', count: 50 },
		{ id: 'last30days', label: 'Last 30 days', count: 50 },
	];

	const handleLocationChange = (location: string) => {
		setFilters((prev) => ({ ...prev, location }));
	};

	const handlePriceRangeChange = (range: string) => {
		setFilters((prev) => ({ ...prev, priceCategory: range }));
	};

	const handleConditionChange = (condition: string) => {
		setFilters((prev) => ({ ...prev, condition }));
	};

	const handleDateChange = (date: string) => {
		setFilters((prev) => ({ ...prev, datePosted: date }));
	};

	const handleCustomPriceChange = (field: 'min' | 'max', value: string) => {
		setFilters((prev) => ({
			...prev,
			priceRange: {
				...prev.priceRange,
				[field]: value,
			},
		}));
	};

	const clearSelection = (field: keyof FilterState) => {
		if (field === 'priceRange') {
			setFilters((prev) => ({ ...prev, priceRange: { min: '', max: '' } }));
		} else {
			setFilters((prev) => ({ ...prev, [field]: '' }));
		}
	};

	const handleApply = () => {
		onApplyFilters(filters);
		onClose();
	};

	if (!isMounted || !isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 lg:z-40">
			<div className="lg:hidden absolute inset-0 bg-black/50" onClick={onClose} />
			<div className="hidden lg:block absolute inset-0 bg-black/30" onClick={onClose} />

			<div className="relative h-full lg:h-auto lg:max-w-md lg:mx-auto lg:mt-20">
				<div className="bg-white h-full lg:h-auto lg:rounded-lg shadow-xl overflow-hidden">
					<div className="flex items-center justify-between p-4 border-b">
						<h2 className="text-lg font-semibold text-gray-900">Filter</h2>
						<button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
							<i className="ri-close-line w-5 h-5 flex items-center justify-center"></i>
						</button>
					</div>

					<div className="flex-1 overflow-y-auto p-4 space-y-6 lg:max-h-[600px]">
						<div>
							<h3 className="text-sm font-medium text-gray-900 mb-3">Location</h3>
							<div className="relative">
								<button
									className="w-full flex items-center justify-between p-3 border border-gray-300 rounded-lg hover:bg-gray-50"
									onClick={() => {
										handleLocationChange(filters.location || 'Accra');
									}}
								>
									<span className="text-gray-900">{filters.location || 'Accra'}</span>
									<i className="ri-arrow-right-s-line w-4 h-4 flex items-center justify-center text-gray-400"></i>
								</button>
							</div>
						</div>

						<div>
							<h3 className="text-sm font-medium text-gray-900 mb-3">Price - {getCurrencyFromLocalStorage()?.code}</h3>

							<div className="flex gap-2 mb-4">
								<input type="number" placeholder="Min" value={filters.priceRange.min} onChange={(e) => handleCustomPriceChange('min', e.target.value)} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm" />
								<span className="flex items-center text-gray-500">-</span>
								<input type="number" placeholder="Max" value={filters.priceRange.max} onChange={(e) => handleCustomPriceChange('max', e.target.value)} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm" />
							</div>

							<div className="space-y-2">
								{priceRanges.map((range) => (
									<label key={range.id} className="flex items-center gap-3 cursor-pointer">
										<input type="radio" name="priceRange" value={range.id} checked={filters.priceCategory === range.id} onChange={(e) => handlePriceRangeChange(e.target.value)} className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
										<span className="text-sm text-gray-900">{range.label}</span>
										<span className="text-sm text-gray-500">| {range.count} products</span>
									</label>
								))}
							</div>

							<button onClick={() => clearSelection('priceRange')} className="mt-2 text-sm text-blue-600 hover:text-blue-800">
								Clear Selection
							</button>
						</div>

						<div>
							<h3 className="text-sm font-medium text-gray-900 mb-3">Product condition</h3>
							<div className="space-y-2">
								{conditions.map((condition) => (
									<label key={condition.id} className="flex items-center gap-3 cursor-pointer">
										<input type="radio" name="condition" value={condition.id} checked={filters.condition === condition.id} onChange={(e) => handleConditionChange(e.target.value)} className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
										<span className="text-sm text-gray-900">{condition.label}</span>
										<span className="text-sm text-gray-500">| {condition.count} products</span>
									</label>
								))}
							</div>
							<button onClick={() => clearSelection('condition')} className="mt-2 text-sm text-blue-600 hover:text-blue-800">
								Clear Selection
							</button>
						</div>

						<div>
							<h3 className="text-sm font-medium text-gray-900 mb-3">Date posted</h3>
							<div className="space-y-2">
								{dateOptions.map((option) => (
									<label key={option.id} className="flex items-center gap-3 cursor-pointer">
										<input type="radio" name="datePosted" value={option.id} checked={filters.datePosted === option.id} onChange={(e) => handleDateChange(e.target.value)} className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
										<span className="text-sm text-gray-900">{option.label}</span>
										<span className="text-sm text-gray-500">| {option.count} products</span>
									</label>
								))}
							</div>
							<button onClick={() => clearSelection('datePosted')} className="mt-2 text-sm text-blue-600 hover:text-blue-800">
								Clear Selection
							</button>
						</div>
					</div>

					<div className="p-4 border-t">
						<Button onClick={handleApply} className="w-full bg-blue-900 hover:bg-blue-800 text-white">
							Apply filters
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
