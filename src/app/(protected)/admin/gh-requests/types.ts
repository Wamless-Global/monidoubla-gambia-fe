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
	remainingAmount: number;
	dateCreated: string;
	status: 'pending' | 'matched' | 'completed' | 'partial-match';
	notes: string;
}
