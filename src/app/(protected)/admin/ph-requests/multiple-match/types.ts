export interface AssignedUser {
	id: string;
	name: string;
	username: string;
	phoneNumber: string;
	amount: number;
	bankName: string;
	accountNumber: string;
	accountName: string;
	timeAssigned: string;
	status: 'pending' | 'proof-submitted' | 'confirmed' | 'declined' | 'expired';
}

export interface PHRequest {
	id: string;
	user: {
		id: string;
		name: string;
		username: string;
		email: string;
		phoneNumber: string;
		location: string;
	};
	amount: number;
	availableAmount: number; // Added for multiple-match.tsx
	remainingAmountToPay?: number; // Added for multiple-match.tsx
	dateCreated: string;
	status: 'pending' | 'waiting-match' | 'partial-match' | 'matched' | 'active' | 'completed' | 'expired' | 'cancelled';
	packageName: string;
	packageId?: string;
	expectedMaturity: string;
	profitPercentage: number;
	maturityPeriod: number;
	matchingProgress: number;
	assignedUsers: AssignedUser[];
	notes?: string; // Added for multiple-match.tsx
}

export interface GHRequest {
	id: string;
	user: {
		id: string;
		name: string;
		username: string;
		email: string;
		phoneNumber: string;
		location: string;
	};
	amount: number;
	remainingAmount?: number;
	dateCreated: string;
	status: 'pending' | 'waiting-match' | 'partial-match' | 'matched' | 'active' | 'completed' | 'expired' | 'cancelled';
	notes?: string;
}

export interface Package {
	id: string;
	name: string;
	minAmount: number;
	maxAmount: number;
	gain: number;
	maturity: string;
}
