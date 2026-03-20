import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { logger } from '@/lib/logger';

interface UserDetails {
	roles: string[];
	status: string;
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

const apiUrl = process.env.API_BASE_URL;

// Helper function to verify token and get user details
async function verifyTokenAndGetUserDetails(request: NextRequest, authToken?: string): Promise<VerificationResult> {
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

	if (!authToken || verificationResult.error || !verificationResult.user || !verificationResult.user.status) {
		redirectUer(loginUrl, currentPathname, authToken, verificationResult);
		return redirectUer(loginUrl, currentPathname, authToken, verificationResult);
	}

	if (verificationResult.user.status.toLocaleLowerCase() === 'suspended') {
		// Clear authentication cookies if user is suspended
		const response = NextResponse.redirect(loginUrl);
		response.cookies.delete('auth_token');
		response.cookies.delete('sb-access-token');
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

export async function proxy(request: NextRequest) {
	const authToken = request.cookies.get('sb-access-token')?.value || request.cookies.get('auth_token')?.value;
	const { pathname } = request.nextUrl;

	const loginUrl = new URL('/auth/login', request.url);
	const unauthorizedUrl = new URL('/unauthorized', request.url);
	const accountUrl = new URL('/user', request.url);
	const adminDashboardUrl = new URL('/admin', request.url);
	const maintenanceUrl = new URL('/maintenance', request.url);
	const notFoundUrl = new URL('/not-found', request.url);

	const isAdminPath = pathname.startsWith('/admin');
	const isAccountPath = pathname.startsWith('/user');
	const isAuthLoginPath = pathname === '/auth/login';
	const isUnauthorizedPagePath = pathname === '/unauthorized';
	const isMaintenancePath = pathname === '/maintenance';

	logger.log(`Middleware is running`);
	// --- Maintenance Mode Logic ---
	let maintenanceMode = false;
	try {
		const maintenanceRes = await fetchWithAuth(`${apiUrl}/admin/maintenance-mode`);
		if (maintenanceRes.ok) {
			const data = await maintenanceRes.json();
			logger.log('Middleware: Fetched maintenance mode status:', data);
			// Accepts { enabled: true/false } or { maintenanceMode: true/false }
			maintenanceMode = data.enabled === true || data.maintenanceMode === true;
		}
	} catch (e) {
		logger.warn('Middleware: Could not fetch maintenance mode status, defaulting to false.', e);
		maintenanceMode = false;
	}

	// If maintenance mode is enabled and not already on /maintenance, redirect all users except admins
	logger.log(`Middleware: Maintenance mode is ${maintenanceMode ? 'enabled' : 'disabled'}. Current path: "${pathname}"`);
	if (maintenanceMode && !isMaintenancePath) {
		// Allow admins to bypass maintenance mode
		let isAdmin = false;
		if (authToken) {
			const verificationResult = await verifyTokenAndGetUserDetails(request, authToken);
			if (verificationResult.user && (verificationResult.user.roles.includes('admin') || verificationResult.user.roles.includes('superAdmin'))) {
				isAdmin = true;
			}
		}
		if (!isAdmin) {
			logger.log('Middleware: Maintenance mode enabled. Redirecting to /maintenance.');
			// Append the original path as a query param
			const maintenanceUrlWithRedirect = new URL(maintenanceUrl.toString());
			maintenanceUrlWithRedirect.searchParams.set('redirect_to', pathname);
			return NextResponse.redirect(maintenanceUrlWithRedirect);
		}
	}

	// If maintenance mode is NOT enabled and user tries to access /maintenance, redirect to /not-found
	if (!maintenanceMode && isMaintenancePath) {
		logger.log('Middleware: Maintenance mode not enabled, redirecting /maintenance to /not-found.');
		return NextResponse.redirect(notFoundUrl);
	}

	// If accessing /unauthorized without a token, redirect to login (they shouldn't be here)
	if (isUnauthorizedPagePath && !authToken) {
		logger.log('Middleware: Accessing /unauthorized without token. Redirecting to login.');
		return NextResponse.redirect(loginUrl);
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
			logger.log(verificationResult);

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
		'/maintenance',
	],
};
