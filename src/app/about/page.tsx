import { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AboutHero from './AboutHero';
import AboutContent from './AboutContent';
import ReferralSection from './ReferralSection';
import MultiLevelSection from './MultiLevelSection';

export const metadata: Metadata = {
	title: 'About Us',
	description: 'About our platform and its features.',
};

export default function AboutPage() {
	return (
		<main>
			<Header />
			<AboutHero />
			<AboutContent />
			<ReferralSection />
			<MultiLevelSection />
			<Footer />
		</main>
	);
}
