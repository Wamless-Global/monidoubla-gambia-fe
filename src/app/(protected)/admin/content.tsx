'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CustomLink } from '@/components/CustomLink';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { logger } from '@/lib/logger';
import { getCurrencyFromLocalStorage, getSettings } from '@/lib/helpers';
import { cn } from '@/lib/utils';

// NOTE: All original interfaces and logic are preserved.
export default function AdminDashboard() {
	const [stats, setStats] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		(async () => {
			try {
				const response = await fetchWithAuth(`/api/admin/stats`);
				const result = await response.json();
				if (!response.ok || !result.success) {
					setError('Failed to fetch admin dashboard stats');
					logger.error('Failed to fetch admin dashboard stats:', result);
				} else {
					setStats(result.data);
				}
			} catch (err) {
				setError('Failed to fetch admin dashboard stats');
				logger.error('Failed to fetch admin dashboard stats:', err);
			} finally {
				setLoading(false);
			}
		})();
	}, []);

	const formatStat = (value: any) => (loading ? '...' : error ? 'Error' : value?.toLocaleString() ?? '0');
	const formatPercentage = (value: any) => (loading ? '...' : error ? 'Error' : `${value ?? 0}%`);
	const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: getSettings()?.baseCurrency || getCurrencyFromLocalStorage()?.code || 'USD' }).format(amount);

	const statCards = [
		{ title: 'Total Users', value: formatStat(stats?.totalUsers), change: stats?.percentIncrease?.users, icon: 'ri-user-line', color: 'bg-indigo-100 text-indigo-600' },
		{ title: 'Pending PH Value', value: formatCurrency(stats?.totalPendingPhRequests ?? 0), change: stats?.percentIncrease?.phRequests, icon: 'ri-arrow-up-circle-line', color: 'bg-emerald-100 text-emerald-600' },
		{ title: 'Pending GH Value', value: formatCurrency(stats?.totalPendingGhRequests ?? 0), change: stats?.percentIncrease?.ghRequests, icon: 'ri-arrow-down-circle-line', color: 'bg-amber-100 text-amber-600' },
		{ title: 'Total Matches', value: formatStat(stats?.totalMatches), change: stats?.percentIncrease?.matches, icon: 'ri-exchange-line', color: 'bg-sky-100 text-sky-600' },
	];

	if (loading) {
		// Redesigned Skeleton Loader
		return (
			<div className="space-y-6 animate-pulse">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
					{[...Array(4)].map((_, i) => (
						<div key={i} className="bg-white rounded-lg shadow-sm p-6">
							<div className="flex justify-between items-start">
								<div className="space-y-2">
									<div className="h-4 bg-slate-200 rounded w-24"></div>
									<div className="h-8 bg-slate-200 rounded w-16"></div>
								</div>
								<div className="w-10 h-10 bg-slate-200 rounded-full"></div>
							</div>
							<div className="h-3 bg-slate-200 rounded w-32 mt-4"></div>
						</div>
					))}
				</div>
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					<div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
						<div className="h-5 bg-slate-200 rounded w-40 mb-6"></div>
						<div className="h-64 bg-slate-200 rounded-md"></div>
					</div>
					<div className="lg:col-span-1 space-y-6">
						<div className="bg-white rounded-lg shadow-sm p-6">
							<div className="h-5 bg-slate-200 rounded w-32 mb-4"></div>
							<div className="space-y-4">
								<div className="h-4 bg-slate-200 rounded w-full"></div>
								<div className="h-4 bg-slate-200 rounded w-full"></div>
								<div className="h-4 bg-slate-200 rounded w-4/5"></div>
							</div>
						</div>
						<div className="bg-white rounded-lg shadow-sm p-6">
							<div className="h-5 bg-slate-200 rounded w-32 mb-4"></div>
							<div className="space-y-4">
								<div className="h-4 bg-slate-200 rounded w-full"></div>
								<div className="h-4 bg-slate-200 rounded w-full"></div>
								<div className="h-4 bg-slate-200 rounded w-3/4"></div>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex flex-col items-center justify-center h-[calc(100vh-150px)]">
				<Card className="max-w-md w-full text-center p-6">
					<div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
						<i className="ri-error-warning-line text-2xl text-red-600"></i>
					</div>
					<CardTitle className="text-xl">An Error Occurred</CardTitle>
					<CardDescription className="my-2">{error}</CardDescription>
					<Button onClick={() => window.location.reload()}>Retry</Button>
				</Card>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Redesigned Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				{statCards.map((stat) => (
					<Card key={stat.title}>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium text-slate-500">{stat.title}</CardTitle>
							<div className={cn('w-10 h-10 flex items-center justify-center rounded-full', stat.color)}>
								<i className={cn(stat.icon, 'text-lg')}></i>
							</div>
						</CardHeader>
						<CardContent>
							<div className="text-3xl font-bold text-slate-800">{stat.value}</div>
							<p className="text-xs text-slate-500 mt-1">
								<span className={cn('font-semibold', (stat.change ?? 0) >= 0 ? 'text-green-600' : 'text-red-600')}>
									{(stat.change ?? 0) >= 0 ? '+' : ''}
									{formatPercentage(stat.change)}
								</span>{' '}
								in the past week
							</p>
						</CardContent>
					</Card>
				))}
			</div>

			{/* Redesigned Main Layout */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Main Column */}
				<div className="lg:col-span-2">
					<Card>
						<CardHeader>
							<CardTitle>Platform Overview</CardTitle>
							<CardDescription>A visual representation of key platform metrics.</CardDescription>
						</CardHeader>
						<CardContent>
							{/* Placeholder for a real chart component */}
							<div className="h-64 bg-slate-50 flex items-center justify-center rounded-md">
								<p className="text-slate-400">Unable to load chart</p>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Right Sidebar */}
				<div className="lg:col-span-1 space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>Quick Actions</CardTitle>
						</CardHeader>
						<CardContent className="flex flex-col space-y-2">
							<CustomLink href="/admin/users">
								<Button variant="outline" className="w-full justify-start">
									<i className="ri-user-line mr-2"></i>View Users
								</Button>
							</CustomLink>
							<CustomLink href="/admin/notifications">
								<Button variant="outline" className="w-full justify-start">
									<i className="ri-notification-line mr-2"></i>Send Broadcast
								</Button>
							</CustomLink>
							<CustomLink href="/admin/ph-requests/multiple-match">
								<Button variant="outline" className="w-full justify-start">
									<i className="ri-group-line mr-2"></i>Multiple Match
								</Button>
							</CustomLink>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Quick Stats</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex items-center justify-between text-sm">
								<span className="text-slate-500">Active Users</span>
								<span className="font-medium text-slate-800">{formatStat(stats?.totalActiveUsers)}</span>
							</div>
							<div className="flex items-center justify-between text-sm">
								<span className="text-slate-500">Pending Matches</span>
								<span className="font-medium text-slate-800">{formatStat(stats?.totalPendingMatches)}</span>
							</div>
							<div className="flex items-center justify-between text-sm">
								<span className="text-slate-500">Success Rate</span>
								<span className="font-medium text-green-600">{stats && stats.totalMatches ? `${Math.round(((stats.totalCompletedMatches ?? 0) / (stats.totalMatches || 1)) * 100)}%` : '0%'}</span>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
