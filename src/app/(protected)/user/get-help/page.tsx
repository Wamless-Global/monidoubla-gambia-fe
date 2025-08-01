import { Metadata } from 'next';
import Content from './content';

export const metadata: Metadata = {
  title: 'Get Help',
  description: 'Get Help page.',
};

export default function Page() {
  return <Content />;
}
