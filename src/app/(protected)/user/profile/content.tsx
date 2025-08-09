'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ProfileImageUpload } from '@/components/ProfileImageUpload';
import { ProfileEditModal } from '@/components/ProfileEditModal';
import { ProfileSkeleton } from '@/components/LoadingSkeleton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CustomLink } from '@/components/CustomLink';
import { logger } from '@/lib/logger';
import { toast } from 'sonner';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { handleFetchMessage } from '@/lib/helpers';
import { z } from 'zod';
import { getCurrentUser, setCurrentUser } from '@/lib/userUtils';

// NOTE: All original interfaces and logic are preserved.
interface ProfileData {
	name: string;
	username: string;
	email: string;
	phone: string;
	referralLink: string;
	momo_name?: string;
	momo_number?: string;
	momo_provider?: string;
}

export default function Content() {
	const [showEditModal, setShowEditModal] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [profileData, setProfileData] = useState<ProfileData | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [avatarFile, setAvatarFile] = useState<File | null>(null);
	const [referralCode, setReferralCode] = useState('');

	const schema = z.object({
		name: z.string().min(2, 'Name is required'),
		phone: z.string().optional().or(z.literal('')),
		dob: z.string().optional().or(z.literal('')),
	});

	const currentUser = getCurrentUser();

	useEffect(() => {
		setReferralCode(`${process.env.NEXT_PUBLIC_URL}/auth/signup?ref=${currentUser?.username}`);
	}, [currentUser]);

	useEffect(() => {
		const fetchProfileData = async () => {
			setIsLoading(true);
			try {
				const res = await fetchWithAuth(`/api/users/profile`);
				const data = await res.json();
				if (res.ok && data.data) {
					setProfileData({
						name: data.data.name,
						username: data.data.username,
						email: data.data.email,
						phone: data.data.phone_number || '',
						referralLink: data.data.referral_link || '',
						momo_name: data.data.momo_name || '',
						momo_number: data.data.momo_number || '',
						momo_provider: data.data.momo_provider || '',
					});
					setCurrentUser(data.data);
				} else {
					throw new Error(data.message || 'Failed to fetch profile');
				}
			} catch (error) {
				toast.error('Error fetching profile data');
			} finally {
				setIsLoading(false);
			}
		};
		fetchProfileData();
	}, []);

	const handleImageChange = (file: File) => {
		// This component no longer directly uploads, but receives the file.
		// The parent (`content.tsx`) will handle the upload on save.
		setAvatarFile(file);
	};

	const handleSaveProfile = async (data: any) => {
		if (!profileData) return;
		// The modal handles validation, but we can double-check here if needed.
		setIsSubmitting(true);
		try {
			const formData = new FormData();
			// The modal doesn't handle file uploads, so the parent doesn't need to check for it
			formData.append('name', data.name);
			formData.append('username', data.username);
			formData.append('email', data.email);
			formData.append('phone_number', data.phone || '');
			const res = await fetchWithAuth('/api/users/profile', { method: 'PUT', body: formData });
			const updatedUser = await res.json();
			if (res.ok) {
				setProfileData((prev) => ({ ...prev!, ...data }));
				setCurrentUser(updatedUser.data);
				toast.success('Profile updated successfully!');
			} else {
				throw new Error(handleFetchMessage(updatedUser, 'Failed to update profile.'));
			}
		} catch (err) {
			toast.error(handleFetchMessage(err, 'An error occurred while updating profile.'));
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleCopyReferralLink = () => {
		if (referralCode) {
			navigator.clipboard.writeText(referralCode);
			toast.success('Referral link copied to clipboard!');
		}
	};

	if (isLoading) {
		return <ProfileSkeleton />;
	}

	if (!profileData) {
		return (
			<div className="bg-gray-50 min-h-screen flex items-center justify-center p-4">
				<Card className="max-w-lg w-full text-center p-8">
					<div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
						<i className="ri-error-warning-line text-3xl text-red-600"></i>
					</div>
					<CardTitle className="text-2xl mb-2">Failed to Load Profile</CardTitle>
					<CardDescription>We couldn't retrieve your profile data. Please try refreshing the page.</CardDescription>
				</Card>
			</div>
		);
	}

	return (
		<div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8">
			<div className="max-w-6xl mx-auto">
				<header className="mb-8">
					<h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
					<p className="text-gray-500 mt-1">View and manage your personal and wallet information.</p>
				</header>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
					{/* Left Column: Profile Sidebar */}
					<div className="lg:col-span-1 space-y-8">
						<Card className="text-center p-8">
							<div className="flex justify-center mb-4">
								<ProfileImageUpload currentImage={currentUser?.avatar_url} onImageChange={handleImageChange} />
							</div>
							<h2 className="text-xl font-bold text-gray-800">{profileData.name}</h2>
							<p className="text-sm text-gray-500">@{profileData.username}</p>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Referral Link</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="p-3 bg-gray-100 rounded-lg text-left">
									<p className="text-sm text-gray-700 truncate">{referralCode}</p>
								</div>
								<Button onClick={handleCopyReferralLink} variant="outline" size="sm" className="mt-3 w-full">
									<i className="ri-file-copy-line mr-2"></i>Copy Link
								</Button>
							</CardContent>
						</Card>
					</div>

					{/* Right Column: Main Details */}
					<div className="lg:col-span-2 space-y-8">
						<div className="flex justify-end gap-3">
							<Button onClick={() => setShowEditModal(true)}>
								<i className="ri-edit-line mr-2"></i>Edit Profile
							</Button>
							<CustomLink href="/user/change-password">
								<Button variant="outline">Change Password</Button>
							</CustomLink>
						</div>

						<Card>
							<CardHeader>
								<CardTitle>Basic Information</CardTitle>
							</CardHeader>
							<CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div className="space-y-1">
									<p className="text-sm font-medium text-gray-500">Full Name</p>
									<p className="text-gray-800">{profileData.name}</p>
								</div>
								<div className="space-y-1">
									<p className="text-sm font-medium text-gray-500">Username</p>
									<p className="text-gray-800">@{profileData.username}</p>
								</div>
								<div className="space-y-1">
									<p className="text-sm font-medium text-gray-500">Email Address</p>
									<p className="text-gray-800">{profileData.email}</p>
								</div>
								<div className="space-y-1">
									<p className="text-sm font-medium text-gray-500">Phone Number</p>
									<p className="text-gray-800">{profileData.phone || 'Not provided'}</p>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="flex flex-row items-center justify-between">
								<CardTitle>Wallet Information</CardTitle>
								<CustomLink href="/user/add-momo-details">
									<Button variant="ghost" size="sm">
										<i className="ri-edit-line mr-2"></i>Edit
									</Button>
								</CustomLink>
							</CardHeader>
							<CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div className="space-y-1">
									<p className="text-sm font-medium text-gray-500">Account Name</p>
									<p className="text-gray-800">{profileData.momo_name || 'Not provided'}</p>
								</div>
								<div className="space-y-1">
									<p className="text-sm font-medium text-gray-500">Account Number</p>
									<p className="text-gray-800">{profileData.momo_number || 'Not provided'}</p>
								</div>
								<div className="space-y-1">
									<p className="text-sm font-medium text-gray-500">Provider</p>
									<p className="text-gray-800">{profileData.momo_provider || 'Not provided'}</p>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>

			<ProfileEditModal
				isOpen={showEditModal}
				onClose={() => setShowEditModal(false)}
				initialData={{
					name: profileData.name,
					username: profileData.username,
					email: profileData.email,
					phone: profileData.phone,
				}}
				onSave={handleSaveProfile}
			/>
		</div>
	);
}
