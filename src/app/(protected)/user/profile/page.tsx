import { Metadata } from 'next';
import Content from './content';

export const metadata: Metadata = {
	title: 'User Profile',
	description: 'View and manage your user profile.',
};

export default function Page() {
	return <Content />;
}
