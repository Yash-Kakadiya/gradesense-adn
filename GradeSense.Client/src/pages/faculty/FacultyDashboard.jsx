import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Card, Badge, MiniStat } from '@/components/common'
import { useAuth } from '@/context/AuthContext'
import { dashboardService } from '@/services/dashboardService'
import { ROUTES } from '@/utils/constants'
import { formatDate, cn } from '@/utils/helpers'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts'
import {
    BookOpen,
    ClipboardCheck,
    Calendar,
    AlertTriangle,
    ChevronRight,
    Loader2,
    TrendingUp,
    Clock,
    ArrowUpRight,
    Eye,
    RefreshCcw,
    GraduationCap,
    Target,
    FileText,
    CheckCircle,
    Briefcase,
} from 'lucide-react'

// Custom Tooltip for charts
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/95 backdrop-blur-sm px-4 py-3 rounded-xl shadow-xl border border-gray-100">
                <p className="text-sm font-semibold text-gray-900 mb-2">{label}</p>
                {payload.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                        <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-gray-600">{entry.name}:</span>
                        <span className="font-semibold text-gray-900">{entry.value}</span>
                    </div>
                ))}
            </div>
        )
    }
    return null
}

// Enhanced Stat Card with gradient
const GradientStatCard = ({ title, value, icon: Icon, gradient, subtitle, onClick, loading }) => (
    <div
        onClick={onClick}
        className={cn(
            'group relative overflow-hidden rounded-2xl p-6 cursor-pointer',
            'bg-gradient-to-br shadow-lg hover:shadow-xl transition-all duration-300',
            'hover:-translate-y-1 hover:scale-[1.02]',
            gradient
        )}
    >
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative">
            <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <Icon className="w-6 h-6 text-white" />
                </div>
                <ArrowUpRight className="w-5 h-5 text-white/60 group-hover:text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
            </div>

            {loading ? (
                <Loader2 className="w-8 h-8 text-white/80 animate-spin" />
            ) : (
                <>
                    <p className="text-4xl font-bold text-white mb-1">{value?.toLocaleString?.() || 0}</p>
                    <p className="text-sm font-medium text-white/80">{title}</p>
                    {subtitle && (
                        <p className="text-xs text-white/60 mt-2 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            {subtitle}
                        </p>
                    )}
                </>
            )}
        </div>
    </div>
)

// Quick Action Button
const QuickActionButton = ({ icon: Icon, title, subtitle, onClick, colorClass }) => (
    <button
        onClick={onClick}
        className="group w-full flex items-center gap-4 p-4 bg-white border border-gray-200/80 rounded-2xl hover:shadow-lg hover:border-transparent transition-all duration-300 hover:-translate-y-0.5"
    >
        <div className={cn(
            'p-3 rounded-xl transition-all duration-300',
            colorClass,
            'group-hover:scale-110 group-hover:shadow-lg'
        )}>
            <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="text-left flex-1">
            <span className="block text-sm font-semibold text-gray-900">{title}</span>
            <span className="block text-xs text-gray-500">{subtitle}</span>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-1 transition-all" />
    </button>
)

// Pending Grade Item Component
const PendingGradeItem = ({ item, onClick }) => (
    <div
        onClick={onClick}
        className="group flex items-center gap-4 p-4 hover:bg-gray-50/80 transition-all duration-200 cursor-pointer rounded-xl"
    >
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center ring-4 ring-orange-500/10">
            <FileText className="w-5 h-5 text-orange-600" />
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{item.AssessmentName}</p>
            <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                    {item.SubjectName}
                </span>
                <span className="text-xs text-gray-400">{item.BatchName}</span>
            </div>
        </div>
        <div className="text-right">
            <span className="text-sm font-semibold text-orange-600">{item.PendingCount}</span>
            <span className="text-xs text-gray-400 block">pending</span>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-1 transition-all" />
    </div>
)

// At-Risk Student Item Component
const AtRiskStudentItem = ({ student }) => (
    <div className="flex items-center gap-4 p-4 hover:bg-gray-50/80 transition-all duration-200 rounded-xl">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-100 to-rose-100 flex items-center justify-center ring-4 ring-red-500/10">
            <AlertTriangle className="w-5 h-5 text-red-600" />
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{student.StudentName}</p>
            <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                    {student.EnrollmentNumber}
                </span>
                <span className="text-xs text-gray-400">{student.SubjectName}</span>
            </div>
        </div>
        <div className="text-right">
            <Badge variant="danger" className="text-xs">{student.RiskReason}</Badge>
            <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                <span>Score: {student.CurrentScore?.toFixed(1) || 'N/A'}%</span>
                <span>Att: {student.AttendancePercentage?.toFixed(0)}%</span>
            </div>
        </div>
    </div>
)

// Course Card Component
const CourseCard = ({ course, onClick }) => (
    <div
        onClick={onClick}
        className="group p-4 bg-white border border-gray-200/80 rounded-2xl hover:shadow-lg hover:border-transparent transition-all duration-300 cursor-pointer"
    >
        <div className="flex items-start justify-between mb-3">
            <Badge variant="primary">{course.SubjectCode}</Badge>
            {course.IsCoordinator && (
                <Badge variant="warning" className="text-xs">Coordinator</Badge>
            )}
        </div>
        <h4 className="font-semibold text-gray-900 mb-2 truncate">{course.SubjectName}</h4>
        <div className="text-xs text-gray-500 mb-3">{course.BatchName} • AY {course.AcademicYear}</div>
        <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1.5 text-gray-600">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>{course.EnrolledStudents} students</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-600">
                <Target className="w-3.5 h-3.5" />
                <span>{course.AverageScore?.toFixed(1) || 0}% avg</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-600">
                <Calendar className="w-3.5 h-3.5" />
                <span>{course.AverageAttendance?.toFixed(0) || 0}% att</span>
            </div>
            {course.PendingGrades > 0 && (
                <div className="flex items-center gap-1.5 text-orange-600">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{course.PendingGrades} pending</span>
                </div>
            )}
        </div>
    </div>
)

const FacultyDashboard = () => {
    const navigate = useNavigate()
    const { user } = useAuth()

    // Fetch faculty dashboard data from unified API
    const { data: dashboard, isLoading, refetch } = useQuery({
        queryKey: ['faculty-dashboard'],
        queryFn: () => dashboardService.getMyDashboard(),
        staleTime: 30000,
    })

    // Extract data from API response
    const data = dashboard?.Data || dashboard || {}
    const currentCourses = data.CurrentCourses || []
    const pendingGradeItems = data.PendingGradeItems || []
    const atRiskStudents = data.AtRiskStudents || []
    const studentPerformance = data.StudentPerformance || {}

    // Prepare chart data from courses
    const courseStatsData = currentCourses.slice(0, 5).map(course => ({
        name: course.SubjectCode || course.SubjectName?.substring(0, 6),
        students: course.EnrolledStudents || 0,
        avgScore: course.AverageScore || 0,
        attendance: course.AverageAttendance || 0,
    }))

    // Student performance distribution (from API)
    const performanceDistribution = [
        { name: 'Excellent (≥90%)', value: studentPerformance.ExcellentCount || 0, color: '#10b981' },
        { name: 'Good (70-89%)', value: studentPerformance.GoodCount || 0, color: '#3b82f6' },
        { name: 'Average (50-69%)', value: studentPerformance.AverageCount || 0, color: '#f59e0b' },
        { name: 'Below Avg (40-49%)', value: studentPerformance.BelowAverageCount || 0, color: '#f97316' },
        { name: 'Failing (<40%)', value: studentPerformance.FailingCount || 0, color: '#ef4444' },
    ].filter(item => item.value > 0)

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/25">
                            <Briefcase className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent">
                            Faculty Dashboard
                        </h1>
                    </div>
                    <p className="text-gray-500 ml-14">
                        Welcome back, {data.FullName || user?.name}! Here's your teaching overview.
                    </p>
                </div>
                <button
                    onClick={() => refetch()}
                    disabled={isLoading}
                    className={cn(
                        'flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700',
                        'hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow',
                        isLoading && 'opacity-50 cursor-not-allowed'
                    )}
                >
                    <RefreshCcw className={cn('w-4 h-4', isLoading ? 'animate-spin' : '')} />
                    Refresh Data
                </button>
            </div>

            {/* Main Stats Grid - Gradient Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <GradientStatCard
                    title="My Courses"
                    value={data.ActiveCourses || 0}
                    icon={BookOpen}
                    gradient="from-blue-500 via-blue-600 to-indigo-600"
                    loading={isLoading}
                    subtitle={`${data.TotalCoursesTeaching || 0} total assigned`}
                    onClick={() => navigate(ROUTES.FACULTY_COURSES)}
                />
                <GradientStatCard
                    title="Total Students"
                    value={data.TotalStudentsEnrolled || 0}
                    icon={GraduationCap}
                    gradient="from-emerald-500 via-emerald-600 to-teal-600"
                    loading={isLoading}
                    subtitle="across all courses"
                    onClick={() => navigate(ROUTES.FACULTY_STUDENTS)}
                />
                <GradientStatCard
                    title="Pending Grades"
                    value={data.PendingGrades || 0}
                    icon={ClipboardCheck}
                    gradient={data.PendingGrades > 0 ? "from-orange-500 via-orange-600 to-amber-600" : "from-purple-500 via-purple-600 to-violet-600"}
                    loading={isLoading}
                    subtitle="assessments to grade"
                    onClick={() => navigate(ROUTES.FACULTY_GRADES)}
                />
                <GradientStatCard
                    title="At-Risk Students"
                    value={atRiskStudents.length}
                    icon={AlertTriangle}
                    gradient={atRiskStudents.length > 0 ? "from-red-500 via-red-600 to-rose-600" : "from-green-500 via-green-600 to-emerald-600"}
                    loading={isLoading}
                    subtitle="need attention"
                    onClick={() => navigate(ROUTES.FACULTY_AT_RISK)}
                />
            </div>

            {/* Secondary Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <MiniStat
                    title="Assessments Created"
                    value={data.TotalAssessmentsCreated || 0}
                    icon={FileText}
                    color="blue"
                    loading={isLoading}
                />
                <MiniStat
                    title="Graded Assessments"
                    value={data.GradedAssessments || 0}
                    icon={CheckCircle}
                    color="green"
                    loading={isLoading}
                />
                <MiniStat
                    title="Active Courses"
                    value={data.ActiveCourses || 0}
                    icon={BookOpen}
                    color="indigo"
                    loading={isLoading}
                />
                <MiniStat
                    title="Pending Reviews"
                    value={pendingGradeItems.length}
                    icon={Clock}
                    color="orange"
                    loading={isLoading}
                />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <QuickActionButton
                    icon={ClipboardCheck}
                    title="Enter Grades"
                    subtitle="Submit student marks"
                    onClick={() => navigate(ROUTES.FACULTY_GRADES)}
                    colorClass="bg-gradient-to-br from-blue-500 to-indigo-600"
                />
                <QuickActionButton
                    icon={Calendar}
                    title="Mark Attendance"
                    subtitle="Record daily attendance"
                    onClick={() => navigate(ROUTES.FACULTY_ATTENDANCE)}
                    colorClass="bg-gradient-to-br from-emerald-500 to-teal-600"
                />
                <QuickActionButton
                    icon={FileText}
                    title="Manage Assessments"
                    subtitle="Create or edit assessments"
                    onClick={() => navigate(ROUTES.FACULTY_ASSESSMENTS)}
                    colorClass="bg-gradient-to-br from-purple-500 to-violet-600"
                />
                <QuickActionButton
                    icon={AlertTriangle}
                    title="View At-Risk"
                    subtitle="Students needing help"
                    onClick={() => navigate(ROUTES.FACULTY_AT_RISK)}
                    colorClass="bg-gradient-to-br from-orange-500 to-amber-600"
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Course Statistics Bar Chart */}
                <Card className="lg:col-span-2 overflow-hidden">
                    <Card.Header className="bg-gradient-to-r from-gray-50 via-white to-gray-50 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                            <Card.Title className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md shadow-blue-500/25">
                                    <BookOpen className="w-4 h-4 text-white" />
                                </div>
                                <span>Course Statistics</span>
                            </Card.Title>
                            <button
                                onClick={() => navigate(ROUTES.FACULTY_COURSES)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <Eye className="w-4 h-4 text-gray-400" />
                            </button>
                        </div>
                    </Card.Header>
                    <Card.Body className="p-6">
                        {isLoading ? (
                            <div className="h-72 flex items-center justify-center">
                                <div className="text-center">
                                    <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto" />
                                    <p className="text-sm text-gray-500 mt-3">Loading chart data...</p>
                                </div>
                            </div>
                        ) : courseStatsData.length === 0 ? (
                            <div className="h-72 flex items-center justify-center">
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <BookOpen className="w-8 h-8 text-gray-300" />
                                    </div>
                                    <p className="text-gray-500 font-medium">No course data available</p>
                                    <p className="text-sm text-gray-400 mt-1">You'll see stats when courses are assigned</p>
                                </div>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height={280}>
                                <BarChart data={courseStatsData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                                    <XAxis
                                        dataKey="name"
                                        tick={{ fontSize: 12, fill: '#6b7280' }}
                                        axisLine={{ stroke: '#e5e7eb' }}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 12, fill: '#6b7280' }}
                                        axisLine={{ stroke: '#e5e7eb' }}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="students" name="Students" fill="#10b981" radius={[6, 6, 0, 0]} />
                                    <Bar dataKey="avgScore" name="Avg Score %" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                                    <Bar dataKey="attendance" name="Attendance %" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </Card.Body>
                </Card>

                {/* Performance Distribution Pie Chart */}
                <Card className="overflow-hidden">
                    <Card.Header className="bg-gradient-to-r from-gray-50 via-white to-gray-50 border-b border-gray-100">
                        <Card.Title className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md shadow-emerald-500/25">
                                <Target className="w-4 h-4 text-white" />
                            </div>
                            <span>Performance Distribution</span>
                        </Card.Title>
                    </Card.Header>
                    <Card.Body className="p-6">
                        {isLoading ? (
                            <div className="h-72 flex items-center justify-center">
                                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                            </div>
                        ) : performanceDistribution.length === 0 ? (
                            <div className="h-72 flex items-center justify-center">
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <Target className="w-8 h-8 text-gray-300" />
                                    </div>
                                    <p className="text-gray-500 font-medium">No performance data</p>
                                    <p className="text-sm text-gray-400 mt-1">Grade students to see distribution</p>
                                </div>
                            </div>
                        ) : (
                            <>
                                <ResponsiveContainer width="100%" height={200}>
                                    <PieChart>
                                        <Pie
                                            data={performanceDistribution}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={50}
                                            outerRadius={80}
                                            paddingAngle={2}
                                            dataKey="value"
                                        >
                                            {performanceDistribution.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="flex flex-wrap justify-center gap-3 mt-4">
                                    {performanceDistribution.map((entry, index) => (
                                        <div key={index} className="flex items-center gap-2 text-xs">
                                            <div
                                                className="w-3 h-3 rounded-full"
                                                style={{ backgroundColor: entry.color }}
                                            />
                                            <span className="text-gray-600">{entry.name}</span>
                                            <span className="font-semibold">{entry.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </Card.Body>
                </Card>
            </div>

            {/* Bottom Section: Pending Grades & At-Risk Students */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pending Grades */}
                <Card className="overflow-hidden">
                    <Card.Header className="bg-gradient-to-r from-gray-50 via-white to-gray-50 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                            <Card.Title className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 shadow-md shadow-orange-500/25">
                                    <Clock className="w-4 h-4 text-white" />
                                </div>
                                <span>Pending Grades</span>
                            </Card.Title>
                            <Badge variant="warning">{pendingGradeItems.length} items</Badge>
                        </div>
                    </Card.Header>
                    <Card.Body className="p-2 max-h-80 overflow-y-auto">
                        {isLoading ? (
                            <div className="h-48 flex items-center justify-center">
                                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                            </div>
                        ) : pendingGradeItems.length === 0 ? (
                            <div className="h-48 flex items-center justify-center">
                                <div className="text-center">
                                    <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                        <CheckCircle className="w-7 h-7 text-green-500" />
                                    </div>
                                    <p className="text-gray-500 font-medium">All caught up!</p>
                                    <p className="text-sm text-gray-400 mt-1">No pending grades to submit</p>
                                </div>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {pendingGradeItems.slice(0, 5).map((item, index) => (
                                    <PendingGradeItem
                                        key={item.AssessmentItemId || index}
                                        item={item}
                                        onClick={() => navigate(ROUTES.FACULTY_GRADES)}
                                    />
                                ))}
                            </div>
                        )}
                    </Card.Body>
                    {pendingGradeItems.length > 5 && (
                        <Card.Footer className="border-t border-gray-100 bg-gray-50/50">
                            <button
                                onClick={() => navigate(ROUTES.FACULTY_GRADES)}
                                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                            >
                                View all {pendingGradeItems.length} items
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </Card.Footer>
                    )}
                </Card>

                {/* At-Risk Students */}
                <Card className="overflow-hidden">
                    <Card.Header className="bg-gradient-to-r from-gray-50 via-white to-gray-50 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                            <Card.Title className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-gradient-to-br from-red-500 to-rose-600 shadow-md shadow-red-500/25">
                                    <AlertTriangle className="w-4 h-4 text-white" />
                                </div>
                                <span>At-Risk Students</span>
                            </Card.Title>
                            <Badge variant={atRiskStudents.length > 0 ? "danger" : "success"}>
                                {atRiskStudents.length} students
                            </Badge>
                        </div>
                    </Card.Header>
                    <Card.Body className="p-2 max-h-80 overflow-y-auto">
                        {isLoading ? (
                            <div className="h-48 flex items-center justify-center">
                                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                            </div>
                        ) : atRiskStudents.length === 0 ? (
                            <div className="h-48 flex items-center justify-center">
                                <div className="text-center">
                                    <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                        <CheckCircle className="w-7 h-7 text-green-500" />
                                    </div>
                                    <p className="text-gray-500 font-medium">All students on track!</p>
                                    <p className="text-sm text-gray-400 mt-1">No at-risk students detected</p>
                                </div>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {atRiskStudents.slice(0, 5).map((student, index) => (
                                    <AtRiskStudentItem
                                        key={student.StudentId || index}
                                        student={student}
                                    />
                                ))}
                            </div>
                        )}
                    </Card.Body>
                    {atRiskStudents.length > 5 && (
                        <Card.Footer className="border-t border-gray-100 bg-gray-50/50">
                            <button
                                onClick={() => navigate(ROUTES.FACULTY_AT_RISK)}
                                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                            >
                                View all {atRiskStudents.length} students
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </Card.Footer>
                    )}
                </Card>
            </div>

            {/* Current Courses Grid */}
            {currentCourses.length > 0 && (
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-blue-600" />
                            My Current Courses
                        </h2>
                        <button
                            onClick={() => navigate(ROUTES.FACULTY_COURSES)}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                        >
                            View all
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {currentCourses.slice(0, 4).map((course) => (
                            <CourseCard
                                key={course.CourseOfferingId}
                                course={course}
                                onClick={() => navigate(ROUTES.FACULTY_COURSES)}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default FacultyDashboard
