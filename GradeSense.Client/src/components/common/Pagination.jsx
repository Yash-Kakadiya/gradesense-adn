import { cn } from '@/utils/helpers'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

const Pagination = ({
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    onPageChange,
    onPageSizeChange,
    pageSizeOptions = [5, 10, 25, 50],
    showPageSizeSelector = true,
    className,
}) => {
    const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1
    const endItem = Math.min(currentPage * pageSize, totalItems)

    const getPageNumbers = () => {
        const pages = []
        const maxVisible = 5
        let start = Math.max(1, currentPage - Math.floor(maxVisible / 2))
        let end = Math.min(totalPages, start + maxVisible - 1)

        if (end - start + 1 < maxVisible) {
            start = Math.max(1, end - maxVisible + 1)
        }

        for (let i = start; i <= end; i++) {
            pages.push(i)
        }

        return pages
    }

    if (totalPages <= 1 && !showPageSizeSelector) {
        return null
    }

    const pageNumbers = getPageNumbers()

    return (
        <div
            className={cn(
                'flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3',
                className
            )}
        >
            {/* Results info and page size selector */}
            <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="text-gray-500">
                    Showing <span className="font-medium text-gray-900">{startItem}</span> to{' '}
                    <span className="font-medium text-gray-900">{endItem}</span> of{' '}
                    <span className="font-medium text-gray-900">{totalItems}</span> results
                </span>
                {showPageSizeSelector && (
                    <div className="flex items-center gap-2">
                        <span className="text-gray-400">|</span>
                        <select
                            value={pageSize}
                            onChange={(e) => onPageSizeChange(Number(e.target.value))}
                            className="border-0 bg-gray-50 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer hover:bg-gray-100 transition-colors"
                        >
                            {pageSizeOptions.map((size) => (
                                <option key={size} value={size}>
                                    {size} / page
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {/* Pagination controls */}
            <div className="flex items-center gap-1">
                {/* First page button */}
                <button
                    onClick={() => onPageChange(1)}
                    disabled={currentPage === 1}
                    className={cn(
                        'p-2 rounded-lg transition-all duration-200',
                        currentPage === 1
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                    )}
                    title="First page"
                >
                    <ChevronsLeft className="w-4 h-4" />
                </button>

                {/* Previous button */}
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={cn(
                        'p-2 rounded-lg transition-all duration-200',
                        currentPage === 1
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                    )}
                    title="Previous page"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Page numbers */}
                <div className="flex items-center gap-1 mx-1">
                    {pageNumbers[0] > 1 && (
                        <>
                            <button
                                onClick={() => onPageChange(1)}
                                className="min-w-[36px] h-9 px-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-all duration-200"
                            >
                                1
                            </button>
                            {pageNumbers[0] > 2 && (
                                <span className="px-1 text-gray-400">...</span>
                            )}
                        </>
                    )}

                    {pageNumbers.map((page) => (
                        <button
                            key={page}
                            onClick={() => onPageChange(page)}
                            className={cn(
                                'min-w-[36px] h-9 px-3 rounded-lg text-sm font-medium transition-all duration-200',
                                page === currentPage
                                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25'
                                    : 'text-gray-600 hover:bg-gray-100'
                            )}
                        >
                            {page}
                        </button>
                    ))}

                    {pageNumbers[pageNumbers.length - 1] < totalPages && (
                        <>
                            {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
                                <span className="px-1 text-gray-400">...</span>
                            )}
                            <button
                                onClick={() => onPageChange(totalPages)}
                                className="min-w-[36px] h-9 px-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-all duration-200"
                            >
                                {totalPages}
                            </button>
                        </>
                    )}
                </div>

                {/* Next button */}
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className={cn(
                        'p-2 rounded-lg transition-all duration-200',
                        currentPage === totalPages || totalPages === 0
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                    )}
                    title="Next page"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>

                {/* Last page button */}
                <button
                    onClick={() => onPageChange(totalPages)}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className={cn(
                        'p-2 rounded-lg transition-all duration-200',
                        currentPage === totalPages || totalPages === 0
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                    )}
                    title="Last page"
                >
                    <ChevronsRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    )
}

export default Pagination
