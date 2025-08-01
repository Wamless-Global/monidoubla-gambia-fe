import { Metadata } from 'next';
import Content from './dashboard/content';

export const metadata: Metadata = {
	title: 'Dashboard',
	description: 'Dashboard page.',
};

export default function Page() {
	return <Content />;
}
