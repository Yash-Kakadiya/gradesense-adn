import { useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    BookOpen,
    Plus,
    Edit,
    Trash2,
    Download,
    Search,
    Calendar,
    Users,
    CheckCircle,
    XCircle,
    MoreHorizontal,
    Eye,
    GraduationCap,
    User,
    CheckSquare,
} from 'lucide-react'
import { Menu, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { courseOfferingService } from '@/services/courseOfferingService'
import { subjectService } from '@/services/subjectService'
import { batchService } from '@/services/batchService'
import { facultyService } from '@/services/facultyService'
import { departmentService } from '@/services/departmentService'
import { dashboardService } from '@/services/dashboardService'
import { exportCourseOfferingsToCsv, exportCourseOfferingsToExcel, downloadBlob } from '@/services/exportService'
import { Card, Button, ExportDropdown } from '@/components/common'
import { Table, Pagination, ConfirmDialog } from '@/components/common'
import { ROUTES } from '@/utils/constants'
import toast from 'react-hot-toast'
import { useModal, useDebounce, usePagination } from '@/hooks'
import CourseOfferingDetailModal from '@/components/course-offerings/CourseOfferingDetailModal'

const CourseOfferingsPage = () => {
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const deleteModal = useModal()

    // Filters
    const [searchTerm, setSearchTerm] = useState('')
    const [subjectFilter, setSubjectFilter] = useState('')
    const [batchFilter, setBatchFilter] = useState('')
    const [coordinatorFilter, setCoordinatorFilter] = useState('')
    const [departmentFilter, setDepartmentFilter] = useState('')
    const [academicYearFilter, setAcademicYearFilter] = useState('')
    const [statusFilter, setStatusFilter] = useState('')
    const debouncedSearch = useDebounce(searchTerm, 400)

    // Selection for bulk operations
    const [selectedIds, setSelectedIds] = useState([])

    // Detail modal
    const [detailModal, setDetailModal] = useState({ isOpen: false, courseOffering: null })

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

    // Fetch course offerings
    const { data: courseOfferingsData, isLoading } = useQuery({
        queryKey: [
            'course-offerings',
            {
                debouncedSearch,
                subjectFilter,
                batchFilter,
                coordinatorFilter,
                departmentFilter,
                academicYearFilter,
                statusFilter,
                currentPage,
                pageSize,
            },
        ],
        queryFn: () =>
            courseOfferingService.getAll({
                searchTerm: debouncedSearch || undefined,
                subjectId: subjectFilter || undefined,
                batchId: batchFilter || undefined,
                subjectCoordinatorId: coordinatorFilter || undefined,
                departmentId: departmentFilter || undefined,
                academicYear: academicYearFilter || undefined,
                isActive: statusFilter === '' ? undefined : statusFilter === 'true',
                pageNumber: currentPage,
                pageSize: pageSize,
            }),
    })

    // Fetch filter options
    const { data: subjectsData } = useQuery({
        queryKey: ['subjects-select'],
        queryFn: () => subjectService.getAll({ pageSize: 200 }),
    })

    const { data: batchesData } = useQuery({
        queryKey: ['batches-select'],
        queryFn: () => batchService.getAll({ pageSize: 100 }),
    })

    const { data: facultiesData } = useQuery({
        queryKey: ['faculties-select'],
        queryFn: () => facultyService.getAll({ pageSize: 200 }),
    })

    const { data: departmentsData } = useQuery({
        queryKey: ['departments-select'],
        queryFn: () => departmentService.getAll({ pageSize: 100 }),
    })

    // Fetch dashboard stats for accurate counts
    const { data: dashboardData } = useQuery({
        queryKey: ['admin-dashboard-stats'],
        queryFn: () => dashboardService.getAdminDashboard(),
        staleTime: 30000,
    })

    // Extract data with PascalCase
    const courseOfferings = courseOfferingsData?.Data?.Data || []
    const totalItems = courseOfferingsData?.Data?.TotalRecords || 0
    const totalPages = courseOfferingsData?.Data?.TotalPages || 0
    const subjects = subjectsData?.Data?.Data || []
    const batches = batchesData?.Data?.Data || []
    const faculties = facultiesData?.Data?.Data || []
    const departments = departmentsData?.Data?.Data || []

    // Get stats from dashboard API for accurate total counts
    const dashboardStats = dashboardData?.Data || {}
    const stats = useMemo(() => {
        return {
            total: dashboardStats.TotalCourseOfferings || 0,
            active: dashboardStats.ActiveCourseOfferings || 0,
            inactive: dashboardStats.InactiveCourseOfferings || 0,
        }
    }, [dashboardStats])

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: (id) => courseOfferingService.delete(id),
        onSuccess: () => {
            toast.success('Course offering deleted successfully')
            queryClient.invalidateQueries(['course-offerings'])
            deleteModal.close()
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to delete course offering')
        },
    })

    const handleDelete = () => {
        if (deleteModal.data?.Id) {
            deleteMutation.mutate(deleteModal.data.Id)
        }
    }

    // View course offering details
    const handleViewDetails = async (courseOffering) => {
        try {
            const response = await courseOfferingService.getById(courseOffering.Id)
            setDetailModal({ isOpen: true, courseOffering: response.Data })
        } catch (error) {
            toast.error('Failed to load course offering details')
        }
    }

    // Export to CSV
    const handleExportCsv = async () => {
        const blob = await exportCourseOfferingsToCsv({
            batchId: batchFilter ? parseInt(batchFilter) : null,
            subjectId: subjectFilter ? parseInt(subjectFilter) : null,
            academicYear: academicYearFilter || null,
            isActive: statusFilter === '' ? null : statusFilter === 'active'
        })
        downloadBlob(blob, `course_offerings_export_${new Date().toISOString().split('T')[0]}.csv`)
    }

    // Export to Excel
    const handleExportExcel = async () => {
        const blob = await exportCourseOfferingsToExcel({
            batchId: batchFilter ? parseInt(batchFilter) : null,
            subjectId: subjectFilter ? parseInt(subjectFilter) : null,
            academicYear: academicYearFilter || null,
            isActive: statusFilter === '' ? null : statusFilter === 'active'
        })
        downloadBlob(blob, `course_offerings_export_${new Date().toISOString().split('T')[0]}.xlsx`)
    }

    // Selection handlers
    const handleSelectAll = (checked) => {
        setSelectedIds(checked ? courseOfferings.map((c) => c.Id) : [])
    }

    const handleSelectRow = (id, checked) => {
        setSelectedIds((prev) => (checked ? [...prev, id] : prev.filter((i) => i !== id)))
    }

    // Bulk delete handler
    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return

        try {
            await Promise.all(selectedIds.map(id => courseOfferingService.delete(id)))
            toast.success(`${selectedIds.length} course offering${selectedIds.length > 1 ? 's' : ''} deleted successfully`)
            queryClient.invalidateQueries(['course-offerings'])
            queryClient.invalidateQueries(['admin-dashboard-stats'])
            setSelectedIds([])
        } catch (error) {
            toast.error('Failed to delete some course offerings')
        }
    }

    // Generate academic year options (current year ± 5 years)
    const currentYear = new Date().getFullYear()
    const academicYearOptions = [
        { value: '', label: 'All Years' },
        ...Array.from({ length: 11 }, (_, i) => {
            const year = currentYear - 5 + i
            return { value: year.toString(), label: year.toString() }
        }),
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
                    className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    checked={courseOfferings.length > 0 && selectedIds.length === courseOfferings.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                />
            ),
            cell: (row) => (
                <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
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
            key: 'subject',
            header: 'Subject',
            cell: (row) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                        <p className="font-medium text-gray-900">{row.SubjectName}</p>
                        <p className="text-sm text-gray-500">{row.SubjectCode}</p>
                    </div>
                </div>
            ),
        },
        {
            key: 'batch',
            header: 'Batch',
            cell: (row) => (
                <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">{row.BatchName}</span>
                </div>
            ),
        },
        {
            key: 'coordinator',
            header: 'Coordinator',
            cell: (row) => (
                <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <div>
                        <p className="text-gray-700">{row.SubjectCoordinatorName || 'Not Assigned'}</p>
                        {row.SubjectCoordinatorEmployeeId && (
                            <p className="text-xs text-gray-500">{row.SubjectCoordinatorEmployeeId}</p>
                        )}
                    </div>
                </div>
            ),
        },
        {
            key: 'academicYear',
            header: 'Academic Year',
            cell: (row) => (
                <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700 font-medium">{row.AcademicYear}</span>
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
                                            navigate(`${ROUTES.ADMIN_COURSE_OFFERINGS}/${row.Id}/edit`)
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
                    <h1 className="text-2xl font-bold text-gray-900">Course Offerings</h1>
                    <p className="text-gray-500 mt-1">Manage course assignments for batches</p>
                </div>
                <div className="flex items-center gap-3">
                    <ExportDropdown
                        onExportCsv={handleExportCsv}
                        onExportExcel={handleExportExcel}
                    />
                    <Button onClick={() => navigate(`${ROUTES.ADMIN_COURSE_OFFERINGS}/create`)} className="gap-2">
                        <Plus className="w-4 h-4" />
                        Add Course Offering
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Card className="border-0 shadow-sm bg-gradient-to-br from-indigo-50 to-purple-50">
                    <Card.Body className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-indigo-600">Total Offerings</p>
                                <p className="text-2xl font-bold text-indigo-700 mt-1">{stats.total}</p>
                            </div>
                            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                                <BookOpen className="w-5 h-5 text-indigo-600" />
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
                                placeholder="Search by subject name or code..."
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-0 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                            />
                        </div>
                        {/* Filter Selects */}
                        <div className="flex flex-wrap items-center gap-3">
                            <select
                                value={batchFilter}
                                onChange={(e) => handleFilterChange(setBatchFilter)(e.target.value)}
                                className="px-4 py-2.5 bg-gray-50 border-0 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 min-w-[160px]"
                            >
                                <option value="">All Batches</option>
                                {batches.map((batch) => (
                                    <option key={batch.Id} value={batch.Id}>
                                        {batch.Name}
                                    </option>
                                ))}
                            </select>
                            <select
                                value={departmentFilter}
                                onChange={(e) => handleFilterChange(setDepartmentFilter)(e.target.value)}
                                className="px-4 py-2.5 bg-gray-50 border-0 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 min-w-[180px]"
                            >
                                <option value="">All Departments</option>
                                {departments.map((dept) => (
                                    <option key={dept.Id} value={dept.Id}>
                                        {dept.Name}
                                    </option>
                                ))}
                            </select>
                            <select
                                value={academicYearFilter}
                                onChange={(e) => handleFilterChange(setAcademicYearFilter)(e.target.value)}
                                className="px-4 py-2.5 bg-gray-50 border-0 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 min-w-[130px]"
                            >
                                {academicYearOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                            <select
                                value={statusFilter}
                                onChange={(e) => handleFilterChange(setStatusFilter)(e.target.value)}
                                className="px-4 py-2.5 bg-gray-50 border-0 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 min-w-[130px]"
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
                <div className="flex items-center justify-between p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
                    <div className="flex items-center gap-3">
                        <CheckSquare className="w-5 h-5 text-indigo-600" />
                        <span className="text-sm font-medium text-indigo-900">
                            {selectedIds.length} course offering{selectedIds.length > 1 ? 's' : ''} selected
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
                    data={courseOfferings}
                    loading={isLoading}
                    onRowClick={handleViewDetails}
                    emptyState={{
                        icon: BookOpen,
                        title: 'No course offerings found',
                        description: 'Get started by creating a new course offering',
                        action: () => navigate(`${ROUTES.ADMIN_COURSE_OFFERINGS}/create`),
                        actionLabel: 'Add Course Offering',
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
                title="Delete Course Offering"
                message={`Are you sure you want to delete the course offering for "${deleteModal.data?.SubjectName}"? This will also remove related enrollments and marks.`}
                confirmText="Delete"
                loading={deleteMutation.isPending}
            />

            {/* Detail Modal */}
            <CourseOfferingDetailModal
                isOpen={detailModal.isOpen}
                onClose={() => setDetailModal({ isOpen: false, courseOffering: null })}
                courseOffering={detailModal.courseOffering}
                onEdit={(courseOffering) => {
                    setDetailModal({ isOpen: false, courseOffering: null })
                    navigate(`${ROUTES.ADMIN_COURSE_OFFERINGS}/${courseOffering.Id}/edit`)
                }}
            />
        </div>
    )
}

export default CourseOfferingsPage
