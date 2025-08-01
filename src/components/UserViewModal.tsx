'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { sendPasswordResetLink, resendVerificationEmail } from '@/lib/userUtils';
import { CustomLink } from './CustomLink';

interface User {
	id: string;
	name: string;
	username: string;
	email: string;
	role: string;
	location: string;
	dateJoined: string;
	avatar?: string;
	emailVerified?: boolean;
}

interface UserViewModalProps {
	isOpen: boolean;
	onClose: () => void;
	user: User | null;
}

export function UserViewModal({ isOpen, onClose, user }: UserViewModalProps) {
	const [resetPasswordLoading, setResetPasswordLoading] = useState(false);
	const [verifyEmailLoading, setVerifyEmailLoading] = useState(false);

	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = 'unset';
		}

		return () => {
			document.body.style.overflow = 'unset';
		};
	}, [isOpen]);

	const handleResetPassword = async () => {
		if (!user) return;
		setResetPasswordLoading(true);
		await sendPasswordResetLink(user.email);
		setResetPasswordLoading(false);
	};

	const handleVerifyEmail = async () => {
		if (!user) return;
		setVerifyEmailLoading(true);
		await resendVerificationEmail(user.email);
		setVerifyEmailLoading(false);
	};

	if (!isOpen || !user) return null;

	return (
		<>
			<div className="fixed inset-0 bg-black bg-opacity-50 z-50 !mt-0" onClick={onClose} />

			<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
					<div className="p-6">
						<div className="flex items-center justify-between mb-6">
							<h3 className="text-lg font-semibold text-gray-900 dark:text-white">User Details</h3>
							<button onClick={onClose} disabled={resetPasswordLoading || verifyEmailLoading} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50">
								<i className="ri-close-line w-5 h-5 flex items-center justify-center text-gray-600 dark:text-gray-400"></i>
							</button>
						</div>

						<div className="space-y-4">
							<div className="flex items-center gap-4 mb-6">
								<div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
									<span className="text-white font-bold text-xl">{user.name.charAt(0)}</span>
								</div>
								<div>
									<h4 className="text-lg font-semibold text-gray-900 dark:text-white">{user.name}</h4>
									<p className="text-gray-600 dark:text-gray-400">@{user.username}</p>
								</div>
							</div>

							<div className="grid grid-cols-1 gap-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
									<div className="flex items-center gap-2">
										<p className="text-gray-900 dark:text-white text-sm">{user.email}</p>
										<span className={`px-2 py-1 rounded-full text-xs font-medium ${user.emailVerified ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'}`}>
											{user.emailVerified ? 'Verified' : 'Not Verified'}
										</span>
									</div>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
									<p className="text-gray-900 dark:text-white text-sm">{user.role}</p>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date Joined</label>
									<p className="text-gray-900 dark:text-white text-sm">{user.dateJoined}</p>
								</div>
							</div>

							{/* Email Verification */}
							{!user.emailVerified && (
								<div className="border-t border-gray-200 dark:border-gray-700 pt-4">
									<h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Email Verification</h4>
									<Button onClick={handleVerifyEmail} disabled={verifyEmailLoading || resetPasswordLoading} className="w-full bg-green-600 hover:bg-green-700 text-white whitespace-nowrap mb-3">
										{verifyEmailLoading ? (
											<div className="flex items-center gap-2">
												<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
												<span>Verifying Email...</span>
											</div>
										) : (
											<>
												<i className="ri-shield-check-line w-4 h-4 flex items-center justify-center mr-2"></i>
												Verify Email Address
											</>
										)}
									</Button>
								</div>
							)}

							{/* Password Actions */}
							<div className="border-t border-gray-200 dark:border-gray-700 pt-4">
								<h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Password Actions</h4>
								<Button
									onClick={handleResetPassword}
									disabled={resetPasswordLoading || verifyEmailLoading}
									variant="outline"
									className="w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 whitespace-nowrap mb-3"
								>
									{resetPasswordLoading ? (
										<div className="flex items-center gap-2">
											<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
											<span>Sending Reset Link...</span>
										</div>
									) : (
										<>
											<i className="ri-mail-send-line w-4 h-4 flex items-center justify-center mr-2"></i>
											Send Password Reset Link
										</>
									)}
								</Button>
							</div>

							<div className="flex gap-3 pt-4">
								<CustomLink href={`/admin/users/${user.username}`} className="flex-1">
									<Button variant="outline" className="w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 whitespace-nowrap">
										<i className="ri-eye-line w-4 h-4 flex items-center justify-center mr-2"></i>
										View Full Profile
									</Button>
								</CustomLink>
								<Button onClick={onClose} disabled={resetPasswordLoading || verifyEmailLoading} className="bg-blue-600 hover:bg-blue-700 text-white whitespace-nowrap">
									Close
								</Button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
