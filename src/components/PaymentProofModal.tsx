'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { getCurrencyFromLocalStorage } from '@/lib/helpers';

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
		} catch (error) {
			// Error handling is done in parent
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

	return (
		<>
			<div className="fixed inset-0 bg-black/50 z-50" onClick={handleClose} />

			<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
				<Card className="w-full max-w-md p-6 bg-white dark:bg-gray-800 border-0 shadow-lg">
					<div className="flex items-center justify-between mb-6">
						<h2 className="text-xl font-bold text-gray-900 dark:text-white">Upload Proof of Payment</h2>
						<button onClick={handleClose} disabled={isUploading} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50">
							<i className="ri-close-line w-5 h-5 flex items-center justify-center text-gray-900 dark:text-white"></i>
						</button>
					</div>

					<div className="mb-4">
						<p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
							<strong>Recipient:</strong> {userName}
						</p>
						<p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
							<strong>Amount:</strong> {amount} {getCurrencyFromLocalStorage()?.code}
						</p>
						<p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Kindly upload a proof of payment ascertain that the payment has been made to the right account</p>
					</div>

					<div
						className={`border-2 border-dashed rounded-lg p-8 text-center mb-4 transition-colors ${dragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700'}`}
						onDragEnter={handleDrag}
						onDragLeave={handleDrag}
						onDragOver={handleDrag}
						onDrop={handleDrop}
					>
						<input type="file" accept=".jpg,.jpeg,.png" onChange={handleFileSelect} className="hidden" id="file-upload" disabled={isUploading} />
						<label htmlFor="file-upload" className={`cursor-pointer ${isUploading ? 'pointer-events-none' : ''}`}>
							<div className="flex flex-col items-center justify-center mb-4">
								{previewUrl ? <img src={previewUrl} alt="Preview" className="w-32 h-32 object-contain rounded-lg mx-auto mb-2 border border-gray-200 dark:border-gray-700" /> : <i className="ri-add-line text-6xl text-gray-400 dark:text-gray-500 mx-auto"></i>}
							</div>
							{selectedFile ? (
								<div>
									<p className="text-sm font-medium text-gray-900 dark:text-white">{selectedFile.name}</p>
									<p className="text-xs text-gray-500 dark:text-gray-400">Click to change file</p>
								</div>
							) : (
								<div>
									<p className="text-sm text-gray-500 dark:text-gray-400">Click to upload or drag and drop</p>
								</div>
							)}
						</label>
					</div>

					<p className="text-xs text-gray-500 dark:text-gray-400 mb-6">Supported formats - .png and .jpeg</p>

					<div className="flex gap-3">
						<Button variant="outline" onClick={handleClose} disabled={isUploading} className="flex-1 whitespace-nowrap bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600">
							Cancel
						</Button>
						<Button onClick={handleConfirm} disabled={!selectedFile || isUploading} className="flex-1 whitespace-nowrap bg-blue-600 hover:bg-blue-700 text-white">
							{isUploading ? (
								<div className="flex items-center gap-2">
									<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
									<span>Uploading...</span>
								</div>
							) : (
								'Upload'
							)}
						</Button>
					</div>
				</Card>
			</div>
		</>
	);
}
