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
		<div className="p-4 lg:p-6  min-h-screen">
			<div className="max-w-6xl mx-auto">
				<Card className="bg-white dark:bg-gray-800 border-0 shadow-sm rounded-lg p-4 lg:p-6">
					<CardContent className="p-0">
						<h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-6">GH History</h2>

						{/* Action Buttons */}
						<div className="flex flex-col sm:flex-row gap-4 mb-6">
							<CustomLink href="/user/provide-help">
								<Button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg whitespace-nowrap">
									<i className="ri-hand-heart-line w-4 h-4 flex items-center justify-center mr-2"></i>
									Provide Help
								</Button>
							</CustomLink>
							<CustomLink href="/user/get-help">
								<Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg whitespace-nowrap">
									<i className="ri-question-line w-4 h-4 flex items-center justify-center mr-2"></i>
									Get Help
								</Button>
							</CustomLink>
						</div>

						{/* Desktop Table View */}
						<div className="hidden lg:block bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
							<div className="overflow-x-auto">
								<table className="w-full">
									<thead>
										<tr className="border-b bg-gray-50 dark:bg-gray-700">
											<th className="text-left p-4 font-semibold text-gray-900 dark:text-white">Transaction</th>
											<th className="text-left p-4 font-semibold text-gray-900 dark:text-white">Date & Time</th>
											<th className="text-left p-4 font-semibold text-gray-900 dark:text-white">Amount</th>
											<th className="text-left p-4 font-semibold text-gray-900 dark:text-white">Status</th>
										</tr>
									</thead>
									<tbody>
										{transactions.map((transaction) => (
											<tr key={transaction.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
												<td className="p-4">
													<div className="flex items-center gap-3">
														<div className="w-8 h-8 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
															<i className="ri-download-line w-4 h-4 flex items-center justify-center text-red-600 dark:text-red-400"></i>
														</div>
														<div>
															<p className="font-medium text-gray-900 dark:text-white">{transaction.type}</p>
															<p className="text-sm text-gray-600 dark:text-gray-400">To: {transaction.recipient}</p>
														</div>
													</div>
												</td>
												<td className="p-4">
													<p className="text-gray-900 dark:text-white">{transaction.date}</p>
													<p className="text-sm text-gray-600 dark:text-gray-400">{transaction.time}</p>
												</td>
												<td className="p-4">
													<p className="font-semibold text-gray-900 dark:text-white">{transaction.amount}</p>
												</td>
												<td className="p-4">
													<span
														className={`px-2 py-1 rounded-full text-xs font-medium ${transaction.status === 'Completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'}`}
													>
														{transaction.status}
													</span>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>

						{/* Mobile Card View */}
						<div className="lg:hidden space-y-4">
							{transactions.map((transaction) => (
								<div key={transaction.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
									<div className="flex items-start justify-between mb-3">
										<div className="flex items-center gap-3">
											<div className="w-8 h-8 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
												<i className="ri-download-line w-4 h-4 flex items-center justify-center text-red-600 dark:text-red-400"></i>
											</div>
											<div>
												<p className="font-medium text-gray-900 dark:text-white">{transaction.type}</p>
												<p className="text-sm text-gray-600 dark:text-gray-400">To: {transaction.recipient}</p>
											</div>
										</div>
										<span className={`px-2 py-1 rounded-full text-xs font-medium ${transaction.status === 'Completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'}`}>
											{transaction.status}
										</span>
									</div>
									<div className="flex justify-between items-center">
										<div>
											<p className="text-sm text-gray-900 dark:text-white">{transaction.date}</p>
											<p className="text-xs text-gray-600 dark:text-gray-400">{transaction.time}</p>
										</div>
										<p className="font-semibold text-gray-900 dark:text-white">{transaction.amount}</p>
									</div>
								</div>
							))}
						</div>

						{/* Empty State */}
						{transactions.length === 0 && !isLoading && (
							<div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
								<i className="ri-file-list-line w-12 h-12 flex items-center justify-center mx-auto mb-4 text-gray-400"></i>
								<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No GH History</h3>
								<p className="text-gray-600 dark:text-gray-400 mb-4">You haven't provided any help yet.</p>
								<CustomLink href="/user/provide-help">
									<Button className="bg-green-600 hover:bg-green-700 text-white whitespace-nowrap">
										<i className="ri-hand-heart-line w-4 h-4 flex items-center justify-center mr-2"></i>
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
