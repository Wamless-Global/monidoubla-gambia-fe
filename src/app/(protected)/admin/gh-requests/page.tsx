import { Metadata } from 'next';
import Content from './content';

export const metadata: Metadata = {
	title: 'GH Requests',
	description: 'Manage your GH requests.',
};

export default function Page() {
	return <Content />;
}
