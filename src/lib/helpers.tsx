import React from 'react';
import currencyFormatter, { Currency } from 'currency-formatter';
import nProgress from 'nprogress';
import { NextRequest } from 'next/server';
import { logger } from './logger';
import { log } from 'console';

export const generateSlug = (name: string) => (name ? name.toLowerCase().replace(/\s+/g, '-') : '');

export const formatNaira = (amount: number | null | undefined): string => {
	if (amount === null || amount === undefined || isNaN(amount)) return 'N/A';
	return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
};

export const formatNumber = (amount: number | undefined | null, options?: Intl.NumberFormatOptions): string => {
	if (amount === undefined || amount === null || isNaN(amount)) return 'N/A';
	return new Intl.NumberFormat('en-US', options).format(amount);
};

export const formatUSD = (amount: number | undefined | null, precision = 2): string => {
	if (amount === undefined || amount === null || isNaN(amount)) return 'N/A';
	return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: precision, maximumFractionDigits: precision }).format(amount);
};

/**
 * Formats a number as a US Dollar currency string (e.g., $1,234.56).
 * Handles null, undefined, or NaN by returning '$0.00'.
 * @param amount The number to format.
 * @returns The formatted currency string or '$0.00'.
 */
/**
 * Formats a number as a currency string for any currency.
 * Falls back to NGN if the currency is invalid.
 * Optionally returns the currency symbol or code.
 * @param amount The number to format.
 * @param currency The currency code (e.g., 'USD', 'NGN'). Defaults to 'USD'.
 * @param options Optional: { symbol?: boolean, code?: boolean }
 * @returns The formatted currency string, symbol, or code.
 */
export const formatCurrency = (amount: number | null | undefined, currency: string = '', options?: { symbol?: boolean; code?: boolean; symbolPosition?: 'before' | 'after' }): string => {
	const fallbackCurrency = getSettings()?.baseCurrency || getCurrencyFromLocalStorage()?.code || 'NGN';

	const validCurrency = (() => {
		try {
			new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(0);
			return currency;
		} catch {
			return fallbackCurrency;
		}
	})();

	if (options?.symbol && !options?.code) {
		// Get the currency symbol
		const parts = new Intl.NumberFormat('en-US', { style: 'currency', currency: validCurrency, currencyDisplay: 'narrowSymbol' }).formatToParts(0);
		let symbolPart = parts.find((p) => p.type === 'currency')?.value;
		if (!symbolPart) {
			symbolPart = getCurrencySymbol();
		}
		return symbolPart || validCurrency;
	}

	if (options?.code && !options?.symbol) {
		return validCurrency;
	}

	if (amount === null || amount === undefined || isNaN(amount)) {
		amount = 0;
	}

	const formatted = new Intl.NumberFormat('en-US', { style: 'decimal', minimumFractionDigits: 0, maximumFractionDigits: 4 }).format(amount);

	let symbol = new Intl.NumberFormat('en-US', { style: 'currency', currency: validCurrency, currencyDisplay: 'narrowSymbol' }).formatToParts(0).find((p) => p.type === 'currency')?.value;

	symbol = getCurrencySymbol() || validCurrency;

	// If both code and symbol are true, show both with amount
	if (options?.code && options?.symbol) {
		if (options?.symbolPosition === 'after') {
			return `${formatted} ${symbol} ${validCurrency}`;
		}
		return `${symbol}${formatted} ${validCurrency}`;
	}

	// Default: show amount with symbol or code
	if (options?.code) {
		if (options?.symbolPosition === 'after') {
			return `${formatted} ${validCurrency}`;
		}
		return `${validCurrency} ${formatted}`;
	}

	if (options?.symbolPosition === 'after') {
		return `${formatted} ${symbol}`;
	}
	// Default is 'before'
	return `${symbol}${formatted}`;
};

export const formatBaseurrency = (amount: number | null | string, units = 2, withTags: boolean = true): React.ReactElement | string => {
	const convertAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
	const amountStr = convertAmount !== null && convertAmount !== undefined ? convertAmount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: units }) : 'N/A';

	if (withTags) {
		return <span className="money">{`${amountStr} ${getBaseCurrency()}`}</span>;
	}
	return `${amountStr} ${getBaseCurrency()}`;
};

// Assuming this helper function exists or needs to be defined
export const getAgentStatusVariant = (status: string) => {
	switch (status) {
		case 'approved':
			return 'default';
		case 'pending':
			return 'warning';
		case 'rejected':
			return 'destructive';
		case 'needs_more_info':
			return 'secondary';
		default:
			return 'default';
	}
};

// Format timestamp to relative time
export const formatRelativeTime = (timestamp: string) => {
	const date = new Date(timestamp);
	const now = new Date();
	const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

	if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
	if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
	if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
	return `${Math.floor(diffInSeconds / 86400)}d ago`;
};

export const formatDate = (date: Date, showTime: boolean = true): string => {
	const month = date.toLocaleDateString('en-US', { month: 'short' });
	const day = date.getDate();
	const time = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
	return `${month} ${day} ${showTime ? ', ' + time : ''}`;
};

/**
 * Formats a birth date as "MMM dd, yyyy" (e.g., Jan 01, 2000).
 * Returns 'N/A' if input is invalid.
 * @param date Date object or date string
 */
export function formatDateNice(date: Date | string | null | undefined): string {
	if (!date) return 'N/A';
	const d = typeof date === 'string' ? new Date(date) : date;
	if (isNaN(d.getTime())) return 'N/A';
	return d.toLocaleDateString('en-US', {
		month: 'short',
		day: '2-digit',
		year: 'numeric',
	});
}

// Utility to make transaction type readable
export const TRANSACTION_TYPE_LABELS: Record<string, string> = {
	deposit: 'Deposit',
	withdrawal: 'Withdrawal',
	donation: 'Savings',
	donation_profit_withdrawal: 'Savings Target',
	referral_bonus: 'Referral Bonus',
	fee: 'Fee',
	penalty: 'Penalty',
	promo_bonus: 'Promo Bonus',
	refund: 'Refund',
	payout: 'Payout',
	wallet_debit_admin: 'Debit (Admin)',
	wallet_credit_admin: 'Credit (Admin)',
	deposit_fee_revenue: 'Deposit Fee',
	withdrawal_fee_revenue: 'Withdrawal Fee',
	early_withdrawal_penalty_revenue: 'Early Withdrawal Penalty',
	profit_cap_retained_revenue: 'Profit Cap Retained',
	donation_fee_revenue: 'Savings Fee',
	selling_units_fee_revenue: 'Liquidating Savings Fee',
};

export function getTransactionTypeLabel(type: string) {
	return TRANSACTION_TYPE_LABELS[type] || type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function handleFetchMessage(err: { message?: string; detail?: unknown; errors?: any[] } | string | unknown, defaultMessage: string | null = '', JSONErr: string | null = '', redirect: boolean = true): string {
	let errorMessage = defaultMessage || 'An unexpected error occurred.';

	let message: string | undefined;
	let detail: unknown;
	let errors: any[] | undefined;

	if (typeof err === 'string') {
		message = err;
	} else if (typeof err === 'object' && err !== null) {
		if ('message' in err && typeof (err as any).message === 'string') {
			message = (err as any).message;
		}
		if ('detail' in err) {
			detail = (err as any).detail;
		}
		if ('errors' in err && Array.isArray((err as any).errors)) {
			errors = (err as any).errors;
		}
	}

	// If errors array exists, join all error messages
	if (errors && errors.length > 0) {
		const errorMsgs = errors.map((e) => e.message || '').filter(Boolean);
		if (errorMsgs.length > 0) {
			errorMessage = errorMsgs.join('; ');
		}
	}

	if (detail && typeof detail === 'string') message = detail;

	if (message) {
		const lowerMessage = message.toLowerCase();

		if (lowerMessage.includes('violates foreign key constraint')) {
			errorMessage = 'This action cannot be completed because it is linked to other records. Please resolve related data first or contact support.';
		} else if (lowerMessage.includes('failed to fetch')) {
			errorMessage = 'An error occurred. Please try again later.';
		} else if (lowerMessage.includes('resource not found for')) {
			errorMessage = 'An internal error occurred, please contact support.';
		} else if (err instanceof SyntaxError || lowerMessage.includes('json') || lowerMessage.includes('token')) {
			errorMessage = JSONErr || 'Server unavailable. Please try again later.';
			logger.log(lowerMessage);
		} else if (!errors || errors.length === 0) {
			errorMessage = message;
		}
	}

	if (errorMessage == 'Not authorized, no authentication cookie found' || errorMessage.includes('no authentication cookie') || errorMessage.includes('No active session found')) {
		errorMessage = 'Your session has expired. Please log in again.';
		if (redirect) {
			nProgress.start();
			window.location.reload();
			clearLoggedInAsUser();
		}
	}

	if (errorMessage == 'Your account has been Suspended. Please contact support.' || errorMessage.includes('Your account has been Suspended. Please contact support.')) {
		if (redirect) {
			nProgress.start();
			window.location.reload();
			clearLoggedInAsUser();
		}
	}

	return errorMessage;
}

//truncate function
export function truncateString(str: string, maxLength: number = 20): string {
	if (str.length <= maxLength) return str;
	return str.slice(0, maxLength - 3) + '...';
}

export function getTradeStatusToast(updatedTrade: { status: string }) {
	const status = updatedTrade.status;
	const statusMap: Record<string, { type: 'success' | 'error'; message: string }> = {
		completed: { type: 'success', message: 'Trade completed successfully.' },
		fiat_payment_confirmed_by_buyer: { type: 'success', message: 'Buyer has confirmed payment.' },
		fiat_received_confirmed_by_seller: { type: 'success', message: 'Seller has confirmed receipt of payment.' },
		platform_ngn_released: { type: 'success', message: 'Funds have been released.' },
		dispute_resolved_buyer: { type: 'success', message: 'Dispute resolved in favor of buyer.' },
		dispute_resolved_seller: { type: 'success', message: 'Dispute resolved in favor of seller.' },
		cancelled_by_buyer: { type: 'error', message: 'Trade was cancelled by the buyer.' },
		cancelled_by_seller: { type: 'error', message: 'Trade was cancelled by the seller.' },
		cancelled: { type: 'error', message: 'Trade was cancelled.' },
		expired: { type: 'error', message: 'Trade has expired.' },
		dispute_opened: { type: 'error', message: 'A dispute has been opened for this trade.' },
	};
	return { status, statusMap };
}

export function getClientIp(req: NextRequest): string {
	const xff = req.headers.get('x-forwarded-for');
	if (xff) {
		return xff.split(',')[0].trim();
	}

	return req.headers.get('x-real-ip') ?? req.headers.get('cf-connecting-ip') ?? '';
}

export function sanitizeUrl(url: string, base: string): string {
	const cleanBase = base.replace(/\/+$/, '');

	const regex = new RegExp(`(${cleanBase})+`, 'g');

	if (url.startsWith(cleanBase)) {
		return cleanBase + url.slice(cleanBase.length).replace(regex, '');
	}
	return url;
}

export function normalizeUrl(url: string): string {
	return url.replace(/([^:]\/)\/+/g, '$1');
}

export function getCurrencyFromLocalStorage(): { symbol: string; name: string; code: string } | null {
	if (typeof window === 'undefined') return null;
	try {
		const currencyStr = localStorage.getItem('currency');

		if (!currencyStr) return null;
		const currency = JSON.parse(currencyStr);
		if (currency && currency.symbol && currency.name && currency.code) {
			return currency;
		}
		return null;
	} catch {
		return null;
	}
}

/**
 * Get the base currency from localStorage or fallback to env variable.
 * @returns {string} The base currency code (e.g. 'SKY').
 */
export function getBaseCurrency(): string {
	if (typeof window !== 'undefined') {
		try {
			const raw = localStorage.getItem('settings');
			if (raw) {
				const parsed = JSON.parse(raw);
				if (parsed && typeof parsed.baseCurrency === 'string') {
					return parsed.baseCurrency;
				}
			}
		} catch (e) {
			// ignore JSON parse errors
		}
	}
	return process.env.NEXT_PUBLIC_BASE_CURRENCY || '';
}

/**
 * Get the application name from localStorage or fallback to empty string.
 * @returns {string} The application name (e.g. 'SikkySix').
 */
export function getPlatformName(): string {
	if (typeof window !== 'undefined') {
		try {
			const raw = localStorage.getItem('settings');
			if (raw) {
				const parsed = JSON.parse(raw);
				if (parsed && typeof parsed.name === 'string') {
					return parsed.name;
				}
			}
		} catch (e) {
			// ignore JSON parse errors
		}
	}
	return process.env.NEXT_PUBLIC_NAME || '';
}

export function getSettings(): { baseCurrency: string; name: string; bonusThreshold: string } | null {
	if (typeof window !== 'undefined') {
		try {
			const raw = localStorage.getItem('settings');
			if (raw) {
				let parsed;
				try {
					parsed = JSON.parse(raw);
				} catch (e) {
					throw new Error('Invalid JSON in settings');
				}
				return parsed as { baseCurrency: string; name: string; bonusThreshold: string };
			}
		} catch (e) {
			return null;
		}
	}
	return null;
}

/**
 * Get the base currency rate from localStorage or fallback to 1.
 * @returns {number} The base currency rate (e.g. 1.1).
 */
export function getBaseCurrencyRate(): number {
	if (typeof window !== 'undefined') {
		try {
			const raw = localStorage.getItem('settings');
			if (raw) {
				const parsed = JSON.parse(raw);
				const rate = typeof parsed?.rate === 'string' ? parseFloat(parsed.rate) : parsed?.rate;
				if (!isNaN(rate) && typeof rate === 'number') {
					return rate;
				}
			}
		} catch (e) {
			// ignore JSON parse errors
		}
	}
	return 1;
}

/**
 * Get the currency symbol from localStorage or fallback to empty string.
 * @returns {string} The currency symbol (e.g. '₦', '₵').
 */
export function getCurrencySymbol(locale = 'en-US') {
	// Create a number formatter for the specified currency and locale
	const formatter = new Intl.NumberFormat(locale, {
		style: 'currency',
		currency: getBaseCurrency(),
		// Use minimumFractionDigits: 0 to avoid decimal places
		minimumFractionDigits: 0,
	});

	// Format a sample number (e.g., 0) and extract the currency symbol
	const parts = formatter.formatToParts(0);
	const symbolPart = parts.find((part) => part.type === 'currency');
	const currency: Currency = currencyFormatter.findCurrency(getBaseCurrency())!;
	return currency ? currency.symbol : symbolPart ? symbolPart.value : '';
}

export function getLoggedInAsUser() {
	logger.log('Checking logged in as user');
	if (typeof window !== 'undefined') {
		try {
			logger.log('Getting logged in as user from localStorage');
			const isLoggedInAsUserStr = localStorage.getItem(`sb-${process.env.NEXT_PUBLIC_BACKEND_SERVICE}-auth-token`);
			logger.log('isLoggedInAsUserStr:', isLoggedInAsUserStr);
			logger.log(`sb-${process.env.NEXT_PUBLIC_BACKEND_SERVICE}-auth-token`);
			const adminRequest = localStorage.getItem(`admin-login-request`);

			if (!isLoggedInAsUserStr || isLoggedInAsUserStr === 'null' || !adminRequest || adminRequest === 'null') return false;

			const isLoggedInAsUser = JSON.parse(isLoggedInAsUserStr);

			if (JSON.parse(adminRequest)) {
				return isLoggedInAsUser;
			} else {
				return false;
			}
		} catch {
			logger.error('Error parsing logged in as user data');
			// ignore JSON parse errors
		}
	}
	return false;
}

export function getSetCookie() {
	if (typeof window !== 'undefined') {
		try {
			const isCookieSet = localStorage.getItem('sb-auth-cookie-set');
			if (!isCookieSet) return false;
			return JSON.parse(isCookieSet);
		} catch {}
	}
	return false;
}

export function getTGData() {
	if (typeof window !== 'undefined') {
		try {
			const data = localStorage.getItem('tg-init-data');
			if (!data) return null;

			try {
				return JSON.parse(data);
			} catch {
				return data;
			}
		} catch {
			return null;
		}
	}
	return null;
}

export function clearLoggedInAsUser(): void {
	if (typeof window !== 'undefined') {
		localStorage.removeItem(`sb-${process.env.NEXT_PUBLIC_BACKEND_SERVICE}-auth-token`);
		localStorage.removeItem(`sb-auth-cookie-set`);
		localStorage.removeItem(`admin-login-request`);
	}
}

export function setLoggedInAsUser(): void {
	if (typeof window !== 'undefined') {
		localStorage.setItem(`sb-auth-cookie-set`, JSON.stringify(false));
		localStorage.setItem(`sb-${process.env.NEXT_PUBLIC_BACKEND_SERVICE}-auth-token`, JSON.stringify({}));
	}
}

export function adminLoginRequest() {
	if (typeof window !== 'undefined') {
		try {
			const loginRequest = localStorage.getItem('admin-login-request');
			if (!loginRequest) return false;
			return JSON.parse(loginRequest);
		} catch {}
	}
	return false;
}

export function isLoggedInViaTG() {
	if (typeof window !== 'undefined') {
		try {
			const tgLogin = localStorage.getItem('logged-in-via-tg');
			if (!tgLogin) return false;
			return JSON.parse(tgLogin);
		} catch {}
	}
	return false;
}

export const convertCurrency = (amount: number): string => formatCurrency(amount * getBaseCurrencyRate());

export const convertToBaseCurrency = (amount: number) => formatBaseurrency(amount / getBaseCurrencyRate());

// Helper to parse maturity string like '2 days', '10 minutes', '3 hours' to number of days (float)
export function parseMaturityDays(maturity: string): number {
	if (!maturity) return 0;
	const regex = /([\d.]+)\s*(day|days|hour|hours|minute|minutes)/i;
	const match = maturity.match(regex);
	if (!match) return 0;
	const value = parseFloat(match[1]);
	const unit = match[2].toLowerCase();
	if (unit.startsWith('day')) return value;
	if (unit.startsWith('hour')) return value / 24;
	if (unit.startsWith('minute')) return value / 1440;
	return 0;
}

// Countdown timer for maturity
export const getCountdown = (dateString: string | null, type = 'expiry') => {
	if (!dateString) return 'N/A';
	logger.log('Calculating countdown for:', dateString);

	// Get current time in UTC
	const now = new Date();
	const utcNow = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds(), now.getUTCMilliseconds()));

	// Parse target time (already in UTC due to 'Z' suffix)
	const target = new Date(dateString);

	// Calculate difference in milliseconds
	const diff = target.getTime() - utcNow.getTime();

	if (diff <= 0) return type.toLocaleLowerCase() == 'expiry' ? 'Expired' : 'Matured';

	// Calculate time components
	const days = Math.floor(diff / (1000 * 60 * 60 * 24));
	const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
	const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
	const seconds = Math.floor((diff % (1000 * 60)) / 1000);

	// Build result string
	let result = '';
	if (days > 0) result += `${days}d `;
	if (hours > 0 || days > 0) result += `${hours}h `;
	if (minutes > 0 || hours > 0 || days > 0) result += `${minutes}m `;
	result += `${seconds}s`;

	return result.trim();
};
