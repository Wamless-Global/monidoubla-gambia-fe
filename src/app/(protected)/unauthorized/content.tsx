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
		<div className="min-h-screen bg-gradient-to-br from-blue-200/60 via-white/70 to-blue-400/30 dark:from-blue-900/60 dark:via-blue-950/40 dark:to-blue-950/10 flex flex-col">
			<Header />
			<div className="flex-grow flex items-center justify-center p-4 sm:p-8">
				<div className="w-full max-w-lg mx-auto">
					<div className="rounded-2xl shadow-2xl bg-gradient-to-br from-white/80 to-blue-50/60 dark:from-blue-900/40 dark:to-blue-950/10 backdrop-blur-[6px] px-8 py-10 text-center border-0">
						<div className="flex flex-col items-center gap-2 mb-6">
							<i className="ri-shield-user-line text-5xl text-blue-400 mb-2"></i>
							<h1 className="text-3xl font-extrabold text-blue-900 dark:text-white mb-2 tracking-tight">Unauthorized Access</h1>
						</div>
						<p className="text-blue-900/80 dark:text-blue-100 text-lg mb-8">
							You do not have the necessary permissions to access {attemptedPath ? <code className="bg-blue-100/60 dark:bg-blue-900/30 px-2 py-1 rounded font-mono text-blue-700 dark:text-blue-200 text-base">{attemptedPath}</code> : 'this page'}.
						</p>
						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							<CustomLink href="/user" passHref>
								<Button className="bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white py-3 px-6 rounded-xl shadow-lg text-lg font-semibold w-full sm:w-auto">My Account</Button>
							</CustomLink>
							<Button className="bg-gradient-to-r from-red-500 to-pink-400 hover:from-red-600 hover:to-pink-500 text-white py-3 px-6 rounded-xl shadow-lg text-lg font-semibold w-full sm:w-auto" onClick={handleLogout} disabled={isLoggingOut}>
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
