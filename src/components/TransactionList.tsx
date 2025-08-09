'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getCurrencyFromLocalStorage } from '@/lib/helpers';
import { cn } from '@/lib/utils';

// NOTE: All original interfaces and logic are preserved.
interface Transaction {
	id: string;
	type: 'credit' | 'debit';
	title: string;
	username?: string;
	from?: string;
	amount: number;
	date: string;
	time: string;
}

interface TransactionListProps {
	transactions: Transaction[];
}

export function TransactionList({ transactions }: TransactionListProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Recent Transactions</CardTitle>
				<CardDescription>A log of your recent account activity.</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="flow-root">
					{transactions.length > 0 ? (
						<ul className="-my-4 divide-y divide-gray-200">
							{transactions.map((transaction) => (
								<li key={transaction.id} className="flex items-center justify-between gap-4 py-4">
									<div className="flex items-center gap-4 min-w-0">
										<div className={cn('w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center', transaction.type === 'credit' ? 'bg-green-100' : 'bg-red-100')}>
											<i className={cn('text-xl', transaction.type === 'credit' ? 'ri-arrow-down-line text-green-600' : 'ri-arrow-up-line text-red-600')}></i>
										</div>
										<div className="min-w-0">
											<p className="text-sm font-medium text-gray-800 truncate">{transaction.title}</p>
											<p className="text-xs text-gray-500">
												{transaction.date} at {transaction.time}
											</p>
										</div>
									</div>
									<p className={cn('text-sm font-semibold flex-shrink-0', transaction.type === 'credit' ? 'text-green-600' : 'text-gray-800')}>
										{transaction.type === 'credit' ? '+' : '-'}
										{transaction.amount.toLocaleString('en-US')} {getCurrencyFromLocalStorage()?.code}
									</p>
								</li>
							))}
						</ul>
					) : (
						<div className="text-center py-12">
							<div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
								<i className="ri-file-list-3-line text-3xl text-gray-400"></i>
							</div>
							<p className="font-medium text-gray-700">No transactions yet</p>
							<p className="text-sm text-gray-500">Your recent activity will appear here.</p>
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
