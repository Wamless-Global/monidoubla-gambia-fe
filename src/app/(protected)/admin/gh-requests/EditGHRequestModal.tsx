'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { GHRequest } from './types';
import { getCurrencyFromLocalStorage, handleFetchMessage, getSettings } from '@/lib/helpers';

// NOTE: All original interfaces and logic are preserved.
interface EditGHRequestModalProps {
	isOpen: boolean;
	onClose: () => void;
	request: GHRequest | null;
	onSave: (request: GHRequest) => void;
}

export default function EditGHRequestModal({ isOpen, onClose, request, onSave }: EditGHRequestModalProps) {
	const [formData, setFormData] = useState<GHRequest | null>(null);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (request) {
			setFormData(request);
		}
	}, [request]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!formData || formData.remainingAmount <= 0) {
			toast.error('Please enter a valid amount');
			return;
		}
		setLoading(true);
		try {
			const res = await fetchWithAuth(`/api/gh-requests/${formData.id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ amount: formData.remainingAmount, status: formData.status }),
			});
			if (!res.ok) {
				const data = await res.json();
				throw new Error(handleFetchMessage(data, 'Failed to update GH request'));
			}
			onSave(formData);
			toast.success('GH request updated successfully');
			onClose();
		} catch (error: any) {
			toast.error(handleFetchMessage(error, 'Failed to update request'));
		} finally {
			setLoading(false);
		}
	};

	if (!isOpen || !formData) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-in fade-in-0 !m-0">
			<Card className="max-w-md w-full bg-white shadow-lg border-slate-200 animate-in fade-in-0 zoom-in-95">
				<CardHeader>
					<div className="flex justify-between items-start">
						<div>
							<CardTitle>Edit GH Request</CardTitle>
							<CardDescription>Editing request for {formData.user.name}</CardDescription>
						</div>
						<button onClick={onClose} disabled={loading} className="p-1 rounded-full text-slate-500 hover:bg-slate-100">
							<i className="ri-close-line text-xl"></i>
						</button>
					</div>
				</CardHeader>
				<form onSubmit={handleSubmit}>
					<CardContent className="space-y-4">
						<div>
							<label className="block text-sm font-medium text-slate-700 mb-1">Amount ({getSettings()?.baseCurrency || getCurrencyFromLocalStorage()?.code})</label>
							<input type="number" min="1" step="1" value={formData.remainingAmount} onChange={(e) => setFormData({ ...formData, remainingAmount: parseInt(e.target.value) || 0 })} className="w-full" required />
						</div>
						<div>
							<label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
							<select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as GHRequest['status'] })} className="w-full">
								<option value="pending">Pending</option>
								<option value="matched">Matched</option>
								<option value="completed">Completed</option>
							</select>
						</div>
					</CardContent>
					<CardFooter className="justify-end gap-3">
						<Button type="button" variant="outline" onClick={onClose} disabled={loading}>
							Cancel
						</Button>
						<Button type="submit" disabled={loading}>
							{loading ? 'Saving...' : 'Save Changes'}
						</Button>
					</CardFooter>
				</form>
			</Card>
		</div>
	);
}
