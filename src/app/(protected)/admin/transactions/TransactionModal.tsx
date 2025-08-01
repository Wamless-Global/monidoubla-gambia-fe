'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { getCurrencyFromLocalStorage } from '@/lib/helpers';

interface Transaction {
	id: string;
	phUser: string;
	ghUser: string;
	amount: string;
	dateMatched: string;
	status: 'Confirmed' | 'Paid' | 'Pending';
	paymentProof: string;
}

interface TransactionModalProps {
	isOpen: boolean;
	onClose: () => void;
	transaction: Transaction | null;
	onSave: (transaction: Transaction) => void;
}

export function TransactionModal({ isOpen, onClose, transaction, onSave }: TransactionModalProps) {
	const [formData, setFormData] = useState({
		amount: '',
		status: 'Pending' as Transaction['status'],
		paymentProofFile: null as File | null,
		paymentProof: '',
	});
	const [loading, setLoading] = useState(false);
	const [errors, setErrors] = useState<{ [key: string]: string }>({});

	useEffect(() => {
		if (transaction) {
			setFormData({
				amount: transaction.amount,
				status: transaction.status,
				paymentProofFile: null,
				paymentProof: transaction.paymentProof,
			});
		}
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
			newErrors.amount = `Invalid amount format (e.g., 100.50 ${getCurrencyFromLocalStorage()?.code})`;
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
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 !m-0">
			<div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
				<div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
					<h2 className="text-xl font-semibold text-gray-900 dark:text-white">Edit Transaction</h2>
					<button onClick={handleClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
						<i className="ri-close-line w-5 h-5 flex items-center justify-center text-gray-500 dark:text-gray-400"></i>
					</button>
				</div>

				<form onSubmit={handleSubmit} className="p-6 space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Amount</label>
						<input
							type="text"
							value={formData.amount}
							onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
							className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${errors.amount ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
							placeholder={`e.g., 300 ${getCurrencyFromLocalStorage()?.code}`}
							disabled={loading}
						/>
						{errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount}</p>}
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
						<select
							value={formData.status}
							onChange={(e) => setFormData({ ...formData, status: e.target.value as Transaction['status'] })}
							className={`w-full px-3 py-2 pr-8 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${errors.status ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
							disabled={loading}
						>
							<option value="Pending">Pending</option>
							<option value="Paid">Paid</option>
							<option value="Confirmed">Confirmed</option>
							<option value="proof-submitted">Submitted POP</option>
						</select>
						{errors.status && <p className="text-red-500 text-sm mt-1">{errors.status}</p>}
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Payment Proof</label>
						<div className="space-y-3">
							<div className="flex items-center gap-4">
								<input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" id="payment-proof-upload" disabled={loading} />
								<label htmlFor="payment-proof-upload" className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition-colors">
									<i className="ri-upload-line w-4 h-4 flex items-center justify-center"></i>
									<span>Upload Proof</span>
								</label>
								{formData.paymentProofFile && <span className="text-sm text-gray-600 dark:text-gray-400">{formData.paymentProofFile.name}</span>}
							</div>

							{formData.paymentProof && (
								<div className="mt-2">
									<p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Payment Proof Preview:</p>
									<img src={formData.paymentProof} alt="Payment proof" className="w-full h-32 object-cover border border-gray-300 dark:border-gray-600 rounded" />
								</div>
							)}
						</div>
					</div>

					<div className="flex justify-end gap-3 pt-4">
						<Button type="button" onClick={handleClose} variant="outline" disabled={loading} className="whitespace-nowrap bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600">
							Cancel
						</Button>
						<Button type="submit" disabled={loading} className="whitespace-nowrap min-w-[120px] bg-blue-600 hover:bg-blue-700 text-white">
							{loading ? (
								<div className="flex items-center gap-2">
									<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
									<span>Updating...</span>
								</div>
							) : (
								'Update Transaction'
							)}
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
}
