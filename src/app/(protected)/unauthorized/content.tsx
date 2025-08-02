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
		window.googleTranslateElementInit = function () {
			if (window.google?.translate?.TranslateElement) {
				new window.google.translate.TranslateElement({ pageLanguage: 'en' }, 'google_translate_element');
			}
		};

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
		<div className="min-h-screen bg-gradient-to-br from-primary to-secondary flex flex-col">
			<Header />
			<div className="flex-grow flex items-center justify-center p-4 sm:p-8">
				<div className="container">
					<div className="card max-w-md mx-auto text-center">
						<h1 className="text-3xl font-bold text-neutral-dark mb-4">Unauthorized Access</h1>
						<p className="text-text-secondary mb-6">You do not have the necessary permissions to access {attemptedPath ? <code className="bg-neutral-light px-1 py-0.5 rounded">{attemptedPath}</code> : 'this page'}.</p>
						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							<CustomLink href="/user" passHref>
								<Button className="button button-secondary w-full sm:w-auto">My Account</Button>
							</CustomLink>
							<Button className="button button-accent w-full sm:w-auto" onClick={handleLogout} disabled={isLoggingOut}>
								{isLoggingOut ? (
									<>
										<Loader2 className="mr-2 h-5 w-5 animate-spin" />
										<span>Logging out...</span>
									</>
								) : (
									'Logout'
								)}
							</Button>
						</div>
					</div>
				</div>
			</div>
			<Footer />
		</div>
	);
};

export default UnauthorizedPageContent;
