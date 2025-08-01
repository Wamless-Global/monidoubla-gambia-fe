'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { CustomLink } from '@/components/CustomLink';
import nProgress from 'nprogress';
import { handleFetchMessage } from '@/lib/helpers';
import { logout } from '@/lib/auth';
import Footer from '@/components/Footer';
import Header from '@/components/Header';

const UnauthorizedPageContent: React.FC = () => {
	const router = useRouter();
	const searchParams = useSearchParams();
	const attemptedPath = searchParams.get('path');
	const [isLoggingOut, setIsLoggingOut] = useState(false);

	const handleLogout = async () => {
		setIsLoggingOut(true);
		try {
			await logout();
			nProgress.start();
			toast.success('Logged out successfully!');
			router.push('/auth/login');
		} catch (err) {
			const errorMessage = handleFetchMessage(err, 'An unexpected error occurred during logout.');
			toast.error(errorMessage);
		} finally {
			nProgress.done();
			setIsLoggingOut(false);
		}
	};

	useEffect(() => {
		// Define the callback before loading script
		window.googleTranslateElementInit = function () {
			if (window.google?.translate?.TranslateElement) {
				new window.google.translate.TranslateElement({ pageLanguage: 'en' }, 'google_translate_element');
			}
		};

		// Prevent duplicate script appending
		if (!document.getElementById('google-translate-script')) {
			const script = document.createElement('script');
			script.id = 'google-translate-script';
			script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
			script.async = true;
			document.body.appendChild(script);
		}

		return () => {
			delete window.googleTranslateElementInit;
		};
	}, []);

	return (
		<div className="bg-background min-h-screen flex flex-col justify-between">
			<Header />
			<div className="flex flex-col items-center justify-center text-foreground p-4 min-h-96 mt-20">
				<h1 className="text-4xl font-bold mb-4 text-destructive">Unauthorized Access</h1>
				<p className="text-lg mb-6 text-center">You do not have the necessary permissions to access {attemptedPath ? <code className="bg-muted px-1 py-0.5 rounded">{attemptedPath}</code> : 'this page'}.</p>
				<div className="flex gap-4">
					<CustomLink href="/user" passHref>
						<Button variant="outline" className="cursor-pointer" disabled={isLoggingOut}>
							My Account
						</Button>
					</CustomLink>
					<Button variant="destructive" onClick={handleLogout} className="cursor-pointer" disabled={isLoggingOut}>
						{isLoggingOut ? (
							<>
								<Loader2 className="mr-2 h-5 w-5 animate-spin" /> <span>Logging out...</span>
							</>
						) : (
							'Logout'
						)}
					</Button>
				</div>
			</div>
			<Footer />
		</div>
	);
};

export default UnauthorizedPageContent;
