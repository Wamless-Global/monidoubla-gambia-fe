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
		<div className="min-h-screen bg-gradient-to-br from-primary to-secondary flex items-center justify-center p-4 sm:p-8">
			<div className="container flex flex-col lg:flex-row gap-8">
				<div className="lg:w-1/3 bg-neutral-dark text-white p-8 rounded-lg shadow-xl flex flex-col justify-center">
					<h1 className="text-3xl font-bold mb-4">Welcome Back</h1>
					<p className="text-neutral-light">Sign in to access your Monidoublagambia account and continue your journey.</p>
				</div>
				<div className="lg:w-2/3 card">
					<div className="text-center mb-8">
						<h2 className="text-2xl font-bold">Sign In</h2>
						<p className="text-text-secondary">Access your Monidoublagambia account</p>
					</div>

					<form onSubmit={handleSubmit} className="space-y-6">
						<div>
							<label htmlFor="email" className="label">
								Email Address
							</label>
							<input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} className={`input ${errors.email ? 'border-red-500' : ''}`} placeholder="Enter your email" />
							{errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
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

						<div className="flex items-center justify-between">
							<div className="flex items-center">
								<input type="checkbox" id="rememberMe" name="rememberMe" checked={formData.rememberMe} onChange={handleInputChange} className="h-4 w-4 text-primary focus:ring-primary border-neutral-dark/20 rounded" />
								<label htmlFor="rememberMe" className="ml-2 block text-sm text-text-secondary">
									Remember me
								</label>
							</div>
							<CustomLink href="/auth/forgot-password" className="text-primary hover:text-secondary text-sm">
								Forgot password?
							</CustomLink>
						</div>

						<Button type="submit" className="button button-primary w-full">
							Sign In
						</Button>
					</form>

					<div className="mt-6 text-center">
						<p className="text-sm text-text-secondary">
							Don't have an account?{' '}
							<CustomLink href="/auth/signup" className="text-primary hover:text-secondary font-medium">
								Sign up
							</CustomLink>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
