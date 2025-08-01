'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface TopUpModalProps {
	isOpen: boolean;
	onClose: () => void;
	onTopUp: (amount: number, method: string) => void;
	currentBalance: number;
}

export function TopUpModal({ isOpen, onClose, onTopUp, currentBalance }: TopUpModalProps) {
	const [amount, setAmount] = useState('');
	const [paymentMethod, setPaymentMethod] = useState('card');
	const [isLoading, setIsLoading] = useState(false);

	const predefinedAmounts = [1000, 5000, 10000, 25000, 50000, 100000];

	const handleTopUp = () => {
		const topUpAmount = parseInt(amount);
		if (!topUpAmount || topUpAmount <= 0) return;

		setIsLoading(true);
		setTimeout(() => {
			onTopUp(topUpAmount, paymentMethod);
			setIsLoading(false);
			setAmount('');
			onClose();
		}, 2000);
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
			<div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md">
				{/* Header */}
				<div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
					<h2 className="text-xl font-semibold text-gray-900 dark:text-white">Top Up SMS Credits</h2>
					<button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
						<i className="ri-close-line w-5 h-5 flex items-center justify-center text-gray-600 dark:text-gray-400"></i>
					</button>
				</div>

				{/* Content */}
				<div className="p-6 space-y-6">
					{/* Current Balance */}
					<div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
						<div className="text-sm text-gray-500 dark:text-gray-400">Current Balance</div>
						<div className="text-2xl font-bold text-gray-900 dark:text-white">{currentBalance.toLocaleString()}</div>
						<div className="text-xs text-gray-500 dark:text-gray-400">SMS Credits</div>
					</div>

					{/* Quick Amount Selection */}
					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Quick Select Amount</label>
						<div className="grid grid-cols-3 gap-2">
							{predefinedAmounts.map((preAmount) => (
								<button
									key={preAmount}
									onClick={() => setAmount(preAmount.toString())}
									className={`p-2 text-sm rounded-lg border transition-colors ${
										amount === preAmount.toString()
											? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-300'
											: 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
									}`}
								>
									{preAmount.toLocaleString()}
								</button>
							))}
						</div>
					</div>

					{/* Custom Amount */}
					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Or Enter Custom Amount</label>
						<input
							type="number"
							value={amount}
							onChange={(e) => setAmount(e.target.value)}
							placeholder="Enter amount"
							className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
						/>
					</div>

					{/* Payment Method */}
					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Payment Method</label>
						<div className="space-y-2">
							<label className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
								<input
									type="radio"
									name="paymentMethod"
									value="card"
									checked={paymentMethod === 'card'}
									onChange={(e) => setPaymentMethod(e.target.value)}
									className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
								/>
								<i className="ri-bank-card-line w-5 h-5 flex items-center justify-center text-gray-600 dark:text-gray-400"></i>
								<span className="text-sm font-medium text-gray-900 dark:text-white">Credit/Debit Card</span>
							</label>

							<label className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
								<input
									type="radio"
									name="paymentMethod"
									value="bank"
									checked={paymentMethod === 'bank'}
									onChange={(e) => setPaymentMethod(e.target.value)}
									className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
								/>
								<i className="ri-bank-line w-5 h-5 flex items-center justify-center text-gray-600 dark:text-gray-400"></i>
								<span className="text-sm font-medium text-gray-900 dark:text-white">Bank Transfer</span>
							</label>

							<label className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
								<input
									type="radio"
									name="paymentMethod"
									value="paypal"
									checked={paymentMethod === 'paypal'}
									onChange={(e) => setPaymentMethod(e.target.value)}
									className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
								/>
								<i className="ri-paypal-line w-5 h-5 flex items-center justify-center text-gray-600 dark:text-gray-400"></i>
								<span className="text-sm font-medium text-gray-900 dark:text-white">PayPal</span>
							</label>
						</div>
					</div>

					{/* Estimated New Balance */}
					{amount && parseInt(amount) > 0 && (
						<div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
							<div className="text-sm text-blue-600 dark:text-blue-400">Estimated New Balance</div>
							<div className="text-xl font-bold text-blue-700 dark:text-blue-300">{(currentBalance + parseInt(amount)).toLocaleString()}</div>
							<div className="text-xs text-blue-500 dark:text-blue-400">SMS Credits</div>
						</div>
					)}
				</div>

				{/* Footer */}
				<div className="flex items-center justify-end gap-3 p-6 border-t dark:border-gray-700">
					<Button variant="outline" onClick={onClose} disabled={isLoading} className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
						Cancel
					</Button>
					<Button onClick={handleTopUp} disabled={isLoading || !amount || parseInt(amount) <= 0} className="bg-blue-600 hover:bg-blue-700 text-white">
						{isLoading ? (
							<>
								<i className="ri-loader-4-line animate-spin w-4 h-4 flex items-center justify-center mr-2"></i>
								Processing...
							</>
						) : (
							'Top Up Credits'
						)}
					</Button>
				</div>
			</div>
		</div>
	);
}
