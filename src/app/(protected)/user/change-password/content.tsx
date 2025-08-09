'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { handleFetchMessage } from '@/lib/helpers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { ChangePasswordSkeleton } from '@/components/LoadingSkeleton';
import { CustomLink } from '@/components/CustomLink';

export default function ChangePasswordPage() {
	// NOTE: All original state and logic are preserved.
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
				headers: { 'Content-Type': 'application/json' },
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
				setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
			} else {
				toast.error(handleFetchMessage(data, 'Failed to update password.'));
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
	// Redesigned strength meter to use consistent Teal accent color
	const strengthColors = ['bg-teal-100', 'bg-teal-200', 'bg-teal-300', 'bg-teal-500', 'bg-teal-600'];
	const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];

	// ===============================================
	// START: Redesigned JSX
	// ===============================================
	return (
		<div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8">
			<div className="max-w-md mx-auto">
				<header className="mb-8 text-center">
					<h1 className="text-3xl font-bold text-gray-800">Security</h1>
					<p className="text-gray-500 mt-1">Manage your account password.</p>
				</header>

				<Card>
					<CardHeader>
						<CardTitle>Change Password</CardTitle>
						<CardDescription>For your security, we recommend choosing a strong password that you don't use elsewhere.</CardDescription>
					</CardHeader>

					<form onSubmit={handleSubmit}>
						<CardContent className="space-y-6">
							{isSuccess && (
								<div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
									<i className="ri-checkbox-circle-fill text-green-600"></i>
									<p className="text-green-800 text-sm font-medium">Password changed successfully!</p>
								</div>
							)}

							<div>
								<label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
									Current Password
								</label>
								<div className="relative">
									<input
										id="currentPassword"
										type={showPasswords.current ? 'text' : 'password'}
										value={formData.currentPassword}
										onChange={(e) => handleInputChange('currentPassword', e.target.value)}
										className={`w-full px-3 pr-10 py-2 border rounded-lg focus:ring-2 transition-colors ${errors.currentPassword ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-teal-500'}`}
										placeholder="Enter your current password"
									/>
									<button type="button" onClick={() => togglePasswordVisibility('current')} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-700">
										<i className={showPasswords.current ? 'ri-eye-off-line' : 'ri-eye-line'}></i>
									</button>
								</div>
								{errors.currentPassword && <p className="mt-1 text-sm text-red-600">{errors.currentPassword}</p>}
							</div>

							<div>
								<label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
									New Password
								</label>
								<div className="relative">
									<input
										id="newPassword"
										type={showPasswords.new ? 'text' : 'password'}
										value={formData.newPassword}
										onChange={(e) => handleInputChange('newPassword', e.target.value)}
										className={`w-full px-3 pr-10 py-2 border rounded-lg focus:ring-2 transition-colors ${errors.newPassword ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-teal-500'}`}
										placeholder="Enter your new password"
									/>
									<button type="button" onClick={() => togglePasswordVisibility('new')} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-700">
										<i className={showPasswords.new ? 'ri-eye-off-line' : 'ri-eye-line'}></i>
									</button>
								</div>

								{formData.newPassword && (
									<div className="mt-2 space-y-1">
										<div className="flex gap-1.5">
											{[...Array(5)].map((_, i) => (
												<div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i < passwordStrength ? strengthColors[passwordStrength - 1] : 'bg-gray-200'}`} />
											))}
										</div>
										<p className="text-xs font-medium" style={{ color: passwordStrength > 0 ? strengthColors[passwordStrength - 1] : 'inherit' }}>
											Strength: {passwordStrength > 0 ? strengthLabels[passwordStrength - 1] : 'Too weak'}
										</p>
									</div>
								)}

								{errors.newPassword && <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>}
							</div>

							<div>
								<label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
									Confirm New Password
								</label>
								<div className="relative">
									<input
										id="confirmPassword"
										type={showPasswords.confirm ? 'text' : 'password'}
										value={formData.confirmPassword}
										onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
										className={`w-full px-3 pr-10 py-2 border rounded-lg focus:ring-2 transition-colors ${errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-teal-500'}`}
										placeholder="Enter your new password again"
									/>
									<button type="button" onClick={() => togglePasswordVisibility('confirm')} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-700">
										<i className={showPasswords.confirm ? 'ri-eye-off-line' : 'ri-eye-line'}></i>
									</button>
								</div>
								{errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
							</div>
						</CardContent>

						<CardFooter className="flex flex-col gap-4">
							<Button type="submit" className="w-full" disabled={isSubmitting}>
								{isSubmitting ? 'Changing Password...' : 'Save Changes'}
							</Button>
							<CustomLink href="/user/profile">
								<Button variant="ghost">Back to Profile</Button>
							</CustomLink>
						</CardFooter>
					</form>
				</Card>
			</div>
		</div>
	);
}
