interface GHRequestsPaginationProps {
	currentPage: number;
	totalPages: number;
	handlePageChange: (page: number) => void;
}

export default function GHRequestsPagination({ currentPage, totalPages, handlePageChange }: GHRequestsPaginationProps) {
	return (
		<div className="flex justify-center items-center gap-2 mt-8">
			<button
				onClick={() => handlePageChange(currentPage - 1)}
				disabled={currentPage === 1}
				className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
			>
				<i className="ri-arrow-left-line w-4 h-4 flex items-center justify-center"></i>
			</button>
			{[...Array(totalPages)].map((_, index) => (
				<button
					key={index}
					onClick={() => handlePageChange(index + 1)}
					className={`px-3 py-2 rounded-lg border cursor-pointer ${currentPage === index + 1 ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
				>
					{index + 1}
				</button>
			))}
			<button
				onClick={() => handlePageChange(currentPage + 1)}
				disabled={currentPage === totalPages}
				className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
			>
				<i className="ri-arrow-right-line w-4 h-4 flex items-center justify-center"></i>
			</button>
		</div>
	);
}
