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
		return (
			<div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background to-blue-50 dark:to-blue-950/40">
				<div className="w-full max-w-6xl px-4 lg:px-0">
					<div className="animate-pulse space-y-8">
						<div className="h-8 w-48 rounded-lg bg-gradient-to-r from-blue-200/60 to-blue-100/30 mb-6" />
						<div className="rounded-xl bg-gradient-to-br from-white/60 to-blue-100/30 dark:from-blue-900/30 dark:to-blue-950/10 shadow-lg p-6">
							<div className="h-6 w-48 rounded bg-blue-100/60 dark:bg-blue-900/20 mb-6" />
							<div className="overflow-x-auto">
								<table className="w-full">
									<thead>
										<tr>
											{[...Array(4)].map((_, i) => (
												<th key={i} className="px-6 py-3">
													<div className="h-4 w-20 rounded bg-blue-100/60 dark:bg-blue-900/20" />
												</th>
											))}
										</tr>
									</thead>
									<tbody>
										{[...Array(5)].map((_, i) => (
											<tr key={i}>
												{[...Array(4)].map((_, j) => (
													<td key={j} className="px-6 py-4">
														<div className="h-4 w-16 rounded bg-blue-100/60 dark:bg-blue-900/20" />
													</td>
												))}
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-background to-blue-50 dark:to-blue-950/40 py-8 px-2 lg:px-0">
			<div className="max-w-6xl mx-auto w-full">
				<Card className="bg-gradient-to-br from-white/80 to-blue-50/40 dark:from-blue-900/30 dark:to-blue-950/10 border-0 shadow-lg rounded-xl p-4 lg:p-8">
					<CardContent className="p-0">
						<h2 className="text-2xl font-extrabold text-foreground mb-8 tracking-tight">GH History</h2>

						{/* Action Buttons */}
						<div className="flex flex-col sm:flex-row gap-4 mb-8">
							<CustomLink href="/user/provide-help">
								<Button className="bg-gradient-to-r from-green-600 to-green-400 hover:from-green-700 hover:to-green-500 text-white px-8 py-3 text-base font-semibold rounded-xl shadow-lg">
									<i className="ri-hand-heart-line w-5 h-5 flex items-center justify-center mr-2" />
									Provide Help
								</Button>
							</CustomLink>
							<CustomLink href="/user/get-help">
								<Button className="bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white px-8 py-3 text-base font-semibold rounded-xl shadow-lg">
									<i className="ri-question-line w-5 h-5 flex items-center justify-center mr-2" />
									Get Help
								</Button>
							</CustomLink>
						</div>

						{/* Desktop Table View */}
						<div className="hidden lg:block bg-gradient-to-br from-white/60 to-blue-100/20 dark:from-blue-900/20 dark:to-blue-950/5 rounded-xl border border-border/40">
							<div className="overflow-x-auto">
								<table className="w-full">
									<thead className="bg-gradient-to-r from-blue-50/60 to-white/10 dark:from-blue-900/10 dark:to-blue-950/5">
										<tr>
											<th className="text-left p-4 font-semibold text-foreground">Transaction</th>
											<th className="text-left p-4 font-semibold text-foreground">Date & Time</th>
											<th className="text-left p-4 font-semibold text-foreground">Amount</th>
											<th className="text-left p-4 font-semibold text-foreground">Status</th>
										</tr>
									</thead>
									<tbody>
										{transactions.map((transaction) => (
											<tr key={transaction.id} className="border-b border-border/40 hover:bg-gradient-to-r hover:from-blue-100/40 hover:to-white/10 dark:hover:from-blue-900/10 dark:hover:to-blue-950/5 transition-all">
												<td className="p-4">
													<div className="flex items-center gap-3">
														<div className="w-10 h-10 bg-gradient-to-br from-red-200/80 to-red-100/60 dark:from-red-900/40 dark:to-red-950/10 rounded-full flex items-center justify-center">
															<i className="ri-download-line w-5 h-5 flex items-center justify-center text-red-600 dark:text-red-300" />
														</div>
														<div>
															<p className="font-semibold text-foreground">{transaction.type}</p>
															<p className="text-sm text-muted-foreground">To: {transaction.recipient}</p>
														</div>
													</div>
												</td>
												<td className="p-4">
													<p className="text-foreground">{transaction.date}</p>
													<p className="text-sm text-muted-foreground">{transaction.time}</p>
												</td>
												<td className="p-4">
													<p className="font-bold text-foreground">{transaction.amount}</p>
												</td>
												<td className="p-4">
													<span
														className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
															transaction.status === 'Completed'
																? 'bg-gradient-to-r from-green-200/80 to-green-100/60 text-green-800 dark:from-green-900/40 dark:to-green-950/10 dark:text-green-200'
																: 'bg-gradient-to-r from-yellow-200/80 to-yellow-100/60 text-yellow-800 dark:from-yellow-900/40 dark:to-yellow-950/10 dark:text-yellow-200'
														}`}
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
								<div key={transaction.id} className="bg-gradient-to-br from-white/60 to-blue-100/20 dark:from-blue-900/20 dark:to-blue-950/5 rounded-xl border border-border/40 p-4">
									<div className="flex items-start justify-between mb-3">
										<div className="flex items-center gap-3">
											<div className="w-10 h-10 bg-gradient-to-br from-red-200/80 to-red-100/60 dark:from-red-900/40 dark:to-red-950/10 rounded-full flex items-center justify-center">
												<i className="ri-download-line w-5 h-5 flex items-center justify-center text-red-600 dark:text-red-300" />
											</div>
											<div>
												<p className="font-semibold text-foreground">{transaction.type}</p>
												<p className="text-sm text-muted-foreground">To: {transaction.recipient}</p>
											</div>
										</div>
										<span
											className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
												transaction.status === 'Completed'
													? 'bg-gradient-to-r from-green-200/80 to-green-100/60 text-green-800 dark:from-green-900/40 dark:to-green-950/10 dark:text-green-200'
													: 'bg-gradient-to-r from-yellow-200/80 to-yellow-100/60 text-yellow-800 dark:from-yellow-900/40 dark:to-yellow-950/10 dark:text-yellow-200'
											}`}
										>
											{transaction.status}
										</span>
									</div>
									<div className="flex justify-between items-center">
										<div>
											<p className="text-sm text-foreground">{transaction.date}</p>
											<p className="text-xs text-muted-foreground">{transaction.time}</p>
										</div>
										<p className="font-bold text-foreground">{transaction.amount}</p>
									</div>
								</div>
							))}
						</div>

						{/* Empty State */}
						{transactions.length === 0 && !isLoading && (
							<div className="bg-gradient-to-br from-white/60 to-blue-100/20 dark:from-blue-900/20 dark:to-blue-950/5 rounded-xl border border-border/40 p-8 text-center">
								<i className="ri-file-list-line w-12 h-12 flex items-center justify-center mx-auto mb-4 text-gray-400"></i>
								<h3 className="text-lg font-semibold text-foreground mb-2">No GH History</h3>
								<p className="text-muted-foreground mb-4">You haven't provided any help yet.</p>
								<CustomLink href="/user/provide-help">
									<Button className="bg-gradient-to-r from-green-600 to-green-400 hover:from-green-700 hover:to-green-500 text-white px-8 py-3 text-base font-semibold rounded-xl shadow-lg">
										<i className="ri-hand-heart-line w-5 h-5 flex items-center justify-center mr-2" />
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
