import { useState, useEffect, Fragment } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Dialog, Transition, Menu } from '@headlessui/react'
import {
    Pagination,
    Badge,
    Button,
    Select,
    Card,
    ConfirmDialog,
    ExportDropdown,
    BulkImportModal,
} from '@/components/common'
import { facultyService } from '@/services/facultyService'
import { departmentService } from '@/services/departmentService'
import { dashboardService } from '@/services/dashboardService'
import { exportFacultiesToCsv, exportFacultiesToExcel, downloadBlob } from '@/services/exportService'
import { usePagination, useModal } from '@/hooks'
import { formatDate, cn } from '@/utils/helpers'
import { ROUTES } from '@/utils/constants'
import {
    Edit,
    Trash2,
    Eye,
    UserCog,
    UserPlus,
    MoreVertical,
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
    Briefcase,
    Hash,
    BookOpen,
    Users,
    GraduationCap,
    Award,
    Upload,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { getErrorMessage } from '@/utils/errorHandler'

const API_URL = import.meta.env.VITE_API_URL || 'https://localhost:7266'

// Faculty Detail Modal Component
const FacultyDetailModal = ({ isOpen, onClose, facultyId }) => {
    const navigate = useNavigate()

    // Fetch full faculty details when modal opens
    const { data: facultyData, isLoading } = useQuery({
        queryKey: ['faculty-detail', facultyId],
        queryFn: () => facultyService.getById(facultyId),
        enabled: isOpen && !!facultyId,
    })

    const faculty = facultyData?.Data

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
                                        <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
                                    </div>
                                ) : faculty ? (
                                    <>
                                        {/* Header with gradient */}
                                        <div className="relative bg-gradient-to-br from-indigo-500 to-purple-600 px-6 py-5">
                                            {/* Action buttons */}
                                            <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        handleClose()
                                                        navigate(`${ROUTES.ADMIN_FACULTIES}/${faculty.Id}/edit`)
                                                    }}
                                                    className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors group"
                                                    title="Edit Faculty"
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
                                                    {faculty.ProfileImagePath ? (
                                                        <img
                                                            src={`${API_URL}${faculty.ProfileImagePath}`}
                                                            alt={faculty.FullName}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <span className="text-3xl font-bold text-white">
                                                            {faculty.FullName?.charAt(0)?.toUpperCase() || 'F'}
                                                        </span>
                                                    )}
                                                </div>
                                                <Dialog.Title className="text-xl font-bold text-white">
                                                    {faculty.FullName}
                                                </Dialog.Title>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-sm font-medium">
                                                        <Briefcase className="w-4 h-4" />
                                                        {faculty.Designation || 'Faculty'}
                                                    </span>
                                                    <span className={cn(
                                                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium",
                                                        faculty.IsActive ? "bg-emerald-500/80 text-white" : "bg-red-500/80 text-white"
                                                    )}>
                                                        {faculty.IsActive ? (
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
                                            {/* Employment Information */}
                                            <div>
                                                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Employment Information</h3>
                                                <div className="grid grid-cols-3 gap-3">
                                                    {/* Employee ID */}
                                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                        <div className="p-2 bg-purple-100 rounded-lg">
                                                            <Hash className="w-5 h-5 text-purple-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500">Employee ID</p>
                                                            <p className="font-medium text-gray-900">{faculty.EmployeeId}</p>
                                                        </div>
                                                    </div>

                                                    {/* Department */}
                                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                        <div className="p-2 bg-amber-100 rounded-lg">
                                                            <Building2 className="w-5 h-5 text-amber-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500">Department</p>
                                                            <p className="font-medium text-gray-900">
                                                                {faculty.DepartmentName || 'Not Assigned'}
                                                                {faculty.DepartmentCode && (
                                                                    <span className="text-gray-500 text-sm ml-1">({faculty.DepartmentCode})</span>
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Joined Date */}
                                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                        <div className="p-2 bg-gray-100 rounded-lg">
                                                            <Calendar className="w-5 h-5 text-gray-500" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500">Joined</p>
                                                            <p className="font-medium text-gray-900 text-sm">
                                                                {formatDate(faculty.JoiningDate || faculty.CreatedAt)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Academic Information */}
                                            <div>
                                                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Academic Information</h3>
                                                <div className="grid grid-cols-2 gap-3">
                                                    {/* Qualification */}
                                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                        <div className="p-2 bg-cyan-100 rounded-lg">
                                                            <GraduationCap className="w-5 h-5 text-cyan-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500">Qualification</p>
                                                            <p className="font-medium text-gray-900">{faculty.Qualification || 'N/A'}</p>
                                                        </div>
                                                    </div>

                                                    {/* Specialization */}
                                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                        <div className="p-2 bg-pink-100 rounded-lg">
                                                            <Award className="w-5 h-5 text-pink-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500">Specialization</p>
                                                            <p className="font-medium text-gray-900">{faculty.Specialization || 'N/A'}</p>
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
                                                            <p className="font-medium text-gray-900 truncate">{faculty.PersonalEmail}</p>
                                                        </div>
                                                    </div>

                                                    {/* Institutional Email */}
                                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                        <div className="p-2 bg-indigo-100 rounded-lg">
                                                            <Building2 className="w-5 h-5 text-indigo-600" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs text-gray-500">Institutional Email</p>
                                                            <p className="font-medium text-gray-900 truncate">{faculty.InstitutionalEmail || 'N/A'}</p>
                                                        </div>
                                                    </div>

                                                    {/* Phone */}
                                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                        <div className="p-2 bg-green-100 rounded-lg">
                                                            <Phone className="w-5 h-5 text-green-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500">Phone Number</p>
                                                            <p className="font-medium text-gray-900">{faculty.PhoneNumber || 'N/A'}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Statistics */}
                                            <div>
                                                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Statistics</h3>
                                                <div className="grid grid-cols-3 gap-3">
                                                    <div className="p-3 bg-indigo-50 rounded-xl text-center">
                                                        <BookOpen className="w-5 h-5 text-indigo-600 mx-auto mb-1" />
                                                        <p className="text-lg font-bold text-indigo-700">{faculty.AssignedCoursesCount || 0}</p>
                                                        <p className="text-xs text-indigo-600">Courses</p>
                                                    </div>
                                                    <div className="p-3 bg-emerald-50 rounded-xl text-center">
                                                        <Users className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                                                        <p className="text-lg font-bold text-emerald-700">{faculty.CoordinatingBatchesCount || 0}</p>
                                                        <p className="text-xs text-emerald-600">Batches</p>
                                                    </div>
                                                    <div className="p-3 bg-amber-50 rounded-xl text-center">
                                                        <BookOpen className="w-5 h-5 text-amber-600 mx-auto mb-1" />
                                                        <p className="text-lg font-bold text-amber-700">{faculty.CoordinatingCoursesCount || 0}</p>
                                                        <p className="text-xs text-amber-600">Coordinating</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="py-16 text-center text-gray-500">
                                        Faculty not found
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

const FacultiesPage = () => {
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const deleteModal = useModal()
    const bulkImportModal = useModal()
    const [viewFacultyId, setViewFacultyId] = useState(null)
    const [isViewModalOpen, setIsViewModalOpen] = useState(false)

    // Filters
    const [searchInput, setSearchInput] = useState('')
    const [departmentFilter, setDepartmentFilter] = useState('')
    const [statusFilter, setStatusFilter] = useState('')
    const [showFilters, setShowFilters] = useState(false)

    // Debounced search
    const debouncedSearch = useDebounce(searchInput, 300)

    // Selection
    const [selectedFaculties, setSelectedFaculties] = useState([])

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

    // Fetch faculties
    const { data, isLoading, refetch } = useQuery({
        queryKey: ['faculties', paginationParams, debouncedSearch, departmentFilter, statusFilter],
        queryFn: () =>
            facultyService.getAll({
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
    const faculties = data?.Data?.Data || []
    const departments = departmentsData?.Data?.Data || []
    const totalItems = data?.Data?.TotalRecords || 0
    const totalPages = data?.Data?.TotalPages || 1

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: (id) => facultyService.delete(id),
        onSuccess: () => {
            toast.success('Faculty deleted successfully')
            queryClient.invalidateQueries(['faculties'])
            queryClient.invalidateQueries(['admin-dashboard-stats'])
            deleteModal.close()
            setSelectedFaculties([])
        },
        onError: (error) => {
            toast.error(getErrorMessage(error))
        },
    })

    const handleDelete = () => {
        if (deleteModal.data) {
            deleteMutation.mutate(deleteModal.data.Id)
        }
    }

    const handleSelectAll = () => {
        if (selectedFaculties.length === faculties.length) {
            setSelectedFaculties([])
        } else {
            setSelectedFaculties(faculties.map(f => f.Id))
        }
    }

    const handleSelectFaculty = (facultyId, e) => {
        if (e) e.stopPropagation()
        setSelectedFaculties(prev =>
            prev.includes(facultyId)
                ? prev.filter(id => id !== facultyId)
                : [...prev, facultyId]
        )
    }

    const handleBulkDelete = async () => {
        if (selectedFaculties.length === 0) return

        try {
            await Promise.all(selectedFaculties.map(id => facultyService.delete(id)))
            toast.success(`${selectedFaculties.length} faculties deleted successfully`)
            queryClient.invalidateQueries(['faculties'])
            queryClient.invalidateQueries(['admin-dashboard-stats'])
            setSelectedFaculties([])
        } catch (error) {
            toast.error('Failed to delete some faculties')
        }
    }

    const handleExportCsv = async () => {
        const filters = {
            departmentId: departmentFilter || undefined,
            search: searchInput || undefined,
            isActive: statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined
        }
        const blob = await exportFacultiesToCsv(filters)
        downloadBlob(blob, `faculties-export-${new Date().toISOString().split('T')[0]}.csv`)
    }

    const handleExportExcel = async () => {
        const filters = {
            departmentId: departmentFilter || undefined,
            search: searchInput || undefined,
            isActive: statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined
        }
        const blob = await exportFacultiesToExcel(filters)
        downloadBlob(blob, `faculties-export-${new Date().toISOString().split('T')[0]}.xlsx`)
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

    const handleViewFaculty = (faculty) => {
        setViewFacultyId(faculty.Id)
        setIsViewModalOpen(true)
    }

    const handleCloseViewModal = () => {
        setIsViewModalOpen(false)
        setViewFacultyId(null)
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
                        <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/25">
                            <UserCog className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Faculty Management</h1>
                            <p className="text-gray-500">Manage faculty members and their assignments</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <ExportDropdown
                        onExportCsv={handleExportCsv}
                        onExportExcel={handleExportExcel}
                    />
                    <Button
                        variant="outline"
                        onClick={bulkImportModal.open}
                        className="gap-2"
                    >
                        <Upload className="w-4 h-4" />
                        Import
                    </Button>
                    <Button
                        onClick={() => navigate(`${ROUTES.ADMIN_FACULTIES}/create`)}
                        className="gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/25"
                    >
                        <UserPlus className="w-4 h-4" />
                        Add Faculty
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard
                    icon={UserCog}
                    label="Total Faculties"
                    value={stats.TotalFaculties || 0}
                    color="from-indigo-500 to-purple-600"
                    loading={statsLoading}
                />
                <StatsCard
                    icon={Building2}
                    label="Departments"
                    value={stats.TotalDepartments || 0}
                    color="from-amber-500 to-orange-600"
                    loading={statsLoading}
                />
                <StatsCard
                    icon={BookOpen}
                    label="Active Courses"
                    value={stats.ActiveCourseOfferings || 0}
                    color="from-blue-500 to-cyan-600"
                    loading={statsLoading}
                />
                <StatsCard
                    icon={Users}
                    label="Coordinators"
                    value={stats.TotalCoordinators || 0}
                    color="from-emerald-500 to-teal-600"
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
                                placeholder="Search by name, email, or employee ID..."
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-0 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
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
                                        ? "bg-indigo-50 text-indigo-600"
                                        : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                                )}
                            >
                                <SlidersHorizontal className="w-4 h-4" />
                                Filters
                                {hasActiveFilters && (
                                    <span className="w-2 h-2 bg-indigo-500 rounded-full" />
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
                                <div className="w-48">
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
            {selectedFaculties.length > 0 && (
                <div className="flex items-center justify-between p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
                    <div className="flex items-center gap-3">
                        <CheckSquare className="w-5 h-5 text-indigo-600" />
                        <span className="text-sm font-medium text-indigo-900">
                            {selectedFaculties.length} facult{selectedFaculties.length > 1 ? 'ies' : 'y'} selected
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedFaculties([])}
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
            {faculties.length === 0 && !isLoading ? (
                <Card className="border-0 shadow-sm">
                    <div className="flex flex-col items-center justify-center py-16">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <UserCog className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">No faculties found</h3>
                        <p className="text-gray-500 mb-6">
                            {hasActiveFilters
                                ? "Try adjusting your filters"
                                : "Get started by adding your first faculty member"}
                        </p>
                        {hasActiveFilters ? (
                            <Button variant="outline" onClick={clearFilters}>
                                Clear Filters
                            </Button>
                        ) : (
                            <Button onClick={() => navigate(`${ROUTES.ADMIN_FACULTIES}/create`)}>
                                <UserPlus className="w-4 h-4 mr-2" />
                                Add Faculty
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
                                            {selectedFaculties.length === faculties.length && faculties.length > 0 ? (
                                                <CheckSquare className="w-4 h-4 text-indigo-600" />
                                            ) : (
                                                <Square className="w-4 h-4 text-gray-400" />
                                            )}
                                        </button>
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Faculty</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Contact</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Department</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Designation</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-12 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
                                                <p className="text-sm text-gray-500">Loading faculties...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    faculties.map((row) => (
                                        <tr
                                            key={row.Id}
                                            onClick={() => handleViewFaculty(row)}
                                            className={cn(
                                                "hover:bg-gray-50/80 cursor-pointer transition-colors",
                                                selectedFaculties.includes(row.Id) && "bg-indigo-50/50"
                                            )}
                                        >
                                            <td className="px-4 py-3">
                                                <button
                                                    onClick={(e) => handleSelectFaculty(row.Id, e)}
                                                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                                                >
                                                    {selectedFaculties.includes(row.Id) ? (
                                                        <CheckSquare className="w-4 h-4 text-indigo-600" />
                                                    ) : (
                                                        <Square className="w-4 h-4 text-gray-400" />
                                                    )}
                                                </button>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm overflow-hidden">
                                                        {row.ProfileImagePath ? (
                                                            <img
                                                                src={`${API_URL}${row.ProfileImagePath}`}
                                                                alt={row.FullName}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <span className="text-sm font-semibold text-white">
                                                                {row.FullName?.charAt(0)?.toUpperCase() || 'F'}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{row.FullName}</p>
                                                        <p className="text-sm text-gray-500">{row.EmployeeId}</p>
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
                                                    <span className="text-gray-700">{row.DepartmentName || 'Not Assigned'}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-sm text-gray-700 truncate max-w-[150px] block" title={row.Designation || 'N/A'}>
                                                    {row.Designation || 'N/A'}
                                                </span>
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
                                                            handleViewFaculty(row)
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
                                                            navigate(`${ROUTES.ADMIN_FACULTIES}/${row.Id}/edit`)
                                                        }}
                                                        title="Edit Faculty"
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
                                                        title="Delete Faculty"
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

            {/* Faculty Detail Modal */}
            <FacultyDetailModal
                isOpen={isViewModalOpen}
                onClose={handleCloseViewModal}
                facultyId={viewFacultyId}
            />

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={deleteModal.isOpen}
                onClose={deleteModal.close}
                onConfirm={handleDelete}
                title="Delete Faculty"
                message={`Are you sure you want to delete "${deleteModal.data?.FullName}"? This action cannot be undone.`}
                confirmText="Delete"
                loading={deleteMutation.isPending}
            />

            {/* Bulk Import Modal */}
            <BulkImportModal
                isOpen={bulkImportModal.isOpen}
                onClose={bulkImportModal.close}
                title="Import Faculty"
                entityName="faculty"
                onDownloadTemplate={() => facultyService.getImportTemplate()}
                onValidate={({ file }) => facultyService.validateImport(file)}
                onExecuteImport={(data) => facultyService.executeImport({
                    conflictResolution: data.conflictResolution,
                    rows: data.rows.map(row => ({
                        rowNumber: row.rowNumber,
                        personalEmail: row.personalEmail || row.rollNumber,
                        institutionalEmail: row.institutionalEmail,
                        phoneNumber: row.phoneNumber,
                        fullName: row.fullName || row.studentName,
                        password: row.password,
                        employeeId: row.employeeId,
                        designation: row.designation,
                        departmentCode: row.departmentCode,
                        joiningDate: row.joiningDate,
                        status: row.status || 'Active'
                    }))
                })}
                onSuccess={() => {
                    queryClient.invalidateQueries({ queryKey: ['faculties'] })
                    queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
                    toast.success('Faculty imported successfully')
                }}
            />
        </div>
    )
}

export default FacultiesPage
