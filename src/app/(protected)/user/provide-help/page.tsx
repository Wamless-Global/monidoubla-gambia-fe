import { Metadata } from 'next';
import Content from './content';

export const metadata: Metadata = {
  title: 'Provide Help',
  description: 'Provide Help page.',
};

export default function Page() {
  return <Content />;
}
