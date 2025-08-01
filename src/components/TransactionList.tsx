'use client';

import { Badge } from '@/components/ui/badge';
import { getCurrencyFromLocalStorage } from '@/lib/helpers';

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
		<div className="space-y-4">
			<h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent transactions</h2>
			<div className="space-y-3">
				{transactions.length > 0
					? transactions.map((transaction) => (
							<div key={transaction.id} className="flex items-start justify-between p-3 lg:p-4 bg-white rounded-lg border">
								<div className="flex items-start gap-3 lg:gap-4 flex-1">
									<div className="flex items-center gap-2 mt-1">
										<i className={`${transaction.type === 'credit' ? 'ri-arrow-down-line text-green-500' : 'ri-arrow-up-line text-red-500'} w-4 h-4 lg:w-5 lg:h-5 flex items-center justify-center`}></i>
									</div>
									<div className="flex-1 min-w-0">
										<h3 className="font-medium text-gray-900 text-sm lg:text-base">{transaction.title}</h3>
										<div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs lg:text-sm text-gray-500 mt-1">
											{transaction.username && <span>Username: {transaction.username}</span>}
											{transaction.from && <span>From: {transaction.from}</span>}
											<span className="hidden sm:inline">•</span>
											<span>
												{transaction.date} - {transaction.time}
											</span>
										</div>
									</div>
								</div>
								<div className="ml-2 flex-shrink-0">
									<Badge variant={transaction.type === 'credit' ? 'success' : 'error'} className="text-xs lg:text-sm">
										{transaction.type === 'credit' ? '+' : '-'}
										{transaction.amount.toLocaleString('en-US')} {getCurrencyFromLocalStorage()?.code}
									</Badge>
								</div>
							</div>
					  ))
					: 'No record found'}
			</div>
		</div>
	);
}
