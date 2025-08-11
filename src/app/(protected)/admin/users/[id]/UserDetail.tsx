'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import { UserEditModal } from '@/components/UserEditModal';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { CustomLink } from '@/components/CustomLink';
import { fetchUserByUsername, loginAsUser, verifyEmail, resendVerificationEmail, sendPasswordResetLink, deleteUser as deleteUserUtil, updateUserStatus } from '@/lib/userUtils';
import { User } from '../content';
import { logger } from '@/lib/logger';
import { cn } from '@/lib/utils';

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
				isActive: fetchedUser.status === 'Active',
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
			setUser({ ...user, isActive: true });
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
			<div className="animate-pulse space-y-6">
				<div className="h-8 bg-slate-200 rounded w-48"></div>
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					<div className="lg:col-span-1 space-y-6">
						<div className="bg-white rounded-lg shadow-sm h-64 p-6"></div>
						<div className="bg-white rounded-lg shadow-sm h-48 p-6"></div>
					</div>
					<div className="lg:col-span-2 bg-white rounded-lg shadow-sm h-96 p-6"></div>
				</div>
			</div>
		);
	}

	if (!user) {
		return (
			<div className="text-center py-20">
				<h1 className="text-2xl font-bold text-slate-800 mb-4">User Not Found</h1>
				<CustomLink href="/admin/users">
					<Button>Back to Users</Button>
				</CustomLink>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<header>
				<CustomLink href="/admin/users" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 font-medium mb-4">
					<i className="ri-arrow-left-line"></i>
					Back to All Users
				</CustomLink>
				<h1 className="text-3xl font-bold text-slate-800">User Profile</h1>
			</header>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
				{/* Left Sidebar: Profile & Actions */}
				<div className="lg:col-span-1 space-y-6">
					<Card>
						<CardContent className="p-6 text-center">
							<img src={user.avatar || `https://ui-avatars.com/api/?name=${user.name.replace(' ', '+')}&background=E0E7FF&color=4338CA&bold=true`} alt={user.name} className="w-24 h-24 rounded-full object-cover mx-auto border-4 border-white shadow-md" />
							<h2 className="text-xl font-bold text-slate-800 mt-4">{user.name}</h2>
							<p className="text-sm text-slate-500">@{user.username}</p>
							<div className="flex items-center justify-center gap-2 mt-2">
								<Badge variant={user.isActive ? 'success' : 'destructive'}>{user.status}</Badge>
								<Badge variant="secondary">{user.role}</Badge>
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardHeader>
							<CardTitle>Admin Actions</CardTitle>
						</CardHeader>
						<CardContent className="space-y-2">
							<Button variant="outline" className="w-full justify-start" onClick={handleEditUser}>
								<i className="ri-edit-line mr-2"></i>Edit User
							</Button>
							<Button variant="outline" className="w-full justify-start" onClick={handleSignInAsUser} disabled={actionLoading}>
								<i className="ri-login-box-line mr-2"></i>
								{actionLoading ? 'Signing in...' : 'Sign in as User'}
							</Button>
							<Button variant="outline" className="w-full justify-start" onClick={handleResetPassword} disabled={actionLoading}>
								<i className="ri-key-2-line mr-2"></i>Send Password Reset
							</Button>
							{!user.isActive && (
								<Button variant="outline" className="w-full justify-start" onClick={handleResendVerification} disabled={actionLoading}>
									<i className="ri-mail-send-line mr-2"></i>Resend Verification
								</Button>
							)}
							{/* Suspend/Unsuspend User */}
							<Button
								size="sm"
								variant={user.status === 'Suspended' ? 'default' : 'destructive'}
								onClick={async () => {
									setActionLoading(true);
									const newStatus = user.status === 'Suspended' ? 'Active' : 'Suspended';
									const result = await updateUserStatus(user.id, newStatus);
									setActionLoading(false);
									if (result.success) {
										setUser({ ...user, status: newStatus, isActive: newStatus === 'Active' });
										toast.success(result.message || `User ${newStatus === 'Suspended' ? 'suspended' : 'unsuspended'} successfully.`);
									} else {
										toast.error(result.message || 'Failed to update user status.');
									}
								}}
								disabled={actionLoading}
								className={user.status === 'Suspended' ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-red-600 text-white hover:bg-red-700'}
							>
								{actionLoading ? (user.status === 'Suspended' ? 'Unsuspending...' : 'Suspending...') : user.status === 'Suspended' ? 'Unsuspend User' : 'Suspend User'}
							</Button>
							<Button variant="destructive" className="w-full justify-start" onClick={handleDeleteUser}>
								<i className="ri-delete-bin-line mr-2"></i>Delete User
							</Button>
						</CardContent>
					</Card>
				</div>

				{/* Right Column: Tabbed Information */}
				<div className="lg:col-span-2">
					<Card>
						<CardHeader className="p-0 border-b border-slate-200">
							<nav className="flex gap-4 px-6">
								<button onClick={() => setActiveTab('overview')} className={cn('py-3 text-sm font-medium border-b-2', activeTab === 'overview' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800')}>
									Overview
								</button>
								<button onClick={() => setActiveTab('transactions')} className={cn('py-3 text-sm font-medium border-b-2', activeTab === 'transactions' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800')}>
									Transactions
								</button>
								<button onClick={() => setActiveTab('listings')} className={cn('py-3 text-sm font-medium border-b-2', activeTab === 'listings' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800')}>
									Listings
								</button>
							</nav>
						</CardHeader>
						<CardContent className="p-6">
							{activeTab === 'overview' && (
								<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
									<Card>
										<CardHeader>
											<CardTitle className="text-sm font-medium text-slate-500">Total GH</CardTitle>
										</CardHeader>
										<CardContent>
											<p className="text-2xl font-bold">{transactions.filter((t) => t.type === 'GH').length}</p>
										</CardContent>
									</Card>
									<Card>
										<CardHeader>
											<CardTitle className="text-sm font-medium text-slate-500">Total PH</CardTitle>
										</CardHeader>
										<CardContent>
											<p className="text-2xl font-bold">{transactions.filter((t) => t.type === 'PH').length}</p>
										</CardContent>
									</Card>
									<Card>
										<CardHeader>
											<CardTitle className="text-sm font-medium text-slate-500">Total Transactions</CardTitle>
										</CardHeader>
										<CardContent>
											<p className="text-2xl font-bold">{transactions.length}</p>
										</CardContent>
									</Card>
								</div>
							)}
							{activeTab === 'transactions' && <div className="text-center text-slate-500 py-12">Transaction data would appear here.</div>}
							{activeTab === 'listings' && <div className="text-center text-slate-500 py-12">Listing data would appear here.</div>}
						</CardContent>
					</Card>
				</div>
			</div>

			<ConfirmationModal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} onConfirm={confirmDelete} title="Delete User" message={`Are you sure you want to delete ${user.name}? This action is permanent.`} confirmVariant="destructive" loading={deleteLoading} />
			<UserEditModal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} user={user} onUserUpdated={setUser} />
		</div>
	);
}
