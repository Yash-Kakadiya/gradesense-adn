import { useState, useMemo, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Card, Badge, Button, EmptyState, Pagination, Modal } from '@/components/common'
import { useAuth } from '@/context/AuthContext'
import { facultyAssignmentService } from '@/services/facultyAssignmentService'
import { studentService } from '@/services/studentService'
import { courseEnrollmentService } from '@/services/courseEnrollmentService'
import { exportRosterToCsv, exportRosterToExcel, handleExportDownload } from '@/services/facultyExportService'
import { useDebounce } from '@/hooks'
import { ROUTES } from '@/utils/constants'
import { cn } from '@/utils/helpers'
import StudentFullDetailModal from '@/components/students/StudentDetailModal'
import {
    Users,
    Search,
    GraduationCap,
    Loader2,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    BookOpen,
    Calendar,
    Mail,
    Phone,
    ChevronDown,
    Eye,
    BarChart3,
    Filter,
    RefreshCcw,
    UserCheck,
    Download,
    FileSpreadsheet,
    FileText,
    Target,
    LayoutGrid,
    List,
    X,
    ExternalLink,
} from 'lucide-react'

// Student Detail Modal
const StudentDetailModal = ({ isOpen, onClose, student, onViewFullDetails }) => {
    if (!student) return null

    const getPerformanceConfig = (score) => {
        if (score >= 85) return { label: 'Excellent', color: 'text-emerald-600 bg-emerald-50', gradient: 'from-emerald-500 to-teal-600' }
        if (score >= 70) return { label: 'Good', color: 'text-blue-600 bg-blue-50', gradient: 'from-blue-500 to-indigo-600' }
        if (score >= 50) return { label: 'Average', color: 'text-yellow-600 bg-yellow-50', gradient: 'from-yellow-500 to-orange-600' }
        if (score >= 35) return { label: 'Below Average', color: 'text-orange-600 bg-orange-50', gradient: 'from-orange-500 to-red-600' }
        return { label: 'At Risk', color: 'text-red-600 bg-red-50', gradient: 'from-red-500 to-pink-600' }
    }

    const performanceConfig = getPerformanceConfig(student.AverageScore || 0)

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Student Details" size="lg">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-start gap-4">
                    <div className={cn("w-16 h-16 rounded-full bg-gradient-to-br flex items-center justify-center flex-shrink-0", performanceConfig.gradient)}>
                        <span className="text-white font-bold text-2xl">
                            {student.FullName?.charAt(0) || 'S'}
                        </span>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900">{student.FullName}</h3>
                        <p className="text-gray-500">{student.RollNumber}</p>
                        <div className="flex items-center gap-2 mt-2">
                            <div className={cn("inline-block px-3 py-1 rounded-full text-sm font-medium", performanceConfig.color)}>
                                {performanceConfig.label}
                            </div>
                            {student.EnrollmentStatus && (
                                <Badge variant={student.EnrollmentStatus === 'Active' ? 'success' : 'warning'}>
                                    {student.EnrollmentStatus}
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>

                {/* Performance Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-blue-50 rounded-xl text-center">
                        <BarChart3 className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-gray-900">{student.AverageScore?.toFixed(1) || 0}%</p>
                        <p className="text-sm text-gray-500">Avg Score</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-xl text-center">
                        <UserCheck className="w-6 h-6 text-green-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-gray-900">{student.AttendancePercentage?.toFixed(0) || 0}%</p>
                        <p className="text-sm text-gray-500">Attendance</p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-xl text-center min-h-24">
                        <BookOpen className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                        <p className="text-sm font-bold text-gray-900 break-words leading-tight">{student.CourseName || 'N/A'}</p>
                        <p className="text-sm text-gray-500 mt-1">Course</p>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-xl text-center min-h-24">
                        <GraduationCap className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                        <p className="text-sm font-bold text-gray-900 break-words leading-tight">{student.BatchName || 'N/A'}</p>
                        <p className="text-sm text-gray-500 mt-1">Batch</p>
                    </div>
                </div>

                {/* Academic Information */}
                <div>
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Academic Information</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                            <div className="p-2 bg-indigo-100 rounded-lg">
                                <GraduationCap className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Roll Number</p>
                                <p className="font-medium text-gray-900">{student.RollNumber || 'N/A'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                            <div className="p-2 bg-violet-100 rounded-lg">
                                <Users className="w-5 h-5 text-violet-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Batch</p>
                                <p className="font-medium text-gray-900">{student.BatchName || 'N/A'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                            <div className="p-2 bg-cyan-100 rounded-lg flex-shrink-0">
                                <BookOpen className="w-5 h-5 text-cyan-600" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs text-gray-500">Course</p>
                                <p className="font-medium text-gray-900 break-words">{student.CourseName || 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact Info */}
                <div>
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Contact Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Mail className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-500">Email</p>
                                <p className="font-medium text-gray-900 truncate">{student.Email || 'N/A'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <Phone className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Phone</p>
                                <p className="font-medium text-gray-900">{student.Phone || 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t">
                    <Button variant="outline" className="flex-1" onClick={onClose}>
                        Close
                    </Button>
                    {student.Id && (
                        <Button
                            variant="primary"
                            className="flex-1"
                            onClick={() => onViewFullDetails(student.Id)}
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

// Performance badge component
const PerformanceBadge = ({ percentage }) => {
    const getConfig = () => {
        if (percentage >= 85) return { label: 'Excellent', variant: 'success', icon: TrendingUp }
        if (percentage >= 70) return { label: 'Good', variant: 'primary', icon: TrendingUp }
        if (percentage >= 50) return { label: 'Average', variant: 'warning', icon: Target }
        if (percentage >= 35) return { label: 'Below Avg', variant: 'danger', icon: TrendingDown }
        return { label: 'At Risk', variant: 'danger', icon: AlertTriangle }
    }
    const config = getConfig()
    return (
        <Badge variant={config.variant} className="flex items-center gap-1">
            <config.icon className="w-3 h-3" />
            {config.label}
        </Badge>
    )
}

// Student Card Component
const StudentCard = ({ student, onViewDetails }) => (
    <Card
        className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 overflow-hidden cursor-pointer"
        onClick={() => onViewDetails(student)}
    >
        <Card.Body className="p-4">
            <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-semibold text-lg">
                        {student.FullName?.charAt(0) || 'S'}
                    </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <div>
                            <h3 className="font-semibold text-gray-900 truncate">{student.FullName}</h3>
                            <p className="text-sm text-gray-500">{student.RollNumber}</p>
                        </div>
                        <PerformanceBadge percentage={student.AverageScore || 0} />
                    </div>

                    <div className="mt-2 space-y-1 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                            <BookOpen className="w-3.5 h-3.5 text-gray-400" />
                            <span className="truncate">{student.BatchName || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Mail className="w-3.5 h-3.5 text-gray-400" />
                            <span className="truncate">{student.Email || 'N/A'}</span>
                        </div>
                    </div>

                    {/* Stats Row */}
                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100">
                        <div className="text-center">
                            <p className="text-lg font-bold text-gray-900">{student.AverageScore?.toFixed(1) || 0}%</p>
                            <p className="text-xs text-gray-500">Avg Score</p>
                        </div>
                        <div className="text-center">
                            <p className="text-lg font-bold text-gray-900">{student.AttendancePercentage?.toFixed(0) || 0}%</p>
                            <p className="text-xs text-gray-500">Attendance</p>
                        </div>
                        <div className="flex-1 flex justify-end">
                            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onViewDetails(student); }}>
                                <Eye className="w-4 h-4 mr-1" />
                                View
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </Card.Body>
    </Card>
)

// Student Table Row
const StudentTableRow = ({ student, onViewDetails }) => (
    <tr className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => onViewDetails(student)}>
        <td className="px-4 py-3">
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-medium text-sm">
                        {student.FullName?.charAt(0) || 'S'}
                    </span>
                </div>
                <div>
                    <p className="font-medium text-gray-900">{student.FullName}</p>
                    <p className="text-xs text-gray-500">{student.RollNumber}</p>
                </div>
            </div>
        </td>
        <td className="px-4 py-3 text-sm text-gray-600">{student.BatchName || 'N/A'}</td>
        <td className="px-4 py-3 text-sm text-gray-600">{student.CourseName || 'N/A'}</td>
        <td className="px-4 py-3 text-center">
            <span className={cn(
                "font-semibold",
                (student.AverageScore || 0) >= 70 ? "text-green-600" :
                    (student.AverageScore || 0) >= 50 ? "text-yellow-600" : "text-red-600"
            )}>
                {student.AverageScore?.toFixed(1) || 0}%
            </span>
        </td>
        <td className="px-4 py-3 text-center">
            <span className={cn(
                "font-semibold",
                (student.AttendancePercentage || 0) >= 75 ? "text-green-600" :
                    (student.AttendancePercentage || 0) >= 60 ? "text-yellow-600" : "text-red-600"
            )}>
                {student.AttendancePercentage?.toFixed(0) || 0}%
            </span>
        </td>
        <td className="px-4 py-3 text-center">
            <PerformanceBadge percentage={student.AverageScore || 0} />
        </td>
        <td className="px-4 py-3 text-right">
            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onViewDetails(student); }}>
                <Eye className="w-4 h-4" />
            </Button>
        </td>
    </tr>
)

const FacultyStudentsPage = () => {
    const navigate = useNavigate()
    const { user } = useAuth()
    const [searchTerm, setSearchTerm] = useState('')
    const [courseFilter, setCourseFilter] = useState('')
    const [performanceFilter, setPerformanceFilter] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [viewMode, setViewMode] = useState('grid')
    const [selectedStudent, setSelectedStudent] = useState(null)
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
    const [fullDetailStudentId, setFullDetailStudentId] = useState(null)
    const [isFullDetailModalOpen, setIsFullDetailModalOpen] = useState(false)
    const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false)
    const [isExporting, setIsExporting] = useState(false)
    const exportDropdownRef = useRef(null)
    const [pageSize, setPageSize] = useState(12)
    const debouncedSearch = useDebounce(searchTerm, 300)

    // Close export dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target)) {
                setIsExportDropdownOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Handler for viewing full details
    const handleViewFullDetails = (studentId) => {
        setFullDetailStudentId(studentId)
        setIsDetailModalOpen(false)
        setIsFullDetailModalOpen(true)
    }

    // Export handlers
    const handleExportRoster = async (format) => {
        if (!courseFilter) {
            alert('Please select a course to export the roster')
            setIsExportDropdownOpen(false)
            return
        }

        setIsExporting(true)
        setIsExportDropdownOpen(false)

        try {
            const courseId = parseInt(courseFilter)
            const response = format === 'csv'
                ? await exportRosterToCsv(courseId)
                : await exportRosterToExcel(courseId)

            const defaultFilename = format === 'csv'
                ? `student_roster_${courseId}.csv`
                : `student_roster_${courseId}.xlsx`

            handleExportDownload(response, defaultFilename)
        } catch (error) {
            console.error('Export failed:', error)
            alert('Failed to export roster. Please try again.')
        } finally {
            setIsExporting(false)
        }
    }

    // Fetch faculty's course assignments
    const { data: assignmentsData } = useQuery({
        queryKey: ['faculty-assignments', user?.facultyId],
        queryFn: () => facultyAssignmentService.getByFaculty(user?.facultyId),
        enabled: !!user?.facultyId,
    })

    // Get course IDs for filtering
    const courseIds = useMemo(() => {
        const data = assignmentsData?.Data?.Data || assignmentsData?.Data || []
        return data.map(a => a.CourseOfferingId).filter(Boolean)
    }, [assignmentsData])

    // Course options for filter
    const courseOptions = useMemo(() => {
        const data = assignmentsData?.Data?.Data || assignmentsData?.Data || []
        return data.map(a => ({
            value: a.CourseOfferingId?.toString() || '',
            label: a.SubjectName || a.CourseOffering?.SubjectName || 'Unknown',
        }))
    }, [assignmentsData])

    // Fetch enrolled students for faculty's courses
    const { data: enrollmentsData, isLoading, refetch } = useQuery({
        queryKey: ['faculty-students', courseIds, courseFilter, currentPage, pageSize],
        queryFn: async () => {
            if (courseIds.length === 0) return { Data: [], TotalRecords: 0 }

            // Fetch enrollments for specific course or all courses
            const courseIdParam = courseFilter || courseIds[0]
            return courseEnrollmentService.getAll({
                courseOfferingId: courseIdParam,
                pageNumber: currentPage,
                pageSize,
            })
        },
        enabled: courseIds.length > 0,
    })

    // Stats query with large page size so cards reflect full dataset
    const { data: studentsStatsData } = useQuery({
        queryKey: ['faculty-students-stats', courseIds, courseFilter],
        queryFn: async () => {
            if (courseIds.length === 0) return { Data: [], TotalRecords: 0 }
            const courseIdParam = courseFilter || courseIds[0]
            return courseEnrollmentService.getAll({
                courseOfferingId: courseIdParam,
                pageNumber: 1,
                pageSize: 5000,
            })
        },
        enabled: courseIds.length > 0,
        staleTime: 60_000,
    })

    // Process students data
    const students = useMemo(() => {
        const enrollments = enrollmentsData?.Data?.Data || enrollmentsData?.Data || []
        return enrollments.map(e => ({
            Id: e.StudentId || e.Student?.Id,
            FullName: e.StudentName || e.Student?.FullName,
            RollNumber: e.RollNumber || e.Student?.RollNumber,
            Email: e.PersonalEmail || e.StudentEmail || e.Student?.Email,
            Phone: e.PhoneNumber || e.Student?.PhoneNumber,
            BatchName: e.BatchName || e.CourseOffering?.BatchName,
            CourseName: e.SubjectName || e.CourseOffering?.SubjectName,
            CourseOfferingId: e.CourseOfferingId,
            AverageScore: e.AverageScore || 0,
            AttendancePercentage: e.AttendancePercentage || 0,
            EnrollmentStatus: e.Status,
        }))
    }, [enrollmentsData])

    // Filter students
    const filteredStudents = useMemo(() => {
        return students.filter(student => {
            const matchesSearch = !debouncedSearch ||
                student.FullName?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                student.RollNumber?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                student.Email?.toLowerCase().includes(debouncedSearch.toLowerCase())

            const matchesCourse = !courseFilter ||
                student.CourseOfferingId?.toString() === courseFilter

            let matchesPerformance = true
            if (performanceFilter) {
                const score = student.AverageScore || 0
                switch (performanceFilter) {
                    case 'excellent': matchesPerformance = score >= 85; break
                    case 'good': matchesPerformance = score >= 70 && score < 85; break
                    case 'average': matchesPerformance = score >= 50 && score < 70; break
                    case 'at-risk': matchesPerformance = score < 50; break
                }
            }

            return matchesSearch && matchesCourse && matchesPerformance
        })
    }, [students, debouncedSearch, courseFilter, performanceFilter])

    const totalCount = enrollmentsData?.Data?.TotalRecords || filteredStudents.length
    const totalPages = Math.ceil(totalCount / pageSize)

    // Stats
    const statsStudents = useMemo(() => studentsStatsData?.Data?.Data || [], [studentsStatsData])
    const stats = useMemo(() => {
        const total = studentsStatsData?.Data?.TotalRecords || statsStudents.length
        const atRiskCount = statsStudents.filter(s => (s.AverageScore || 0) < 50).length
        const excellentCount = statsStudents.filter(s => (s.AverageScore || 0) >= 85).length
        const avgAttendance = statsStudents.length > 0
            ? statsStudents.reduce((sum, s) => sum + (s.AttendancePercentage || 0), 0) / statsStudents.length
            : 0
        return {
            total,
            atRisk: atRiskCount,
            excellent: excellentCount,
            avgAttendance: avgAttendance.toFixed(0),
        }
    }, [statsStudents, studentsStatsData])

    const handleViewDetails = (student) => {
        setSelectedStudent(student)
        setIsDetailModalOpen(true)
    }

    const performanceOptions = [
        { value: '', label: 'All Performance' },
        { value: 'excellent', label: 'Excellent (85%+)' },
        { value: 'good', label: 'Good (70-85%)' },
        { value: 'average', label: 'Average (50-70%)' },
        { value: 'at-risk', label: 'At Risk (<50%)' },
    ]

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg shadow-emerald-500/25">
                            <Users className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent">
                            My Students
                        </h1>
                    </div>
                    <p className="text-gray-500 ml-14">
                        View and monitor students enrolled in your courses
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {/* Export Dropdown */}
                    <div className="relative" ref={exportDropdownRef}>
                        <Button
                            variant="outline"
                            onClick={() => setIsExportDropdownOpen(!isExportDropdownOpen)}
                            disabled={isExporting || !courseFilter}
                            title={!courseFilter ? 'Select a course to export' : 'Export roster'}
                        >
                            {isExporting ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Download className="w-4 h-4 mr-2" />
                            )}
                            Export
                            <ChevronDown className="w-4 h-4 ml-1" />
                        </Button>
                        {isExportDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                                <button
                                    onClick={() => handleExportRoster('csv')}
                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                >
                                    <FileText className="w-4 h-4 text-gray-500" />
                                    Export as CSV
                                </button>
                                <button
                                    onClick={() => handleExportRoster('excel')}
                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                >
                                    <FileSpreadsheet className="w-4 h-4 text-green-600" />
                                    Export as Excel
                                </button>
                            </div>
                        )}
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => refetch()}
                        disabled={isLoading}
                    >
                        <RefreshCcw className={cn('w-4 h-4 mr-2', isLoading && 'animate-spin')} />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50">
                    <Card.Body className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Users className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                                <p className="text-xs text-gray-500">Total Students</p>
                            </div>
                        </div>
                    </Card.Body>
                </Card>
                <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-teal-50">
                    <Card.Body className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-100 rounded-lg">
                                <TrendingUp className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{stats.excellent}</p>
                                <p className="text-xs text-gray-500">Excellent</p>
                            </div>
                        </div>
                    </Card.Body>
                </Card>
                <Card className="border-0 shadow-sm bg-gradient-to-br from-red-50 to-orange-50">
                    <Card.Body className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-100 rounded-lg">
                                <AlertTriangle className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{stats.atRisk}</p>
                                <p className="text-xs text-gray-500">At Risk</p>
                            </div>
                        </div>
                    </Card.Body>
                </Card>
                <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-violet-50">
                    <Card.Body className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <UserCheck className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{stats.avgAttendance}%</p>
                                <p className="text-xs text-gray-500">Avg Attendance</p>
                            </div>
                        </div>
                    </Card.Body>
                </Card>
            </div>

            {/* Filters */}
            <Card className="border-0 shadow-sm">
                <Card.Body className="p-4">
                    <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                        <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full">
                            <div className="relative flex-1 max-w-sm">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search students..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                />
                            </div>
                            <select
                                value={courseFilter}
                                onChange={(e) => setCourseFilter(e.target.value)}
                                className="px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                            >
                                <option value="">All Courses</option>
                                {courseOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                            <select
                                value={performanceFilter}
                                onChange={(e) => setPerformanceFilter(e.target.value)}
                                className="px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                            >
                                {performanceOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">{filteredStudents.length} students</span>
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
                    </div>
                </Card.Body>
            </Card>

            {/* Content */}
            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="text-center">
                        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto" />
                        <p className="text-sm text-gray-500 mt-3">Loading students...</p>
                    </div>
                </div>
            ) : filteredStudents.length === 0 ? (
                <EmptyState
                    icon={Users}
                    title="No students found"
                    description={
                        searchTerm || courseFilter || performanceFilter
                            ? 'Try adjusting your search or filters'
                            : 'No students are currently enrolled in your courses'
                    }
                />
            ) : viewMode === 'grid' ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {filteredStudents.map((student) => (
                            <StudentCard
                                key={`${student.Id}-${student.CourseOfferingId}`}
                                student={student}
                                onViewDetails={handleViewDetails}
                            />
                        ))}
                    </div>
                    {totalPages > 1 && (
                        <div className="flex justify-center">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                totalItems={totalCount}
                                pageSize={pageSize}
                                onPageChange={setCurrentPage}
                                onPageSizeChange={(size) => {
                                    setPageSize(size)
                                    setCurrentPage(1)
                                }}
                            />
                        </div>
                    )}
                </>
            ) : (
                <Card className="overflow-hidden border-0 shadow-md">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Student</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Batch</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Course</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Avg Score</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Attendance</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Status</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredStudents.map((student) => (
                                    <StudentTableRow
                                        key={`${student.Id}-${student.CourseOfferingId}`}
                                        student={student}
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
                                totalItems={totalCount}
                                pageSize={pageSize}
                                onPageChange={setCurrentPage}
                                onPageSizeChange={(size) => {
                                    setPageSize(size)
                                    setCurrentPage(1)
                                }}
                            />
                        </div>
                    )}
                </Card>
            )}

            {/* Student Detail Modal */}
            <StudentDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => {
                    setIsDetailModalOpen(false)
                    setSelectedStudent(null)
                }}
                student={selectedStudent}
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

export default FacultyStudentsPage
