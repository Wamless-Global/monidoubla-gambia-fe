'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { logout } from '@/lib/auth';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { adminLoginRequest, getLoggedInAsUser, getSetCookie } from '@/lib/helpers';
import { logger } from '@/lib/logger';
import { LocalUser, removeCurrentUser, setCurrentUser } from '@/lib/userUtils';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function LoggingInPage() {
	const [loggingIn, setLoggingIn] = useState(false);
	const router = useRouter();

	const signIn = () => {
		const { access_token, refresh_token, expires_at, expires_in } = getLoggedInAsUser();
		if (!access_token) {
			toast.error('No access token found. Please try logging in again.');
			return;
		}
		const toastId = toast.info('Completing login...');
		setLoggingIn(true);
		fetch('/api/auth/set-session', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ access_token, refresh_token, expires_at, expires_in }),
		})
			.then(async (res) => {
				const data = await res.json().catch(() => ({}));
				if (!res.ok) {
					throw new Error(data.message || 'Failed to set session.');
				}

				const checkUserSession = async () => {
					try {
						const response = await fetchWithAuth('/api/auth/verify-me');
						if (!response.ok) {
							throw new Error(`Failed to verify user session: ${response.statusText}`);
						}

						const sessionData = await response.json();

						if (sessionData.status === 'success' && sessionData.data?.user) {
							setCurrentUser(sessionData.data.user as LocalUser);
							router.replace('/user');
						} else {
							throw new Error(`Failed to verify user session: ${response.statusText}`);
						}
					} catch {
						logger.error(`An error occurred when logging you in`);
						removeCurrentUser();
						await logout();
					}
				};

				checkUserSession();

				toast.success('Login as user completed!', { id: toastId });
				// router.replace(window.location.pathname + window.location.search);
				localStorage.setItem('sb-auth-cookie-set', JSON.stringify(true));
			})
			.catch((err) => {
				setLoggingIn(true);
				toast.error(err.message || 'Failed to set session.', { id: toastId });
			});
	};

	useEffect(() => {
		if (!getSetCookie() && adminLoginRequest()) {
			logger.log('No set-cookie and admin login request found');
			if (!loggingIn) {
				const timer = setTimeout(() => {
					signIn();
				}, 2000);
				return () => clearTimeout(timer);
			}
		} else {
			logger.log('Set-cookie found or not an admin login request');
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
			<Card className="max-w-md w-full text-center p-8">
				<CardHeader>
					<div className="mx-auto w-16 h-16 flex items-center justify-center bg-indigo-100 rounded-full mb-4">
						<i className="ri-loader-4-line text-3xl text-indigo-600 animate-spin"></i>
					</div>
					<CardTitle className="text-xl font-bold text-slate-800">Secure Sign-In in Progress</CardTitle>
					<CardDescription>Please wait while we log you into the user's account. You will be redirected shortly.</CardDescription>
				</CardHeader>
			</Card>
		</div>
	);
}
