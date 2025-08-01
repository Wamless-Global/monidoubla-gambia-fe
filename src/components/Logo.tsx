import Image from 'next/image';
import { useTheme } from 'next-themes';
import { CustomLink } from './CustomLink';

const sizeMap = {
	xs: 30,
	sm: 60,
	md: 90,
	lg: 120,
	xl: 150,
	xxl: 200,
};

const logoVariants = {
	dark: '/images/logox.png',
	default: '/images/logox.png',
	darkIcon: '/images/logo-icon.png',
	lightIcon: '/images/logo-icon-white.png',
	light: '/images/logoy.png',
};

export default function Logo({
	size = 'lg',
	variant = 'light',
	alt = 'Monidoubla Logo',
	style,
	className,
	...props
}: {
	size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
	variant?: keyof typeof logoVariants;
	alt?: string;
	style?: React.CSSProperties;
	className?: string;
} & Omit<React.ComponentProps<typeof Image>, 'src'>) {
	const { theme } = useTheme();
	const dimension = sizeMap[size] || sizeMap.lg;
	const logoImg = variant == 'default' ? logoVariants.default : logoVariants[theme === 'dark' ? 'dark' : 'light'];

	return (
		<CustomLink href={'/'}>
			<Image src={logoImg} width={dimension} height={dimension / 2} alt={alt} style={{ objectFit: 'contain', ...style }} sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className={className} priority {...props} />
		</CustomLink>
	);
}
