import { fetchWithAuth } from './fetchWithAuth';
import { clearLoggedInAsUser, getSetCookie, handleFetchMessage } from './helpers';
import { logger } from './logger';
import { createClient } from '@supabase/supabase-js';
import { removeCurrentUser } from './userUtils';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const logout = async (): Promise<void> => {
	try {
		if (getSetCookie()) {
			const response = await fetchWithAuth('/api/auth/clear-session', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
			});

			if (!response.ok) {
				let errorMessage = `Logout API failed: ${response.statusText || 'Unknown error'}`;
				try {
					const errorData = await response.json();
					errorMessage = handleFetchMessage(errorData, errorMessage);
				} catch (_parseError) {}
				throw new Error(errorMessage);
			}
		}

		const response = await fetchWithAuth(`/api/auth/logout`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
		});

		if (!response.ok) {
			let errorMessage = `Logout API failed: ${response.statusText || 'Unknown error'}`;
			try {
				const errorData = await response.json();
				errorMessage = errorData.message || errorMessage;
			} catch (_parseError) {}
			throw new Error(errorMessage);
		}

		await supabase.auth.signOut();

		logger.log('AuthContext: Logout successful via API.');
		if (typeof window !== 'undefined') {
			localStorage.removeItem('currency');
			localStorage.removeItem('settings');
			removeCurrentUser();
			clearLoggedInAsUser();
		}
	} catch (err) {
		throw err;
	} finally {
	}
};

export const resendVerificationEmail = async (email: string): Promise<{ success: boolean; message: string | null }> => {
	if (!email) {
		console.error('AuthContext: resendVerificationEmail called with no email.');
		return { success: false, message: 'No email provided for resending verification.' };
	}
	try {
		const response = await fetchWithAuth('/api/auth/resend-email-verification', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ email }),
		});

		const responseData = await response.json();

		if (!response.ok) {
			const errorMessage = responseData?.message || `Failed to resend verification email: ${response.statusText || 'Unknown HTTP error'}`;
			console.error('AuthContext: Resend verification email API HTTP error:', errorMessage, `Status: ${response.status}`);
			return { success: false, message: errorMessage };
		}

		if (responseData.status === 'success') {
			logger.log('AuthContext: Resend verification email request successful for', email);
			return { success: true, message: responseData.message || 'Verification email resent successfully.' };
		} else {
			const errorMessage = responseData?.message || 'Backend indicated an issue with resending the email.';
			console.warn('AuthContext: Resend verification email backend issue:', errorMessage);
			return { success: false, message: errorMessage };
		}
	} catch (err: unknown) {
		const errorMessage = handleFetchMessage(err, 'An unknown error occurred while checking email status.', null, false);
		return { success: false, message: errorMessage };
	}
};

export const checkEmailVerificationStatus = async (email: string): Promise<{ status: 'verified' | 'not_verified' | 'error' | 'not_found'; message: string | null }> => {
	if (!email) {
		console.error('AuthContext: checkEmailVerificationStatus called with no email.');
		return { status: 'error', message: 'No email provided to check status.' };
	}
	try {
		const response = await fetchWithAuth(`/api/auth/check-email-verification?email=${encodeURIComponent(email)}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		});

		const responseData = await response.json();

		if (!response.ok) {
			const errorMessage = responseData?.message || responseData?.data?.message || `Failed to check email status: ${response.statusText || 'Unknown HTTP error'}`;
			console.error('AuthContext: Check email status API HTTP error:', errorMessage, `Status: ${response.status}`);
			if (response.status === 404) return { status: 'not_found', message: responseData?.data?.message || responseData?.message || 'Email address not found.' };
			return { status: 'error', message: errorMessage };
		}

		if (responseData.status === 'success' && responseData.data && typeof responseData.data.isVerified === 'boolean') {
			const { isVerified, message } = responseData.data;
			if (isVerified) {
				return { status: 'verified', message: message || 'Email is verified.' };
			} else {
				return { status: 'not_verified', message: message || 'Email is not verified.' };
			}
		} else if (responseData.status === 'error' && responseData.message) {
			return { status: 'error', message: responseData.message };
		} else {
			return { status: 'error', message: 'Unexpected response from server.' };
		}
	} catch (err: unknown) {
		let message = 'An unknown error occurred while checking email status.';
		if (typeof err === 'object' && err !== null) {
			if ('message' in err && typeof err.message === 'string') {
				message = err.message;
			}
		}
		return { status: 'error', message };
	}
};
