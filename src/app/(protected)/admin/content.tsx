'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CustomLink } from '@/components/CustomLink';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { logger } from '@/lib/logger';
import { getCurrencyFromLocalStorage, getSettings } from '@/lib/helpers';

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

	const statCards = [
		{
			title: 'Total Users',
			value: loading ? '...' : error ? 'Error' : stats?.totalUsers?.toLocaleString() ?? '0',
			change: loading ? '...' : error ? 'Error' : `${stats?.percentIncrease?.users ?? 0}%`,
			changeText: loading ? '...' : error ? 'Error' : `${stats?.percentIncrease?.users ?? 0}% in the past week`,
			icon: 'ri-user-line',
			color: 'bg-blue-500 dark:bg-blue-600',
		},
		{
			title: 'Total Pending PH Requests',
			value: loading ? '...' : error ? 'Error' : stats?.totalPendingPhRequests?.toLocaleString() ?? '0',
			change: loading ? '...' : error ? 'Error' : `${stats?.percentIncrease?.phRequests ?? 0}%`,
			changeText: loading ? '...' : error ? 'Error' : `${stats?.percentIncrease?.phRequests ?? 0}% in the past week`,
			icon: 'ri-hand-heart-line',
			color: 'bg-green-500 dark:bg-green-600',
		},
		{
			title: 'Total Pending GH Requests',
			value: loading ? '...' : error ? 'Error' : stats?.totalPendingGhRequests?.toLocaleString() ?? '0',
			change: loading ? '...' : error ? 'Error' : `${stats?.percentIncrease?.ghRequests ?? 0}%`,
			changeText: loading ? '...' : error ? 'Error' : `${stats?.percentIncrease?.ghRequests ?? 0}% in the past week`,
			icon: 'ri-gift-line',
			color: 'bg-cyan-500 dark:bg-cyan-600',
		},
		{
			title: 'Total Matches',
			value: loading ? '...' : error ? 'Error' : stats?.totalMatches?.toLocaleString() ?? '0',
			change: loading ? '...' : error ? 'Error' : `${stats?.percentIncrease?.matches ?? 0}%`,
			changeText: loading ? '...' : error ? 'Error' : `${stats?.percentIncrease?.matches ?? 0}% in the past week`,
			icon: 'ri-exchange-line',
			color: 'bg-pink-500 dark:bg-pink-600',
		},
	];

	const transactionData = [
		{ status: 'Completed', count: loading ? '...' : error ? 'Error' : stats?.totalCompletedMatches ?? 0, percentage: 0 },
		{ status: 'Pending', count: loading ? '...' : error ? 'Error' : stats?.totalPendingMatches ?? 0, percentage: 0 },
		{ status: 'Failed', count: loading ? '...' : error ? 'Error' : stats?.totalFailedMatches ?? 0, percentage: 0 },
	];

	const quickStats = [
		{ label: 'Active Users', value: loading ? '...' : error ? 'Error' : stats?.totalActiveUsers?.toLocaleString() ?? '0' },
		{ label: 'Pending Matches', value: loading ? '...' : error ? 'Error' : stats?.totalPendingMatches?.toLocaleString() ?? '0' },
		{ label: 'Success Rate', value: loading ? '...' : error ? 'Error' : stats && stats.totalMatches ? `${Math.round(((stats.totalCompletedMatches ?? 0) / (stats.totalMatches || 1)) * 100)}%` : '0%' },
		{ label: 'Avg. Response Time', value: '0 hours' }, // Placeholder, update if API provides
	];

	if (loading) {
		return (
			<div className="p-6 space-y-6  min-h-screen">
				{/* Stats Cards Skeleton */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
					{[...Array(4)].map((_, index) => (
						<div key={index} className="bg-gray-200 dark:bg-gray-800 rounded-lg p-6 animate-pulse">
							<div className="flex items-center justify-between">
								<div className="space-y-3">
									<div className="flex items-center gap-2">
										<div className="w-5 h-5 bg-gray-300 dark:bg-gray-700 rounded"></div>
										<div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-24"></div>
									</div>
									<div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
									<div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-32"></div>
								</div>
								<div className="text-right">
									<div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
								</div>
							</div>
						</div>
					))}
				</div>

				{/* Quick Actions Skeleton */}
				<div className="p-6 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse">
					<div className="flex items-center justify-between mb-6">
						<div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-32"></div>
					</div>
					<div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
						<div className="flex items-center gap-2">
							<div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-24"></div>
							<div className="h-6 w-11 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
						</div>
						<div className="flex flex-wrap gap-2">
							<div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-24"></div>
							<div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-32"></div>
						</div>
					</div>
				</div>

				{/* Charts Skeleton */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{[...Array(2)].map((_, index) => (
						<div key={index} className="p-6 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse">
							<div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-48 mb-2"></div>
							<div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-32 mb-6"></div>
							<div className="h-64 bg-gray-300 dark:bg-gray-700 rounded"></div>
						</div>
					))}
				</div>

				{/* Additional Charts */}
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{[...Array(3)].map((_, index) => (
						<div key={index} className="p-6 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse">
							<div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-32 mb-4"></div>
							<div className="h-32 bg-gray-300 dark:bg-gray-700 rounded"></div>
						</div>
					))}
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="p-6 min-h-screen flex flex-col items-center justify-center">
				<div className="text-red-600 dark:text-red-400 font-semibold text-lg mb-4">{error}</div>
				<Button onClick={() => window.location.reload()}>Retry</Button>
			</div>
		);
	}

	return (
		<div className="p-6 space-y-6  min-h-screen" suppressHydrationWarning={true}>
			{/* Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				{statCards.map((stat, index) => (
					<Card key={index} className={`${stat.color} text-white p-6 border-0 shadow-sm rounded-lg`}>
						<div className="flex items-center justify-between">
							<div>
								<div className="flex items-center gap-2 mb-2">
									<i className={`${stat.icon} w-5 h-5 flex items-center justify-center`}></i>
									<span className="text-sm font-medium opacity-90">{stat.title}</span>
								</div>
								<div className="text-3xl font-bold mb-1">
									{stat.value}&nbsp;
									{stat.title.includes('Requests') ? (getSettings()?.baseCurrency ? getSettings()?.baseCurrency : getCurrencyFromLocalStorage()?.code) : ''}
								</div>
								{/* <div className="text-sm opacity-80">{stat.changeText}</div> */}
							</div>
							{/* <div className="text-right">
								<div className="text-lg font-semibold">{stat.change}</div>
							</div> */}
						</div>
					</Card>
				))}
			</div>

			{/* Quick Actions */}
			<Card className="p-6 bg-white dark:bg-gray-800 border-0 shadow-sm rounded-lg">
				<div className="flex items-center justify-between mb-6">
					<h2 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Actions</h2>
				</div>
				<div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
					{/* ...existing code... */}
					<div className="flex flex-wrap gap-2">
						<CustomLink href="/admin/users">
							<Button variant="outline" size="sm" className="whitespace-nowrap bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600">
								<i className="ri-user-line w-4 h-4 flex items-center justify-center mr-2"></i>
								View Users
							</Button>
						</CustomLink>
						<CustomLink href="/admin/notifications">
							<Button variant="outline" size="sm" className="whitespace-nowrap bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600">
								<i className="ri-notification-line w-4 h-4 flex items-center justify-center mr-2"></i>
								Send Broadcast
							</Button>
						</CustomLink>
						<CustomLink href="/admin/ph-requests/multiple-match">
							<Button variant="outline" size="sm" className="whitespace-nowrap bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600">
								<i className="ri-group-line w-4 h-4 flex items-center justify-center mr-2"></i>
								Multiple Match
							</Button>
						</CustomLink>
					</div>
				</div>
			</Card>

			{/* Main Charts */}
			{/* ...existing code for charts, or replace with live chart data if available... */}

			{/* Additional Analytics */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Transaction Status */}
				<Card className="p-6 bg-white dark:bg-gray-800 border-0 shadow-sm rounded-lg">
					<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Transaction Status</h3>
					<div className="space-y-4">
						{transactionData.map((item, index) => (
							<div key={index} className="flex items-center justify-between">
								<div className="flex items-center gap-3">
									<div className={`w-3 h-3 rounded-full ${item.status === 'Completed' ? 'bg-green-500' : item.status === 'Pending' ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
									<span className="text-sm text-gray-600 dark:text-gray-400">{item.status}</span>
								</div>
								<div className="text-right">
									<div className="text-sm font-medium text-gray-900 dark:text-white">{item.count}</div>
									<div className="text-xs text-gray-500 dark:text-gray-400">{item.percentage}%</div>
								</div>
							</div>
						))}
					</div>
				</Card>

				{/* Quick Stats */}
				<Card className="p-6 bg-white dark:bg-gray-800 border-0 shadow-sm rounded-lg">
					<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Stats</h3>
					<div className="space-y-4">
						{quickStats.map((item, idx) => (
							<div key={idx} className="flex items-center justify-between">
								<span className="text-sm text-gray-600 dark:text-gray-400">{item.label}</span>
								<span className={`text-sm font-medium ${item.label === 'Success Rate' ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>{item.value}</span>
							</div>
						))}
					</div>
				</Card>
			</div>
		</div>
	);
}
