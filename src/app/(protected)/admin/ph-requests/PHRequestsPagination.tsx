import { Button } from '@/components/ui/button';

// NOTE: All original props and logic are preserved.
interface PHRequestsPaginationProps {
	currentPage: number;
	totalPages: number;
	handlePageChange: (page: number) => void;
	totalCount: number;
	itemsPerPage: number;
}

export default function PHRequestsPagination({ currentPage, totalPages, handlePageChange, totalCount, itemsPerPage }: PHRequestsPaginationProps) {
	const startItem = (currentPage - 1) * itemsPerPage + 1;
	const endItem = Math.min(currentPage * itemsPerPage, totalCount);

	return (
		<div className="flex justify-between items-center">
			<p className="text-sm text-slate-500">
				Showing {startItem} to {endItem} of {totalCount} results
			</p>
			<div className="flex items-center gap-2">
				<Button variant="outline" size="icon" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
					<i className="ri-arrow-left-s-line"></i>
				</Button>
				<Button variant="outline" size="icon" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
					<i className="ri-arrow-right-s-line"></i>
				</Button>
			</div>
		</div>
	);
}
