'use client';

import { useRouter } from 'next/navigation';
import { Button } from './button';
import { cn } from '@/lib/utils';
import { clearLoggedInAsUser, getLoggedInAsUser } from '@/lib/helpers';
import nProgress from 'nprogress';
import { toast } from 'sonner';
import { useState } from 'react';

export default function LoggedInAs() {
	const [logginOut, setLogginOut] = useState(false);
	const isAdmin = getLoggedInAsUser();
	const router = useRouter();

	const endSession = async () => {
		if (typeof window !== 'undefined') {
			const toastId = toast.info('Returning to your admin account...');
			setLogginOut(true);
			fetch('/api/auth/clear-session', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
			})
				.then(async (res) => {
					if (!res.ok) {
						const data = await res.json().catch(() => ({}));
						throw new Error(data.message || 'Failed to log out');
					}
					toast.success('Returned to admin successfully!', { id: toastId });
					clearLoggedInAsUser();
					nProgress.start();
					router.replace('/admin');
				})
				.catch((err) => {
					toast.error(err.message || 'Failed to log out', { id: toastId });
				})
				.finally(() => {
					setLogginOut(false);
				});
		}
	};

	if (!isAdmin || !isAdmin?.user || !isAdmin?.user.user_metadata) {
		return null;
	}

	return (
		<div className="fixed top-0 left-0 right-0 z-50 bg-amber-100 border-b border-amber-200" role="alert">
			<div className="container mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex items-center justify-between h-12">
					<div className="flex items-center gap-3">
						<i className="ri-spy-line text-lg text-amber-700"></i>
						<p className="text-sm text-amber-800">
							You are currently logged in as <b className="font-semibold">{`${isAdmin?.user?.user_metadata.name}`}</b>.
						</p>
					</div>
					<Button onClick={endSession} variant="ghost" size="sm" disabled={logginOut} className="text-amber-700 hover:bg-amber-200 hover:text-amber-800">
						{logginOut ? 'Returning...' : 'Return to Admin'}
					</Button>
				</div>
			</div>
		</div>
	);
}
