'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import { UserEditModal } from '@/components/UserEditModal';
import { UserAddModal } from '@/components/UserAddModal';
import { UserViewModal } from '@/components/UserViewModal';
import { toast } from 'sonner';
import { deleteUser as deleteUserUtil } from '@/lib/userUtils';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { logger } from '@/lib/logger';
import { Country, UserStatus } from '@/types';

export interface User {
	id: string;
	name: string;
	username: string;
	email: string;
	role: string;
	location: string;
	dateJoined: string;
	phone?: string;
	bio?: string;
	avatar?: string;
	status?: UserStatus;
	emailVerified: boolean;
}

export default function UserManagement({ countries }: { countries: { status: string; countries: Country[] } }) {
	const [users, setUsers] = useState<User[]>([]);
	const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
	const [loading, setLoading] = useState(true);
	const [pageLoading, setPageLoading] = useState(false);
	const [deleteLoading, setDeleteLoading] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);
	const [searchTerm, setSearchTerm] = useState('');
	const [roleFilter, setRoleFilter] = useState('All Roles');
	const [locationFilter, setLocationFilter] = useState('All Locations');
	const [joinedFromFilter, setJoinedFromFilter] = useState('');
	const [joinedToFilter, setJoinedToFilter] = useState('');
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
	const [editModalOpen, setEditModalOpen] = useState(false);
	const [addModalOpen, setAddModalOpen] = useState(false);
	const [viewModalOpen, setViewModalOpen] = useState(false);
	const [selectedUser, setSelectedUser] = useState<User | null>(null);
	const [isMounted, setIsMounted] = useState(false);
	const [totalCount, setTotalCount] = useState(0);
	const [error, setError] = useState<string | null>(null);

	const usersPerPage = 10;

	const fetchUsers = useCallback(async (filters: any = {}, page: number = 1) => {
		setLoading(true);
		setError(null);
		try {
			const params = new URLSearchParams();
			params.append('page', page.toString());
			if (filters.searchTerm) params.append('searchTerm', filters.searchTerm);
			if (filters.role && filters.role !== 'All Roles') params.append('role', filters.role);
			if (filters.location && filters.location !== 'All Locations') params.append('country', filters.location);
			if (filters.joinedFrom) params.append('startDate', filters.joinedFrom);
			if (filters.joinedTo) params.append('endDate', filters.joinedTo);
			// You can add more filters as needed
			const apiUrl = `/api/users/all?${params.toString()}`;
			const response = await fetchWithAuth(apiUrl, {
				method: 'GET',
				headers: { 'Content-Type': 'application/json' },
			});
			if (!response.ok) {
				const errorData = await response.json().catch(() => ({ message: 'Failed to parse error response' }));
				throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorData?.message || 'Unknown error'}`);
			}
			const result = await response.json();
			if (result.status !== 'success') {
				throw new Error(`API returned non-success status: ${result.status}`);
			}
			// Map API user fields to local User type
			const mappedUsers = result.data.users.map((u: any) => ({
				id: u.id,
				name: u.name,
				username: u.username,
				email: u.email,
				avatar: u.avatar_url,
				role: Array.isArray(u.roles) && u.roles.length > 0 ? u.roles[0].charAt(0).toUpperCase() + u.roles[0].slice(1) : 'User',
				location: u.country || '',
				dateJoined: u.registrationDate ? new Date(u.registrationDate).toLocaleDateString() : '',
				phone: u.phone_number || '',
				bio: '',
				status: u.status,
				emailVerified: u.email_status === 'Active',
			}));
			logger.log(mappedUsers);
			setUsers(mappedUsers);
			setTotalCount(result.data.totalCount);
		} catch (err: any) {
			setUsers([]);
			setTotalCount(0);
			setError(err.message || 'Failed to fetch users');
			toast.error(err.message || 'Failed to fetch users');
		} finally {
			setLoading(false);
		}
	}, []);

	// Fetch users on mount and when filters/page change
	useEffect(() => {
		setIsMounted(true);
	}, []);

	useEffect(() => {
		if (isMounted) {
			fetchUsers(
				{
					searchTerm,
					role: roleFilter,
					location: locationFilter,
					joinedFrom: joinedFromFilter,
					joinedTo: joinedToFilter,
				},
				currentPage
			);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isMounted, searchTerm, roleFilter, locationFilter, joinedFromFilter, joinedToFilter, currentPage]);

	// Sorting (example: sort by name ascending)
	const sortableKeys = ['name', 'email', 'role', 'location', 'dateJoined'] as const;
	type SortableKey = (typeof sortableKeys)[number];
	const [sortKey, setSortKey] = useState<SortableKey | ''>('');
	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

	useEffect(() => {
		let sorted = [...users];
		if (sortKey) {
			sorted.sort((a, b) => {
				const aValue = a[sortKey];
				const bValue = b[sortKey];
				if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
				if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
				return 0;
			});
		}
		setFilteredUsers(sorted);
	}, [users, sortKey, sortOrder]);

	const handleSort = (key: SortableKey) => {
		if (sortKey === key) {
			setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
		} else {
			setSortKey(key);
			setSortOrder('asc');
		}
	};

	const handlePageChange = (page: number) => {
		setPageLoading(true);
		setCurrentPage(page);
		setTimeout(() => {
			setPageLoading(false);
		}, 800);
	};

	const handleDeleteUser = (user: User) => {
		setSelectedUser(user);
		setDeleteModalOpen(true);
	};

	const confirmDelete = async () => {
		if (!selectedUser) return;
		setDeleteLoading(true);
		const result = await deleteUserUtil(selectedUser.id);
		if (result.success) {
			setUsers(users.filter((u) => u.id !== selectedUser.id));
			setSelectedUser(null);
			setDeleteModalOpen(false);
		}
		setDeleteLoading(false);
	};

	// Only keep delete logic here. Move add/edit logic to modals for DRYness.
	const handleEditUser = (user: User) => {
		setSelectedUser({ ...user });
		setEditModalOpen(true);
	};

	const handleViewUser = (user: User) => {
		setSelectedUser(user);
		setViewModalOpen(true);
	};

	const handleAddUser = () => {
		setAddModalOpen(true);
	};

	const resetFilters = () => {
		setSearchTerm('');
		setRoleFilter('All Roles');
		setLocationFilter('All Locations');
		setJoinedFromFilter('');
		setJoinedToFilter('');
		setCurrentPage(1);
		toast.success('Filters reset successfully');
	};

	if (!isMounted) {
		return (
			<div className="flex items-center justify-center min-h-screen ">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
			</div>
		);
	}

	const totalPages = Math.ceil((totalCount || filteredUsers.length) / usersPerPage);
	const startIndex = (currentPage - 1) * usersPerPage;
	const endIndex = startIndex + usersPerPage;
	const currentUsers = filteredUsers.slice(startIndex, endIndex);

	const generatePageNumbers = () => {
		const pages = [];
		const showPages = 5;

		if (totalPages <= showPages) {
			for (let i = 1; i <= totalPages; i++) {
				pages.push(i);
			}
		} else {
			if (currentPage <= 3) {
				for (let i = 1; i <= 4; i++) {
					pages.push(i);
				}
				pages.push('...');
				pages.push(totalPages - 1);
				pages.push(totalPages);
			} else if (currentPage >= totalPages - 2) {
				pages.push(1);
				pages.push(2);
				pages.push('...');
				for (let i = totalPages - 3; i <= totalPages; i++) {
					pages.push(i);
				}
			} else {
				pages.push(1);
				pages.push('...');
				for (let i = currentPage - 1; i <= currentPage + 1; i++) {
					pages.push(i);
				}
				pages.push('...');
				pages.push(totalPages);
			}
		}

		return pages;
	};

	if (loading) {
		return (
			<div className="p-6 space-y-6  min-h-screen">
				{/* Header */}
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
					<div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse"></div>
					<div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
				</div>

				{/* Search and Filters Card */}
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
					<div className="flex flex-col lg:flex-row gap-4">
						<div className="flex-1">
							<div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-full animate-pulse"></div>
						</div>
						<div className="flex flex-wrap gap-2">
							<div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
							<div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
							<div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-28 animate-pulse"></div>
						</div>
					</div>
				</div>

				{/* Table Card */}
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
					<div className="overflow-x-auto">
						{/* Table Header */}
						<div className="bg-gray-50 dark:bg-gray-700 px-6 py-4">
							<div className="grid grid-cols-7 gap-4">
								<div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-4 animate-pulse"></div>
								<div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-16 animate-pulse"></div>
								<div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-28 animate-pulse"></div>
								<div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-12 animate-pulse"></div>
								<div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20 animate-pulse"></div>
								<div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24 animate-pulse"></div>
								<div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-16 animate-pulse"></div>
							</div>
						</div>

						{/* Table Rows */}
						<div className="divide-y divide-gray-200 dark:divide-gray-700">
							{[...Array(10)].map((_, index) => (
								<div key={index} className="px-6 py-4 animate-pulse">
									<div className="grid grid-cols-7 gap-4 items-center">
										<div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-4"></div>
										<div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
										<div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-32"></div>
										<div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-12"></div>
										<div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
										<div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
										<div className="flex gap-2">
											<div className="h-8 w-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
											<div className="h-8 w-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
											<div className="h-8 w-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>

				{/* Pagination */}
				<div className="flex justify-center items-center gap-2 mt-6">
					<div className="h-10 w-10 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
					<div className="h-10 w-10 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
					<div className="h-10 w-10 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
					<div className="h-10 w-10 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
					<div className="h-10 w-10 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
				</div>
			</div>
		);
	}

	return (
		<div className="p-6 space-y-6  min-h-screen" suppressHydrationWarning={true}>
			{/* Header */}
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
				<h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>
				<Button onClick={handleAddUser} className="bg-blue-600 hover:bg-blue-700 text-white whitespace-nowrap">
					<i className="ri-add-line w-4 h-4 flex items-center justify-center mr-2"></i>
					Add New User
				</Button>
			</div>

			{/* Search and Filters */}
			<Card className="p-6 bg-white dark:bg-gray-800 border-0 shadow-sm rounded-lg">
				<div className="flex flex-col lg:flex-row gap-4 mb-4">
					<div className="flex-1">
						<div className="relative">
							<i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 flex items-center justify-center"></i>
							<input
								type="text"
								placeholder="Search users..."
								className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
							/>
						</div>
					</div>
					<div className="flex flex-wrap gap-2">
						<select
							className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm pr-8"
							value={roleFilter}
							onChange={(e) => setRoleFilter(e.target.value)}
						>
							<option value="All Roles">All Roles</option>
							<option value="User">User</option>
							<option value="Admin">Admin</option>
						</select>
						<select
							className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm pr-8"
							value={locationFilter}
							onChange={(e) => setLocationFilter(e.target.value)}
						>
							<option value="Monrovia">Monrovia</option>
							<option value="Gbarnga">Gbarnga</option>
							<option value="Buchanan">Buchanan</option>
							<option value="Kakata">Kakata</option>
							<option value="Zwedru">Zwedru</option>
						</select>
						<Button variant="outline" onClick={resetFilters} className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 whitespace-nowrap">
							Reset Filters
						</Button>
					</div>
				</div>
			</Card>

			{/* User Table */}
			<Card className="p-0 bg-white dark:bg-gray-800 border-0 shadow-sm rounded-lg overflow-hidden">
				{pageLoading ? (
					<div className="flex items-center justify-center py-20">
						<div className="flex flex-col items-center gap-4">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
							<span className="text-gray-600 dark:text-gray-400">Loading users...</span>
						</div>
					</div>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead className="bg-gray-50 dark:bg-gray-700">
								<tr>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">#</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('name')}>
										Name {sortKey === 'name' && (sortOrder === 'asc' ? '▲' : '▼')}
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('email')}>
										Email address {sortKey === 'email' && (sortOrder === 'asc' ? '▲' : '▼')}
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('role')}>
										Role {sortKey === 'role' && (sortOrder === 'asc' ? '▲' : '▼')}
									</th>

									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('dateJoined')}>
										Date joined {sortKey === 'dateJoined' && (sortOrder === 'asc' ? '▲' : '▼')}
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email Status</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
								</tr>
							</thead>
							<tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
								{currentUsers.map((user, index) => (
									<tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{startIndex + index + 1}</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{user.name}</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{user.email}</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{user.role}</td>

										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{user.dateJoined}</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<span className={`px-2 py-1 rounded-full text-xs font-medium ${user.emailVerified ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'}`}>
												{user.emailVerified ? 'Verified' : 'Not Verified'}
											</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
											<div className="flex items-center gap-2">
												<button onClick={() => handleViewUser(user)} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors cursor-pointer" title="View User">
													<i className="ri-eye-line w-4 h-4 flex items-center justify-center"></i>
												</button>
												<button onClick={() => handleDeleteUser(user)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors cursor-pointer" title="Delete User">
													<i className="ri-delete-bin-line w-4 h-4 flex items-center justify-center"></i>
												</button>
												<button onClick={() => handleEditUser(user)} className="p-2 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer" title="Edit User">
													<i className="ri-edit-line w-4 h-4 flex items-center justify-center"></i>
												</button>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</Card>

			{/* Empty State */}
			{filteredUsers.length === 0 && !pageLoading && !loading && (
				<div className="text-center py-12">
					<i className="ri-user-search-line w-12 h-12 flex items-center justify-center mx-auto text-gray-400 mb-4"></i>
					<h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No users found</h3>
					<p className="text-gray-500 dark:text-gray-400">{searchTerm ? `No users found matching "${searchTerm}"` : 'Try adjusting your search or filters'}</p>
				</div>
			)}

			{/* Pagination */}
			{totalPages > 1 && !pageLoading && (
				<div className="flex justify-center items-center gap-2 mt-6">
					<button
						onClick={() => handlePageChange(currentPage - 1)}
						disabled={currentPage === 1}
						className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
					>
						<i className="ri-arrow-left-line w-4 h-4 flex items-center justify-center"></i>
					</button>

					{generatePageNumbers().map((page, index) => (
						<button
							key={index}
							onClick={() => typeof page === 'number' && handlePageChange(page)}
							disabled={page === '...'}
							className={`px-3 py-2 rounded-lg border cursor-pointer ${page === currentPage ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'} ${
								page === '...' ? 'cursor-default' : ''
							}`}
						>
							{page}
						</button>
					))}

					<button
						onClick={() => handlePageChange(currentPage + 1)}
						disabled={currentPage === totalPages}
						className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
					>
						<i className="ri-arrow-right-line w-4 h-4 flex items-center justify-center"></i>
					</button>
				</div>
			)}

			{/* Modals */}
			<ConfirmationModal
				isOpen={deleteModalOpen}
				onClose={() => setDeleteModalOpen(false)}
				onConfirm={confirmDelete}
				title="Delete User"
				message={`Are you sure you want to delete ${selectedUser?.name}? This action cannot be undone.`}
				confirmText="Delete"
				cancelText="Cancel"
				confirmVariant="destructive"
				loading={deleteLoading}
			/>

			{selectedUser && (
				<UserEditModal
					isOpen={editModalOpen}
					onClose={() => setEditModalOpen(false)}
					user={{ ...selectedUser }}
					// Optionally, pass onUserUpdated={(user) => { ...refresh users... }}
				/>
			)}

			<UserAddModal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} countries={countries.countries} />

			<UserViewModal isOpen={viewModalOpen} onClose={() => setViewModalOpen(false)} user={selectedUser} />
		</div>
	);
}
