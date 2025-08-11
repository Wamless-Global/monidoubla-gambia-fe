import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { handleFetchMessage } from '@/lib/helpers';
import { User as DbUser } from '@/types';
import type { User } from '@/app/(protected)/admin/users/content';

// Manual email verification for admin
export const verifyEmail = async (userId: string): Promise<{ success: boolean; message: string | null }> => {
	if (!userId) {
		logger.error('verifyEmail called with no userId.');
		return { success: false, message: 'No user ID provided for email verification.' };
	}
	try {
		const response = await fetchWithAuth(`/api/users/${userId}/verify-email`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
		});
		const responseData = await response.json();

		if (!response.ok) {
			const errorMessage = handleFetchMessage(responseData?.message, `Failed to verify email: ${response.statusText || 'Unknown HTTP error'}`);
			logger.error('Verify email API HTTP error:', errorMessage, `Status: ${response.status}`);
			return { success: false, message: errorMessage };
		}
		if (responseData.status === 'success') {
			logger.log('Email verification request successful for', userId);
			toast.success(responseData.message || 'Email verified successfully.');
			return { success: true, message: responseData.message || 'Email verified successfully.' };
		} else {
			const errorMessage = responseData?.message || 'Backend indicated an issue with verifying the email.';
			logger.warn('Verify email backend issue:', errorMessage);
			return { success: false, message: errorMessage };
		}
	} catch (err) {
		const errorMessage = handleFetchMessage(err, 'An unknown error occurred while verifying email.', null, false);
		logger.error('Error in verifyEmail:', errorMessage);
		return { success: false, message: errorMessage };
	}
};

// Fetch a user by their username
export const fetchUserByUsername = async (username: string, token?: string): Promise<DbUser | null> => {
	if (!username) {
		logger.error('fetchUserByUsername called with no username.');
		return null;
	}
	const targetUrl = `/api/users/username/${username}`;
	try {
		logger.log(`Fetching user ${username} directly from backend: ${targetUrl}`);
		const response = await fetchWithAuth(
			targetUrl,
			{
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
			},
			token
		);
		if (response.ok) {
			const { data } = await response.json();
			return data as DbUser;
		} else if (response.status === 404) {
			return null;
		} else {
			const errorBody = await response.text();
			logger.error(`Backend API Error (${targetUrl}): ${response.status} ${response.statusText}`, errorBody);
			return null;
		}
	} catch (error) {
		if (error instanceof SyntaxError && (error.message.includes('JSON') || error.message.includes('token'))) {
			toast.error('Server unavailable. Please try again later.');
		} else if (error instanceof Error) {
			toast.error(`An error occurred while fetching user data: ${error.message}`);
		} else {
			toast.error('An unknown error occurred while fetching user data.');
		}
		return null;
	}
};

export type AddUser = { password: string; confirmPassword: string; name: string; email: string; role: string; country: string; emailVerified: boolean };

export async function editUser(updatedUser: User): Promise<{ success: boolean }> {
	if (!updatedUser.id) {
		toast.error('User ID is missing. Cannot update user.');
		return { success: false };
	}
	const userData = {
		...updatedUser,
		roles: [updatedUser.role?.toLocaleLowerCase?.() || updatedUser.role],
	};
	if ('location' in userData) {
		delete (userData as any).location;
	}
	try {
		const targetUrl = `/api/users/${updatedUser.id}`;
		const response = await fetchWithAuth(targetUrl, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(userData),
		});
		if (response.ok) {
			toast.success('User updated successfully');
			return { success: true };
		} else {
			const errorBody = await response.json();
			const errorMessage = handleFetchMessage(errorBody?.message || 'Failed to update user.');
			logger.error(`Backend API Error (PUT ${targetUrl}): ${response.status} ${response.statusText}`, errorBody);
			toast.error(errorMessage);
			return { success: false };
		}
	} catch (error) {
		toast.error(handleFetchMessage(error, 'An error occurred while updating the user.'));
		return { success: false };
	}
}

// --- Local Storage Helpers for currentUser ---

export interface LocalUser {
	id: string;
	name: string;
	email: string;
	username: string;
	avatar_url?: string;
	roles: string[];
	registrationDate?: string;
	email_status?: string;
	status?: string;
	country?: string;
	phone_number?: string | null;
	referral_id?: string | null;
	fiat_name?: string;
	fiat_code?: string;
	fiat_symbol?: string;

	agreed_to_ph_terms?: boolean;
	agreed_to_gh_terms?: boolean;

	momo_number?: string | null;
	momo_name?: string | null;
	momo_provider?: string | null;
}

/**
 * Get the current user from localStorage (key: 'currentUser').
 * Returns null if not found or invalid.
 */
export function getCurrentUser(): LocalUser | null {
	if (typeof window === 'undefined') return null;
	try {
		const raw = localStorage.getItem('currentUser');
		if (!raw) return null;
		return JSON.parse(raw) as LocalUser;
	} catch (e) {
		logger.error('Failed to parse currentUser from localStorage', e);
		return null;
	}
}

/**
 * Set the current user in localStorage (key: 'currentUser').
 */
export function setCurrentUser(user: LocalUser): void {
	if (typeof window === 'undefined') return;
	try {
		localStorage.setItem('currentUser', JSON.stringify(user));
	} catch (e) {
		logger.error('Failed to set currentUser in localStorage', e);
	}
}

/**
 * Remove the current user from localStorage (key: 'currentUser').
 */
export function removeCurrentUser(): void {
	if (typeof window === 'undefined') return;
	try {
		localStorage.removeItem('currentUser');
	} catch (e) {
		logger.error('Failed to remove currentUser from localStorage', e);
	}
}

export async function addUser(newUser: AddUser): Promise<{ success: boolean; user?: any }> {
	try {
		const response = await fetchWithAuth('/api/auth/register', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(newUser),
		});
		if (response.ok) {
			return { success: true, user: await response.json() };
		} else {
			const errorBody = await response.json();
			const errorMessage = handleFetchMessage(errorBody?.message || 'Failed to add user.');
			logger.error('Backend API Error (POST /api/auth/register):', errorBody);
			toast.error(errorMessage);
			return { success: false };
		}
	} catch (error) {
		toast.error(handleFetchMessage(error, 'An error occurred while adding the user.'));
		return { success: false };
	}
}

export async function deleteUser(userId: string): Promise<{ success: boolean }> {
	if (!userId) {
		toast.error('User ID is missing. Cannot delete user.');
		return { success: false };
	}
	try {
		const response = await fetchWithAuth(`/api/users/${userId}`, {
			method: 'DELETE',
		});
		if (response.ok) {
			toast.success('User deleted successfully');
			return { success: true };
		} else {
			const errorBody = await response.json();
			const errorMessage = handleFetchMessage(errorBody?.message || 'Failed to delete user.');
			logger.error('Backend API Error (DELETE /api/users):', errorBody);
			toast.error(errorMessage);
			return { success: false };
		}
	} catch (error) {
		toast.error(handleFetchMessage(error, 'An error occurred while deleting the user.'));
		return { success: false };
	}
}

export async function loginAsUser(userId: string): Promise<{ success: boolean; link?: string }> {
	if (!userId) {
		toast.error('User ID is missing. Cannot impersonate user.');
		return { success: false };
	}
	try {
		const response = await fetchWithAuth(`/api/users/${userId}/impersonate`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
		});
		const data = await response.json();
		if (!response.ok) {
			throw new Error(data.message || 'Failed to log in as user.');
		}
		if (data.status === 'success' && data.data?.link && data.data?.user) {
			if (typeof window !== 'undefined') {
				localStorage.setItem(`admin-login-request`, JSON.stringify(true));
			}
			logger.info('Impersonation response data:', data);
			toast.success("Successfully retrieved user's information");
			return { success: true, link: data.data.link };
		} else {
			logger.error('Impersonation response did not contain expected data:', data);
			throw new Error('No token or user received from impersonation endpoint.');
		}
	} catch (err) {
		logger.error('Error during user impersonation:', err);
		const errorMessage = handleFetchMessage(err, 'Failed to log in as user.');
		toast.error(errorMessage);
		return { success: false };
	}
}

export async function sendPasswordResetLink(email: string): Promise<{ success: boolean }> {
	if (!email) {
		toast.error('No email provided for password reset.');
		return { success: false };
	}
	try {
		const response = await fetchWithAuth('/api/auth/request-password-reset', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ email }),
		});
		const data = await response.json();
		if (!response.ok) {
			throw new Error(data.message || 'Failed to send password reset link');
		}
		toast.success(`Password reset link sent to ${email}`);
		return { success: true };
	} catch (error) {
		logger.error('Failed to send password reset link', error);
		toast.error(handleFetchMessage(error, 'Failed to send password reset link'));
		return { success: false };
	}
}

export async function resendVerificationEmail(email: string): Promise<{ success: boolean }> {
	if (!email) {
		toast.error('No email provided for resending verification.');
		return { success: false };
	}
	try {
		const response = await fetchWithAuth('/api/auth/resend-email-verification', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ email }),
		});
		const responseData = await response.json();
		if (!response.ok) {
			const errorMessage = responseData?.message || `Failed to resend verification email: ${response.statusText || 'Unknown HTTP error'}`;
			logger.error('Resend verification email API HTTP error:', errorMessage, `Status: ${response.status}`);
			toast.error(errorMessage);
			return { success: false };
		} else if (responseData.status === 'success') {
			logger.log('Resend verification email request successful for', email);
			toast.success(responseData.message || 'Verification email resent successfully.');
			return { success: true };
		} else {
			const errorMessage = responseData?.message || 'Backend indicated an issue with resending the email.';
			logger.warn('Resend verification email backend issue:', errorMessage);
			toast.error(errorMessage);
			return { success: false };
		}
	} catch (err) {
		const errorMessage = handleFetchMessage(err, 'An unknown error occurred while resending verification email.', null, false);
		toast.error(errorMessage);
		return { success: false };
	}
}

export async function setUserPassword(userId: string, newPassword: string, confirmPassword: string): Promise<{ success: boolean }> {
	if (!userId) {
		toast.error('User ID is missing. Cannot set password.');
		return { success: false };
	}
	try {
		const response = await fetchWithAuth(`/api/users/${userId}/admin-update-password`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ newPassword, confirmPassword }),
		});
		const data = await response.json();
		if (!response.ok) {
			throw new Error(data.message || 'Failed to set password');
		}
		toast.success('Password set successfully');
		return { success: true };
	} catch (error) {
		logger.error('Failed to set password', error);
		toast.error(handleFetchMessage(error, 'Failed to set password'));
		return { success: false };
	}
}

// Suspend or unsuspend a user
export async function updateUserStatus(userId: string, status: 'Active' | 'Suspended'): Promise<{ success: boolean; message?: string }> {
	if (!userId) {
		toast.error('User ID is missing. Cannot update status.');
		return { success: false };
	}
	try {
		const response = await fetchWithAuth(`/api/users/${userId}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ status }),
		});
		const data = await response.json();
		if (!response.ok) {
			const errorMessage = data?.message || 'Failed to update user status.';
			logger.error('Backend API Error (PUT /api/users/[id]/status):', errorMessage);
			toast.error(errorMessage);
			return { success: false, message: errorMessage };
		}
		toast.success(data.message || 'User status updated successfully');
		return { success: true, message: data.message };
	} catch (error) {
		toast.error(handleFetchMessage(error, 'An error occurred while updating user status.'));
		return { success: false };
	}
}
