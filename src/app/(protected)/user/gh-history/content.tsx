'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { HistorySkeleton } from '@/components/LoadingSkeleton';
import { CustomLink } from '@/components/CustomLink';

interface GHTransaction {
	id: number;
	type: string;
	recipient: string;
	amount: string;
	date: string;
	time: string;
	status: 'Pending' | 'Completed';
}

const mockTransactions: GHTransaction[] = [
	{
		id: 1,
		type: 'Gave help',
		recipient: 'Mikel',
		amount: 'N100,000.00',
		date: '9th June, 2025',
		time: '02:00pm',
		status: 'Pending',
	},
	{
		id: 2,
		type: 'Gave help',
		recipient: 'Sarah',
		amount: 'N75,000.00',
		date: '8th June, 2025',
		time: '10:30am',
		status: 'Completed',
	},
	{
		id: 3,
		type: 'Gave help',
		recipient: 'John',
		amount: 'N200,000.00',
		date: '7th June, 2025',
		time: '03:15pm',
		status: 'Pending',
	},
	{
		id: 4,
		type: 'Gave help',
		recipient: 'Mary',
		amount: 'N50,000.00',
		date: '6th June, 2025',
		time: '11:45am',
		status: 'Completed',
	},
	{
		id: 5,
		type: 'Gave help',
		recipient: 'David',
		amount: 'N150,000.00',
		date: '5th June, 2025',
		time: '04:20pm',
		status: 'Pending',
	},
];

export default function GHHistoryPage() {
	const [isLoading, setIsLoading] = useState(true);
	const [transactions, setTransactions] = useState<GHTransaction[]>([]);

	useEffect(() => {
		const fetchTransactions = async () => {
			try {
				await new Promise((resolve) => setTimeout(resolve, 1200));

				setTransactions(mockTransactions);
			} catch (error) {
				console.error('Error fetching GH history:', error);
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
						<h2 className="text-3xl font-extrabold text-indigo-900 dark:text-indigo-100 mb-8 drop-shadow-lg">GH History</h2>

						{/* Action Buttons */}
						<div className="flex flex-col sm:flex-row gap-4 mb-10">
							<CustomLink href="/user/provide-help">
								<Button className="bg-gradient-to-tr from-indigo-600 via-purple-600 to-emerald-500 hover:from-indigo-700 hover:to-emerald-600 text-white font-bold rounded-xl px-6 py-3 shadow-lg flex-1 sm:flex-none">
									<i className="ri-hand-heart-line w-5 h-5 flex items-center justify-center mr-2"></i>
									Provide Help
								</Button>
							</CustomLink>
							<CustomLink href="/user/get-help">
								<Button className="bg-gradient-to-tr from-blue-400 via-blue-500 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white font-bold rounded-xl px-6 py-3 shadow-lg flex-1 sm:flex-none">
									<i className="ri-question-line w-5 h-5 flex items-center justify-center mr-2"></i>
									Get Help
								</Button>
							</CustomLink>
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
													<div className="w-10 h-10 bg-gradient-to-tr from-red-200 via-purple-200 to-indigo-200 dark:from-red-900 dark:via-purple-900 dark:to-indigo-900 rounded-full flex items-center justify-center">
														<i className="ri-download-line w-5 h-5 flex items-center justify-center text-red-600 dark:text-red-300"></i>
													</div>
													<div>
														<p className="font-extrabold text-indigo-900 dark:text-indigo-100 text-lg">{transaction.type}</p>
														<p className="text-sm text-indigo-700 dark:text-indigo-200">To: {transaction.recipient}</p>
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
												<span
													className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${
														transaction.status === 'Completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
													} shadow`}
												>
													{transaction.status}
												</span>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>

						{/* Mobile Card View */}
						<div className="lg:hidden space-y-6">
							{transactions.map((transaction) => (
								<div key={transaction.id} className="bg-gradient-to-tr from-indigo-100 via-purple-100 to-red-100 dark:from-indigo-900 dark:via-purple-900 dark:to-red-900 rounded-2xl p-6 shadow flex flex-col gap-3">
									<div className="flex items-start justify-between mb-2">
										<div className="flex items-center gap-4">
											<div className="w-10 h-10 bg-gradient-to-tr from-red-200 via-purple-200 to-indigo-200 dark:from-red-900 dark:via-purple-900 dark:to-indigo-900 rounded-full flex items-center justify-center">
												<i className="ri-download-line w-5 h-5 flex items-center justify-center text-red-600 dark:text-red-300"></i>
											</div>
											<div>
												<p className="font-extrabold text-indigo-900 dark:text-indigo-100 text-base">{transaction.type}</p>
												<p className="text-xs text-indigo-700 dark:text-indigo-200">To: {transaction.recipient}</p>
											</div>
										</div>
										<span
											className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${
												transaction.status === 'Completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
											} shadow`}
										>
											{transaction.status}
										</span>
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

						{/* Empty State */}
						{transactions.length === 0 && !isLoading && (
							<div className="bg-gradient-to-tr from-indigo-100 via-purple-100 to-red-100 dark:from-indigo-900 dark:via-purple-900 dark:to-red-900 rounded-2xl p-10 text-center shadow">
								<i className="ri-file-list-line w-16 h-16 flex items-center justify-center mx-auto mb-6 text-indigo-200 dark:text-indigo-900"></i>
								<h3 className="text-2xl font-bold text-indigo-900 dark:text-indigo-100 mb-2">No GH History</h3>
								<p className="text-indigo-700 dark:text-indigo-200 mb-6 text-lg">You haven't provided any help yet.</p>
								<CustomLink href="/user/provide-help">
									<Button className="bg-gradient-to-tr from-indigo-600 via-purple-600 to-emerald-500 hover:from-indigo-700 hover:to-emerald-600 text-white font-bold rounded-xl px-6 py-3 shadow-lg">
										<i className="ri-hand-heart-line w-5 h-5 flex items-center justify-center mr-2"></i>
										Provide Help
									</Button>
								</CustomLink>
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
