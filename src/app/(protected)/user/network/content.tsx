'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { NetworkSkeleton } from '@/components/LoadingSkeleton';

interface NetworkMember {
	id: string;
	name: string;
	username: string;
	avatar: string;
	joinDate: string;
	level: number;
	status: 'Active' | 'Inactive';
	totalHelp: number;
}

interface NetworkStats {
	totalMembers: number;
	activeMembers: number;
	totalHelpProvided: number;
}

import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { logger } from '@/lib/logger';
import { getCurrencyFromLocalStorage } from '@/lib/helpers';

export default function NetworkPage() {
	const [isLoading, setIsLoading] = useState(true);
	const [networkStats, setNetworkStats] = useState<NetworkStats | null>(null);
	const [networkMembers, setNetworkMembers] = useState<NetworkMember[]>([]);
	const [searchQuery, setSearchQuery] = useState('');
	const [filteredMembers, setFilteredMembers] = useState<NetworkMember[]>([]);

	useEffect(() => {
		const fetchNetworkData = async () => {
			setIsLoading(true);
			try {
				// Fetch referrals (used as network members)
				const res = await fetchWithAuth('/api/referrals');
				let members: any[] = [];
				let stats: NetworkStats | null = null;
				if (res.ok) {
					const data = await res.json();
					members = data.referrals || [];
					stats = {
						totalMembers: members.length,
						activeMembers: members.filter((m) => m.status === 'Active').length,
						totalHelpProvided: members.reduce((sum, m) => sum + (m.amount ? Number(m.amount) : 0), 0),
					};
				}
				// Map referrals to NetworkMember type
				const mappedMembers: NetworkMember[] = members.map((m) => ({
					id: m.id,
					name: m.name,
					username: m.username,
					avatar: m.avatar,
					joinDate: m.joinedDate,
					level: m.level || 1,
					status: m.status || 'Active',
					totalHelp: m.amount ? Number(m.amount) : 0,
				}));
				setNetworkStats(stats);
				setNetworkMembers(mappedMembers);
				setFilteredMembers(mappedMembers);
			} catch (error) {
				logger.error('Error fetching network data:', error);
				setNetworkStats(null);
				setNetworkMembers([]);
				setFilteredMembers([]);
			} finally {
				setIsLoading(false);
			}
		};
		fetchNetworkData();
	}, []);

	useEffect(() => {
		if (searchQuery.trim() === '') {
			setFilteredMembers(networkMembers);
		} else {
			const filtered = networkMembers.filter((member) => member.name.toLowerCase().includes(searchQuery.toLowerCase()) || member.username.toLowerCase().includes(searchQuery.toLowerCase()));
			setFilteredMembers(filtered);
		}
	}, [searchQuery, networkMembers]);

	const handleSearch = (query: string) => {
		setSearchQuery(query);
	};

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('en-GH', {
			style: 'currency',
			currency: getCurrencyFromLocalStorage()?.code,
			minimumFractionDigits: 0,
		}).format(amount);
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('en-GH', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		});
	};

	if (isLoading) {
		return <NetworkSkeleton />;
	}

	if (!networkStats) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-emerald-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
				<div className="text-center">
					<i className="ri-error-warning-line w-16 h-16 flex items-center justify-center mx-auto mb-6 text-red-400 dark:text-red-600"></i>
					<h3 className="text-2xl font-bold text-indigo-900 dark:text-indigo-100 mb-2">Failed to load network data</h3>
					<p className="text-indigo-700 dark:text-indigo-200">Please try refreshing the page</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-emerald-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 py-0 px-0">
			<div className="max-w-6xl mx-auto py-10 px-4 space-y-10">
				{/* Header */}
				<div className="flex flex-col md:flex-row gap-2 md:items-center md:justify-between mb-6">
					<h1 className="text-3xl md:text-4xl font-extrabold text-indigo-900 dark:text-indigo-100 drop-shadow-lg">My Network</h1>
				</div>

				{/* Stats Cards */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<Card className="rounded-3xl shadow-2xl bg-white/90 dark:bg-gray-900/90 border-2 border-indigo-100 dark:border-indigo-900">
						<CardContent className="p-8 flex items-center justify-between">
							<div>
								<p className="text-base text-indigo-700 dark:text-indigo-200 font-semibold">Total Members</p>
								<p className="text-3xl font-black text-indigo-900 dark:text-indigo-100">{networkStats.totalMembers.toLocaleString()}</p>
							</div>
							<div className="w-16 h-16 bg-gradient-to-tr from-indigo-200 via-purple-200 to-emerald-200 dark:from-indigo-900 dark:via-purple-900 dark:to-emerald-900 rounded-full flex items-center justify-center shadow-lg">
								<i className="ri-group-line w-8 h-8 flex items-center justify-center text-indigo-600 dark:text-indigo-300"></i>
							</div>
						</CardContent>
					</Card>
					<Card className="rounded-3xl shadow-2xl bg-white/90 dark:bg-gray-900/90 border-2 border-indigo-100 dark:border-indigo-900">
						<CardContent className="p-8 flex items-center justify-between">
							<div>
								<p className="text-base text-green-700 dark:text-green-200 font-semibold">Active Members</p>
								<p className="text-3xl font-black text-green-900 dark:text-green-100">{networkStats.activeMembers.toLocaleString()}</p>
							</div>
							<div className="w-16 h-16 bg-gradient-to-tr from-green-200 via-emerald-200 to-indigo-200 dark:from-green-900 dark:via-emerald-900 dark:to-indigo-900 rounded-full flex items-center justify-center shadow-lg">
								<i className="ri-user-star-line w-8 h-8 flex items-center justify-center text-green-600 dark:text-green-300"></i>
							</div>
						</CardContent>
					</Card>
					<Card className="rounded-3xl shadow-2xl bg-white/90 dark:bg-gray-900/90 border-2 border-indigo-100 dark:border-indigo-900">
						<CardContent className="p-8 flex items-center justify-between">
							<div>
								<p className="text-base text-purple-700 dark:text-purple-200 font-semibold">Total Help Provided</p>
								<p className="text-3xl font-black text-purple-900 dark:text-purple-100">{formatCurrency(networkStats.totalHelpProvided)}</p>
							</div>
							<div className="w-16 h-16 bg-gradient-to-tr from-purple-200 via-indigo-200 to-emerald-200 dark:from-purple-900 dark:via-indigo-900 dark:to-emerald-900 rounded-full flex items-center justify-center shadow-lg">
								<i className="ri-hand-heart-line w-8 h-8 flex items-center justify-center text-purple-600 dark:text-purple-300"></i>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Members List */}
				<Card className="rounded-3xl shadow-2xl bg-white/90 dark:bg-gray-900/90 border-2 border-indigo-100 dark:border-indigo-900">
					<CardContent className="p-8">
						<div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between mb-8">
							<h2 className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">Network Members</h2>
							<div className="relative flex-1 lg:max-w-md">
								<i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-400 w-5 h-5 flex items-center justify-center"></i>
								<input
									type="text"
									placeholder="Search members..."
									value={searchQuery}
									onChange={(e) => handleSearch(e.target.value)}
									className="w-full pl-10 pr-4 py-2.5 border-2 border-indigo-100 dark:border-indigo-900 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 text-base bg-white/80 dark:bg-gray-900/80 text-indigo-900 dark:text-indigo-100 shadow"
								/>
							</div>
						</div>
						<div className="space-y-4">
							{filteredMembers.map((member) => (
								<div
									key={member.id}
									className="flex items-center gap-6 p-6 rounded-2xl border-2 border-indigo-100 dark:border-indigo-900 bg-gradient-to-tr from-indigo-50 via-white to-emerald-50 dark:from-indigo-950 dark:via-gray-900 dark:to-emerald-950 hover:scale-[1.02] hover:shadow-xl transition-all"
								>
									<div className="relative">
										<img src={member.avatar} alt={member.name} className="w-16 h-16 rounded-full object-cover border-4 border-white dark:border-gray-900 shadow" />
										<div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white dark:border-gray-900 ${member.status === 'Active' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
									</div>
									<div className="flex-1 min-w-0">
										<div className="flex items-center gap-2 mb-1">
											<h3 className="font-extrabold text-indigo-900 dark:text-indigo-100 text-lg">{member.name}</h3>
											<span className="text-xs bg-indigo-100 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-200 px-3 py-1 rounded-full font-bold">Level {member.level}</span>
										</div>
										<p className="text-sm text-indigo-700 dark:text-indigo-200">@{member.username}</p>
										<p className="text-xs text-indigo-400 dark:text-indigo-400">Joined {formatDate(member.joinDate)}</p>
									</div>
									<div className="text-right">
										<p className="text-lg font-black text-emerald-700 dark:text-emerald-300">{formatCurrency(member.totalHelp)}</p>
										<p className="text-xs text-indigo-700 dark:text-indigo-200">Help provided</p>
									</div>
								</div>
							))}
						</div>
						{filteredMembers.length === 0 && (
							<div className="text-center py-16">
								<i className="ri-user-search-line w-16 h-16 flex items-center justify-center mx-auto mb-6 text-indigo-200 dark:text-indigo-900"></i>
								<h3 className="text-2xl font-bold text-indigo-900 dark:text-indigo-100 mb-2">No members found</h3>
								<p className="text-indigo-700 dark:text-indigo-200 text-lg">{searchQuery ? 'Try adjusting your search terms' : 'Your network is empty'}</p>
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
