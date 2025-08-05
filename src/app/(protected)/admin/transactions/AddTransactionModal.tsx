'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { getCurrencyFromLocalStorage, getSettings } from '@/lib/helpers';

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
	const [formData, setFormData] = useState({
		phUser: '',
		ghUser: '',
		amount: '',
		status: 'Pending' as 'Confirmed' | 'Paid' | 'Pending',
		paymentProof: null as File | null,
	});
	const [loading, setLoading] = useState(false);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);

	const mockUsers = ['John Michael', 'Sarah Johnson', 'Michael Brown', 'Emily Davis', 'David Wilson', 'Lisa Anderson', 'Robert Taylor', 'Jennifer Martinez', 'James Thompson', 'Maria Garcia', 'Fifi Osei', 'Kwame Asante', 'Ama Adjei', 'Kofi Mensah', 'Akosua Boateng'];

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

	useEffect(() => {
		if (formData.paymentProof) {
			const url = URL.createObjectURL(formData.paymentProof);
			setPreviewUrl(url);
			return () => URL.revokeObjectURL(url);
		} else {
			setPreviewUrl(null);
		}
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

		if (!validateForm()) {
			return;
		}

		setLoading(true);

		try {
			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 2000));

			// Simulate file upload
			let paymentProofUrl = '';
			if (formData.paymentProof) {
				await new Promise((resolve) => setTimeout(resolve, 1000));
				paymentProofUrl = URL.createObjectURL(formData.paymentProof);
			}

			const newTransaction: Transaction = {
				id: Date.now().toString(),
				phUser: formData.phUser,
				ghUser: formData.ghUser,
				amount: `${formData.amount} ${getSettings()?.baseCurrency ? getSettings()?.baseCurrency : getCurrencyFromLocalStorage()?.code}`,
				dateMatched: new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
				status: formData.status,
				paymentProof: paymentProofUrl,
			};

			onAdd(newTransaction);
			toast.success('Transaction added successfully');

			// Reset form
			setFormData({
				phUser: '',
				ghUser: '',
				amount: '',
				status: 'Pending',
				paymentProof: null,
			});
			setErrors({});
			setPreviewUrl(null);
			setLoading(false);
			onClose();
		} catch (error) {
			toast.error('Failed to add transaction');
			setLoading(false);
		}
	};

	const handleClose = () => {
		if (!loading) {
			setFormData({
				phUser: '',
				ghUser: '',
				amount: '',
				status: 'Pending',
				paymentProof: null,
			});
			setErrors({});
			setPreviewUrl(null);
			onClose();
		}
	};

	if (!isOpen) return null;

	return (
		<>
			<div className="fixed inset-0 bg-black bg-opacity-50 z-50 !mt-0" onClick={handleClose} />

			<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
					<div className="p-6">
						<div className="flex items-center justify-between mb-6">
							<h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add New Transaction</h3>
							<button onClick={handleClose} disabled={loading} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50">
								<i className="ri-close-line w-5 h-5 flex items-center justify-center text-gray-600 dark:text-gray-400"></i>
							</button>
						</div>

						<form onSubmit={handleSubmit} className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">PH User</label>
								<select
									value={formData.phUser}
									onChange={(e) => setFormData({ ...formData, phUser: e.target.value })}
									className={`w-full px-3 py-2 pr-8 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${errors.phUser ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
									disabled={loading}
									required
								>
									<option value="">Select PH User</option>
									{mockUsers.map((user) => (
										<option key={user} value={user}>
											{user}
										</option>
									))}
								</select>
								{errors.phUser && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.phUser}</p>}
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">GH User</label>
								<select
									value={formData.ghUser}
									onChange={(e) => setFormData({ ...formData, ghUser: e.target.value })}
									className={`w-full px-3 py-2 pr-8 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${errors.ghUser ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
									disabled={loading}
									required
								>
									<option value="">Select GH User</option>
									{mockUsers.map((user) => (
										<option key={user} value={user}>
											{user}
										</option>
									))}
								</select>
								{errors.ghUser && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.ghUser}</p>}
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount ({getSettings()?.baseCurrency ? getSettings()?.baseCurrency : getCurrencyFromLocalStorage()?.code})</label>
								<input
									type="number"
									min="1"
									max="10000"
									step="1"
									value={formData.amount}
									onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
									className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${errors.amount ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
									placeholder="Enter amount"
									disabled={loading}
									required
								/>
								{errors.amount && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.amount}</p>}
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
								<select
									value={formData.status}
									onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Confirmed' | 'Paid' | 'Pending' })}
									className="w-full px-3 py-2 pr-8 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
									disabled={loading}
									required
								>
									<option value="Pending">Pending</option>
									<option value="Confirmed">Confirmed</option>
									<option value="Paid">Paid</option>
								</select>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Proof {formData.status === 'Confirmed' && <span className="text-red-500">*</span>}</label>
								<div className="space-y-2">
									<input
										type="file"
										accept="image/jpeg,image/png,image/jpg"
										onChange={handleFileChange}
										className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
										disabled={loading}
									/>
									{previewUrl && (
										<div className="mt-2">
											<img src={previewUrl} alt="Payment proof preview" className="w-full h-32 object-cover rounded-lg border border-gray-300 dark:border-gray-600" />
										</div>
									)}
								</div>
								{errors.paymentProof && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.paymentProof}</p>}
								<p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Supported formats: JPEG, PNG. Max size: 5MB.</p>
							</div>

							<div className="flex justify-end gap-3 pt-4">
								<Button type="button" variant="outline" onClick={handleClose} disabled={loading} className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600">
									Cancel
								</Button>
								<Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white whitespace-nowrap">
									{loading ? (
										<div className="flex items-center gap-2">
											<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
											<span>Adding...</span>
										</div>
									) : (
										'Add Transaction'
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
