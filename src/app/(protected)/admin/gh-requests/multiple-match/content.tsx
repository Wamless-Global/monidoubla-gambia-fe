'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { CustomLink } from '@/components/CustomLink';
import { getCurrencyFromLocalStorage, getSettings } from '@/lib/helpers';

interface GHRequest {
	id: string;
	ghUser: string;
	amount: number;
	date: string;
	status: 'Pending' | 'Matched' | 'Completed';
	location: string;
	phoneNumber: string;
	email: string;
	notes: string;
	remainingAmount?: number;
}

interface PHRequest {
	id: string;
	phUser: string;
	amount: number;
	date: string;
	status: 'Available' | 'Matched' | 'Paid';
	location: string;
	phoneNumber: string;
	email: string;
	availableAmount?: number;
}

export default function MultipleMatchPage() {
	const [allGHRequests, setAllGHRequests] = useState<GHRequest[]>([]);
	const [allPHRequests, setAllPHRequests] = useState<PHRequest[]>([]);
	const [selectedGHRequests, setSelectedGHRequests] = useState<GHRequest[]>([]);
	const [selectedPHRequests, setSelectedPHRequests] = useState<PHRequest[]>([]);
	const [loading, setLoading] = useState(true);
	const [ghSearchTerm, setGHSearchTerm] = useState('');
	const [phSearchTerm, setPHSearchTerm] = useState('');
	const [filteredGHRequests, setFilteredGHRequests] = useState<GHRequest[]>([]);
	const [filteredPHRequests, setFilteredPHRequests] = useState<PHRequest[]>([]);
	const [matching, setMatching] = useState(false);
	const [ghCurrentPage, setGHCurrentPage] = useState(1);
	const [phCurrentPage, setPHCurrentPage] = useState(1);
	const [ghLoading, setGHLoading] = useState(false);
	const [phLoading, setPHLoading] = useState(false);

	const itemsPerPage = 10;

	// Enhanced mock data generation with partial amounts
	const generateMockGHRequests = (count: number): GHRequest[] => {
		const names = ['John Michael', 'Sarah Johnson', 'Michael Brown', 'Emily Davis', 'David Wilson', 'Lisa Anderson', 'Robert Taylor', 'Jennifer Martinez', 'James Thompson', 'Maria Garcia'];
		const locations = ['Monrovia, Liberia', 'Gbarnga, Liberia', 'Buchanan, Liberia', 'Kakata, Liberia', 'Zwedru, Liberia'];

		return Array.from({ length: count }, (_, i) => {
			const amount = Math.floor(Math.random() * 2000) + 500;
			const matchedAmount = Math.random() > 0.7 ? Math.floor(Math.random() * amount * 0.5) : 0;
			return {
				id: `gh-${i + 1}`,
				ghUser: names[i % names.length] + ` ${i + 1}`,
				amount,
				remainingAmount: amount - matchedAmount,
				date: `${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-2025`,
				status: 'Pending' as const,
				location: locations[i % locations.length],
				phoneNumber: `+233 ${20 + (i % 50)} ${100 + (i % 900)} ${1000 + (i % 9000)}`,
				email: `${names[i % names.length].toLowerCase().replace(' ', '.')}${i + 1}@email.com`,
				notes: 'donation request',
			};
		});
	};

	const generateMockPHRequests = (count: number): PHRequest[] => {
		const names = ['Alice Smith', 'Bob Johnson', 'Carol Williams', 'Daniel Brown', 'Eva Davis', 'Frank Wilson', 'Grace Taylor', 'Henry Martinez', 'Ivy Thompson', 'Jack Garcia'];
		const locations = ['Monrovia, Liberia', 'Gbarnga, Liberia', 'Buchanan, Liberia', 'Kakata, Liberia', 'Zwedru, Liberia'];

		return Array.from({ length: count }, (_, i) => {
			const amount = Math.floor(Math.random() * 1500) + 300;
			const usedAmount = Math.random() > 0.6 ? Math.floor(Math.random() * amount * 0.4) : 0;
			return {
				id: `ph-${i + 1}`,
				phUser: names[i % names.length] + ` ${i + 1}`,
				amount,
				availableAmount: amount - usedAmount,
				date: `${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-2025`,
				status: 'Available' as const,
				location: locations[i % locations.length],
				phoneNumber: `+233 ${20 + (i % 50)} ${100 + (i % 900)} ${1000 + (i % 9000)}`,
				email: `${names[i % names.length].toLowerCase().replace(' ', '.')}${i + 1}@email.com`,
			};
		});
	};

	useEffect(() => {
		loadData();
	}, []);

	useEffect(() => {
		filterGHRequests();
	}, [allGHRequests, ghSearchTerm]);

	useEffect(() => {
		filterPHRequests();
	}, [allPHRequests, phSearchTerm]);

	const loadData = async () => {
		setLoading(true);
		setTimeout(() => {
			setAllGHRequests(generateMockGHRequests(1500));
			setAllPHRequests(generateMockPHRequests(2000));
			setLoading(false);
		}, 1000);
	};

	const filterGHRequests = () => {
		let filtered = allGHRequests.filter((request) => {
			const matchesSearch = request.ghUser.toLowerCase().includes(ghSearchTerm.toLowerCase()) || request.email.toLowerCase().includes(ghSearchTerm.toLowerCase());
			return matchesSearch && (request.remainingAmount || 0) > 0;
		});

		setFilteredGHRequests(filtered);
		setGHCurrentPage(1);
	};

	const filterPHRequests = () => {
		let filtered = allPHRequests.filter((request) => {
			const matchesSearch = request.phUser.toLowerCase().includes(phSearchTerm.toLowerCase()) || request.email.toLowerCase().includes(phSearchTerm.toLowerCase());
			return matchesSearch && (request.availableAmount || 0) > 0;
		});

		setFilteredPHRequests(filtered);
		setPHCurrentPage(1);
	};

	const handleGHRequestToggle = (request: GHRequest) => {
		const isSelected = selectedGHRequests.some((r) => r.id === request.id);

		if (isSelected) {
			setSelectedGHRequests(selectedGHRequests.filter((r) => r.id !== request.id));
		} else {
			setSelectedGHRequests([...selectedGHRequests, request]);
		}
	};

	const handlePHRequestToggle = (request: PHRequest) => {
		const isSelected = selectedPHRequests.some((r) => r.id === request.id);

		if (isSelected) {
			setSelectedPHRequests(selectedPHRequests.filter((r) => r.id !== request.id));
		} else {
			setSelectedPHRequests([...selectedPHRequests, request]);
		}
	};

	const canMatch = () => {
		if (selectedGHRequests.length === 0 || selectedPHRequests.length === 0) {
			return false;
		}

		const totalGHAmount = selectedGHRequests.reduce((sum, r) => sum + (r.remainingAmount || 0), 0);
		const totalPHAmount = selectedPHRequests.reduce((sum, r) => sum + (r.availableAmount || 0), 0);

		return totalPHAmount >= totalGHAmount;
	};

	const handleConfirmMatch = async () => {
		if (!canMatch()) {
			toast.error('Cannot match: insufficient PH amount or no selections');
			return;
		}

		setMatching(true);

		try {
			await new Promise((resolve) => setTimeout(resolve, 2000));

			// Simulate dynamic matching logic
			const totalGHAmount = selectedGHRequests.reduce((sum, r) => sum + (r.remainingAmount || 0), 0);
			const totalPHAmount = selectedPHRequests.reduce((sum, r) => sum + (r.availableAmount || 0), 0);

			// Update amounts based on matching
			const selectedGHIds = selectedGHRequests.map((r) => r.id);
			const selectedPHIds = selectedPHRequests.map((r) => r.id);

			setAllGHRequests((prevRequests) =>
				prevRequests.map((r) => {
					if (selectedGHIds.includes(r.id)) {
						return { ...r, remainingAmount: 0, status: 'Matched' as const };
					}
					return r;
				})
			);

			setAllPHRequests((prevRequests) =>
				prevRequests.map((r) => {
					if (selectedPHIds.includes(r.id)) {
						return { ...r, availableAmount: Math.max(0, (r.availableAmount || 0) - 100), status: 'Matched' as const };
					}
					return r;
				})
			);

			toast.success(`Successfully matched ${selectedGHRequests.length} GH requests with ${selectedPHRequests.length} PH requests!`);
			setSelectedGHRequests([]);
			setSelectedPHRequests([]);
		} catch (error) {
			toast.error('Failed to match users. Please try again.');
		} finally {
			setMatching(false);
		}
	};

	const handleGHPageChange = async (page: number) => {
		setGHLoading(true);
		setGHCurrentPage(page);
		await new Promise((resolve) => setTimeout(resolve, 300));
		setGHLoading(false);
	};

	const handlePHPageChange = async (page: number) => {
		setPHLoading(true);
		setPHCurrentPage(page);
		await new Promise((resolve) => setTimeout(resolve, 300));
		setPHLoading(false);
	};

	const totalGHAmount = selectedGHRequests.reduce((sum, r) => sum + (r.remainingAmount || 0), 0);
	const totalPHAmount = selectedPHRequests.reduce((sum, r) => sum + (r.availableAmount || 0), 0);

	const ghTotalPages = Math.ceil(filteredGHRequests.length / itemsPerPage);
	const phTotalPages = Math.ceil(filteredPHRequests.length / itemsPerPage);

	const currentGHRequests = filteredGHRequests.slice((ghCurrentPage - 1) * itemsPerPage, ghCurrentPage * itemsPerPage);

	const currentPHRequests = filteredPHRequests.slice((phCurrentPage - 1) * itemsPerPage, phCurrentPage * itemsPerPage);

	if (loading) {
		return (
			<div className="p-6 space-y-6  min-h-screen">
				<div className="animate-pulse">
					<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
						<div className="flex items-center gap-4">
							<div className="h-9 w-9 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
							<div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
						</div>
						<div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
					</div>
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						{Array.from({ length: 2 }).map((_, index) => (
							<div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border-0">
								<div className="p-4 border-b border-gray-200 dark:border-gray-700">
									<div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-2"></div>
									<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4"></div>
									<div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
								</div>
								<div className="p-4">
									<div className="space-y-3 mb-4">
										{Array.from({ length: 5 }).map((_, i) => (
											<div key={i} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
												<div className="flex items-center gap-3">
													<div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
													<div>
														<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-1"></div>
														<div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
													</div>
												</div>
												<div className="text-right">
													<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-1"></div>
													<div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
												</div>
											</div>
										))}
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="p-6 space-y-6  min-h-screen">
			{/* Header */}
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
				<div className="flex items-center gap-4">
					<CustomLink href="/admin/gh-requests" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
						<i className="ri-arrow-left-line w-5 h-5 flex items-center justify-center text-gray-500 dark:text-gray-400"></i>
					</CustomLink>
					<h1 className="text-2xl font-bold text-gray-900 dark:text-white">Multiple Match</h1>
				</div>
				<Button onClick={handleConfirmMatch} disabled={matching || !canMatch()} className="bg-blue-600 hover:bg-blue-700 text-white whitespace-nowrap min-w-[140px]">
					{matching ? (
						<div className="flex items-center gap-2">
							<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
							<span>Matching...</span>
						</div>
					) : (
						'Confirm match'
					)}
				</Button>
			</div>

			{/* Matching Summary */}
			{(selectedGHRequests.length > 0 || selectedPHRequests.length > 0) && (
				<Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700">
					<div className="flex items-center justify-between text-sm">
						<div className="flex items-center gap-4">
							<span className="text-blue-700 dark:text-blue-300">
								GH Selected: {selectedGHRequests.length} ({totalGHAmount} {getSettings()?.baseCurrency ? getSettings()?.baseCurrency : getCurrencyFromLocalStorage()?.code})
							</span>
							<span className="text-blue-700 dark:text-blue-300">
								PH Selected: {selectedPHRequests.length} ({totalPHAmount} {getSettings()?.baseCurrency ? getSettings()?.baseCurrency : getCurrencyFromLocalStorage()?.code})
							</span>
						</div>
						<div className={`font-medium ${canMatch() ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>{canMatch() ? 'Ready to match' : 'Cannot match'}</div>
					</div>
				</Card>
			)}

			{/* Content */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Available GH Requests */}
				<Card className="bg-white dark:bg-gray-800 border-0 shadow-sm rounded-lg">
					<div className="p-4 border-b border-gray-200 dark:border-gray-700">
						<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Available GH Requests</h3>
						<p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
							Total: {filteredGHRequests.length} users | Selected: {selectedGHRequests.length} | Amount:{' '}
							<span className="font-medium text-gray-900 dark:text-white">
								{totalGHAmount} {getSettings()?.baseCurrency ? getSettings()?.baseCurrency : getCurrencyFromLocalStorage()?.code}
							</span>
						</p>
						<div className="relative">
							<i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 flex items-center justify-center"></i>
							<input
								type="text"
								placeholder="Search GH requests..."
								className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
								value={ghSearchTerm}
								onChange={(e) => setGHSearchTerm(e.target.value)}
							/>
						</div>
					</div>
					<div className="p-4">
						{ghLoading ? (
							<div className="flex items-center justify-center py-8">
								<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
							</div>
						) : (
							<>
								<div className="space-y-3 mb-4">
									{currentGHRequests.map((request) => {
										const isSelected = selectedGHRequests.some((r) => r.id === request.id);
										return (
											<div
												key={request.id}
												className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
													isSelected ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700' : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
												}`}
												onClick={() => handleGHRequestToggle(request)}
											>
												<div className="flex items-center gap-3">
													<input
														type="checkbox"
														checked={isSelected}
														onChange={() => handleGHRequestToggle(request)}
														className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
													/>
													<div>
														<div className="font-medium text-gray-900 dark:text-white text-sm">{request.ghUser}</div>
														<div className="text-xs text-gray-500 dark:text-gray-400">{request.email}</div>
													</div>
												</div>
												<div className="text-right">
													<div className="font-medium text-gray-900 dark:text-white text-sm">
														{request.remainingAmount} {getSettings()?.baseCurrency ? getSettings()?.baseCurrency : getCurrencyFromLocalStorage()?.code}
													</div>
													<div className="text-xs text-gray-500 dark:text-gray-400">{request.date}</div>
												</div>
											</div>
										);
									})}
								</div>

								{/* GH Pagination */}
								{ghTotalPages > 1 && (
									<div className="flex justify-center gap-1">
										<button onClick={() => handleGHPageChange(ghCurrentPage - 1)} disabled={ghCurrentPage === 1} className="px-2 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 disabled:opacity-50">
											<i className="ri-arrow-left-s-line w-4 h-4 flex items-center justify-center"></i>
										</button>

										{Array.from({ length: Math.min(5, ghTotalPages) }, (_, i) => {
											const page = i + 1;
											return (
												<button
													key={page}
													onClick={() => handleGHPageChange(page)}
													className={`px-3 py-1 text-sm rounded border ${ghCurrentPage === page ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'}`}
												>
													{page}
												</button>
											);
										})}

										<button onClick={() => handleGHPageChange(ghCurrentPage + 1)} disabled={ghCurrentPage === ghTotalPages} className="px-2 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 disabled:opacity-50">
											<i className="ri-arrow-right-s-line w-4 h-4 flex items-center justify-center"></i>
										</button>
									</div>
								)}
							</>
						)}
					</div>
				</Card>

				{/* Available PH Requests */}
				<Card className="bg-white dark:bg-gray-800 border-0 shadow-sm rounded-lg">
					<div className="p-4 border-b border-gray-200 dark:border-gray-700">
						<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Available PH Requests</h3>
						<p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
							Total: {filteredPHRequests.length} users | Selected: {selectedPHRequests.length} | Amount:{' '}
							<span className="font-medium text-gray-900 dark:text-white">
								{totalPHAmount} {getSettings()?.baseCurrency ? getSettings()?.baseCurrency : getCurrencyFromLocalStorage()?.code}
							</span>
						</p>
						<div className="relative">
							<i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 flex items-center justify-center"></i>
							<input
								type="text"
								placeholder="Search PH requests..."
								className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
								value={phSearchTerm}
								onChange={(e) => setPHSearchTerm(e.target.value)}
							/>
						</div>
					</div>
					<div className="p-4">
						{phLoading ? (
							<div className="flex items-center justify-center py-8">
								<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
							</div>
						) : (
							<>
								<div className="space-y-3 mb-4">
									{currentPHRequests.map((request) => {
										const isSelected = selectedPHRequests.some((r) => r.id === request.id);
										return (
											<div
												key={request.id}
												className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
													isSelected ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700' : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
												}`}
												onClick={() => handlePHRequestToggle(request)}
											>
												<div className="flex items-center gap-3">
													<input
														type="checkbox"
														checked={isSelected}
														onChange={() => handlePHRequestToggle(request)}
														className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
													/>
													<div>
														<div className="font-medium text-gray-900 dark:text-white text-sm">{request.phUser}</div>
														<div className="text-xs text-gray-500 dark:text-gray-400">{request.email}</div>
													</div>
												</div>
												<div className="text-right">
													<div className="font-medium text-gray-900 dark:text-white text-sm">
														{request.availableAmount} {getSettings()?.baseCurrency ? getSettings()?.baseCurrency : getCurrencyFromLocalStorage()?.code}
													</div>
													<div className="text-xs text-gray-500 dark:text-gray-400">{request.date}</div>
												</div>
											</div>
										);
									})}
								</div>

								{/* PH Pagination */}
								{phTotalPages > 1 && (
									<div className="flex justify-center gap-1">
										<button onClick={() => handlePHPageChange(phCurrentPage - 1)} disabled={phCurrentPage === 1} className="px-2 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 disabled:opacity-50">
											<i className="ri-arrow-left-s-line w-4 h-4 flex items-center justify-center"></i>
										</button>

										{Array.from({ length: Math.min(5, phTotalPages) }, (_, i) => {
											const page = i + 1;
											return (
												<button
													key={page}
													onClick={() => handlePHPageChange(page)}
													className={`px-3 py-1 text-sm rounded border ${phCurrentPage === page ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'}`}
												>
													{page}
												</button>
											);
										})}

										<button onClick={() => handlePHPageChange(phCurrentPage + 1)} disabled={phCurrentPage === phTotalPages} className="px-2 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 disabled:opacity-50">
											<i className="ri-arrow-right-s-line w-4 h-4 flex items-center justify-center"></i>
										</button>
									</div>
								)}
							</>
						)}
					</div>
				</Card>
			</div>
		</div>
	);
}
