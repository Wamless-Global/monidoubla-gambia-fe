import { Button } from '@/components/ui/button';

// NOTE: All original props and logic are preserved.
interface GHRequestsPaginationProps {
	currentPage: number;
	totalPages: number;
	handlePageChange: (page: number) => void;
}

export default function GHRequestsPagination({ currentPage, totalPages, handlePageChange }: GHRequestsPaginationProps) {
	return (
		<div className="flex justify-between items-center">
			<p className="text-sm text-slate-500">
				Page {currentPage} of {totalPages}
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
