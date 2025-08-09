'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { sendPasswordResetLink, resendVerificationEmail } from '@/lib/userUtils';
import { CustomLink } from './CustomLink';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// NOTE: All original interfaces and logic are preserved.
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
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-in fade-in-0 !m-0">
			<Card className="max-w-md w-full bg-white shadow-lg border-slate-200 animate-in fade-in-0 zoom-in-95">
				<CardHeader className="text-center">
					<div className="flex justify-center mb-4">
						<img src={user.avatar || `https://ui-avatars.com/api/?name=${user.name.replace(' ', '+')}&background=E0E7FF&color=4338CA`} alt={user.name} className="w-20 h-20 rounded-full object-cover" />
					</div>
					<CardTitle className="text-xl">{user.name}</CardTitle>
					<CardDescription>@{user.username}</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4 pt-2">
					<div className="grid grid-cols-2 gap-4 text-sm p-4 bg-slate-50 rounded-lg">
						<div>
							<p className="text-slate-500">Role</p>
							<p className="font-medium text-slate-800">{user.role}</p>
						</div>
						<div>
							<p className="text-slate-500">Joined</p>
							<p className="font-medium text-slate-800">{user.dateJoined}</p>
						</div>
						<div className="col-span-2">
							<p className="text-slate-500">Email</p>
							<p className="font-medium text-slate-800 flex items-center gap-2">
								{user.email} <Badge variant={user.emailVerified ? 'success' : 'warning'}>{user.emailVerified ? 'Verified' : 'Pending'}</Badge>
							</p>
						</div>
					</div>
					<div className="space-y-2 pt-4 border-t">
						{!user.emailVerified && (
							<Button onClick={handleVerifyEmail} disabled={verifyEmailLoading} variant="outline" className="w-full">
								{verifyEmailLoading ? 'Sending...' : 'Send Verification Email'}
							</Button>
						)}
						<Button onClick={handleResetPassword} disabled={resetPasswordLoading} variant="outline" className="w-full">
							{resetPasswordLoading ? 'Sending...' : 'Send Password Reset'}
						</Button>
					</div>
				</CardContent>
				<CardFooter className="justify-end">
					<Button onClick={onClose}>Close</Button>
				</CardFooter>
			</Card>
		</div>
	);
}
