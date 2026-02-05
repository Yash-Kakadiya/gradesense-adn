import { useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    ClipboardList,
    Plus,
    Edit,
    Trash2,
    Download,
    Search,
    BookOpen,
    Target,
    Percent,
    CheckCircle,
    XCircle,
    MoreHorizontal,
    Eye,
    Layers,
    CheckSquare,
} from 'lucide-react'
import { Menu, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { evaluationSchemeService } from '@/services/evaluationService'
import { courseOfferingService } from '@/services/courseOfferingService'
import { batchService } from '@/services/batchService'
import { dashboardService } from '@/services/dashboardService'
import { exportEvaluationSchemesToCsv, exportEvaluationSchemesToExcel, downloadBlob } from '@/services/exportService'
import { Card, Button, ExportDropdown } from '@/components/common'
import { Table, Pagination, ConfirmDialog } from '@/components/common'
import { ROUTES } from '@/utils/constants'
import toast from 'react-hot-toast'
import { useModal, useDebounce, usePagination } from '@/hooks'
import EvaluationSchemeDetailModal from '@/components/evaluation-schemes/EvaluationSchemeDetailModal'

const EvaluationSchemesPage = () => {
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const deleteModal = useModal()

    // Filters
    const [searchTerm, setSearchTerm] = useState('')
    const [courseOfferingFilter, setCourseOfferingFilter] = useState('')
    const [batchFilter, setBatchFilter] = useState('')
    const [evaluationTypeFilter, setEvaluationTypeFilter] = useState('')
    const [statusFilter, setStatusFilter] = useState('')
    const debouncedSearch = useDebounce(searchTerm, 400)

    // Selection for bulk operations
    const [selectedIds, setSelectedIds] = useState([])

    // Detail modal
    const [detailModal, setDetailModal] = useState({ isOpen: false, evaluationScheme: null })

    // Pagination
    const { currentPage, pageSize, handlePageChange, handlePageSizeChange, resetPage } =
        usePagination(1, 10)

    // Reset page when filters change
    const handleFilterChange = useCallback(
        (setter) => (value) => {
            setter(value)
            resetPage()
        },
        [resetPage]
    )

    // Fetch evaluation schemes
    const { data: schemesData, isLoading } = useQuery({
        queryKey: [
            'evaluation-schemes',
            {
                debouncedSearch,
                courseOfferingFilter,
                batchFilter,
                evaluationTypeFilter,
                statusFilter,
                currentPage,
                pageSize,
            },
        ],
        queryFn: () =>
            evaluationSchemeService.getAll({
                searchTerm: debouncedSearch || undefined,
                courseOfferingId: courseOfferingFilter || undefined,
                batchId: batchFilter || undefined,
                evaluationType: evaluationTypeFilter || undefined,
                isActive: statusFilter === '' ? undefined : statusFilter === 'true',
                pageNumber: currentPage,
                pageSize: pageSize,
            }),
    })

    // Fetch filter options
    const { data: courseOfferingsData } = useQuery({
        queryKey: ['course-offerings-select'],
        queryFn: () => courseOfferingService.getAll({ pageSize: 200 }),
    })

    const { data: batchesData } = useQuery({
        queryKey: ['batches-select'],
        queryFn: () => batchService.getAll({ pageSize: 100 }),
    })

    // Fetch dashboard stats for accurate counts
    const { data: dashboardData } = useQuery({
        queryKey: ['admin-dashboard-stats'],
        queryFn: () => dashboardService.getAdminDashboard(),
        staleTime: 30000,
    })

    // Extract data with PascalCase
    const schemes = schemesData?.Data?.Data || []
    const totalItems = schemesData?.Data?.TotalRecords || 0
    const totalPages = schemesData?.Data?.TotalPages || 0
    const courseOfferings = courseOfferingsData?.Data?.Data || []
    const batches = batchesData?.Data?.Data || []

    // Get stats from dashboard API for accurate total counts
    const dashboardStats = dashboardData?.Data || {}
    const stats = useMemo(() => {
        return {
            total: dashboardStats.TotalEvaluationSchemes || 0,
            active: dashboardStats.ActiveEvaluationSchemes || 0,
            inactive: dashboardStats.InactiveEvaluationSchemes || 0,
        }
    }, [dashboardStats])

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: (id) => evaluationSchemeService.delete(id),
        onSuccess: () => {
            toast.success('Evaluation scheme deleted successfully')
            queryClient.invalidateQueries(['evaluation-schemes'])
            deleteModal.close()
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to delete evaluation scheme')
        },
    })

    const handleDelete = () => {
        if (deleteModal.data?.Id) {
            deleteMutation.mutate(deleteModal.data.Id)
        }
    }

    // View evaluation scheme details
    const handleViewDetails = async (scheme) => {
        try {
            const response = await evaluationSchemeService.getById(scheme.Id)
            setDetailModal({ isOpen: true, evaluationScheme: response.Data })
        } catch (error) {
            toast.error('Failed to load evaluation scheme details')
        }
    }

    // Export to CSV
    const handleExportCsv = async () => {
        const blob = await exportEvaluationSchemesToCsv({
            courseOfferingId: courseOfferingFilter ? parseInt(courseOfferingFilter) : null,
            isActive: statusFilter === '' ? null : statusFilter === 'active'
        })
        downloadBlob(blob, `evaluation_schemes_export_${new Date().toISOString().split('T')[0]}.csv`)
    }

    // Export to Excel
    const handleExportExcel = async () => {
        const blob = await exportEvaluationSchemesToExcel({
            courseOfferingId: courseOfferingFilter ? parseInt(courseOfferingFilter) : null,
            isActive: statusFilter === '' ? null : statusFilter === 'active'
        })
        downloadBlob(blob, `evaluation_schemes_export_${new Date().toISOString().split('T')[0]}.xlsx`)
    }

    // Selection handlers
    const handleSelectAll = (checked) => {
        setSelectedIds(checked ? schemes.map((s) => s.Id) : [])
    }

    const handleSelectRow = (id, checked) => {
        setSelectedIds((prev) => (checked ? [...prev, id] : prev.filter((i) => i !== id)))
    }

    // Bulk delete handler
    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return

        try {
            await Promise.all(selectedIds.map(id => evaluationSchemeService.delete(id)))
            toast.success(`${selectedIds.length} evaluation scheme${selectedIds.length > 1 ? 's' : ''} deleted successfully`)
            queryClient.invalidateQueries(['evaluation-schemes'])
            queryClient.invalidateQueries(['admin-dashboard-stats'])
            setSelectedIds([])
        } catch (error) {
            toast.error('Failed to delete some evaluation schemes')
        }
    }

    // Evaluation type options
    const evaluationTypeOptions = [
        { value: '', label: 'All Types' },
        { value: 'Internal', label: 'Internal' },
        { value: 'External', label: 'External' },
        { value: 'Practical', label: 'Practical' },
        { value: 'Assignment', label: 'Assignment' },
        { value: 'Project', label: 'Project' },
    ]

    const statusOptions = [
        { value: '', label: 'All Status' },
        { value: 'true', label: 'Active' },
        { value: 'false', label: 'Inactive' },
    ]

    // Table columns
    const columns = [
        {
            key: 'select',
            header: (
                <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                    checked={schemes.length > 0 && selectedIds.length === schemes.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                />
            ),
            cell: (row) => (
                <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                    checked={selectedIds.includes(row.Id)}
                    onChange={(e) => {
                        e.stopPropagation()
                        handleSelectRow(row.Id, e.target.checked)
                    }}
                    onClick={(e) => e.stopPropagation()}
                />
            ),
            width: '40px',
        },
        {
            key: 'scheme',
            header: 'Scheme',
            cell: (row) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <ClipboardList className="w-5 h-5 text-teal-600" />
                    </div>
                    <div>
                        <p className="font-medium text-gray-900">{row.Name}</p>
                        <p className="text-sm text-gray-500">{row.EvaluationType || 'Standard'}</p>
                    </div>
                </div>
            ),
        },
        {
            key: 'course',
            header: 'Course',
            cell: (row) => (
                <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-gray-400" />
                    <div>
                        <p className="text-gray-700">{row.SubjectName}</p>
                        <p className="text-xs text-gray-500">{row.BatchName}</p>
                    </div>
                </div>
            ),
        },
        {
            key: 'marks',
            header: 'Marks',
            cell: (row) => (
                <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-blue-500" />
                    <div>
                        <p className="font-medium text-gray-900">{row.TotalMarks}</p>
                        <p className="text-xs text-gray-500">Pass: {row.PassingMarks}</p>
                    </div>
                </div>
            ),
        },
        {
            key: 'weight',
            header: 'Weight',
            cell: (row) => (
                <div className="flex items-center gap-1">
                    <Percent className="w-4 h-4 text-amber-500" />
                    <span className="font-medium text-gray-700">{row.Weight}%</span>
                </div>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            cell: (row) => (
                <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${row.IsActive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                        }`}
                >
                    {row.IsActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    {row.IsActive ? 'Active' : 'Inactive'}
                </span>
            ),
        },
        {
            key: 'actions',
            header: '',
            cell: (row) => (
                <Menu as="div" className="relative">
                    <Menu.Button
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <MoreHorizontal className="w-4 h-4 text-gray-500" />
                    </Menu.Button>
                    <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                    >
                        <Menu.Items className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-10">
                            <Menu.Item>
                                {({ active }) => (
                                    <button
                                        className={`${active ? 'bg-gray-50' : ''
                                            } flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700`}
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleViewDetails(row)
                                        }}
                                    >
                                        <Eye className="w-4 h-4" />
                                        View Details
                                    </button>
                                )}
                            </Menu.Item>
                            <Menu.Item>
                                {({ active }) => (
                                    <button
                                        className={`${active ? 'bg-gray-50' : ''
                                            } flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700`}
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            navigate(`${ROUTES.ADMIN_EVALUATION_SCHEMES}/${row.Id}/edit`)
                                        }}
                                    >
                                        <Edit className="w-4 h-4" />
                                        Edit
                                    </button>
                                )}
                            </Menu.Item>
                            <Menu.Item>
                                {({ active }) => (
                                    <button
                                        className={`${active ? 'bg-red-50' : ''
                                            } flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600`}
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            deleteModal.open(row)
                                        }}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Delete
                                    </button>
                                )}
                            </Menu.Item>
                        </Menu.Items>
                    </Transition>
                </Menu>
            ),
            width: '60px',
        },
    ]

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Evaluation Schemes</h1>
                    <p className="text-gray-500 mt-1">Manage course evaluation schemes and assessments</p>
                </div>
                <div className="flex items-center gap-3">
                    <ExportDropdown
                        onExportCsv={handleExportCsv}
                        onExportExcel={handleExportExcel}
                    />
                    <Button onClick={() => navigate(`${ROUTES.ADMIN_EVALUATION_SCHEMES}/create`)} className="gap-2">
                        <Plus className="w-4 h-4" />
                        Add Scheme
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Card className="border-0 shadow-sm bg-gradient-to-br from-teal-50 to-cyan-50">
                    <Card.Body className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-teal-600">Total Schemes</p>
                                <p className="text-2xl font-bold text-teal-700 mt-1">{stats.total}</p>
                            </div>
                            <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                                <ClipboardList className="w-5 h-5 text-teal-600" />
                            </div>
                        </div>
                    </Card.Body>
                </Card>
                <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-green-50">
                    <Card.Body className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-emerald-600">Active</p>
                                <p className="text-2xl font-bold text-emerald-700 mt-1">{stats.active}</p>
                            </div>
                            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                                <CheckCircle className="w-5 h-5 text-emerald-600" />
                            </div>
                        </div>
                    </Card.Body>
                </Card>
                <Card className="border-0 shadow-sm bg-gradient-to-br from-red-50 to-rose-50">
                    <Card.Body className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-red-600">Inactive</p>
                                <p className="text-2xl font-bold text-red-700 mt-1">{stats.inactive}</p>
                            </div>
                            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                <XCircle className="w-5 h-5 text-red-600" />
                            </div>
                        </div>
                    </Card.Body>
                </Card>
            </div>

            {/* Filters */}
            <Card className="border-0 shadow-sm">
                <Card.Body className="p-4">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                        {/* Search Input */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value)
                                    resetPage()
                                }}
                                placeholder="Search by name..."
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-0 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
                            />
                        </div>
                        {/* Filter Selects */}
                        <div className="flex flex-wrap items-center gap-3">
                            <select
                                value={batchFilter}
                                onChange={(e) => handleFilterChange(setBatchFilter)(e.target.value)}
                                className="px-4 py-2.5 bg-gray-50 border-0 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 min-w-[160px]"
                            >
                                <option value="">All Batches</option>
                                {batches.map((batch) => (
                                    <option key={batch.Id} value={batch.Id}>
                                        {batch.Name}
                                    </option>
                                ))}
                            </select>
                            <select
                                value={evaluationTypeFilter}
                                onChange={(e) => handleFilterChange(setEvaluationTypeFilter)(e.target.value)}
                                className="px-4 py-2.5 bg-gray-50 border-0 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 min-w-[140px]"
                            >
                                {evaluationTypeOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                            <select
                                value={statusFilter}
                                onChange={(e) => handleFilterChange(setStatusFilter)(e.target.value)}
                                className="px-4 py-2.5 bg-gray-50 border-0 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 min-w-[130px]"
                            >
                                {statusOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </Card.Body>
            </Card>

            {/* Selection Info */}
            {selectedIds.length > 0 && (
                <div className="flex items-center justify-between p-4 bg-teal-50 border border-teal-100 rounded-xl">
                    <div className="flex items-center gap-3">
                        <CheckSquare className="w-5 h-5 text-teal-600" />
                        <span className="text-sm font-medium text-teal-900">
                            {selectedIds.length} scheme{selectedIds.length > 1 ? 's' : ''} selected
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedIds([])}
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
                <Table
                    columns={columns}
                    data={schemes}
                    loading={isLoading}
                    onRowClick={handleViewDetails}
                    emptyState={{
                        icon: ClipboardList,
                        title: 'No evaluation schemes found',
                        description: 'Get started by creating a new evaluation scheme',
                        action: () => navigate(`${ROUTES.ADMIN_EVALUATION_SCHEMES}/create`),
                        actionLabel: 'Add Scheme',
                    }}
                />
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

            {/* Delete Confirmation Modal */}
            <ConfirmDialog
                isOpen={deleteModal.isOpen}
                onClose={deleteModal.close}
                onConfirm={handleDelete}
                title="Delete Evaluation Scheme"
                message={`Are you sure you want to delete "${deleteModal.data?.Name}"? This action cannot be undone.`}
                confirmText="Delete"
                loading={deleteMutation.isPending}
            />

            {/* Detail Modal */}
            <EvaluationSchemeDetailModal
                isOpen={detailModal.isOpen}
                onClose={() => setDetailModal({ isOpen: false, evaluationScheme: null })}
                evaluationScheme={detailModal.evaluationScheme}
                onEdit={(evaluationScheme) => {
                    setDetailModal({ isOpen: false, evaluationScheme: null })
                    navigate(`${ROUTES.ADMIN_EVALUATION_SCHEMES}/${evaluationScheme.Id}/edit`)
                }}
            />
        </div>
    )
}

export default EvaluationSchemesPage
