'use client';

import UserDetail from './UserDetail';

interface UserDetailProps {
	username: string;
}

export default function UserPage({ username }: UserDetailProps) {
	// The main layout already provides padding, so we just render the detail component.
	return <UserDetail username={username} />;
}
