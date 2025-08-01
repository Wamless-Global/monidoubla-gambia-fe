import { Metadata } from 'next';
import Content from './content';

export const metadata: Metadata = {
	title: 'Forgot Password',
	description: 'Reset your password to regain access to your account.',
};
export default function Page() {
	return (
		<>
			<Content />
		</>
	);
}
