'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import { UserEditModal } from '@/components/UserEditModal';
import { UserAddModal } from '@/components/UserAddModal';
import { UserViewModal } from '@/components/UserViewModal';
import { toast } from 'sonner';
import { deleteUser as deleteUserUtil } from '@/lib/userUtils';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { logger } from '@/lib/logger';
import { Country, UserStatus } from '@/types';
import { handleFetchMessage } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

// NOTE: All original interfaces and logic are preserved.
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
	const [loading, setLoading] = useState(true);
	const [currentPage, setCurrentPage] = useState(1);
	const [searchTerm, setSearchTerm] = useState('');
	const [roleFilter, setRoleFilter] = useState('All Roles');
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
	const [editModalOpen, setEditModalOpen] = useState(false);
	const [addModalOpen, setAddModalOpen] = useState(false);
	const [viewModalOpen, setViewModalOpen] = useState(false);
	const [selectedUser, setSelectedUser] = useState<User | null>(null);
	const [totalCount, setTotalCount] = useState(0);
	const [deleteLoading, setDeleteLoading] = useState(false);

	const fetchUsers = useCallback(
		async (page: number = 1) => {
			setLoading(true);
			try {
				const params = new URLSearchParams({ page: page.toString(), limit: '10' });
				if (searchTerm) params.append('searchTerm', searchTerm);
				if (roleFilter !== 'All Roles') params.append('role', roleFilter);

				const res = await fetchWithAuth(`/api/users/all?${params.toString()}`);
				if (!res.ok) throw new Error(handleFetchMessage(await res.json(), 'Failed to fetch users'));

				const result = await res.json();
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
				setUsers(mappedUsers);
				setTotalCount(result.data.totalCount);
			} catch (err) {
				toast.error(handleFetchMessage(err, 'Failed to fetch users'));
			} finally {
				setLoading(false);
			}
		},
		[searchTerm, roleFilter]
	);

	useEffect(() => {
		fetchUsers(currentPage);
	}, [currentPage, fetchUsers]);

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
			toast.success('User deleted successfully.');
		}
		setSelectedUser(null);
		setDeleteModalOpen(false);
		setDeleteLoading(false);
	};

	const handleEditUser = (user: User) => {
		setSelectedUser({ ...user });
		setEditModalOpen(true);
	};
	const handleViewUser = (user: User) => {
		setSelectedUser(user);
		setViewModalOpen(true);
	};
	const handleUserAdded = () => {
		fetchUsers(1);
	};

	const totalPages = Math.ceil(totalCount / 10);

	return (
		<div className="space-y-6">
			<header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
				<div>
					<h1 className="text-3xl font-bold text-slate-800">User Management</h1>
					<p className="text-slate-500 mt-1">View, manage, and edit user accounts.</p>
				</div>
				<Button onClick={() => setAddModalOpen(true)}>
					<i className="ri-add-line mr-2"></i>Add User
				</Button>
			</header>

			<Card>
				<CardHeader className="flex-col sm:flex-row gap-4 justify-between items-center">
					<div className="relative w-full sm:max-w-xs">
						<i className="ri-search-line absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"></i>
						<input type="text" placeholder="Search by name, email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10" />
					</div>
					<select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="w-full sm:w-auto">
						<option value="All Roles">All Roles</option>
						<option value="User">User</option>
						<option value="Admin">Admin</option>
					</select>
				</CardHeader>
				<CardContent className="p-0">
					<div className="overflow-x-auto">
						<table className="min-w-full divide-y divide-slate-200">
							<thead className="bg-slate-50">
								<tr>
									<th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">User</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Role</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Email Status</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Date Joined</th>
									<th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Actions</th>
								</tr>
							</thead>
							<tbody className="bg-white divide-y divide-slate-200">
								{loading ? (
									<tr>
										<td colSpan={5} className="text-center py-12 text-slate-500">
											Loading users...
										</td>
									</tr>
								) : users.length === 0 ? (
									<tr>
										<td colSpan={5} className="text-center py-12 text-slate-500">
											No users found.
										</td>
									</tr>
								) : (
									users.map((user) => (
										<tr key={user.id}>
											<td className="px-6 py-4 whitespace-nowrap">
												<div className="flex items-center gap-3">
													<img className="h-10 w-10 rounded-full object-cover" src={user.avatar || `https://ui-avatars.com/api/?name=${user.name.replace(' ', '+')}`} alt={user.name} />
													<div>
														<div className="text-sm font-medium text-slate-900">{user.name}</div>
														<div className="text-xs text-slate-500">@{user.username}</div>
													</div>
												</div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<Badge variant="secondary">{user.role}</Badge>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<Badge variant={user.emailVerified ? 'success' : 'warning'}>{user.emailVerified ? 'Verified' : 'Not Verified'}</Badge>
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{user.dateJoined}</td>
											<td className="px-6 py-4 whitespace-nowrap text-right">
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button variant="ghost" size="icon">
															<i className="ri-more-2-fill"></i>
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align="end">
														<DropdownMenuItem onClick={() => handleViewUser(user)}>View Details</DropdownMenuItem>
														<DropdownMenuItem onClick={() => handleEditUser(user)}>Edit User</DropdownMenuItem>
														<DropdownMenuItem onClick={() => handleDeleteUser(user)} className="text-red-600">
															Delete User
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</td>
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>
				</CardContent>
				{totalPages > 1 && (
					<CardFooter className="justify-between items-center">
						<p className="text-sm text-slate-500">
							Showing page {currentPage} of {totalPages}
						</p>
						<div className="flex items-center gap-2">
							<Button variant="outline" size="icon" onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
								<i className="ri-arrow-left-s-line"></i>
							</Button>
							<Button variant="outline" size="icon" onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages}>
								<i className="ri-arrow-right-s-line"></i>
							</Button>
						</div>
					</CardFooter>
				)}
			</Card>
			<ConfirmationModal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} onConfirm={confirmDelete} title="Delete User" message={`Are you sure you want to delete ${selectedUser?.name}?`} confirmVariant="destructive" loading={deleteLoading} />
			{selectedUser && <UserEditModal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} user={selectedUser} onUserUpdated={handleUserAdded} />}
			<UserAddModal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} countries={countries.countries} onUserAdded={handleUserAdded} />
			{selectedUser && <UserViewModal isOpen={viewModalOpen} onClose={() => setViewModalOpen(false)} user={selectedUser} />}
		</div>
	);
}
