'use client';

import React, { useState, useRef } from 'react';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { toast } from 'sonner';
import { setCurrentUser } from '@/lib/userUtils';

interface ProfileImageUploadProps {
	currentImage?: string;
	onImageChange: (file: File) => void;
}

export function ProfileImageUpload({ currentImage, onImageChange }: ProfileImageUploadProps) {
	const [previewUrl, setPreviewUrl] = useState(currentImage || '');
	const [isUploading, setIsUploading] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		if (file.size > 5 * 1024 * 1024) {
			toast.error('File size must be less than 5MB');
			return;
		}

		if (!file.type.startsWith('image/')) {
			toast.error('Please select a valid image file');
			return;
		}

		setIsUploading(true);
		try {
			// Show preview immediately
			const reader = new FileReader();
			reader.onload = (e) => {
				setPreviewUrl(e.target?.result as string);
			};
			reader.readAsDataURL(file);

			// Upload to API
			const formData = new FormData();
			formData.append('image', file);
			formData.append('telegram_user_id', 'x');
			const res = await fetchWithAuth('/api/users/profile', {
				method: 'PUT',
				body: formData,
			});
			const data = await res.json();
			if (!res.ok) {
				throw new Error(data?.message || 'Failed to upload image');
			}
			setCurrentUser(data); // Update current user with new profile
			toast.success('Profile image updated!');
			onImageChange(file);
		} catch (error: any) {
			console.error('Error uploading image:', error);
			toast.error(error?.message || 'Failed to upload image. Please try again.');
		} finally {
			setIsUploading(false);
		}
	};

	const handleUploadClick = () => {
		fileInputRef.current?.click();
	};

	return (
		<div className="flex flex-col items-center">
			<div className="relative group">
				<div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
					{previewUrl ? <img src={previewUrl} alt="Profile" className="w-full h-full object-cover" /> : <i className="ri-user-line text-gray-400 text-3xl w-8 h-8 flex items-center justify-center"></i>}
				</div>

				<button onClick={handleUploadClick} disabled={isUploading} className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-900 hover:bg-blue-800 text-white rounded-full flex items-center justify-center transition-colors shadow-lg disabled:opacity-50">
					{isUploading ? <i className="ri-loader-4-line animate-spin text-sm w-4 h-4 flex items-center justify-center"></i> : <i className="ri-camera-line text-sm w-4 h-4 flex items-center justify-center"></i>}
				</button>
			</div>

			<input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />

			<p className="text-xs text-gray-500 mt-2 text-center">
				Click camera icon to upload
				<br />
				Max size: 5MB
			</p>
		</div>
	);
}
