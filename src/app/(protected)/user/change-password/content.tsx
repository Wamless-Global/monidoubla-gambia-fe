'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { handleFetchMessage } from '@/lib/helpers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChangePasswordSkeleton } from '@/components/LoadingSkeleton';

export default function ChangePasswordPage() {
	const [isLoading, setIsLoading] = useState(true);
	const [formData, setFormData] = useState({
		currentPassword: '',
		newPassword: '',
		confirmPassword: '',
	});
	const [errors, setErrors] = useState<{ [key: string]: string }>({});
	const [showPasswords, setShowPasswords] = useState({
		current: false,
		new: false,
		confirm: false,
	});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isSuccess, setIsSuccess] = useState(false);

	useEffect(() => {
		const loadPage = async () => {
			await new Promise((resolve) => setTimeout(resolve, 800));
			setIsLoading(false);
		};

		loadPage();
	}, []);

	const validateForm = () => {
		const newErrors: { [key: string]: string } = {};

		if (!formData.currentPassword) {
			newErrors.currentPassword = 'Current password is required';
		}

		if (!formData.newPassword) {
			newErrors.newPassword = 'New password is required';
		} else if (formData.newPassword.length < 8) {
			newErrors.newPassword = 'New password must be at least 8 characters long';
		} else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.newPassword)) {
			newErrors.newPassword = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
		}

		if (!formData.confirmPassword) {
			newErrors.confirmPassword = 'Please confirm your new password';
		} else if (formData.newPassword !== formData.confirmPassword) {
			newErrors.confirmPassword = 'Passwords do not match';
		}

		if (formData.currentPassword && formData.newPassword && formData.currentPassword === formData.newPassword) {
			newErrors.newPassword = 'New password must be different from current password';
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) {
			return;
		}

		setIsSubmitting(true);
		setIsSuccess(false);
		try {
			const response = await fetchWithAuth('/api/users/me/update-password', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					currentPassword: formData.currentPassword,
					newPassword: formData.newPassword,
					confirmPassword: formData.confirmPassword,
				}),
			});
			const data = await response.json();
			if (response.ok) {
				toast.success(data.message || 'Password updated successfully.');
				setIsSuccess(true);
				setFormData({
					currentPassword: '',
					newPassword: '',
					confirmPassword: '',
				});
			} else {
				toast.error(data.message || 'Failed to update password.');
			}
		} catch (err) {
			const errorMessage = handleFetchMessage(err);
			toast.error(errorMessage);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleInputChange = (field: string, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		if (errors[field]) {
			setErrors((prev) => ({ ...prev, [field]: '' }));
		}
		if (isSuccess) {
			setIsSuccess(false);
		}
	};

	const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
		setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
	};

	const getPasswordStrength = (password: string) => {
		let strength = 0;
		if (password.length >= 8) strength++;
		if (/[a-z]/.test(password)) strength++;
		if (/[A-Z]/.test(password)) strength++;
		if (/\d/.test(password)) strength++;
		if (/[^A-Za-z0-9]/.test(password)) strength++;
		return strength;
	};

	if (isLoading) {
		return <ChangePasswordSkeleton />;
	}

	const passwordStrength = getPasswordStrength(formData.newPassword);
	const strengthColors = ['bg-red-500', 'bg-red-400', 'bg-yellow-500', 'bg-yellow-400', 'bg-green-500'];
	const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];

	return (
		<div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-emerald-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 py-0 px-0 flex items-center justify-center">
			<div className="w-full max-w-lg mx-auto py-10 px-2 sm:px-6">
				<Card className="rounded-3xl shadow-2xl bg-white/90 dark:bg-gray-900/90 border-2 border-indigo-100 dark:border-indigo-900">
					<CardHeader className="bg-gradient-to-tr from-indigo-100 via-purple-100 to-emerald-100 dark:from-indigo-900 dark:via-purple-900 dark:to-emerald-900 rounded-t-3xl p-8">
						<CardTitle className="text-2xl font-extrabold text-indigo-900 dark:text-indigo-100 drop-shadow mb-2">Change Login Password</CardTitle>
					</CardHeader>
					<CardContent className="space-y-8 p-8">
						{isSuccess && (
							<div className="p-4 bg-gradient-to-tr from-emerald-100 via-green-100 to-indigo-100 dark:from-emerald-900 dark:via-green-900 dark:to-indigo-900 border border-emerald-200 dark:border-emerald-800 rounded-lg shadow">
								<div className="flex items-center gap-2">
									<i className="ri-check-circle-fill text-emerald-600 dark:text-emerald-300 w-5 h-5 flex items-center justify-center"></i>
									<p className="text-emerald-800 dark:text-emerald-200 text-sm font-bold">Password changed successfully!</p>
								</div>
							</div>
						)}
						<form onSubmit={handleSubmit} className="space-y-6">
							<div>
								<label htmlFor="currentPassword" className="block text-sm font-bold text-indigo-900 dark:text-indigo-100 mb-2">
									Current password
								</label>
								<div className="relative">
									<i className="ri-lock-line absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-300 dark:text-indigo-700 w-4 h-4 flex items-center justify-center"></i>
									<input
										id="currentPassword"
										type={showPasswords.current ? 'text' : 'password'}
										value={formData.currentPassword}
										onChange={(e) => handleInputChange('currentPassword', e.target.value)}
										className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-colors bg-white/80 dark:bg-gray-900/80 text-indigo-900 dark:text-indigo-100 placeholder:text-indigo-300 dark:placeholder:text-indigo-700 ${
											errors.currentPassword ? 'border-red-500' : 'border-indigo-200 dark:border-indigo-800'
										}`}
										placeholder="Enter your current password"
									/>
									<button type="button" onClick={() => togglePasswordVisibility('current')} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-indigo-300 dark:text-indigo-700 hover:text-indigo-500 dark:hover:text-indigo-300">
										<i className={`${showPasswords.current ? 'ri-eye-off-line' : 'ri-eye-line'} w-4 h-4 flex items-center justify-center`}></i>
									</button>
								</div>
								{errors.currentPassword && <p className="mt-1 text-sm text-red-500 font-bold">{errors.currentPassword}</p>}
							</div>
							<div>
								<label htmlFor="newPassword" className="block text-sm font-bold text-indigo-900 dark:text-indigo-100 mb-2">
									New Password
								</label>
								<div className="relative">
									<i className="ri-lock-line absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-300 dark:text-indigo-700 w-4 h-4 flex items-center justify-center"></i>
									<input
										id="newPassword"
										type={showPasswords.new ? 'text' : 'password'}
										value={formData.newPassword}
										onChange={(e) => handleInputChange('newPassword', e.target.value)}
										className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-colors bg-white/80 dark:bg-gray-900/80 text-indigo-900 dark:text-indigo-100 placeholder:text-indigo-300 dark:placeholder:text-indigo-700 ${
											errors.newPassword ? 'border-red-500' : 'border-indigo-200 dark:border-indigo-800'
										}`}
										placeholder="Enter your new password"
									/>
									<button type="button" onClick={() => togglePasswordVisibility('new')} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-indigo-300 dark:text-indigo-700 hover:text-indigo-500 dark:hover:text-indigo-300">
										<i className={`${showPasswords.new ? 'ri-eye-off-line' : 'ri-eye-line'} w-4 h-4 flex items-center justify-center`}></i>
									</button>
								</div>
								{formData.newPassword && (
									<div className="mt-2">
										<div className="flex gap-1 mb-1">
											{[...Array(5)].map((_, i) => (
												<div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i < passwordStrength ? strengthColors[passwordStrength - 1] : 'bg-indigo-100 dark:bg-indigo-800'}`} />
											))}
										</div>
										<p className="text-xs text-indigo-700 dark:text-indigo-200 font-bold">Password strength: {passwordStrength > 0 ? strengthLabels[passwordStrength - 1] : 'Too weak'}</p>
									</div>
								)}
								{errors.newPassword && <p className="mt-1 text-sm text-red-500 font-bold">{errors.newPassword}</p>}
							</div>
							<div>
								<label htmlFor="confirmPassword" className="block text-sm font-bold text-indigo-900 dark:text-indigo-100 mb-2">
									Confirm Password
								</label>
								<div className="relative">
									<i className="ri-lock-line absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-300 dark:text-indigo-700 w-4 h-4 flex items-center justify-center"></i>
									<input
										id="confirmPassword"
										type={showPasswords.confirm ? 'text' : 'password'}
										value={formData.confirmPassword}
										onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
										className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-colors bg-white/80 dark:bg-gray-900/80 text-indigo-900 dark:text-indigo-100 placeholder:text-indigo-300 dark:placeholder:text-indigo-700 ${
											errors.confirmPassword ? 'border-red-500' : 'border-indigo-200 dark:border-indigo-800'
										}`}
										placeholder="Enter your password again"
									/>
									<button type="button" onClick={() => togglePasswordVisibility('confirm')} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-indigo-300 dark:text-indigo-700 hover:text-indigo-500 dark:hover:text-indigo-300">
										<i className={`${showPasswords.confirm ? 'ri-eye-off-line' : 'ri-eye-line'} w-4 h-4 flex items-center justify-center`}></i>
									</button>
								</div>
								{errors.confirmPassword && <p className="mt-1 text-sm text-red-500 font-bold">{errors.confirmPassword}</p>}
							</div>
							<Button type="submit" className="w-full bg-gradient-to-tr from-indigo-600 via-purple-600 to-emerald-500 hover:from-indigo-700 hover:to-emerald-600 text-white font-bold rounded-xl py-3 shadow-lg" disabled={isSubmitting}>
								{isSubmitting ? (
									<>
										<i className="ri-loader-4-line animate-spin mr-2 w-4 h-4 flex items-center justify-center"></i>
										Changing Password...
									</>
								) : (
									'Save changes'
								)}
							</Button>
						</form>
						<div className="text-center">
							<button className="text-indigo-700 dark:text-indigo-200 hover:text-indigo-900 dark:hover:text-indigo-100 text-sm font-bold">Forgot password?</button>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
