'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';
import { getCurrencyFromLocalStorage, getSettings } from '@/lib/helpers';
import { cn } from '@/lib/utils';

// NOTE: All original interfaces and logic are preserved.
interface Transaction {
	id: string;
	phUser: string;
	ghUser: string;
	amount: string;
	dateMatched: string;
	status: 'Confirmed' | 'Paid' | 'Pending';
	paymentProof: string;
}

interface AddTransactionModalProps {
	isOpen: boolean;
	onClose: () => void;
	onAdd: (transaction: Transaction) => void;
}

export function AddTransactionModal({ isOpen, onClose, onAdd }: AddTransactionModalProps) {
	const [formData, setFormData] = useState({ phUser: '', ghUser: '', amount: '', status: 'Pending' as Transaction['status'], paymentProof: null as File | null });
	const [loading, setLoading] = useState(false);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const mockUsers = ['John Michael', 'Sarah Johnson', 'Michael Brown', 'Emily Davis', 'David Wilson', 'Lisa Anderson', 'Robert Taylor', 'Jennifer Martinez', 'James Thompson', 'Maria Garcia', 'Fifi Osei', 'Kwame Asante', 'Ama Adjei', 'Kofi Mensah', 'Akosua Boateng'];

	useEffect(() => {
		if (formData.paymentProof) {
			const url = URL.createObjectURL(formData.paymentProof);
			setPreviewUrl(url);
			return () => URL.revokeObjectURL(url);
		}
		setPreviewUrl(null);
	}, [formData.paymentProof]);

	const validateForm = () => {
		const newErrors: Record<string, string> = {};

		if (!formData.phUser) {
			newErrors.phUser = 'Please select a PH user';
		}

		if (!formData.ghUser) {
			newErrors.ghUser = 'Please select a GH user';
		}

		if (formData.phUser === formData.ghUser) {
			newErrors.ghUser = 'PH user and GH user cannot be the same';
		}

		if (!formData.amount) {
			newErrors.amount = 'Amount is required';
		} else if (isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
			newErrors.amount = 'Please enter a valid amount';
		} else if (Number(formData.amount) > 10000) {
			newErrors.amount = 'Amount cannot exceed 10,000 ${getSettings()?.baseCurrency ? getSettings()?.baseCurrency : getCurrencyFromLocalStorage()?.code}';
		}

		if (formData.status === 'Confirmed' && !formData.paymentProof) {
			newErrors.paymentProof = 'Payment proof is required for confirmed transactions';
		}

		if (formData.paymentProof) {
			const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
			if (!validTypes.includes(formData.paymentProof.type)) {
				newErrors.paymentProof = 'Please upload a valid image file (JPEG, PNG)';
			} else if (formData.paymentProof.size > 5 * 1024 * 1024) {
				newErrors.paymentProof = 'File size must be less than 5MB';
			}
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setFormData({ ...formData, paymentProof: file });
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!validateForm()) return;
		setLoading(true);
		try {
			await new Promise((resolve) => setTimeout(resolve, 1500));
			let paymentProofUrl = '';
			if (formData.paymentProof) paymentProofUrl = URL.createObjectURL(formData.paymentProof);
			const newTransaction: Transaction = {
				id: Date.now().toString(),
				phUser: formData.phUser,
				ghUser: formData.ghUser,
				amount: `${formData.amount} ${getSettings()?.baseCurrency || getCurrencyFromLocalStorage()?.code}`,
				dateMatched: new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
				status: formData.status,
				paymentProof: paymentProofUrl,
			};
			onAdd(newTransaction);
			toast.success('Transaction added successfully');
			handleClose();
		} catch (error) {
			toast.error('Failed to add transaction');
		} finally {
			setLoading(false);
		}
	};

	const handleClose = () => {
		if (!loading) {
			setFormData({ phUser: '', ghUser: '', amount: '', status: 'Pending', paymentProof: null });
			setErrors({});
			setPreviewUrl(null);
			onClose();
		}
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-in fade-in-0 !m-0">
			<Card className="max-w-md w-full bg-white shadow-lg border-slate-200 animate-in fade-in-0 zoom-in-95">
				<CardHeader>
					<div className="flex justify-between items-start">
						<div>
							<CardTitle>Add New Transaction</CardTitle>
							<CardDescription>Manually create a new transaction record.</CardDescription>
						</div>
						<button onClick={handleClose} disabled={loading} className="p-1 rounded-full text-slate-500 hover:bg-slate-100">
							<i className="ri-close-line text-xl"></i>
						</button>
					</div>
				</CardHeader>
				<form onSubmit={handleSubmit}>
					<CardContent className="max-h-[60vh] overflow-y-auto p-6 space-y-4">
						<div className="grid grid-cols-2 gap-4">
							<div>
								<label>PH User *</label>
								<select value={formData.phUser} onChange={(e) => setFormData({ ...formData, phUser: e.target.value })} className={cn(errors.phUser && 'border-red-500')} disabled={loading} required>
									<option value="">Select User</option>
									{mockUsers.map((user) => (
										<option key={user} value={user}>
											{user}
										</option>
									))}
								</select>
								{errors.phUser && <p className="form-error">{errors.phUser}</p>}
							</div>
							<div>
								<label>GH User *</label>
								<select value={formData.ghUser} onChange={(e) => setFormData({ ...formData, ghUser: e.target.value })} className={cn(errors.ghUser && 'border-red-500')} disabled={loading} required>
									<option value="">Select User</option>
									{mockUsers.map((user) => (
										<option key={user} value={user}>
											{user}
										</option>
									))}
								</select>
								{errors.ghUser && <p className="form-error">{errors.ghUser}</p>}
							</div>
						</div>
						<div>
							<label>Amount ({getSettings()?.baseCurrency || getCurrencyFromLocalStorage()?.code}) *</label>
							<input type="number" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} className={cn(errors.amount && 'border-red-500')} placeholder="Enter amount" disabled={loading} required />
							{errors.amount && <p className="form-error">{errors.amount}</p>}
						</div>
						<div>
							<label>Status *</label>
							<select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as Transaction['status'] })} disabled={loading} required>
								<option value="Pending">Pending</option>
								<option value="Paid">Paid</option>
								<option value="Confirmed">Confirmed</option>
							</select>
						</div>
						<div>
							<label>Payment Proof {formData.status === 'Confirmed' && <span className="text-red-500">*</span>}</label>
							<input
								type="file"
								accept="image/jpeg,image/png,image/jpg"
								onChange={handleFileChange}
								className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
								disabled={loading}
							/>
							{previewUrl && <img src={previewUrl} alt="Preview" className="mt-2 w-full h-32 object-cover rounded-lg border" />}
							{errors.paymentProof && <p className="form-error">{errors.paymentProof}</p>}
						</div>
					</CardContent>
					<CardFooter className="justify-end gap-3">
						<Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
							Cancel
						</Button>
						<Button type="submit" disabled={loading} className="min-w-[140px]">
							{loading ? 'Adding...' : 'Add Transaction'}
						</Button>
					</CardFooter>
				</form>
			</Card>
		</div>
	);
}
