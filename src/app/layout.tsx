import { Suspense } from 'react';
import type { Metadata } from 'next';
import { Montserrat, Poppins } from 'next/font/google';
import localFont from 'next/font/local';
import { ThemeProvider } from '@/components/ThemeProvider';
import { ProgressBar } from '@/components/ProgressBar';
import { Toaster } from '@/components/Sonner';
import './globals.css';

const clashDisplay = localFont({
	src: [
		{
			path: '../fonts/ClashDisplay-Regular.woff2',
			weight: '400',
			style: 'normal',
		},
		{
			path: '../fonts/ClashDisplay-Medium.woff2',
			weight: '500',
			style: 'normal',
		},
		{
			path: '../fonts/ClashDisplay-Semibold.woff2',
			weight: '600',
			style: 'normal',
		},
		{
			path: '../fonts/ClashDisplay-Bold.woff2',
			weight: '700',
			style: 'normal',
		},
	],
	variable: '--font-clash-display',
	display: 'swap',
});

const poppins = Poppins({
	subsets: ['latin'],
	variable: '--font-poppins',
	weight: ['400', '500', '600', '700', '800', '900'],
	display: 'swap',
});

const montserrat = Montserrat({
	variable: '--font-montserrat',
	subsets: ['latin'],
});

export const metadata: Metadata = {
	title: {
		default: 'Monidoublagambia',
		template: `%s | Monidoublagambia`,
	},
	description: 'A comprehensive financial platform for GH and PH requests',
};

declare global {
	interface Window {
		google?: any;
		googleTranslateElementInit?: () => void;
	}
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning className={`${clashDisplay.variable} ${montserrat.variable} ${poppins.variable} antialiased`}>
			<head>
				<link href="https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css" rel="stylesheet" />
				<link href="https://fonts.googleapis.com/css2?family=Pacifico&display=swap" rel="stylesheet" />
			</head>
			<body className={`${montserrat.className} bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white text-sm`} suppressHydrationWarning>
				<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
					<Suspense>
						<ProgressBar />
						<div className="min-h-screen flex flex-col">{children}</div>
						<Toaster expand={true} closeButton={true} richColors={true} />
					</Suspense>
				</ThemeProvider>
			</body>
		</html>
	);
}
