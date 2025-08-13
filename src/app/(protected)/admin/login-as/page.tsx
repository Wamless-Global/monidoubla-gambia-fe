import { Metadata } from 'next';
import Content from './content';

export const metadata: Metadata = {
	title: 'Logging You In',
};

export default function Page() {
	return <Content />;
}
