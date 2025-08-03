'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { CustomLink } from '@/components/CustomLink';
import { getCurrentUser, setCurrentUser } from '@/lib/userUtils';

const ghanaianBanks = [
	'Access Bank Ghana',
	'Agricultural Development Bank',
	'Absa Bank Ghana',
	'CAL Bank',
	'Consolidated Bank Ghana',
	'Ecobank Ghana',
	'Fidelity Bank Ghana',
	'First Atlantic Bank',
	'First National Bank Ghana',
	'GCB Bank',
	'Ghana Commercial Bank',
	'GT Bank Ghana',
	'National donation Bank',
	'Prudential Bank',
	'Republic Bank Ghana',
	'Societe Generale Ghana',
	'Standard Chartered Bank Ghana',
	'Stanbic Bank Ghana',
	'United Bank for Africa Ghana',
	'Universal Merchant Bank',
	'Zenith Bank Ghana',
];

interface FormData {
	accountNumber: string;
	bankName: string;
	accountName: string;
	momoNumber: string;
	momoProvider: string;
}

interface FormErrors {
	accountNumber?: string;
	bankName?: string;
	accountName?: string;
	momoNumber?: string;
	momoProvider?: string;
}

export default function AddBankAccountPage() {
	const currentUser = getCurrentUser();
	const router = useRouter();
	const [formData, setFormData] = useState<FormData>({
		accountNumber: currentUser?.account_number ?? '',
		bankName: currentUser?.bank_name ?? '',
		accountName: currentUser?.account_name ?? '',
		momoNumber: currentUser?.momo_number ?? '',
		momoProvider: currentUser?.momo_provider ?? '',
	});
	const [errors, setErrors] = useState<FormErrors>({});
	const [isLoading, setIsLoading] = useState(false);
	const [showBankDropdown, setShowBankDropdown] = useState(false);
	const [bankSearchTerm, setBankSearchTerm] = useState('');

	const validateForm = (): boolean => {
		const newErrors: FormErrors = {};

		// Account Number validation
		// if (!formData.accountNumber.trim()) {
		// 	newErrors.accountNumber = 'Account number is required';
		// } else if (formData.accountNumber.length < 10) {
		// 	newErrors.accountNumber = 'Account number must be at least 10 digits';
		// } else if (!/^\d+$/.test(formData.accountNumber)) {
		// 	newErrors.accountNumber = 'Account number must contain only digits';
		// }

		// // Bank Name validation
		// if (!formData.bankName.trim()) {
		// 	newErrors.bankName = 'Bank name is required';
		// } else if (!ghanaianBanks.includes(formData.bankName)) {
		// 	newErrors.bankName = 'Please select a valid bank from the list';
		// }

		// // Account Name validation
		// if (!formData.accountName.trim()) {
		// 	newErrors.accountName = 'Account name is required';
		// } else if (formData.accountName.length < 2) {
		// 	newErrors.accountName = 'Account name must be at least 2 characters';
		// } else if (!/^[a-zA-Z\s]+$/.test(formData.accountName)) {
		// 	newErrors.accountName = 'Account name must contain only letters and spaces';
		// }

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

	const handleBankSelect = (bank: string) => {
		handleInputChange('bankName', bank);
		setShowBankDropdown(false);
		setBankSearchTerm('');
	};

	const handleBankInputChange = (value: string) => {
		handleInputChange('bankName', value);
		setBankSearchTerm(value);
		setShowBankDropdown(value.length > 0);
	};

	const filteredBanks = ghanaianBanks.filter((bank) => bank.toLowerCase().includes(bankSearchTerm.toLowerCase()));

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) {
			toast.error('Please fix the errors in the form');
			return;
		}

		setIsLoading(true);

		try {
			const payload = new FormData();
			payload.append('account_number', formData.accountNumber);
			payload.append('bank_name', formData.bankName);
			payload.append('account_name', formData.accountName);
			payload.append('momo_number', formData.momoNumber);
			payload.append('momo_provider', formData.momoProvider);
			// payload.append('phone_number', currentUser?.phone_number || '');

			const res = await fetch('/api/users/profile', {
				method: 'PUT',
				body: payload,
			});
			const data = await res.json();
			if (res.ok) {
				toast.success('Account details added successfully!');
				router.push('/user/profile');
			} else {
				toast.error(data.message || 'Failed to add account details. Please try again.');
			}
		} catch (error) {
			toast.error('An error occurred. Please try again.');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="relative min-h-screen flex flex-col items-center justify-start bg-gradient-to-br from-[#e0e7ff] via-[#f8fafc] to-[#f0fdfa] dark:from-[#232946] dark:via-[#181823] dark:to-[#232946] py-10 px-2">
			<div className="w-full max-w-2xl mx-auto">
				{/* Floating Glass Header */}
				<div className="relative z-10 mb-8">
					<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-[#232946]/80 shadow-lg backdrop-blur border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all">
						<CustomLink href="/user/profile" className="flex items-center gap-2 text-gray-700 dark:text-gray-200 hover:text-blue-700 dark:hover:text-blue-400 font-medium">
							<i className="ri-arrow-left-line w-5 h-5"></i>
							<span>Back to Profile</span>
						</CustomLink>
					</div>
					<h1 className="mt-6 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white drop-shadow-sm">Add Bank Account</h1>
					<p className="mt-2 text-lg text-gray-600 dark:text-gray-300">Add your bank account details to receive payments</p>
				</div>

				{/* Card Form Section */}
				<div className="relative z-0">
					<Card className="bg-white/90 dark:bg-[#232946]/80 shadow-xl border-0 rounded-2xl backdrop-blur-lg">
						<CardContent className="p-8 md:p-10">
							<form onSubmit={handleSubmit} className="space-y-7">
								{/* MoMo Number */}
								<div>
									<label htmlFor="momoNumber" className="block text-base font-semibold text-gray-900 dark:text-white mb-2">
										MoMo Number
									</label>
									<div className="relative">
										<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
											<i className="ri-smartphone-line w-5 h-5 text-blue-500 dark:text-blue-400"></i>
										</div>
										<input
											id="momoNumber"
											type="text"
											value={formData.momoNumber}
											onChange={(e) => handleInputChange('momoNumber', e.target.value)}
											placeholder="Enter MoMo number"
											className={`w-full pl-10 pr-3 py-3 border-2 rounded-xl bg-white/80 dark:bg-[#181823]/80 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
												errors.momoNumber ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 dark:border-gray-700'
											}`}
											maxLength={20}
										/>
									</div>
									{errors.momoNumber && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.momoNumber}</p>}
								</div>

								{/* MoMo Provider */}
								<div>
									<label htmlFor="momoProvider" className="block text-base font-semibold text-gray-900 dark:text-white mb-2">
										MoMo Provider
									</label>
									<div className="relative">
										<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
											<i className="ri-wallet-3-line w-5 h-5 text-blue-500 dark:text-blue-400"></i>
										</div>
										<input
											id="momoProvider"
											type="text"
											value={formData.momoProvider}
											onChange={(e) => handleInputChange('momoProvider', e.target.value)}
											placeholder="Enter MoMo provider (e.g. MTN, Vodafone)"
											className={`w-full pl-10 pr-3 py-3 border-2 rounded-xl bg-white/80 dark:bg-[#181823]/80 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
												errors.momoProvider ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 dark:border-gray-700'
											}`}
											maxLength={30}
										/>
									</div>
									{errors.momoProvider && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.momoProvider}</p>}
								</div>

								{/* Security Notice */}
								<div className="bg-gradient-to-r from-blue-100/80 via-blue-50/80 to-blue-200/80 dark:from-blue-900/30 dark:via-blue-800/30 dark:to-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-xl p-5 flex items-start gap-4 mt-6 shadow-sm">
									<i className="ri-shield-check-line w-7 h-7 text-blue-600 dark:text-blue-400 mt-1"></i>
									<div>
										<h4 className="text-base font-semibold text-blue-900 dark:text-blue-100 mb-1">Security & Privacy</h4>
										<p className="text-sm text-blue-800 dark:text-blue-200">Your Momo account information is encrypted and securely stored. We never share your financial details with third parties.</p>
									</div>
								</div>

								{/* Submit Button */}
								<Button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold py-3 rounded-xl shadow-md transition-all">
									{isLoading ? (
										<div className="flex items-center gap-2">
											<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
											<span>Adding Account Details...</span>
										</div>
									) : (
										<>
											<i className="ri-bank-line w-5 h-5 mr-2"></i>
											Save Account Details
										</>
									)}
								</Button>
							</form>
						</CardContent>
					</Card>
				</div>

				{/* Help Section */}
				<div className="mt-8 bg-gradient-to-r from-gray-100/80 via-white/80 to-gray-200/80 dark:from-gray-800/60 dark:via-[#232946]/60 dark:to-gray-800/60 rounded-2xl p-6 shadow border border-gray-200 dark:border-gray-700">
					<h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-lg flex items-center gap-2">
						<i className="ri-question-line w-5 h-5 text-blue-500 dark:text-blue-400"></i>
						Need Help?
					</h3>
					<p className="text-sm text-gray-600 dark:text-gray-400 mb-3">If you're having trouble adding your Momo details, please check:</p>
					<ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
						<li className="flex items-start gap-2">
							<i className="ri-checkbox-circle-line w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5"></i>
							Ensure your Momo number is correct
						</li>
						<li className="flex items-start gap-2">
							<i className="ri-checkbox-circle-line w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5"></i>
							Input a correct provider
						</li>
					</ul>
				</div>
			</div>
		</div>
	);
}
