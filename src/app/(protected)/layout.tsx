export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
	return <div className="bg-gray-100 dark:bg-gray-900">{children}</div>;
}
