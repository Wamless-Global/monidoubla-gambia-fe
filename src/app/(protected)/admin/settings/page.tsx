import { Metadata } from 'next';
import Content from './content';

export const metadata: Metadata = {
  title: 'Settings',
  description: 'Settings page.',
};

export default function Page() {
  return <Content />;
}
