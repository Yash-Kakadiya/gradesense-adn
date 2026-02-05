import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { PageHeader } from '@/components/layout'
import { Card, Badge, StatCard } from '@/components/common'
import { useAuth } from '@/context/AuthContext'
import { dashboardService } from '@/services/dashboardService'
import { ROUTES } from '@/utils/constants'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts'
import {
    BookOpen,
    Users,
    ClipboardCheck,
    Calendar,
    TrendingUp,
    AlertTriangle,
    ChevronRight,
    Loader2,
    BarChart3,
    Clock,
    RefreshCw,
    AlertCircle,
    Target,
} from 'lucide-react'

const FacultyDashboard = () => {
    const navigate = useNavigate()
    const { user } = useAuth()

    // Fetch faculty dashboard data from unified API
    const { data: dashboard, isLoading, refetch } = useQuery({
        queryKey: ['faculty-dashboard', user?.id],
        queryFn: () => dashboardService.getFacultyDashboard(user?.id),
        enabled: !!user?.id,
        staleTime: 30000,
    })

    // Extract data from API response
    const data = dashboard?.Data || dashboard || {}
    const currentCourses = data.CurrentCourses || []
    const pendingGradeItems = data.PendingGradeItems || []
    const atRiskStudents = data.AtRiskStudents || []
    const studentPerformance = data.StudentPerformance || {}

    // Prepare chart data from courses
    const courseStatsData = currentCourses.map(course => ({
        name: course.SubjectCode || course.SubjectName?.substring(0, 6),
        students: course.EnrolledStudents || 0,
        avgScore: course.AverageScore || 0,
        pending: course.PendingGrades || 0,
    }))

    // Student performance distribution (from API)
    const performanceDistribution = [
        { name: 'Excellent (≥80%)', value: studentPerformance.ExcellentCount || 0, color: '#10b981' },
        { name: 'Good (60-79%)', value: studentPerformance.GoodCount || 0, color: '#3b82f6' },
        { name: 'Average (40-59%)', value: studentPerformance.AverageCount || 0, color: '#f59e0b' },
        { name: 'Poor (<40%)', value: studentPerformance.PoorCount || 0, color: '#ef4444' },
    ].filter(item => item.value > 0)

    const stats = [
        {
            title: 'My Courses',
            value: data.ActiveCourses || 0,
            subtitle: `${data.TotalCoursesTeaching || 0} total assigned`,
            icon: BookOpen,
            color: 'blue',
            loading: isLoading,
            onClick: () => navigate(ROUTES.FACULTY_COURSES),
        },
        {
            title: 'Total Students',
            value: data.TotalStudentsEnrolled || 0,
            subtitle: 'across all courses',
            icon: Users,
            color: 'green',
            loading: isLoading,
            onClick: () => navigate(ROUTES.FACULTY_COURSES),
        },
        {
            title: 'Pending Grades',
            value: data.PendingGrades || 0,
            subtitle: 'assessments to grade',
            icon: ClipboardCheck,
            color: data.PendingGrades > 0 ? 'orange' : 'purple',
            loading: isLoading,
            onClick: () => navigate(ROUTES.FACULTY_GRADES),
        },
        {
            title: 'At-Risk Students',
            value: atRiskStudents.length,
            subtitle: 'need attention',
            icon: AlertTriangle,
            color: atRiskStudents.length > 0 ? 'red' : 'green',
            loading: isLoading,
            onClick: () => { },
        },
    ]

    return (
        <div className="space-y-6">
            <PageHeader
                title={`Welcome, ${data.FullName || user?.fullName || 'Faculty'}`}
                description={`${data.DepartmentName || ''} • ${data.Designation || ''}`}
                actions={
                    <button
                        onClick={() => refetch()}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                }
            />

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                    <StatCard key={index} {...stat} />
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Course Statistics Bar Chart */}
                <Card className="lg:col-span-2 border-0 shadow-md">
                    <Card.Header className="border-b bg-gray-50/50">
                        <Card.Title className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-blue-100">
                                <BarChart3 className="w-4 h-4 text-blue-600" />
                            </div>
                            Course Statistics
                        </Card.Title>
                    </Card.Header>
                    <Card.Body>
                        {isLoading ? (
                            <div className="h-64 flex items-center justify-center">
                                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                            </div>
                        ) : courseStatsData.length === 0 ? (
                            <div className="h-64 flex items-center justify-center text-gray-500">
                                <div className="text-center">
                                    <BookOpen className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                    <p>No course data available</p>
                                </div>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height={280}>
                                <BarChart data={courseStatsData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                    <YAxis tick={{ fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                                    />
                                    <Legend />
                                    <Bar dataKey="students" name="Students" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="avgScore" name="Avg Score %" fill="#10b981" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="pending" name="Pending Grades" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </Card.Body>
                </Card>

                {/* Student Performance Distribution Pie Chart */}
                <Card className="border-0 shadow-md">
                    <Card.Header className="border-b bg-gray-50/50">
                        <Card.Title className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-emerald-100">
                                <Target className="w-4 h-4 text-emerald-600" />
                            </div>
                            Student Performance
                        </Card.Title>
                    </Card.Header>
                    <Card.Body>
                        {isLoading ? (
                            <div className="h-64 flex items-center justify-center">
                                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                            </div>
                        ) : performanceDistribution.length === 0 ? (
                            <div className="h-64 flex items-center justify-center text-gray-500">
                                <div className="text-center">
                                    <Target className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                    <p>No performance data</p>
                                </div>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height={280}>
                                <PieChart>
                                    <Pie
                                        data={performanceDistribution}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                        label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                                    >
                                        {performanceDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </Card.Body>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* My Courses */}
                <Card className="lg:col-span-2 border-0 shadow-md">
                    <Card.Header className="border-b bg-gray-50/50">
                        <div className="flex items-center justify-between">
                            <Card.Title className="flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-blue-600" />
                                My Courses
                            </Card.Title>
                            <button
                                onClick={() => navigate(ROUTES.FACULTY_COURSES)}
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
                                <p>No courses assigned yet</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {currentCourses.slice(0, 5).map((course, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-4 hover:bg-gray-50/50 transition-colors cursor-pointer"
                                        onClick={() => navigate(`${ROUTES.FACULTY_COURSES}/${course.CourseOfferingId}`)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                                                <BookOpen className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{course.SubjectName}</p>
                                                <p className="text-sm text-gray-500">{course.SubjectCode} • {course.BatchName}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Badge variant="info">
                                                <Users className="w-3 h-3 mr-1" />
                                                {course.EnrolledStudents || 0}
                                            </Badge>
                                            {course.PendingGrades > 0 && (
                                                <Badge variant="warning">
                                                    {course.PendingGrades} pending
                                                </Badge>
                                            )}
                                            <span className="text-sm text-gray-500">
                                                Avg: {course.AverageScore?.toFixed(1) || 0}%
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card.Body>
                </Card>

                {/* Sidebar: Pending Grades & At-Risk Students */}
                <div className="space-y-6">
                    {/* Pending Grade Items */}
                    <Card className="border-0 shadow-md">
                        <Card.Header className="border-b bg-gray-50/50">
                            <div className="flex items-center justify-between">
                                <Card.Title className="flex items-center gap-2">
                                    <ClipboardCheck className="w-5 h-5 text-orange-600" />
                                    Pending Grades
                                </Card.Title>
                                <button
                                    onClick={() => navigate(ROUTES.FACULTY_GRADES)}
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
                            ) : pendingGradeItems.length === 0 ? (
                                <div className="text-center py-6 text-gray-500">
                                    <ClipboardCheck className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                                    <p className="text-sm">All grades submitted!</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {pendingGradeItems.slice(0, 4).map((item, index) => (
                                        <div key={index} className="p-3 hover:bg-gray-50/50 transition-colors">
                                            <div className="flex items-center justify-between">
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-medium text-gray-900 truncate">{item.AssessmentName}</p>
                                                    <p className="text-xs text-gray-500">{item.SubjectName} • {item.BatchName}</p>
                                                </div>
                                                <Badge variant="warning">
                                                    {item.PendingCount}/{item.TotalStudents}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card.Body>
                    </Card>

                    {/* At-Risk Students */}
                    {atRiskStudents.length > 0 && (
                        <Card className="border-0 shadow-md border-l-4 border-l-red-500">
                            <Card.Header className="border-b bg-red-50/50">
                                <Card.Title className="flex items-center gap-2 text-red-700">
                                    <AlertTriangle className="w-5 h-5" />
                                    At-Risk Students
                                </Card.Title>
                            </Card.Header>
                            <Card.Body className="p-0">
                                <div className="divide-y divide-gray-100">
                                    {atRiskStudents.slice(0, 4).map((student, index) => (
                                        <div key={index} className="p-3 hover:bg-gray-50/50 transition-colors">
                                            <div className="flex items-center justify-between">
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-medium text-gray-900">{student.StudentName}</p>
                                                    <p className="text-xs text-gray-500">{student.EnrollmentNumber} • {student.SubjectName}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs text-red-600 font-medium">{student.RiskReason}</p>
                                                    <p className="text-xs text-gray-400">
                                                        {student.CurrentScore !== null ? `${student.CurrentScore?.toFixed(1)}%` : '-'} | {student.AttendancePercentage?.toFixed(1)}%
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card.Body>
                        </Card>
                    )}

                    {/* Quick Actions */}
                    <Card className="border-0 shadow-md">
                        <Card.Header className="border-b bg-gray-50/50">
                            <Card.Title className="flex items-center gap-2">
                                <Clock className="w-5 h-5 text-purple-600" />
                                Quick Actions
                            </Card.Title>
                        </Card.Header>
                        <Card.Body className="space-y-2">
                            <button
                                onClick={() => navigate(ROUTES.FACULTY_GRADES)}
                                className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:bg-blue-50 hover:border-blue-200 transition-all group"
                            >
                                <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                                    <ClipboardCheck className="w-4 h-4 text-blue-600" />
                                </div>
                                <span className="text-sm font-medium text-gray-700">Enter Grades</span>
                                <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />
                            </button>

                            <button
                                onClick={() => navigate(ROUTES.FACULTY_ATTENDANCE)}
                                className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:bg-emerald-50 hover:border-emerald-200 transition-all group"
                            >
                                <div className="p-2 bg-emerald-100 rounded-lg group-hover:bg-emerald-200 transition-colors">
                                    <Calendar className="w-4 h-4 text-emerald-600" />
                                </div>
                                <span className="text-sm font-medium text-gray-700">Mark Attendance</span>
                                <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />
                            </button>

                            <button
                                onClick={() => navigate(ROUTES.FACULTY_REPORTS)}
                                className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:bg-purple-50 hover:border-purple-200 transition-all group"
                            >
                                <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                                    <BarChart3 className="w-4 h-4 text-purple-600" />
                                </div>
                                <span className="text-sm font-medium text-gray-700">View Reports</span>
                                <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />
                            </button>
                        </Card.Body>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default FacultyDashboard
