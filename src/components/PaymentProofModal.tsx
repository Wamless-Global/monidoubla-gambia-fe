'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';
import { getCurrencyFromLocalStorage } from '@/lib/helpers';

// NOTE: All original props and logic are preserved.
interface PaymentProofModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: (file: File) => void;
	userName: string;
	amount: number;
}

export function PaymentProofModal({ isOpen, onClose, onConfirm, userName, amount }: PaymentProofModalProps) {
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const [dragActive, setDragActive] = useState(false);
	const [isUploading, setIsUploading] = useState(false);

	const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
			setSelectedFile(file);
			const reader = new FileReader();
			reader.onload = (e) => setPreviewUrl(e.target?.result as string);
			reader.readAsDataURL(file);
		} else {
			toast.error('Please select a valid image file (PNG or JPEG)');
		}
	};

	const handleDrag = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (e.type === 'dragenter' || e.type === 'dragover') {
			setDragActive(true);
		} else if (e.type === 'dragleave') {
			setDragActive(false);
		}
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setDragActive(false);
		const file = e.dataTransfer.files?.[0];
		if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
			setSelectedFile(file);
			const reader = new FileReader();
			reader.onload = (ev) => setPreviewUrl(ev.target?.result as string);
			reader.readAsDataURL(file);
		} else {
			toast.error('Please select a valid image file (PNG or JPEG)');
		}
	};

	const handleConfirm = async () => {
		if (!selectedFile) {
			toast.error('Please select a file to upload');
			return;
		}
		setIsUploading(true);
		try {
			await onConfirm(selectedFile);
			handleClose();
		} finally {
			setIsUploading(false);
		}
	};

	const handleClose = () => {
		if (isUploading) return;
		onClose();
		setSelectedFile(null);
		setPreviewUrl(null);
	};

	if (!isOpen) return null;

	// ===============================================
	// START: Redesigned JSX
	// ===============================================
	return (
		<>
			<div className="fixed inset-0 bg-black/60 z-50 animate-in fade-in-0" onClick={handleClose} />
			<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
				<Card className="w-full max-w-md bg-white shadow-lg border-gray-200 animate-in fade-in-0 zoom-in-95">
					<CardHeader className="flex flex-row items-center justify-between">
						<CardTitle className="text-lg font-semibold text-gray-800">Upload Payment Proof</CardTitle>
						<button onClick={handleClose} disabled={isUploading} className="p-1 rounded-full text-gray-500 hover:bg-gray-100 disabled:opacity-50">
							<i className="ri-close-line text-xl"></i>
						</button>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="text-sm text-gray-500 bg-gray-50 p-4 rounded-lg">
							<p>
								You are confirming a payment of{' '}
								<strong className="text-gray-800">
									{amount.toLocaleString()} {getCurrencyFromLocalStorage()?.code}
								</strong>{' '}
								to <strong className="text-gray-800">{userName}</strong>.
							</p>
						</div>
						<div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${dragActive ? 'border-teal-500 bg-teal-50' : 'border-gray-300'}`} onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}>
							<input type="file" accept=".jpg,.jpeg,.png" onChange={handleFileSelect} className="hidden" id="file-upload" disabled={isUploading} />
							<label htmlFor="file-upload" className={`cursor-pointer ${isUploading ? 'pointer-events-none' : ''}`}>
								{previewUrl ? (
									<img src={previewUrl} alt="Preview" className="w-full h-32 object-contain rounded-md mx-auto mb-2" />
								) : (
									<div className="flex flex-col items-center justify-center text-gray-500">
										<i className="ri-upload-cloud-2-line text-4xl mb-2"></i>
										<span className="font-medium text-teal-600">Click to upload</span>
										<span> or drag and drop</span>
									</div>
								)}
							</label>
						</div>
						{selectedFile && (
							<p className="text-sm text-center text-gray-600">
								File: <span className="font-medium">{selectedFile.name}</span>
							</p>
						)}
					</CardContent>
					<CardFooter className="bg-gray-50 p-4 flex gap-4">
						<Button variant="outline" onClick={handleClose} disabled={isUploading} className="flex-1">
							Cancel
						</Button>
						<Button onClick={handleConfirm} disabled={!selectedFile || isUploading} className="flex-1 bg-teal-600 hover:bg-teal-700 text-white">
							{isUploading ? 'Uploading...' : 'Confirm & Upload'}
						</Button>
					</CardFooter>
				</Card>
			</div>
		</>
	);
}
