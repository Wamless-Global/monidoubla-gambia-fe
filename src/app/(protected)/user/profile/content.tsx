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
		<div className="p-4 lg:p-6 bg-background min-h-screen">
			<div className="max-w-4xl mx-auto">
				<div className="mb-8 flex flex-col items-center lg:items-start lg:flex-row lg:gap-8">
					<div className="mb-6 lg:mb-0">
						<ProfileImageUpload currentImage={currentUser?.avatar_url} onImageChange={handleImageChange} />
					</div>

					<div className="text-center lg:text-left lg:flex-1">
						<h2 className="text-2xl font-semibold text-foreground mb-2">{profileData.name}</h2>
						<p className="text-muted-foreground mb-4">@{profileData.username}</p>
						<div className="flex flex-col sm:flex-row gap-3">
							<Button onClick={() => setShowEditModal(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground">
								<i className="ri-edit-line mr-2 w-4 h-4 flex items-center justify-center"></i>
								Edit Profile
							</Button>
							<CustomLink href="/user/change-password">
								<Button variant="outline" className="w-full">
									<i className="ri-lock-line mr-2 w-4 h-4 flex items-center justify-center"></i>
									Change Password
								</Button>
							</CustomLink>
						</div>
					</div>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					<Card className="bg-card shadow-sm">
						<CardContent className="p-6">
							<div className="flex items-center justify-between mb-4">
								<h3 className="text-lg font-semibold text-card-foreground">Basic Information</h3>
								<button onClick={() => setShowEditModal(true)} className="text-primary hover:text-primary/90 p-1 rounded-lg hover:bg-accent transition-colors">
									<i className="ri-edit-line w-5 h-5 flex items-center justify-center"></i>
								</button>
							</div>

							<div className="space-y-4">
								<div>
									<label className="block text-sm font-medium text-muted-foreground mb-1">Name</label>
									<div className="flex items-center gap-2">
										<i className="ri-user-line text-muted-foreground w-4 h-4 flex items-center justify-center"></i>
										<span className="text-card-foreground">{profileData.name}</span>
									</div>
								</div>

								<div>
									<label className="block text-sm font-medium text-muted-foreground mb-1">Username</label>
									<div className="flex items-center gap-2">
										<i className="ri-at-line text-muted-foreground w-4 h-4 flex items-center justify-center"></i>
										<span className="text-card-foreground">{profileData.username}</span>
									</div>
								</div>

								<div>
									<label className="block text-sm font-medium text-muted-foreground mb-1">Email Address</label>
									<div className="flex items-center gap-2">
										<i className="ri-mail-line text-muted-foreground w-4 h-4 flex items-center justify-center"></i>
										<span className="text-card-foreground">{profileData.email}</span>
									</div>
								</div>

								<div>
									<label className="block text-sm font-medium text-muted-foreground mb-1">Phone Number</label>
									<div className="flex items-center gap-2">
										<i className="ri-phone-line text-muted-foreground w-4 h-4 flex items-center justify-center"></i>
										<span className="text-card-foreground">{profileData.phone}</span>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className="bg-card shadow-sm">
						<CardContent className="p-6">
							<div className="flex items-center justify-between mb-4">
								<h3 className="text-lg font-semibold text-card-foreground">Wallet Information</h3>
								<CustomLink href="/user/add-momo-details" className="text-primary hover:text-primary/90 p-1 rounded-lg hover:bg-accent transition-colors">
									<i className="ri-edit-line w-5 h-5 flex items-center justify-center"></i>
								</CustomLink>
							</div>

							<div className="space-y-4">
								<div>
									<label className="block text-sm font-medium text-muted-foreground mb-1">Momo Name</label>
									<div className="flex items-center gap-2">
										<i className="ri-user-line text-muted-foreground w-4 h-4 flex items-center justify-center"></i>
										<span className="text-card-foreground">{profileData.momo_name}</span>
									</div>
								</div>

								<div>
									<label className="block text-sm font-medium text-muted-foreground mb-1">Momo Number</label>
									<div className="flex items-center gap-2">
										<i className="ri-bank-card-line text-muted-foreground w-4 h-4 flex items-center justify-center"></i>
										<span className="text-card-foreground">{profileData.momo_number}</span>
									</div>
								</div>

								<div>
									<label className="block text-sm font-medium text-muted-foreground mb-1">Momo Provider</label>
									<div className="flex items-center gap-2">
										<i className="ri-bank-line text-muted-foreground w-4 h-4 flex items-center justify-center"></i>
										<span className="text-card-foreground">{profileData.momo_provider}</span>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className="bg-card shadow-sm">
						<CardContent className="p-6">
							<h3 className="text-lg font-semibold text-card-foreground mb-4">Referral Information</h3>

							<div>
								<label className="block text-sm font-medium text-muted-foreground mb-1">Referral Link</label>
								<div className="flex items-center gap-2 p-3 bg-secondary rounded-lg">
									<i className="ri-link text-muted-foreground w-4 h-4 flex items-center justify-center"></i>
									<span className="text-card-foreground text-sm flex-1 truncate">{referralCode}</span>
								</div>
								<Button onClick={handleCopyReferralLink} variant="outline" size="sm" className="mt-2 w-full">
									<i className="ri-file-copy-line mr-2 w-4 h-4 flex items-center justify-center"></i>
									Copy
								</Button>
							</div>
						</CardContent>
					</Card>
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
