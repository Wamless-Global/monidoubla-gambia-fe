import { Metadata } from 'next';
import Content from './content';

export const metadata: Metadata = {
  title: 'Network',
  description: 'Network page.',
};

export default function Page() {
  return <Content />;
}
