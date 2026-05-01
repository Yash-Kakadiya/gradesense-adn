import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { PageHeader } from '@/components/layout'
import { Card, Badge, Select, Table, EmptyState, Button } from '@/components/common'
import { LoadingInline } from '@/components/common/Spinner'
import { useAuth } from '@/context/AuthContext'
import { courseEnrollmentService } from '@/services/courseEnrollmentService'
import { attendanceService } from '@/services/attendanceService'
import { studentExportService } from '@/services/studentExportService'
import { AttendanceCalendar } from '@/components/students'
import { Calendar, CheckCircle, XCircle, Clock, AlertTriangle, BookOpen, Filter, Search, Download, FileText, FileSpreadsheet, ChevronDown } from 'lucide-react'
import { formatDate, cn } from '@/utils/helpers'
import toast from 'react-hot-toast'

const StudentAttendancePage = () => {
    const { user } = useAuth()
    const [selectedCourse, setSelectedCourse] = useState('all')
    const [showExportMenu, setShowExportMenu] = useState(false)
    const [exporting, setExporting] = useState(false)

    // Fetch student's course enrollments (user.id === student.id for students)
    const { data: enrollmentsData, isLoading: loadingEnrollments } = useQuery({
        queryKey: ['student-enrollments-attendance', user?.id],
        queryFn: () => courseEnrollmentService.getByStudent(user?.id),
        enabled: !!user?.id,
    })

    // Fetch ALL attendance records for the student (for summary - not filtered)
    const { data: allAttendanceData, isLoading: loadingAllAttendance } = useQuery({
        queryKey: ['student-attendance-all', user?.id],
        queryFn: () => attendanceService.getAll({
            studentId: user?.id,
            pageSize: 500,
        }),
        enabled: !!user?.id,
    })

    // Fetch filtered attendance records for detailed view
    const { data: attendanceData, isLoading: loadingAttendance } = useQuery({
        queryKey: ['student-attendance', user?.id, selectedCourse],
        queryFn: () => attendanceService.getAll({
            studentId: user?.id,
            courseOfferingId: selectedCourse !== 'all' ? selectedCourse : undefined,
            pageSize: 500,
        }),
        enabled: !!user?.id,
    })

    // Extract data from API responses (PascalCase)
    const enrollments = enrollmentsData?.Data?.Data || enrollmentsData?.Data || []
    const allAttendanceRecords = allAttendanceData?.Data?.Data || []
    const attendanceRecords = attendanceData?.Data?.Data || []

    // Build course options
    const courseOptions = [
        { value: 'all', label: 'All Courses' },
        ...enrollments.map(e => ({
            value: e.CourseOfferingId?.toString() || e.Id?.toString(),
            label: `${e.SubjectCode || ''} - ${e.SubjectName}`,
        })),
    ]

    // Calculate attendance summary per course (using ALL attendance records)
    const attendanceSummary = useMemo(() => {
        return enrollments.map(enrollment => {
            const courseId = enrollment.CourseOfferingId || enrollment.Id
            const courseAttendance = allAttendanceRecords.filter(r => r.CourseOfferingId === courseId)
            const totalClasses = courseAttendance.length
            const attended = courseAttendance.filter(r =>
                r.Status?.toLowerCase() === 'present' || r.Status?.toLowerCase() === 'late'
            ).length
            const percentage = totalClasses > 0 ? Math.round((attended / totalClasses) * 100) : 100

            return {
                Id: courseId,
                Code: enrollment.SubjectCode,
                Name: enrollment.SubjectName,
                TotalClasses: totalClasses,
                Attended: attended,
                Percentage: percentage,
            }
        })
    }, [enrollments, allAttendanceRecords])

    // Overall statistics
    const overallStats = useMemo(() => {
        const totalClasses = attendanceSummary.reduce((sum, c) => sum + c.TotalClasses, 0)
        const attended = attendanceSummary.reduce((sum, c) => sum + c.Attended, 0)
        const percentage = totalClasses > 0 ? Math.round((attended / totalClasses) * 100) : 100
        return { totalClasses, attended, percentage }
    }, [attendanceSummary])

    // Use filtered attendance for detailed view
    const filteredAttendance = attendanceRecords

    const getAttendanceColor = (percentage) => {
        if (percentage >= 90) return 'text-green-600'
        if (percentage >= 75) return 'text-yellow-600'
        return 'text-red-600'
    }

    const getAttendanceBadge = (percentage) => {
        if (percentage >= 90) return 'success'
        if (percentage >= 75) return 'warning'
        return 'danger'
    }

    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case 'present':
                return <CheckCircle className="w-5 h-5 text-green-500" />
            case 'absent':
                return <XCircle className="w-5 h-5 text-red-500" />
            case 'late':
                return <Clock className="w-5 h-5 text-yellow-500" />
            default:
                return null
        }
    }

    const summaryColumns = [
        {
            header: 'Code',
            accessor: 'Code',
            cell: (row) => (
                <span className="font-mono text-sm text-blue-600">{row.Code}</span>
            ),
        },
        {
            header: 'Course Name',
            accessor: 'Name',
            cell: (row) => (
                <span className="font-medium">{row.Name}</span>
            ),
        },
        {
            header: 'Total Classes',
            accessor: 'TotalClasses',
        },
        {
            header: 'Attended',
            accessor: 'Attended',
        },
        {
            header: 'Percentage',
            cell: (row) => (
                <div className="flex items-center gap-2">
                    <span className={`font-medium ${getAttendanceColor(row.Percentage)}`}>
                        {row.Percentage}%
                    </span>
                    <Badge variant={getAttendanceBadge(row.Percentage)} size="sm">
                        {row.Percentage >= 90 ? 'Good' : row.Percentage >= 75 ? 'Average' : 'Low'}
                    </Badge>
                </div>
            ),
        },
    ]

    const detailColumns = [
        {
            header: 'Date',
            accessor: 'Date',
            cell: (row) => (
                <span>{formatDate(row.Date || row.AttendanceDate, 'short')}</span>
            ),
        },
        {
            header: 'Course',
            accessor: 'SubjectName',
            cell: (row) => (
                <span>{row.SubjectCode || row.SubjectName || '-'}</span>
            ),
        },
        {
            header: 'Status',
            accessor: 'Status',
            cell: (row) => (
                <div className="flex items-center gap-2">
                    {getStatusIcon(row.Status)}
                    <span className="capitalize">{row.Status?.toLowerCase() || '-'}</span>
                </div>
            ),
        },
    ]

    // Export functions
    const handleExportAttendance = async (format) => {
        setExporting(true)
        setShowExportMenu(false)

        try {
            const filters = selectedCourse !== 'all' ? { courseOfferingId: parseInt(selectedCourse) } : {}
            const response = format === 'csv'
                ? await studentExportService.exportAttendanceToCsv(filters)
                : await studentExportService.exportAttendanceToExcel(filters)

            const filename = studentExportService.getFilenameFromResponse(
                response,
                `attendance.${format === 'csv' ? 'csv' : 'xlsx'}`
            )

            studentExportService.downloadBlobAsFile(response.data, filename)
            toast.success(`Attendance exported to ${format.toUpperCase()} successfully`)
        } catch (error) {
            console.error('Export error:', error)
            toast.error(`Failed to export attendance: ${error.message || 'Unknown error'}`)
        } finally {
            setExporting(false)
        }
    }

    const handleExportAcademicReport = async () => {
        setExporting(true)
        setShowExportMenu(false)

        try {
            const response = await studentExportService.exportAcademicReportToExcel({})

            const filename = studentExportService.getFilenameFromResponse(
                response,
                `academic_report.xlsx`
            )

            studentExportService.downloadBlobAsFile(response.data, filename)
            toast.success('Academic report exported successfully')
        } catch (error) {
            console.error('Export error:', error)
            toast.error(`Failed to export academic report: ${error.message || 'Unknown error'}`)
        } finally {
            setExporting(false)
        }
    }

    if (loadingEnrollments) {
        return <LoadingInline message="Loading attendance..." />
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="My Attendance"
                description="Track your class attendance across all courses"
            />

            {/* Overall Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-0 shadow-sm">
                    <Card.Body className="py-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg shadow-sm">
                                <Calendar className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Total Classes</p>
                                <p className="text-xl font-bold">{overallStats.totalClasses}</p>
                            </div>
                        </div>
                    </Card.Body>
                </Card>
                <Card className="border-0 shadow-sm">
                    <Card.Body className="py-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg shadow-sm">
                                <CheckCircle className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Classes Attended</p>
                                <p className="text-xl font-bold">{overallStats.attended}</p>
                            </div>
                        </div>
                    </Card.Body>
                </Card>
                <Card className="border-0 shadow-sm">
                    <Card.Body className="py-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-red-400 to-rose-500 rounded-lg shadow-sm">
                                <XCircle className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Classes Missed</p>
                                <p className="text-xl font-bold">{overallStats.totalClasses - overallStats.attended}</p>
                            </div>
                        </div>
                    </Card.Body>
                </Card>
                <Card className="border-0 shadow-sm">
                    <Card.Body className="py-4">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg shadow-sm ${overallStats.percentage >= 75
                                ? 'bg-gradient-to-br from-green-400 to-emerald-500'
                                : 'bg-gradient-to-br from-red-400 to-rose-500'
                                }`}>
                                {overallStats.percentage >= 75 ? (
                                    <CheckCircle className="w-5 h-5 text-white" />
                                ) : (
                                    <AlertTriangle className="w-5 h-5 text-white" />
                                )}
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Overall Percentage</p>
                                <p className={`text-xl font-bold ${getAttendanceColor(overallStats.percentage)}`}>
                                    {overallStats.percentage}%
                                </p>
                            </div>
                        </div>
                    </Card.Body>
                </Card>
            </div>

            {/* Low Attendance Warning */}
            {attendanceSummary.some((c) => c.Percentage < 75 && c.TotalClasses > 0) && (
                <Card className="border-red-200 bg-red-50 shadow-sm">
                    <Card.Body>
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-medium text-red-800">Low Attendance Warning</p>
                                <p className="text-sm text-red-600 mt-1">
                                    Your attendance in the following courses is below 75%:{' '}
                                    {attendanceSummary
                                        .filter((c) => c.Percentage < 75 && c.TotalClasses > 0)
                                        .map((c) => c.Name)
                                        .join(', ')}
                                </p>
                            </div>
                        </div>
                    </Card.Body>
                </Card>
            )}

            {/* Attendance Calendar */}
            <AttendanceCalendar studentId={user?.id} />

            {/* Attendance Summary by Course */}
            <Card className="border-0 shadow-sm overflow-hidden">
                <Card.Header className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                    <Card.Title className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-blue-600" />
                        Attendance Summary by Course
                    </Card.Title>
                </Card.Header>
                {(loadingAllAttendance || attendanceSummary.length === 0) ? (
                    loadingAllAttendance ? (
                        <Card.Body>
                            <LoadingInline message="Loading summary..." />
                        </Card.Body>
                    ) : (
                        <Card.Body>
                            <EmptyState
                                icon={BookOpen}
                                title="No courses found"
                                description="You are not enrolled in any courses"
                            />
                        </Card.Body>
                    )
                ) : (
                    <Table columns={summaryColumns} data={attendanceSummary} />
                )}
            </Card>

            {/* Detailed Attendance */}
            <Card className="border-0 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-white/20 backdrop-blur rounded-xl">
                                <Calendar className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Detailed Attendance</h3>
                                <p className="text-white/70 text-sm">View your attendance records</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/70" />
                                <select
                                    value={selectedCourse}
                                    onChange={(e) => setSelectedCourse(e.target.value)}
                                    className="w-full sm:w-64 pl-10 pr-4 py-2.5 bg-white/20 backdrop-blur border border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 appearance-none cursor-pointer"
                                >
                                    {courseOptions.map((option) => (
                                        <option key={option.value} value={option.value} className="text-gray-900">
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {/* Export Button */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowExportMenu(!showExportMenu)}
                                    disabled={exporting}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-white/20 backdrop-blur border border-white/30 rounded-xl text-white hover:bg-white/30 transition-colors disabled:opacity-50"
                                >
                                    {exporting ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <Download className="w-4 h-4" />
                                    )}
                                    Export
                                    <ChevronDown className="w-4 h-4" />
                                </button>
                                {showExportMenu && (
                                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                                        <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Attendance
                                        </div>
                                        <button
                                            onClick={() => handleExportAttendance('csv')}
                                            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                        >
                                            <FileText className="w-4 h-4 text-green-600" />
                                            Download CSV
                                        </button>
                                        <button
                                            onClick={() => handleExportAttendance('excel')}
                                            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                        >
                                            <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                                            Download Excel (with Summary)
                                        </button>
                                        <div className="border-t border-gray-100 my-2" />
                                        <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Full Report
                                        </div>
                                        <button
                                            onClick={handleExportAcademicReport}
                                            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                        >
                                            <FileSpreadsheet className="w-4 h-4 text-purple-600" />
                                            Academic Report (Excel)
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                {loadingAttendance ? (
                    <Card.Body>
                        <LoadingInline message="Loading attendance records..." />
                    </Card.Body>
                ) : filteredAttendance.length === 0 ? (
                    <Card.Body>
                        <div className="text-center py-12 text-gray-500">
                            <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                            No attendance records found
                        </div>
                    </Card.Body>
                ) : (
                    <Table columns={detailColumns} data={filteredAttendance} />
                )}
            </Card>
        </div>
    )
}

export default StudentAttendancePage
