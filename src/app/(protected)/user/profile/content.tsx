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
			alert('Referral link copied to clipboard!');
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
		<div className="relative min-h-screen bg-gradient-to-br from-[#e0e7ff] via-[#f8fafc] to-[#f0fdfa] dark:from-[#232946] dark:via-[#181823] dark:to-[#232946] py-10 px-2">
			{/* Profile Hero Section */}
			<div className="relative w-full max-w-4xl mx-auto px-4 pt-10 pb-8 lg:pt-16 lg:pb-12">
				<div className="rounded-3xl bg-white/90 dark:bg-[#232946]/90 shadow-2xl border-0 px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-8 backdrop-blur-xl">
					<div className="mb-6 lg:mb-0">
						<ProfileImageUpload currentImage={currentUser?.avatar_url} onImageChange={handleImageChange} />
					</div>
					<div className="text-center lg:text-left lg:flex-1">
						<h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-2 font-sans drop-shadow">{profileData.name}</h2>
						<p className="text-lg lg:text-xl text-gray-500 dark:text-slate-300 font-medium mb-4">@{profileData.username}</p>
						<div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
							<Button onClick={() => setShowEditModal(true)} className="rounded-xl px-7 py-3 font-semibold text-blue-600 border-blue-600 bg-white/70 hover:bg-blue-50/80 dark:bg-[#232946]/70 dark:hover:bg-blue-900/20 transition-all shadow-md">
								<i className="ri-edit-line mr-2 text-lg"></i> Edit Profile
							</Button>
							<CustomLink href="/user/change-password">
								<Button variant="outline" className="rounded-xl px-7 py-3 font-semibold text-gray-900 dark:text-white bg-blue-100/80 hover:bg-blue-200/80 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 transition-all shadow-md">
									<i className="ri-lock-line mr-2 text-lg"></i> Change Password
								</Button>
							</CustomLink>
						</div>
					</div>
				</div>
				{/* Floating elements for depth */}
				<div className="absolute left-0 top-0 w-40 h-40 bg-gradient-to-br from-blue-400/10 to-blue-200/10 rounded-full blur-2xl -z-10" />
				<div className="absolute right-0 bottom-0 w-32 h-32 bg-gradient-to-tr from-blue-200/10 to-blue-400/10 rounded-full blur-2xl -z-10" />
			</div>

			{/* Profile Info Cards */}
			<div className="max-w-4xl mx-auto px-4 mt-4 grid grid-cols-1 md:grid-cols-3 gap-8">
				{/* Basic Information */}
				<Card className="bg-white/95 dark:bg-[#181c24]/95 border-0 shadow-xl rounded-2xl">
					<CardContent className="p-7">
						<div className="flex items-center justify-between mb-5">
							<h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Basic Information</h3>
							<button onClick={() => setShowEditModal(true)} className="text-blue-600 hover:text-blue-400 p-1 rounded-lg hover:bg-blue-100/40 dark:hover:bg-blue-900/20 transition-colors">
								<i className="ri-edit-line w-5 h-5 flex items-center justify-center"></i>
							</button>
						</div>
						<div className="space-y-5">
							<div>
								<label className="block text-xs font-semibold text-gray-400 mb-1">Name</label>
								<div className="flex items-center gap-2">
									<i className="ri-user-line text-gray-400 w-4 h-4 flex items-center justify-center"></i>
									<span className="text-gray-900 dark:text-white font-medium">{profileData.name}</span>
								</div>
							</div>
							<div>
								<label className="block text-xs font-semibold text-gray-400 mb-1">Username</label>
								<div className="flex items-center gap-2">
									<i className="ri-at-line text-gray-400 w-4 h-4 flex items-center justify-center"></i>
									<span className="text-gray-900 dark:text-white font-medium">{profileData.username}</span>
								</div>
							</div>
							<div>
								<label className="block text-xs font-semibold text-gray-400 mb-1">Email Address</label>
								<div className="flex items-center gap-2">
									<i className="ri-mail-line text-gray-400 w-4 h-4 flex items-center justify-center"></i>
									<span className="text-gray-900 dark:text-white font-medium">{profileData.email}</span>
								</div>
							</div>
							<div>
								<label className="block text-xs font-semibold text-gray-400 mb-1">Phone Number</label>
								<div className="flex items-center gap-2">
									<i className="ri-phone-line text-gray-400 w-4 h-4 flex items-center justify-center"></i>
									<span className="text-gray-900 dark:text-white font-medium">{profileData.phone}</span>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Wallet Information */}
				<Card className="bg-white/95 dark:bg-[#181c24]/95 border-0 shadow-xl rounded-2xl">
					<CardContent className="p-7">
						<div className="flex items-center justify-between mb-5">
							<h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Wallet Information</h3>
							<CustomLink href="/user/add-bank" className="text-blue-600 hover:text-blue-400 p-1 rounded-lg hover:bg-blue-100/40 dark:hover:bg-blue-900/20 transition-colors">
								<i className="ri-edit-line w-5 h-5 flex items-center justify-center"></i>
							</CustomLink>
						</div>
						<div className="space-y-5">
							<div>
								<label className="block text-xs font-semibold text-gray-400 mb-1">Momo Number</label>
								<div className="flex items-center gap-2">
									<i className="ri-bank-card-line text-gray-400 w-4 h-4 flex items-center justify-center"></i>
									<span className="text-gray-900 dark:text-white font-medium">{profileData.momo_number}</span>
								</div>
							</div>
							<div>
								<label className="block text-xs font-semibold text-gray-400 mb-1">Momo Provider</label>
								<div className="flex items-center gap-2">
									<i className="ri-bank-line text-gray-400 w-4 h-4 flex items-center justify-center"></i>
									<span className="text-gray-900 dark:text-white font-medium">{profileData.momo_provider}</span>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Referral Information */}
				<Card className="bg-white/95 dark:bg-[#181c24]/95 border-0 shadow-xl rounded-2xl">
					<CardContent className="p-7">
						<h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight mb-5">Referral Information</h3>
						<div>
							<label className="block text-xs font-semibold text-gray-400 mb-1">Referral Link</label>
							<div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
								<i className="ri-link text-gray-400 w-4 h-4 flex items-center justify-center"></i>
								<span className="text-gray-900 dark:text-white text-sm flex-1 truncate">{referralCode}</span>
							</div>
							<Button onClick={handleCopyReferralLink} variant="outline" size="sm" className="mt-2 w-full rounded-xl">
								<i className="ri-file-copy-line mr-2 text-lg"></i> Copy
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
	);
}
