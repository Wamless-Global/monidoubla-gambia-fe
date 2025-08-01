'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { getPlatformName, handleFetchMessage } from '@/lib/helpers';
import { CustomLink } from '@/components/CustomLink';
import { Skeleton } from '@/components/Skeleton';
import Logo from '@/components/Logo';
import { resendVerificationEmail } from '@/lib/auth';

function parseFragmentParams() {
	if (typeof window === 'undefined') return {};
	const hash = window.location.hash.substring(1);
	return Object.fromEntries(new URLSearchParams(hash));
}

function ProjectSkeletonLoader() {
	return (
		<div className="auth-page flex flex-col items-center justify-center py-20 space-y-4">
			<Logo alt={`${getPlatformName()} Logo`} size="lg" variant="dark" />
			<div className="w-full max-w-md text-center space-y-2 mt-5">
				<Skeleton className="mb-2 h-8 w-full md:w-96 mx-auto" />
				<Skeleton className="mb-2 h-8 w-full md:w-98 mx-auto" />
				<Skeleton className="mb-8 h-4 w-64 mx-auto" />
			</div>
		</div>
	);
}

export default function VerifyEmailStatusPageContent() {
	const router = useRouter();
	const searchParams = useSearchParams();

	const [pageStatus, setPageStatus] = useState<'loading' | 'success' | 'expired' | 'error'>('loading');
	const [statusMessage, setStatusMessage] = useState('');
	const [emailForResend, setEmailForResend] = useState('');
	const [isResending, setIsResending] = useState(false);
	const [showContent, setShowContent] = useState(false);

	useEffect(() => {
		const params = Object.fromEntries(searchParams.entries());
		let error = params.error;
		let errorDesc = params.error_description;
		let errorCode = params.error_code;

		if (!error && typeof window !== 'undefined' && window.location.hash) {
			const fragParams = parseFragmentParams();
			error = fragParams.error;
			errorDesc = fragParams.error_description;
			errorCode = fragParams.error_code;
			if (error || errorDesc || errorCode) {
				const query = new URLSearchParams(fragParams).toString();
				router.replace(`${window.location.pathname}?${query}`);
			}
		}

		if (error) {
			const desc = errorDesc || 'An unknown error occurred during verification.';
			if (desc.toLowerCase().includes('expired') || error === 'access_denied' || errorCode === 'otp_expired' || desc.toLowerCase().includes('invalid')) {
				setPageStatus('expired');
				setStatusMessage(desc);
				toast.error(desc);
			} else {
				setPageStatus('error');
				setStatusMessage(desc);
				toast.error(desc);
			}
		} else {
			setPageStatus('success');
			setStatusMessage('Your email address has been successfully verified. You can now log in.');
			toast.success('Email verified successfully!');
			setTimeout(() => router.replace('/auth/login'), 4000);
		}
		// Prevent content flash
		setTimeout(() => setShowContent(true), 400);
		// eslint-disable-next-line
	}, [searchParams, router]);

	const title = pageStatus === 'success' ? 'Email Verified Successfully!' : pageStatus === 'expired' ? 'Verification Link Expired' : pageStatus === 'error' ? 'Email Verification Failed' : 'Email Verification Status';

	const handleResendSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		if (!emailForResend) {
			toast.error('Please enter your email address.');
			return;
		}
		setIsResending(true);
		setStatusMessage(`Attempting to resend verification email to ${emailForResend}...`);

		try {
			const result = await resendVerificationEmail(emailForResend);
			if (result.success) {
				toast.success(result.message || `Verification email resent to ${emailForResend}.`);
				setStatusMessage(result.message || `Verification email resent to ${emailForResend}. Please check your inbox.`);
			} else {
				toast.error(result.message || 'Failed to resend verification email.');
				setStatusMessage(result.message || 'Failed to resend verification email. Please try again or contact support.');
			}
		} catch (err) {
			const errorMessage = handleFetchMessage(err);
			toast.error(errorMessage);
			setStatusMessage(errorMessage);
		} finally {
			setIsResending(false);
		}
	};

	if (!showContent) {
		return <ProjectSkeletonLoader />;
	}

	if (pageStatus === 'loading') {
		return <ProjectSkeletonLoader />;
	}

	return (
		<div className="min-h-screen bg-gray-100 flex items-center justify-center px-2 py-10 sm:p-16">
			<div className="w-full">
				<div className="max-w-md w-full mx-auto">
					<div className="bg-white rounded-lg shadow-lg p-8">
						<div className="text-center mb-8">
							<h1 className="text-2xl font-bold text-gray-900 mb-2">Email Status</h1>
							<p className="text-gray-600">{statusMessage}</p>
						</div>
						{pageStatus === 'error' && (
							<Button onClick={() => router.push('/auth/login')} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium">
								Back to Login
							</Button>
						)}
						{pageStatus === 'expired' && (
							<Button onClick={handleResendSubmit} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium" disabled={isResending}>
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
