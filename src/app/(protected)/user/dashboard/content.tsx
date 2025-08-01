'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CreditCard } from '@/components/CreditCard';
import { TransactionList } from '@/components/TransactionList';
import { DashboardSkeleton } from '@/components/LoadingSkeleton';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/userUtils';

interface CreditCardType {
	title: string;
	amount: number;
	subtitle: string;
}

interface Transaction {
	id: string;
	type: 'debit' | 'credit';
	title: string;
	username?: string;
	from?: string;
	amount: number;
	date: string;
	time: string;
}

export default function DashboardPage() {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(true);
	const [data, setData] = useState<{
		creditCards: CreditCardType[];
		transactions: Transaction[];
		userName: string;
	} | null>(null);
	const currentUser = getCurrentUser();

	useEffect(() => {
		const fetchData = async () => {
			try {
				const res = await fetch('/api/users/stats');
				const json = await res.json();
				if (!json.success) throw new Error('Failed to fetch user stats');
				const stats = json.data || {};
				// Credit cards
				const creditCards: CreditCardType[] = [
					{
						title: 'Available amount',
						amount: stats.sumPhActive || 0,
						subtitle: 'This is the total amount of money you have available for withdrawal',
					},
					{
						title: 'Total Provide Help',
						amount: stats.sumPhRequests || 0,
						subtitle: 'This is the total amount of money you have donated to provide help',
					},
					{
						title: 'Total Get Help',
						amount: stats.sumGhRequests || 0,
						subtitle: 'This is the total amount of money you have received from getting help',
					},
				];

				// Transactions
				const userId = currentUser?.id;
				const matchArr = Array.isArray(stats.match) ? stats.match : [];
				const transactions: Transaction[] = matchArr.map((m: any) => {
					let type: 'debit' | 'credit' = 'debit';
					let title = '';
					let username = '';
					let from = '';
					if (userId && m.user === userId) {
						type = 'debit';
						title = 'Assigned request to provide Help';
						username = m.ghUserInfo?.name || m.ghUserInfo?.username || '';
					} else if (userId && m.gh_user === userId) {
						type = 'credit';
						title = 'Got help';
						from = m.userInfo?.name || m.userInfo?.username || '';
					}
					// Fallbacks
					const amount = Number(m.amount) || 0;
					const dateObj = m.created_at ? new Date(m.created_at) : new Date();
					const date = dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
					const time = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
					return {
						id: m.id || Math.random().toString(36).slice(2),
						type,
						title,
						username,
						from,
						amount,
						date,
						time,
					};
				});

				setData({
					creditCards,
					transactions,
					userName: currentUser?.name || 'User',
				});
			} catch (error) {
				console.error('Error fetching dashboard data:', error);
				setData(null);
			} finally {
				setIsLoading(false);
			}
		};

		fetchData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	if (isLoading) {
		return <DashboardSkeleton />;
	}

	if (!data) {
		return (
			<div className="p-4 lg:p-8  min-h-screen flex items-center justify-center">
				<div className="text-center">
					<i className="ri-error-warning-line w-12 h-12 flex items-center justify-center mx-auto mb-4 text-red-600 dark:text-red-400"></i>
					<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Failed to load dashboard</h3>
					<p className="text-gray-600 dark:text-gray-400">Please try refreshing the page</p>
				</div>
			</div>
		);
	}

	return (
		<div className="p-4 lg:p-8  min-h-screen">
			<div className="max-w-6xl mx-auto">
				<div className="space-y-6 lg:space-y-8">
					{/* Welcome message */}
					<div className="flex items-center justify-between">
						<h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back, {data.userName}</h1>
					</div>

					{/* Credit cards - single column on mobile */}
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
						{data.creditCards.map((card, index) => (
							<CreditCard key={index} card={card} variant={index === 0 ? 'primary' : 'default'} />
						))}
					</div>

					{/* Action buttons */}
					<div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
						<Button variant="outline-yellow" className="whitespace-nowrap flex-1 sm:flex-none bg-yellow-500 hover:bg-yellow-600 text-white" onClick={() => router.push('/user/provide-help')}>
							Provide Help
						</Button>
						<Button variant="solid-dark" className="whitespace-nowrap flex-1 sm:flex-none bg-gray-900 hover:bg-gray-800 text-white dark:bg-gray-100 dark:hover:bg-gray-200 dark:text-gray-900" onClick={() => router.push('/user/get-help')}>
							Get Help
						</Button>
					</div>

					{/* Recent transactions */}
					<div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 lg:p-6">
						<TransactionList transactions={data.transactions} />
					</div>
				</div>
			</div>
		</div>
	);
}
