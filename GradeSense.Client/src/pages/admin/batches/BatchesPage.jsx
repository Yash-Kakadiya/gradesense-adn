import { useState, useEffect, Fragment } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Dialog, Transition } from '@headlessui/react'
import {
    Pagination,
    Badge,
    Button,
    Select,
    Card,
    ConfirmDialog,
    ExportDropdown,
} from '@/components/common'
import { batchService } from '@/services/batchService'
import { departmentService } from '@/services/departmentService'
import { dashboardService } from '@/services/dashboardService'
import { exportBatchesToCsv, exportBatchesToExcel, downloadBlob } from '@/services/exportService'
import { usePagination, useModal } from '@/hooks'
import { formatDate, cn } from '@/utils/helpers'
import { ROUTES } from '@/utils/constants'
import {
    Edit,
    Trash2,
    Eye,
    Layers,
    Plus,
    CheckSquare,
    Square,
    X,
    RefreshCw,
    Search,
    SlidersHorizontal,
    Building2,
    Calendar,
    Clock,
    Hash,
    Mail,
    UserCheck,
    UserX,
    Download,
    User,
    GraduationCap,
    BookOpen,
} from 'lucide-react'
import toast from 'react-hot-toast'

// Batch Detail Modal Component
const BatchDetailModal = ({ isOpen, onClose, batchId }) => {
    const navigate = useNavigate()

    // Fetch full batch details when modal opens
    const { data: batchData, isLoading } = useQuery({
        queryKey: ['batch-detail', batchId],
        queryFn: () => batchService.getById(batchId),
        enabled: isOpen && !!batchId,
    })

    const batch = batchData?.Data

    const handleClose = (e) => {
        if (e) e.stopPropagation()
        onClose()
    }

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={handleClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
                                {isLoading ? (
                                    <div className="flex items-center justify-center py-16">
                                        <RefreshCw className="w-8 h-8 text-cyan-500 animate-spin" />
                                    </div>
                                ) : batch ? (
                                    <>
                                        {/* Header with gradient */}
                                        <div className="relative bg-gradient-to-br from-cyan-500 to-teal-600 px-6 py-5">
                                            {/* Action buttons */}
                                            <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        handleClose()
                                                        navigate(`${ROUTES.ADMIN_BATCHES}/${batch.Id}/edit`)
                                                    }}
                                                    className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors group"
                                                    title="Edit Batch"
                                                >
                                                    <Edit className="w-5 h-5" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={handleClose}
                                                    className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
                                                >
                                                    <X className="w-5 h-5" />
                                                </button>
                                            </div>

                                            {/* Decorative circles */}
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

                                            <div className="relative flex flex-col items-center">
                                                <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur flex items-center justify-center mb-4 ring-4 ring-white/30">
                                                    <Layers className="w-10 h-10 text-white" />
                                                </div>
                                                <Dialog.Title className="text-xl font-bold text-white">
                                                    {batch.Name}
                                                </Dialog.Title>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-sm font-medium">
                                                        <Calendar className="w-4 h-4" />
                                                        {batch.AcademicYear}
                                                    </span>
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-sm font-medium">
                                                        <GraduationCap className="w-4 h-4" />
                                                        Semester {batch.Semester}
                                                    </span>
                                                    <span className={cn(
                                                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium",
                                                        batch.IsActive ? "bg-emerald-500/80 text-white" : "bg-red-500/80 text-white"
                                                    )}>
                                                        {batch.IsActive ? (
                                                            <><UserCheck className="w-4 h-4" /> Active</>
                                                        ) : (
                                                            <><UserX className="w-4 h-4" /> Inactive</>
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
                                            {/* Batch Information */}
                                            <div>
                                                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Batch Information</h3>
                                                <div className="grid grid-cols-3 gap-3">
                                                    {/* ID */}
                                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                        <div className="p-2 bg-purple-100 rounded-lg">
                                                            <Hash className="w-5 h-5 text-purple-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500">Batch ID</p>
                                                            <p className="font-medium text-gray-900">#{batch.Id}</p>
                                                        </div>
                                                    </div>

                                                    {/* Semester */}
                                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                        <div className="p-2 bg-cyan-100 rounded-lg">
                                                            <GraduationCap className="w-5 h-5 text-cyan-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500">Semester</p>
                                                            <p className="font-medium text-gray-900">{batch.Semester}</p>
                                                        </div>
                                                    </div>

                                                    {/* Division */}
                                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                        <div className="p-2 bg-indigo-100 rounded-lg">
                                                            <Layers className="w-5 h-5 text-indigo-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500">Division</p>
                                                            <p className="font-medium text-gray-900">{batch.Division || 'N/A'}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Department Information */}
                                            <div>
                                                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Department</h3>
                                                <div className="grid grid-cols-2 gap-3">
                                                    {/* Department Name */}
                                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                        <div className="p-2 bg-amber-100 rounded-lg">
                                                            <Building2 className="w-5 h-5 text-amber-600" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs text-gray-500">Department Name</p>
                                                            <p className="font-medium text-gray-900 truncate">{batch.DepartmentName}</p>
                                                        </div>
                                                    </div>

                                                    {/* Department Code */}
                                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                        <div className="p-2 bg-amber-100 rounded-lg">
                                                            <Hash className="w-5 h-5 text-amber-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500">Department Code</p>
                                                            <p className="font-medium text-gray-900 font-mono">{batch.DepartmentCode || 'N/A'}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Class Coordinator Information */}
                                            <div>
                                                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Class Coordinator</h3>
                                                <div className="grid grid-cols-2 gap-3">
                                                    {/* Coordinator Name */}
                                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                        <div className="p-2 bg-blue-100 rounded-lg">
                                                            <User className="w-5 h-5 text-blue-600" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs text-gray-500">Coordinator Name</p>
                                                            <p className="font-medium text-gray-900 truncate">{batch.ClassCoordinatorName || 'Not Assigned'}</p>
                                                        </div>
                                                    </div>

                                                    {/* Coordinator Email */}
                                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                        <div className="p-2 bg-blue-100 rounded-lg">
                                                            <Mail className="w-5 h-5 text-blue-600" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs text-gray-500">Coordinator Email</p>
                                                            <p className="font-medium text-gray-900 truncate">{batch.ClassCoordinatorEmail || 'N/A'}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Timestamps */}
                                            <div>
                                                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Activity</h3>
                                                <div className="grid grid-cols-2 gap-3">
                                                    {/* Created Date */}
                                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                        <div className="p-2 bg-gray-100 rounded-lg">
                                                            <Calendar className="w-5 h-5 text-gray-500" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500">Created</p>
                                                            <p className="font-medium text-gray-900 text-sm">
                                                                {formatDate(batch.CreatedAt)}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Updated Date */}
                                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                        <div className="p-2 bg-gray-100 rounded-lg">
                                                            <Clock className="w-5 h-5 text-gray-500" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500">Last Updated</p>
                                                            <p className="font-medium text-gray-900 text-sm">
                                                                {formatDate(batch.UpdatedAt) || 'Never'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Statistics */}
                                            <div>
                                                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Statistics</h3>
                                                <div className="grid grid-cols-1 gap-3">
                                                    <div className="p-3 bg-cyan-50 rounded-xl text-center">
                                                        <BookOpen className="w-5 h-5 text-cyan-600 mx-auto mb-1" />
                                                        <p className="text-lg font-bold text-cyan-700">{batch.CourseOfferingsCount || 0}</p>
                                                        <p className="text-xs text-cyan-600">Course Offerings</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="py-16 text-center text-gray-500">
                                        Batch not found
                                    </div>
                                )}
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}

// Stats Card Component
const StatsCard = ({ icon: Icon, label, value, color, loading }) => (
    <div className={cn(
        "relative overflow-hidden rounded-xl p-4",
        "bg-gradient-to-br",
        color
    )}>
        <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-lg backdrop-blur">
                <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
                <p className="text-white/80 text-sm font-medium">{label}</p>
                {loading ? (
                    <div className="h-8 w-12 bg-white/20 rounded animate-pulse" />
                ) : (
                    <p className="text-2xl font-bold text-white">{value}</p>
                )}
            </div>
        </div>
    </div>
)

// Debounce hook for search
const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value)

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value)
        }, delay)

        return () => clearTimeout(handler)
    }, [value, delay])

    return debouncedValue
}

// Main Page Component
const BatchesPage = () => {
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const deleteModal = useModal()
    const detailModal = useModal()
    const [selectedBatches, setSelectedBatches] = useState([])
    const [searchInput, setSearchInput] = useState('')
    const [statusFilter, setStatusFilter] = useState('')
    const [departmentFilter, setDepartmentFilter] = useState('')
    const [showFilters, setShowFilters] = useState(false)

    const debouncedSearch = useDebounce(searchInput, 300)

    const {
        currentPage,
        pageSize,
        handlePageChange,
        handlePageSizeChange,
        paginationParams,
    } = usePagination()

    // Fetch departments for filter
    const { data: departmentsData } = useQuery({
        queryKey: ['departments-select'],
        queryFn: () => departmentService.getAll({ pageSize: 100 }),
    })

    const departments = departmentsData?.Data?.Data || []

    // Fetch batches
    const { data, isLoading, refetch } = useQuery({
        queryKey: ['batches', paginationParams, debouncedSearch, statusFilter, departmentFilter],
        queryFn: () =>
            batchService.getAll({
                ...paginationParams,
                searchTerm: debouncedSearch || undefined,
                isActive: statusFilter === '' ? undefined : statusFilter === 'active',
                departmentId: departmentFilter || undefined,
            }),
    })

    // Fetch dashboard stats for accurate counts
    const { data: dashboardData, isLoading: statsLoading, refetch: refetchStats } = useQuery({
        queryKey: ['admin-dashboard-stats'],
        queryFn: () => dashboardService.getAdminDashboard(),
        staleTime: 30000,
    })

    // Get data from API responses
    const batches = data?.Data?.Data || []
    const totalItems = data?.Data?.TotalRecords || 0
    const totalPages = data?.Data?.TotalPages || 0

    // Get stats from dashboard API for accurate total counts
    const dashboardStats = dashboardData?.Data || {}
    const stats = {
        totalBatches: dashboardStats.TotalBatches || 0,
        activeBatches: dashboardStats.ActiveBatches || 0,
        inactiveBatches: dashboardStats.InactiveBatches || 0,
    }

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: (id) => batchService.delete(id),
        onSuccess: () => {
            toast.success('Batch deleted successfully')
            queryClient.invalidateQueries(['batches'])
            deleteModal.close()
            setSelectedBatches([])
        },
        onError: () => {
            toast.error('Failed to delete batch')
        },
    })

    const handleDelete = () => {
        if (deleteModal.data) {
            deleteMutation.mutate(deleteModal.data.Id)
        }
    }

    const handleViewBatch = (batch) => {
        detailModal.open(batch)
    }

    const handleSelectBatch = (id, e) => {
        e.stopPropagation()
        setSelectedBatches(prev =>
            prev.includes(id)
                ? prev.filter(item => item !== id)
                : [...prev, id]
        )
    }

    const handleSelectAll = () => {
        if (selectedBatches.length === batches.length) {
            setSelectedBatches([])
        } else {
            setSelectedBatches(batches.map(b => b.Id))
        }
    }

    const handleRefresh = () => {
        refetch()
        refetchStats()
        toast.success('Data refreshed')
    }

    const handleBulkDelete = async () => {
        if (selectedBatches.length === 0) return

        try {
            await Promise.all(selectedBatches.map(id => batchService.delete(id)))
            toast.success(`${selectedBatches.length} batch${selectedBatches.length > 1 ? 'es' : ''} deleted successfully`)
            queryClient.invalidateQueries(['batches'])
            queryClient.invalidateQueries(['admin-dashboard-stats'])
            setSelectedBatches([])
        } catch (error) {
            toast.error('Failed to delete some batches')
        }
    }

    const handleExportCsv = async () => {
        const blob = await exportBatchesToCsv({
            departmentId: departmentFilter ? parseInt(departmentFilter) : null,
            isActive: statusFilter === '' ? null : statusFilter === 'active'
        })
        downloadBlob(blob, `batches_${new Date().toISOString().split('T')[0]}.csv`)
    }

    const handleExportExcel = async () => {
        const blob = await exportBatchesToExcel({
            departmentId: departmentFilter ? parseInt(departmentFilter) : null,
            isActive: statusFilter === '' ? null : statusFilter === 'active'
        })
        downloadBlob(blob, `batches_${new Date().toISOString().split('T')[0]}.xlsx`)
    }

    const clearFilters = () => {
        setSearchInput('')
        setStatusFilter('')
        setDepartmentFilter('')
    }

    const hasActiveFilters = searchInput || statusFilter || departmentFilter

    const statusOptions = [
        { value: '', label: 'All Status' },
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
    ]

    const departmentOptions = [
        { value: '', label: 'All Departments' },
        ...departments.map((d) => ({
            value: d.Id?.toString(),
            label: d.Name,
        })),
    ]

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Layers className="w-7 h-7 text-cyan-500" />
                        Batches
                    </h1>
                    <p className="text-gray-500 mt-1">Manage student batches and cohorts</p>
                </div>
                <div className="flex items-center gap-3">
                    <ExportDropdown
                        onExportCsv={handleExportCsv}
                        onExportExcel={handleExportExcel}
                        className="hidden sm:flex"
                    />
                    <Button
                        onClick={() => navigate(`${ROUTES.ADMIN_BATCHES}/create`)}
                        className="bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-600 hover:to-teal-700 text-white shadow-lg shadow-cyan-500/25"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Batch
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatsCard
                    icon={Layers}
                    label="Total Batches"
                    value={stats.totalBatches}
                    color="from-cyan-500 to-teal-600"
                    loading={statsLoading}
                />
                <StatsCard
                    icon={UserCheck}
                    label="Active"
                    value={stats.activeBatches}
                    color="from-emerald-500 to-teal-600"
                    loading={statsLoading}
                />
                <StatsCard
                    icon={UserX}
                    label="Inactive"
                    value={stats.inactiveBatches}
                    color="from-red-500 to-rose-600"
                    loading={statsLoading}
                />
            </div>

            {/* Filters */}
            <Card className="border-0 shadow-sm overflow-hidden">
                <Card.Body className="p-4">
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                placeholder="Search by name..."
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-0 rounded-xl text-sm focus:ring-2 focus:ring-cyan-500 focus:bg-white transition-all"
                            />
                            {searchInput && (
                                <button
                                    onClick={() => setSearchInput('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full"
                                >
                                    <X className="w-4 h-4 text-gray-400" />
                                </button>
                            )}
                        </div>

                        {/* Filter toggles */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={cn(
                                    "inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
                                    showFilters
                                        ? "bg-cyan-50 text-cyan-600"
                                        : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                                )}
                            >
                                <SlidersHorizontal className="w-4 h-4" />
                                Filters
                                {hasActiveFilters && (
                                    <span className="w-2 h-2 bg-cyan-500 rounded-full" />
                                )}
                            </button>

                            <button
                                onClick={handleRefresh}
                                disabled={isLoading}
                                className="p-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50"
                                title="Refresh"
                            >
                                <RefreshCw className={cn(
                                    "w-4 h-4 text-gray-500",
                                    isLoading && "animate-spin"
                                )} />
                            </button>
                        </div>
                    </div>

                    {/* Expanded Filters */}
                    {showFilters && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <div className="flex flex-wrap items-end gap-4">
                                <div className="w-40">
                                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Status</label>
                                    <Select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        options={statusOptions}
                                        className="bg-gray-50 border-0"
                                    />
                                </div>
                                <div className="w-48">
                                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Department</label>
                                    <Select
                                        value={departmentFilter}
                                        onChange={(e) => setDepartmentFilter(e.target.value)}
                                        options={departmentOptions}
                                        className="bg-gray-50 border-0"
                                    />
                                </div>
                                {hasActiveFilters && (
                                    <button
                                        onClick={clearFilters}
                                        className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                        Clear filters
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </Card.Body>
            </Card>

            {/* Selection Actions */}
            {selectedBatches.length > 0 && (
                <div className="flex items-center justify-between p-4 bg-cyan-50 border border-cyan-100 rounded-xl">
                    <div className="flex items-center gap-3">
                        <CheckSquare className="w-5 h-5 text-cyan-600" />
                        <span className="text-sm font-medium text-cyan-900">
                            {selectedBatches.length} batch{selectedBatches.length > 1 ? 'es' : ''} selected
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedBatches([])}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="danger"
                            size="sm"
                            onClick={handleBulkDelete}
                            className="gap-1.5"
                        >
                            <Trash2 className="w-4 h-4" />
                            Delete Selected
                        </Button>
                    </div>
                </div>
            )}

            {/* Table */}
            <Card className="border-0 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-4 py-3 text-left">
                                    <button
                                        onClick={handleSelectAll}
                                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                                    >
                                        {selectedBatches.length === batches.length && batches.length > 0 ? (
                                            <CheckSquare className="w-4 h-4 text-cyan-600" />
                                        ) : (
                                            <Square className="w-4 h-4 text-gray-400" />
                                        )}
                                    </button>
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Batch
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Department
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Semester
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Coordinator
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i}>
                                        <td className="px-4 py-3"><div className="w-4 h-4 bg-gray-200 rounded animate-pulse" /></td>
                                        <td className="px-4 py-3"><div className="h-10 bg-gray-200 rounded animate-pulse w-48" /></td>
                                        <td className="px-4 py-3"><div className="h-6 bg-gray-200 rounded animate-pulse w-32" /></td>
                                        <td className="px-4 py-3"><div className="h-6 bg-gray-200 rounded animate-pulse w-16" /></td>
                                        <td className="px-4 py-3"><div className="h-6 bg-gray-200 rounded animate-pulse w-32" /></td>
                                        <td className="px-4 py-3"><div className="h-6 bg-gray-200 rounded animate-pulse w-16" /></td>
                                        <td className="px-4 py-3"><div className="h-8 bg-gray-200 rounded animate-pulse w-20" /></td>
                                    </tr>
                                ))
                            ) : batches.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-16 text-center">
                                        <Layers className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                        <p className="text-gray-500 font-medium">No batches found</p>
                                        <p className="text-gray-400 text-sm mt-1">Get started by creating a new batch</p>
                                        <Button
                                            className="mt-4"
                                            onClick={() => navigate(`${ROUTES.ADMIN_BATCHES}/create`)}
                                        >
                                            <Plus className="w-4 h-4 mr-2" />
                                            Add Batch
                                        </Button>
                                    </td>
                                </tr>
                            ) : (
                                batches.map((row) => (
                                    <tr
                                        key={row.Id}
                                        onClick={() => handleViewBatch(row)}
                                        className={cn(
                                            "hover:bg-gray-50/80 cursor-pointer transition-colors",
                                            selectedBatches.includes(row.Id) && "bg-cyan-50/50"
                                        )}
                                    >
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={(e) => handleSelectBatch(row.Id, e)}
                                                className="p-1 hover:bg-gray-100 rounded transition-colors"
                                            >
                                                {selectedBatches.includes(row.Id) ? (
                                                    <CheckSquare className="w-4 h-4 text-cyan-600" />
                                                ) : (
                                                    <Square className="w-4 h-4 text-gray-400" />
                                                )}
                                            </button>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center shadow-sm">
                                                    <Layers className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{row.Name}</p>
                                                    <p className="text-sm text-gray-500">{row.AcademicYear}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <Building2 className="w-4 h-4 text-gray-400" />
                                                <span className="text-gray-700">{row.DepartmentName || '-'}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-cyan-50 text-cyan-700">
                                                Sem {row.Semester}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-gray-700">{row.ClassCoordinatorName || 'Not Assigned'}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={cn(
                                                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                                                row.IsActive
                                                    ? "bg-emerald-50 text-emerald-700"
                                                    : "bg-red-50 text-red-700"
                                            )}>
                                                <span className={cn(
                                                    "w-1.5 h-1.5 rounded-full",
                                                    row.IsActive ? "bg-emerald-500 animate-pulse" : "bg-red-500"
                                                )} />
                                                {row.IsActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="xs"
                                                    className="hover:bg-gray-100"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleViewBatch(row)
                                                    }}
                                                    title="View Details"
                                                >
                                                    <Eye className="w-4 h-4 text-gray-500" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="xs"
                                                    className="hover:bg-blue-50"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        navigate(`${ROUTES.ADMIN_BATCHES}/${row.Id}/edit`)
                                                    }}
                                                    title="Edit"
                                                >
                                                    <Edit className="w-4 h-4 text-blue-600" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="xs"
                                                    className="hover:bg-red-50"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        deleteModal.open(row)
                                                    }}
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4 text-red-500" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

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
            <BatchDetailModal
                isOpen={detailModal.isOpen}
                onClose={detailModal.close}
                batchId={detailModal.data?.Id}
            />

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={deleteModal.isOpen}
                onClose={deleteModal.close}
                onConfirm={handleDelete}
                title="Delete Batch"
                message={`Are you sure you want to delete "${deleteModal.data?.Name}"? This action cannot be undone.`}
                confirmText="Delete"
                loading={deleteMutation.isPending}
            />
        </div>
    )
}

export default BatchesPage
