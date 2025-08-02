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
		<div className="min-h-screen bg-gradient-to-br from-primary to-secondary flex flex-col items-center justify-center py-20 space-y-4">
			<Logo alt={`${getPlatformName()} Logo`} size="lg" variant="dark" />
			<div className="w-full max-w-md text-center space-y-2">
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
		setTimeout(() => setShowContent(true), 400);
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
		<div className="min-h-screen bg-gradient-to-br from-primary to-secondary flex items-center justify-center p-4 sm:p-8">
			<div className="container flex flex-col lg:flex-row gap-8">
				<div className="lg:w-1/3 bg-neutral-dark text-white p-8 rounded-lg shadow-xl flex flex-col justify-center">
					<h1 className="text-3xl font-bold mb-4">Email Verification</h1>
					<p className="text-neutral-light">Check the status of your email verification for Monidoublagambia.</p>
				</div>
				<div className="lg:w-2/3 card">
					<div className="text-center mb-8">
						<h2 className="text-2xl font-bold">{title}</h2>
						<p className="text-text-secondary">{statusMessage}</p>
					</div>
					{pageStatus === 'expired' && (
						<form onSubmit={handleResendSubmit} className="space-y-6">
							<div>
								<label htmlFor="emailForResend" className="label">
									Email Address
								</label>
								<input type="email" id="emailForResend" name="emailForResend" value={emailForResend} onChange={(e) => setEmailForResend(e.target.value)} className="input" placeholder="Enter your email" />
							</div>
							<Button type="submit" className="button button-primary w-full" disabled={isResending}>
								{isResending ? 'Resending...' : 'Resend Verification Email'}
							</Button>
						</form>
					)}
					{pageStatus === 'error' && (
						<Button onClick={() => router.push('/auth/login')} className="button button-primary w-full">
							Back to Login
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
