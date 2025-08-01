import { Metadata } from 'next';
import Content from './content';

export const metadata: Metadata = {
	title: 'Verify Email Status',
};

export default async function Page() {
	return <Content />;
}
