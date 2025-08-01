'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import { UserEditModal } from '@/components/UserEditModal';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { CustomLink } from '@/components/CustomLink';
import { fetchUserByUsername, loginAsUser, verifyEmail, resendVerificationEmail, sendPasswordResetLink, deleteUser as deleteUserUtil } from '@/lib/userUtils';
import { User } from '../content';
import { logger } from '@/lib/logger';

// These interfaces should be imported from your types if available
interface Transaction {
	id: string;
	type: 'GH' | 'PH';
	amount: number;
	date: string;
	status: 'Completed' | 'Pending' | 'Failed';
	description: string;
}

interface Listing {
	id: string;
	title: string;
	type: 'GH' | 'PH';
	amount: number;
	date: string;
	status: 'Active' | 'Expired' | 'Fulfilled';
}

interface UserDetailProps {
	username: string;
}

export default function UserDetail({ username }: UserDetailProps) {
	const [user, setUser] = useState<User | null>(null);
	const [transactions, setTransactions] = useState<Transaction[]>([]);
	const [listings, setListings] = useState<Listing[]>([]);
	const [loading, setLoading] = useState(true);
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
	const [editModalOpen, setEditModalOpen] = useState(false);
	const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'listings'>('overview');
	const [deleteLoading, setDeleteLoading] = useState(false);
	const [actionLoading, setActionLoading] = useState(false);
	const router = useRouter();

	useEffect(() => {
		loadUserData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [username]);

	async function loadUserData() {
		setLoading(true);
		try {
			const fetchedUser = await fetchUserByUsername(username);
			if (!fetchedUser || !fetchedUser.id || !fetchedUser.name || !fetchedUser.username || !fetchedUser.email) {
				setUser(null);
				setLoading(false);
				return;
			}
			logger.log('Fetched user:', fetchedUser);
			const mappedUsers: User = {
				id: fetchedUser.id,
				name: fetchedUser.name,
				username: fetchedUser.username,
				email: fetchedUser.email,
				avatar: fetchedUser.avatar_url || '',
				role: Array.isArray(fetchedUser.roles) && fetchedUser.roles.length > 0 ? fetchedUser.roles[0].charAt(0).toUpperCase() + fetchedUser.roles[0].slice(1) : 'User',
				location: fetchedUser.country || '',
				dateJoined: fetchedUser.registrationDate ? new Date(fetchedUser.registrationDate).toLocaleDateString() : '',
				phone: fetchedUser.phone_number || '',
				bio: '',
				status: fetchedUser.status,
				emailVerified: fetchedUser.email_status === 'Active',
			};
			setUser(mappedUsers);
			// TODO: fetch transactions and listings for user if API available
			// setTransactions(await fetchUserTransactions(fetchedUser.id));
			// setListings(await fetchUserListings(fetchedUser.id));
		} catch (e) {
			setUser(null);
		}
		setLoading(false);
	}

	const handleDeleteUser = () => setDeleteModalOpen(true);

	const confirmDelete = async () => {
		if (!user) return;
		setDeleteLoading(true);
		const result = await deleteUserUtil(user.id);
		setDeleteLoading(false);
		if (result.success) {
			toast.success('User deleted successfully');
			router.push('/admin/users');
		} else {
			toast.error('Failed to delete user');
		}
	};

	const handleEditUser = () => setEditModalOpen(true);

	const handleSignInAsUser = async () => {
		if (!user) return;
		setActionLoading(true);
		const result = await loginAsUser(user.id);
		setActionLoading(false);
		if (result.success && result.link) {
			window.open(result.link, '_blank');
		}
	};

	const handleVerifyEmail = async () => {
		if (!user) return;
		setActionLoading(true);
		const result = await verifyEmail(user.id);
		setActionLoading(false);
		if (result.success) {
			toast.success(result.message || 'Email verified successfully');
			setUser({ ...user, emailVerified: true });
		} else {
			toast.error(result.message || 'Failed to verify email');
		}
	};

	const handleResendVerification = async () => {
		if (!user) return;
		setActionLoading(true);
		const result = await resendVerificationEmail(user.email);
		setActionLoading(false);
	};

	const handleResetPassword = async () => {
		if (!user) return;
		setActionLoading(true);
		const result = await sendPasswordResetLink(user.email);
		setActionLoading(false);
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'Active':
			case 'Completed':
				return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
			case 'Pending':
				return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
			case 'Failed':
			case 'Suspended':
				return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
			case 'Expired':
				return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
			case 'Fulfilled':
				return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
			default:
				return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
		}
	};

	if (loading) {
		return (
			<div className="p-6 space-y-6  min-h-screen">
				<div className="animate-pulse">
					{/* Header */}
					<div className="flex items-center justify-between mb-6">
						<div className="flex items-center gap-4">
							<div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
							<div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
						</div>
						<div className="flex items-center gap-2">
							<div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
							<div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-28"></div>
							<div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
						</div>
					</div>

					{/* User Info Card */}
					<div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 mb-6">
						<div className="flex items-center gap-6 mb-6">
							<div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
							<div className="flex-1">
								<div className="flex items-center gap-3 mb-2">
									<div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
									<div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
								</div>
								<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-1"></div>
								<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
							</div>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
							{[...Array(4)].map((_, i) => (
								<div key={i}>
									<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-1"></div>
									<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
								</div>
							))}
						</div>
					</div>

					{/* Tabs */}
					<div className="border-b border-gray-200 dark:border-gray-700 mb-6">
						<div className="flex space-x-8">
							<div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
							<div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
							<div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
						</div>
					</div>

					{/* Tab Content */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{[...Array(3)].map((_, i) => (
							<div key={i} className="bg-gray-100 dark:bg-gray-800 rounded-lg h-32"></div>
						))}
					</div>
				</div>
			</div>
		);
	}

	if (!user) {
		return (
			<div className="p-6  min-h-screen">
				<div className="text-center">
					<h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">User not found</h1>
					<CustomLink href="/admin/users">
						<Button className="bg-blue-600 hover:bg-blue-700 text-white">Back to Users</Button>
					</CustomLink>
				</div>
			</div>
		);
	}

	return (
		<div className="p-6 space-y-6  min-h-screen">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<CustomLink href="/admin/users">
						<Button variant="outline" size="sm" className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600">
							<i className="ri-arrow-left-line w-4 h-4 flex items-center justify-center mr-2"></i>
							Back
						</Button>
					</CustomLink>
					<h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Profile</h1>
				</div>
				<div className="flex items-center gap-2">
					<Button variant="outline" onClick={handleEditUser} className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 whitespace-nowrap">
						<i className="ri-edit-line w-4 h-4 flex items-center justify-center mr-2"></i>
						Edit
					</Button>
					<Button variant="outline" onClick={handleSignInAsUser} disabled={actionLoading} className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 whitespace-nowrap">
						<i className="ri-login-box-line w-4 h-4 flex items-center justify-center mr-2"></i>
						{actionLoading ? 'Signing in...' : 'Sign in as User'}
					</Button>
					<Button variant="outline" onClick={handleDeleteUser} className="bg-white dark:bg-gray-700 border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 whitespace-nowrap">
						<i className="ri-delete-bin-line w-4 h-4 flex items-center justify-center mr-2"></i>
						Delete
					</Button>
				</div>
			</div>

			{/* User Info Card */}
			<Card className="p-6 bg-white dark:bg-gray-800 border-0 shadow-sm rounded-lg">
				<div className="flex items-center gap-6 mb-6">
					<div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center">
						<span className="text-white font-bold text-3xl">{user.name.charAt(0)}</span>
					</div>
					<div className="flex-1">
						<div className="flex items-center gap-3 mb-2">
							<h2 className="text-2xl font-bold text-gray-900 dark:text-white">{user.name}</h2>
							<span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status || 'Active')}`}>{user.status}</span>
						</div>
						<p className="text-gray-600 dark:text-gray-400 mb-1">@{user.username}</p>
						<p className="text-gray-600 dark:text-gray-400">{user.email}</p>
						<div className="flex items-center gap-2 mt-2 flex-col sm:flex-row">
							<span className={`px-2 py-1 rounded-full text-xs font-medium ${user.emailVerified ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'}`}>
								{user.emailVerified ? 'Verified' : 'Not Verified'}
							</span>
							{!user.emailVerified && (
								<>
									<Button size="sm" variant="outline" onClick={handleVerifyEmail} disabled={actionLoading}>
										{actionLoading ? 'Verifying...' : 'Verify Email'}
									</Button>

									<Button size="sm" variant="outline" onClick={handleResendVerification} disabled={actionLoading}>
										Resend Verification
									</Button>
								</>
							)}

							<Button size="sm" variant="outline" onClick={handleResetPassword} disabled={actionLoading}>
								Reset Password
							</Button>
						</div>
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
						<p className="text-gray-900 dark:text-white">{user.role}</p>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
						<p className="text-gray-900 dark:text-white">{user.location}</p>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
						<p className="text-gray-900 dark:text-white">{user.phone || 'Not provided'}</p>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date Joined</label>
						<p className="text-gray-900 dark:text-white">{user.dateJoined}</p>
					</div>
				</div>

				{user.bio && (
					<div className="mt-4">
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bio</label>
						<p className="text-gray-900 dark:text-white">{user.bio}</p>
					</div>
				)}
			</Card>

			{/* Tabs */}
			<div className="border-b border-gray-200 dark:border-gray-700">
				<nav className="-mb-px flex space-x-8">
					<button
						onClick={() => setActiveTab('overview')}
						className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === 'overview' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'}`}
					>
						Overview
					</button>
					<button
						onClick={() => setActiveTab('transactions')}
						className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
							activeTab === 'transactions' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
						}`}
					>
						Transactions
					</button>
					<button
						onClick={() => setActiveTab('listings')}
						className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === 'listings' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'}`}
					>
						Listings
					</button>
				</nav>
			</div>

			{/* Tab Content */}
			{activeTab === 'overview' && (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					<Card className="p-6 bg-blue-600 text-white border-0 shadow-sm rounded-lg">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm opacity-90">Total GH Requests</p>
								<p className="text-2xl font-bold">{transactions.filter((t) => t.type === 'GH').length}</p>
							</div>
							<i className="ri-gift-line w-8 h-8 flex items-center justify-center opacity-80"></i>
						</div>
					</Card>
					<Card className="p-6 bg-green-600 text-white border-0 shadow-sm rounded-lg">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm opacity-90">Total PH Requests</p>
								<p className="text-2xl font-bold">{transactions.filter((t) => t.type === 'PH').length}</p>
							</div>
							<i className="ri-hand-heart-line w-8 h-8 flex items-center justify-center opacity-80"></i>
						</div>
					</Card>
					<Card className="p-6 bg-purple-600 text-white border-0 shadow-sm rounded-lg">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm opacity-90">Total Transactions</p>
								<p className="text-2xl font-bold">{transactions.length}</p>
							</div>
							<i className="ri-exchange-line w-8 h-8 flex items-center justify-center opacity-80"></i>
						</div>
					</Card>
				</div>
			)}

			{activeTab === 'transactions' && (
				<Card className="p-0 bg-white dark:bg-gray-800 border-0 shadow-sm rounded-lg overflow-hidden">
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead className="bg-gray-50 dark:bg-gray-700">
								<tr>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
								</tr>
							</thead>
							<tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
								{transactions.map((transaction) => (
									<tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
										<td className="px-6 py-4 whitespace-nowrap">
											<span className={`px-2 py-1 rounded-full text-xs font-medium ${transaction.type === 'GH' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'}`}>
												{transaction.type}
											</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">GH₵ {transaction.amount}</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{transaction.date}</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>{transaction.status}</span>
										</td>
										<td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{transaction.description}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</Card>
			)}

			{activeTab === 'listings' && (
				<Card className="p-0 bg-white dark:bg-gray-800 border-0 shadow-sm rounded-lg overflow-hidden">
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead className="bg-gray-50 dark:bg-gray-700">
								<tr>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Title</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
								</tr>
							</thead>
							<tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
								{listings.map((listing) => (
									<tr key={listing.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
										<td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{listing.title}</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<span className={`px-2 py-1 rounded-full text-xs font-medium ${listing.type === 'GH' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'}`}>{listing.type}</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">GH₵ {listing.amount}</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{listing.date}</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(listing.status)}`}>{listing.status}</span>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</Card>
			)}

			{/* Modals */}
			<ConfirmationModal
				isOpen={deleteModalOpen}
				onClose={() => setDeleteModalOpen(false)}
				onConfirm={confirmDelete}
				title="Delete User"
				message={`Are you sure you want to delete ${user.name}? This action cannot be undone and will remove all associated data.`}
				confirmText="Delete"
				cancelText="Cancel"
				confirmVariant="destructive"
				loading={deleteLoading}
			/>

			<UserEditModal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} user={user} onUserUpdated={setUser} />
		</div>
	);
}
