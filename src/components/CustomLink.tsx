'use client';

import { usePathname } from 'next/navigation';
import Link, { LinkProps } from 'next/link';
import NProgress from 'nprogress';

type CustomLinkProps = LinkProps & {
	children: React.ReactNode;
	className?: string;
	onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
	[key: string]: unknown;
};

export function CustomLink({ children, onClick, ...props }: CustomLinkProps) {
	const pathname = usePathname();
	const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
		const href = props.href?.toString();
		const isInternal = href && (href.startsWith('/') || href.startsWith(window.location.origin));
		const isModifiedClick = event.ctrlKey || event.metaKey || event.shiftKey || event.button !== 0;

		if (isInternal && !isModifiedClick && href !== pathname) {
			NProgress.start();
		}

		if (onClick) {
			onClick(event);
		}
	};

	return (
		<Link {...props} onClick={handleClick}>
			{children}
		</Link>
	);
}
