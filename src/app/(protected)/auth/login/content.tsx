'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { clearLoggedInAsUser, handleFetchMessage } from '@/lib/helpers';
import nProgress from 'nprogress';
import { toast } from 'sonner';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthenticatedUser } from '@/types';
import { logger } from '@/lib/logger';
import { CustomLink } from '@/components/CustomLink';
import { setCurrentUser } from '@/lib/userUtils';

type FormData = {
	email: string;
	password: string;
	rememberMe: boolean;
};

type Errors = {
	email?: string;
	password?: string;
};

export default function LoginPageContent() {
	const [formData, setFormData] = useState<FormData>({
		email: '',
		password: '',
		rememberMe: false,
	});
	const [showPassword, setShowPassword] = useState(false);
	const [errors, setErrors] = useState<Errors>({});
	const router = useRouter();
	const searchParams = useSearchParams();

	const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
		const { name, value, type, checked } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: type === 'checkbox' ? checked : value,
		}));
	};

	const validateForm = () => {
		const newErrors: Errors = {};

		if (!formData.email.trim()) {
			newErrors.email = 'Email is required';
		} else if (!/\S+@\S+\.\S+/.test(formData.email)) {
			newErrors.email = 'Email is invalid';
		}

		if (!formData.password) {
			newErrors.password = 'Password is required';
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (validateForm()) {
			const toastId = toast.loading('Logging you in...');
			try {
				const response = await fetchWithAuth(`/api/auth/login`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({ email: formData.email, password: formData.password }),
				});

				const responseData = await response.json();

				if (!response.ok) {
					const errorMessage = responseData.message || `Login API failed: ${response.statusText || 'Unknown error'}`;
					logger.error('AuthContext Login Error:', errorMessage, responseData);
					throw new Error(errorMessage);
				}

				if (responseData.status === 'success' && responseData.data?.user) {
					const authenticatedUser = responseData.data.user as AuthenticatedUser;

					if (typeof window !== 'undefined' && responseData.data.currency) {
						localStorage.setItem('currency', JSON.stringify(responseData.data.currency));
					}

					setCurrentUser(responseData.data.user);

					if (typeof window !== 'undefined' && responseData.data.settings) {
						localStorage.setItem('settings', JSON.stringify(responseData.data.settings));
					}

					clearLoggedInAsUser();

					const redirectTo = searchParams.get('redirect_to');
					let destination = '/user';

					if (redirectTo && redirectTo.startsWith('/')) {
						destination = redirectTo;
						toast.success(`Redirecting you shortly...`, { id: toastId });
					} else {
						if (authenticatedUser.roles && authenticatedUser.roles.includes('admin')) {
							destination = '/admin';
						} else if (authenticatedUser.roles && authenticatedUser.roles.includes('user')) {
							destination = '/user';
						}
						toast.success(`Redirecting to your dashboard...`, { id: toastId });
					}
					router.replace(destination);
				} else {
					logger.error('AuthContext Login Error: Unexpected success response format', responseData);
					throw new Error('Login failed: Unexpected response from server.');
				}
			} catch (err) {
				const errorMessage = handleFetchMessage(err);

				if (errorMessage.includes('Please verify your email address before logging in')) {
					nProgress.start();
					router.push('/auth/verify-email?email=' + formData.email);
				}

				toast.error(errorMessage, { id: toastId });
			}
		}
	};

	return (
		<div className="min-h-screen bg-gray-100 flex items-center justify-center px-2 py-10 sm:p-16">
			<div className="w-full">
				<div className="max-w-md w-full mx-auto">
					<div className="bg-white rounded-lg shadow-lg p-8">
						<div className="text-center mb-8">
							<h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h1>
							<p className="text-gray-600">Sign in to your MonidoublA account</p>
						</div>

						<form onSubmit={handleSubmit} className="space-y-6">
							<div>
								<label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
									Email Address
								</label>
								<input
									type="email"
									id="email"
									name="email"
									value={formData.email}
									onChange={handleInputChange}
									className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
									placeholder="Enter your email"
								/>
								{errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
							</div>

							<div>
								<label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
									Password
								</label>
								<div className="relative">
									<input
										type={showPassword ? 'text' : 'password'}
										id="password"
										name="password"
										value={formData.password}
										onChange={handleInputChange}
										className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10 ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
										placeholder="Enter your password"
									/>
									<button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center" onClick={() => setShowPassword(!showPassword)}>
										<i className={`${showPassword ? 'ri-eye-off-line' : 'ri-eye-line'} text-gray-400 hover:text-gray-600`}></i>
									</button>
								</div>
								{errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
							</div>

							<div className="flex items-center justify-between">
								<div className="flex items-center">
									<input type="checkbox" id="rememberMe" name="rememberMe" checked={formData.rememberMe} onChange={handleInputChange} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
									<label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
										Remember me
									</label>
								</div>
								<CustomLink href="/auth/forgot-password" className="text-sm text-blue-600 hover:text-blue-500">
									Forgot password?
								</CustomLink>
							</div>

							<Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium whitespace-nowrap">
								Sign In
							</Button>
						</form>

						<div className="mt-6 text-center">
							<p className="text-sm text-gray-600">
								Don't have an account?{' '}
								<CustomLink href="/auth/signup" className="text-blue-600 hover:text-blue-500 font-medium">
									Sign up
								</CustomLink>
							</p>
						</div>

						{false && (
							<div className="mt-6">
								<div className="relative">
									<div className="absolute inset-0 flex items-center">
										<div className="w-full border-t border-gray-300"></div>
									</div>
									<div className="relative flex justify-center text-sm">
										<span className="px-2 bg-white text-gray-500">Or continue with</span>
									</div>
								</div>

								<div className="mt-6 grid grid-cols-2 gap-3">
									<Button type="button" variant="outline" className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 whitespace-nowrap">
										<i className="ri-google-fill mr-2"></i>
										Google
									</Button>
									<Button type="button" variant="outline" className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 whitespace-nowrap">
										<i className="ri-facebook-fill mr-2"></i>
										Facebook
									</Button>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
