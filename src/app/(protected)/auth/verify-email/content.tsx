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
		<div className="min-h-screen bg-gradient-to-br from-primary to-secondary flex items-center justify-center p-4 sm:p-8">
			<div className="container flex flex-col lg:flex-row gap-8">
				<div className="lg:w-1/3 bg-neutral-dark text-white p-8 rounded-lg shadow-xl flex flex-col justify-center auth-img">
					<h1 className="text-3xl font-bold mb-4">Verify Your Email</h1>
					<p className="text-neutral-light">Complete your signup by verifying your email address.</p>
				</div>
				<div className="lg:w-2/3 card">
					<div className="text-center mb-8">
						<h2 className="text-2xl font-bold">Verify Email</h2>
						<p className="text-text-secondary">{statusMessage}</p>
					</div>
					{allowResend && (
						<Button onClick={handleResendEmail} className="button button-primary w-full" disabled={isResending}>
							{isResending ? 'Resending...' : 'Resend Verification Email'}
						</Button>
					)}
					<div className="mt-6 text-center">
						<p className="text-sm text-text-secondary">
							Back to{' '}
							<CustomLink href="/auth/login" className="text-primary hover:text-secondary font-medium">
								Sign in
							</CustomLink>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
