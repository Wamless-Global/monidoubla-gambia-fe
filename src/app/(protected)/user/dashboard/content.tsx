'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CreditCard } from '@/components/CreditCard';
import { TransactionList } from '@/components/TransactionList';
import { DashboardSkeleton } from '@/components/LoadingSkeleton';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/userUtils';
import { CustomLink } from '@/components/CustomLink';
import { logger } from '@/lib/logger';
import ProvideHelpPage from '../provide-help/content';

interface CreditCardType {
	title: string;
	amount: number;
	subtitle: string;
}

export interface Transaction {
	id: string;
	type: 'debit' | 'credit';
	title: string;
	username?: string;
	from?: string;
	gh_request?: string;
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
					let gh_request = '';

					logger.info('Processing match:', m);
					if (userId && m.user === userId) {
						type = 'debit';
						title = 'You have been matched to provide Help';
						username = m.ghUserInfo?.name || m.ghUserInfo?.username || '';
					} else if (userId && m.gh_user === userId) {
						type = 'credit';
						title = 'You have been matched to get Help';
						from = m.userInfo?.name || m.userInfo?.username || '';
						gh_request = m.gh_request || '';
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
						gh_request,
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
			<div className="p-4 lg:p-8 min-h-screen flex items-center justify-center">
				<div className="text-center">
					<i className="ri-error-warning-line w-12 h-12 flex items-center justify-center mx-auto mb-4 text-red-600 dark:text-red-400"></i>
					<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Failed to load dashboard</h3>
					<p className="text-gray-600 dark:text-gray-400">Please try refreshing the page</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen p-0 lg:p-0 bg-gradient-to-br from-[#23272f]/90 via-[#1a2236]/80 to-[#10131a]/90 relative">
			{/* Hero Welcome Banner */}
			<div className="relative w-full max-w-6xl mx-auto px-4 pt-10 pb-8 lg:pt-16 lg:pb-12">
				<div className="rounded-2xl bg-gradient-to-br from-[#23272f]/90 via-[#1a2236]/80 to-[#10131a]/90 shadow-xl border border-white/10 px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-6 backdrop-blur-md">
					<div>
						<h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight mb-2 font-sans">
							Welcome back, <span className="text-gold-400">{data.userName}</span>
						</h1>
						<p className="text-base lg:text-lg text-slate-300 font-medium max-w-xl">Your financial overview and recent activity are below. Take action or review your timeline at a glance.</p>
					</div>
					<div className="flex gap-3 items-center">
						<CustomLink href={'/user/provide-help'}>
							<Button variant="outline-yellow" className="rounded-lg px-6 py-3 font-semibold text-gold-400 border-gold-400 bg-white/5 hover:bg-gold-400/10 transition-all shadow-none">
								<i className="ri-hand-heart-line mr-2 text-lg"></i> Provide Help
							</Button>
						</CustomLink>
						<CustomLink href={'/user/get-help'}>
							<Button variant="solid-dark" className="rounded-lg px-6 py-3 font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-all shadow-none">
								<i className="ri-hand-coin-line mr-2 text-lg"></i> Get Help
							</Button>
						</CustomLink>
					</div>
				</div>
				{/* Minimal floating elements for depth */}
				<div className="absolute left-0 top-0 w-32 h-32 bg-gradient-to-br from-gold-400/10 to-slate-400/10 rounded-full blur-2xl -z-10" />
				<div className="absolute right-0 bottom-0 w-24 h-24 bg-gradient-to-tr from-slate-400/10 to-gold-400/10 rounded-full blur-2xl -z-10" />
			</div>

			{/* Financial Cards */}
			<div className="max-w-6xl mx-auto px-4 mt-2 grid grid-cols-1 md:grid-cols-3 gap-6">
				{data.creditCards.map((card, index) => (
					<CreditCard key={index} card={card} variant={index === 0 ? 'primary' : 'default'} />
				))}
			</div>

			{/* Quick Action Grid (optional, can add more actions here) */}
			{/* <div className="max-w-6xl mx-auto px-4 mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
				...action buttons here...
			</div> */}

			{/* Timeline & Transactions */}
			<div className="max-w-6xl mx-auto px-4 mt-10">
				<div className="rounded-2xl bg-white/90 dark:bg-[#181c24]/90 border border-white/10 shadow-lg p-0 overflow-hidden">
					<TransactionList transactions={data.transactions} />
				</div>
			</div>

			{/* Provide Help Section (hidden header) */}
			<div className="max-w-6xl mx-auto px-4 mt-10">
				<ProvideHelpPage hideHeader={true} />
			</div>
		</div>
	);
}
