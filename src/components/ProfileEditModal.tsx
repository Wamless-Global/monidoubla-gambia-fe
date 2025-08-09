'use client';

import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from './ui/card';

// NOTE: All original props and logic are preserved.
interface ProfileEditModalProps {
	isOpen: boolean;
	onClose: () => void;
	initialData: {
		name: string;
		username: string;
		email: string;
		phone: string;
	};
	onSave: (data: any) => void;
}

export function ProfileEditModal({ isOpen, onClose, initialData, onSave }: ProfileEditModalProps) {
	const [formData, setFormData] = useState(initialData);
	const [errors, setErrors] = useState<{ [key: string]: string }>({});
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		if (isOpen) {
			setFormData(initialData);
			setErrors({});
		}
	}, [isOpen, initialData]);

	const validateForm = () => {
		const newErrors: { [key: string]: string } = {};
		if (!formData.name.trim()) newErrors.name = 'Name is required';
		if (!formData.username.trim()) newErrors.username = 'Username is required';
		else if (formData.username.length < 3) newErrors.username = 'Username must be at least 3 characters';
		if (!formData.email.trim()) newErrors.email = 'Email is required';
		else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Please enter a valid email address';
		if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
		else if (!/^\d{10,15}$/.test(formData.phone.replace(/\s/g, ''))) newErrors.phone = 'Please enter a valid phone number';
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!validateForm()) return;
		setIsSubmitting(true);
		try {
			// The onSave function now handles the API call and success/error states
			await onSave(formData);
			onClose();
		} catch (error) {
			// Parent component will show toast error
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleInputChange = (field: string, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
	};

	if (!isOpen) return null;

	// ===============================================
	// START: Redesigned JSX
	// ===============================================
	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-in fade-in-0 !m-0">
			<Card className="relative w-full max-w-md bg-white shadow-lg border-gray-200 animate-in fade-in-0 zoom-in-95">
				<CardHeader>
					<CardTitle>Edit Basic Information</CardTitle>
					<CardDescription>Make sure your details are up to date.</CardDescription>
				</CardHeader>
				<form onSubmit={handleSubmit}>
					<CardContent className="space-y-4">
						<div>
							<label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
								Full Name
							</label>
							<input
								id="name"
								type="text"
								value={formData.name}
								onChange={(e) => handleInputChange('name', e.target.value)}
								className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-teal-500 transition-colors ${errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-teal-500'}`}
							/>
							{errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
						</div>
						<div>
							<label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
								Username
							</label>
							<input
								id="username"
								type="text"
								value={formData.username}
								onChange={(e) => handleInputChange('username', e.target.value)}
								className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-teal-500 transition-colors ${errors.username ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-teal-500'}`}
							/>
							{errors.username && <p className="mt-1 text-sm text-red-600">{errors.username}</p>}
						</div>
						<div>
							<label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
								Email Address
							</label>
							<input
								id="email"
								type="email"
								value={formData.email}
								onChange={(e) => handleInputChange('email', e.target.value)}
								className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-teal-500 transition-colors ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-teal-500'}`}
							/>
							{errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
						</div>
						<div>
							<label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
								Phone Number
							</label>
							<input
								id="phone"
								type="tel"
								value={formData.phone}
								onChange={(e) => handleInputChange('phone', e.target.value)}
								className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-teal-500 transition-colors ${errors.phone ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-teal-500'}`}
							/>
							{errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
						</div>
					</CardContent>
					<CardFooter className="bg-gray-50 p-4 flex justify-end gap-3">
						<Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
							Cancel
						</Button>
						<Button type="submit" disabled={isSubmitting} className="min-w-[120px]">
							{isSubmitting ? 'Saving...' : 'Save Changes'}
						</Button>
					</CardFooter>
				</form>
			</Card>
		</div>
	);
}
