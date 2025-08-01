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
