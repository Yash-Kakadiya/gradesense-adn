import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, Badge, Button, EmptyState, Modal, Pagination } from '@/components/common'
import { useAuth } from '@/context/AuthContext'
import { dashboardService } from '@/services/dashboardService'
import { courseEnrollmentService } from '@/services/courseEnrollmentService'
import { studentService } from '@/services/studentService'
import { useDebounce } from '@/hooks'
import { cn } from '@/utils/helpers'
import { getErrorMessage } from '@/utils/errorHandler'
import toast from 'react-hot-toast'
import StudentFullDetailModal from '@/components/students/StudentDetailModal'
import {
    UserPlus,
    Users,
    Search,
    Loader2,
    BookOpen,
    GraduationCap,
    RefreshCcw,
    Plus,
    Trash2,
    CheckCircle,
    XCircle,
    Filter,
    ChevronDown,
    Eye,
    Mail,
    Phone,
    BarChart3,
    UserCheck,
    List,
    LayoutGrid,
    ExternalLink,
} from 'lucide-react'

// Student Detail Modal for Enrollments
const StudentDetailModal = ({ isOpen, onClose, enrollment, onViewFullDetails }) => {
    if (!enrollment) return null

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Student Details" size="lg">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-2xl">
                            {enrollment.StudentName?.charAt(0) || 'S'}
                        </span>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900">{enrollment.StudentName}</h3>
                        <p className="text-gray-500">{enrollment.EnrollmentNumber || enrollment.RollNumber}</p>
                        <Badge variant={enrollment.Status === 'Active' ? 'success' : 'secondary'} className="mt-2">
                            {enrollment.Status}
                        </Badge>
                    </div>
                </div>

                {/* Course Info */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 rounded-xl">
                        <BookOpen className="w-6 h-6 text-blue-600 mb-2" />
                        <p className="text-sm text-gray-500">Course</p>
                        <p className="font-semibold text-gray-900">{enrollment.SubjectName}</p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-xl">
                        <GraduationCap className="w-6 h-6 text-purple-600 mb-2" />
                        <p className="text-sm text-gray-500">Batch</p>
                        <p className="font-semibold text-gray-900">{enrollment.BatchName}</p>
                    </div>
                </div>

                {/* Stats if available */}
                {(enrollment.AverageScore !== undefined || enrollment.AttendancePercentage !== undefined) && (
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-green-50 rounded-xl text-center">
                            <BarChart3 className="w-6 h-6 text-green-600 mx-auto mb-2" />
                            <p className="text-2xl font-bold text-gray-900">{enrollment.AverageScore?.toFixed(1) || 0}%</p>
                            <p className="text-sm text-gray-500">Avg Score</p>
                        </div>
                        <div className="p-4 bg-orange-50 rounded-xl text-center">
                            <UserCheck className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                            <p className="text-2xl font-bold text-gray-900">{enrollment.AttendancePercentage?.toFixed(0) || 0}%</p>
                            <p className="text-sm text-gray-500">Attendance</p>
                        </div>
                    </div>
                )}

                {/* Enrollment Details */}
                <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Enrollment ID:</span>
                        <span className="font-medium">{enrollment.Id}</span>
                    </div>
                    {enrollment.EnrollmentDate && (
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Enrolled On:</span>
                            <span className="font-medium">{new Date(enrollment.EnrollmentDate).toLocaleDateString()}</span>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t">
                    <Button variant="outline" className="flex-1" onClick={onClose}>
                        Close
                    </Button>
                    {enrollment.StudentId && (
                        <Button
                            variant="primary"
                            className="flex-1"
                            onClick={() => onViewFullDetails(enrollment.StudentId)}
                        >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            More Details
                        </Button>
                    )}
                </div>
            </div>
        </Modal>
    )
}

// Enrollment Row for List View
const EnrollmentRow = ({ enrollment, onRemove, onViewDetails }) => (
    <tr className="hover:bg-gray-50 transition-colors">
        <td className="px-4 py-3">
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-medium text-sm">
                        {enrollment.StudentName?.charAt(0) || 'S'}
                    </span>
                </div>
                <div>
                    <p className="font-medium text-gray-900">{enrollment.StudentName}</p>
                    <p className="text-xs text-gray-500">{enrollment.EnrollmentNumber || enrollment.RollNumber}</p>
                </div>
            </div>
        </td>
        <td className="px-4 py-3 text-sm text-gray-600">{enrollment.SubjectName}</td>
        <td className="px-4 py-3 text-sm text-gray-600">{enrollment.BatchName}</td>
        <td className="px-4 py-3">
            <Badge variant={enrollment.Status === 'Active' ? 'success' : 'secondary'} size="sm">
                {enrollment.Status}
            </Badge>
        </td>
        <td className="px-4 py-3 text-sm text-gray-600">
            {enrollment.EnrollmentDate ? new Date(enrollment.EnrollmentDate).toLocaleDateString() : 'N/A'}
        </td>
        <td className="px-4 py-3 text-right">
            <div className="flex items-center justify-end gap-1">
                <Button variant="ghost" size="sm" onClick={() => onViewDetails(enrollment)}>
                    <Eye className="w-4 h-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => onRemove(enrollment)}
                >
                    <Trash2 className="w-4 h-4" />
                </Button>
            </div>
        </td>
    </tr>
)

// Enrollment Card
const EnrollmentCard = ({ enrollment, onRemove, onViewDetails }) => (
    <Card
        className="hover:shadow-lg transition-all duration-300 cursor-pointer"
        onClick={() => onViewDetails(enrollment)}
    >
        <Card.Body className="p-4">
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                        <span className="text-white font-semibold">
                            {enrollment.StudentName?.charAt(0) || 'S'}
                        </span>
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">{enrollment.StudentName}</h3>
                        <p className="text-sm text-gray-500">{enrollment.RollNumber}</p>
                    </div>
                </div>
                <Badge variant={enrollment.Status === 'Active' ? 'success' : 'secondary'}>
                    {enrollment.Status}
                </Badge>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                    <span className="font-medium">{enrollment.SubjectName}</span>
                    <span className="text-gray-400 mx-2">•</span>
                    <span>{enrollment.BatchName}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation()
                            onViewDetails(enrollment)
                        }}
                    >
                        <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={(e) => {
                            e.stopPropagation()
                            onRemove(enrollment)
                        }}
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </Card.Body>
    </Card>
)

// Enroll Student Modal
const EnrollStudentModal = ({ isOpen, onClose, courses, onEnroll, isLoading }) => {
    const [selectedCourse, setSelectedCourse] = useState('')
    const [selectedStudents, setSelectedStudents] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const debouncedSearch = useDebounce(searchTerm, 300)

    // Fetch students for selection
    const { data: studentsData, isLoading: loadingStudents } = useQuery({
        queryKey: ['students-for-enrollment', debouncedSearch],
        queryFn: () => studentService.getAll({ searchTerm: debouncedSearch, pageSize: 50 }),
        enabled: isOpen,
    })

    const students = studentsData?.Data?.Data || studentsData?.Data || []

    const handleSubmit = () => {
        if (!selectedCourse || selectedStudents.length === 0) {
            toast.error('Please select a course and at least one student')
            return
        }
        onEnroll({
            courseOfferingId: parseInt(selectedCourse),
            studentIds: selectedStudents.map(Number),
        })
    }

    const toggleStudent = (studentId) => {
        setSelectedStudents(prev =>
            prev.includes(studentId)
                ? prev.filter(id => id !== studentId)
                : [...prev, studentId]
        )
    }

    const handleClose = () => {
        setSelectedCourse('')
        setSelectedStudents([])
        setSearchTerm('')
        onClose()
    }

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Enroll Students" size="lg">
            <div className="space-y-4">
                {/* Course Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Select Course <span className="text-red-500">*</span>
                    </label>
                    <select
                        value={selectedCourse}
                        onChange={(e) => setSelectedCourse(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">Select a course...</option>
                        {courses.map(course => (
                            <option key={course.CourseOfferingId} value={course.CourseOfferingId}>
                                {course.SubjectName} - {course.BatchName}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Student Search */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Search Students
                    </label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name or roll number..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Student List */}
                <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
                    {loadingStudents ? (
                        <div className="flex items-center justify-center py-6">
                            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                        </div>
                    ) : students.length === 0 ? (
                        <div className="text-center py-6 text-gray-500">
                            No students found
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {students.map(student => (
                                <label
                                    key={student.Id}
                                    className={cn(
                                        "flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 transition-colors",
                                        selectedStudents.includes(student.Id.toString()) && "bg-blue-50"
                                    )}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedStudents.includes(student.Id.toString())}
                                        onChange={() => toggleStudent(student.Id.toString())}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900">{student.FullName}</p>
                                        <p className="text-xs text-gray-500">{student.RollNumber}</p>
                                    </div>
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                {selectedStudents.length > 0 && (
                    <p className="text-sm text-blue-600">
                        {selectedStudents.length} student(s) selected
                    </p>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        variant="primary"
                        onClick={handleSubmit}
                        disabled={isLoading || !selectedCourse || selectedStudents.length === 0}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Enrolling...
                            </>
                        ) : (
                            <>
                                <UserPlus className="w-4 h-4 mr-2" />
                                Enroll Students
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </Modal>
    )
}

const FacultyEnrollmentsPage = () => {
    const queryClient = useQueryClient()
    const { user } = useAuth()
    const [searchTerm, setSearchTerm] = useState('')
    const [courseFilter, setCourseFilter] = useState('')
    const [statusFilter, setStatusFilter] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [enrollModalOpen, setEnrollModalOpen] = useState(false)
    const [deleteTarget, setDeleteTarget] = useState(null)
    const [selectedEnrollment, setSelectedEnrollment] = useState(null)
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
    const [viewMode, setViewMode] = useState('list')
    const [fullDetailStudentId, setFullDetailStudentId] = useState(null)
    const [isFullDetailModalOpen, setIsFullDetailModalOpen] = useState(false)
    const pageSize = 12
    const debouncedSearch = useDebounce(searchTerm, 300)

    // Handler for viewing student details
    const handleViewDetails = (enrollment) => {
        setSelectedEnrollment(enrollment)
        setIsDetailModalOpen(true)
    }

    // Handler for viewing full student details
    const handleViewFullDetails = (studentId) => {
        setFullDetailStudentId(studentId)
        setIsDetailModalOpen(false)
        setIsFullDetailModalOpen(true)
    }

    // Fetch faculty's courses
    const { data: dashboardData } = useQuery({
        queryKey: ['faculty-dashboard-enrollments'],
        queryFn: () => dashboardService.getMyDashboard(),
    })

    const courses = useMemo(() => {
        const data = dashboardData?.Data || dashboardData || {}
        return data.CurrentCourses || []
    }, [dashboardData])

    // Get course IDs
    const courseIds = useMemo(() => {
        return courses.map(c => c.CourseOfferingId).filter(Boolean)
    }, [courses])

    // Fetch enrollments
    const { data: enrollmentsData, isLoading, refetch } = useQuery({
        queryKey: ['faculty-enrollments', courseFilter || courseIds.join(','), currentPage],
        queryFn: () => {
            const params = {
                pageNumber: currentPage,
                pageSize,
            }
            if (courseFilter) {
                params.courseOfferingId = courseFilter
            } else if (courseIds.length > 0) {
                // Fetch for first course if no filter (API might not support multiple IDs)
                params.courseOfferingId = courseIds[0]
            }
            return courseEnrollmentService.getAll(params)
        },
        enabled: courseIds.length > 0,
    })

    const enrollments = useMemo(() => {
        return enrollmentsData?.Data?.Data || enrollmentsData?.Data || []
    }, [enrollmentsData])

    // Filter enrollments client-side
    const filteredEnrollments = useMemo(() => {
        return enrollments.filter(enrollment => {
            const matchesSearch = !debouncedSearch ||
                enrollment.StudentName?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                enrollment.RollNumber?.toLowerCase().includes(debouncedSearch.toLowerCase())

            const matchesStatus = !statusFilter || enrollment.Status === statusFilter

            return matchesSearch && matchesStatus
        })
    }, [enrollments, debouncedSearch, statusFilter])

    const totalCount = enrollmentsData?.Data?.TotalCount || filteredEnrollments.length
    const totalPages = Math.ceil(totalCount / pageSize)

    // Stats
    const stats = useMemo(() => ({
        totalEnrollments: enrollments.length,
        activeEnrollments: enrollments.filter(e => e.Status === 'Active').length,
        totalCourses: courses.length,
    }), [enrollments, courses])

    // Bulk enroll mutation
    const bulkEnrollMutation = useMutation({
        mutationFn: (data) => courseEnrollmentService.bulkEnroll(data),
        onSuccess: () => {
            toast.success('Students enrolled successfully')
            queryClient.invalidateQueries(['faculty-enrollments'])
            setEnrollModalOpen(false)
        },
        onError: (error) => {
            toast.error(getErrorMessage(error))
        },
    })

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: (id) => courseEnrollmentService.delete(id),
        onSuccess: () => {
            toast.success('Enrollment removed successfully')
            queryClient.invalidateQueries(['faculty-enrollments'])
            setDeleteTarget(null)
        },
        onError: (error) => {
            toast.error(getErrorMessage(error))
        },
    })

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg shadow-purple-500/25">
                        <UserPlus className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent">
                            Course Enrollments
                        </h1>
                        <p className="text-gray-500">Manage student enrollments for your courses</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => refetch()}>
                        <RefreshCcw className="w-4 h-4 mr-2" />
                        Refresh
                    </Button>
                    <Button variant="primary" onClick={() => setEnrollModalOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Enroll Students
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-0">
                    <Card.Body className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Users className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalEnrollments}</p>
                                <p className="text-sm text-gray-600">Total Enrollments</p>
                            </div>
                        </div>
                    </Card.Body>
                </Card>
                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-0">
                    <Card.Body className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{stats.activeEnrollments}</p>
                                <p className="text-sm text-gray-600">Active Students</p>
                            </div>
                        </div>
                    </Card.Body>
                </Card>
                <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-0">
                    <Card.Body className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <BookOpen className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalCourses}</p>
                                <p className="text-sm text-gray-600">My Courses</p>
                            </div>
                        </div>
                    </Card.Body>
                </Card>
            </div>

            {/* Filters */}
            <Card className="border-0 shadow-md">
                <Card.Body className="p-4">
                    <div className="flex flex-wrap items-center gap-4">
                        {/* Search */}
                        <div className="flex-1 min-w-64">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search students..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Course Filter */}
                        <select
                            value={courseFilter}
                            onChange={(e) => setCourseFilter(e.target.value)}
                            className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">All Courses</option>
                            {courses.map(course => (
                                <option key={course.CourseOfferingId} value={course.CourseOfferingId}>
                                    {course.SubjectName}
                                </option>
                            ))}
                        </select>

                        {/* Status Filter */}
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">All Status</option>
                            <option value="Active">Active</option>
                            <option value="Dropped">Dropped</option>
                            <option value="Completed">Completed</option>
                        </select>

                        {/* View Toggle */}
                        <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={cn(
                                    'p-2 transition-colors',
                                    viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                                )}
                            >
                                <LayoutGrid className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={cn(
                                    'p-2 transition-colors',
                                    viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                                )}
                            >
                                <List className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </Card.Body>
            </Card>

            {/* Loading State */}
            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="text-center">
                        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto" />
                        <p className="text-sm text-gray-500 mt-3">Loading enrollments...</p>
                    </div>
                </div>
            ) : filteredEnrollments.length === 0 ? (
                <EmptyState
                    icon={Users}
                    title="No Enrollments Found"
                    description={courseFilter ? "No students enrolled in this course" : "Select a course to view enrollments"}
                    action={courseFilter && {
                        label: 'Enroll Students',
                        onClick: () => setEnrollModalOpen(true),
                    }}
                />
            ) : (
                <>
                    {/* List View */}
                    {viewMode === 'list' ? (
                        <Card className="border-0 shadow-md overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Student</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Course</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Batch</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Enrolled</th>
                                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredEnrollments.map(enrollment => (
                                            <EnrollmentRow
                                                key={enrollment.Id}
                                                enrollment={enrollment}
                                                onRemove={setDeleteTarget}
                                                onViewDetails={handleViewDetails}
                                            />
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {totalPages > 1 && (
                                <div className="p-4 border-t border-gray-200 flex justify-center">
                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        onPageChange={setCurrentPage}
                                    />
                                </div>
                            )}
                        </Card>
                    ) : (
                        /* Grid View */
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredEnrollments.map(enrollment => (
                                    <EnrollmentCard
                                        key={enrollment.Id}
                                        enrollment={enrollment}
                                        onRemove={setDeleteTarget}
                                        onViewDetails={handleViewDetails}
                                    />
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex justify-center">
                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        onPageChange={setCurrentPage}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </>
            )}

            {/* Enroll Modal */}
            <EnrollStudentModal
                isOpen={enrollModalOpen}
                onClose={() => setEnrollModalOpen(false)}
                courses={courses}
                onEnroll={(data) => bulkEnrollMutation.mutate(data)}
                isLoading={bulkEnrollMutation.isPending}
            />

            {/* Delete Confirmation */}
            <Modal
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                title="Remove Enrollment"
                size="sm"
            >
                <div className="space-y-4">
                    <p className="text-gray-600">
                        Are you sure you want to remove <strong>{deleteTarget?.StudentName}</strong> from this course?
                    </p>
                    <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setDeleteTarget(null)}>
                            Cancel
                        </Button>
                        <Button
                            variant="danger"
                            onClick={() => deleteMutation.mutate(deleteTarget.Id)}
                            disabled={deleteMutation.isPending}
                        >
                            {deleteMutation.isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                'Remove'
                            )}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Student Detail Modal */}
            <StudentDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => {
                    setIsDetailModalOpen(false)
                    setSelectedEnrollment(null)
                }}
                enrollment={selectedEnrollment}
                onViewFullDetails={handleViewFullDetails}
            />

            {/* Full Student Detail Modal (Admin-style) */}
            <StudentFullDetailModal
                isOpen={isFullDetailModalOpen}
                onClose={() => {
                    setIsFullDetailModalOpen(false)
                    setFullDetailStudentId(null)
                }}
                studentId={fullDetailStudentId}
                showEditButton={false}
            />
        </div>
    )
}

export default FacultyEnrollmentsPage
