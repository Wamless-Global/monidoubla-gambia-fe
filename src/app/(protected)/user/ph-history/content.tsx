'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { HistorySkeleton } from '@/components/LoadingSkeleton';
import { useRouter } from 'next/navigation';
import { CustomLink } from '@/components/CustomLink';
import { getCurrencyFromLocalStorage, getSettings } from '@/lib/helpers';

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
		amount: `5,000.00 ${getSettings()?.baseCurrency ? getSettings()?.baseCurrency : getCurrencyFromLocalStorage()?.code}`,
		status: 'pending',
	},
	{
		id: 2,
		type: 'Assigned request to provide Help',
		username: 'Chizzy',
		date: '9th June, 2025',
		time: '02:00pm',
		amount: `5,000.00 ${getSettings()?.baseCurrency ? getSettings()?.baseCurrency : getCurrencyFromLocalStorage()?.code}`,
		status: 'pending',
	},
	{
		id: 3,
		type: 'Assigned request to provide Help',
		username: 'Chizzy',
		date: '9th June, 2025',
		time: '02:00pm',
		amount: `5,000.00 ${getSettings()?.baseCurrency ? getSettings()?.baseCurrency : getCurrencyFromLocalStorage()?.code}`,
		status: 'pending',
	},
	{
		id: 4,
		type: 'Assigned request to provide Help',
		username: 'Chizzy',
		date: '9th June, 2025',
		time: '02:00pm',
		amount: `5,000.00 ${getSettings()?.baseCurrency ? getSettings()?.baseCurrency : getCurrencyFromLocalStorage()?.code}`,
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
		<div className="p-4 lg:p-6  min-h-screen">
			<div className="max-w-6xl mx-auto">
				<Card className="bg-white dark:bg-gray-800 border-0 shadow-sm rounded-lg p-4 lg:p-6">
					<CardContent className="p-0">
						<h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-6">PH History</h2>

						{/* Action Buttons */}
						<div className="flex flex-col sm:flex-row gap-3 lg:gap-4 mb-6">
							<CustomLink href="/user/provide-help">
								<Button variant="solid-dark" className="flex-1 sm:flex-none bg-gray-900 hover:bg-gray-800 text-white dark:bg-gray-100 dark:hover:bg-gray-200 dark:text-gray-900">
									<i className="ri-hand-heart-line w-4 h-4 flex items-center justify-center mr-2"></i>
									Provide Help
								</Button>
							</CustomLink>

							<CustomLink href="/user/get-help">
								<Button variant="outline-yellow" className="flex-1 sm:flex-none whitespace-nowrap bg-yellow-500 hover:bg-yellow-600 text-white">
									<i className="ri-question-line w-4 h-4 flex items-center justify-center mr-2"></i>
									Get Help
								</Button>
							</CustomLink>
						</div>

						{/* Recent Transactions */}
						<div className="mb-4">
							<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent transactions</h3>
						</div>

						{/* Desktop Table View */}
						<div className="hidden lg:block overflow-x-auto">
							<table className="w-full">
								<thead>
									<tr className="border-b border-gray-200 dark:border-gray-700">
										<th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Transaction</th>
										<th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Date & Time</th>
										<th className="text-right py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Amount</th>
										<th className="text-center py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Status</th>
									</tr>
								</thead>
								<tbody>
									{transactions.map((transaction) => (
										<tr key={transaction.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
											<td className="py-4 px-4">
												<div className="flex items-center gap-3">
													<div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
														<i className="ri-arrow-up-line w-4 h-4 flex items-center justify-center text-green-600 dark:text-green-400"></i>
													</div>
													<div>
														<p className="font-medium text-gray-900 dark:text-white">{transaction.type}</p>
														<p className="text-sm text-gray-600 dark:text-gray-400">Username: {transaction.username}</p>
													</div>
												</div>
											</td>
											<td className="py-4 px-4">
												<p className="text-gray-900 dark:text-white">{transaction.date}</p>
												<p className="text-sm text-gray-600 dark:text-gray-400">{transaction.time}</p>
											</td>
											<td className="py-4 px-4 text-right">
												<p className="font-semibold text-red-600 dark:text-red-400">{transaction.amount}</p>
											</td>
											<td className="py-4 px-4 text-center">
												<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">{transaction.status}</span>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>

						{/* Mobile Card View */}
						<div className="lg:hidden space-y-4">
							{transactions.map((transaction) => (
								<div key={transaction.id} className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
									<div className="flex items-start justify-between mb-3">
										<div className="flex items-center gap-3">
											<div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
												<i className="ri-arrow-up-line w-4 h-4 flex items-center justify-center text-green-600 dark:text-green-400"></i>
											</div>
											<div>
												<p className="font-medium text-gray-900 dark:text-white text-sm">{transaction.type}</p>
												<p className="text-xs text-gray-600 dark:text-gray-400">Username: {transaction.username}</p>
											</div>
										</div>
										<span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">{transaction.status}</span>
									</div>
									<div className="flex justify-between items-center">
										<div>
											<p className="text-sm text-gray-900 dark:text-white">{transaction.date}</p>
											<p className="text-xs text-gray-600 dark:text-gray-400">{transaction.time}</p>
										</div>
										<p className="font-semibold text-red-600 dark:text-red-400">{transaction.amount}</p>
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
