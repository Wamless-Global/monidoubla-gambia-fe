import { fetchWithAuth } from '@/lib/fetchWithAuth';
import VerifyEmailContent from './content';
import { cookies } from 'next/headers';
import { logger } from '@/lib/logger';
import { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Verify Your Email',
};

async function checkEmailVerificationStatusServer(email: string) {
	try {
		const cookieStore = await cookies();
		const cookieHeader = cookieStore.toString();
		const baseUrl = process.env.API_BASE_URL;
		const url = `${baseUrl}/auth/check-email-verification?email=${encodeURIComponent(email)}`;

		logger.log('Check email verification URL: ', url);

		const res = await fetchWithAuth(url, {
			headers: { Cookie: cookieHeader },
			cache: 'no-store',
		});

		const data = await res.json();
		if (!res.ok) {
			return {
				status: data?.status || 'error',
				message: data?.message || 'Failed to check email status.',
			};
		}
		if (data.status === 'success' && typeof data.data?.isVerified === 'boolean') {
			return {
				status: data.data.isVerified ? 'verified' : 'not_verified',
				message: data.data.message || (data.data.isVerified ? 'Email is verified.' : 'Email is not verified.'),
			};
		}
		return { status: 'error', message: data?.message || 'Unexpected response.' };
	} catch (err: any) {
		return { status: 'error', message: err?.message || 'Server error.' };
	}
}

// Update to support async searchParams for Next.js 15+
export default async function Page({ searchParams }: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
	const params = await searchParams;
	const email = params?.email;
	let verificationResult = { status: 'error', message: 'No email provided.' };

	if (email) {
		verificationResult = await checkEmailVerificationStatusServer(email);
	}

	return (
		<>
			<VerifyEmailContent email={email} initialStatus={verificationResult} />
		</>
	);
}
