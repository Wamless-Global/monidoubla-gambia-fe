import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface PHRequestsFiltersProps {
	searchTerm: string;
	setSearchTerm: (value: string) => void;
	statusFilter: string;
	setStatusFilter: (value: string) => void;
	locationFilter: string;
	setLocationFilter: (value: string) => void;
	sortBy: string;
	setSortBy: (value: string) => void;
	resetFilters: () => void;
}

export default function PHRequestsFilters({ searchTerm, setSearchTerm, statusFilter, setStatusFilter, locationFilter, setLocationFilter, sortBy, setSortBy, resetFilters }: PHRequestsFiltersProps) {
	return (
		<Card className="p-6 bg-white dark:bg-gray-800 border-0 shadow-sm rounded-lg">
			<div className="flex flex-col lg:flex-row gap-4 mb-4">
				<div className="flex-1">
					<div className="relative">
						<i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 flex items-center justify-center"></i>
						<input
							type="text"
							placeholder="Search..."
							className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
						/>
					</div>
				</div>
				<div className="flex flex-wrap gap-2">
					<select
						className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm pr-8"
						value={statusFilter}
						onChange={(e) => setStatusFilter(e.target.value)}
					>
						<option value="All">All Status</option>
						<option value="pending">Pending</option>
						<option value="waiting-match">Waiting Match</option>
						<option value="partial-match">Partial Match</option>
						<option value="matched">Matched</option>
						<option value="active">Active</option>
						<option value="completed">Completed</option>
						<option value="expired">Expired</option>
					</select>
					<select
						className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm pr-8"
						value={locationFilter}
						onChange={(e) => setLocationFilter(e.target.value)}
					>
						<option value="All">All Locations</option>
						<option value="Monrovia">Monrovia</option>
						<option value="Gbarnga">Gbarnga</option>
						<option value="Buchanan">Buchanan</option>
						<option value="Kakata">Kakata</option>
						<option value="Zwedru">Zwedru</option>
					</select>
					<select className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm pr-8" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
						<option value="dateCreated">Sort by Date</option>
						<option value="amount-low">Amount: Low to High</option>
						<option value="amount-high">Amount: High to Low</option>
						<option value="name">Name: A to Z</option>
					</select>
					<Button variant="outline" onClick={resetFilters} className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 whitespace-nowrap">
						<i className="ri-filter-off-line w-4 h-4 flex items-center justify-center mr-2"></i>
						Reset Filters
					</Button>
				</div>
			</div>
		</Card>
	);
}
