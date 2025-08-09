'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { CustomLink } from '@/components/CustomLink';
import { getCurrentUser } from '@/lib/userUtils';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { handleFetchMessage } from '@/lib/helpers';

// NOTE: All original interfaces and logic are preserved.
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

export default function AddMomoDetailsPage() {
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
		if (!formData.momoName.trim()) {
			newErrors.momoName = 'Momo name is required';
		} else if (formData.momoName.length < 2) {
			newErrors.momoName = 'Momo name must be at least 2 characters';
		} else if (!/^[a-zA-Z\s]+$/.test(formData.momoName)) {
			newErrors.momoName = 'Momo name must contain only letters and spaces';
		}
		if (formData.momoNumber && !/^\d{10,}$/.test(formData.momoNumber)) {
			newErrors.momoNumber = 'MoMo number must be at least 10 digits';
		}
		if (formData.momoNumber && !formData.momoProvider.trim()) {
			newErrors.momoProvider = 'MoMo provider is required if MoMo number is provided';
		}
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleInputChange = (field: keyof FormData, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
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
				throw new Error(handleFetchMessage(data, 'Failed to add account details. Please try again.'));
			}
		} catch (error) {
			toast.error(handleFetchMessage(error, 'An error occurred. Please try again.'));
		} finally {
			setIsLoading(false);
		}
	};

	// ===============================================
	// START: Redesigned JSX
	// ===============================================
	return (
		<div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8">
			<div className="max-w-6xl mx-auto">
				<header className="mb-8">
					<CustomLink href="/user/profile" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-4 text-sm font-medium">
						<i className="ri-arrow-left-line"></i>
						Back to Profile
					</CustomLink>
					<h1 className="text-3xl font-bold text-gray-800">Wallet Details</h1>
					<p className="text-gray-500 mt-1">Add or update your Mobile Money (MoMo) details to receive payments.</p>
				</header>

				{/* New Two-Column Layout */}
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
					{/* Left Column: Main Form */}
					<div className="lg:col-span-2">
						<form onSubmit={handleSubmit}>
							<Card>
								<CardHeader>
									<CardTitle>Mobile Money Information</CardTitle>
									<CardDescription>This information will be used for all transactions.</CardDescription>
								</CardHeader>
								<CardContent className="space-y-6">
									<div>
										<label htmlFor="momoName" className="block text-sm font-medium text-gray-700 mb-2">
											Account Name *
										</label>
										<input
											id="momoName"
											type="text"
											value={formData.momoName}
											onChange={(e) => handleInputChange('momoName', e.target.value)}
											placeholder="e.g. John Doe"
											className={`w-full px-3 py-2 border rounded-lg transition-colors ${errors.momoName ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-teal-500'}`}
											maxLength={50}
										/>
										{errors.momoName && <p className="mt-1 text-sm text-red-600">{errors.momoName}</p>}
									</div>

									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										<div>
											<label htmlFor="momoNumber" className="block text-sm font-medium text-gray-700 mb-2">
												Account Number
											</label>
											<input
												id="momoNumber"
												type="text"
												value={formData.momoNumber}
												onChange={(e) => handleInputChange('momoNumber', e.target.value)}
												placeholder="e.g. 024xxxxxxx"
												className={`w-full px-3 py-2 border rounded-lg transition-colors ${errors.momoNumber ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-teal-500'}`}
												maxLength={20}
											/>
											{errors.momoNumber && <p className="mt-1 text-sm text-red-600">{errors.momoNumber}</p>}
										</div>
										<div>
											<label htmlFor="momoProvider" className="block text-sm font-medium text-gray-700 mb-2">
												Provider
											</label>
											<input
												id="momoProvider"
												type="text"
												value={formData.momoProvider}
												onChange={(e) => handleInputChange('momoProvider', e.target.value)}
												placeholder="e.g. MTN"
												className={`w-full px-3 py-2 border rounded-lg transition-colors ${errors.momoProvider ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-teal-500'}`}
												maxLength={30}
											/>
											{errors.momoProvider && <p className="mt-1 text-sm text-red-600">{errors.momoProvider}</p>}
										</div>
									</div>
								</CardContent>
								<CardFooter className="justify-end">
									<Button type="submit" disabled={isLoading} className="min-w-[150px]">
										{isLoading ? 'Saving...' : 'Save Details'}
									</Button>
								</CardFooter>
							</Card>
						</form>
					</div>

					{/* Right Column: Help & Security Info */}
					<div className="lg:col-span-1 space-y-6">
						<Card className="bg-teal-50 border-teal-200">
							<CardHeader className="flex-row items-center gap-4">
								<i className="ri-shield-check-line text-2xl text-teal-600"></i>
								<div>
									<CardTitle className="text-base text-teal-900">Security & Privacy</CardTitle>
								</div>
							</CardHeader>
							<CardContent>
								<p className="text-sm text-teal-800">Your account information is encrypted and securely stored. We will never share your financial details with third parties.</p>
							</CardContent>
						</Card>
						<Card>
							<CardHeader>
								<CardTitle>Need Help?</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-sm text-gray-600 mb-3">If you're having trouble, please double-check:</p>
								<ul className="text-sm text-gray-700 space-y-2">
									<li className="flex items-start gap-2">
										<i className="ri-checkbox-circle-line text-teal-500 mt-0.5"></i>
										Your MoMo account name matches your registered name.
									</li>
									<li className="flex items-start gap-2">
										<i className="ri-checkbox-circle-line text-teal-500 mt-0.5"></i>
										Your MoMo number and provider are correct.
									</li>
								</ul>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
}
