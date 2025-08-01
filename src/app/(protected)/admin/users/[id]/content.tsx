'use client';

import UserDetail from './UserDetail';

interface userDetailProps {
	username: string;
}

export default function UserPage({ username }: userDetailProps) {
	return <UserDetail username={username} />;
}
