'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { logger } from '@/lib/logger';
import { getCurrencyFromLocalStorage } from '@/lib/helpers';

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
			setFormData({
				name: '',
				type: 'PH',
				gain: 0,
				minAmount: 0,
				maxAmount: 0,
				maturity: '',
				status: 'Active',
			});
		}
		setErrors({});
	}, [packageData, isOpen]);

	const validateForm = () => {
		const newErrors: Record<string, string> = {};

		if (!formData.name.trim()) {
			newErrors.name = 'Package name is required';
		} else if (formData.name.length < 3) {
			newErrors.name = 'Package name must be at least 3 characters';
		}

		if (formData.gain <= 0) {
			newErrors.gain = 'Gain percentage must be greater than 0';
		} else if (formData.gain > 1000) {
			newErrors.gain = 'Gain percentage cannot exceed 1000%';
		}

		if (formData.minAmount <= 0) {
			newErrors.minAmount = 'Minimum amount must be greater than 0';
		}

		if (formData.maxAmount <= 0) {
			newErrors.maxAmount = 'Maximum amount must be greater than 0';
		} else if (formData.maxAmount <= formData.minAmount) {
			newErrors.maxAmount = 'Maximum amount must be greater than minimum amount';
		}

		if (!formData.maturity.trim()) {
			newErrors.maturity = 'Maturity period is required';
		} else {
			// Validate maturity format (e.g., "7 days", "30 days", "1 month")
			const maturityRegex = /^(\d+)\s+(day|days|week|weeks|month|months|year|years)$/i;
			if (!maturityRegex.test(formData.maturity.trim())) {
				newErrors.maturity = 'Maturity format should be like "7 days", "30 days", "1 month"';
			}
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) {
			return;
		}

		setLoading(true);

		// Simulate API call
		await new Promise((resolve) => setTimeout(resolve, 1500));

		onSave(formData);
		setLoading(false);
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 !m-0">
			<div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
				<div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
					<h2 className="text-xl font-semibold text-gray-900 dark:text-white">{packageData ? 'Edit Package' : 'Add New Package'}</h2>
					<button onClick={onClose} disabled={loading} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer disabled:opacity-50">
						<i className="ri-close-line w-6 h-6 flex items-center justify-center"></i>
					</button>
				</div>

				<form onSubmit={handleSubmit} className="p-6 space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Package Name</label>
						<input
							type="text"
							value={formData.name}
							onChange={(e) => setFormData({ ...formData, name: e.target.value })}
							className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${errors.name ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
							placeholder="Enter package name"
							disabled={loading}
							required
						/>
						{errors.name && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>}
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Gain Percentage (%)</label>
						<input
							type="number"
							value={formData.gain}
							onChange={(e) => setFormData({ ...formData, gain: parseInt(e.target.value) || 0 })}
							className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${errors.gain ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
							min="0"
							max="1000"
							placeholder="Enter gain percentage"
							disabled={loading}
							required
						/>
						{errors.gain && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.gain}</p>}
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Min Amount ({getCurrencyFromLocalStorage()?.code})</label>
							<input
								type="number"
								value={formData.minAmount}
								onChange={(e) => setFormData({ ...formData, minAmount: parseInt(e.target.value) || 0 })}
								className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${errors.minAmount ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
								min="0"
								placeholder="Min amount"
								disabled={loading}
								required
							/>
							{errors.minAmount && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.minAmount}</p>}
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Max Amount ({getCurrencyFromLocalStorage()?.code})</label>
							<input
								type="number"
								value={formData.maxAmount}
								onChange={(e) => setFormData({ ...formData, maxAmount: parseInt(e.target.value) || 0 })}
								className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${errors.maxAmount ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
								min="0"
								placeholder="Max amount"
								disabled={loading}
								required
							/>
							{errors.maxAmount && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.maxAmount}</p>}
						</div>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Maturity Period</label>
						<input
							type="text"
							value={formData.maturity}
							onChange={(e) => setFormData({ ...formData, maturity: e.target.value })}
							className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${errors.maturity ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
							placeholder="e.g., 7 days, 30 days, 1 month"
							disabled={loading}
							required
						/>
						{errors.maturity && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.maturity}</p>}
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
						<select
							value={formData.status}
							onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Active' | 'Inactive' })}
							className="w-full px-3 py-2 pr-8 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
							disabled={loading}
							required
						>
							<option value="Active">Active</option>
							<option value="Inactive">Inactive</option>
						</select>
					</div>

					<div className="flex justify-end gap-3 pt-4">
						<Button type="button" onClick={onClose} variant="outline" disabled={loading} className="whitespace-nowrap bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600">
							Cancel
						</Button>
						<Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white whitespace-nowrap min-w-[120px]">
							{loading ? (
								<div className="flex items-center gap-2">
									<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
									<span>{packageData ? 'Updating...' : 'Creating...'}</span>
								</div>
							) : packageData ? (
								'Update Package'
							) : (
								'Create Package'
							)}
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
}
