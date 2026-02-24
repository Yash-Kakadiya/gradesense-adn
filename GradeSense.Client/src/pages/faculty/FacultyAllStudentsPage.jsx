import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
    GraduationCap,
    Search,
    X,
    SlidersHorizontal,
    RefreshCw,
    Building2,
    Mail,
    Phone,
    Hash,
    Users,
    UserCheck,
} from 'lucide-react'
import { Card, Badge, Button, Select } from '@/components/common'
import { studentService } from '@/services/studentService'
import { departmentService } from '@/services/departmentService'
import StudentDetailModal from '@/components/students/StudentDetailModal'
import { useDebounce } from '@/hooks/useDebounce'
import toast from 'react-hot-toast'
import { cn } from '@/utils/helpers'

const API_URL = import.meta.env.VITE_API_URL || 'https://localhost:7266'

// Stats Card Component
const StatsCard = ({ icon: Icon, label, value, color, loading }) => (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
            <div className={cn("p-3 rounded-lg bg-gradient-to-br", color)}>
                <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
                <p className="text-sm text-gray-500">{label}</p>
                {loading ? (
                    <div className="h-6 w-16 bg-gray-200 rounded animate-pulse mt-1" />
                ) : (
                    <p className="text-xl font-bold text-gray-900">{value}</p>
                )}
            </div>
        </div>
    </div>
)

export default function FacultyAllStudentsPage() {
    // State
    const [searchInput, setSearchInput] = useState('')
    const [departmentFilter, setDepartmentFilter] = useState('')
    const [statusFilter, setStatusFilter] = useState('')
    const [showFilters, setShowFilters] = useState(false)
    const [page, setPage] = useState(1)
    const pageSize = 10

    // View modal state
    const [isViewModalOpen, setIsViewModalOpen] = useState(false)
    const [viewStudentId, setViewStudentId] = useState(null)

    // Debounced search
    const debouncedSearch = useDebounce(searchInput, 300)

    // Fetch students
    const { data, isLoading, refetch } = useQuery({
        queryKey: ['faculty-all-students', debouncedSearch, departmentFilter, statusFilter, page],
        queryFn: () =>
            studentService.getAll({
                pageNumber: page,
                pageSize,
                searchTerm: debouncedSearch || undefined,
                departmentId: departmentFilter ? parseInt(departmentFilter) : undefined,
                status: statusFilter === 'active' ? 'Active' : statusFilter === 'inactive' ? 'Inactive' : undefined,
            }),
    })

    // Fetch departments for filter
    const { data: departmentsData } = useQuery({
        queryKey: ['departments'],
        queryFn: () => departmentService.getAll({ pageSize: 100 }),
    })

    const students = data?.Data?.Data || []
    const departments = departmentsData?.Data?.Data || []
    const totalItems = data?.Data?.TotalRecords || 0
    const totalPages = data?.Data?.TotalPages || 1

    // Calculate stats
    const stats = useMemo(() => {
        return {
            total: totalItems,
            onPage: students.length,
            departments: departments.length,
        }
    }, [students, totalItems, departments])

    const handleRefresh = () => {
        refetch()
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
                        <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/25">
                            <Users className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">All Students</h1>
                            <p className="text-gray-500">View student records across all departments</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <StatsCard
                    icon={GraduationCap}
                    label="Total Students"
                    value={stats.total}
                    color="from-emerald-500 to-teal-600"
                    loading={isLoading}
                />
                <StatsCard
                    icon={UserCheck}
                    label="Showing"
                    value={stats.onPage}
                    color="from-blue-500 to-indigo-600"
                    loading={isLoading}
                />
                <StatsCard
                    icon={Building2}
                    label="Departments"
                    value={stats.departments}
                    color="from-purple-500 to-pink-600"
                    loading={isLoading}
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
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-0 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
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
                                        ? "bg-blue-50 text-blue-600"
                                        : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                                )}
                            >
                                <SlidersHorizontal className="w-4 h-4" />
                                Filters
                                {hasActiveFilters && (
                                    <span className="w-2 h-2 bg-blue-500 rounded-full" />
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
                                : "No student records available"}
                        </p>
                        {hasActiveFilters && (
                            <Button variant="outline" onClick={clearFilters}>
                                Clear Filters
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
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Student</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Contact</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Department</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Semester</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-12 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
                                                <p className="text-sm text-gray-500">Loading students...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    students.map((row) => (
                                        <tr
                                            key={row.Id}
                                            onClick={() => handleViewStudent(row)}
                                            className="hover:bg-gray-50/80 cursor-pointer transition-colors"
                                        >
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm overflow-hidden">
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
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                            <p className="text-sm text-gray-500">
                                Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, totalItems)} of {totalItems} students
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                >
                                    Previous
                                </Button>
                                <span className="text-sm text-gray-600">
                                    Page {page} of {totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                </Card>
            )}

            {/* Student Detail Modal - View Only */}
            <StudentDetailModal
                isOpen={isViewModalOpen}
                onClose={handleCloseViewModal}
                studentId={viewStudentId}
                showEditButton={false}
            />
        </div>
    )
}
