import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
	try {
		const { access_token, refresh_token, expires_at, expires_in } = await req.json();
		if (!access_token) {
			return NextResponse.json({ status: 'error', message: 'No access token provided.' }, { status: 400 });
		}

		logger.info('Setting session cookie with access token:', access_token);

		// Calculate cookie expiration
		let maxAge = 3600;
		if (expires_at) {
			const now = Math.floor(Date.now() / 1000);
			maxAge = Math.max(Number(expires_at) - now, 60);
		} else if (expires_in) {
			maxAge = Number(expires_in);
		}

		// Set cookies (HttpOnly, Secure, Path)
		const response = NextResponse.json({ status: 'success' });
		response.cookies.set('sb-access-token', access_token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			path: '/',
			maxAge,
			sameSite: 'lax',
		});
		if (refresh_token) {
			response.cookies.set('sb-refresh-token', refresh_token, {
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				path: '/',
				maxAge: maxAge * 2,
				sameSite: 'lax',
			});
		}
		return response;
	} catch (err) {
		return NextResponse.json({ status: 'error', message: 'Failed to set session cookie.' }, { status: 500 });
	}
}
