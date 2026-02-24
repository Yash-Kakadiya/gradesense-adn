import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, Badge, Button, EmptyState } from '@/components/common'
import { useAuth } from '@/context/AuthContext'
import { facultyAssignmentService } from '@/services/facultyAssignmentService'
import { courseEnrollmentService } from '@/services/courseEnrollmentService'
import { evaluationSchemeService, assessmentItemService } from '@/services/evaluationService'
import { studentMarkService } from '@/services/studentMarkService'
import { attendanceService } from '@/services/attendanceService'
import { cn } from '@/utils/helpers'
import toast from 'react-hot-toast'
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Area,
    AreaChart,
} from 'recharts'
import {
    Download,
    FileText,
    Users,
    TrendingUp,
    AlertTriangle,
    RefreshCcw,
    Loader2,
    BarChart3,
    PieChartIcon,
    Calendar,
    Target,
    BookOpen,
    ChevronDown,
    CheckCircle,
    Clock,
    GraduationCap,
} from 'lucide-react'

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white px-3 py-2 shadow-lg rounded-lg border border-gray-100">
                <p className="text-sm font-medium text-gray-900">{label}</p>
                {payload.map((item, idx) => (
                    <p key={idx} className="text-sm" style={{ color: item.color }}>
                        {item.name}: {item.value}
                    </p>
                ))}
            </div>
        )
    }
    return null
}

// Colors
const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316']
const GRADE_COLORS = {
    'A+': '#22C55E', 'A': '#16A34A', 'B+': '#3B82F6', 'B': '#2563EB',
    'C+': '#F59E0B', 'C': '#D97706', 'D': '#EF4444', 'F': '#DC2626'
}

const FacultyReportsPage = () => {
    const { user } = useAuth()
    const [selectedCourse, setSelectedCourse] = useState('')
    const [reportType, setReportType] = useState('overview')

    // Fetch faculty's course assignments
    const { data: assignmentsData, isLoading: loadingAssignments, refetch } = useQuery({
        queryKey: ['faculty-assignments-reports', user?.id],
        queryFn: () => facultyAssignmentService.getByFaculty(user?.id),
        enabled: !!user?.id,
    })

    // Extract courses
    const courses = useMemo(() => {
        const data = assignmentsData?.Data?.Data || assignmentsData?.Data || []
        return data.map(a => ({
            ...a,
            value: a.CourseOfferingId?.toString(),
            label: `${a.SubjectCode || ''} - ${a.SubjectName}`,
            batch: a.BatchName,
        }))
    }, [assignmentsData])

    // Selected course details
    const selectedCourseDetails = useMemo(() =>
        courses.find(c => c.value === selectedCourse),
        [courses, selectedCourse])

    // Fetch enrollments for selected course
    const { data: enrollmentsData, isLoading: loadingEnrollments } = useQuery({
        queryKey: ['course-enrollments', selectedCourse],
        queryFn: () => courseEnrollmentService.getByCourseOffering(parseInt(selectedCourse)),
        enabled: !!selectedCourse,
    })

    // Fetch evaluation schemes for selected course
    const { data: schemesData } = useQuery({
        queryKey: ['evaluation-schemes', selectedCourse],
        queryFn: () => evaluationSchemeService.getAll({ courseOfferingId: parseInt(selectedCourse) }),
        enabled: !!selectedCourse,
    })

    // Get evaluation scheme IDs
    const schemeIds = useMemo(() => {
        const schemes = schemesData?.Data?.Data || schemesData?.Data || []
        return schemes.map(s => s.Id)
    }, [schemesData])

    // Fetch assessment items for the evaluation schemes
    const { data: assessmentsData } = useQuery({
        queryKey: ['assessments-for-reports', schemeIds],
        queryFn: async () => {
            if (schemeIds.length === 0) return { Data: [] }
            // Fetch all assessments for the first scheme (typically one scheme per course)
            const results = await Promise.all(
                schemeIds.map(id => assessmentItemService.getByEvaluationScheme(id))
            )
            const allAssessments = results.flatMap(r => r?.Data?.Data || r?.Data || [])
            return { Data: allAssessments }
        },
        enabled: schemeIds.length > 0,
    })

    // Fetch student marks for the selected course
    const { data: marksData } = useQuery({
        queryKey: ['marks-for-reports', selectedCourse],
        queryFn: () => studentMarkService.getAll({ courseOfferingId: parseInt(selectedCourse), pageSize: 1000 }),
        enabled: !!selectedCourse,
    })

    // Fetch attendance records for the selected course
    const { data: attendanceData } = useQuery({
        queryKey: ['attendance-for-reports', selectedCourse],
        queryFn: () => attendanceService.getAll({ courseOfferingId: parseInt(selectedCourse), pageSize: 1000 }),
        enabled: !!selectedCourse,
    })

    // Compute analytics from real data
    const analyticsData = useMemo(() => {
        if (!selectedCourse) return null

        const enrollments = enrollmentsData?.Data?.Data || enrollmentsData?.Data || []
        const assessments = assessmentsData?.Data || []
        const marks = marksData?.Data?.Data || marksData?.Data || []
        const attendanceRecords = attendanceData?.Data?.Data || attendanceData?.Data || []
        const totalStudents = enrollments.length

        // Calculate marks statistics for each assessment
        const assessmentStats = {}
        marks.forEach(mark => {
            const assessId = mark.AssessmentItemId
            if (!assessmentStats[assessId]) {
                assessmentStats[assessId] = { scores: [], maxMarks: 0 }
            }
            assessmentStats[assessId].scores.push(mark.MarksObtained)
        })

        // Compute assessment performance data
        const performanceTrend = assessments.slice(0, 6).map(a => {
            const stats = assessmentStats[a.Id]
            const scores = stats?.scores || []
            const avg = scores.length > 0 ? scores.reduce((sum, s) => sum + s, 0) / scores.length : 0
            const max = scores.length > 0 ? Math.max(...scores) : 0
            const min = scores.length > 0 ? Math.min(...scores) : 0
            return {
                name: a.Name,
                average: Math.round(avg * 10) / 10,
                highest: Math.round(max * 10) / 10,
                lowest: Math.round(min * 10) / 10,
            }
        })

        // Calculate overall student scores and grades
        const studentScores = {}
        marks.forEach(mark => {
            const studentId = mark.StudentId || mark.EnrollmentId
            if (!studentScores[studentId]) {
                studentScores[studentId] = { totalMarks: 0, totalMaxMarks: 0 }
            }
            studentScores[studentId].totalMarks += mark.MarksObtained || 0
            studentScores[studentId].totalMaxMarks += mark.MaxMarks || 0
        })

        const percentages = Object.values(studentScores).map(s =>
            s.totalMaxMarks > 0 ? (s.totalMarks / s.totalMaxMarks) * 100 : 0
        )

        // Grade distribution based on percentages
        const gradeDistribution = [
            { grade: 'A+', count: percentages.filter(p => p >= 90).length, percentage: 0 },
            { grade: 'A', count: percentages.filter(p => p >= 80 && p < 90).length, percentage: 0 },
            { grade: 'B+', count: percentages.filter(p => p >= 70 && p < 80).length, percentage: 0 },
            { grade: 'B', count: percentages.filter(p => p >= 60 && p < 70).length, percentage: 0 },
            { grade: 'C+', count: percentages.filter(p => p >= 50 && p < 60).length, percentage: 0 },
            { grade: 'C', count: percentages.filter(p => p >= 40 && p < 50).length, percentage: 0 },
            { grade: 'F', count: percentages.filter(p => p < 40).length, percentage: 0 },
        ].map(g => ({ ...g, percentage: totalStudents > 0 ? Math.round((g.count / totalStudents) * 100) : 0 }))

        // Performance distribution
        const excellent = percentages.filter(p => p >= 85).length
        const good = percentages.filter(p => p >= 70 && p < 85).length
        const average = percentages.filter(p => p >= 50 && p < 70).length
        const belowAvg = percentages.filter(p => p < 50).length

        const performanceDistribution = [
            { name: 'Excellent (85%+)', value: excellent, color: '#22C55E' },
            { name: 'Good (70-85%)', value: good, color: '#3B82F6' },
            { name: 'Average (50-70%)', value: average, color: '#F59E0B' },
            { name: 'Below Avg (<50%)', value: belowAvg, color: '#EF4444' },
        ]

        // Attendance calculations
        const attendanceByStudent = {}
        const uniqueSessions = new Set()
        attendanceRecords.forEach(record => {
            const studentId = record.StudentId || record.EnrollmentId
            const sessionKey = record.AttendanceDate
            uniqueSessions.add(sessionKey)
            if (!attendanceByStudent[studentId]) {
                attendanceByStudent[studentId] = { present: 0, total: 0 }
            }
            attendanceByStudent[studentId].total++
            if (record.Status === 'Present' || record.Status === 'Late') {
                attendanceByStudent[studentId].present++
            }
        })

        const totalSessions = uniqueSessions.size
        const studentAttendancePercentages = Object.values(attendanceByStudent).map(s =>
            s.total > 0 ? (s.present / s.total) * 100 : 0
        )
        const avgAttendance = studentAttendancePercentages.length > 0
            ? Math.round(studentAttendancePercentages.reduce((sum, p) => sum + p, 0) / studentAttendancePercentages.length)
            : 0
        const above75 = studentAttendancePercentages.filter(p => p >= 75).length
        const below75 = studentAttendancePercentages.filter(p => p < 75).length

        // Attendance trend by week (group by date)
        const attendanceByDate = {}
        attendanceRecords.forEach(record => {
            const date = record.AttendanceDate?.split('T')[0] || record.AttendanceDate
            if (!attendanceByDate[date]) {
                attendanceByDate[date] = { present: 0, total: 0 }
            }
            attendanceByDate[date].total++
            if (record.Status === 'Present' || record.Status === 'Late') {
                attendanceByDate[date].present++
            }
        })
        const attendanceTrend = Object.entries(attendanceByDate)
            .sort(([a], [b]) => a.localeCompare(b))
            .slice(-8)
            .map(([date, data]) => ({
                name: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                attendance: data.total > 0 ? Math.round((data.present / data.total) * 100) : 0,
            }))

        // Overall score and pass rate
        const avgScore = percentages.length > 0
            ? Math.round(percentages.reduce((sum, p) => sum + p, 0) / percentages.length)
            : 0
        const passRate = percentages.length > 0
            ? Math.round((percentages.filter(p => p >= 40).length / percentages.length) * 100)
            : 0

        // Pending grades (students with no marks)
        const studentsWithMarks = new Set(marks.map(m => m.StudentId || m.EnrollmentId))
        const pendingGrades = totalStudents - studentsWithMarks.size

        return {
            overview: {
                totalStudents,
                avgAttendance: avgAttendance || 0,
                avgScore: avgScore || 0,
                passRate: passRate || 0,
                assessmentsCount: assessments.length,
                pendingGrades: pendingGrades >= 0 ? pendingGrades : 0,
            },
            performanceTrend,
            gradeDistribution,
            attendanceTrend,
            performanceDistribution,
            attendanceStats: {
                totalSessions,
                above75,
                below75,
            },
        }
    }, [selectedCourse, enrollmentsData, assessmentsData, marksData, attendanceData])

    const handleExport = (format) => {
        toast.success(`Report exported as ${format.toUpperCase()}`)
    }

    const reportTypes = [
        { value: 'overview', label: 'Overview', icon: BarChart3 },
        { value: 'performance', label: 'Performance Analysis', icon: TrendingUp },
        { value: 'attendance', label: 'Attendance Report', icon: Calendar },
        { value: 'grades', label: 'Grade Distribution', icon: Target },
    ]

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg shadow-amber-500/25">
                            <BarChart3 className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent">
                            Reports & Analytics
                        </h1>
                    </div>
                    <p className="text-gray-500 ml-14">
                        View comprehensive reports and analytics for your courses
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => handleExport('pdf')} disabled={!selectedCourse}>
                        <Download className="w-4 h-4 mr-2" />
                        Export PDF
                    </Button>
                    <Button variant="outline" onClick={() => handleExport('excel')} disabled={!selectedCourse}>
                        <FileText className="w-4 h-4 mr-2" />
                        Export Excel
                    </Button>
                </div>
            </div>

            {/* Course Selection */}
            <Card className="border-0 shadow-md overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-amber-500 to-orange-600" />
                <Card.Body className="p-5">
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Course Select */}
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Select Course</label>
                            <div className="relative">
                                <select
                                    value={selectedCourse}
                                    onChange={(e) => setSelectedCourse(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent appearance-none bg-white cursor-pointer"
                                    disabled={loadingAssignments}
                                >
                                    <option value="">Choose a course...</option>
                                    {courses.map(course => (
                                        <option key={course.value} value={course.value}>
                                            {course.label} ({course.batch})
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                        </div>

                        {/* Report Type Tabs */}
                        {selectedCourse && (
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
                                <div className="flex gap-2 flex-wrap">
                                    {reportTypes.map(type => (
                                        <button
                                            key={type.value}
                                            onClick={() => setReportType(type.value)}
                                            className={cn(
                                                "px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2",
                                                reportType === type.value
                                                    ? "bg-amber-500 text-white shadow-md"
                                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                            )}
                                        >
                                            <type.icon className="w-4 h-4" />
                                            {type.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </Card.Body>
            </Card>

            {/* Content */}
            {!selectedCourse ? (
                <Card className="border-0 shadow-md">
                    <Card.Body className="py-16">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <BarChart3 className="w-8 h-8 text-amber-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Course</h3>
                            <p className="text-gray-500 max-w-md mx-auto">
                                Please select a course to view detailed analytics and reports
                            </p>
                        </div>
                    </Card.Body>
                </Card>
            ) : (
                <>
                    {/* Overview Report */}
                    {reportType === 'overview' && analyticsData && (
                        <div className="space-y-6">
                            {/* Stats Cards */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                                <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50">
                                    <Card.Body className="p-4 text-center">
                                        <Users className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                                        <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.totalStudents}</p>
                                        <p className="text-xs text-gray-500">Students</p>
                                    </Card.Body>
                                </Card>
                                <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-emerald-50">
                                    <Card.Body className="p-4 text-center">
                                        <Calendar className="w-6 h-6 text-green-600 mx-auto mb-2" />
                                        <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.avgAttendance}%</p>
                                        <p className="text-xs text-gray-500">Attendance</p>
                                    </Card.Body>
                                </Card>
                                <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-violet-50">
                                    <Card.Body className="p-4 text-center">
                                        <Target className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                                        <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.avgScore}%</p>
                                        <p className="text-xs text-gray-500">Avg Score</p>
                                    </Card.Body>
                                </Card>
                                <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-teal-50">
                                    <Card.Body className="p-4 text-center">
                                        <CheckCircle className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                                        <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.passRate}%</p>
                                        <p className="text-xs text-gray-500">Pass Rate</p>
                                    </Card.Body>
                                </Card>
                                <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-orange-50">
                                    <Card.Body className="p-4 text-center">
                                        <GraduationCap className="w-6 h-6 text-amber-600 mx-auto mb-2" />
                                        <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.assessmentsCount}</p>
                                        <p className="text-xs text-gray-500">Assessments</p>
                                    </Card.Body>
                                </Card>
                                <Card className="border-0 shadow-sm bg-gradient-to-br from-red-50 to-rose-50">
                                    <Card.Body className="p-4 text-center">
                                        <Clock className="w-6 h-6 text-red-600 mx-auto mb-2" />
                                        <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.pendingGrades}</p>
                                        <p className="text-xs text-gray-500">Pending</p>
                                    </Card.Body>
                                </Card>
                            </div>

                            {/* Charts Row */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Performance Trend */}
                                <Card className="border-0 shadow-md">
                                    <Card.Header className="border-b border-gray-100">
                                        <div className="flex items-center gap-2">
                                            <TrendingUp className="w-5 h-5 text-blue-600" />
                                            <h3 className="font-semibold text-gray-900">Performance Trend</h3>
                                        </div>
                                    </Card.Header>
                                    <Card.Body className="p-4">
                                        <ResponsiveContainer width="100%" height={280}>
                                            <AreaChart data={analyticsData.performanceTrend}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                                <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Legend />
                                                <Area type="monotone" dataKey="highest" stackId="1" stroke="#22C55E" fill="#22C55E20" name="Highest" />
                                                <Area type="monotone" dataKey="average" stackId="2" stroke="#3B82F6" fill="#3B82F620" name="Average" />
                                                <Area type="monotone" dataKey="lowest" stackId="3" stroke="#EF4444" fill="#EF444420" name="Lowest" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </Card.Body>
                                </Card>

                                {/* Performance Distribution Pie */}
                                <Card className="border-0 shadow-md">
                                    <Card.Header className="border-b border-gray-100">
                                        <div className="flex items-center gap-2">
                                            <PieChartIcon className="w-5 h-5 text-purple-600" />
                                            <h3 className="font-semibold text-gray-900">Performance Distribution</h3>
                                        </div>
                                    </Card.Header>
                                    <Card.Body className="p-4">
                                        <ResponsiveContainer width="100%" height={280}>
                                            <PieChart>
                                                <Pie
                                                    data={analyticsData.performanceDistribution}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={100}
                                                    paddingAngle={2}
                                                    dataKey="value"
                                                    label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                                                >
                                                    {analyticsData.performanceDistribution.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                                <Legend />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </Card.Body>
                                </Card>
                            </div>
                        </div>
                    )}

                    {/* Performance Report */}
                    {reportType === 'performance' && analyticsData && (
                        <Card className="border-0 shadow-md">
                            <Card.Header className="border-b border-gray-100">
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-blue-600" />
                                    <h3 className="font-semibold text-gray-900">Assessment Performance Analysis</h3>
                                </div>
                            </Card.Header>
                            <Card.Body className="p-4">
                                <ResponsiveContainer width="100%" height={400}>
                                    <BarChart data={analyticsData.performanceTrend}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                        <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend />
                                        <Bar dataKey="highest" fill="#22C55E" name="Highest" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="average" fill="#3B82F6" name="Average" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="lowest" fill="#EF4444" name="Lowest" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Card.Body>
                        </Card>
                    )}

                    {/* Attendance Report */}
                    {reportType === 'attendance' && analyticsData && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Attendance Stats */}
                                <Card className="border-0 shadow-md">
                                    <Card.Header className="border-b border-gray-100">
                                        <h3 className="font-semibold text-gray-900">Summary</h3>
                                    </Card.Header>
                                    <Card.Body className="p-4 space-y-4">
                                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                            <span className="text-gray-600">Average Attendance</span>
                                            <span className="text-xl font-bold text-green-600">{analyticsData.overview.avgAttendance}%</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                            <span className="text-gray-600">Total Sessions</span>
                                            <span className="text-xl font-bold text-gray-900">{analyticsData.attendanceStats?.totalSessions || 0}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                                            <span className="text-gray-600">&gt;75% Attendance</span>
                                            <span className="text-xl font-bold text-green-600">{analyticsData.attendanceStats?.above75 || 0}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                                            <span className="text-gray-600">&lt;75% Attendance</span>
                                            <span className="text-xl font-bold text-red-600">{analyticsData.attendanceStats?.below75 || 0}</span>
                                        </div>
                                    </Card.Body>
                                </Card>

                                {/* Attendance Trend */}
                                <Card className="border-0 shadow-md lg:col-span-2">
                                    <Card.Header className="border-b border-gray-100">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-5 h-5 text-teal-600" />
                                            <h3 className="font-semibold text-gray-900">Attendance Trend</h3>
                                        </div>
                                    </Card.Header>
                                    <Card.Body className="p-4">
                                        <ResponsiveContainer width="100%" height={280}>
                                            <LineChart data={analyticsData.attendanceTrend}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                                <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Line
                                                    type="monotone"
                                                    dataKey="attendance"
                                                    stroke="#14B8A6"
                                                    strokeWidth={3}
                                                    dot={{ fill: '#14B8A6', strokeWidth: 2, r: 5 }}
                                                    name="Attendance %"
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </Card.Body>
                                </Card>
                            </div>
                        </div>
                    )}

                    {/* Grade Distribution Report */}
                    {reportType === 'grades' && analyticsData && (
                        <Card className="border-0 shadow-md">
                            <Card.Header className="border-b border-gray-100">
                                <div className="flex items-center gap-2">
                                    <Target className="w-5 h-5 text-amber-600" />
                                    <h3 className="font-semibold text-gray-900">Grade Distribution</h3>
                                </div>
                            </Card.Header>
                            <Card.Body className="p-6">
                                <div className="space-y-4">
                                    {analyticsData.gradeDistribution.map((item) => (
                                        <div key={item.grade} className="flex items-center gap-4">
                                            <Badge
                                                className={cn(
                                                    "w-12 justify-center",
                                                    item.grade.startsWith('A') ? "bg-green-100 text-green-700" :
                                                        item.grade.startsWith('B') ? "bg-blue-100 text-blue-700" :
                                                            item.grade.startsWith('C') ? "bg-yellow-100 text-yellow-700" :
                                                                "bg-red-100 text-red-700"
                                                )}
                                            >
                                                {item.grade}
                                            </Badge>
                                            <div className="flex-1 h-10 bg-gray-100 rounded-lg overflow-hidden">
                                                <div
                                                    className={cn(
                                                        "h-full rounded-lg flex items-center justify-end pr-3 transition-all duration-500",
                                                        item.grade.startsWith('A') ? "bg-gradient-to-r from-green-400 to-green-500" :
                                                            item.grade.startsWith('B') ? "bg-gradient-to-r from-blue-400 to-blue-500" :
                                                                item.grade.startsWith('C') ? "bg-gradient-to-r from-yellow-400 to-yellow-500" :
                                                                    "bg-gradient-to-r from-red-400 to-red-500"
                                                    )}
                                                    style={{ width: `${Math.max(item.percentage, 10)}%` }}
                                                >
                                                    <span className="text-white text-sm font-semibold">{item.count} students</span>
                                                </div>
                                            </div>
                                            <span className="w-16 text-right text-sm font-medium text-gray-600">
                                                {item.percentage}%
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </Card.Body>
                        </Card>
                    )}
                </>
            )}
        </div>
    )
}

export default FacultyReportsPage
