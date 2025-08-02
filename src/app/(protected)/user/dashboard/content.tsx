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
			<div className="p-4 lg:p-8 min-h-screen flex items-center justify-center">
				<div className="text-center">
					<i className="ri-error-warning-line w-12 h-12 flex items-center justify-center mx-auto mb-4 text-red-600 dark:text-red-400"></i>
					<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Failed to load dashboard</h3>
					<p className="text-gray-600 dark:text-gray-400">Please try refreshing the page</p>
				</div>
			</div>
		);
	}

	// --- Redesigned Dashboard ---
	return (
		<div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-emerald-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 py-0 px-0">
			{/* Hero Welcome Section */}
			<div className="relative max-w-6xl mx-auto px-4 pt-10 pb-0">
				<div className="rounded-3xl bg-gradient-to-tr from-indigo-500/80 via-purple-500/80 to-emerald-400/80 dark:from-indigo-900/80 dark:via-purple-900/80 dark:to-emerald-900/80 shadow-2xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 overflow-hidden mb-10">
					<div className="flex-1 flex flex-col gap-2">
						<h1 className="text-3xl md:text-4xl font-extrabold text-white drop-shadow-lg mb-2">
							Welcome back, <span className="bg-white/20 px-2 py-1 rounded-xl text-indigo-100 font-black tracking-tight">{data.userName}</span>
						</h1>
						<p className="text-lg text-indigo-100/90 font-medium mb-2">Here's a summary of your account activity and quick actions.</p>
						<div className="flex gap-3 mt-4">
							<button className="bg-gradient-to-r from-emerald-400 via-blue-500 to-indigo-500 text-white font-bold px-6 py-3 rounded-2xl shadow-lg hover:scale-105 hover:shadow-2xl transition-all text-base" onClick={() => router.push('/user/provide-help')}>
								<i className="ri-hand-heart-line mr-2 text-xl align-middle"></i> Provide Help
							</button>
							<button className="bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 text-white font-bold px-6 py-3 rounded-2xl shadow-lg hover:scale-105 hover:shadow-2xl transition-all text-base" onClick={() => router.push('/user/get-help')}>
								<i className="ri-hand-coin-line mr-2 text-xl align-middle"></i> Get Help
							</button>
						</div>
					</div>
					{/* Floating 3D Card Illustration */}
					{/* <div className="flex-1 flex justify-center items-center relative">
						<div className="w-64 h-40 bg-gradient-to-tr from-indigo-400 via-purple-400 to-emerald-300 rounded-3xl shadow-2xl transform rotate-[-8deg] scale-105 blur-[1px] absolute left-4 top-6 opacity-30" />
						<div className="w-72 h-44 bg-gradient-to-tr from-indigo-500 via-purple-500 to-emerald-400 rounded-3xl shadow-2xl flex flex-col justify-between p-6 relative z-10 border-4 border-white/20">
							<div className="flex items-center justify-between">
								<span className="text-white/80 font-bold text-lg tracking-wider">Monidoublagambia</span>
								<i className="ri-bank-card-line text-2xl text-white/70"></i>
							</div>
							<div className="text-3xl font-black text-white tracking-widest mt-4 mb-2 drop-shadow-xl">•••• 1234</div>
							<div className="flex items-center justify-between">
								<span className="text-white/70 text-xs">Virtual Card</span>
								<span className="text-white/70 text-xs">Active</span>
							</div>
						</div>
					</div> */}
				</div>
			</div>

			{/* 3D Credit Cards Section */}
			<div className="max-w-6xl mx-auto px-4">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
					{data.creditCards.map((card, index) => (
						<div key={index} className="relative group hover:scale-105 transition-transform duration-300" style={{ perspective: '1200px' }}>
							<div className="rounded-3xl shadow-2xl bg-white/90 dark:bg-gray-900/90 border-2 border-indigo-100 dark:border-indigo-900 p-6 min-h-[160px] flex flex-col justify-between transform group-hover:rotate-y-3 group-hover:scale-105 transition-all duration-300">
								<CreditCard card={card} variant={index === 0 ? 'primary' : 'default'} />
							</div>
							<div className="absolute -inset-2 rounded-3xl bg-gradient-to-tr from-indigo-400/20 via-purple-400/20 to-emerald-300/20 blur-lg opacity-0 group-hover:opacity-100 transition-all duration-300 z-[-1]" />
						</div>
					))}
				</div>
			</div>

			{/* Quick Action Grid */}
			<div className="max-w-6xl mx-auto px-4 mb-10">
				<div className="grid grid-cols-2 md:grid-cols-4 gap-6">
					<button className="flex flex-col items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-emerald-400 text-white rounded-2xl shadow-lg py-6 hover:scale-105 hover:shadow-2xl transition-all">
						<i className="ri-bank-line text-3xl mb-2"></i>
						<span className="font-bold text-base">Add Bank</span>
					</button>
					<button className="flex flex-col items-center justify-center bg-gradient-to-br from-emerald-400 via-blue-400 to-indigo-400 text-white rounded-2xl shadow-lg py-6 hover:scale-105 hover:shadow-2xl transition-all">
						<i className="ri-user-line text-3xl mb-2"></i>
						<span className="font-bold text-base">Profile</span>
					</button>
					<button className="flex flex-col items-center justify-center bg-gradient-to-br from-purple-500 via-pink-500 to-yellow-400 text-white rounded-2xl shadow-lg py-6 hover:scale-105 hover:shadow-2xl transition-all">
						<i className="ri-store-line text-3xl mb-2"></i>
						<span className="font-bold text-base">Marketplace</span>
					</button>
					<button className="flex flex-col items-center justify-center bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-400 text-white rounded-2xl shadow-lg py-6 hover:scale-105 hover:shadow-2xl transition-all">
						<i className="ri-lock-line text-3xl mb-2"></i>
						<span className="font-bold text-base">Change Password</span>
					</button>
				</div>
			</div>

			{/* Transaction Timeline */}
			<div className="max-w-6xl mx-auto px-4 mb-16">
				<div className="bg-white/90 dark:bg-gray-900/90 rounded-3xl shadow-2xl border border-indigo-100 dark:border-indigo-900 p-8 max-h-[420px] overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-400/60 scrollbar-track-indigo-100/20 dark:scrollbar-thumb-indigo-700/60 dark:scrollbar-track-indigo-900/20 scrollbar-rounded-xl">
					<TransactionList transactions={data.transactions} />
				</div>
			</div>

			{/* Visual Depth Floating Elements */}
			<div className="fixed left-0 top-0 w-96 h-96 bg-gradient-to-br from-indigo-400/20 to-purple-400/10 rounded-full blur-3xl z-0 pointer-events-none" />
			<div className="fixed right-0 bottom-0 w-80 h-80 bg-gradient-to-tr from-emerald-400/20 to-blue-400/10 rounded-full blur-2xl z-0 pointer-events-none" />
		</div>
	);
}
