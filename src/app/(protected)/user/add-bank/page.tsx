import { Metadata } from 'next';
import Content from './content';

export const metadata: Metadata = {
  title: 'Add Bank',
  description: 'Add Bank page.',
};

export default function Page() {
  return <Content />;
}
