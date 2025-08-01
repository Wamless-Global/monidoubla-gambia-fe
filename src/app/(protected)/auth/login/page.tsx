import { Metadata } from 'next';
import Content from './content';

export const metadata: Metadata = {
	title: 'Login',
	description: 'Login to your account to access your dashboard and manage your settings.',
};

export default function LoginPage() {
	return (
		<>
			<Content />
		</>
	);
}
