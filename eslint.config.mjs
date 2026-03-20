import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
	baseDirectory: __dirname,
});

const eslintConfig = [
	...compat.extends('next/core-web-vitals', 'next/typescript'),
	{
		rules: {
			// 1. Unused vars are now just warnings (already set, but kept for consistency)
			'@typescript-eslint/no-unused-vars': [
				'warn',
				{
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_',
					caughtErrorsIgnorePattern: '^_',
					destructuredArrayIgnorePattern: '^_',
				},
			],

			// 2. STOP screaming about apostrophes and quotes in JSX
			'react/no-unescaped-entities': 'off',

			// 3. Allow 'any' when you're in a hurry (downgraded to warn or off)
			'@typescript-eslint/no-explicit-any': 'off',

			// 4. Don't force 'const' if you prefer using 'let' while iterating
			'prefer-const': 'warn',

			// 5. Hooks: Keep the "Rules of Hooks" as error (it prevents crashes)
			// but keep the dependency array as a warning.
			'react-hooks/rules-of-hooks': 'error',
			'react-hooks/exhaustive-deps': 'warn',

			// 6. Allow standard <img> tags without warnings if you don't need Next.js Image optimization yet
			'@next/next/no-img-element': 'off',

			// 7. Optional: Allow empty functions or requiring types where it's obvious
			'@typescript-eslint/no-empty-function': 'off',
			'@typescript-eslint/ban-ts-comment': 'off', // Allows @ts-ignore for those "I give up" moments
		},
	},
];

export default eslintConfig;
