import { Metadata } from 'next';
import Content from './content';

export const metadata: Metadata = {
	title: 'Update Password',
};

export default function Page() {
	return (
		<>
			<Content />
		</>
	);
}
