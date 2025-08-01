'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { PHRequest } from './multiple-match/types';
import { getCurrencyFromLocalStorage } from '@/lib/helpers';

interface EditPHRequestModalProps {
	isOpen: boolean;
	onClose: () => void;
	request: PHRequest | null;
	onSave: (request: PHRequest) => void;
}

export default function EditPHRequestModal({ isOpen, onClose, request, onSave }: EditPHRequestModalProps) {
	const [formData, setFormData] = useState<PHRequest | null>(null);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (request) {
			setFormData(request);
		}
	}, [request]);

	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = 'unset';
		}
		return () => {
			document.body.style.overflow = 'unset';
		};
	}, [isOpen]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!formData || formData.amount <= 0) {
			toast.error('Please enter a valid amount');
			return;
		}

		setLoading(true);
		try {
			const res = await fetchWithAuth(`/api/ph-requests/${formData.id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ amount: formData.amount, status: formData.status }),
			});

			if (!res.ok) {
				const data = await res.json();
				throw new Error(data?.message || 'Failed to update PH request');
			}

			onSave(formData);
			toast.success('PH request updated successfully');
			setLoading(false);
			onClose();
		} catch (error: any) {
			toast.error(error?.message || 'Failed to update request');
			logger.error('Failed to update PH request', error);
			setLoading(false);
		}
	};

	if (!isOpen || !formData) return null;

	return (
		<>
			<div className="fixed inset-0 bg-black bg-opacity-50 z-50 !mt-0" onClick={onClose} />
			<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
					<div className="p-6">
						<div className="flex items-center justify-between mb-6">
							<h3 className="text-lg font-semibold text-gray-900 dark:text-white">Edit PH Request</h3>
							<button onClick={onClose} disabled={loading} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50">
								<i className="ri-close-line w-5 h-5 flex items-center justify-center text-gray-600 dark:text-gray-400"></i>
							</button>
						</div>
						<form onSubmit={handleSubmit} className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount ({getCurrencyFromLocalStorage()?.code})</label>
								<input
									type="number"
									min="1"
									step="1"
									value={formData.amount}
									onChange={(e) => setFormData({ ...formData, amount: parseInt(e.target.value) || 0 })}
									className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
									required
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
								<select
									value={formData.status}
									onChange={(e) => setFormData({ ...formData, status: e.target.value as PHRequest['status'] })}
									className="w-full px-3 py-2 pr-8 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
								>
									<option value="pending">Pending</option>
									<option value="waiting-match">Waiting Match</option>
									<option value="partial-match">Partial Match</option>
									<option value="matched">Matched</option>
									<option value="active">Active</option>
									<option value="completed">Completed</option>
									<option value="expired">Expired</option>
								</select>
							</div>
							<div className="flex justify-end gap-3 pt-4">
								<Button type="button" variant="outline" onClick={onClose} disabled={loading} className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600">
									Cancel
								</Button>
								<Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white whitespace-nowrap">
									{loading ? (
										<div className="flex items-center gap-2">
											<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
											<span>Updating...</span>
										</div>
									) : (
										'Save Changes'
									)}
								</Button>
							</div>
						</form>
					</div>
				</div>
			</div>
		</>
	);
}
