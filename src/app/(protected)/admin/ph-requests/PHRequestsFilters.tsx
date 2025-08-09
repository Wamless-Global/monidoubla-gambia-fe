import { Button } from '@/components/ui/button';

// NOTE: All original props and logic are preserved.
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
		<div className="flex flex-col md:flex-row gap-3">
			<div className="relative flex-1">
				<i className="ri-search-line absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"></i>
				<input type="text" placeholder="Search by user name, email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10" />
			</div>
			<div className="flex flex-col sm:flex-row gap-3">
				<select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full sm:w-auto">
					<option value="All">All Statuses</option>
					<option value="pending">Pending</option>
					<option value="waiting-match">Waiting Match</option>
					<option value="partial-match">Partial Match</option>
					<option value="matched">Matched</option>
					<option value="active">Active</option>
					<option value="completed">Completed</option>
					<option value="expired">Expired</option>
				</select>
				<select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)} className="w-full sm:w-auto">
					<option value="All">All Locations</option>
					<option value="Monrovia">Monrovia</option>
					<option value="Gbarnga">Gbarnga</option>
					<option value="Buchanan">Buchanan</option>
					<option value="Kakata">Kakata</option>
					<option value="Zwedru">Zwedru</option>
				</select>
				<select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full sm:w-auto">
					<option value="dateCreated">Sort by Date</option>
					<option value="amount-low">Amount: Low-High</option>
					<option value="amount-high">Amount: High-Low</option>
					<option value="name">Name: A-Z</option>
				</select>
				<Button variant="outline" onClick={resetFilters} className="whitespace-nowrap">
					<i className="ri-filter-off-line mr-2"></i>Reset
				</Button>
			</div>
		</div>
	);
}
