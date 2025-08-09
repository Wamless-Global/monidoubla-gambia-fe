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
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { handleFetchMessage } from '@/lib/helpers';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';

// NOTE: All original interfaces and logic are preserved.
function TestimonialModal({ isOpen, onClose, userName, date, content, videoUrl, avatarUrl }: { isOpen: boolean; onClose: () => void; userName: string; date: string; content: string; videoUrl?: string; avatarUrl?: string | null }) {
	if (!isOpen) return null;
	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-in fade-in-0 !m-0">
			<Card className="max-w-md w-full bg-white shadow-lg border-gray-200">
				<CardHeader className="flex-row items-center gap-4">
					{avatarUrl ? <img src={avatarUrl} alt={userName} className="w-10 h-10 rounded-full object-cover" /> : <span className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500">{(userName || '').charAt(0).toUpperCase()}</span>}
					<div>
						<CardTitle>{userName}</CardTitle>
						<CardDescription>{date}</CardDescription>
					</div>
				</CardHeader>
				<CardContent>
					<div className="max-h-80 overflow-y-auto pr-2">
						<p className="whitespace-pre-line break-words text-gray-700">{content}</p>
						{videoUrl && (
							<video controls className="w-full rounded-lg mt-4">
								<source src={videoUrl} type="video/mp4" />
							</video>
						)}
					</div>
				</CardContent>
				<CardFooter className="justify-end">
					<Button onClick={onClose}>Close</Button>
				</CardFooter>
			</Card>
		</div>
	);
}

// Redesigned to be a vertically scrolling list
function TestimonialScroller() {
	const [testimonies, setTestimonies] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [selected, setSelected] = useState<number | null>(null);

	useEffect(() => {
		const fetchTestimonials = async () => {
			setLoading(true);
			try {
				const res = await fetchWithAuth('/api/testimonies/all');
				const json = await res.json();
				if (!res.ok) throw new Error(handleFetchMessage(json.message, 'Failed to fetch testimonials'));
				setTestimonies(json.data || []);
			} catch {
				setTestimonies([]);
			} finally {
				setLoading(false);
			}
		};
		fetchTestimonials();
	}, []);

	if (loading || !testimonies.length) return null;

	return (
		<>
			<Card className="flex flex-col h-[24rem]">
				<CardHeader>
					<CardTitle>Community Voice</CardTitle>
					<CardDescription>Recent stories from our members.</CardDescription>
				</CardHeader>
				<CardContent className="flex-grow overflow-y-auto pr-3 space-y-4">
					{testimonies.map((testimony, index) => (
						<div key={testimony.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer" onClick={() => setSelected(index)}>
							{testimony.avatar_url ? (
								<img src={testimony.avatar_url} alt={testimony.user_name} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
							) : (
								<span className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500 flex-shrink-0">{(testimony.user_name || 'A').charAt(0).toUpperCase()}</span>
							)}
							<div className="min-w-0">
								<p className="font-semibold text-sm text-gray-800 truncate">{testimony.user_name || 'Anonymous'}</p>
								<p className="text-xs text-gray-600 line-clamp-2">{testimony.content}</p>
							</div>
						</div>
					))}
				</CardContent>
			</Card>
			{selected !== null && (
				<TestimonialModal
					isOpen={selected !== null}
					onClose={() => setSelected(null)}
					userName={testimonies[selected].user_name || 'Anonymous'}
					date={new Date(testimonies[selected].created_at).toLocaleString()}
					content={testimonies[selected].content}
					videoUrl={testimonies[selected].video_url}
					avatarUrl={testimonies[selected].avatar_url}
				/>
			)}
		</>
	);
}

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
				const res = await fetchWithAuth('/api/users/stats');
				const json = await res.json();
				if (!json.success) throw new Error('Failed to fetch user stats');
				const stats = json.data || {};
				const creditCards: CreditCardType[] = [
					{ title: 'Available Amount', amount: stats.sumPhActive || 0, subtitle: 'Total available for withdrawal.' },
					{ title: 'Total Provided Help', amount: stats.sumPhRequests || 0, subtitle: 'Total amount you have donated.' },
					{ title: 'Total Received Help', amount: stats.sumGhRequests || 0, subtitle: 'Total amount you have received.' },
				];
				const userId = currentUser?.id;
				const matchArr = Array.isArray(stats.match) ? stats.match : [];
				const transactions: Transaction[] = matchArr.map((m: any) => {
					let type: 'debit' | 'credit' = 'debit';
					let title = '';
					let username = '';
					let from = '';
					if (userId && m.user === userId) {
						type = 'debit';
						title = 'Provided Help To';
						username = m.ghUserInfo?.name || m.ghUserInfo?.username || '';
					} else if (userId && m.gh_user === userId) {
						type = 'credit';
						title = 'Received Help From';
						from = m.userInfo?.name || m.userInfo?.username || '';
					}
					const amount = Number(m.amount) || 0;
					const dateObj = m.created_at ? new Date(m.created_at) : new Date();
					const date = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
					const time = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
					return { id: m.id || Math.random().toString(36).slice(2), type, title: `${title} ${from || username}`, amount, date, time };
				});
				setData({ creditCards, transactions, userName: currentUser?.name || 'User' });
			} catch (error) {
				console.error('Error fetching dashboard data:', error);
				setData(null);
			} finally {
				setIsLoading(false);
			}
		};
		fetchData();
	}, [currentUser]);

	if (isLoading) return <DashboardSkeleton />;
	if (!data) {
		return (
			<div className="bg-gray-50 min-h-screen flex items-center justify-center p-4">
				<Card className="text-center p-8">
					<div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
						<i className="ri-error-warning-line text-3xl text-red-600"></i>
					</div>
					<h3 className="text-xl font-semibold text-gray-800">Failed to Load Dashboard</h3>
					<p className="text-gray-500">Please try refreshing the page.</p>
				</Card>
			</div>
		);
	}

	return (
		<div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8">
			<div className="max-w-7xl mx-auto">
				<header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
					<div>
						<h1 className="text-3xl font-bold text-gray-800">Welcome back, {data.userName}</h1>
						<p className="text-gray-500 mt-1">Here's a summary of your account activity.</p>
					</div>
					<div className="flex gap-3">
						<CustomLink href={'/user/provide-help'} className="flex-1">
							<Button className="w-full">Provide Help</Button>
						</CustomLink>
						<CustomLink href={'/user/get-help'} className="flex-1">
							<Button variant="outline" className="w-full">
								Get Help
							</Button>
						</CustomLink>
					</div>
				</header>
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					<div className="lg:col-span-2 space-y-8">
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
							<CreditCard card={data.creditCards[0]} icon="ri-wallet-3-line" iconBgColor="bg-teal-100 text-teal-600" />
							<CreditCard card={data.creditCards[1]} icon="ri-arrow-up-circle-line" iconBgColor="bg-blue-100 text-blue-600" />
							<CreditCard card={data.creditCards[2]} icon="ri-arrow-down-circle-line" iconBgColor="bg-green-100 text-green-600" />
						</div>
						<TransactionList transactions={data.transactions} />
					</div>
					<div className="lg:col-span-1 space-y-8">
						<Card>
							<CardHeader>
								<CardTitle>Active PH Requests</CardTitle>
								<CardDescription>Your ongoing commitments.</CardDescription>
							</CardHeader>
							<CardContent className="p-0 sm:p-0">
								<ProvideHelpPage hideHeader={true} viewMode="compact" />
							</CardContent>
							<CardFooter>
								<CustomLink href="/user/provide-help" className="w-full">
									<Button variant="outline" className="w-full">
										View All Requests
									</Button>
								</CustomLink>
							</CardFooter>
						</Card>
						<TestimonialScroller />
					</div>
				</div>
			</div>
		</div>
	);
}
