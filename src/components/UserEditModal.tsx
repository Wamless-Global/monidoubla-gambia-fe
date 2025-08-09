'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { User } from '@/app/(protected)/admin/users/content';
import { toast } from 'sonner';
import { loginAsUser as loginAsUserUtil, sendPasswordResetLink, resendVerificationEmail, setUserPassword, editUser } from '@/lib/userUtils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { logger } from '@/lib/logger';
import { Badge } from './ui/badge';

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
	const [activeTab, setActiveTab] = useState<'details' | 'security' | 'actions'>('details');

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
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-in fade-in-0 !m-0">
			<Card className="max-w-lg w-full bg-white shadow-lg border-slate-200 animate-in fade-in-0 zoom-in-95">
				<CardHeader>
					<div className="flex justify-between items-center">
						<div>
							<CardTitle>Edit User</CardTitle>
							<CardDescription>Manage user profile and security settings.</CardDescription>
						</div>
						<button onClick={onClose} disabled={loading} className="p-1 rounded-full text-slate-500 hover:bg-slate-100">
							<i className="ri-close-line text-xl"></i>
						</button>
					</div>
					<div className="border-b border-slate-200 -mx-6 mt-4">
						<nav className="flex gap-4 px-6">
							<button onClick={() => setActiveTab('details')} className={cn('py-3 text-sm font-medium', activeTab === 'details' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-slate-500 hover:text-slate-800')}>
								Details
							</button>
							<button onClick={() => setActiveTab('security')} className={cn('py-3 text-sm font-medium', activeTab === 'security' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-slate-500 hover:text-slate-800')}>
								Security
							</button>
							<button onClick={() => setActiveTab('actions')} className={cn('py-3 text-sm font-medium', activeTab === 'actions' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-slate-500 hover:text-slate-800')}>
								Actions
							</button>
						</nav>
					</div>
				</CardHeader>

				<form onSubmit={handleSubmit}>
					<CardContent className="max-h-[60vh] overflow-y-auto p-6">
						{activeTab === 'details' && (
							<div className="space-y-4">
								<div>
									<label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
									<input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={cn('w-full', errors.name && 'border-red-500')} disabled={loading} required />
									{errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
								</div>
								<div>
									<label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
									<input type="text" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} className={cn('w-full', errors.username && 'border-red-500')} disabled={loading} required />
									{errors.username && <p className="mt-1 text-sm text-red-600">{errors.username}</p>}
								</div>
								<div>
									<label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
									<input type="email" value={formData.email} className="w-full bg-slate-100 cursor-not-allowed" disabled={true} required />
								</div>
								<div>
									<label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
									<select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="w-full" disabled={loading} required>
										<option value="User">User</option>
										<option value="Admin">Admin</option>
										<option value="SuperAdmin">Super Admin</option>
									</select>
								</div>
							</div>
						)}
						{activeTab === 'security' && (
							<div className="space-y-4">
								<div className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
									<p className="text-sm font-medium text-slate-700">Email Status:</p>
									<Badge variant={formData.emailVerified ? 'success' : 'warning'}>{formData.emailVerified ? 'Verified' : 'Not Verified'}</Badge>
									{!formData.emailVerified && (
										<Button type="button" size="sm" onClick={handleVerifyEmail} disabled={verifyEmailLoading}>
											{' '}
											{verifyEmailLoading ? 'Sending...' : 'Send Verification'}
										</Button>
									)}
								</div>
								<div className="pt-4 space-y-2">
									<h4 className="font-medium text-slate-800">Password Actions</h4>
									<Button type="button" variant="outline" onClick={handleResetPassword} disabled={resetPasswordLoading} className="w-full justify-start">
										<i className="ri-mail-send-line mr-2"></i>Send Password Reset Link
									</Button>
									<Button type="button" variant="outline" onClick={() => setShowPasswordSection(!showPasswordSection)} className="w-full justify-start">
										<i className="ri-lock-password-line mr-2"></i>
										{showPasswordSection ? 'Cancel Set Password' : 'Set New Password'}
									</Button>
								</div>
								{showPasswordSection && (
									<div className="pt-4 border-t space-y-3">
										<input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={cn('w-full', errors.newPassword && 'border-red-500')} placeholder="New Password" />
										<input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={cn('w-full', errors.confirmPassword && 'border-red-500')} placeholder="Confirm New Password" />
										<Button type="button" onClick={handleSetPassword} disabled={setPasswordLoading} className="w-full">
											{setPasswordLoading ? 'Setting...' : 'Confirm New Password'}
										</Button>
									</div>
								)}
							</div>
						)}
						{activeTab === 'actions' && (
							<div className="space-y-4">
								<h4 className="font-medium text-slate-800">Impersonate User</h4>
								<p className="text-sm text-slate-500">Sign in as this user to troubleshoot issues. You will be logged out of your admin account.</p>
								<Button type="button" variant="outline" onClick={handleSignInAsUser} disabled={isImpersonating} className="w-full justify-start text-amber-700 border-amber-300 hover:bg-amber-50 hover:text-amber-800">
									<i className="ri-login-box-line mr-2"></i>
									{isImpersonating ? 'Signing in...' : 'Sign in as User'}
								</Button>
							</div>
						)}
					</CardContent>
					<CardFooter className="justify-end gap-3">
						<Button type="button" variant="outline" onClick={onClose}>
							Cancel
						</Button>
						<Button type="submit" disabled={loading} className="min-w-[120px]">
							{loading ? 'Saving...' : 'Save Changes'}
						</Button>
					</CardFooter>
				</form>
			</Card>
		</div>
	);
}
