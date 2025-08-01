import { Metadata } from 'next';
import Content from './content';

export const metadata: Metadata = {
  title: 'Change Password',
  description: 'Change Password page.',
};

export default function Page() {
  return <Content />;
}
