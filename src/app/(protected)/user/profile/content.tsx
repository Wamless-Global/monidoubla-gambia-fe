'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ProfileImageUpload } from '@/components/ProfileImageUpload';
import { ProfileEditModal } from '@/components/ProfileEditModal';
import { ProfileSkeleton } from '@/components/LoadingSkeleton';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CustomLink } from '@/components/CustomLink';
import { logger } from '@/lib/logger';
import { toast } from 'sonner';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { handleFetchMessage } from '@/lib/helpers';
import { z } from 'zod';
import { getCurrentUser, setCurrentUser } from '@/lib/userUtils';

interface ProfileData {
	name: string;
	username: string;
	email: string;
	phone: string;
	accountNumber: string;
	bankName: string;
	accountName: string;
	referralLink: string;
	momo_number?: string;
	momo_provider?: string;
}

export default function Content() {
	const [showEditModal, setShowEditModal] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [profileData, setProfileData] = useState<ProfileData | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [avatarFile, setAvatarFile] = useState<File | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
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
						accountNumber: data.data.account_number || '',
						bankName: data.data.bank_name || '',
						accountName: data.data.account_name || '',
						referralLink: data.data.referral_link || '',
						momo_number: data.data.momo_number || '',
						momo_provider: data.data.momo_provider || '',
					});
					setCurrentUser(data.data);
				} else {
					throw new Error(data.message || 'Failed to fetch profile');
				}
			} catch (error) {
				toast.error('Error fetching profile data');
				logger.error('Error fetching profile data:', error);
			} finally {
				setIsLoading(false);
			}
		};
		fetchProfileData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleImageChange = (file: File) => {
		setAvatarFile(file);
	};

	const handleSaveProfile = async (data: any) => {
		if (!profileData) return;
		try {
			schema.parse(data);
		} catch (err) {
			if (err instanceof z.ZodError) {
				toast.error(err.issues[0]?.message || 'Validation error');
			}
			return;
		}
		setIsSubmitting(true);
		try {
			const formData = new FormData();
			if (avatarFile) {
				formData.append('image', avatarFile);
			}
			formData.append('name', data.name);
			formData.append('phone_number', data.phone || '');
			if (data.dob) {
				formData.append('dob', data.dob);
			}
			const res = await fetchWithAuth('/api/users/profile', {
				method: 'PUT',
				body: formData,
			});
			const updatedUser = await res.json();
			if (res.ok) {
				setProfileData((prev) => ({ ...prev!, ...data }));
				setCurrentUser(updatedUser.data);
				toast.success('Profile updated successfully!');
			} else {
				const errorMessage = handleFetchMessage(updatedUser, 'Failed to update profile.');
				throw new Error(errorMessage);
			}
		} catch (err) {
			const errorMessage = handleFetchMessage(err, 'An error occurred while updating profile.');
			toast.error(errorMessage);
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
			<div className="p-4 lg:p-6 bg-background min-h-screen flex items-center justify-center">
				<div className="text-center">
					<i className="ri-error-warning-line w-12 h-12 flex items-center justify-center mx-auto mb-4 text-destructive"></i>
					<h3 className="text-lg font-semibold text-foreground mb-2">Failed to load profile</h3>
					<p className="text-muted-foreground">Please try refreshing the page</p>
				</div>
			</div>
		);
	}

	return (
		<div className="p-4 lg:p-6 min-h-screen bg-gradient-to-br from-[#e0e7ff] via-[#f3f4f6] to-[#c7d2fe] dark:from-[#232e48] dark:via-[#232e48] dark:to-[#373f5b]">
			<div className="max-w-4xl mx-auto">
				{/* Profile Header */}
				<Card className="bg-gradient-to-br from-[#4F46E5] to-[#6366F1] dark:from-[#232e48] dark:to-[#373f5b] border-0 shadow-lg mb-10">
					<CardContent className="flex flex-col lg:flex-row items-center gap-8 p-8">
						<div>
							<ProfileImageUpload currentImage={currentUser?.avatar_url} onImageChange={handleImageChange} />
						</div>
						<div className="flex-1 text-center lg:text-left">
							<h2 className="text-3xl font-bold text-white mb-2">{profileData.name}</h2>
							<p className="text-indigo-100 mb-4 text-lg">@{profileData.username}</p>
							<div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
								<Button onClick={() => setShowEditModal(true)} className="bg-white text-indigo-700 hover:bg-indigo-100 font-semibold">
									<i className="ri-edit-line mr-2 w-4 h-4 flex items-center justify-center"></i>
									Edit Profile
								</Button>
								<CustomLink href="/user/change-password">
									<Button variant="outline" className="bg-indigo-50 dark:bg-[#232e48] border-indigo-200 dark:border-indigo-700 text-indigo-700 dark:text-indigo-200 font-semibold w-full">
										<i className="ri-lock-line mr-2 w-4 h-4 flex items-center justify-center"></i>
										Change Password
									</Button>
								</CustomLink>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Info Cards */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
					{/* Basic Info */}
					<Card className="p-0 bg-gradient-to-br from-[#6366F1] to-[#4F46E5] dark:from-[#232e48] dark:to-[#373f5b] border-0 shadow-lg">
						<CardContent className="p-6">
							<div className="flex items-center justify-between mb-4">
								<h3 className="text-lg font-semibold text-white">Basic Information</h3>
								<button onClick={() => setShowEditModal(true)} className="text-indigo-100 hover:text-white p-1 rounded-lg hover:bg-indigo-700 transition-colors">
									<i className="ri-edit-line w-5 h-5 flex items-center justify-center"></i>
								</button>
							</div>
							<div className="space-y-4">
								<div>
									<label className="block text-xs font-medium text-indigo-100 mb-1">Name</label>
									<div className="flex items-center gap-2">
										<i className="ri-user-line text-indigo-100 w-4 h-4 flex items-center justify-center"></i>
										<span className="text-white">{profileData.name}</span>
									</div>
								</div>
								<div>
									<label className="block text-xs font-medium text-indigo-100 mb-1">Username</label>
									<div className="flex items-center gap-2">
										<i className="ri-at-line text-indigo-100 w-4 h-4 flex items-center justify-center"></i>
										<span className="text-white">{profileData.username}</span>
									</div>
								</div>
								<div>
									<label className="block text-xs font-medium text-indigo-100 mb-1">Email Address</label>
									<div className="flex items-center gap-2">
										<i className="ri-mail-line text-indigo-100 w-4 h-4 flex items-center justify-center"></i>
										<span className="text-white">{profileData.email}</span>
									</div>
								</div>
								<div>
									<label className="block text-xs font-medium text-indigo-100 mb-1">Phone Number</label>
									<div className="flex items-center gap-2">
										<i className="ri-phone-line text-indigo-100 w-4 h-4 flex items-center justify-center"></i>
										<span className="text-white">{profileData.phone}</span>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
					{/* Wallet Info */}
					<Card className="p-0 bg-gradient-to-br from-[#059669] to-[#10B981] dark:from-[#1b2e23] dark:to-[#14532d] border-0 shadow-lg">
						<CardContent className="p-6">
							<div className="flex items-center justify-between mb-4">
								<h3 className="text-lg font-semibold text-white">Wallet Information</h3>
								<CustomLink href="/user/add-bank" className="text-emerald-100 hover:text-white p-1 rounded-lg hover:bg-emerald-700 transition-colors">
									<i className="ri-edit-line w-5 h-5 flex items-center justify-center"></i>
								</CustomLink>
							</div>
							<div className="space-y-4">
								<div>
									<label className="block text-xs font-medium text-emerald-100 mb-1">Momo Number</label>
									<div className="flex items-center gap-2">
										<i className="ri-bank-card-line text-emerald-100 w-4 h-4 flex items-center justify-center"></i>
										<span className="text-white">{profileData.momo_number}</span>
									</div>
								</div>
								<div>
									<label className="block text-xs font-medium text-emerald-100 mb-1">Momo Provider</label>
									<div className="flex items-center gap-2">
										<i className="ri-bank-line text-emerald-100 w-4 h-4 flex items-center justify-center"></i>
										<span className="text-white">{profileData.momo_provider}</span>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
					{/* Referral Info */}
					<Card className="p-0 bg-gradient-to-br from-[#F59E42] to-[#FBBF24] dark:from-[#a16207] dark:to-[#fde68a] border-0 shadow-lg">
						<CardContent className="p-6">
							<h3 className="text-lg font-semibold text-white mb-4">Referral Information</h3>
							<div>
								<label className="block text-xs font-medium text-yellow-100 mb-1">Referral Link</label>
								<div className="flex items-center gap-2 p-3 bg-yellow-50/60 dark:bg-[#a16207]/30 rounded-lg">
									<i className="ri-link text-yellow-600 w-4 h-4 flex items-center justify-center"></i>
									<span className="text-yellow-900 text-sm flex-1 truncate">{referralCode}</span>
								</div>
								<Button onClick={handleCopyReferralLink} variant="outline" size="sm" className="mt-2 w-full border-yellow-300 text-yellow-800 hover:bg-yellow-100">
									<i className="ri-file-copy-line mr-2 w-4 h-4 flex items-center justify-center"></i>
									Copy
								</Button>
							</div>
						</CardContent>
					</Card>
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
		</div>
	);
}
