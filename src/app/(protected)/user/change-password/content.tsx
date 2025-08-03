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
		<div className="p-4 lg:p-6 min-h-screen">
			<div className="max-w-md mx-auto">
				<Card className="border-0 shadow-2xl rounded-2xl bg-gradient-to-br from-white/80 to-blue-50/40 dark:from-blue-900/30 dark:to-blue-950/10">
					<CardHeader>
						<CardTitle className="text-3xl font-extrabold text-foreground tracking-tight">Change Login Password</CardTitle>
					</CardHeader>

					<CardContent className="space-y-8">
						{isSuccess && (
							<div className="p-4 bg-gradient-to-r from-green-100/80 to-green-50/40 dark:from-green-900/30 dark:to-green-950/10 border-0 rounded-xl shadow flex items-center gap-3">
								<i className="ri-check-circle-fill text-green-600 dark:text-green-400 w-6 h-6 flex items-center justify-center"></i>
								<p className="text-green-800 dark:text-green-200 text-base font-semibold">Password changed successfully!</p>
							</div>
						)}

						<form onSubmit={handleSubmit} className="space-y-6">
							<div>
								<label htmlFor="currentPassword" className="block text-base font-semibold text-foreground mb-2">
									Current password
								</label>
								<div className="relative">
									<i className="ri-lock-line absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 w-5 h-5 flex items-center justify-center"></i>
									<input
										id="currentPassword"
										type={showPasswords.current ? 'text' : 'password'}
										value={formData.currentPassword}
										onChange={(e) => handleInputChange('currentPassword', e.target.value)}
										className={`w-full pl-12 pr-12 py-3 border-0 rounded-xl shadow bg-gradient-to-r from-white/80 to-blue-50/40 dark:from-blue-900/20 dark:to-blue-950/5 text-base focus:ring-2 focus:ring-blue-400 focus:outline-none placeholder:text-blue-300 ${
											errors.currentPassword ? 'ring-2 ring-red-400' : ''
										}`}
										placeholder="Enter your current password"
									/>
									<button type="button" onClick={() => togglePasswordVisibility('current')} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-400 hover:text-blue-700">
										<i className={`${showPasswords.current ? 'ri-eye-off-line' : 'ri-eye-line'} w-5 h-5 flex items-center justify-center`}></i>
									</button>
								</div>
								{errors.currentPassword && <p className="mt-1 text-sm text-red-600">{errors.currentPassword}</p>}
							</div>

							<div>
								<label htmlFor="newPassword" className="block text-base font-semibold text-foreground mb-2">
									New Password
								</label>
								<div className="relative">
									<i className="ri-lock-line absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 w-5 h-5 flex items-center justify-center"></i>
									<input
										id="newPassword"
										type={showPasswords.new ? 'text' : 'password'}
										value={formData.newPassword}
										onChange={(e) => handleInputChange('newPassword', e.target.value)}
										className={`w-full pl-12 pr-12 py-3 border-0 rounded-xl shadow bg-gradient-to-r from-white/80 to-blue-50/40 dark:from-blue-900/20 dark:to-blue-950/5 text-base focus:ring-2 focus:ring-blue-400 focus:outline-none placeholder:text-blue-300 ${
											errors.newPassword ? 'ring-2 ring-red-400' : ''
										}`}
										placeholder="Enter your new password"
									/>
									<button type="button" onClick={() => togglePasswordVisibility('new')} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-400 hover:text-blue-700">
										<i className={`${showPasswords.new ? 'ri-eye-off-line' : 'ri-eye-line'} w-5 h-5 flex items-center justify-center`}></i>
									</button>
								</div>

								{formData.newPassword && (
									<div className="mt-3">
										<div className="flex gap-1 mb-1">
											{[...Array(5)].map((_, i) => (
												<div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i < passwordStrength ? strengthColors[passwordStrength - 1] : 'bg-blue-100 dark:bg-blue-900/20'}`} />
											))}
										</div>
										<p className="text-xs text-blue-400">Password strength: {passwordStrength > 0 ? strengthLabels[passwordStrength - 1] : 'Too weak'}</p>
									</div>
								)}

								{errors.newPassword && <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>}
							</div>

							<div>
								<label htmlFor="confirmPassword" className="block text-base font-semibold text-foreground mb-2">
									Confirm Password
								</label>
								<div className="relative">
									<i className="ri-lock-line absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 w-5 h-5 flex items-center justify-center"></i>
									<input
										id="confirmPassword"
										type={showPasswords.confirm ? 'text' : 'password'}
										value={formData.confirmPassword}
										onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
										className={`w-full pl-12 pr-12 py-3 border-0 rounded-xl shadow bg-gradient-to-r from-white/80 to-blue-50/40 dark:from-blue-900/20 dark:to-blue-950/5 text-base focus:ring-2 focus:ring-blue-400 focus:outline-none placeholder:text-blue-300 ${
											errors.confirmPassword ? 'ring-2 ring-red-400' : ''
										}`}
										placeholder="Enter your password again"
									/>
									<button type="button" onClick={() => togglePasswordVisibility('confirm')} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-400 hover:text-blue-700">
										<i className={`${showPasswords.confirm ? 'ri-eye-off-line' : 'ri-eye-line'} w-5 h-5 flex items-center justify-center`}></i>
									</button>
								</div>
								{errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
							</div>

							<Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white py-3 whitespace-nowrap rounded-xl shadow-lg text-lg font-semibold" disabled={isSubmitting}>
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
							<button className="text-blue-600 hover:text-blue-800 text-base font-semibold">Forgot password?</button>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
