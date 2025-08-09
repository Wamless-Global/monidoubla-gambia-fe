'use client';

import { useState, useRef } from 'react';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { toast } from 'sonner';
import { setCurrentUser } from '@/lib/userUtils';

// NOTE: All original props and logic are preserved.
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
			const reader = new FileReader();
			reader.onload = (e) => setPreviewUrl(e.target?.result as string);
			reader.readAsDataURL(file);

			const formData = new FormData();
			formData.append('image', file);
			formData.append('telegram_user_id', 'x');
			const res = await fetchWithAuth('/api/users/profile', { method: 'PUT', body: formData });
			const data = await res.json();
			if (!res.ok) throw new Error(data?.message || 'Failed to upload image');
			setCurrentUser(data);
			toast.success('Profile image updated!');
			onImageChange(file);
		} catch (error: any) {
			toast.error(error?.message || 'Failed to upload image. Please try again.');
		} finally {
			setIsUploading(false);
		}
	};

	const handleUploadClick = () => {
		if (!isUploading) {
			fileInputRef.current?.click();
		}
	};

	// ===============================================
	// START: Redesigned JSX
	// ===============================================
	return (
		<div className="flex flex-col items-center">
			<div className="relative group w-32 h-32 cursor-pointer" onClick={handleUploadClick}>
				<img src={previewUrl || `https://ui-avatars.com/api/?name=User&background=E5E7EB&color=4B5563`} alt="Profile" className="w-full h-full rounded-full object-cover border-4 border-white shadow-md" />
				<div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
					{isUploading ? (
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
					) : (
						<div className="text-center text-white">
							<i className="ri-camera-line text-2xl"></i>
							<p className="text-xs font-semibold">Change</p>
						</div>
					)}
				</div>
			</div>
			<input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" disabled={isUploading} />
			<p className="text-xs text-gray-500 mt-4 text-center">Max file size: 5MB</p>
		</div>
	);
}
