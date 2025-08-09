import { ProductForm } from './ProductForm';

export default function AddProductPage() {
	return (
		// The page now has a consistent background and padding.
		<div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8">
			<div className="max-w-5xl mx-auto">
				{/* A standard page header has been added for context */}
				<header className="mb-8">
					<h1 className="text-3xl font-bold text-gray-800">List a New Product</h1>
					<p className="text-gray-500 mt-1">Fill out the details below to publish your item on the marketplace.</p>
				</header>
				<ProductForm />
			</div>
		</div>
	);
}
