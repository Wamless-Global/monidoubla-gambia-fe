'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { User } from '@/app/(protected)/admin/users/content';
import { toast } from 'sonner';
import { loginAsUser as loginAsUserUtil, sendPasswordResetLink, resendVerificationEmail, setUserPassword, editUser } from '@/lib/userUtils';
import { logger } from '@/lib/logger';

interface UserEditModalProps {
	isOpen: boolean;
	onClose: () => void;
	user: User | null;
	onUserUpdated?: (user: User) => void;
}

export function UserEditModal({ isOpen, onClose, user, onUserUpdated }: UserEditModalProps) {
	logger.log('UserEditModal', { isOpen, user });
	const [formData, setFormData] = useState<User>({
		id: '',
		name: '',
		username: '',
		email: '',
		role: '',
		location: '',
		dateJoined: '',
		emailVerified: false,
	});
	const [loading, setLoading] = useState(false);
	const [resetPasswordLoading, setResetPasswordLoading] = useState(false);
	const [setPasswordLoading, setSetPasswordLoading] = useState(false);
	const [verifyEmailLoading, setVerifyEmailLoading] = useState(false);
	const [isImpersonating, setIsImpersonating] = useState(false);
	const router = useRouter();
	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [showPasswordSection, setShowPasswordSection] = useState(false);
	const [errors, setErrors] = useState<Record<string, string>>({});

	useEffect(() => {
		if (user) {
			setFormData({ ...user, emailVerified: user.emailVerified || false });
		}
		setErrors({});
		setShowPasswordSection(false);
		setNewPassword('');
		setConfirmPassword('');
	}, [user]);

	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = 'unset';
		}

		return () => {
			document.body.style.overflow = 'unset';
		};
	}, [isOpen]);

	const validateForm = () => {
		const newErrors: Record<string, string> = {};

		if (!formData.name.trim()) {
			newErrors.name = 'Name is required';
		} else if (formData.name.length < 2) {
			newErrors.name = 'Name must be at least 2 characters';
		}

		if (!formData.username.trim()) {
			newErrors.username = 'Username is required';
		} else if (formData.username.length < 3) {
			newErrors.username = 'Username must be at least 3 characters';
		} else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
			newErrors.username = 'Username can only contain letters, numbers, and underscores';
		}

		if (!formData.email.trim()) {
			newErrors.email = 'Email is required';
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
			newErrors.email = 'Please enter a valid email address';
		}

		if (!formData.location.trim()) {
			newErrors.location = 'Location is required';
		}

		if (showPasswordSection) {
			if (!newPassword.trim()) {
				newErrors.newPassword = 'New password is required';
			} else if (newPassword.length < 8) {
				newErrors.newPassword = 'Password must be at least 8 characters';
			}

			if (!confirmPassword.trim()) {
				newErrors.confirmPassword = 'Please confirm the password';
			} else if (newPassword !== confirmPassword) {
				newErrors.confirmPassword = 'Passwords do not match';
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
		try {
			const result = await editUser(formData);
			if (result.success) {
				toast.success('User updated successfully');
				if (onUserUpdated) onUserUpdated(formData);
				setShowPasswordSection(false);
				setNewPassword('');
				setConfirmPassword('');
				onClose();
			} else {
				toast.error((result as any).message || 'Failed to update user');
			}
		} catch (error) {
			toast.error('Failed to update user');
		}
		setLoading(false);
	};

	const handleResetPassword = async () => {
		setResetPasswordLoading(true);
		await sendPasswordResetLink(formData.email);
		setResetPasswordLoading(false);
	};

	const handleVerifyEmail = async () => {
		setVerifyEmailLoading(true);
		await resendVerificationEmail(formData.email);
		setVerifyEmailLoading(false);
	};

	const handleSetPassword = async () => {
		if (!newPassword.trim()) {
			setErrors((prev) => ({ ...prev, newPassword: 'New password is required' }));
			return;
		}
		if (newPassword.length < 8) {
			setErrors((prev) => ({ ...prev, newPassword: 'Password must be at least 8 characters' }));
			return;
		}
		if (newPassword !== confirmPassword) {
			setErrors((prev) => ({ ...prev, confirmPassword: 'Passwords do not match' }));
			return;
		}
		setSetPasswordLoading(true);
		await setUserPassword(formData.id, newPassword, confirmPassword);
		setSetPasswordLoading(false);
		setShowPasswordSection(false);
		setNewPassword('');
		setConfirmPassword('');
		setErrors({});
	};

	const handleSignInAsUser = async () => {
		if (!formData) return;
		setIsImpersonating(true);
		const result = await loginAsUserUtil(formData.id);
		if (result.success && result.link) {
			router.push(result.link);
		}
		setIsImpersonating(false);
	};

	if (!isOpen || !user) return null;

	return (
		<>
			<div className="fixed inset-0 bg-black bg-opacity-50 z-50 !mt-0" onClick={onClose} />

			<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
					<div className="p-6">
						<div className="flex items-center justify-between mb-6">
							<h3 className="text-lg font-semibold text-gray-900 dark:text-white">Edit User</h3>
							<button onClick={onClose} disabled={loading || resetPasswordLoading || setPasswordLoading || verifyEmailLoading} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50">
								<i className="ri-close-line w-5 h-5 flex items-center justify-center text-gray-600 dark:text-gray-400"></i>
							</button>
						</div>

						<form onSubmit={handleSubmit} className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
								<input
									type="text"
									value={formData.name}
									onChange={(e) => setFormData({ ...formData, name: e.target.value })}
									className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${errors.name ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
									disabled={loading || resetPasswordLoading || setPasswordLoading || verifyEmailLoading}
									required
								/>
								{errors.name && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>}
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username</label>
								<input
									type="text"
									value={formData.username}
									onChange={(e) => setFormData({ ...formData, username: e.target.value })}
									className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${errors.username ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
									disabled={loading || resetPasswordLoading || setPasswordLoading || verifyEmailLoading}
									required
								/>
								{errors.username && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.username}</p>}
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
								<div className="space-y-2">
									<input type="email" value={formData.email} className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white cursor-not-allowed `} disabled={true} required />
									{errors.email && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>}

									<div className="flex items-center gap-2">
										<span className={`px-2 py-1 rounded-full text-xs font-medium ${formData.emailVerified ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'}`}>
											{formData.emailVerified ? 'Verified' : 'Not Verified'}
										</span>
										{!formData.emailVerified && (
											<Button type="button" size="sm" onClick={handleVerifyEmail} disabled={loading || resetPasswordLoading || setPasswordLoading || verifyEmailLoading} className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 h-7 whitespace-nowrap">
												{verifyEmailLoading ? (
													<div className="flex items-center gap-1">
														<div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
														<span>Verifying...</span>
													</div>
												) : (
													'Verify Email'
												)}
											</Button>
										)}
									</div>
								</div>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
								<select
									value={formData.role}
									onChange={(e) => setFormData({ ...formData, role: e.target.value })}
									className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white pr-8"
									disabled={loading || resetPasswordLoading || setPasswordLoading || verifyEmailLoading}
									required
								>
									<option value="User">User</option>
									<option value="Admin">Admin</option>
									<option value="SuperAdmin">Super Admin</option>
								</select>
							</div>

							{/* Password Section */}
							<div className="border-t border-gray-200 dark:border-gray-700 pt-4">
								<div className="flex items-center justify-between mb-4">
									<h4 className="text-sm font-medium text-gray-900 dark:text-white">Password Actions</h4>
								</div>

								<div className="flex flex-col gap-2 mb-4">
									<Button
										type="button"
										variant="outline"
										onClick={handleResetPassword}
										disabled={loading || resetPasswordLoading || setPasswordLoading || verifyEmailLoading}
										className="w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 whitespace-nowrap"
									>
										{resetPasswordLoading ? (
											<div className="flex items-center gap-2">
												<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
												<span>Sending Reset Link...</span>
											</div>
										) : (
											<>
												<i className="ri-mail-send-line w-4 h-4 flex items-center justify-center mr-2"></i>
												Send Password Reset Link
											</>
										)}
									</Button>

									<Button
										type="button"
										variant="outline"
										onClick={() => setShowPasswordSection(!showPasswordSection)}
										disabled={loading || resetPasswordLoading || setPasswordLoading || verifyEmailLoading}
										className="w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 whitespace-nowrap"
									>
										<i className="ri-lock-password-line w-4 h-4 flex items-center justify-center mr-2"></i>
										{showPasswordSection ? 'Cancel Set Password' : 'Set New Password'}
									</Button>
								</div>

								{showPasswordSection && (
									<div className="space-y-3">
										<div>
											<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
											<input
												type="password"
												value={newPassword}
												onChange={(e) => setNewPassword(e.target.value)}
												className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
													errors.newPassword ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
												}`}
												disabled={loading || resetPasswordLoading || setPasswordLoading || verifyEmailLoading}
												placeholder="Enter new password"
											/>
											{errors.newPassword && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.newPassword}</p>}
										</div>

										<div>
											<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm Password</label>
											<input
												type="password"
												value={confirmPassword}
												onChange={(e) => setConfirmPassword(e.target.value)}
												className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
													errors.confirmPassword ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
												}`}
												disabled={loading || resetPasswordLoading || setPasswordLoading || verifyEmailLoading}
												placeholder="Confirm new password"
											/>
											{errors.confirmPassword && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.confirmPassword}</p>}
										</div>

										<Button type="button" onClick={handleSetPassword} disabled={loading || resetPasswordLoading || setPasswordLoading || verifyEmailLoading} className="w-full bg-green-600 hover:bg-green-700 text-white whitespace-nowrap">
											{setPasswordLoading ? (
												<div className="flex items-center gap-2">
													<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
													<span>Setting Password...</span>
												</div>
											) : (
												<>
													<i className="ri-check-line w-4 h-4 flex items-center justify-center mr-2"></i>
													Set Password
												</>
											)}
										</Button>
									</div>
								)}
							</div>

							<div className="flex flex-col gap-3 pt-4">
								<Button type="submit" disabled={loading || resetPasswordLoading || setPasswordLoading || verifyEmailLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white whitespace-nowrap min-h-[40px]">
									{loading ? (
										<div className="flex items-center gap-2">
											<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
											<span>Updating...</span>
										</div>
									) : (
										'Save Changes'
									)}
								</Button>
								<Button
									type="button"
									variant="outline"
									onClick={handleSignInAsUser}
									disabled={loading || resetPasswordLoading || setPasswordLoading || verifyEmailLoading || isImpersonating}
									className="w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 whitespace-nowrap"
								>
									<i className="ri-login-box-line w-4 h-4 flex items-center justify-center mr-2"></i>
									{isImpersonating ? <span>Signing in...</span> : 'Sign in as User'}
								</Button>
							</div>
						</form>
					</div>
				</div>
			</div>
		</>
	);
}
