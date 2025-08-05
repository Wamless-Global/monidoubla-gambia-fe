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
import { useRef } from 'react';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { handleFetchMessage } from '@/lib/helpers';
import { toast } from 'sonner';

// Custom modal for testimonials, styled like ConfirmationModal
function TestimonialModal({ isOpen, onClose, userName, date, content, videoUrl, avatarUrl }: { isOpen: boolean; onClose: () => void; userName: string; date: string; content: string; videoUrl?: string; avatarUrl?: string | null }) {
	if (!isOpen) return null;
	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 !m-0">
			<div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
				<div className="p-6">
					<div className="flex items-center gap-3 mb-2">
						{avatarUrl ? (
							<img src={avatarUrl} alt={userName} className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-700" />
						) : (
							<span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-semibold text-lg">{(userName || '').charAt(0).toUpperCase()}</span>
						)}
						<div>
							<h3 className="text-lg font-semibold text-gray-900 dark:text-white">{userName}</h3>
							<div className="text-xs text-gray-500 dark:text-gray-400">{date}</div>
						</div>
					</div>
					<div className="max-h-80 overflow-y-auto text-gray-800 dark:text-gray-100">
						<div className="whitespace-pre-line break-words mb-3" style={{ wordBreak: 'break-word' }}>
							{content}
						</div>
						{videoUrl && (
							<video controls className="w-full max-w-md mb-2 rounded mx-auto">
								<source src={videoUrl} type="video/mp4" />
								Your browser does not support the video tag.
							</video>
						)}
					</div>
					<div className="flex justify-end mt-4">
						<button onClick={onClose} className="whitespace-nowrap min-w-[100px] bg-blue-600 hover:bg-blue-700 text-white rounded px-4 py-2 font-medium">
							Close
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

// Testimonial tab component
function TestimonialScroller() {
	const [testimonies, setTestimonies] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [selected, setSelected] = useState<number | null>(null);
	const [modalOpen, setModalOpen] = useState(false);
	const scrollerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const fetchTestimonials = async () => {
			setLoading(true);
			try {
				const res = await fetchWithAuth('/api/testimonies/all');
				const json = await res.json();
				if (!res.ok) {
					const error = handleFetchMessage(json.message, 'Failed to fetch');
					toast.error(error);
				}
				setTestimonies(json.data || []);
			} catch {
				setTestimonies([]);
			} finally {
				setLoading(false);
			}
		};
		fetchTestimonials();
	}, []);

	if (loading) return <div className="mb-4">Loading testimonials...</div>;
	if (!testimonies.length) return null;

	// Marquee effect for testimonials (scrolls full width of parent, no duplication)
	return (
		<div className="mb-6">
			<h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">What Our Users Are Saying</h2>
			<p className="text-gray-600 dark:text-gray-300 mb-3 text-sm">Read real stories and feedback from members of our community.</p>
			<div className="relative w-full overflow-x-hidden" style={{ height: 60 }}>
				<div
					className="flex items-center gap-8 whitespace-nowrap cursor-pointer"
					style={{
						animation: 'marquee-fullwidth 30s linear infinite',
					}}
					onClick={() => {
						setSelected(0);
						setModalOpen(true);
					}}
				>
					{testimonies.map((t, idx) => (
						<span
							key={t.id}
							className="inline-flex items-center gap-2 px-4 py-2 rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow text-gray-900 dark:text-white max-w-xs overflow-hidden text-ellipsis"
							title={t.content}
							onClick={(e) => {
								e.stopPropagation();
								setSelected(idx);
								setModalOpen(true);
							}}
							style={{ minWidth: 180, maxWidth: 320 }}
						>
							{t.avatar_url ? (
								<img src={t.avatar_url} alt={t.user_name || 'Anonymous'} className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-700" />
							) : (
								<span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-semibold text-sm">{(t.user_name || t.user || 'A').charAt(0).toUpperCase()}</span>
							)}
							<span className="font-semibold mr-2">{t.user_name || 'Anonymous'}:</span>
							<span className="text-sm">{t.content.length > 60 ? t.content.slice(0, 60) + '...' : t.content}</span>
						</span>
					))}
				</div>
			</div>
			{/* Modal for full testimonial */}
			{modalOpen && selected !== null && testimonies[selected] && (
				<TestimonialModal
					isOpen={modalOpen}
					onClose={() => setModalOpen(false)}
					userName={testimonies[selected].user_name || 'Anonymous'}
					date={new Date(testimonies[selected].created_at).toLocaleString()}
					content={testimonies[selected].content}
					videoUrl={testimonies[selected].video_url}
					avatarUrl={testimonies[selected].avatar_url}
				/>
			)}
			<style>{`
		@keyframes marquee-fullwidth {
		  0% { transform: translateX(100%); }
		  100% { transform: translateX(-100%); }
		}
	  `}</style>
		</div>
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
						<CustomLink href={'/user/provide-help'}>
							<Button variant="outline-yellow" className="whitespace-nowrap flex-1 sm:flex-none bg-yellow-500 hover:bg-yellow-600 text-white">
								Provide Help
							</Button>
						</CustomLink>

						<CustomLink href={'/user/get-help'}>
							<Button variant="solid-dark" className="whitespace-nowrap flex-1 sm:flex-none bg-gray-900 hover:bg-gray-800 text-white dark:bg-gray-100 dark:hover:bg-gray-200 dark:text-gray-900">
								Get Help
							</Button>
						</CustomLink>
					</div>

					<TestimonialScroller />
					<ProvideHelpPage hideHeader={true} />

					{/* Recent transactions */}
					<div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 lg:p-6">
						<TransactionList transactions={data.transactions} />
					</div>
				</div>
			</div>
		</div>
	);
}
