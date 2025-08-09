'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { getCurrencyFromLocalStorage, getSettings } from '@/lib/helpers';
import { cn } from '@/lib/utils';

// NOTE: All original interfaces and logic are preserved.
interface Package {
	id: string;
	name: string;
	type: 'PH' | 'GH';
	gain: number;
	minAmount: number;
	maxAmount: number;
	maturity: string;
	status: 'Active' | 'Inactive';
}

interface PackageModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSave: (packageData: Omit<Package, 'id'>) => void;
	package?: Package | null;
}

export function PackageModal({ isOpen, onClose, onSave, package: packageData }: PackageModalProps) {
	const [formData, setFormData] = useState({
		name: '',
		type: 'PH' as 'PH' | 'GH',
		gain: 0,
		minAmount: 0,
		maxAmount: 0,
		maturity: '',
		status: 'Active' as 'Active' | 'Inactive',
	});
	const [loading, setLoading] = useState(false);
	const [errors, setErrors] = useState<Record<string, string>>({});

	useEffect(() => {
		if (packageData) {
			setFormData({
				name: packageData.name,
				type: packageData.type,
				gain: packageData.gain,
				minAmount: packageData.minAmount,
				maxAmount: packageData.maxAmount,
				maturity: packageData.maturity,
				status: packageData.status,
			});
		} else {
			setFormData({ name: '', type: 'PH', gain: 0, minAmount: 0, maxAmount: 0, maturity: '', status: 'Active' });
		}
		setErrors({});
	}, [packageData, isOpen]);

	const validateForm = () => {
		const newErrors: Record<string, string> = {};
		if (!formData.name.trim() || formData.name.length < 3) newErrors.name = 'Package name must be at least 3 characters';
		if (formData.gain <= 0 || formData.gain > 1000) newErrors.gain = 'Gain must be between 1 and 1000';
		if (formData.minAmount <= 0) newErrors.minAmount = 'Min amount must be greater than 0';
		if (formData.maxAmount <= formData.minAmount) newErrors.maxAmount = 'Max amount must be greater than min amount';
		if (!formData.maturity.trim() || !/^(\d+)\s+(day|days|week|weeks|month|months|year|years)$/i.test(formData.maturity.trim())) newErrors.maturity = 'Format must be "7 days", "1 month", etc.';
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!validateForm()) return;
		setLoading(true);
		await onSave(formData); // Parent handles the actual API call & toast
		setLoading(false);
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-in fade-in-0 !m-0">
			<Card className="max-w-md w-full bg-white shadow-lg border-slate-200 animate-in fade-in-0 zoom-in-95">
				<CardHeader>
					<div className="flex justify-between items-center">
						<div>
							<CardTitle>{packageData ? 'Edit Package' : 'Add New Package'}</CardTitle>
							<CardDescription>Fill in the details for the package below.</CardDescription>
						</div>
						<button onClick={onClose} disabled={loading} className="p-1 rounded-full text-slate-500 hover:bg-slate-100">
							<i className="ri-close-line text-xl"></i>
						</button>
					</div>
				</CardHeader>
				<form onSubmit={handleSubmit}>
					<CardContent className="max-h-[60vh] overflow-y-auto p-6 space-y-4">
						<div>
							<label className="block text-sm font-medium text-slate-700 mb-1">Package Name</label>
							<input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={cn('w-full', errors.name && 'border-red-500')} placeholder="e.g. Starter Plan" disabled={loading} required />
							{errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-slate-700 mb-1">Gain (%)</label>
								<input type="number" value={formData.gain} onChange={(e) => setFormData({ ...formData, gain: parseInt(e.target.value) || 0 })} className={cn('w-full', errors.gain && 'border-red-500')} placeholder="e.g. 50" disabled={loading} required />
								{errors.gain && <p className="mt-1 text-sm text-red-600">{errors.gain}</p>}
							</div>
							<div>
								<label className="block text-sm font-medium text-slate-700 mb-1">Maturity</label>
								<input type="text" value={formData.maturity} onChange={(e) => setFormData({ ...formData, maturity: e.target.value })} className={cn('w-full', errors.maturity && 'border-red-500')} placeholder="e.g. 30 days" disabled={loading} required />
								{errors.maturity && <p className="mt-1 text-sm text-red-600">{errors.maturity}</p>}
							</div>
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-slate-700 mb-1">Min Amount ({getSettings()?.baseCurrency || getCurrencyFromLocalStorage()?.code})</label>
								<input type="number" value={formData.minAmount} onChange={(e) => setFormData({ ...formData, minAmount: parseInt(e.target.value) || 0 })} className={cn('w-full', errors.minAmount && 'border-red-500')} placeholder="e.g. 100" disabled={loading} required />
								{errors.minAmount && <p className="mt-1 text-sm text-red-600">{errors.minAmount}</p>}
							</div>
							<div>
								<label className="block text-sm font-medium text-slate-700 mb-1">Max Amount ({getSettings()?.baseCurrency || getCurrencyFromLocalStorage()?.code})</label>
								<input type="number" value={formData.maxAmount} onChange={(e) => setFormData({ ...formData, maxAmount: parseInt(e.target.value) || 0 })} className={cn('w-full', errors.maxAmount && 'border-red-500')} placeholder="e.g. 1000" disabled={loading} required />
								{errors.maxAmount && <p className="mt-1 text-sm text-red-600">{errors.maxAmount}</p>}
							</div>
						</div>
						<div>
							<label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
							<select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Active' | 'Inactive' })} className="w-full" disabled={loading} required>
								<option value="Active">Active</option>
								<option value="Inactive">Inactive</option>
							</select>
						</div>
					</CardContent>
					<CardFooter className="justify-end gap-3">
						<Button type="button" onClick={onClose} variant="outline" disabled={loading}>
							Cancel
						</Button>
						<Button type="submit" disabled={loading} className="min-w-[140px]">
							{loading ? (packageData ? 'Updating...' : 'Creating...') : packageData ? 'Update Package' : 'Create Package'}
						</Button>
					</CardFooter>
				</form>
			</Card>
		</div>
	);
}
