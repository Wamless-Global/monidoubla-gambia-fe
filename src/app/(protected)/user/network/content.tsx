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
			<div className="p-4 lg:p-6 flex items-center justify-center min-h-screen">
				<div className="text-center">
					<i className="ri-error-warning-line w-12 h-12 flex items-center justify-center mx-auto mb-4 text-destructive"></i>
					<h3 className="text-lg font-semibold text-foreground mb-2">Failed to load network data</h3>
					<p className="text-muted-foreground">Please try refreshing the page</p>
				</div>
			</div>
		);
	}

	return (
		<div className="p-4 lg:p-6">
			<div className="max-w-6xl mx-auto space-y-6">
				{/* Header */}
				<div className="flex items-center justify-between">
					<h1 className="text-2xl font-bold text-foreground">My Network</h1>
				</div>

				{/* Stats Cards */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
					<Card>
						<CardContent className="p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-muted-foreground">Total Members</p>
									<p className="text-2xl font-bold text-foreground">{networkStats.totalMembers.toLocaleString()}</p>
								</div>
								<div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
									<i className="ri-group-line w-6 h-6 flex items-center justify-center text-blue-600 dark:text-blue-400"></i>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-muted-foreground">Active Members</p>
									<p className="text-2xl font-bold text-foreground">{networkStats.activeMembers.toLocaleString()}</p>
								</div>
								<div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
									<i className="ri-user-star-line w-6 h-6 flex items-center justify-center text-green-600 dark:text-green-400"></i>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-muted-foreground">Total Help Provided</p>
									<p className="text-2xl font-bold text-foreground">{formatCurrency(networkStats.totalHelpProvided)}</p>
								</div>
								<div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
									<i className="ri-hand-heart-line w-6 h-6 flex items-center justify-center text-purple-600 dark:text-purple-400"></i>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Members List */}
				<Card>
					<CardContent className="p-6">
						<div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between mb-6">
							<h2 className="text-xl font-semibold text-foreground">Network Members</h2>

							<div className="relative flex-1 lg:max-w-md">
								<i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 flex items-center justify-center"></i>
								<input type="text" placeholder="Search members..." value={searchQuery} onChange={(e) => handleSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-ring text-sm bg-background" />
							</div>
						</div>

						<div className="space-y-4">
							{filteredMembers.map((member) => (
								<div key={member.id} className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors">
									<div className="relative">
										<img src={member.avatar} alt={member.name} className="w-12 h-12 rounded-full object-cover" />
										<div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${member.status === 'Active' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
									</div>

									<div className="flex-1 min-w-0">
										<div className="flex items-center gap-2 mb-1">
											<h3 className="font-medium text-foreground">{member.name}</h3>
											<span className="text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded-full">Level {member.level}</span>
										</div>
										<p className="text-sm text-muted-foreground">@{member.username}</p>
										<p className="text-xs text-muted-foreground">Joined {formatDate(member.joinDate)}</p>
									</div>

									<div className="text-right">
										<p className="text-sm font-medium text-foreground">{formatCurrency(member.totalHelp)}</p>
										<p className="text-xs text-muted-foreground">Help provided</p>
									</div>
								</div>
							))}
						</div>

						{filteredMembers.length === 0 && (
							<div className="text-center py-8">
								<i className="ri-user-search-line w-12 h-12 flex items-center justify-center mx-auto mb-4 text-muted-foreground"></i>
								<h3 className="text-lg font-medium text-foreground mb-2">No members found</h3>
								<p className="text-muted-foreground">{searchQuery ? 'Try adjusting your search terms' : 'Your network is empty'}</p>
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
