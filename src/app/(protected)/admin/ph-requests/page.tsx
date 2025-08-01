import { Metadata } from 'next';
import Content from './content';

export const metadata: Metadata = {
  title: 'Ph Requests',
  description: 'Ph Requests page.',
};

export default function Page() {
  return <Content />;
}
