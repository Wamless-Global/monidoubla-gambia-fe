export interface TransactionHistoryTableProps {
	transactions: Transaction[];
	showMyTransactionsToggle?: boolean; // To show "View My Transactions Only"
	currentUserId?: string; // For filtering "My Transactions"
}

export type TransactionsType =
	| 'deposit'
	| 'withdrawal'
	| 'donation'
	| 'donation_profit_withdrawal'
	| 'referral_bonus'
	| 'fee'
	| 'penalty'
	| 'promo_bonus'
	| 'refund'
	| 'payout'
	| 'wallet_debit_admin'
	| 'wallet_credit_admin'
	| 'deposit_fee_revenue'
	| 'withdrawal_fee_revenue'
	| 'early_withdrawal_penalty_revenue'
	| 'profit_cap_retained_revenue'
	| 'donation_fee_revenue'
	| 'selling_units_fee_revenue'
	| 'locked_funds_for_order'
	| 'unlocked_funds_from_order';
export type TransactionsPaymentMethod = 'p2p' | 'wallet_balance' | 'crypto' | 'internal';
export type TransactionStatus = 'pending' | 'approved' | 'rejected' | 'completed' | 'failed' | 'cancelled';

export interface Transaction {
	id: string; // uuid
	user_id: string; // uuid
	category_id: string | null; // uuid
	donation_id: string | null; // uuid
	type: TransactionsType;
	amount: number; // numeric
	currency: string; // text, default currency
	status: TransactionStatus;
	payment_method: TransactionsPaymentMethod | null;
	description: string | null; // text
	related_transaction_id: string | null; // uuid
	updated_at: string | null; // timestamp with time zone
	created_at: string; // timestamp with time zone
	raw_amount_from_amm?: number;
	capped_amount?: number;
	penalty_amount_deducted?: number;
	details?: Record<string, any>;
	is_instant?: boolean;
	duration_seconds?: number; // For non-instant transactions
	userName?: string; // uuid
	user_name?: string;
	user_username?: string;
}

export interface TransactionResponse {
	status: string;
	data: {
		transactions: Transaction[];
		hasMore: boolean;
		currentPage: number;
		pageSize: number;
		totalCount: number;
		totalPages: number;
	};
}

export type SortableTransactionKeys = 'date' | 'userName' | 'type' | 'amount' | 'status';

export interface TransactionHistoryTableProps {
	transactions: Transaction[];
	isLoading: boolean;
	currentPage: number;
	totalPages: number;
	totalCount: number;
	onPageChange: (page: number) => void;
	sortColumn: SortableTransactionKeys | null;
	sortDirection: 'asc' | 'desc';
	onSort: (column: SortableTransactionKeys) => void;
	loadingButton?: 'previous' | 'next' | null;
}

// Types based on API response
export interface ApiTransaction {
	id: string;
	user_id: string;
	category_id: string;
	type: string;
	amount: number;
	status: 'completed' | 'pending' | string;
	created_at: string;
	updated_at: string;
}

export interface TransactionApiResponse {
	status: string;
	data: {
		transactions: Transaction[];
		hasMore: boolean;
		currentPage: number;
		pageSize: number;
		totalCount: number;
		totalPages: number;
	};
}

// For UI display
export interface AccountTransaction {
	id: string;
	type: string;
	date: Date;
	amount: number;
	status: 'completed' | 'pending' | string;
	originalType: string;
}

export const TRANSACTION_TYPE_VALUES: TransactionsType[] = [
	'deposit',
	'withdrawal',
	'donation',
	'donation_profit_withdrawal',
	'referral_bonus',
	'fee',
	'penalty',
	'promo_bonus',
	'refund',
	'payout',
	'wallet_debit_admin',
	'wallet_credit_admin',
	'deposit_fee_revenue',
	'withdrawal_fee_revenue',
	'early_withdrawal_penalty_revenue',
	'profit_cap_retained_revenue',
	'donation_fee_revenue',
	'selling_units_fee_revenue',
	'locked_funds_for_order',
	'unlocked_funds_from_order',
];

export const PAYMENT_METHOD: TransactionsPaymentMethod[] = ['p2p', 'wallet_balance', 'crypto', 'internal'];

export const TRANSACTION_STATUSES: TransactionStatus[] = ['pending', 'approved', 'rejected', 'completed', 'failed', 'cancelled'];
