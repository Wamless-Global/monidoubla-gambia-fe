'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { addUser } from '@/lib/userUtils';
import { toast } from 'sonner';
import { Country } from '@/types';

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
	onUserAdded?: (user: User) => void; // optional callback for parent refresh
	countries: Country[];
}

export function UserAddModal({ isOpen, onClose, onUserAdded, countries }: UserAddModalProps) {
	const [formData, setFormData] = useState({
		name: '',
		email: '',
		role: 'User',
		country: '',
		emailVerified: false,
		password: '',
		confirmPassword: '',
	});
	const [loading, setLoading] = useState(false);
	const [errors, setErrors] = useState<Record<string, string>>({});

	const validateForm = () => {
		const newErrors: Record<string, string> = {};

		if (!formData.name.trim()) {
			newErrors.name = 'Name is required';
		} else if (formData.name.length < 2) {
			newErrors.name = 'Name must be at least 2 characters';
		}

		if (!formData.email.trim()) {
			newErrors.email = 'Email is required';
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
			newErrors.email = 'Please enter a valid email address';
		}

		if (!formData.password) {
			newErrors.password = 'Password is required';
		} else if (formData.password.length < 8) {
			newErrors.password = 'Password must be at least 8 characters';
		} else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
			newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
		}

		if (!formData.confirmPassword) {
			newErrors.confirmPassword = 'Please confirm your password';
		} else if (formData.password !== formData.confirmPassword) {
			newErrors.confirmPassword = 'Passwords do not match';
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
				setFormData({
					name: '',
					email: '',
					role: 'User',
					country: 'Accra, Ghana',
					emailVerified: false,
					password: '',
					confirmPassword: '',
				});
				setErrors({});
				onClose();
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
			setFormData({
				name: '',
				email: '',
				role: 'User',
				country: 'Accra, Ghana',
				emailVerified: false,
				password: '',
				confirmPassword: '',
			});
			setErrors({});
			onClose();
		}
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 !m-0">
			<div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
				<div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
					<h2 className="text-xl font-semibold text-gray-900 dark:text-white">Add New User</h2>
					<button onClick={handleClose} disabled={loading} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer disabled:opacity-50">
						<i className="ri-close-line w-6 h-6 flex items-center justify-center"></i>
					</button>
				</div>

				<form onSubmit={handleSubmit} className="p-6 space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name</label>
						<input
							type="text"
							value={formData.name}
							onChange={(e) => setFormData({ ...formData, name: e.target.value })}
							className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${errors.name ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
							placeholder="Enter full name"
							disabled={loading}
							required
						/>
						{errors.name && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>}
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
						<input
							type="email"
							value={formData.email}
							onChange={(e) => setFormData({ ...formData, email: e.target.value })}
							className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${errors.email ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
							placeholder="Enter email address"
							disabled={loading}
							required
						/>
						{errors.email && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>}
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Role</label>
						<select
							value={formData.role}
							onChange={(e) => setFormData({ ...formData, role: e.target.value })}
							className="w-full px-3 py-2 pr-8 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
							disabled={loading}
							required
						>
							<option value="User">User</option>
							<option value="Admin">Admin</option>
							<option value="SuperAdmin">Super Admin</option>
						</select>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Country</label>
						<select
							value={formData.country}
							onChange={(e) => setFormData({ ...formData, country: e.target.value })}
							className="w-full px-3 py-2 pr-8 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
							disabled={loading}
							required
						>
							{countries.map((country) => (
								<option key={country.code} value={country.id}>
									{country.name}
								</option>
							))}
						</select>
					</div>

					<div>
						<label className="flex items-center gap-2 cursor-pointer">
							<input
								type="checkbox"
								checked={formData.emailVerified}
								onChange={(e) => setFormData({ ...formData, emailVerified: e.target.checked })}
								className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
								disabled={loading}
							/>
							<span className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Verified</span>
						</label>
						<p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Check this if the user's email should be marked as verified</p>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password</label>
						<input
							type="password"
							value={formData.password}
							onChange={(e) => setFormData({ ...formData, password: e.target.value })}
							className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${errors.password ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
							placeholder="Enter password"
							disabled={loading}
							required
						/>
						{errors.password && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>}
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirm Password</label>
						<input
							type="password"
							value={formData.confirmPassword}
							onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
							className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${errors.confirmPassword ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
							placeholder="Confirm password"
							disabled={loading}
							required
						/>
						{errors.confirmPassword && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.confirmPassword}</p>}
					</div>

					<div className="flex justify-end gap-3 pt-4">
						<Button type="button" onClick={handleClose} variant="outline" disabled={loading} className="whitespace-nowrap bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600">
							Cancel
						</Button>
						<Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white whitespace-nowrap min-w-[120px]">
							{loading ? (
								<div className="flex items-center gap-2">
									<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
									<span>Creating...</span>
								</div>
							) : (
								'Create User'
							)}
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
}
