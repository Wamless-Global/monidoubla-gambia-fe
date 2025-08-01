'use client';

import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import HowItWorksSection from '@/components/HowItWorksSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import Footer from '@/components/Footer';

export default function Home() {
	return (
		<main className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
			<Header />
			<HeroSection />
			<HowItWorksSection />
			<TestimonialsSection />
			<Footer />
		</main>
	);
}
