'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { addUser } from '@/lib/userUtils';
import { toast } from 'sonner';
import { Country } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// NOTE: All original interfaces and logic are preserved.
interface User {
	id: string;
	name: string;
	username: string;
	email: string;
	role: string;
	country: string;
	dateJoined: string;
	avatar?: string;
	emailVerified: boolean;
}

interface UserAddModalProps {
	isOpen: boolean;
	onClose: () => void;
	onUserAdded?: (user: User) => void;
	countries: Country[];
}

export function UserAddModal({ isOpen, onClose, onUserAdded, countries }: UserAddModalProps) {
	const [formData, setFormData] = useState({ name: '', email: '', role: 'User', country: '', emailVerified: false, password: '', confirmPassword: '' });
	const [loading, setLoading] = useState(false);
	const [errors, setErrors] = useState<Record<string, string>>({});

	const validateForm = () => {
		const newErrors: Record<string, string> = {};
		if (!formData.name.trim()) newErrors.name = 'Name is required';
		else if (formData.name.length < 2) newErrors.name = 'Name must be at least 2 characters';
		if (!formData.email.trim()) newErrors.email = 'Email is required';
		else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Please enter a valid email address';
		if (!formData.password) newErrors.password = 'Password is required';
		else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
		else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
		if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
		else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!validateForm()) return;

		setLoading(true);
		try {
			const result = await addUser({
				name: formData?.name || '',
				email: formData.email,
				role: formData.role,
				country: formData.country,
				emailVerified: formData.emailVerified,
				password: formData.password,
				confirmPassword: formData.confirmPassword,
			});
			if (result.success && result.user) {
				if (onUserAdded) onUserAdded(result.user);
				handleClose();
			} else {
				toast.error((result as any).message || 'Failed to create user');
			}
		} catch (err) {
			toast.error('Failed to create user');
		}
		setLoading(false);
	};

	const handleClose = () => {
		if (!loading) {
			setFormData({ name: '', email: '', role: 'User', country: '', emailVerified: false, password: '', confirmPassword: '' });
			setErrors({});
			onClose();
		}
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-in fade-in-0 !m-0">
			<Card className="max-w-md w-full bg-white shadow-lg border-slate-200 animate-in fade-in-0 zoom-in-95">
				<CardHeader>
					<div className="flex justify-between items-center">
						<div>
							<CardTitle>Add New User</CardTitle>
							<CardDescription>Create a new user account and assign a role.</CardDescription>
						</div>
						<button onClick={handleClose} disabled={loading} className="p-1 rounded-full text-slate-500 hover:bg-slate-100">
							<i className="ri-close-line text-xl"></i>
						</button>
					</div>
				</CardHeader>
				<form onSubmit={handleSubmit}>
					<CardContent className="max-h-[60vh] overflow-y-auto p-6 space-y-4">
						<div>
							<label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
							<input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={cn('w-full', errors.name && 'border-red-500')} placeholder="Enter full name" disabled={loading} required />
							{errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
						</div>
						<div>
							<label className="block text-sm font-medium text-slate-700 mb-1">Email Address *</label>
							<input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className={cn('w-full', errors.email && 'border-red-500')} placeholder="Enter email address" disabled={loading} required />
							{errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
								<select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="w-full" disabled={loading} required>
									<option value="User">User</option>
									<option value="Admin">Admin</option>
									<option value="SuperAdmin">Super Admin</option>
								</select>
							</div>
							<div>
								<label className="block text-sm font-medium text-slate-700 mb-1">Country</label>
								<select value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} className="w-full" disabled={loading} required>
									{countries.map((country) => (
										<option key={country.code} value={country.id}>
											{country.name}
										</option>
									))}
								</select>
							</div>
						</div>
						<div>
							<label className="block text-sm font-medium text-slate-700 mb-1">Password *</label>
							<input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className={cn('w-full', errors.password && 'border-red-500')} placeholder="Enter password" disabled={loading} required />
							{errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
						</div>
						<div>
							<label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password *</label>
							<input type="password" value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} className={cn('w-full', errors.confirmPassword && 'border-red-500')} placeholder="Confirm password" disabled={loading} required />
							{errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
						</div>
						<div className="flex items-center gap-2 pt-2">
							<input type="checkbox" checked={formData.emailVerified} onChange={(e) => setFormData({ ...formData, emailVerified: e.target.checked })} id="emailVerifiedAdd" className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" disabled={loading} />
							<label htmlFor="emailVerifiedAdd" className="text-sm font-medium text-slate-700">
								Mark email as verified
							</label>
						</div>
					</CardContent>
					<CardFooter className="justify-end gap-3">
						<Button type="button" onClick={handleClose} variant="outline" disabled={loading}>
							Cancel
						</Button>
						<Button type="submit" disabled={loading} className="min-w-[120px]">
							{loading ? 'Creating...' : 'Create User'}
						</Button>
					</CardFooter>
				</form>
			</Card>
		</div>
	);
}
