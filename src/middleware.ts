import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { logger } from '@/lib/logger';

interface UserDetails {
	roles: string[];
}

interface VerificationResult {
	user?: UserDetails;
	error?: string;
	status?: number;
}

function redirectUer(loginUrl: URL, currentPathname: string, authToken: string | undefined, verificationResult: VerificationResult) {
	const loginUrlWithRedirect = new URL(loginUrl.toString()); // Clone to avoid modifying the original
	loginUrlWithRedirect.searchParams.set('redirect_to', currentPathname);

	const redirectResponse = NextResponse.redirect(loginUrlWithRedirect);
	if (authToken) {
		// Clear token if verification failed or user data is missing
		redirectResponse.cookies.delete('auth_token');
	}
	logger.log(`Middleware: Auth token missing, invalid, or user data error for path "${currentPathname}". Redirecting to login with redirect_to. Error: ${verificationResult.error}, Status: ${verificationResult.status}`);
	return redirectResponse;
}

// Helper function to verify token and get user details
async function verifyTokenAndGetUserDetails(request: NextRequest, authToken?: string): Promise<VerificationResult> {
	const apiUrl = process.env.API_BASE_URL;
	if (!apiUrl) {
		logger.error('Server-side API base URL (API_BASE_URL) is not configured.');
		return { error: 'API_BASE_URL not configured', status: 500 };
	}

	if (!authToken) {
		return { error: 'No auth token provided', status: 401 };
	}

	const headers = new Headers();
	headers.append('Cookie', `auth_token=${authToken}`);

	try {
		const response = await fetchWithAuth(`${apiUrl}/auth/verify-me`, {
			headers: headers,
		});

		if (!response.ok) {
			// Log more details for failed verification
			const errorText = await response.text().catch(() => 'Could not read error response text');
			logger.error(`Token verification failed: Status ${response.status}, Response: ${errorText}`);
			return { error: 'Token verification failed', status: response.status };
		}

		const verificationData = await response.json();
		if (!verificationData?.data?.user?.roles) {
			logger.error('Token verification successful, but user data or roles are missing in the response.', verificationData);
			return { error: 'Invalid user data structure', status: 500 };
		}
		return { user: verificationData.data.user };
	} catch (error) {
		logger.error('Error during token verification request:', error);
		return { error: 'Network or parsing error during token verification', status: 500 };
	}
}

// Helper function to handle protected route logic
async function handleProtectedRoute(request: NextRequest, authToken: string | undefined, requiredRoles: string[], loginUrl: URL, unauthorizedUrl: URL, currentPathname: string): Promise<NextResponse | null> {
	logger.log(`Middleware: Handling protected route for path "${currentPathname}" with token "${authToken ? 'present' : 'missing'}". Required roles: ${requiredRoles.join(', ')}`);

	const verificationResult = await verifyTokenAndGetUserDetails(request, authToken);

	if (!authToken || verificationResult.error || !verificationResult.user) {
		redirectUer(loginUrl, currentPathname, authToken, verificationResult);
		return redirectUer(loginUrl, currentPathname, authToken, verificationResult);
	}

	const userRoles = verificationResult.user.roles;
	const isAuthorized = requiredRoles.some((role) => userRoles.includes(role));

	if (!isAuthorized) {
		logger.log(`Middleware: User not authorized for path "${currentPathname}". User roles: ${userRoles.join(', ')}, Required: ${requiredRoles.join(', ')}. Redirecting to unauthorized.`);
		unauthorizedUrl.searchParams.set('path', currentPathname);
		return NextResponse.redirect(unauthorizedUrl);
	}

	return null; // User is authenticated and authorized
}

export async function middleware(request: NextRequest) {
	const authToken = request.cookies.get('sb-access-token')?.value || request.cookies.get('auth_token')?.value;
	const { pathname } = request.nextUrl;

	const loginUrl = new URL('/auth/login', request.url);
	const unauthorizedUrl = new URL('/unauthorized', request.url);
	const accountUrl = new URL('/user', request.url);
	const adminDashboardUrl = new URL('/admin', request.url);

	const isAdminPath = pathname.startsWith('/admin');
	const isAccountPath = pathname.startsWith('/user');
	const isAuthLoginPath = pathname === '/auth/login';
	const isUnauthorizedPagePath = pathname === '/unauthorized';
	const isAgentPortalPath = pathname.startsWith('/user/agent-portal');

	// If accessing /unauthorized without a token, redirect to login (they shouldn't be here)
	if (isUnauthorizedPagePath && !authToken) {
		logger.log('Middleware: Accessing /unauthorized without token. Redirecting to login.');
		return NextResponse.redirect(loginUrl);
	}

	// Restrict /user/agent-portal to agents only
	if (isAgentPortalPath) {
		const verificationResult = await verifyTokenAndGetUserDetails(request, authToken);

		if (!authToken || verificationResult.error || !verificationResult.user) return redirectUer(loginUrl, pathname, authToken, verificationResult);

		if (!verificationResult.user || !verificationResult.user.roles.includes('agent')) {
			return NextResponse.redirect(unauthorizedUrl);
		}
	}

	if (isAdminPath) {
		const response = await handleProtectedRoute(request, authToken, ['admin', 'superAdmin'], loginUrl, unauthorizedUrl, pathname);
		if (response) return response;
	} else if (isAccountPath) {
		const response = await handleProtectedRoute(
			request,
			authToken,
			['user', 'admin', 'superAdmin'], // Allow users with 'user', 'admin' or  'superAdmin' role
			loginUrl,
			unauthorizedUrl,
			pathname
		);
		if (response) return response;
	}

	// This check should ideally happen *after* protected route checks,
	// or ensure it doesn't interfere with unauthorized redirects.
	if (isAuthLoginPath && authToken) {
		// Before redirecting from login, quickly verify if the token is still valid and get roles
		// This prevents redirecting to a protected area if the token just expired or roles changed.
		logger.log(`Middleware: User on login page with token "${authToken}". Verifying token and roles.`);

		const verificationResult = await verifyTokenAndGetUserDetails(request, authToken);
		if (verificationResult.user) {
			const redirectToParam = request.nextUrl.searchParams.get('redirect_to');
			let targetPath: string | null = null;

			if (redirectToParam) {
				try {
					const potentialTargetUrl = new URL(redirectToParam, request.nextUrl.origin);

					// Security: Ensure the target URL is for the same origin.
					if (potentialTargetUrl.origin === request.nextUrl.origin) {
						targetPath = potentialTargetUrl.pathname; // Extract the path.
						// Ensure the extracted pathname is valid (starts with '/', not empty)
						if (!(targetPath && targetPath.startsWith('/'))) {
							logger.warn(`[MiddlewareAuthRedirect] Parsed pathname "${targetPath}" from redirectToParam "${redirectToParam}" is invalid. Clearing targetPath.`);
							targetPath = null; // Invalidate if path is not well-formed
						}
					} else {
						logger.warn(`[MiddlewareAuthRedirect] redirectToParam ("${redirectToParam}") resolved to a different origin ("${potentialTargetUrl.origin}"). Invalidating.`);
						// targetPath remains null
					}
				} catch (e) {
					logger.warn(`[MiddlewareAuthRedirect] Error parsing redirectToParam ("${redirectToParam}"): ${(e as Error).message}. Invalidating.`);
					// targetPath remains null
				}
			}

			if (targetPath) {
				logger.log(`[MiddlewareAuthRedirect] Valid targetPath ("${targetPath}") derived from redirectToParam ("${redirectToParam}"). Redirecting.`);
				const destination = new URL(targetPath, request.nextUrl.origin);
				return NextResponse.redirect(destination);
			} else {
				logger.log(`[MiddlewareAuthRedirect] Invalid or no redirectToParam ("${redirectToParam}"). Defaulting. targetPath: "${targetPath}"`);
				const defaultDestinationUrl = verificationResult.user.roles.includes('admin') || verificationResult.user.roles.includes('superAdmin') ? adminDashboardUrl : accountUrl;
				return NextResponse.redirect(defaultDestinationUrl);
			}
		}
		// If token is present but invalid, let them stay on login, maybe clear the bad cookie
		logger.log('Middleware: User on login page with an invalid/expired token. Clearing token.');
		const response = NextResponse.next(); // Stay on login page
		response.cookies.delete('auth_token');
		return response;
	}

	// Custom restriction: If agent tries to access /user/agents-apply, redirect to agent-portal
	if (pathname === '/user/agents-apply' && authToken) {
		const verificationResult = await verifyTokenAndGetUserDetails(request, authToken);
		if (verificationResult.user && verificationResult.user.roles.includes('agent')) {
			const agentPortalUrl = new URL('/user/agent-portal', request.url);
			return NextResponse.redirect(agentPortalUrl);
		}
	}

	logger.log(`Middleware: No specific route handling matched for path "${pathname}". Proceeding with default behavior.`);

	return NextResponse.next(); // Allow other requests
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - api (API routes)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 * - public files (like svgs, etc.)
		 * We want the middleware to run on admin, account, auth, and utility routes.
		 */
		'/admin/:path*',
		'/user/:path*', // Protect all account routes
		'/auth/login',
		'/unauthorized',
	],
};
