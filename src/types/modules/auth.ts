import { ReactNode } from 'react';
import { AuthenticatedUser, User } from './users';

export interface AuthContextType {
	currentUser: AuthenticatedUser | null;
	setCurrentUser: (user: AuthenticatedUser | null) => void;
	isLoading: boolean;
	login: (email: string, password: string) => Promise<AuthenticatedUser>;
	logout: () => Promise<void>;
	setIs404: (is404: boolean) => void;
	signup: (name: string, email: string, confirmEmail: string, password: string, confirmPassword: string, country: string, referralId?: string, roles?: Array<string>) => Promise<void>;
	checkEmailVerificationStatus: (email: string) => Promise<{ status: 'verified' | 'not_verified' | 'error' | 'not_found'; message: string | null }>;
	resendVerificationEmail: (email: string) => Promise<{ success: boolean; message: string | null }>;
	verifyEmail: (id: string) => Promise<{ success: boolean; message: string | null }>;
}

export interface AuthProviderProps {
	children: ReactNode;
}

export interface VerifyResetTokenResult {
	valid: boolean;
	user?: User;
	error?: { name: string; message: string; status?: number };
}

export interface ReferralData {
	status: string;
	data?: {
		name?: string;
		referral_id?: string;
	};
}

export interface CountriesData {
	status: string;
	data?: {
		name?: string;
		referral_id?: string;
	};
}

export interface SignupPageContentProps {
	referralData: ReferralData | null;
	countries: CountriesData | null;
}
