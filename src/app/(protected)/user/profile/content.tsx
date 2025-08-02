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
		<div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-emerald-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 py-0 px-0">
			<div className="max-w-5xl mx-auto px-4 pt-10 pb-0">
				{/* Profile Hero Section */}
				<div className="rounded-3xl bg-gradient-to-tr from-indigo-500/80 via-purple-500/80 to-emerald-400/80 dark:from-indigo-900/80 dark:via-purple-900/80 dark:to-emerald-900/80 shadow-2xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 overflow-hidden mb-10">
					<div className="flex flex-col items-center gap-3">
						<div className="w-32 h-32 rounded-full border-4 border-white/30 shadow-xl bg-gradient-to-tr from-indigo-400 via-purple-400 to-blue-400 flex items-center justify-center overflow-hidden mb-2">
							<ProfileImageUpload currentImage={currentUser?.avatar_url} onImageChange={handleImageChange} />
						</div>
						<span className="inline-block px-3 py-1 rounded-xl bg-white/20 text-indigo-100 font-bold text-lg tracking-tight shadow">{profileData.name}</span>
						<span className="text-indigo-100/90 font-medium">@{profileData.username}</span>
						<div className="flex gap-3 mt-2">
							<Button onClick={() => setShowEditModal(true)} className="bg-gradient-to-r from-emerald-400 via-blue-500 to-indigo-500 text-white font-bold px-6 py-2 rounded-xl shadow-lg hover:scale-105 hover:shadow-2xl transition-all text-base">
								<i className="ri-edit-line mr-2 text-xl align-middle"></i> Edit Profile
							</Button>
							<CustomLink href="/user/change-password">
								<Button variant="outline" className="bg-white/20 border-white/30 text-white font-bold px-6 py-2 rounded-xl shadow-lg hover:bg-white/30 hover:scale-105 hover:shadow-2xl transition-all text-base">
									<i className="ri-lock-line mr-2 text-xl align-middle"></i> Change Password
								</Button>
							</CustomLink>
						</div>
					</div>
				</div>

				{/* Info Cards Section */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
					{/* Basic Info */}
					<div className="rounded-3xl shadow-2xl bg-white/90 dark:bg-gray-900/90 border-2 border-indigo-100 dark:border-indigo-900 p-6 min-h-[220px] flex flex-col justify-between">
						<div className="flex items-center justify-between mb-4">
							<h3 className="text-lg font-extrabold text-indigo-900 dark:text-indigo-100">Basic Information</h3>
							<button onClick={() => setShowEditModal(true)} className="text-indigo-500 hover:text-indigo-700 p-1 rounded-lg hover:bg-indigo-100/40 transition-colors">
								<i className="ri-edit-line w-5 h-5 flex items-center justify-center"></i>
							</button>
						</div>
						<div className="space-y-4">
							<div className="flex items-center gap-2">
								<i className="ri-user-line text-indigo-400 w-4 h-4 flex items-center justify-center"></i>
								<span className="text-indigo-900 dark:text-indigo-100 font-semibold">{profileData.name}</span>
							</div>
							<div className="flex items-center gap-2">
								<i className="ri-at-line text-indigo-400 w-4 h-4 flex items-center justify-center"></i>
								<span className="text-indigo-900 dark:text-indigo-100 font-semibold">{profileData.username}</span>
							</div>
							<div className="flex items-center gap-2">
								<i className="ri-mail-line text-indigo-400 w-4 h-4 flex items-center justify-center"></i>
								<span className="text-indigo-900 dark:text-indigo-100 font-semibold">{profileData.email}</span>
							</div>
							<div className="flex items-center gap-2">
								<i className="ri-phone-line text-indigo-400 w-4 h-4 flex items-center justify-center"></i>
								<span className="text-indigo-900 dark:text-indigo-100 font-semibold">{profileData.phone}</span>
							</div>
						</div>
					</div>

					{/* Bank Info */}
					<div className="rounded-3xl shadow-2xl bg-white/90 dark:bg-gray-900/90 border-2 border-indigo-100 dark:border-indigo-900 p-6 min-h-[220px] flex flex-col justify-between">
						<div className="flex items-center justify-between mb-4">
							<h3 className="text-lg font-extrabold text-indigo-900 dark:text-indigo-100">Bank Information</h3>
							<CustomLink href="/user/add-bank" className="text-indigo-500 hover:text-indigo-700 p-1 rounded-lg hover:bg-indigo-100/40 transition-colors">
								<i className="ri-edit-line w-5 h-5 flex items-center justify-center"></i>
							</CustomLink>
						</div>
						<div className="space-y-4">
							<div className="flex items-center gap-2">
								<i className="ri-bank-card-line text-indigo-400 w-4 h-4 flex items-center justify-center"></i>
								<span className="text-indigo-900 dark:text-indigo-100 font-semibold">{profileData.accountNumber}</span>
							</div>
							<div className="flex items-center gap-2">
								<i className="ri-bank-line text-indigo-400 w-4 h-4 flex items-center justify-center"></i>
								<span className="text-indigo-900 dark:text-indigo-100 font-semibold">{profileData.bankName}</span>
							</div>
							<div className="flex items-center gap-2">
								<i className="ri-user-line text-indigo-400 w-4 h-4 flex items-center justify-center"></i>
								<span className="text-indigo-900 dark:text-indigo-100 font-semibold">{profileData.accountName}</span>
							</div>
						</div>
					</div>

					{/* Referral Info */}
					<div className="rounded-3xl shadow-2xl bg-white/90 dark:bg-gray-900/90 border-2 border-indigo-100 dark:border-indigo-900 p-6 min-h-[220px] flex flex-col justify-between">
						<h3 className="text-lg font-extrabold text-indigo-900 dark:text-indigo-100 mb-4">Referral Information</h3>
						<div>
							<div className="flex items-center gap-2 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
								<i className="ri-link text-indigo-400 w-4 h-4 flex items-center justify-center"></i>
								<span className="text-indigo-900 dark:text-indigo-100 text-sm flex-1 truncate">{referralCode}</span>
							</div>
							<Button onClick={handleCopyReferralLink} variant="outline" size="sm" className="mt-2 w-full bg-white/20 border-white/30 text-indigo-900 dark:text-indigo-100 font-bold rounded-xl hover:bg-white/30 hover:scale-105 transition-all">
								<i className="ri-file-copy-line mr-2 w-4 h-4 flex items-center justify-center"></i>
								Copy
							</Button>
						</div>
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
