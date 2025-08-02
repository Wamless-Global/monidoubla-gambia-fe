/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/{app,components,libs,pages,hooks}/**/*.{html,js,ts,jsx,tsx}'],

	theme: {
		extend: {
			colors: {
				primary: '#1E3A8A',
				secondary: '#3B82F6',
				accent: '#F59E0B',
				'neutral-light': '#F3F4F6',
				'neutral-dark': '#111827',
				'text-primary': '#1F2937',
				'text-secondary': '#4B5563',
			},
			borderRadius: {
				DEFAULT: '8px',
			},
			boxShadow: {
				DEFAULT: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
			},
		},
	},
	plugins: [],
};
