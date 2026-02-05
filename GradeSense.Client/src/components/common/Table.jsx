import { cn } from '@/utils/helpers'
import Spinner from './Spinner'
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'

const Table = ({
    columns,
    data = [],
    loading = false,
    sortField,
    sortDirection,
    onSort,
    onRowClick,
    emptyMessage = 'No data available',
    className,
}) => {
    const handleSort = (column) => {
        if (!column.sortable || !onSort) return

        const field = column.sortField || column.accessor
        if (sortField === field) {
            onSort(field, sortDirection === 'asc' ? 'desc' : 'asc')
        } else {
            onSort(field, 'asc')
        }
    }

    const getSortIcon = (column) => {
        const field = column.sortField || column.accessor
        if (sortField !== field) {
            return <ArrowUpDown className="w-4 h-4 text-gray-400" />
        }
        return sortDirection === 'asc' ? (
            <ArrowUp className="w-4 h-4 text-blue-600" />
        ) : (
            <ArrowDown className="w-4 h-4 text-blue-600" />
        )
    }

    const getCellValue = (row, column) => {
        if (column.cell) {
            return column.cell(row)
        }
        if (column.accessor) {
            const keys = column.accessor.split('.')
            return keys.reduce((obj, key) => obj?.[key], row)
        }
        return null
    }

    return (
        <div className={cn('overflow-x-auto rounded-lg border border-gray-200', className)}>
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        {columns.map((column, index) => (
                            <th
                                key={column.accessor || index}
                                scope="col"
                                className={cn(
                                    'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
                                    column.sortable && 'cursor-pointer hover:bg-gray-100 select-none',
                                    column.headerClassName
                                )}
                                style={{ width: column.width }}
                                onClick={() => handleSort(column)}
                            >
                                <div className="flex items-center gap-1">
                                    {column.header}
                                    {column.sortable && getSortIcon(column)}
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                        <tr>
                            <td colSpan={columns.length} className="px-6 py-12 text-center">
                                <div className="flex justify-center">
                                    <Spinner size="lg" />
                                </div>
                            </td>
                        </tr>
                    ) : data.length === 0 ? (
                        <tr>
                            <td
                                colSpan={columns.length}
                                className="px-6 py-12 text-center text-gray-500"
                            >
                                {emptyMessage}
                            </td>
                        </tr>
                    ) : (
                        data.map((row, rowIndex) => (
                            <tr
                                key={row.id || rowIndex}
                                className={cn(
                                    'hover:bg-gray-50 transition-colors',
                                    onRowClick && 'cursor-pointer'
                                )}
                                onClick={() => onRowClick?.(row)}
                            >
                                {columns.map((column, colIndex) => (
                                    <td
                                        key={column.accessor || colIndex}
                                        className={cn(
                                            'px-6 py-4 whitespace-nowrap text-sm text-gray-900',
                                            column.cellClassName
                                        )}
                                    >
                                        {getCellValue(row, column)}
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    )
}

export default Table
