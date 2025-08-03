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
		return (
			<div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background to-green-50 dark:to-green-950/40">
				<div className="w-full max-w-6xl px-4 lg:px-0">
					<div className="animate-pulse space-y-8">
						<div className="h-8 w-48 rounded-lg bg-gradient-to-r from-green-200/60 to-green-100/30 mb-6" />
						<div className="rounded-xl bg-gradient-to-br from-white/60 to-green-100/30 dark:from-green-900/30 dark:to-green-950/10 shadow-lg p-6">
							<div className="h-6 w-48 rounded bg-green-100/60 dark:bg-green-900/20 mb-6" />
							<div className="overflow-x-auto">
								<table className="w-full">
									<thead>
										<tr>
											{[...Array(4)].map((_, i) => (
												<th key={i} className="px-6 py-3">
													<div className="h-4 w-20 rounded bg-green-100/60 dark:bg-green-900/20" />
												</th>
											))}
										</tr>
									</thead>
									<tbody>
										{[...Array(5)].map((_, i) => (
											<tr key={i}>
												{[...Array(4)].map((_, j) => (
													<td key={j} className="px-6 py-4">
														<div className="h-4 w-16 rounded bg-green-100/60 dark:bg-green-900/20" />
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
		<div className="min-h-screen bg-gradient-to-br from-background to-green-50 dark:to-green-950/40 py-8 px-2 lg:px-0">
			<div className="max-w-6xl mx-auto w-full">
				<Card className="bg-gradient-to-br from-white/80 to-green-50/40 dark:from-green-900/30 dark:to-green-950/10 border-0 shadow-lg rounded-xl p-4 lg:p-8">
					<CardContent className="p-0">
						<h2 className="text-2xl font-extrabold text-foreground mb-8 tracking-tight">PH History</h2>

						{/* Action Buttons */}
						<div className="flex flex-col sm:flex-row gap-4 mb-8">
							<CustomLink href="/user/provide-help">
								<Button className="bg-gradient-to-r from-green-600 to-green-400 hover:from-green-700 hover:to-green-500 text-white px-8 py-3 text-base font-semibold rounded-xl shadow-lg">
									<i className="ri-hand-heart-line w-5 h-5 flex items-center justify-center mr-2" />
									Provide Help
								</Button>
							</CustomLink>
							<CustomLink href="/user/get-help">
								<Button className="bg-gradient-to-r from-yellow-500 to-yellow-300 hover:from-yellow-600 hover:to-yellow-400 text-white px-8 py-3 text-base font-semibold rounded-xl shadow-lg">
									<i className="ri-question-line w-5 h-5 flex items-center justify-center mr-2" />
									Get Help
								</Button>
							</CustomLink>
						</div>

						{/* Recent Transactions */}
						<div className="mb-6">
							<h3 className="text-lg font-semibold text-foreground mb-4">Recent transactions</h3>
						</div>

						{/* Desktop Table View */}
						<div className="hidden lg:block overflow-x-auto bg-gradient-to-br from-white/60 to-green-100/20 dark:from-green-900/20 dark:to-green-950/5 rounded-xl border border-border/40">
							<table className="w-full">
								<thead className="bg-gradient-to-r from-green-50/60 to-white/10 dark:from-green-900/10 dark:to-green-950/5">
									<tr>
										<th className="text-left py-3 px-4 font-semibold text-muted-foreground">Transaction</th>
										<th className="text-left py-3 px-4 font-semibold text-muted-foreground">Date & Time</th>
										<th className="text-right py-3 px-4 font-semibold text-muted-foreground">Amount</th>
										<th className="text-center py-3 px-4 font-semibold text-muted-foreground">Status</th>
									</tr>
								</thead>
								<tbody>
									{transactions.map((transaction) => (
										<tr key={transaction.id} className="border-b border-border/40 hover:bg-gradient-to-r hover:from-green-100/40 hover:to-white/10 dark:hover:from-green-900/10 dark:hover:to-green-950/5 transition-all">
											<td className="py-4 px-4">
												<div className="flex items-center gap-3">
													<div className="w-10 h-10 bg-gradient-to-br from-green-200/80 to-green-100/60 dark:from-green-900/40 dark:to-green-950/10 rounded-full flex items-center justify-center">
														<i className="ri-arrow-up-line w-5 h-5 flex items-center justify-center text-green-600 dark:text-green-300" />
													</div>
													<div>
														<p className="font-semibold text-foreground">{transaction.type}</p>
														<p className="text-sm text-muted-foreground">Username: {transaction.username}</p>
													</div>
												</div>
											</td>
											<td className="py-4 px-4">
												<p className="text-foreground">{transaction.date}</p>
												<p className="text-sm text-muted-foreground">{transaction.time}</p>
											</td>
											<td className="py-4 px-4 text-right">
												<p className="font-bold text-red-600 dark:text-red-300">{transaction.amount}</p>
											</td>
											<td className="py-4 px-4 text-center">
												<span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold shadow-sm bg-gradient-to-r from-yellow-200/80 to-yellow-100/60 text-yellow-800 dark:from-yellow-900/40 dark:to-yellow-950/10 dark:text-yellow-200">
													{transaction.status}
												</span>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>

						{/* Mobile Card View */}
						<div className="lg:hidden space-y-4">
							{transactions.map((transaction) => (
								<div key={transaction.id} className="bg-gradient-to-br from-white/60 to-green-100/20 dark:from-green-900/20 dark:to-green-950/5 rounded-xl border border-border/40 p-4">
									<div className="flex items-start justify-between mb-3">
										<div className="flex items-center gap-3">
											<div className="w-10 h-10 bg-gradient-to-br from-green-200/80 to-green-100/60 dark:from-green-900/40 dark:to-green-950/10 rounded-full flex items-center justify-center">
												<i className="ri-arrow-up-line w-5 h-5 flex items-center justify-center text-green-600 dark:text-green-300" />
											</div>
											<div>
												<p className="font-semibold text-foreground text-sm">{transaction.type}</p>
												<p className="text-xs text-muted-foreground">Username: {transaction.username}</p>
											</div>
										</div>
										<span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold shadow-sm bg-gradient-to-r from-yellow-200/80 to-yellow-100/60 text-yellow-800 dark:from-yellow-900/40 dark:to-yellow-950/10 dark:text-yellow-200">{transaction.status}</span>
									</div>
									<div className="flex justify-between items-center">
										<div>
											<p className="text-sm text-foreground">{transaction.date}</p>
											<p className="text-xs text-muted-foreground">{transaction.time}</p>
										</div>
										<p className="font-bold text-red-600 dark:text-red-300">{transaction.amount}</p>
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
