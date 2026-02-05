import { useState, useCallback } from 'react'
import { PAGINATION } from '@/utils/constants'

/**
 * Pagination hook for managing table pagination state
 */
export const usePagination = (initialPage = 1, initialPageSize = PAGINATION.DEFAULT_PAGE_SIZE) => {
    const [currentPage, setCurrentPage] = useState(initialPage)
    const [pageSize, setPageSize] = useState(initialPageSize)

    const handlePageChange = useCallback((page) => {
        // Allow navigation to any positive page number
        // The component should pass valid page from API totalPages
        if (page >= 1) {
            setCurrentPage(page)
        }
    }, [])

    const handlePageSizeChange = useCallback((size) => {
        setPageSize(size)
        setCurrentPage(1) // Reset to first page when page size changes
    }, [])

    const resetPagination = useCallback(() => {
        setCurrentPage(1)
    }, [])

    return {
        currentPage,
        pageSize,
        handlePageChange,
        handlePageSizeChange,
        resetPagination,
        resetPage: resetPagination, // Alias for consistency across pages
        paginationParams: {
            pageNumber: currentPage,
            pageSize,
        },
    }
}
