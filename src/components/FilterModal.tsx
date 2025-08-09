'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { getCurrencyFromLocalStorage } from '@/lib/helpers';
import { cn } from '@/lib/utils';

// NOTE: All original props and logic are preserved.
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

const locations = ['Banjul, Gambia', 'Brikama, Gambia', 'Bakau, Gambia', 'Serekunda, Gambia', 'Farafenni, Gambia', 'Lamin, Gambia'];
const conditions = ['new', 'used'];
const dateOptions = ['today', 'week', 'last7days', 'last30days'];

// This component now contains only the UI for the filters, to be used in both the modal and a sidebar.
export function FilterContent({ currentFilters, onFiltersChange }: { currentFilters: FilterState; onFiltersChange: (newFilters: FilterState) => void }) {
	const handleInputChange = (field: keyof FilterState, value: string) => {
		onFiltersChange({ ...currentFilters, [field]: value });
	};

	const handleCustomPriceChange = (field: 'min' | 'max', value: string) => {
		onFiltersChange({ ...currentFilters, priceRange: { ...currentFilters.priceRange, [field]: value } });
	};

	return (
		<div className="space-y-6">
			{/* Price Filter */}
			<div>
				<h3 className="text-sm font-semibold text-gray-700 mb-3">Price ({getCurrencyFromLocalStorage()?.code})</h3>
				<div className="flex gap-2">
					<input type="number" placeholder="Min" value={currentFilters.priceRange.min} onChange={(e) => handleCustomPriceChange('min', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 text-sm" />
					<span className="flex items-center text-gray-400">-</span>
					<input type="number" placeholder="Max" value={currentFilters.priceRange.max} onChange={(e) => handleCustomPriceChange('max', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 text-sm" />
				</div>
			</div>

			{/* Condition Filter */}
			<div>
				<h3 className="text-sm font-semibold text-gray-700 mb-3">Condition</h3>
				<div className="flex flex-wrap gap-2">
					{conditions.map((condition) => (
						<button
							key={condition}
							onClick={() => handleInputChange('condition', currentFilters.condition === condition ? '' : condition)}
							className={cn('px-3 py-1.5 text-sm rounded-full border transition-colors', currentFilters.condition === condition ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100')}
						>
							{condition.charAt(0).toUpperCase() + condition.slice(1)}
						</button>
					))}
				</div>
			</div>

			{/* Date Posted Filter */}
			<div>
				<h3 className="text-sm font-semibold text-gray-700 mb-3">Date Posted</h3>
				<div className="flex flex-wrap gap-2">
					{dateOptions.map((option) => (
						<button
							key={option}
							onClick={() => handleInputChange('datePosted', currentFilters.datePosted === option ? '' : option)}
							className={cn('px-3 py-1.5 text-sm rounded-full border transition-colors', currentFilters.datePosted === option ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100')}
						>
							{option.replace('last', 'Last ')}
						</button>
					))}
				</div>
			</div>
		</div>
	);
}

export function FilterModal({ isOpen, onClose, onApplyFilters, currentFilters }: FilterModalProps) {
	const [filters, setFilters] = useState<FilterState>(currentFilters);

	useEffect(() => setFilters(currentFilters), [currentFilters]);
	useEffect(() => {
		if (isOpen) document.body.style.overflow = 'hidden';
		else document.body.style.overflow = 'unset';
		return () => {
			document.body.style.overflow = 'unset';
		};
	}, [isOpen]);

	const handleApply = () => {
		onApplyFilters(filters);
		onClose();
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50">
			<div className="absolute inset-0 bg-black/50 animate-in fade-in-0" onClick={onClose} />
			<div className="absolute inset-y-0 right-0 w-full max-w-sm bg-white shadow-xl animate-in slide-in-from-right duration-300">
				<div className="flex flex-col h-full">
					<CardHeader className="flex-row items-center justify-between">
						<CardTitle>Filters</CardTitle>
						<button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:bg-gray-100">
							<i className="ri-close-line text-xl"></i>
						</button>
					</CardHeader>
					<CardContent className="flex-1 overflow-y-auto">
						<FilterContent currentFilters={filters} onFiltersChange={setFilters} />
					</CardContent>
					<CardFooter className="bg-gray-50 p-4">
						<Button onClick={handleApply} className="w-full">
							Apply Filters
						</Button>
					</CardFooter>
				</div>
			</div>
		</div>
	);
}
