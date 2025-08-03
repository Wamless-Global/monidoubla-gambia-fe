import { ProductForm } from './ProductForm';

export default function AddProductPage() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-background to-blue-50 dark:to-blue-950/40 py-8 px-2 lg:px-0 flex items-center justify-center">
			<div className="w-full max-w-2xl mx-auto">
				<ProductForm />
			</div>
		</div>
	);
}
