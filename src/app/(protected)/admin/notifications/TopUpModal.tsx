'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// NOTE: All original interfaces and logic are preserved.
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
		}, 1500);
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-in fade-in-0 !m-0">
			<Card className="max-w-md w-full bg-white shadow-lg border-slate-200 animate-in fade-in-0 zoom-in-95">
				<CardHeader>
					<div className="flex justify-between items-start">
						<div>
							<CardTitle>Top Up SMS Credits</CardTitle>
							<CardDescription>Add more credits to your balance.</CardDescription>
						</div>
						<button onClick={onClose} className="p-1 rounded-full text-slate-500 hover:bg-slate-100">
							<i className="ri-close-line text-xl"></i>
						</button>
					</div>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="p-4 bg-slate-50 rounded-lg">
						<p className="text-sm text-slate-500">Current Balance</p>
						<p className="text-2xl font-bold text-slate-800">{currentBalance.toLocaleString()}</p>
					</div>
					<div>
						<label className="block text-sm font-medium text-slate-700 mb-2">Quick Select</label>
						<div className="grid grid-cols-3 gap-2">
							{predefinedAmounts.map((preAmount) => (
								<Button key={preAmount} variant={amount === preAmount.toString() ? 'default' : 'outline'} onClick={() => setAmount(preAmount.toString())}>
									{preAmount.toLocaleString()}
								</Button>
							))}
						</div>
					</div>
					<div>
						<label className="block text-sm font-medium text-slate-700 mb-2">Or Enter Custom Amount</label>
						<input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g. 500" className="w-full" />
					</div>
				</CardContent>
				<CardFooter className="justify-end gap-3">
					<Button variant="outline" onClick={onClose} disabled={isLoading}>
						Cancel
					</Button>
					<Button onClick={handleTopUp} disabled={isLoading || !amount || parseInt(amount) <= 0} className="min-w-[140px]">
						{isLoading ? 'Processing...' : 'Top Up Credits'}
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
}
