'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { getCurrencyFromLocalStorage, handleFetchMessage, getSettings } from '@/lib/helpers';
import { getCurrentUser } from '@/lib/userUtils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { CustomLink } from '@/components/CustomLink';
import { cn } from '@/lib/utils';

// NOTE: All original interfaces and logic are preserved.
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
		if (!formData.productName.trim()) newErrors.productName = 'Product name is required';
		else if (formData.productName.length < 3) newErrors.productName = 'Product name must be at least 3 characters';
		if (!formData.price.trim()) newErrors.price = 'Price is required';
		else if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) newErrors.price = 'Please enter a valid price';
		if (!formData.location) newErrors.location = 'Location is required';
		if (!formData.description.trim()) newErrors.description = 'Description is required';
		else if (formData.description.length < 20) newErrors.description = 'Description must be at least 20 characters';
		if (!formData.previewDescription.trim()) newErrors.previewDescription = 'Preview description is required';
		else if (formData.previewDescription.length < 10) newErrors.previewDescription = 'Preview description must be at least 10 characters';
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const validateStep2 = () => {
		const newErrors: { [key: string]: string } = {};
		if (!formData.category) newErrors.category = 'Category is required';
		if (!formData.condition) newErrors.condition = 'Condition is required';
		if (formData.images.length === 0) newErrors.images = 'At least one image is required';
		else if (formData.images.length > 4) newErrors.images = 'Maximum 4 images allowed';
		if (!formData.contactInfo.phone.trim()) newErrors.phone = 'Phone number is required';
		else if (!/^\d{10,15}$/.test(formData.contactInfo.phone.replace(/\s/g, ''))) newErrors.phone = 'Please enter a valid phone number';
		if (!formData.contactInfo.email.trim()) newErrors.email = 'Email is required';
		else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactInfo.email)) newErrors.email = 'Please enter a valid email address';
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleNext = () => {
		if (currentStep === 1 && validateStep1()) setCurrentStep(2);
	};

	const handleBack = () => {
		if (currentStep === 2) setCurrentStep(1);
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
			form.append('contactDetails', JSON.stringify({ phone: formData.contactInfo.phone, email: formData.contactInfo.email }));
			form.append('preferredContact', formData.contactInfo.preferredContact);
			form.append('status', 'pending');
			formData.images.forEach((img) => form.append('images', img));
			const res = await fetchWithAuth('/api/marketplace', { method: 'POST', body: form });
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

	const handleInputChange = (field: string, value: any) => {
		if (field.includes('.')) {
			const [parent, child] = field.split('.');
			setFormData((prev) => ({ ...prev, [parent]: { ...(prev[parent as keyof FormData] as Record<string, any>), [child]: value } }));
		} else {
			setFormData((prev) => ({ ...prev, [field]: value }));
		}
		if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
	};

	const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(e.target.files || []);
		const totalImages = formData.images.length + files.length;
		if (totalImages > 4) {
			setErrors((prev) => ({ ...prev, images: 'Maximum 4 images allowed' }));
			return;
		}
		setFormData((prev) => ({ ...prev, images: [...prev.images, ...files] }));
		if (errors.images) setErrors((prev) => ({ ...prev, images: '' }));
	};

	const removeImage = (index: number) => {
		setFormData((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
	};

	const addTag = () => {
		if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
			setFormData((prev) => ({ ...prev, tags: [...prev.tags, newTag.trim()] }));
			setNewTag('');
		}
	};

	const removeTag = (tagToRemove: string) => {
		setFormData((prev) => ({ ...prev, tags: prev.tags.filter((tag) => tag !== tagToRemove) }));
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter') {
			e.preventDefault();
			addTag();
		}
	};

	// ===============================================
	// START: Redesigned JSX
	// ===============================================

	if (isSubmitted) {
		return (
			<Card className="text-center">
				<CardContent className="p-8 lg:p-12">
					<div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
						<i className="ri-check-line text-3xl text-teal-600"></i>
					</div>
					<h2 className="text-2xl font-bold text-gray-800 mb-2">Upload Successful</h2>
					<p className="text-gray-500 max-w-md mx-auto mb-8">Your product has been submitted for review. Once approved, it will be live on the marketplace.</p>
					<div className="flex flex-col sm:flex-row gap-3 justify-center">
						<CustomLink href="/user/my-listings">
							<Button variant="outline" className="w-full">
								View My Listings
							</Button>
						</CustomLink>
						<Button
							className="w-full"
							onClick={() => {
								setIsSubmitted(false);
								setCurrentStep(1);
								setFormData(initialFormData);
								setErrors({});
							}}
						>
							List Another Product
						</Button>
					</div>
				</CardContent>
			</Card>
		);
	}

	const renderStepContent = () => {
		if (currentStep === 1) {
			return (
				<div className="space-y-6">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
						<input type="text" value={formData.productName} onChange={(e) => handleInputChange('productName', e.target.value)} className={cn('w-full px-3 py-2 border rounded-lg', errors.productName ? 'border-red-500' : 'border-gray-300')} placeholder="e.g. 2021 Apple MacBook Pro" />
						{errors.productName && <p className="mt-1 text-sm text-red-600">{errors.productName}</p>}
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">Price ({getSettings()?.baseCurrency || getCurrencyFromLocalStorage()?.code}) *</label>
							<input type="number" value={formData.price} onChange={(e) => handleInputChange('price', e.target.value)} className={cn('w-full px-3 py-2 border rounded-lg', errors.price ? 'border-red-500' : 'border-gray-300')} placeholder="e.g. 1500" />
							{errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
							<select value={formData.location} onChange={(e) => handleInputChange('location', e.target.value)} className={cn('w-full px-3 py-2 border rounded-lg', errors.location ? 'border-red-500' : 'border-gray-300')}>
								<option value="">Select location</option>
								{locations.map((loc) => (
									<option key={loc} value={loc}>
										{loc}
									</option>
								))}
							</select>
							{errors.location && <p className="mt-1 text-sm text-red-600">{errors.location}</p>}
						</div>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">Short Description *</label>
						<textarea
							value={formData.previewDescription}
							onChange={(e) => handleInputChange('previewDescription', e.target.value)}
							rows={2}
							className={cn('w-full px-3 py-2 border rounded-lg resize-none', errors.previewDescription ? 'border-red-500' : 'border-gray-300')}
							placeholder="A brief summary for the listing card."
						/>
						{errors.previewDescription && <p className="mt-1 text-sm text-red-600">{errors.previewDescription}</p>}
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">Full Description *</label>
						<textarea
							value={formData.description}
							onChange={(e) => handleInputChange('description', e.target.value)}
							rows={5}
							className={cn('w-full px-3 py-2 border rounded-lg resize-none', errors.description ? 'border-red-500' : 'border-gray-300')}
							placeholder="Provide a detailed description of your product."
						/>
						{errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
					</div>
				</div>
			);
		}
		if (currentStep === 2) {
			return (
				<div className="space-y-6">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">Product Images *</label>
						<p className="text-xs text-gray-500 mb-3">Upload up to 4 images. The first image will be the cover.</p>
						<div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
							{formData.images.map((file, index) => (
								<div key={index} className="relative aspect-square">
									<img src={URL.createObjectURL(file)} alt={`preview ${index}`} className="w-full h-full object-cover rounded-lg" />
									<button onClick={() => removeImage(index)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-500">
										&times;
									</button>
								</div>
							))}
							{formData.images.length < 4 && (
								<label htmlFor="image-upload" className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-teal-500 hover:text-teal-600 text-gray-400 transition-colors">
									<i className="ri-add-line text-2xl"></i>
									<span className="text-xs mt-1">Add Image</span>
								</label>
							)}
						</div>
						<input type="file" id="image-upload" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
						{errors.images && <p className="mt-1 text-sm text-red-600">{errors.images}</p>}
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
							<select value={formData.category} onChange={(e) => handleInputChange('category', e.target.value)} className={cn('w-full px-3 py-2 border rounded-lg', errors.category ? 'border-red-500' : 'border-gray-300')}>
								<option value="">Select category</option>
								{categories.map((cat) => (
									<option key={cat} value={cat}>
										{cat}
									</option>
								))}
							</select>
							{errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">Condition *</label>
							<select value={formData.condition} onChange={(e) => handleInputChange('condition', e.target.value)} className={cn('w-full px-3 py-2 border rounded-lg', errors.condition ? 'border-red-500' : 'border-gray-300')}>
								<option value="">Select condition</option>
								<option value="new">New</option>
								<option value="used">Used</option>
								<option value="refurbished">Refurbished</option>
							</select>
							{errors.condition && <p className="mt-1 text-sm text-red-600">{errors.condition}</p>}
						</div>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">Contact Details *</label>
						<div className="space-y-4">
							<input type="tel" value={formData.contactInfo.phone} onChange={(e) => handleInputChange('contactInfo.phone', e.target.value)} className={cn('w-full px-3 py-2 border rounded-lg', errors.phone ? 'border-red-500' : 'border-gray-300')} placeholder="Phone Number" />
							{errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
							<input type="email" value={formData.contactInfo.email} onChange={(e) => handleInputChange('contactInfo.email', e.target.value)} className={cn('w-full px-3 py-2 border rounded-lg', errors.email ? 'border-red-500' : 'border-gray-300')} placeholder="Email Address" />
							{errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
						</div>
					</div>
				</div>
			);
		}
	};

	return (
		<Card className="overflow-hidden">
			<div className="grid grid-cols-1 lg:grid-cols-4">
				{/* Step Navigator Sidebar */}
				<div className="lg:col-span-1 p-6 bg-gray-50 border-b lg:border-b-0 lg:border-r border-gray-200">
					<div className="space-y-6">
						<div className="flex items-start gap-4">
							<div className={cn('w-8 h-8 rounded-full flex items-center justify-center font-bold', currentStep === 1 ? 'bg-teal-600 text-white' : 'bg-gray-300 text-gray-600')}>1</div>
							<div>
								<h3 className="font-semibold text-gray-800">Product Details</h3>
								<p className="text-sm text-gray-500">Name, price, and description.</p>
							</div>
						</div>
						<div className="flex items-start gap-4">
							<div className={cn('w-8 h-8 rounded-full flex items-center justify-center font-bold', currentStep === 2 ? 'bg-teal-600 text-white' : 'bg-gray-300 text-gray-600')}>2</div>
							<div>
								<h3 className="font-semibold text-gray-800">Media & Contact</h3>
								<p className="text-sm text-gray-500">Images, category, and your info.</p>
							</div>
						</div>
					</div>
				</div>

				{/* Form Content */}
				<div className="lg:col-span-3">
					<form onSubmit={(e) => e.preventDefault()}>
						<CardContent className="p-6">{renderStepContent()}</CardContent>
						<CardFooter className="justify-between">
							{currentStep === 1 ? (
								<div></div> // Placeholder for spacing
							) : (
								<Button variant="outline" onClick={handleBack}>
									Back
								</Button>
							)}
							{currentStep === 1 ? (
								<Button onClick={handleNext}>Next</Button>
							) : (
								<Button onClick={handleSubmit} disabled={isSubmitting}>
									{isSubmitting ? 'Submitting...' : 'Submit Product'}
								</Button>
							)}
						</CardFooter>
					</form>
				</div>
			</div>
		</Card>
	);
}
