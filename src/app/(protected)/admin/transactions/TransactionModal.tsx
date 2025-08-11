'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { getCurrencyFromLocalStorage, getSettings } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { Transaction } from './content';

interface TransactionModalProps {
	isOpen: boolean;
	onClose: () => void;
	transaction: Transaction | null;
	onSave: (transaction: Transaction) => void;
}

export function TransactionModal({ isOpen, onClose, transaction, onSave }: TransactionModalProps) {
	const [formData, setFormData] = useState({ amount: '', status: 'Pending' as Transaction['status'], paymentProofFile: null as File | null, paymentProof: '' });
	const [loading, setLoading] = useState(false);
	const [errors, setErrors] = useState<{ [key: string]: string }>({});

	useEffect(() => {
		if (transaction) setFormData({ amount: transaction.amount, status: transaction.status, paymentProofFile: null, paymentProof: transaction.paymentProof });
	}, [transaction]);

	const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
			setFormData((prev) => ({
				...prev,
				paymentProofFile: file,
				paymentProof: URL.createObjectURL(file),
			}));
		} else if (file) {
			toast.error('Please select a valid image file (JPEG or PNG)');
		}
	};

	const validateForm = () => {
		const newErrors: { [key: string]: string } = {};

		if (!formData.amount.trim()) {
			newErrors.amount = 'Amount is required';
		} else if (!/^\d+(\.\d{1,2})?(\s*(GHC|USD|EUR))?$/.test(formData.amount.trim())) {
			logger.error('Invalid amount format', formData.amount);
			newErrors.amount = `Invalid amount format (e.g., 100.50 ${getSettings()?.baseCurrency ? getSettings()?.baseCurrency : getCurrencyFromLocalStorage()?.code})`;
		}

		if (!formData.status) {
			newErrors.status = 'Status is required';
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) return;

		setLoading(true);

		try {
			await new Promise((resolve) => setTimeout(resolve, 1500));

			if (transaction) {
				const updatedTransaction = {
					...transaction,
					amount: formData.amount,
					status: formData.status,
					paymentProof: formData.paymentProof,
				};
				onSave(updatedTransaction);
				toast.success('Transaction updated successfully!');
			}

			onClose();
		} catch (error) {
			toast.error('Failed to update transaction. Please try again.');
		} finally {
			setLoading(false);
		}
	};
	const handleClose = () => {
		setFormData({
			amount: '',
			status: 'Pending',
			paymentProofFile: null,
			paymentProof: '',
		});
		setErrors({});
		onClose();
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-in fade-in-0 !m-0">
			<Card className="max-w-md w-full bg-white shadow-lg border-slate-200 animate-in fade-in-0 zoom-in-95">
				<CardHeader>
					<div className="flex justify-between items-start">
						<div>
							<CardTitle>Edit Transaction</CardTitle>
							<CardDescription>Update the details for this transaction record.</CardDescription>
						</div>
						<button onClick={handleClose} className="p-1 rounded-full text-slate-500 hover:bg-slate-100">
							<i className="ri-close-line text-xl"></i>
						</button>
					</div>
				</CardHeader>
				<form onSubmit={handleSubmit}>
					<CardContent className="space-y-4">
						<div>
							<label>Amount</label>
							<input type="text" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} className={cn(errors.amount && 'border-red-500')} disabled={loading} />
							{errors.amount && <p className="form-error">{errors.amount}</p>}
						</div>
						<div>
							<label>Status</label>
							<select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as Transaction['status'] })} className={cn(errors.status && 'border-red-500')} disabled={loading}>
								<option value="pending">Pending</option>
								<option value="proof-submitted">Submitted POP</option>
								<option value="confirmed">Confirmed</option>
								<option value="expired">Expired</option>
							</select>
							{errors.status && <p className="form-error">{errors.status}</p>}
						</div>
						<div>
							<label>Payment Proof</label>
							<input type="file" accept="image/*" onChange={handleFileSelect} id="payment-proof-upload" className="hidden" disabled={loading} />
							<div className="flex items-center gap-4">
								<label htmlFor="payment-proof-upload" className="flex-shrink-0 cursor-pointer text-sm font-medium text-indigo-600 hover:text-indigo-800">
									Upload New
								</label>
								{formData.paymentProof && <img src={formData.paymentProof} alt="Proof" className="w-16 h-16 object-cover border rounded-lg" />}
							</div>
						</div>
					</CardContent>
					<CardFooter className="justify-end gap-3">
						<Button type="button" onClick={handleClose} variant="outline" disabled={loading}>
							Cancel
						</Button>
						<Button type="submit" disabled={loading} className="min-w-[140px]">
							{loading ? 'Updating...' : 'Update Transaction'}
						</Button>
					</CardFooter>
				</form>
			</Card>
		</div>
	);
}
