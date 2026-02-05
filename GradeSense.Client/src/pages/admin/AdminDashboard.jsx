import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { PageHeader } from '@/components/layout'
import { Card, Badge, StatCard, MiniStat } from '@/components/common'
import { dashboardService } from '@/services/dashboardService'
import { ROUTES } from '@/utils/constants'
import { formatDate, cn } from '@/utils/helpers'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts'
import {
    Users,
    GraduationCap,
    BookOpen,
    Building2,
    AlertTriangle,
    UserPlus,
    FileText,
    Settings,
    Activity,
    ChevronRight,
    Loader2,
    UserCheck,
    Layers,
    LayoutDashboard,
    Sparkles,
    Zap,
    Clock,
    ArrowUpRight,
    MoreHorizontal,
    Eye,
    RefreshCcw
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
const GradientStatCard = ({ title, value, icon: Icon, gradient, subtitle, onClick, loading, trend }) => (
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
                    <p className="text-4xl font-bold text-white mb-1">{value.toLocaleString()}</p>
                    <p className="text-sm font-medium text-white/80">{title}</p>
                    {subtitle && (
                        <p className="text-xs text-white/60 mt-2 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
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

// Activity Item Component
const ActivityItem = ({ activity, index }) => {
    const getActionConfig = (action) => {
        const actionLower = action?.toLowerCase() || ''
        if (actionLower.includes('create') || actionLower.includes('add')) {
            return { icon: UserPlus, bg: 'bg-emerald-100', text: 'text-emerald-600', ring: 'ring-emerald-500/20' }
        }
        if (actionLower.includes('update') || actionLower.includes('edit')) {
            return { icon: Settings, bg: 'bg-blue-100', text: 'text-blue-600', ring: 'ring-blue-500/20' }
        }
        if (actionLower.includes('delete') || actionLower.includes('remove')) {
            return { icon: AlertTriangle, bg: 'bg-red-100', text: 'text-red-600', ring: 'ring-red-500/20' }
        }
        if (actionLower.includes('login') || actionLower.includes('auth')) {
            return { icon: UserCheck, bg: 'bg-purple-100', text: 'text-purple-600', ring: 'ring-purple-500/20' }
        }
        return { icon: Activity, bg: 'bg-gray-100', text: 'text-gray-600', ring: 'ring-gray-500/20' }
    }

    const config = getActionConfig(activity.Action)
    const ActionIcon = config.icon

    return (
        <div
            className="group flex items-center gap-4 p-4 hover:bg-gray-50/80 transition-all duration-200 animate-fadeIn"
            style={{ animationDelay: `${index * 50}ms` }}
        >
            <div className={cn(
                'w-11 h-11 rounded-xl flex items-center justify-center ring-4 transition-all duration-200',
                config.bg, config.ring,
                'group-hover:scale-110'
            )}>
                <ActionIcon className={cn('w-5 h-5', config.text)} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                    {activity.Action}
                </p>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                        {activity.EntityType}
                    </span>
                    {activity.PerformedBy && (
                        <span className="text-xs text-gray-400 truncate">
                            by <span className="font-medium text-gray-500">{activity.PerformedBy}</span>
                        </span>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 whitespace-nowrap bg-gray-50 px-2.5 py-1 rounded-lg font-medium">
                    {formatDate(activity.OccurredAt, 'relative')}
                </span>
            </div>
        </div>
    )
}

const AdminDashboard = () => {
    const navigate = useNavigate()

    // Fetch dashboard data from unified API
    const { data: dashboard, isLoading, refetch } = useQuery({
        queryKey: ['admin-dashboard'],
        queryFn: () => dashboardService.getAdminDashboard(),
        staleTime: 30000, // 30 seconds
    })

    // Extract data from API response
    const data = dashboard?.Data || dashboard || {}
    const recentActivities = data.RecentActivities || []
    const departmentStats = data.DepartmentStats || []

    // Prepare chart data from department stats
    const departmentChartData = departmentStats.map(dept => ({
        name: dept.DepartmentCode || dept.DepartmentName?.substring(0, 4),
        students: dept.StudentCount || 0,
        faculty: dept.FacultyCount || 0,
        courses: dept.ActiveCourses || 0,
    }))

    // User distribution data for pie chart (using role-based counts from API)
    const userDistribution = [
        { name: 'Students', value: data.StudentUsers || 0, color: '#10b981' },
        { name: 'Faculty', value: data.FacultyUsers || 0, color: '#3b82f6' },
        { name: 'Admins', value: data.AdminUsers || 0, color: '#f59e0b' },
    ].filter(item => item.value > 0)

    const totalUsers = userDistribution.reduce((sum, item) => sum + item.value, 0)

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl shadow-lg shadow-rose-500/25">
                            <LayoutDashboard className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent">
                            Admin Dashboard
                        </h1>
                        <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
                    </div>
                    <p className="text-gray-500 ml-14">
                        Welcome back! Here's what's happening in your system today.
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
                    title="Total Users"
                    value={data.TotalUsers || 0}
                    icon={Users}
                    gradient="from-blue-500 via-blue-600 to-indigo-600"
                    loading={isLoading}
                    subtitle={`${data.ActiveUsers || 0} active now`}
                    onClick={() => navigate(ROUTES.ADMIN_USERS)}
                />
                <GradientStatCard
                    title="Total Students"
                    value={data.TotalStudents || 0}
                    icon={GraduationCap}
                    gradient="from-emerald-500 via-emerald-600 to-teal-600"
                    loading={isLoading}
                    subtitle={`${data.ActiveStudents || 0} active`}
                    onClick={() => navigate(ROUTES.ADMIN_STUDENTS)}
                />
                <GradientStatCard
                    title="Active Courses"
                    value={data.ActiveCourseOfferings || 0}
                    icon={BookOpen}
                    gradient="from-purple-500 via-purple-600 to-violet-600"
                    loading={isLoading}
                    subtitle={`${data.TotalCourseOfferings || 0} total offerings`}
                    onClick={() => navigate(ROUTES.ADMIN_COURSE_OFFERINGS)}
                />
                <GradientStatCard
                    title="Departments"
                    value={data.TotalDepartments || 0}
                    icon={Building2}
                    gradient="from-orange-500 via-orange-600 to-amber-600"
                    loading={isLoading}
                    subtitle={`${data.TotalSubjects || 0} subjects`}
                    onClick={() => navigate(ROUTES.ADMIN_DEPARTMENTS)}
                />
            </div>

            {/* Secondary Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <MiniStat
                    title="Active Users"
                    value={data.ActiveUsers || 0}
                    icon={UserCheck}
                    color="blue"
                    loading={isLoading}
                />
                <MiniStat
                    title="Total Faculty"
                    value={data.TotalFaculty || 0}
                    icon={Users}
                    color="indigo"
                    loading={isLoading}
                />
                <MiniStat
                    title="Total Enrollments"
                    value={data.TotalEnrollments || 0}
                    icon={Layers}
                    color="cyan"
                    loading={isLoading}
                />
                <MiniStat
                    title="At-Risk Students"
                    value={data.AtRiskStudents || 0}
                    icon={AlertTriangle}
                    color="rose"
                    loading={isLoading}
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Department Overview Bar Chart */}
                <Card className="lg:col-span-2 overflow-hidden">
                    <Card.Header className="bg-gradient-to-r from-gray-50 via-white to-gray-50 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                            <Card.Title className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md shadow-blue-500/25">
                                    <Building2 className="w-4 h-4 text-white" />
                                </div>
                                <span>Department Statistics</span>
                            </Card.Title>
                            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                <MoreHorizontal className="w-4 h-4 text-gray-400" />
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
                        ) : departmentChartData.length === 0 ? (
                            <div className="h-72 flex items-center justify-center">
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <Building2 className="w-8 h-8 text-gray-300" />
                                    </div>
                                    <p className="text-gray-500 font-medium">No department data available</p>
                                    <p className="text-sm text-gray-400 mt-1">Create departments to see statistics</p>
                                </div>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height={280}>
                                <BarChart data={departmentChartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
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
                                    <Legend
                                        wrapperStyle={{ paddingTop: '20px' }}
                                        iconType="circle"
                                    />
                                    <Bar dataKey="students" name="Students" fill="#10b981" radius={[6, 6, 0, 0]} />
                                    <Bar dataKey="faculty" name="Faculty" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                                    <Bar dataKey="courses" name="Courses" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </Card.Body>
                </Card>

                {/* User Distribution Pie Chart */}
                <Card className="overflow-hidden">
                    <Card.Header className="bg-gradient-to-r from-gray-50 via-white to-gray-50 border-b border-gray-100">
                        <Card.Title className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md shadow-emerald-500/25">
                                <Users className="w-4 h-4 text-white" />
                            </div>
                            <span>User Distribution</span>
                        </Card.Title>
                    </Card.Header>
                    <Card.Body className="p-6">
                        {isLoading ? (
                            <div className="h-72 flex items-center justify-center">
                                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                            </div>
                        ) : userDistribution.length === 0 ? (
                            <div className="h-72 flex items-center justify-center">
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <Users className="w-8 h-8 text-gray-300" />
                                    </div>
                                    <p className="text-gray-500 font-medium">No user data</p>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <ResponsiveContainer width="100%" height={200}>
                                    <PieChart>
                                        <Pie
                                            data={userDistribution}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={50}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {userDistribution.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                    </PieChart>
                                </ResponsiveContainer>
                                {/* Legend */}
                                <div className="space-y-2 mt-4">
                                    {userDistribution.map((item) => (
                                        <div key={item.name} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-3 h-3 rounded-full"
                                                    style={{ backgroundColor: item.color }}
                                                />
                                                <span className="text-sm text-gray-600">{item.name}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-semibold text-gray-900">{item.value}</span>
                                                <span className="text-xs text-gray-400">
                                                    ({((item.value / totalUsers) * 100).toFixed(0)}%)
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </Card.Body>
                </Card>
            </div>

            {/* System Overview Cards - Instead of Enrollment Trends */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="overflow-hidden border-0 shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50">
                    <Card.Body className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-blue-600 mb-1">Total Batches</p>
                                <p className="text-2xl font-bold text-blue-700">{data.TotalBatches || 0}</p>
                                <p className="text-xs text-blue-500 mt-1">{data.ActiveBatches || 0} active</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                <Layers className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </Card.Body>
                </Card>
                <Card className="overflow-hidden border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-teal-50">
                    <Card.Body className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-emerald-600 mb-1">Evaluation Schemes</p>
                                <p className="text-2xl font-bold text-emerald-700">{data.TotalEvaluationSchemes || 0}</p>
                                <p className="text-xs text-emerald-500 mt-1">{data.ActiveEvaluationSchemes || 0} active</p>
                            </div>
                            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                                <FileText className="w-6 h-6 text-emerald-600" />
                            </div>
                        </div>
                    </Card.Body>
                </Card>
                <Card className="overflow-hidden border-0 shadow-sm bg-gradient-to-br from-amber-50 to-orange-50">
                    <Card.Body className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-amber-600 mb-1">Subjects</p>
                                <p className="text-2xl font-bold text-amber-700">{data.TotalSubjects || 0}</p>
                                <p className="text-xs text-amber-500 mt-1">{data.ActiveSubjects || 0} active</p>
                            </div>
                            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                                <BookOpen className="w-6 h-6 text-amber-600" />
                            </div>
                        </div>
                    </Card.Body>
                </Card>
                <Card className="overflow-hidden border-0 shadow-sm bg-gradient-to-br from-purple-50 to-violet-50">
                    <Card.Body className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-purple-600 mb-1">Recent Actions</p>
                                <p className="text-2xl font-bold text-purple-700">{recentActivities.length || 0}</p>
                                <p className="text-xs text-purple-500 mt-1">In last 24 hours</p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                <Activity className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </Card.Body>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Activities - Takes 2 columns */}
                <Card className="lg:col-span-2 overflow-hidden">
                    <Card.Header className="bg-gradient-to-r from-gray-50 via-white to-gray-50 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                            <Card.Title className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md shadow-blue-500/25">
                                    <Activity className="w-4 h-4 text-white" />
                                </div>
                                <span>Recent Activities</span>
                                {recentActivities.length > 0 && (
                                    <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs font-semibold rounded-full">
                                        {recentActivities.length}
                                    </span>
                                )}
                            </Card.Title>
                            <button
                                onClick={() => navigate(ROUTES.ADMIN_AUDIT_LOGS)}
                                className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-all"
                            >
                                <Eye className="w-4 h-4" />
                                View All
                            </button>
                        </div>
                    </Card.Header>
                    <Card.Body className="p-0">
                        {isLoading ? (
                            <div className="flex items-center justify-center p-12">
                                <div className="text-center">
                                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
                                    <p className="text-sm text-gray-500 mt-3">Loading activities...</p>
                                </div>
                            </div>
                        ) : recentActivities.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <FileText className="w-8 h-8 text-gray-300" />
                                </div>
                                <p className="font-medium text-gray-500">No recent activities</p>
                                <p className="text-sm text-gray-400 mt-1">Activities will appear here as they occur</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {recentActivities.slice(0, 6).map((activity, index) => (
                                    <ActivityItem key={index} activity={activity} index={index} />
                                ))}
                            </div>
                        )}
                    </Card.Body>
                </Card>

                {/* Quick Actions */}
                <Card className="overflow-hidden">
                    <Card.Header className="bg-gradient-to-r from-gray-50 via-white to-gray-50 border-b border-gray-100">
                        <Card.Title className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 shadow-md shadow-amber-500/25">
                                <Zap className="w-4 h-4 text-white" />
                            </div>
                            <span>Quick Actions</span>
                        </Card.Title>
                    </Card.Header>
                    <Card.Body className="p-4 space-y-3">
                        <QuickActionButton
                            icon={UserPlus}
                            title="Add User"
                            subtitle="Create new system user"
                            onClick={() => navigate(`${ROUTES.ADMIN_USERS}/create`)}
                            colorClass="bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-500/30"
                        />
                        <QuickActionButton
                            icon={GraduationCap}
                            title="Add Student"
                            subtitle="Register new student"
                            onClick={() => navigate(`${ROUTES.ADMIN_STUDENTS}/create`)}
                            colorClass="bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/30"
                        />
                        <QuickActionButton
                            icon={BookOpen}
                            title="Add Course"
                            subtitle="Create course offering"
                            onClick={() => navigate(`${ROUTES.ADMIN_COURSE_OFFERINGS}/create`)}
                            colorClass="bg-gradient-to-br from-purple-500 to-violet-600 shadow-purple-500/30"
                        />
                        <QuickActionButton
                            icon={Building2}
                            title="Add Department"
                            subtitle="Create new department"
                            onClick={() => navigate(`${ROUTES.ADMIN_DEPARTMENTS}/create`)}
                            colorClass="bg-gradient-to-br from-orange-500 to-amber-600 shadow-orange-500/30"
                        />
                    </Card.Body>
                </Card>
            </div>

            {/* Department Overview Table */}
            {departmentStats.length > 0 && (
                <Card className="overflow-hidden">
                    <Card.Header className="bg-gradient-to-r from-gray-50 via-white to-gray-50 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                            <Card.Title className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 shadow-md shadow-orange-500/25">
                                    <Building2 className="w-4 h-4 text-white" />
                                </div>
                                <span>Department Overview</span>
                            </Card.Title>
                            <button
                                onClick={() => navigate(ROUTES.ADMIN_DEPARTMENTS)}
                                className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-all"
                            >
                                Manage
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </Card.Header>
                    <Card.Body className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50/80">
                                    <tr>
                                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Department</th>
                                        <th className="text-center px-4 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Students</th>
                                        <th className="text-center px-4 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Faculty</th>
                                        <th className="text-center px-4 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Subjects</th>
                                        <th className="text-center px-4 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Courses</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {departmentStats.map((dept, index) => (
                                        <tr
                                            key={dept.DepartmentId}
                                            className="hover:bg-gray-50/80 transition-colors animate-fadeIn"
                                            style={{ animationDelay: `${index * 50}ms` }}
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-orange-500/25">
                                                        {dept.DepartmentCode?.substring(0, 2) || 'NA'}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-900">{dept.DepartmentName}</p>
                                                        <p className="text-xs text-gray-500">{dept.DepartmentCode}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <span className="inline-flex items-center px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-700 font-semibold text-sm">
                                                    {dept.StudentCount}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <span className="inline-flex items-center px-3 py-1.5 rounded-xl bg-blue-100 text-blue-700 font-semibold text-sm">
                                                    {dept.FacultyCount}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <span className="inline-flex items-center px-3 py-1.5 rounded-xl bg-purple-100 text-purple-700 font-semibold text-sm">
                                                    {dept.SubjectCount}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <span className="inline-flex items-center px-3 py-1.5 rounded-xl bg-amber-100 text-amber-700 font-semibold text-sm">
                                                    {dept.ActiveCourses}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card.Body>
                </Card>
            )}
        </div>
    )
}

export default AdminDashboard
