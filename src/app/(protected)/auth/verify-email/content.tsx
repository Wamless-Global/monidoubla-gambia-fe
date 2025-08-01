'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { handleFetchMessage } from '@/lib/helpers';
import nProgress from 'nprogress';
import { CustomLink } from '@/components/CustomLink';
import { resendVerificationEmail } from '@/lib/auth';

export default function VerifyEmailContent({ email, initialStatus }: { email?: string; initialStatus: { status: string; message: string } }) {
	const router = useRouter();
	const [statusMessage, setStatusMessage] = useState(initialStatus.message || '');
	const [isResending, setIsResending] = useState(false);
	const [allowResend, setAllowResend] = useState(initialStatus.status === 'not_verified');

	useEffect(() => {
		if (initialStatus.status === 'verified') {
			nProgress.start();
			toast.success(initialStatus.message || 'Email is verified.');
			setTimeout(() => router.push('/auth/login'), 4000);
		} else if (initialStatus.status === 'not_found' || initialStatus.status === 'error') {
			nProgress.start();
			toast.error(initialStatus.message || 'Email address not found.');
			setTimeout(() => router.push('/auth/login'), 4000);
		}
	}, [initialStatus, router]);

	const handleResendEmail = async () => {
		if (!email) {
			toast.error('Could not determine email for resending verification.');
			return;
		}
		setIsResending(true);
		setStatusMessage(`Resending verification email to ${email}...`);
		try {
			const result = await resendVerificationEmail(email);
			if (result.success) {
				toast.success(result.message || 'Verification email resent successfully!');
				setStatusMessage(result.message || 'Verification email resent. Please check your inbox.');
				setAllowResend(false);
			} else {
				toast.error(result.message || 'Failed to resend verification email.');
				setStatusMessage(result.message || 'Failed to resend. Please try again or contact support.');
			}
		} catch (err) {
			const errorMessage = handleFetchMessage(err);
			toast.error(errorMessage);
			setStatusMessage(errorMessage);
		} finally {
			setIsResending(false);
		}
	};

	return (
		<div className="min-h-screen bg-gray-100 flex items-center justify-center px-2 py-10 sm:p-16">
			<div className="w-full">
				<div className="max-w-md w-full mx-auto">
					<div className="bg-white rounded-lg shadow-lg p-8">
						<div className="text-center mb-8">
							<h1 className="text-2xl font-bold text-gray-900 mb-2">Verify Email</h1>
							<p className="text-gray-600">{statusMessage}</p>
						</div>
						{allowResend && (
							<Button onClick={handleResendEmail} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium" disabled={isResending}>
								{isResending ? 'Resending...' : 'Resend Verification Email'}
							</Button>
						)}
						<div className="mt-6 text-center">
							<p className="text-sm text-gray-600">
								Back to{' '}
								<CustomLink href="/auth/login" className="text-blue-600 hover:text-blue-500 font-medium">
									Sign in
								</CustomLink>
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
