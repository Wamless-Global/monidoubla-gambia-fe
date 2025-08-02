import { ProductForm } from './ProductForm';

export default function AddProductPage() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-emerald-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 py-0 px-0 flex items-center justify-center">
			<div className="w-full max-w-3xl mx-auto py-10 px-2 sm:px-6">
				<ProductForm />
			</div>
		</div>
	);
}
