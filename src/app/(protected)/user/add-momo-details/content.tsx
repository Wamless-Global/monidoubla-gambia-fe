'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { CustomLink } from '@/components/CustomLink';
import { getCurrentUser } from '@/lib/userUtils';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { handleFetchMessage } from '@/lib/helpers';

interface FormData {
	momoName: string;
	momoNumber: string;
	momoProvider: string;
}

interface FormErrors {
	momoName?: string;
	momoNumber?: string;
	momoProvider?: string;
}

export default function AddBankAccountPage() {
	const currentUser = getCurrentUser();
	const router = useRouter();
	const [formData, setFormData] = useState<FormData>({
		momoName: currentUser?.momo_name ?? '',
		momoNumber: currentUser?.momo_number ?? '',
		momoProvider: currentUser?.momo_provider ?? '',
	});
	const [errors, setErrors] = useState<FormErrors>({});
	const [isLoading, setIsLoading] = useState(false);

	const validateForm = (): boolean => {
		const newErrors: FormErrors = {};

		// // Momo Name validation
		if (!formData.momoName.trim()) {
			newErrors.momoName = 'Momo name is required';
		} else if (formData.momoName.length < 2) {
			newErrors.momoName = 'Momo name must be at least 2 characters';
		} else if (!/^[a-zA-Z\s]+$/.test(formData.momoName)) {
			newErrors.momoName = 'Momo name must contain only letters and spaces';
		}

		// Momo Number validation
		if (formData.momoNumber && !/^\d{10,}$/.test(formData.momoNumber)) {
			newErrors.momoNumber = 'MoMo number must be at least 10 digits';
		}

		// Momo Provider validation
		if (formData.momoNumber && !formData.momoProvider.trim()) {
			newErrors.momoProvider = 'MoMo provider is required if MoMo number is provided';
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleInputChange = (field: keyof FormData, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		// Clear error when user starts typing
		if (errors[field]) {
			setErrors((prev) => ({ ...prev, [field]: undefined }));
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) {
			toast.error('Please fix the errors in the form');
			return;
		}

		setIsLoading(true);

		try {
			const payload = new FormData();
			payload.append('momo_number', formData.momoNumber);
			payload.append('momo_provider', formData.momoProvider);
			payload.append('momo_name', formData.momoName);

			const res = await fetchWithAuth('/api/users/profile', {
				method: 'PUT',
				body: payload,
			});
			const data = await res.json();
			if (res.ok) {
				toast.success('Account details added successfully!');
				router.push('/user/profile');
			} else {
				const error = handleFetchMessage(data, 'Failed to add account details. Please try again.');
				toast.error(error);
			}
		} catch (error) {
			toast.error('An error occurred. Please try again.');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="p-4 lg:p-6  min-h-screen">
			<div className="max-w-2xl mx-auto">
				{/* Header */}
				<div className="mb-6">
					<CustomLink href="/user/profile" className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors mb-4">
						<i className="ri-arrow-left-line w-4 h-4 flex items-center justify-center"></i>
						Back to Profile
					</CustomLink>
					<h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Add Momo Details</h1>
					<p className="text-gray-600 dark:text-gray-400">Add your Momo details to receive payments</p>
				</div>

				{/* Form */}
				<Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
					<CardContent className="p-6">
						<form onSubmit={handleSubmit} className="space-y-6">
							{/* Momo Name */}
							<div>
								<label htmlFor="momoName" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
									Momo Name *
								</label>
								<div className="relative">
									<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
										<i className="ri-user-line w-5 h-5 flex items-center justify-center text-gray-400"></i>
									</div>
									<input
										id="momoName"
										type="text"
										value={formData.momoName}
										onChange={(e) => handleInputChange('momoName', e.target.value)}
										placeholder="Enter momo name"
										className={`w-full pl-10 pr-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
											errors.momoName ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600'
										}`}
										maxLength={50}
									/>
								</div>
								{errors.momoName && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.momoName}</p>}
							</div>

							{/* MoMo Number */}
							<div>
								<label htmlFor="momoNumber" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
									MoMo Number
								</label>
								<div className="relative">
									<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
										<i className="ri-smartphone-line w-5 h-5 flex items-center justify-center text-gray-400"></i>
									</div>
									<input
										id="momoNumber"
										type="text"
										value={formData.momoNumber}
										onChange={(e) => handleInputChange('momoNumber', e.target.value)}
										placeholder="Enter MoMo number"
										className={`w-full pl-10 pr-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
											errors.momoNumber ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600'
										}`}
										maxLength={20}
									/>
								</div>
								{errors.momoNumber && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.momoNumber}</p>}
							</div>

							{/* MoMo Provider */}
							<div>
								<label htmlFor="momoProvider" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
									MoMo Provider
								</label>
								<div className="relative">
									<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
										<i className="ri-wallet-3-line w-5 h-5 flex items-center justify-center text-gray-400"></i>
									</div>
									<input
										id="momoProvider"
										type="text"
										value={formData.momoProvider}
										onChange={(e) => handleInputChange('momoProvider', e.target.value)}
										placeholder="Enter MoMo provider (e.g. MTN, Vodafone)"
										className={`w-full pl-10 pr-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
											errors.momoProvider ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600'
										}`}
										maxLength={30}
									/>
								</div>
								{errors.momoProvider && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.momoProvider}</p>}
							</div>

							{/* Security Notice */}
							<div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
								<div className="flex items-start gap-3">
									<i className="ri-shield-check-line w-5 h-5 flex items-center justify-center text-blue-600 dark:text-blue-400 mt-0.5"></i>
									<div>
										<h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">Security & Privacy</h4>
										<p className="text-sm text-blue-800 dark:text-blue-200">Your Momo account information is encrypted and securely stored. We never share your financial details with third parties.</p>
									</div>
								</div>
							</div>

							{/* Submit Button */}
							<Button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white whitespace-nowrap">
								{isLoading ? (
									<div className="flex items-center gap-2">
										<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
										<span>Adding Momo Details...</span>
									</div>
								) : (
									<>
										<i className="ri-bank-line w-4 h-4 flex items-center justify-center mr-2"></i>
										Save Momo Details
									</>
								)}
							</Button>
						</form>
					</CardContent>
				</Card>

				{/* Help Section */}
				<div className="mt-6 bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
					<h3 className="font-medium text-gray-900 dark:text-white mb-2">Need Help?</h3>
					<p className="text-sm text-gray-600 dark:text-gray-400 mb-3">If you're having trouble adding your Momo details, please check:</p>
					<ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
						<li className="flex items-start gap-2">
							<i className="ri-checkbox-circle-line w-4 h-4 flex items-center justify-center text-blue-600 dark:text-blue-400 mt-0.5"></i>
							Ensure your Momo number is correct
						</li>
						<li className="flex items-start gap-2">
							<i className="ri-checkbox-circle-line w-4 h-4 flex items-center justify-center text-blue-600 dark:text-blue-400 mt-0.5"></i>
							Input a correct provider
						</li>
					</ul>
				</div>
			</div>
		</div>
	);
}
