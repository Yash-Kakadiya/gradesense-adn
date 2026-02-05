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
import { studentService } from '@/services/studentService'
import { departmentService } from '@/services/departmentService'
import { dashboardService } from '@/services/dashboardService'
import { exportStudentsToCsv, exportStudentsToExcel, downloadBlob } from '@/services/exportService'
import { usePagination, useModal } from '@/hooks'
import { formatDate, cn } from '@/utils/helpers'
import { ROUTES } from '@/utils/constants'
import {
    Edit,
    Trash2,
    Eye,
    GraduationCap,
    UserPlus,
    UserCheck,
    UserX,
    Mail,
    Phone,
    Calendar,
    Clock,
    Download,
    CheckSquare,
    Square,
    X,
    RefreshCw,
    Search,
    SlidersHorizontal,
    Building2,
    Hash,
    BookOpen,
    Award,
    Users,
    ClipboardList,
    BarChart3,
} from 'lucide-react'
import toast from 'react-hot-toast'

const API_URL = import.meta.env.VITE_API_URL || 'https://localhost:7266'

// Student Detail Modal Component
const StudentDetailModal = ({ isOpen, onClose, studentId }) => {
    const navigate = useNavigate()

    // Fetch full student details when modal opens
    const { data: studentData, isLoading } = useQuery({
        queryKey: ['student-detail', studentId],
        queryFn: () => studentService.getById(studentId),
        enabled: isOpen && !!studentId,
    })

    const student = studentData?.Data

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
                            <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
                                {isLoading ? (
                                    <div className="flex items-center justify-center py-16">
                                        <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
                                    </div>
                                ) : student ? (
                                    <>
                                        {/* Header with gradient */}
                                        <div className="relative bg-gradient-to-br from-emerald-500 to-teal-600 px-6 py-5">
                                            {/* Action buttons */}
                                            <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        handleClose()
                                                        navigate(`${ROUTES.ADMIN_STUDENTS}/${student.Id}/edit`)
                                                    }}
                                                    className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors group"
                                                    title="Edit Student"
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
                                                <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur flex items-center justify-center mb-4 ring-4 ring-white/30 overflow-hidden">
                                                    {student.ProfileImagePath ? (
                                                        <img
                                                            src={`${API_URL}${student.ProfileImagePath}`}
                                                            alt={student.FullName}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <span className="text-3xl font-bold text-white">
                                                            {student.FullName?.charAt(0)?.toUpperCase() || 'S'}
                                                        </span>
                                                    )}
                                                </div>
                                                <Dialog.Title className="text-xl font-bold text-white">
                                                    {student.FullName}
                                                </Dialog.Title>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-sm font-medium">
                                                        <Hash className="w-4 h-4" />
                                                        {student.EnrollmentNumber}
                                                    </span>
                                                    <span className={cn(
                                                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium",
                                                        student.Status === 'Active' ? "bg-emerald-500/80 text-white" :
                                                            student.Status === 'Graduated' ? "bg-blue-500/80 text-white" : "bg-red-500/80 text-white"
                                                    )}>
                                                        {student.Status === 'Active' ? (
                                                            <><UserCheck className="w-4 h-4" /> Active</>
                                                        ) : student.Status === 'Graduated' ? (
                                                            <><GraduationCap className="w-4 h-4" /> Graduated</>
                                                        ) : (
                                                            <><UserX className="w-4 h-4" /> {student.Status}</>
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
                                            {/* Academic Information */}
                                            <div>
                                                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Academic Information</h3>
                                                <div className="grid grid-cols-4 gap-3">
                                                    {/* Department */}
                                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                        <div className="p-2 bg-amber-100 rounded-lg">
                                                            <Building2 className="w-5 h-5 text-amber-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500">Department</p>
                                                            <p className="font-medium text-gray-900 text-sm">{student.DepartmentName || 'N/A'}</p>
                                                            {student.DepartmentCode && (
                                                                <p className="text-xs text-gray-500">({student.DepartmentCode})</p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Semester */}
                                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                        <div className="p-2 bg-purple-100 rounded-lg">
                                                            <BookOpen className="w-5 h-5 text-purple-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500">Semester</p>
                                                            <p className="font-medium text-gray-900 text-sm">Semester {student.CurrentSemester || 'N/A'}</p>
                                                        </div>
                                                    </div>

                                                    {/* Admission Year */}
                                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                        <div className="p-2 bg-gray-100 rounded-lg">
                                                            <Calendar className="w-5 h-5 text-gray-500" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500">Admission Year</p>
                                                            <p className="font-medium text-gray-900 text-sm">{student.AdmissionYear || 'N/A'}</p>
                                                        </div>
                                                    </div>

                                                    {/* CGPA */}
                                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                        <div className="p-2 bg-emerald-100 rounded-lg">
                                                            <Award className="w-5 h-5 text-emerald-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500">CGPA</p>
                                                            <p className="font-medium text-gray-900 text-sm">{student.CGPA?.toFixed(2) || 'N/A'}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Contact Information */}
                                            <div>
                                                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Contact Information</h3>
                                                <div className="grid grid-cols-3 gap-3">
                                                    {/* Personal Email */}
                                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                        <div className="p-2 bg-blue-100 rounded-lg">
                                                            <Mail className="w-5 h-5 text-blue-600" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs text-gray-500">Personal Email</p>
                                                            <p className="font-medium text-gray-900 truncate">{student.PersonalEmail || 'N/A'}</p>
                                                        </div>
                                                    </div>

                                                    {/* Institutional Email */}
                                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                        <div className="p-2 bg-indigo-100 rounded-lg">
                                                            <Mail className="w-5 h-5 text-indigo-600" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs text-gray-500">Institutional Email</p>
                                                            <p className="font-medium text-gray-900 truncate">{student.InstitutionalEmail || 'N/A'}</p>
                                                        </div>
                                                    </div>

                                                    {/* Phone */}
                                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                        <div className="p-2 bg-green-100 rounded-lg">
                                                            <Phone className="w-5 h-5 text-green-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500">Phone Number</p>
                                                            <p className="font-medium text-gray-900">{student.PhoneNumber || 'N/A'}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Statistics */}
                                            {(student.EnrolledCoursesCount !== undefined || student.CompletedCoursesCount !== undefined || student.ActiveCoursesCount !== undefined) && (
                                                <div>
                                                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Statistics</h3>
                                                    <div className="grid grid-cols-3 gap-3">
                                                        <div className="p-3 bg-indigo-50 rounded-xl text-center">
                                                            <BookOpen className="w-5 h-5 text-indigo-600 mx-auto mb-1" />
                                                            <p className="text-lg font-bold text-indigo-700">{student.EnrolledCoursesCount || 0}</p>
                                                            <p className="text-xs text-indigo-600">Enrolled</p>
                                                        </div>
                                                        <div className="p-3 bg-emerald-50 rounded-xl text-center">
                                                            <Award className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                                                            <p className="text-lg font-bold text-emerald-700">{student.CompletedCoursesCount || 0}</p>
                                                            <p className="text-xs text-emerald-600">Completed</p>
                                                        </div>
                                                        <div className="p-3 bg-blue-50 rounded-xl text-center">
                                                            <BarChart3 className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                                                            <p className="text-lg font-bold text-blue-700">{student.ActiveCoursesCount || 0}</p>
                                                            <p className="text-xs text-blue-600">Active</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <div className="py-16 text-center text-gray-500">
                                        Student not found
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

const StudentsPage = () => {
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const deleteModal = useModal()
    const [viewStudentId, setViewStudentId] = useState(null)
    const [isViewModalOpen, setIsViewModalOpen] = useState(false)

    // Filters
    const [searchInput, setSearchInput] = useState('')
    const [departmentFilter, setDepartmentFilter] = useState('')
    const [statusFilter, setStatusFilter] = useState('')
    const [showFilters, setShowFilters] = useState(false)

    // Debounced search
    const debouncedSearch = useDebounce(searchInput, 300)

    // Selection
    const [selectedStudents, setSelectedStudents] = useState([])

    // Pagination
    const {
        currentPage,
        pageSize,
        handlePageChange,
        handlePageSizeChange,
        paginationParams,
    } = usePagination()

    // Fetch dashboard stats
    const { data: dashboardData, isLoading: statsLoading, refetch: refetchStats } = useQuery({
        queryKey: ['admin-dashboard-stats'],
        queryFn: () => dashboardService.getAdminDashboard(),
        staleTime: 30000,
    })

    const stats = dashboardData?.Data || {}

    // Fetch students
    const { data, isLoading, refetch } = useQuery({
        queryKey: ['students', paginationParams, debouncedSearch, departmentFilter, statusFilter],
        queryFn: () =>
            studentService.getAll({
                ...paginationParams,
                search: debouncedSearch || undefined,
                departmentId: departmentFilter || undefined,
                isActive: statusFilter === '' ? undefined : statusFilter === 'active',
            }),
    })

    // Fetch departments for filter
    const { data: departmentsData } = useQuery({
        queryKey: ['departments-select'],
        queryFn: () => departmentService.getAll({ pageSize: 100 }),
    })

    // Get data from API responses
    const students = data?.Data?.Data || []
    const departments = departmentsData?.Data?.Data || []
    const totalItems = data?.Data?.TotalRecords || 0
    const totalPages = data?.Data?.TotalPages || 1

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: (id) => studentService.delete(id),
        onSuccess: () => {
            toast.success('Student deleted successfully')
            queryClient.invalidateQueries(['students'])
            queryClient.invalidateQueries(['admin-dashboard-stats'])
            deleteModal.close()
            setSelectedStudents([])
        },
        onError: () => {
            toast.error('Failed to delete student')
        },
    })

    const handleDelete = () => {
        if (deleteModal.data) {
            deleteMutation.mutate(deleteModal.data.Id)
        }
    }

    const handleSelectAll = () => {
        if (selectedStudents.length === students.length) {
            setSelectedStudents([])
        } else {
            setSelectedStudents(students.map(s => s.Id))
        }
    }

    const handleSelectStudent = (studentId, e) => {
        if (e) e.stopPropagation()
        setSelectedStudents(prev =>
            prev.includes(studentId)
                ? prev.filter(id => id !== studentId)
                : [...prev, studentId]
        )
    }

    const handleBulkDelete = async () => {
        if (selectedStudents.length === 0) return

        try {
            await Promise.all(selectedStudents.map(id => studentService.delete(id)))
            toast.success(`${selectedStudents.length} students deleted successfully`)
            queryClient.invalidateQueries(['students'])
            queryClient.invalidateQueries(['admin-dashboard-stats'])
            setSelectedStudents([])
        } catch (error) {
            toast.error('Failed to delete some students')
        }
    }

    const handleExportCsv = async () => {
        const filters = {
            departmentId: departmentFilter || undefined,
            status: statusFilter || undefined
        }
        const blob = await exportStudentsToCsv(filters)
        downloadBlob(blob, `students-export-${new Date().toISOString().split('T')[0]}.csv`)
    }

    const handleExportExcel = async () => {
        const filters = {
            departmentId: departmentFilter || undefined,
            status: statusFilter || undefined
        }
        const blob = await exportStudentsToExcel(filters)
        downloadBlob(blob, `students-export-${new Date().toISOString().split('T')[0]}.xlsx`)
    }

    const handleRefresh = () => {
        refetch()
        refetchStats()
        toast.success('Data refreshed')
    }

    const clearFilters = () => {
        setSearchInput('')
        setDepartmentFilter('')
        setStatusFilter('')
    }

    const handleViewStudent = (student) => {
        setViewStudentId(student.Id)
        setIsViewModalOpen(true)
    }

    const handleCloseViewModal = () => {
        setIsViewModalOpen(false)
        setViewStudentId(null)
    }

    const hasActiveFilters = searchInput || departmentFilter || statusFilter

    const departmentOptions = [
        { value: '', label: 'All Departments' },
        ...departments.map((dept) => ({ value: dept.Id.toString(), label: dept.Name })),
    ]

    const statusOptions = [
        { value: '', label: 'All Status' },
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
    ]

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg shadow-emerald-500/25">
                            <GraduationCap className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Student Management</h1>
                            <p className="text-gray-500">Manage student records and enrollments</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <ExportDropdown
                        onExportCsv={handleExportCsv}
                        onExportExcel={handleExportExcel}
                    />
                    <Button
                        onClick={() => navigate(`${ROUTES.ADMIN_STUDENTS}/create`)}
                        className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-500/25"
                    >
                        <UserPlus className="w-4 h-4" />
                        Add Student
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard
                    icon={GraduationCap}
                    label="Total Students"
                    value={stats.TotalStudents || 0}
                    color="from-emerald-500 to-teal-600"
                    loading={statsLoading}
                />
                <StatsCard
                    icon={BookOpen}
                    label="Active Enrollments"
                    value={stats.TotalEnrollments || 0}
                    color="from-blue-500 to-indigo-600"
                    loading={statsLoading}
                />
                <StatsCard
                    icon={Users}
                    label="Total Batches"
                    value={stats.TotalBatches || 0}
                    color="from-purple-500 to-pink-600"
                    loading={statsLoading}
                />
                <StatsCard
                    icon={Building2}
                    label="Departments"
                    value={stats.TotalDepartments || 0}
                    color="from-amber-500 to-orange-600"
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
                                placeholder="Search by name, email, or roll number..."
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-0 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
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
                                        ? "bg-emerald-50 text-emerald-600"
                                        : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                                )}
                            >
                                <SlidersHorizontal className="w-4 h-4" />
                                Filters
                                {hasActiveFilters && (
                                    <span className="w-2 h-2 bg-emerald-500 rounded-full" />
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
                                <div className="w-56">
                                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Department</label>
                                    <Select
                                        value={departmentFilter}
                                        onChange={(e) => setDepartmentFilter(e.target.value)}
                                        options={departmentOptions}
                                        className="bg-gray-50 border-0"
                                    />
                                </div>
                                <div className="w-40">
                                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Status</label>
                                    <Select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        options={statusOptions}
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

            {/* Bulk Actions Bar */}
            {selectedStudents.length > 0 && (
                <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                    <div className="flex items-center gap-3">
                        <CheckSquare className="w-5 h-5 text-emerald-600" />
                        <span className="text-sm font-medium text-emerald-900">
                            {selectedStudents.length} student{selectedStudents.length > 1 ? 's' : ''} selected
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedStudents([])}
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
            {students.length === 0 && !isLoading ? (
                <Card className="border-0 shadow-sm">
                    <div className="flex flex-col items-center justify-center py-16">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <GraduationCap className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">No students found</h3>
                        <p className="text-gray-500 mb-6">
                            {hasActiveFilters
                                ? "Try adjusting your filters"
                                : "Get started by registering your first student"}
                        </p>
                        {hasActiveFilters ? (
                            <Button variant="outline" onClick={clearFilters}>
                                Clear Filters
                            </Button>
                        ) : (
                            <Button onClick={() => navigate(`${ROUTES.ADMIN_STUDENTS}/create`)}>
                                <UserPlus className="w-4 h-4 mr-2" />
                                Add Student
                            </Button>
                        )}
                    </div>
                </Card>
            ) : (
                <Card className="border-0 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-gray-50/80 border-b border-gray-100">
                                <tr>
                                    <th className="px-4 py-3 text-left w-12">
                                        <button
                                            onClick={handleSelectAll}
                                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                                        >
                                            {selectedStudents.length === students.length && students.length > 0 ? (
                                                <CheckSquare className="w-4 h-4 text-emerald-600" />
                                            ) : (
                                                <Square className="w-4 h-4 text-gray-400" />
                                            )}
                                        </button>
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Student</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Contact</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Department</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Semester</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-12 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
                                                <p className="text-sm text-gray-500">Loading students...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    students.map((row) => (
                                        <tr
                                            key={row.Id}
                                            onClick={() => handleViewStudent(row)}
                                            className={cn(
                                                "hover:bg-gray-50/80 cursor-pointer transition-colors",
                                                selectedStudents.includes(row.Id) && "bg-emerald-50/50"
                                            )}
                                        >
                                            <td className="px-4 py-3">
                                                <button
                                                    onClick={(e) => handleSelectStudent(row.Id, e)}
                                                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                                                >
                                                    {selectedStudents.includes(row.Id) ? (
                                                        <CheckSquare className="w-4 h-4 text-emerald-600" />
                                                    ) : (
                                                        <Square className="w-4 h-4 text-gray-400" />
                                                    )}
                                                </button>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm overflow-hidden">
                                                        {row.ProfileImagePath ? (
                                                            <img
                                                                src={`${API_URL}${row.ProfileImagePath}`}
                                                                alt={row.FullName}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <span className="text-sm font-semibold text-white">
                                                                {row.FullName?.charAt(0)?.toUpperCase() || 'S'}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{row.FullName}</p>
                                                        <div className="flex items-center gap-1 text-sm text-gray-500">
                                                            <Hash className="w-3 h-3" />
                                                            {row.EnrollmentNumber}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <Mail className="w-3.5 h-3.5" />
                                                        <span className="truncate max-w-[200px]">{row.PersonalEmail}</span>
                                                    </div>
                                                    {row.PhoneNumber && (
                                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                                            <Phone className="w-3.5 h-3.5" />
                                                            {row.PhoneNumber}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <Building2 className="w-4 h-4 text-gray-400" />
                                                    <span className="text-gray-700">{row.DepartmentName || 'N/A'}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge variant="secondary">Sem {row.CurrentSemester || 'N/A'}</Badge>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={cn(
                                                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                                                    row.Status === 'Active' || row.IsActive
                                                        ? "bg-emerald-50 text-emerald-700"
                                                        : row.Status === 'Graduated'
                                                            ? "bg-blue-50 text-blue-700"
                                                            : "bg-red-50 text-red-700"
                                                )}>
                                                    <span className={cn(
                                                        "w-1.5 h-1.5 rounded-full",
                                                        row.Status === 'Active' || row.IsActive ? "bg-emerald-500 animate-pulse" :
                                                            row.Status === 'Graduated' ? "bg-blue-500" : "bg-red-500"
                                                    )} />
                                                    {row.Status || (row.IsActive ? 'Active' : 'Inactive')}
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
                                                            handleViewStudent(row)
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
                                                            navigate(`${ROUTES.ADMIN_STUDENTS}/${row.Id}/edit`)
                                                        }}
                                                        title="Edit Student"
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
                                                        title="Delete Student"
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
            )}

            {/* Student Detail Modal */}
            <StudentDetailModal
                isOpen={isViewModalOpen}
                onClose={handleCloseViewModal}
                studentId={viewStudentId}
            />

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={deleteModal.isOpen}
                onClose={deleteModal.close}
                onConfirm={handleDelete}
                title="Delete Student"
                message={`Are you sure you want to delete "${deleteModal.data?.FullName}"? This will also remove all their enrollments and records.`}
                confirmText="Delete"
                loading={deleteMutation.isPending}
            />
        </div>
    )
}

export default StudentsPage
