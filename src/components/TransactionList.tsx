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
			<h2 className="text-lg font-bold text-indigo-900 dark:text-white">Recent Transactions</h2>
			<div className="space-y-3">
				{transactions.length > 0 ? (
					transactions.map((transaction) => (
						<div
							key={transaction.id}
							className={`flex items-center justify-between p-4 rounded-xl border-0 shadow bg-gradient-to-br ${
								transaction.type === 'credit' ? 'from-[#059669]/90 to-[#10B981]/90 dark:from-[#1b2e23] dark:to-[#14532d]' : 'from-[#F59E42]/90 to-[#FBBF24]/90 dark:from-[#a16207] dark:to-[#fde68a]'
							} group hover:scale-[1.015] hover:shadow-xl transition`}
						>
							<div className="flex items-center gap-4 flex-1 min-w-0">
								<div className="flex items-center gap-2">
									<i className={`${transaction.type === 'credit' ? 'ri-arrow-down-line text-emerald-100 bg-emerald-600' : 'ri-arrow-up-line text-yellow-100 bg-yellow-600'} w-8 h-8 flex items-center justify-center rounded-full p-2 shadow`}></i>
								</div>
								<div className="flex-1 min-w-0">
									<h3 className="font-semibold text-white text-base truncate">{transaction.title}</h3>
									<div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs lg:text-sm text-indigo-100/90 mt-1">
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
								<Badge
									variant={transaction.type === 'credit' ? 'success' : 'error'}
									className={`text-xs lg:text-sm px-3 py-2 rounded-full font-bold ${transaction.type === 'credit' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200'}`}
								>
									{transaction.type === 'credit' ? '+' : '-'}
									{transaction.amount.toLocaleString('en-US')} {getCurrencyFromLocalStorage()?.code}
								</Badge>
							</div>
						</div>
					))
				) : (
					<div className="text-center text-indigo-700 dark:text-indigo-200 py-8">No record found</div>
				)}
			</div>
		</div>
	);
}
