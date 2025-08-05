'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { getCurrencyFromLocalStorage, handleFetchMessage, getSettings } from '@/lib/helpers';
import { getCurrentUser } from '@/lib/userUtils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { CustomLink } from '@/components/CustomLink';
interface FormData {
	productName: string;
	price: string;
	location: string;
	description: string;
	previewDescription: string;
	category: string;
	condition: string;
	images: File[];
	tags: string[];
	contactInfo: {
		phone: string;
		email: string;
		preferredContact: string;
	};
}

const initialFormData: FormData = {
	productName: '',
	price: '',
	location: '',
	description: '',
	previewDescription: '',
	category: '',
	condition: '',
	images: [],
	tags: [],
	contactInfo: {
		phone: '',
		email: '',
		preferredContact: 'phone',
	},
};

const locations = ['Monrovia', 'Gbarnga', 'Buchanan', 'Kakata', 'Zwedru', 'Harper', 'Voinjama', 'Robertsport', 'Sanniquellie', 'Greenville'];

const categories = ['Electronics', 'Clothing', 'Vehicles', 'Houses', 'Furniture', 'Books', 'Sports', 'Tools', 'Jewelry', 'Other'];

export function ProductForm() {
	const router = useRouter();
	const [currentStep, setCurrentStep] = useState(1);
	const [formData, setFormData] = useState<FormData>(initialFormData);
	const [errors, setErrors] = useState<{ [key: string]: string }>({});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isSubmitted, setIsSubmitted] = useState(false);
	const [newTag, setNewTag] = useState('');

	const validateStep1 = () => {
		const newErrors: { [key: string]: string } = {};

		if (!formData.productName.trim()) {
			newErrors.productName = 'Product name is required';
		} else if (formData.productName.length < 3) {
			newErrors.productName = 'Product name must be at least 3 characters';
		}

		if (!formData.price.trim()) {
			newErrors.price = 'Price is required';
		} else if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
			newErrors.price = 'Please enter a valid price';
		}

		if (!formData.location) {
			newErrors.location = 'Location is required';
		}

		if (!formData.description.trim()) {
			newErrors.description = 'Description is required';
		} else if (formData.description.length < 20) {
			newErrors.description = 'Description must be at least 20 characters';
		}

		if (!formData.previewDescription.trim()) {
			newErrors.previewDescription = 'Preview description is required';
		} else if (formData.previewDescription.length < 10) {
			newErrors.previewDescription = 'Preview description must be at least 10 characters';
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const validateStep2 = () => {
		const newErrors: { [key: string]: string } = {};

		if (!formData.category) {
			newErrors.category = 'Category is required';
		}

		if (!formData.condition) {
			newErrors.condition = 'Condition is required';
		}

		if (formData.images.length === 0) {
			newErrors.images = 'At least one image is required';
		} else if (formData.images.length > 4) {
			newErrors.images = 'Maximum 4 images allowed';
		}

		if (!formData.contactInfo.phone.trim()) {
			newErrors.phone = 'Phone number is required';
		} else if (!/^\d{10,15}$/.test(formData.contactInfo.phone.replace(/\s/g, ''))) {
			newErrors.phone = 'Please enter a valid phone number';
		}

		if (!formData.contactInfo.email.trim()) {
			newErrors.email = 'Email is required';
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactInfo.email)) {
			newErrors.email = 'Please enter a valid email address';
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleNext = () => {
		if (currentStep === 1 && validateStep1()) {
			setCurrentStep(2);
		}
	};

	const handleBack = () => {
		if (currentStep === 2) {
			setCurrentStep(1);
		}
	};

	const handleSubmit = async () => {
		if (!validateStep2()) return;

		setIsSubmitting(true);

		try {
			const user = getCurrentUser();
			if (!user || !user.id) {
				toast.error('User not found. Please log in again.');
				setIsSubmitting(false);
				return;
			}
			const form = new FormData();
			form.append('name', formData.productName);
			form.append('user', user.id);
			form.append('price', formData.price);
			form.append('location', formData.location);
			form.append('description', formData.description);
			form.append('previewDesc', formData.previewDescription);
			form.append('category', formData.category);
			form.append('condition', formData.condition);
			form.append('tags', formData.tags.join(','));
			form.append(
				'contactDetails',
				JSON.stringify({
					phone: formData.contactInfo.phone,
					email: formData.contactInfo.email,
				})
			);
			form.append('preferredContact', formData.contactInfo.preferredContact);
			form.append('status', 'pending');
			formData.images.forEach((img) => {
				form.append('images', img);
			});

			const res = await fetchWithAuth('/api/marketplace', {
				method: 'POST',
				body: form,
			});
			const data = await res.json();
			if (res.ok) {
				toast.success('Product uploaded successfully!');
				setIsSubmitted(true);
			} else {
				toast.error(handleFetchMessage(data, 'Failed to upload product.'));
			}
		} catch (err) {
			const errorMessage = handleFetchMessage(err, 'An error occurred while uploading product.');
			toast.error(errorMessage);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleInputChange = (field: string, value: string) => {
		if (field.includes('.')) {
			const [parent, child] = field.split('.');
			setFormData((prev) => ({
				...prev,
				[parent]: {
					...(prev[parent as keyof FormData] as Record<string, any>),
					[child]: value,
				},
			}));
		} else {
			setFormData((prev) => ({ ...prev, [field]: value }));
		}

		if (errors[field]) {
			setErrors((prev) => ({ ...prev, [field]: '' }));
		}
	};

	const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(e.target.files || []);
		const totalImages = formData.images.length + files.length;

		if (totalImages > 4) {
			setErrors((prev) => ({ ...prev, images: 'Maximum 4 images allowed' }));
			return;
		}

		setFormData((prev) => ({ ...prev, images: [...prev.images, ...files] }));

		if (errors.images) {
			setErrors((prev) => ({ ...prev, images: '' }));
		}
	};

	const removeImage = (index: number) => {
		setFormData((prev) => ({
			...prev,
			images: prev.images.filter((_, i) => i !== index),
		}));
	};

	const addTag = () => {
		if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
			setFormData((prev) => ({
				...prev,
				tags: [...prev.tags, newTag.trim()],
			}));
			setNewTag('');
		}
	};

	const removeTag = (tagToRemove: string) => {
		setFormData((prev) => ({
			...prev,
			tags: prev.tags.filter((tag) => tag !== tagToRemove),
		}));
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter') {
			e.preventDefault();
			addTag();
		}
	};

	if (isSubmitted) {
		return (
			<div className="max-w-2xl mx-auto">
				<Card className="text-center">
					<CardContent className="p-8 lg:p-12">
						<div className="mb-6">
							<div className="w-16 h-16 lg:w-20 lg:h-20 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
								<img
									src="https://readdy.ai/api/search-image?query=green%20checkmark%20success%20icon%20with%20white%20background%2C%20circular%20design%2C%20modern%20flat%20style%20illustration%2C%20positive%20confirmation%20symbol%2C%20professional%20business%20graphics%2C%20clean%20minimal%20design&width=80&height=80&seq=success-icon&orientation=squarish"
									alt="Success"
									className="w-10 h-10 lg:w-12 lg:h-12 object-cover"
								/>
							</div>
							<h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">Upload Successful</h2>
							<p className="text-gray-600 text-sm lg:text-base max-w-md mx-auto">You have successfully uploaded your product, it is currently under review. Once it is approved, it will be visible to other users</p>
						</div>

						<div className="space-y-3">
							<CustomLink href="/user/my-listings">
								<Button className="w-full bg-blue-900 hover:bg-blue-800 text-white py-3 whitespace-nowrap">Return to my listings</Button>
							</CustomLink>

							<Button
								variant="outline"
								className="w-full py-3 whitespace-nowrap"
								onClick={() => {
									setIsSubmitted(false);
									setCurrentStep(1);
									setFormData(initialFormData);
									setErrors({});
								}}
							>
								Add another product
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="max-w-2xl mx-auto">
			<Card>
				<CardHeader>
					<CardTitle className="text-xl font-semibold text-gray-900">Add New Product</CardTitle>
					<div className="flex items-center mt-4">
						<span className="text-sm text-gray-600 mr-4">{currentStep} of 2</span>
						<div className="flex-1 flex gap-2">
							<div className={`h-2 rounded-full flex-1 ${currentStep >= 1 ? 'bg-blue-900' : 'bg-gray-200'}`} />
							<div className={`h-2 rounded-full flex-1 ${currentStep >= 2 ? 'bg-blue-900' : 'bg-gray-200'}`} />
						</div>
					</div>
				</CardHeader>

				<CardContent>
					{currentStep === 1 && (
						<div className="space-y-6">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
								<div className="relative">
									<i className="ri-shopping-bag-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 flex items-center justify-center"></i>
									<input
										type="text"
										value={formData.productName}
										onChange={(e) => handleInputChange('productName', e.target.value)}
										className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${errors.productName ? 'border-red-500' : 'border-gray-300'}`}
										placeholder="Enter product name"
									/>
								</div>
								{errors.productName && <p className="mt-1 text-sm text-red-600">{errors.productName}</p>}
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">Price ({getSettings()?.baseCurrency ? getSettings()?.baseCurrency : getCurrencyFromLocalStorage()?.code})</label>
								<div className="relative">
									<i className="ri-money-dollar-circle-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 flex items-center justify-center"></i>
									<input
										type="text"
										value={formData.price}
										onChange={(e) => handleInputChange('price', e.target.value)}
										className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${errors.price ? 'border-red-500' : 'border-gray-300'}`}
										placeholder="Enter product price"
									/>
								</div>
								{errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
								<div className="relative">
									<i className="ri-map-pin-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 flex items-center justify-center"></i>
									<select
										value={formData.location}
										onChange={(e) => handleInputChange('location', e.target.value)}
										className={`w-full pl-10 pr-8 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none cursor-pointer ${errors.location ? 'border-red-500' : 'border-gray-300'}`}
									>
										<option value="">Select your location</option>
										{locations.map((location) => (
											<option key={location} value={location}>
												{location}
											</option>
										))}
									</select>
									<i className="ri-arrow-down-s-line absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 flex items-center justify-center pointer-events-none"></i>
								</div>
								{errors.location && <p className="mt-1 text-sm text-red-600">{errors.location}</p>}
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
								<div className="relative">
									<i className="ri-file-text-line absolute left-3 top-3 text-gray-400 w-4 h-4 flex items-center justify-center"></i>
									<textarea
										value={formData.description}
										onChange={(e) => handleInputChange('description', e.target.value)}
										rows={4}
										className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
										placeholder="Enter product description"
									/>
								</div>
								{errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">Preview Description</label>
								<p className="text-sm text-gray-500 mb-2">This text will be displayed below the product name</p>
								<div className="relative">
									<i className="ri-eye-line absolute left-3 top-3 text-gray-400 w-4 h-4 flex items-center justify-center"></i>
									<textarea
										value={formData.previewDescription}
										onChange={(e) => handleInputChange('previewDescription', e.target.value)}
										rows={3}
										className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none ${errors.previewDescription ? 'border-red-500' : 'border-gray-300'}`}
										placeholder="Enter preview description"
									/>
								</div>
								{errors.previewDescription && <p className="mt-1 text-sm text-red-600">{errors.previewDescription}</p>}
							</div>

							<div className="pt-4">
								<Button onClick={handleNext} className="w-full bg-blue-900 hover:bg-blue-800 text-white py-3 whitespace-nowrap">
									Next
								</Button>
							</div>
						</div>
					)}

					{currentStep === 2 && (
						<div className="space-y-6">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
								<p className="text-sm text-gray-500 mb-3">Upload at least 1 picture, maximum 4 pictures. First picture - is the title picture. You can change the order of photos; just grab your photos and drag</p>
								<div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
									{[...Array(4)].map((_, index) => (
										<div key={index} className="relative">
											{formData.images[index] ? (
												<div className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative">
													<img src={URL.createObjectURL(formData.images[index])} alt={`Upload ${index + 1}`} className="w-full h-full object-cover" />
													<button onClick={() => removeImage(index)} className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center cursor-pointer hover:bg-red-600">
														<i className="ri-close-line w-3 h-3 flex items-center justify-center text-xs"></i>
													</button>
												</div>
											) : (
												<div className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-500 transition-colors">
													<label htmlFor="image-upload" className="cursor-pointer">
														<i className="ri-add-line w-8 h-8 flex items-center justify-center text-2xl text-gray-400"></i>
													</label>
												</div>
											)}
										</div>
									))}
								</div>
								<input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" id="image-upload" />
								<p className="text-sm text-gray-500">Supported formats - .png and .jpeg</p>
								{errors.images && <p className="mt-1 text-sm text-red-600">{errors.images}</p>}
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
								<div className="relative">
									<i className="ri-apps-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 flex items-center justify-center"></i>
									<select
										value={formData.category}
										onChange={(e) => handleInputChange('category', e.target.value)}
										className={`w-full pl-10 pr-8 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none cursor-pointer ${errors.category ? 'border-red-500' : 'border-gray-300'}`}
									>
										<option value="">Select category</option>
										{categories.map((category) => (
											<option key={category} value={category}>
												{category}
											</option>
										))}
									</select>
									<i className="ri-arrow-down-s-line absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 flex items-center justify-center pointer-events-none"></i>
								</div>
								{errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">Condition</label>
								<div className="relative">
									<i className="ri-settings-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 flex items-center justify-center"></i>
									<select
										value={formData.condition}
										onChange={(e) => handleInputChange('condition', e.target.value)}
										className={`w-full pl-10 pr-8 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none cursor-pointer ${errors.condition ? 'border-red-500' : 'border-gray-300'}`}
									>
										<option value="">Select product condition</option>
										<option value="new">New</option>
										<option value="used">Used</option>
										<option value="refurbished">Refurbished</option>
									</select>
									<i className="ri-arrow-down-s-line absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 flex items-center justify-center pointer-events-none"></i>
								</div>
								{errors.condition && <p className="mt-1 text-sm text-red-600">{errors.condition}</p>}
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
								<div className="flex flex-wrap gap-2 mb-3">
									{formData.tags.map((tag, index) => (
										<span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm flex items-center gap-2">
											{tag}
											<button onClick={() => removeTag(tag)} className="text-gray-500 hover:text-red-500">
												<i className="ri-close-line w-3 h-3 flex items-center justify-center"></i>
											</button>
										</span>
									))}
								</div>
								<div className="flex gap-2">
									<input type="text" value={newTag} onChange={(e) => setNewTag(e.target.value)} onKeyPress={handleKeyPress} placeholder="Enter a tag" className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm" />
									<Button onClick={addTag} type="button" variant="outline" className="px-4 py-2 whitespace-nowrap">
										Add Tag
									</Button>
								</div>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">Contact Details</label>
								<div className="space-y-4">
									<div className="relative">
										<i className="ri-phone-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 flex items-center justify-center"></i>
										<input
											type="tel"
											value={formData.contactInfo.phone}
											onChange={(e) => handleInputChange('contactInfo.phone', e.target.value)}
											className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
											placeholder="Enter phone number"
										/>
									</div>
									{errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}

									<div className="relative">
										<i className="ri-mail-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 flex items-center justify-center"></i>
										<input
											type="email"
											value={formData.contactInfo.email}
											onChange={(e) => handleInputChange('contactInfo.email', e.target.value)}
											className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
											placeholder="Enter email address"
										/>
									</div>
									{errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}

									<div>
										<p className="text-sm text-gray-700 mb-2">Preferred Contact Method</p>
										<div className="flex gap-4">
											<label className="flex items-center cursor-pointer">
												<input type="radio" name="preferredContact" value="phone" checked={formData.contactInfo.preferredContact === 'phone'} onChange={(e) => handleInputChange('contactInfo.preferredContact', e.target.value)} className="mr-2" />
												<span className="text-sm">Phone</span>
											</label>
											<label className="flex items-center cursor-pointer">
												<input type="radio" name="preferredContact" value="email" checked={formData.contactInfo.preferredContact === 'email'} onChange={(e) => handleInputChange('contactInfo.preferredContact', e.target.value)} className="mr-2" />
												<span className="text-sm">Email</span>
											</label>
										</div>
									</div>
								</div>
							</div>

							<div className="pt-4 flex gap-3">
								<Button onClick={handleBack} variant="outline" className="flex-1 py-3 whitespace-nowrap">
									Back
								</Button>
								<Button onClick={handleSubmit} disabled={isSubmitting} className="flex-1 bg-blue-900 hover:bg-blue-800 text-white py-3 whitespace-nowrap">
									{isSubmitting ? (
										<>
											<i className="ri-loader-4-line animate-spin mr-2 w-4 h-4 flex items-center justify-center"></i>
											Uploading...
										</>
									) : (
										'Upload'
									)}
								</Button>
							</div>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
