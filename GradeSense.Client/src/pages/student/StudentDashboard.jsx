import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { PageHeader } from '@/components/layout'
import { Card, Badge, StatCard } from '@/components/common'
import { useAuth } from '@/context/AuthContext'
import { dashboardService } from '@/services/dashboardService'
import { courseEnrollmentService } from '@/services/courseEnrollmentService'
import { assessmentItemService } from '@/services/assessmentItemService'
import { ROUTES } from '@/utils/constants'
import { formatDate } from '@/utils/helpers'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, RadialBarChart, RadialBar, Legend, LineChart, Line, Area, AreaChart
} from 'recharts'
import {
    BookOpen,
    ClipboardCheck,
    Calendar,
    TrendingUp,
    Award,
    ChevronRight,
    Loader2,
    User,
    GraduationCap,
    BarChart3,
    AlertTriangle,
    RefreshCw,
    Target,
    Clock,
    FileText,
    Activity,
    PieChart as PieIcon,
} from 'lucide-react'

const StudentDashboard = () => {
    const navigate = useNavigate()
    const { user } = useAuth()

    // Fetch student dashboard data from unified API
    const { data: dashboard, isLoading, refetch } = useQuery({
        queryKey: ['student-dashboard', user?.id],
        queryFn: () => dashboardService.getStudentDashboard(user?.id),
        enabled: !!user?.id,
        staleTime: 30000,
    })

    // Fetch student's enrolled courses for assessments
    const { data: enrollmentsData } = useQuery({
        queryKey: ['student-enrollments-dashboard', user?.id],
        queryFn: () => courseEnrollmentService.getByStudent(user?.id),
        enabled: !!user?.id,
    })

    const enrollments = enrollmentsData?.Data?.Data || enrollmentsData?.Data || []
    const courseOfferingIds = enrollments.map(e => e.CourseOfferingId || e.Id).filter(Boolean)

    // Fetch assessments for enrolled courses
    const { data: assessmentsData, isLoading: loadingAssessments } = useQuery({
        queryKey: ['student-assessments', courseOfferingIds],
        queryFn: () => assessmentItemService.getUpcomingForStudent(courseOfferingIds),
        enabled: courseOfferingIds.length > 0,
    })

    const assessments = assessmentsData?.Data?.Data || []

    // Extract data from API response
    const data = dashboard?.Data || dashboard || {}
    const currentCourses = data.CurrentCourses || []
    const recentGrades = data.RecentGrades || []
    const gradeTrend = data.GradeTrend || []
    const subjectPerformances = data.SubjectPerformances || []
    const courseAttendances = data.CourseAttendances || []

    // Prepare chart data from courses
    const coursePerformanceData = currentCourses.map(course => ({
        name: course.SubjectCode || course.SubjectName?.substring(0, 6),
        score: course.CurrentScore || 0,
        attendance: course.AttendancePercentage || 0,
    }))

    // Grade trend line chart data
    const gradeTrendData = gradeTrend.map((item, index) => ({
        name: item.Date || `A${index + 1}`,
        percentage: item.Percentage || 0,
        subject: item.SubjectCode || '',
        assessment: item.AssessmentName || '',
    }))

    // Subject performance data for bar chart
    const subjectPerformanceData = subjectPerformances.map(sp => ({
        name: sp.SubjectCode || sp.SubjectName?.substring(0, 6),
        score: sp.Percentage || 0,
        fullName: sp.SubjectName,
        assessments: sp.AssessmentCount,
    }))

    // Course attendance breakdown
    const courseAttendanceData = courseAttendances.map(ca => ({
        name: ca.SubjectCode || ca.SubjectName?.substring(0, 6),
        present: ca.Present || 0,
        absent: ca.Absent || 0,
        late: ca.Late || 0,
        percentage: ca.Percentage || 0,
        total: ca.TotalClasses || 0,
    }))

    // Attendance distribution
    const attendanceData = [
        { name: 'Present', value: data.TotalClassesAttended || 0, color: '#10b981' },
        { name: 'Absent', value: Math.max(0, (data.TotalClassesMissed || 0)), color: '#ef4444' },
    ].filter(item => item.value > 0)

    // Colors for charts
    const CHART_COLORS = {
        primary: '#3b82f6',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        purple: '#8b5cf6',
        pink: '#ec4899',
        gradient: ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'],
    }

    const getGradeBadgeColor = (grade) => {
        if (!grade || grade === '-') return 'default'
        if (grade.startsWith('A')) return 'success'
        if (grade.startsWith('B')) return 'primary'
        if (grade.startsWith('C')) return 'warning'
        return 'danger'
    }

    const getAttendanceColor = (attendance) => {
        if (attendance >= 90) return 'text-emerald-600'
        if (attendance >= 75) return 'text-yellow-600'
        return 'text-red-600'
    }

    const getRiskBadge = (riskStatus) => {
        if (!riskStatus) return null
        const variants = {
            'Safe': 'success',
            'High-Achiever': 'primary',
            'Needs-Attention': 'warning',
            'At-Risk': 'danger',
        }
        return <Badge variant={variants[riskStatus] || 'default'}>{riskStatus}</Badge>
    }

    const stats = [
        {
            title: 'Enrolled Courses',
            value: data.TotalEnrolledCourses || 0,
            subtitle: `${data.ActiveCourses || 0} active`,
            icon: BookOpen,
            color: 'blue',
            loading: isLoading,
            onClick: () => navigate(ROUTES.STUDENT_COURSES),
        },
        {
            title: 'CGPA',
            value: data.CGPA?.toFixed(2) || '-',
            subtitle: `${data.TotalCreditsEarned || 0} credits earned`,
            icon: Award,
            color: 'green',
            loading: isLoading,
            onClick: () => navigate(ROUTES.STUDENT_GRADES),
        },
        {
            title: 'Attendance',
            value: `${data.OverallAttendancePercentage || 0}%`,
            subtitle: `${data.TotalClassesAttended || 0} present`,
            icon: Calendar,
            color: data.OverallAttendancePercentage >= 75 ? 'purple' : 'red',
            loading: isLoading,
            onClick: () => navigate(ROUTES.STUDENT_ATTENDANCE),
        },
        {
            title: 'Profile',
            value: 'View',
            subtitle: data.EnrollmentNumber || '',
            icon: User,
            color: 'orange',
            loading: isLoading,
            onClick: () => navigate(ROUTES.STUDENT_PROFILE),
        },
    ]

    return (
        <div className="space-y-6">
            <PageHeader
                title={`Welcome, ${data.FullName || user?.fullName || 'Student'}`}
                description={`${data.DepartmentName || ''} • Semester ${data.CurrentSemester || '-'}`}
                actions={
                    <div className="flex items-center gap-3">
                        {data.RiskStatus && getRiskBadge(data.RiskStatus)}
                        <button
                            onClick={() => refetch()}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                    </div>
                }
            />

            {/* Risk Alert if applicable */}
            {data.RiskStatus === 'At-Risk' && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                    <div>
                        <p className="font-medium text-red-800">Attention Required</p>
                        <p className="text-sm text-red-600 mt-1">
                            Your academic performance needs attention. Please review your grades and attendance.
                        </p>
                        {data.Recommendations?.length > 0 && (
                            <ul className="mt-2 space-y-1">
                                {data.Recommendations.map((rec, i) => (
                                    <li key={i} className="text-sm text-red-600 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                                        {rec}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                    <StatCard key={index} {...stat} />
                ))}
            </div>

            {/* Grade Trend Line Chart - Full Width */}
            {gradeTrendData.length > 0 && (
                <Card className="border-0 shadow-md overflow-hidden">
                    <Card.Header className="border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                        <Card.Title className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-blue-100">
                                <Activity className="w-4 h-4 text-blue-600" />
                            </div>
                            Grade Trend
                            <Badge variant="info" className="ml-2 text-xs">Last {gradeTrendData.length} assessments</Badge>
                        </Card.Title>
                    </Card.Header>
                    <Card.Body>
                        <ResponsiveContainer width="100%" height={280}>
                            <AreaChart data={gradeTrendData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                <defs>
                                    <linearGradient id="colorGrade" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                                <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                                <Tooltip
                                    content={({ active, payload, label }) => {
                                        if (active && payload && payload.length) {
                                            const data = payload[0].payload
                                            return (
                                                <div className="bg-white px-4 py-3 rounded-xl shadow-xl border border-gray-100">
                                                    <p className="text-xs text-gray-500">{data.subject}</p>
                                                    <p className="text-sm font-semibold text-gray-800">{data.assessment}</p>
                                                    <p className="text-lg font-bold text-blue-600">{data.percentage}%</p>
                                                </div>
                                            )
                                        }
                                        return null
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="percentage"
                                    stroke="#3b82f6"
                                    strokeWidth={2}
                                    fill="url(#colorGrade)"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="percentage"
                                    stroke="#3b82f6"
                                    strokeWidth={2}
                                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                                    activeDot={{ r: 6, fill: '#3b82f6' }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Card.Body>
                </Card>
            )}

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Subject Performance Bar Chart */}
                <Card className="lg:col-span-2 border-0 shadow-md">
                    <Card.Header className="border-b bg-gray-50/50">
                        <Card.Title className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-emerald-100">
                                <BarChart3 className="w-4 h-4 text-emerald-600" />
                            </div>
                            Subject Performance
                        </Card.Title>
                    </Card.Header>
                    <Card.Body>
                        {isLoading ? (
                            <div className="h-64 flex items-center justify-center">
                                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                            </div>
                        ) : subjectPerformanceData.length === 0 ? (
                            <div className="h-64 flex items-center justify-center text-gray-500">
                                <div className="text-center">
                                    <BarChart3 className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                    <p>No performance data available</p>
                                </div>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height={280}>
                                <BarChart data={subjectPerformanceData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                    <defs>
                                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.9} />
                                            <stop offset="95%" stopColor="#059669" stopOpacity={0.9} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                    <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                                    <Tooltip
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                const data = payload[0].payload
                                                return (
                                                    <div className="bg-white px-4 py-3 rounded-xl shadow-xl border border-gray-100">
                                                        <p className="text-sm font-semibold text-gray-800">{data.fullName}</p>
                                                        <p className="text-lg font-bold text-emerald-600">{data.score}%</p>
                                                        <p className="text-xs text-gray-500">{data.assessments} assessments</p>
                                                    </div>
                                                )
                                            }
                                            return null
                                        }}
                                    />
                                    <Bar dataKey="score" name="Score" fill="url(#colorScore)" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </Card.Body>
                </Card>

                {/* Attendance Distribution Pie Chart */}
                <Card className="border-0 shadow-md">
                    <Card.Header className="border-b bg-gray-50/50">
                        <Card.Title className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-purple-100">
                                <PieIcon className="w-4 h-4 text-purple-600" />
                            </div>
                            Attendance Overview
                        </Card.Title>
                    </Card.Header>
                    <Card.Body>
                        {isLoading ? (
                            <div className="h-64 flex items-center justify-center">
                                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                            </div>
                        ) : attendanceData.length === 0 ? (
                            <div className="h-64 flex items-center justify-center text-gray-500">
                                <div className="text-center">
                                    <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                    <p>No attendance data</p>
                                </div>
                            </div>
                        ) : (
                            <div className="relative">
                                <ResponsiveContainer width="100%" height={220}>
                                    <PieChart>
                                        <Pie
                                            data={attendanceData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={55}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {attendanceData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                                {/* Center text */}
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ marginTop: '-30px' }}>
                                    <div className="text-center">
                                        <p className="text-3xl font-bold text-gray-900">{data.OverallAttendancePercentage || 0}%</p>
                                        <p className="text-xs text-gray-500">Overall</p>
                                    </div>
                                </div>
                                {/* Legend */}
                                <div className="flex justify-center gap-6 mt-2">
                                    {attendanceData.map((entry, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                                            <span className="text-sm text-gray-600">{entry.name}: {entry.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </Card.Body>
                </Card>
            </div>

            {/* Course Attendance Breakdown - New Section */}
            {courseAttendanceData.length > 0 && (
                <Card className="border-0 shadow-md">
                    <Card.Header className="border-b bg-gradient-to-r from-purple-50 to-pink-50">
                        <Card.Title className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-purple-100">
                                <Calendar className="w-4 h-4 text-purple-600" />
                            </div>
                            Attendance by Subject
                        </Card.Title>
                    </Card.Header>
                    <Card.Body>
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={courseAttendanceData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            const data = payload[0].payload
                                            return (
                                                <div className="bg-white px-4 py-3 rounded-xl shadow-xl border border-gray-100">
                                                    <p className="text-sm font-semibold text-gray-800 mb-2">{data.name}</p>
                                                    <div className="space-y-1 text-xs">
                                                        <p className="text-emerald-600">Present: {data.present}</p>
                                                        <p className="text-red-600">Absent: {data.absent}</p>
                                                        <p className="text-amber-600">Late: {data.late}</p>
                                                        <p className="text-gray-500 mt-1">Total: {data.total} classes</p>
                                                        <p className="text-lg font-bold text-purple-600 mt-1">{data.percentage}%</p>
                                                    </div>
                                                </div>
                                            )
                                        }
                                        return null
                                    }}
                                />
                                <Legend />
                                <Bar dataKey="present" name="Present" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
                                <Bar dataKey="late" name="Late" stackId="a" fill="#f59e0b" radius={[0, 0, 0, 0]} />
                                <Bar dataKey="absent" name="Absent" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card.Body>
                </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Current Courses */}
                <Card className="lg:col-span-2 border-0 shadow-md">
                    <Card.Header className="border-b bg-gray-50/50">
                        <div className="flex items-center justify-between">
                            <Card.Title className="flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-blue-600" />
                                Current Courses
                            </Card.Title>
                            <button
                                onClick={() => navigate(ROUTES.STUDENT_COURSES)}
                                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                            >
                                View All <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </Card.Header>
                    <Card.Body className="p-0">
                        {isLoading ? (
                            <div className="flex items-center justify-center p-8">
                                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                            </div>
                        ) : currentCourses.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <BookOpen className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                <p>No active courses</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Score</th>
                                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Attendance</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {currentCourses.slice(0, 6).map((course, index) => (
                                            <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                                                            <BookOpen className="w-4 h-4 text-blue-600" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-900">{course.SubjectName}</p>
                                                            <p className="text-sm text-gray-500">{course.SubjectCode} • {course.FacultyName}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    {course.CurrentScore !== null && course.CurrentScore !== undefined ? (
                                                        <span className={`font-semibold ${course.CurrentScore >= 60 ? 'text-emerald-600' : course.CurrentScore >= 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                                                            {course.CurrentScore.toFixed(1)}%
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400">-</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </Card.Body>
                </Card>

                {/* Recent Grades & Quick Access */}
                <div className="space-y-6">
                    {/* Recent Grades */}
                    <Card className="border-0 shadow-md">
                        <Card.Header className="border-b bg-gray-50/50">
                            <div className="flex items-center justify-between">
                                <Card.Title className="flex items-center gap-2">
                                    <Award className="w-5 h-5 text-emerald-600" />
                                    Recent Grades
                                </Card.Title>
                                <button
                                    onClick={() => navigate(ROUTES.STUDENT_GRADES)}
                                    className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                                >
                                    View All <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </Card.Header>
                        <Card.Body className="p-0">
                            {isLoading ? (
                                <div className="flex items-center justify-center p-6">
                                    <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                                </div>
                            ) : recentGrades.length === 0 ? (
                                <div className="text-center py-6 text-gray-500">
                                    <ClipboardCheck className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                                    <p className="text-sm">No grades yet</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {recentGrades.slice(0, 5).map((grade, index) => (
                                        <div key={index} className="p-3 hover:bg-gray-50/50 transition-colors">
                                            <div className="flex items-center justify-between">
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-medium text-gray-900 truncate">{grade.AssessmentName}</p>
                                                    <p className="text-xs text-gray-500">{grade.SubjectName}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className={`font-semibold ${grade.Percentage >= 60 ? 'text-emerald-600' : grade.Percentage >= 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                                                        {grade.ObtainedMarks}/{grade.MaxMarks}
                                                    </p>
                                                    <p className="text-xs text-gray-400">
                                                        {grade.GradedDate && formatDate(grade.GradedDate, 'short')}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card.Body>
                    </Card>

                    {/* Upcoming Assessments */}
                    <Card className="border-0 shadow-md">
                        <Card.Header className="border-b bg-gray-50/50">
                            <Card.Title className="flex items-center gap-2">
                                <Clock className="w-5 h-5 text-blue-600" />
                                Upcoming Assessments
                            </Card.Title>
                        </Card.Header>
                        <Card.Body className="p-0">
                            {loadingAssessments ? (
                                <div className="flex items-center justify-center p-6">
                                    <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                                </div>
                            ) : assessments.length === 0 ? (
                                <div className="text-center py-6 text-gray-500">
                                    <FileText className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                                    <p className="text-sm">No upcoming assessments</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {assessments.slice(0, 5).map((assessment, index) => (
                                        <div key={index} className="p-3 hover:bg-gray-50/50 transition-colors">
                                            <div className="flex items-center justify-between">
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-medium text-gray-900 truncate">{assessment.Name}</p>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <Badge variant="info" className="text-xs">
                                                            {assessment.SubjectCode || assessment.SubjectName}
                                                        </Badge>
                                                        <span className="text-xs text-gray-400">{assessment.MaxMarks} marks</span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <Badge variant={assessment.Weightage >= 30 ? 'warning' : 'default'}>
                                                        {assessment.Weightage}%
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card.Body>
                    </Card>

                    {/* Quick Actions */}
                    <Card className="border-0 shadow-md">
                        <Card.Header className="border-b bg-gray-50/50">
                            <Card.Title className="flex items-center gap-2">
                                <GraduationCap className="w-5 h-5 text-purple-600" />
                                Quick Access
                            </Card.Title>
                        </Card.Header>
                        <Card.Body className="space-y-2">
                            <button
                                onClick={() => navigate(ROUTES.STUDENT_GRADES)}
                                className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:bg-emerald-50 hover:border-emerald-200 transition-all group"
                            >
                                <div className="p-2 bg-emerald-100 rounded-lg group-hover:bg-emerald-200 transition-colors">
                                    <Award className="w-4 h-4 text-emerald-600" />
                                </div>
                                <span className="text-sm font-medium text-gray-700">View All Grades</span>
                                <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />
                            </button>

                            <button
                                onClick={() => navigate(ROUTES.STUDENT_ATTENDANCE)}
                                className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:bg-purple-50 hover:border-purple-200 transition-all group"
                            >
                                <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                                    <Calendar className="w-4 h-4 text-purple-600" />
                                </div>
                                <span className="text-sm font-medium text-gray-700">Attendance Records</span>
                                <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />
                            </button>

                            <button
                                onClick={() => navigate(ROUTES.STUDENT_PROFILE)}
                                className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:bg-orange-50 hover:border-orange-200 transition-all group"
                            >
                                <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                                    <User className="w-4 h-4 text-orange-600" />
                                </div>
                                <span className="text-sm font-medium text-gray-700">My Profile</span>
                                <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />
                            </button>
                        </Card.Body>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default StudentDashboard
