import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { PageHeader } from '@/components/layout'
import { Card, Badge, Select, Table, EmptyState } from '@/components/common'
import { LoadingInline } from '@/components/common/Spinner'
import { useAuth } from '@/context/AuthContext'
import { courseEnrollmentService } from '@/services/courseEnrollmentService'
import { attendanceService } from '@/services/attendanceService'
import { Calendar, CheckCircle, XCircle, Clock, AlertTriangle, BookOpen } from 'lucide-react'
import { formatDate } from '@/utils/helpers'

const StudentAttendancePage = () => {
    const { user } = useAuth()
    const [selectedCourse, setSelectedCourse] = useState('all')

    // Fetch student's course enrollments (user.id === student.id for students)
    const { data: enrollmentsData, isLoading: loadingEnrollments } = useQuery({
        queryKey: ['student-enrollments-attendance', user?.id],
        queryFn: () => courseEnrollmentService.getByStudent(user?.id),
        enabled: !!user?.id,
    })

    // Fetch attendance records for the student
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
    const attendanceRecords = attendanceData?.Data?.Data || []

    // Build course options
    const courseOptions = [
        { value: 'all', label: 'All Courses' },
        ...enrollments.map(e => ({
            value: e.CourseOfferingId?.toString() || e.Id?.toString(),
            label: `${e.SubjectCode || ''} - ${e.SubjectName}`,
        })),
    ]

    // Calculate attendance summary per course
    const attendanceSummary = useMemo(() => {
        return enrollments.map(enrollment => {
            const courseId = enrollment.CourseOfferingId || enrollment.Id
            const courseAttendance = attendanceRecords.filter(r => r.CourseOfferingId === courseId)
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
    }, [enrollments, attendanceRecords])

    // Overall statistics
    const overallStats = useMemo(() => {
        const totalClasses = attendanceSummary.reduce((sum, c) => sum + c.TotalClasses, 0)
        const attended = attendanceSummary.reduce((sum, c) => sum + c.Attended, 0)
        const percentage = totalClasses > 0 ? Math.round((attended / totalClasses) * 100) : 100
        return { totalClasses, attended, percentage }
    }, [attendanceSummary])

    // Filter attendance records
    const filteredAttendance = selectedCourse === 'all'
        ? attendanceRecords
        : attendanceRecords.filter(r => r.CourseOfferingId?.toString() === selectedCourse)

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
                                        .map((c) => c.Code)
                                        .join(', ')}
                                </p>
                            </div>
                        </div>
                    </Card.Body>
                </Card>
            )}

            {/* Attendance Summary by Course */}
            <Card className="border-0 shadow-sm overflow-hidden">
                <Card.Header className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                    <Card.Title className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-blue-600" />
                        Attendance Summary by Course
                    </Card.Title>
                </Card.Header>
                {attendanceSummary.length === 0 ? (
                    <Card.Body>
                        <EmptyState
                            icon={BookOpen}
                            title="No courses found"
                            description="You are not enrolled in any courses"
                        />
                    </Card.Body>
                ) : (
                    <Table columns={summaryColumns} data={attendanceSummary} />
                )}
            </Card>

            {/* Detailed Attendance */}
            <Card className="border-0 shadow-sm overflow-hidden">
                <Card.Header className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <Card.Title className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-purple-600" />
                            Detailed Attendance
                        </Card.Title>
                        <Select
                            options={courseOptions}
                            value={selectedCourse}
                            onChange={(e) => setSelectedCourse(e.target.value)}
                            className="w-56"
                        />
                    </div>
                </Card.Header>
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
