'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { HistorySkeleton } from '@/components/LoadingSkeleton';
import { useRouter } from 'next/navigation';
import { CustomLink } from '@/components/CustomLink';
import { getCurrencyFromLocalStorage } from '@/lib/helpers';

interface PHTransaction {
	id: number;
	type: string;
	username: string;
	date: string;
	time: string;
	amount: string;
	status: string;
}

const mockTransactions: PHTransaction[] = [
	{
		id: 1,
		type: 'Assigned request to provide Help',
		username: 'Chizzy',
		date: '9th June, 2025',
		time: '02:00pm',
		amount: `5,000.00 ${getCurrencyFromLocalStorage()?.code}`,
		status: 'pending',
	},
	{
		id: 2,
		type: 'Assigned request to provide Help',
		username: 'Chizzy',
		date: '9th June, 2025',
		time: '02:00pm',
		amount: `5,000.00 ${getCurrencyFromLocalStorage()?.code}`,
		status: 'pending',
	},
	{
		id: 3,
		type: 'Assigned request to provide Help',
		username: 'Chizzy',
		date: '9th June, 2025',
		time: '02:00pm',
		amount: `5,000.00 ${getCurrencyFromLocalStorage()?.code}`,
		status: 'pending',
	},
	{
		id: 4,
		type: 'Assigned request to provide Help',
		username: 'Chizzy',
		date: '9th June, 2025',
		time: '02:00pm',
		amount: `5,000.00 ${getCurrencyFromLocalStorage()?.code}`,
		status: 'pending',
	},
];

export default function PHHistoryPage() {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(true);
	const [transactions, setTransactions] = useState<PHTransaction[]>([]);

	useEffect(() => {
		const fetchTransactions = async () => {
			try {
				await new Promise((resolve) => setTimeout(resolve, 1300));

				setTransactions(mockTransactions);
			} catch (error) {
				console.error('Error fetching PH history:', error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchTransactions();
	}, []);

	if (isLoading) {
		return <HistorySkeleton />;
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-emerald-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 py-0 px-0">
			<div className="max-w-6xl mx-auto py-10 px-4">
				<Card className="rounded-3xl shadow-2xl bg-white/90 dark:bg-gray-900/90 border-2 border-indigo-100 dark:border-indigo-900 p-8">
					<CardContent className="p-0">
						<h2 className="text-3xl font-extrabold text-indigo-900 dark:text-indigo-100 mb-8 drop-shadow-lg">PH History</h2>

						{/* Action Buttons */}
						<div className="flex flex-col sm:flex-row gap-4 mb-10">
							<CustomLink href="/user/provide-help">
								<Button className="bg-gradient-to-tr from-indigo-600 via-purple-600 to-emerald-500 hover:from-indigo-700 hover:to-emerald-600 text-white font-bold rounded-xl px-6 py-3 shadow-lg flex-1 sm:flex-none">
									<i className="ri-hand-heart-line w-5 h-5 flex items-center justify-center mr-2"></i>
									Provide Help
								</Button>
							</CustomLink>
							<CustomLink href="/user/get-help">
								<Button className="bg-gradient-to-tr from-yellow-400 via-yellow-500 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-white font-bold rounded-xl px-6 py-3 shadow-lg flex-1 sm:flex-none">
									<i className="ri-question-line w-5 h-5 flex items-center justify-center mr-2"></i>
									Get Help
								</Button>
							</CustomLink>
						</div>

						{/* Recent Transactions */}
						<div className="mb-6">
							<h3 className="text-2xl font-bold text-indigo-900 dark:text-indigo-100 mb-4">Recent transactions</h3>
						</div>

						{/* Desktop Table View */}
						<div className="hidden lg:block overflow-x-auto">
							<table className="w-full rounded-2xl overflow-hidden">
								<thead>
									<tr className="border-b-2 border-indigo-100 dark:border-indigo-900">
										<th className="text-left py-4 px-6 font-bold text-indigo-700 dark:text-indigo-200 text-lg">Transaction</th>
										<th className="text-left py-4 px-6 font-bold text-indigo-700 dark:text-indigo-200 text-lg">Date & Time</th>
										<th className="text-right py-4 px-6 font-bold text-indigo-700 dark:text-indigo-200 text-lg">Amount</th>
										<th className="text-center py-4 px-6 font-bold text-indigo-700 dark:text-indigo-200 text-lg">Status</th>
									</tr>
								</thead>
								<tbody>
									{transactions.map((transaction) => (
										<tr key={transaction.id} className="border-b border-indigo-100 dark:border-indigo-900 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all">
											<td className="py-4 px-6">
												<div className="flex items-center gap-4">
													<div className="w-10 h-10 bg-gradient-to-tr from-green-200 via-emerald-200 to-indigo-200 dark:from-green-900 dark:via-emerald-900 dark:to-indigo-900 rounded-full flex items-center justify-center">
														<i className="ri-arrow-up-line w-5 h-5 flex items-center justify-center text-green-600 dark:text-green-300"></i>
													</div>
													<div>
														<p className="font-extrabold text-indigo-900 dark:text-indigo-100 text-lg">{transaction.type}</p>
														<p className="text-sm text-indigo-700 dark:text-indigo-200">Username: {transaction.username}</p>
													</div>
												</div>
											</td>
											<td className="py-4 px-6">
												<p className="text-indigo-900 dark:text-indigo-100 font-bold">{transaction.date}</p>
												<p className="text-sm text-indigo-700 dark:text-indigo-200">{transaction.time}</p>
											</td>
											<td className="py-4 px-6 text-right">
												<p className="font-black text-emerald-700 dark:text-emerald-300 text-lg">{transaction.amount}</p>
											</td>
											<td className="py-4 px-6 text-center">
												<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300 shadow">{transaction.status}</span>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>

						{/* Mobile Card View */}
						<div className="lg:hidden space-y-6">
							{transactions.map((transaction) => (
								<div key={transaction.id} className="bg-gradient-to-tr from-indigo-100 via-purple-100 to-emerald-100 dark:from-indigo-900 dark:via-purple-900 dark:to-emerald-900 rounded-2xl p-6 shadow flex flex-col gap-3">
									<div className="flex items-start justify-between mb-2">
										<div className="flex items-center gap-4">
											<div className="w-10 h-10 bg-gradient-to-tr from-green-200 via-emerald-200 to-indigo-200 dark:from-green-900 dark:via-emerald-900 dark:to-indigo-900 rounded-full flex items-center justify-center">
												<i className="ri-arrow-up-line w-5 h-5 flex items-center justify-center text-green-600 dark:text-green-300"></i>
											</div>
											<div>
												<p className="font-extrabold text-indigo-900 dark:text-indigo-100 text-base">{transaction.type}</p>
												<p className="text-xs text-indigo-700 dark:text-indigo-200">Username: {transaction.username}</p>
											</div>
										</div>
										<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300 shadow">{transaction.status}</span>
									</div>
									<div className="flex justify-between items-center">
										<div>
											<p className="text-indigo-900 dark:text-indigo-100 font-bold">{transaction.date}</p>
											<p className="text-xs text-indigo-700 dark:text-indigo-200">{transaction.time}</p>
										</div>
										<p className="font-black text-emerald-700 dark:text-emerald-300 text-lg">{transaction.amount}</p>
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
