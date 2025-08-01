import { Metadata } from 'next';
import Content from './content';

export const metadata: Metadata = {
	title: 'Notifications',
	description: 'Notifications page.',
};

export default function Page() {
	return <Content />;
}
