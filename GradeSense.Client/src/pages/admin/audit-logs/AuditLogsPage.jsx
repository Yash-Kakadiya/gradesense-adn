import { useState, useMemo, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
    History,
    Download,
    Search,
    Plus,
    Pencil,
    Trash2,
    Eye,
    RefreshCw,
    FileText,
    User,
    Calendar,
    Globe,
    ChevronRight,
    Filter,
    X,
    LogIn,
    LogOut,
    ArrowRightLeft,
    AlertTriangle,
} from 'lucide-react'
import auditLogService from '@/services/auditLogService'
import { userService } from '@/services/userService'
import { dashboardService } from '@/services/dashboardService'
import { exportAuditLogsToCsv, exportAuditLogsToExcel, downloadBlob } from '@/services/exportService'
import { Card, Button, Spinner, ExportDropdown } from '@/components/common'
import { Pagination } from '@/components/common'
import toast from 'react-hot-toast'
import { useDebounce, usePagination } from '@/hooks'
import AuditLogDetailModal from '@/components/audit-logs/AuditLogDetailModal'

const AuditLogsPage = () => {
    // Filters
    const [searchTerm, setSearchTerm] = useState('')
    const [actorUserIdFilter, setActorUserIdFilter] = useState('')
    const [actionFilter, setActionFilter] = useState('')
    const [entityNameFilter, setEntityNameFilter] = useState('')
    const [startDateFilter, setStartDateFilter] = useState('')
    const [endDateFilter, setEndDateFilter] = useState('')
    const debouncedSearch = useDebounce(searchTerm, 400)

    // Detail modal state
    const [detailModal, setDetailModal] = useState({ isOpen: false, auditLog: null })

    // Pagination
    const { currentPage, pageSize, handlePageChange, handlePageSizeChange, resetPagination } =
        usePagination(1, 25)

    // Reset page when filters change
    const handleFilterChange = useCallback(
        (setter) => (value) => {
            setter(value)
            resetPagination()
        },
        [resetPagination]
    )

    // Fetch audit logs
    const {
        data: logsData,
        isLoading,
        refetch,
        isError,
    } = useQuery({
        queryKey: [
            'audit-logs',
            {
                debouncedSearch,
                actorUserIdFilter,
                actionFilter,
                entityNameFilter,
                startDateFilter,
                endDateFilter,
                currentPage,
                pageSize,
            },
        ],
        queryFn: () =>
            auditLogService.getAll({
                searchTerm: debouncedSearch || undefined,
                actorUserId: actorUserIdFilter || undefined,
                action: actionFilter || undefined,
                entityName: entityNameFilter || undefined,
                startDate: startDateFilter || undefined,
                endDate: endDateFilter || undefined,
                pageNumber: currentPage,
                pageSize: pageSize,
                sortBy: 'OccurredAt',
                sortOrder: 'desc',
            }),
    })

    // Fetch users for filter dropdown
    const { data: usersData } = useQuery({
        queryKey: ['users-select'],
        queryFn: () => userService.getAll({ pageSize: 200 }),
    })

    // Fetch dashboard stats for accurate total count
    const { data: dashboardData } = useQuery({
        queryKey: ['admin-dashboard-stats'],
        queryFn: () => dashboardService.getAdminDashboard(),
        staleTime: 30000,
    })

    // Extract data with PascalCase
    const auditLogs = logsData?.Data?.Data || []
    const totalItems = logsData?.Data?.TotalRecords || 0
    const totalPages = logsData?.Data?.TotalPages || 0
    const users = usersData?.Data?.Data || []

    // Get dashboard stats for accurate total count
    const dashboardStats = dashboardData?.Data || {}

    // Get statistics from dashboard API
    const stats = useMemo(() => {
        return {
            total: dashboardStats.TotalAuditLogs || 0,
            creates: dashboardStats.AuditLogCreates || 0,
            updates: dashboardStats.AuditLogUpdates || 0,
            deletes: dashboardStats.AuditLogDeletes || 0,
            logins: dashboardStats.AuditLogLogins || 0,
        }
    }, [dashboardStats])

    // View audit log details
    const handleViewDetails = async (log) => {
        try {
            const response = await auditLogService.getById(log.Id)
            setDetailModal({ isOpen: true, auditLog: response.Data })
        } catch (error) {
            toast.error('Failed to load audit log details')
        }
    }

    // Export to CSV (using backend API)
    const handleExportCsv = async () => {
        const blob = await exportAuditLogsToCsv({
            actorUserId: actorUserIdFilter ? parseInt(actorUserIdFilter) : null,
            action: actionFilter || null,
            entityName: entityNameFilter || null,
            startDate: startDateFilter || null,
            endDate: endDateFilter || null
        })
        downloadBlob(blob, `audit-logs-${new Date().toISOString().split('T')[0]}.csv`)
    }

    // Export to Excel (using backend API)
    const handleExportExcel = async () => {
        const blob = await exportAuditLogsToExcel({
            actorUserId: actorUserIdFilter ? parseInt(actorUserIdFilter) : null,
            action: actionFilter || null,
            entityName: entityNameFilter || null,
            startDate: startDateFilter || null,
            endDate: endDateFilter || null
        })
        downloadBlob(blob, `audit-logs-${new Date().toISOString().split('T')[0]}.xlsx`)
    }

    // Format date/time with relative time
    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A'
        const date = new Date(dateString)
        const now = new Date()
        const diffMs = now - date
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMs / 3600000)
        const diffDays = Math.floor(diffMs / 86400000)

        if (diffMins < 1) return 'Just now'
        if (diffMins < 60) return `${diffMins}m ago`
        if (diffHours < 24) return `${diffHours}h ago`
        if (diffDays < 7) return `${diffDays}d ago`

        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    // Get action icon
    const getActionIcon = (action) => {
        switch (action?.toLowerCase()) {
            case 'create':
                return Plus
            case 'update':
                return Pencil
            case 'delete':
                return Trash2
            case 'read':
            case 'view':
                return Eye
            case 'login':
                return LogIn
            case 'logout':
                return LogOut
            case 'failedlogin':
                return AlertTriangle
            default:
                return FileText
        }
    }

    // Get action badge styles
    const getActionStyles = (action) => {
        switch (action?.toLowerCase()) {
            case 'create':
                return {
                    bg: 'bg-emerald-50',
                    text: 'text-emerald-700',
                    border: 'border-emerald-200',
                    iconBg: 'bg-emerald-100',
                }
            case 'update':
                return {
                    bg: 'bg-blue-50',
                    text: 'text-blue-700',
                    border: 'border-blue-200',
                    iconBg: 'bg-blue-100',
                }
            case 'delete':
                return {
                    bg: 'bg-red-50',
                    text: 'text-red-700',
                    border: 'border-red-200',
                    iconBg: 'bg-red-100',
                }
            case 'login':
                return {
                    bg: 'bg-indigo-50',
                    text: 'text-indigo-700',
                    border: 'border-indigo-200',
                    iconBg: 'bg-indigo-100',
                }
            case 'logout':
                return {
                    bg: 'bg-slate-50',
                    text: 'text-slate-700',
                    border: 'border-slate-200',
                    iconBg: 'bg-slate-100',
                }
            case 'failedlogin':
                return {
                    bg: 'bg-amber-50',
                    text: 'text-amber-700',
                    border: 'border-amber-200',
                    iconBg: 'bg-amber-100',
                }
            default:
                return {
                    bg: 'bg-gray-50',
                    text: 'text-gray-700',
                    border: 'border-gray-200',
                    iconBg: 'bg-gray-100',
                }
        }
    }

    // Get action badge colors (legacy - keep for compatibility)
    const getActionColor = (action) => {
        const styles = getActionStyles(action)
        return `${styles.bg} ${styles.text} ${styles.border}`
    }

    // Action filter options
    const actionOptions = [
        { value: '', label: 'All Actions' },
        { value: 'Create', label: 'Create' },
        { value: 'Update', label: 'Update' },
        { value: 'Delete', label: 'Delete' },
        { value: 'Login', label: 'Login' },
        { value: 'Logout', label: 'Logout' },
        { value: 'FailedLogin', label: 'Failed Login' },
    ]

    // Common entity names
    const commonEntityNames = [
        'User',
        'Student',
        'Faculty',
        'Department',
        'Batch',
        'Subject',
        'CourseOffering',
        'CourseEnrollment',
        'EvaluationScheme',
        'AssessmentItem',
        'StudentMark',
        'AttendanceRecord',
    ]

    // Check if any filters are active
    const hasActiveFilters =
        searchTerm ||
        actionFilter ||
        entityNameFilter ||
        actorUserIdFilter ||
        startDateFilter ||
        endDateFilter

    // Clear all filters
    const clearAllFilters = () => {
        setSearchTerm('')
        setActionFilter('')
        setEntityNameFilter('')
        setActorUserIdFilter('')
        setStartDateFilter('')
        setEndDateFilter('')
        resetPagination()
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        <div className="p-2 bg-slate-100 rounded-xl">
                            <History className="w-6 h-6 text-slate-600" />
                        </div>
                        Audit Logs
                    </h1>
                    <p className="text-gray-500 mt-1 ml-14">
                        Track all system activities and user actions
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        onClick={() => refetch()}
                        className="gap-2"
                        disabled={isLoading}
                    >
                        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <ExportDropdown
                        onExportCsv={handleExportCsv}
                        onExportExcel={handleExportExcel}
                    />
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <Card className="border-0 shadow-sm bg-gradient-to-br from-slate-50 to-gray-50">
                    <Card.Body className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Total
                                </p>
                                <p className="text-2xl font-bold text-slate-700 mt-1">
                                    {stats.total.toLocaleString()}
                                </p>
                            </div>
                            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                                <History className="w-5 h-5 text-slate-600" />
                            </div>
                        </div>
                    </Card.Body>
                </Card>
                <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-green-50">
                    <Card.Body className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-emerald-600 uppercase tracking-wider">
                                    Creates
                                </p>
                                <p className="text-2xl font-bold text-emerald-700 mt-1">
                                    {stats.creates}
                                </p>
                            </div>
                            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                                <Plus className="w-5 h-5 text-emerald-600" />
                            </div>
                        </div>
                    </Card.Body>
                </Card>
                <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50">
                    <Card.Body className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-blue-600 uppercase tracking-wider">
                                    Updates
                                </p>
                                <p className="text-2xl font-bold text-blue-700 mt-1">
                                    {stats.updates}
                                </p>
                            </div>
                            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                                <Pencil className="w-5 h-5 text-blue-600" />
                            </div>
                        </div>
                    </Card.Body>
                </Card>
                <Card className="border-0 shadow-sm bg-gradient-to-br from-red-50 to-rose-50">
                    <Card.Body className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-red-600 uppercase tracking-wider">
                                    Deletes
                                </p>
                                <p className="text-2xl font-bold text-red-700 mt-1">
                                    {stats.deletes}
                                </p>
                            </div>
                            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                                <Trash2 className="w-5 h-5 text-red-600" />
                            </div>
                        </div>
                    </Card.Body>
                </Card>
                <Card className="border-0 shadow-sm bg-gradient-to-br from-indigo-50 to-purple-50">
                    <Card.Body className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-indigo-600 uppercase tracking-wider">
                                    Auth
                                </p>
                                <p className="text-2xl font-bold text-indigo-700 mt-1">
                                    {stats.logins}
                                </p>
                            </div>
                            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                                <LogIn className="w-5 h-5 text-indigo-600" />
                            </div>
                        </div>
                    </Card.Body>
                </Card>
            </div>

            {/* Filters */}
            <Card className="border-0 shadow-sm">
                <Card.Body className="p-4">
                    <div className="space-y-4">
                        {/* Row 1: Search and Action Filter */}
                        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                            {/* Search Input */}
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value)
                                        resetPagination()
                                    }}
                                    placeholder="Search by action, entity, user, reason..."
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-0 rounded-xl text-sm focus:ring-2 focus:ring-slate-500 focus:bg-white transition-all"
                                />
                            </div>
                            {/* Filter Selects */}
                            <div className="flex flex-wrap items-center gap-3">
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Filter className="w-4 h-4" />
                                </div>
                                <select
                                    value={actionFilter}
                                    onChange={(e) =>
                                        handleFilterChange(setActionFilter)(e.target.value)
                                    }
                                    className="px-4 py-2.5 bg-gray-50 border-0 rounded-xl text-sm focus:ring-2 focus:ring-slate-500 min-w-[140px]"
                                >
                                    {actionOptions.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    value={entityNameFilter}
                                    onChange={(e) =>
                                        handleFilterChange(setEntityNameFilter)(e.target.value)
                                    }
                                    className="px-4 py-2.5 bg-gray-50 border-0 rounded-xl text-sm focus:ring-2 focus:ring-slate-500 min-w-[160px]"
                                >
                                    <option value="">All Entities</option>
                                    {commonEntityNames.map((entity) => (
                                        <option key={entity} value={entity}>
                                            {entity}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    value={actorUserIdFilter}
                                    onChange={(e) =>
                                        handleFilterChange(setActorUserIdFilter)(e.target.value)
                                    }
                                    className="px-4 py-2.5 bg-gray-50 border-0 rounded-xl text-sm focus:ring-2 focus:ring-slate-500 min-w-[180px]"
                                >
                                    <option value="">All Users</option>
                                    {users.map((user) => (
                                        <option key={user.Id} value={user.Id}>
                                            {user.FullName || user.PersonalEmail}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Row 2: Date Filters */}
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-500">From:</span>
                                <input
                                    type="date"
                                    value={startDateFilter}
                                    onChange={(e) =>
                                        handleFilterChange(setStartDateFilter)(e.target.value)
                                    }
                                    className="px-3 py-2 bg-gray-50 border-0 rounded-xl text-sm focus:ring-2 focus:ring-slate-500"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">To:</span>
                                <input
                                    type="date"
                                    value={endDateFilter}
                                    onChange={(e) =>
                                        handleFilterChange(setEndDateFilter)(e.target.value)
                                    }
                                    className="px-3 py-2 bg-gray-50 border-0 rounded-xl text-sm focus:ring-2 focus:ring-slate-500"
                                />
                            </div>
                            {hasActiveFilters && (
                                <button
                                    onClick={clearAllFilters}
                                    className="flex items-center gap-1 px-3 py-2 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-xl transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                    Clear All
                                </button>
                            )}
                        </div>
                    </div>
                </Card.Body>
            </Card>

            {/* Audit Logs List */}
            <Card className="border-0 shadow-sm overflow-hidden">
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Spinner size="lg" />
                    </div>
                ) : isError ? (
                    <div className="flex flex-col items-center justify-center py-20 text-red-500">
                        <AlertTriangle className="w-12 h-12 mb-4" />
                        <p className="text-lg font-medium">Failed to load audit logs</p>
                        <p className="text-sm text-gray-500 mt-1">Please try again later</p>
                        <Button variant="outline" onClick={() => refetch()} className="mt-4">
                            Retry
                        </Button>
                    </div>
                ) : auditLogs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                        <History className="w-16 h-16 mb-4 text-gray-300" />
                        <p className="text-lg font-medium text-gray-700">No audit logs found</p>
                        <p className="text-sm text-gray-500 mt-1">
                            {hasActiveFilters
                                ? 'Try adjusting your filters'
                                : 'Activities will appear here when users perform actions'}
                        </p>
                        {hasActiveFilters && (
                            <Button variant="outline" onClick={clearAllFilters} className="mt-4">
                                Clear Filters
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {auditLogs.map((log) => {
                            const ActionIcon = getActionIcon(log.Action)
                            const styles = getActionStyles(log.Action)
                            const changedFields = log.ChangedFields
                                ? log.ChangedFields.split(',')
                                    .map((f) => f.trim())
                                    .filter(Boolean)
                                : []

                            return (
                                <div
                                    key={log.Id}
                                    onClick={() => handleViewDetails(log)}
                                    className="p-4 hover:bg-gray-50 cursor-pointer transition-colors group"
                                >
                                    <div className="flex items-start gap-4">
                                        {/* Action Icon */}
                                        <div
                                            className={`w-10 h-10 rounded-xl ${styles.iconBg} flex items-center justify-center flex-shrink-0`}
                                        >
                                            <ActionIcon className={`w-5 h-5 ${styles.text}`} />
                                        </div>

                                        {/* Main Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    {/* Action + Entity */}
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span
                                                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold ${styles.bg} ${styles.text} border ${styles.border}`}
                                                        >
                                                            {log.Action}
                                                        </span>
                                                        <span className="font-medium text-gray-900">
                                                            {log.EntityName}
                                                        </span>
                                                        {log.EntityId && (
                                                            <span className="text-gray-500 text-sm">
                                                                #{log.EntityId}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Actor Info */}
                                                    <div className="flex items-center gap-2 mt-1.5 text-sm text-gray-600">
                                                        <User className="w-3.5 h-3.5 text-gray-400" />
                                                        <span>
                                                            {log.ActorUserName || 'System'}
                                                        </span>
                                                        {log.IPAddress && (
                                                            <>
                                                                <span className="text-gray-300">
                                                                    •
                                                                </span>
                                                                <Globe className="w-3.5 h-3.5 text-gray-400" />
                                                                <span className="font-mono text-xs">
                                                                    {log.IPAddress}
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>

                                                    {/* Changed Fields */}
                                                    {changedFields.length > 0 && (
                                                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                                                            <ArrowRightLeft className="w-3.5 h-3.5 text-gray-400" />
                                                            <span className="text-xs text-gray-500">
                                                                Changed:
                                                            </span>
                                                            {changedFields
                                                                .slice(0, 4)
                                                                .map((field, idx) => (
                                                                    <span
                                                                        key={idx}
                                                                        className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-xs font-medium"
                                                                    >
                                                                        {field}
                                                                    </span>
                                                                ))}
                                                            {changedFields.length > 4 && (
                                                                <span className="text-xs text-gray-500">
                                                                    +{changedFields.length - 4} more
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Timestamp + Arrow */}
                                                <div className="flex items-center gap-3 flex-shrink-0">
                                                    <div className="text-right">
                                                        <p className="text-sm text-gray-500">
                                                            {formatDateTime(log.OccurredAt)}
                                                        </p>
                                                    </div>
                                                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-500 transition-colors" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 0 && (
                    <div className="border-t border-gray-100">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            totalItems={totalItems}
                            pageSize={pageSize}
                            onPageChange={handlePageChange}
                            onPageSizeChange={handlePageSizeChange}
                        />
                    </div>
                )}
            </Card>

            {/* Detail Modal */}
            <AuditLogDetailModal
                isOpen={detailModal.isOpen}
                onClose={() => setDetailModal({ isOpen: false, auditLog: null })}
                auditLog={detailModal.auditLog}
            />
        </div>
    )
}

export default AuditLogsPage
