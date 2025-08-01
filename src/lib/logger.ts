const ENABLE_LOGS = (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_ENABLE_LOGS === 'true') || (typeof window !== 'undefined' && (window as any).NEXT_PUBLIC_ENABLE_LOGS === 'true');

export const logger = {
	log: (...args: any[]) => {
		if (typeof window !== 'undefined') {
			// Client-side: styled log
			if (!ENABLE_LOGS) return;
			console.log('%c[LOG]', 'color: #4F8A10; font-weight: bold;', ...args);
		} else {
			// Server-side: plain log
			// eslint-disable-next-line no-console
			console.log('[LOG]', ...args);
		}
	},
	info: (...args: any[]) => {
		if (typeof window !== 'undefined') {
			if (!ENABLE_LOGS) return;
			console.info('%c[INFO]', 'color: #00529B; font-weight: bold;', ...args);
		} else {
			// eslint-disable-next-line no-console
			console.info('[INFO]', ...args);
		}
	},
	warn: (...args: any[]) => {
		if (typeof window !== 'undefined') {
			if (!ENABLE_LOGS) return;
			console.warn('%c[WARN]', 'color: #9F6000; font-weight: bold;', ...args);
		} else {
			// eslint-disable-next-line no-console
			console.warn('[WARN]', ...args);
		}
	},
	error: (...args: any[]) => {
		if (typeof window !== 'undefined') {
			if (!ENABLE_LOGS) return;
			console.error('%c[ERROR]', 'color: #D8000C; font-weight: bold;', ...args);
		} else {
			// eslint-disable-next-line no-console
			console.error('[ERROR]', ...args);
		}
	},
};
