'use client';

import { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { isValidPhoneNumber, CountryCode } from 'libphonenumber-js';
import { Button } from '@/components/ui/button';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { handleFetchMessage } from '@/lib/helpers';
import { logger } from '@/lib/logger';
import nProgress from 'nprogress';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Country, SignupPageContentProps } from '@/types';
import { CustomLink } from '@/components/CustomLink';

type FormData = {
	firstName: string;
	lastName: string;
	email: string;
	password: string;
	confirmPassword: string;
	phone: string;
	agreeTerms: boolean;
	momo_number: string;
	momo_name: string;
	momo_provider: string;
};

type Errors = {
	firstName?: string;
	lastName?: string;
	email?: string;
	password?: string;
	confirmPassword?: string;
	phone?: string;
	agreeTerms?: string;
	country?: string;
	momo_number?: string;
	momo_name?: string;
	momo_provider?: string;
};

export default function SignupPageContent({ referralData, countries }: SignupPageContentProps & { countries: { status: string; countries: Country[] } }) {
	const [formData, setFormData] = useState<FormData>({
		firstName: '',
		lastName: '',
		email: '',
		password: '',
		confirmPassword: '',
		phone: '',
		agreeTerms: false,
		momo_number: '',
		momo_name: '',
		momo_provider: '',
	});
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [errors, setErrors] = useState<Errors>({});
	const [selectedCountry, setSelectedCountry] = useState<string>('');
	const router = useRouter();

	const referralActiveDefault = !!(referralData && referralData.status === 'success' && referralData.data?.name);
	const [referralActive, setReferralActive] = useState(referralActiveDefault);
	const [referralId, setReferralId] = useState<string | null>(referralActiveDefault ? referralData?.data?.referral_id || null : null);
	const [referralName, setReferralName] = useState(referralActiveDefault && referralData?.data?.name ? referralData.data.name : '');

	useEffect(() => {
		if (referralData && referralData.status === 'success' && referralData.data?.name) {
			setReferralActive(true);
			setReferralId(referralData.data.referral_id || null);
			setReferralName(referralData.data.name);
		} else {
			setReferralActive(false);
			setReferralId(null);
			setReferralName('');
		}
	}, [referralData]);

	const handleRemoveReferral = () => {
		setReferralActive(false);
		setReferralId(null);
		setReferralName('');
	};

	const handleRestoreReferral = () => {
		if (referralData && referralData.status === 'success' && referralData.data?.name) {
			setReferralActive(true);
			setReferralId(referralData.data.referral_id || null);
			setReferralName(referralData.data.name);
		}
	};

	const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
		const { name, value, type, checked } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: type === 'checkbox' ? checked : value,
		}));
	};

	const handleCountryChange = (e: ChangeEvent<HTMLSelectElement>) => {
		setSelectedCountry(e.target.value);
	};

	const validateForm = () => {
		const newErrors: Errors = {};

		if (!formData.firstName.trim()) {
			newErrors.firstName = 'First name is required';
		}

		if (!formData.lastName.trim()) {
			newErrors.lastName = 'Last name is required';
		}

		if (!formData.email.trim()) {
			newErrors.email = 'Email is required';
		} else if (!/\S+@\S+\.\S+/.test(formData.email)) {
			newErrors.email = 'Email is invalid';
		}

		if (!formData.phone.trim()) {
			newErrors.phone = 'Phone number is required';
		} else {
			try {
				let countryCode: CountryCode = 'LR'; // Default to Liberia
				if (selectedCountry === 'decaa447-5a78-42e1-9d4a-af500cf59689') countryCode = 'LR';
				let phone = formData.phone.trim();
				// If phone does not start with +, try to convert to international format
				if (!phone.startsWith('+')) {
					// Remove leading zero if present
					if (phone.startsWith('0')) {
						phone = phone.substring(1);
					}
					// Prepend country calling code for Liberia (+231)
					if (countryCode === 'LR') {
						phone = '+231' + phone;
					}
					// Add more country mappings here if needed
				}
				if (!isValidPhoneNumber(phone)) {
					newErrors.phone = 'Phone number is invalid';
				}
			} catch {
				newErrors.phone = 'Phone number is invalid';
			}
		}

		if (!formData.password) {
			newErrors.password = 'Password is required';
		} else if (formData.password.length < 8) {
			newErrors.password = 'Password must be at least 8 characters';
		}

		if (formData.password !== formData.confirmPassword) {
			newErrors.confirmPassword = 'Passwords do not match';
		}

		if (!formData.agreeTerms) {
			newErrors.agreeTerms = 'You must agree to the terms';
		}

		if (!selectedCountry) {
			newErrors.country = 'Country is required';
		}

		if (!formData.momo_number.trim()) {
			newErrors.momo_number = 'Mobile Money number is required';
		}
		if (!formData.momo_name.trim()) {
			newErrors.momo_name = 'Mobile Money name is required';
		}
		if (!formData.momo_provider.trim()) {
			newErrors.momo_provider = 'Mobile Money provider is required';
		}

		setErrors(newErrors);
		logger.log(Object.keys(newErrors).length);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (validateForm()) {
			const toastId = toast.info('Creating your account...');

			try {
				logger.log({ name: `${formData.firstName} ${formData.lastName}`, email: formData.email, password: formData.password, confirmPassword: formData.confirmPassword, roles: ['user'], country: selectedCountry, referralId: referralActive && referralId ? referralId : undefined });
				const payload: any = {
					name: `${formData.firstName} ${formData.lastName}`,
					email: formData.email,
					password: formData.password,
					confirmPassword: formData.confirmPassword,
					roles: ['user'],
					country: selectedCountry,
				};
				if (referralActive && referralId) {
					payload.referralId = referralId;
				}
				const response = await fetchWithAuth(`/api/auth/register`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(payload),
				});

				const responseData = await response.json();

				if (!response.ok) {
					const errorMessage = handleFetchMessage(responseData || `Signup API failed: ${response.statusText || 'Unknown error'}`);
					logger.error('AuthContext Signup Error:', errorMessage, responseData);
					throw new Error(errorMessage);
				}

				nProgress.start();
				toast.success('Signup was successfull! Please login.', { id: toastId });
				router.push(`/auth/login`);
			} catch (err) {
				const errorMessage = handleFetchMessage(err);
				toast.error(errorMessage, { id: toastId });
				throw err;
			}
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-primary to-secondary flex items-center justify-center p-4 sm:p-8">
			<div className="container flex flex-col lg:flex-row gap-8 mt-24">
				<div className="lg:w-1/3 bg-neutral-dark text-white p-8 rounded-lg shadow-xl flex flex-col justify-center auth-img">
					<h1 className="text-3xl font-bold mb-4">Join Monidoublagambia</h1>
					<p className="text-neutral-light">Create your account to start your journey with us. Connect, grow, and thrive in our community.</p>
				</div>
				<div className="lg:w-2/3 card">
					<div className="text-center mb-8">
						<h2 className="text-2xl font-bold">Create Account</h2>
						<p className="text-text-secondary">Sign up to get started with Monidoublagambia</p>
					</div>

					{referralData && referralData.status === 'success' && (
						<div className="space-y-2 mb-6">
							<label htmlFor="referral-name" className="label">
								Referred by
							</label>
							<div className="relative flex items-center">
								<i className="ri-user-line absolute left-3 h-5 w-5 text-text-secondary" />
								<input id="referral-name" type="text" value={referralName} disabled readOnly className="input pl-10 cursor-not-allowed bg-neutral-light/50 text-text-secondary" />
							</div>
						</div>
					)}

					<form onSubmit={handleSubmit} className="space-y-6">
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div>
								<label htmlFor="firstName" className="label">
									First Name
								</label>
								<input type="text" id="firstName" name="firstName" value={formData.firstName} onChange={handleInputChange} className={`input ${errors.firstName ? 'border-red-500' : ''}`} placeholder="Enter first name" />
								{errors.firstName && <p className="mt-1 text-sm text-red-500">{errors.firstName}</p>}
							</div>
							<div>
								<label htmlFor="lastName" className="label">
									Last Name
								</label>
								<input type="text" id="lastName" name="lastName" value={formData.lastName} onChange={handleInputChange} className={`input ${errors.lastName ? 'border-red-500' : ''}`} placeholder="Enter last name" />
								{errors.lastName && <p className="mt-1 text-sm text-red-500">{errors.lastName}</p>}
							</div>
						</div>

						<div>
							<label htmlFor="country" className="label">
								Country
							</label>
							<select id="country" name="country" value={selectedCountry} onChange={handleCountryChange} className={`input ${errors.country ? 'border-red-500' : ''}`}>
								<option value="" disabled>
									Select country
								</option>
								<option value="decaa447-5a78-42e1-9d4a-af500cf59689">Gambia</option>
							</select>
							{errors.country && <p className="mt-1 text-sm text-red-500">{errors.country}</p>}
						</div>

						<div>
							<label htmlFor="email" className="label">
								Email Address
							</label>
							<input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} className={`input ${errors.email ? 'border-red-500' : ''}`} placeholder="Enter your email" />
							{errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
						</div>

						<div>
							<label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
								Phone Number
							</label>
							<input
								type="tel"
								id="phone"
								name="phone"
								value={formData.phone}
								onChange={handleInputChange}
								className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
								placeholder="Enter your phone number"
							/>
							{errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
						</div>

						<div>
							<label htmlFor="momo_number" className="block text-sm font-medium text-gray-700 mb-2">
								Mobile Money Number
							</label>
							<input
								type="number"
								id="momo_number"
								name="momo_number"
								value={formData.momo_number}
								onChange={handleInputChange}
								className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.momo_number ? 'border-red-500' : 'border-gray-300'}`}
								placeholder="Enter your mobile money number"
							/>
							{errors.momo_number && <p className="mt-1 text-sm text-red-500">{errors.momo_number}</p>}
						</div>

						<div>
							<label htmlFor="momo_name" className="block text-sm font-medium text-gray-700 mb-2">
								Mobile Money Name
							</label>
							<input
								type="text"
								id="momo_name"
								name="momo_name"
								value={formData.momo_name}
								onChange={handleInputChange}
								className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.momo_name ? 'border-red-500' : 'border-gray-300'}`}
								placeholder="Enter your mobile money name"
							/>
							{errors.momo_name && <p className="mt-1 text-sm text-red-500">{errors.momo_name}</p>}
						</div>

						<div>
							<label htmlFor="momo_provider" className="block text-sm font-medium text-gray-700 mb-2">
								Mobile Money Provider
							</label>
							<input
								type="text"
								id="momo_provider"
								name="momo_provider"
								value={formData.momo_provider}
								onChange={handleInputChange}
								className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.momo_provider ? 'border-red-500' : 'border-gray-300'}`}
								placeholder="Enter your mobile money provider"
							/>
							{errors.momo_provider && <p className="mt-1 text-sm text-red-500">{errors.momo_provider}</p>}
						</div>

						<div>
							<label htmlFor="password" className="label">
								Password
							</label>
							<div className="relative">
								<input type={showPassword ? 'text' : 'password'} id="password" name="password" value={formData.password} onChange={handleInputChange} className={`input pr-10 ${errors.password ? 'border-red-500' : ''}`} placeholder="Enter your password" />
								<button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center" onClick={() => setShowPassword(!showPassword)}>
									<i className={`${showPassword ? 'ri-eye-off-line' : 'ri-eye-line'} text-text-secondary hover:text-primary`}></i>
								</button>
							</div>
							{errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
						</div>

						<div>
							<label htmlFor="confirmPassword" className="label">
								Confirm Password
							</label>
							<div className="relative">
								<input
									type={showConfirmPassword ? 'text' : 'password'}
									id="confirmPassword"
									name="confirmPassword"
									value={formData.confirmPassword}
									onChange={handleInputChange}
									className={`input pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
									placeholder="Confirm your password"
								/>
								<button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
									<i className={`${showConfirmPassword ? 'ri-eye-off-line' : 'ri-eye-line'} text-text-secondary hover:text-primary`}></i>
								</button>
							</div>
							{errors.confirmPassword && <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>}
						</div>

						<div className="flex items-start">
							<input type="checkbox" id="agreeTerms" name="agreeTerms" checked={formData.agreeTerms} onChange={handleInputChange} className="mt-1 h-4 w-4 text-primary focus:ring-primary border-neutral-dark/20 rounded" />
							<label htmlFor="agreeTerms" className="ml-2 block text-sm text-text-secondary">
								I agree to the{' '}
								<CustomLink href="#" className="text-primary hover:text-secondary">
									Terms of Service
								</CustomLink>{' '}
								and{' '}
								<CustomLink href="#" className="text-primary hover:text-secondary">
									Privacy Policy
								</CustomLink>
							</label>
						</div>
						{errors.agreeTerms && <p className="text-sm text-red-500">{errors.agreeTerms}</p>}

						<Button type="submit" className="button button-primary w-full">
							Create Account
						</Button>
					</form>

					<div className="mt-6 text-center">
						<p className="text-sm text-text-secondary">
							Already have an account?{' '}
							<CustomLink href="/auth/login" className="text-primary hover:text-secondary font-medium">
								Sign in
							</CustomLink>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
