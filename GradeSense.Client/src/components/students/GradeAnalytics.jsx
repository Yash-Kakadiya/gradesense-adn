import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, Badge, EmptyState } from '@/components/common'
import { LoadingInline } from '@/components/common/Spinner'
import { useAuth } from '@/context/AuthContext'
import { dashboardService } from '@/services/dashboardService'
import {
    PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer, AreaChart, Area, LineChart, Line
} from 'recharts'
import { TrendingUp, Award, BookOpen, Target, GraduationCap, ChevronRight, BarChart3 } from 'lucide-react'

const COLORS = {
    'A+': '#10B981', 'A': '#34D399', 'A-': '#6EE7B7',
    'B+': '#3B82F6', 'B': '#60A5FA', 'B-': '#93C5FD',
    'C+': '#F59E0B', 'C': '#FBBF24', 'C-': '#FCD34D',
    'D': '#EF4444', 'F': '#DC2626'
}

const GradeAnalytics = ({ semesterFilter = null, onCourseSelect }) => {
    const { user } = useAuth()

    // Fetch grade analytics
    const { data, isLoading, error } = useQuery({
        queryKey: ['grade-analytics', user?.id, semesterFilter],
        queryFn: () => dashboardService.getGradeAnalytics(user?.id, semesterFilter),
        enabled: !!user?.id,
        staleTime: 5 * 60 * 1000,
    })

    const analytics = data?.Data || {}

    // Process grade distribution for pie chart
    const gradeDistributionData = useMemo(() => {
        return (analytics.GradeDistribution || []).map(item => ({
            name: item.Grade,
            value: item.Count,
            color: COLORS[item.Grade] || '#6B7280',
            percentage: item.Percentage
        }))
    }, [analytics.GradeDistribution])

    // Process course grades for bar chart
    const coursePerformanceData = useMemo(() => {
        return (analytics.CourseGrades || [])
            .filter(c => c.TotalMaxMarks > 0)
            .slice(0, 10)
            .map(course => ({
                name: course.SubjectCode,
                fullName: course.SubjectName,
                percentage: course.Percentage,
                credits: course.Credits,
                grade: course.Grade || '-',
                fill: course.Percentage >= 90 ? '#10B981' :
                    course.Percentage >= 75 ? '#3B82F6' :
                        course.Percentage >= 60 ? '#F59E0B' : '#EF4444'
            }))
    }, [analytics.CourseGrades])

    // Process semester GPAs for trend chart
    const semesterTrendData = useMemo(() => {
        return (analytics.SemesterGPAs || []).map(item => ({
            name: `Sem ${item.Semester}`,
            gpa: item.GPA,
            credits: item.Credits,
            courses: item.CoursesCount
        }))
    }, [analytics.SemesterGPAs])

    // Process assessment type performance
    const assessmentTypeData = useMemo(() => {
        return (analytics.AssessmentTypePerformances || []).map(item => ({
            type: item.Type || 'Other',
            count: item.Count,
            avgPercentage: item.AveragePercentage,
            fill: item.AveragePercentage >= 80 ? '#10B981' :
                item.AveragePercentage >= 60 ? '#3B82F6' : '#F59E0B'
        }))
    }, [analytics.AssessmentTypePerformances])

    // Custom tooltip for pie chart
    const CustomPieTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload
            return (
                <div className="bg-white p-3 rounded-lg shadow-lg border">
                    <p className="font-semibold text-gray-900">Grade {data.name}</p>
                    <p className="text-sm text-gray-600">{data.value} course(s)</p>
                    <p className="text-sm text-gray-600">{data.percentage}% of total</p>
                </div>
            )
        }
        return null
    }

    // Custom tooltip for bar chart
    const CustomBarTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload
            return (
                <div className="bg-white p-3 rounded-lg shadow-lg border">
                    <p className="font-semibold text-gray-900">{data.fullName}</p>
                    <p className="text-sm text-blue-600">{data.percentage}%</p>
                    <p className="text-xs text-gray-500">{data.credits} Credits | Grade: {data.grade}</p>
                </div>
            )
        }
        return null
    }

    if (isLoading) {
        return <LoadingInline message="Loading grade analytics..." />
    }

    if (error) {
        return (
            <Card className="border-0 shadow-sm">
                <Card.Body className="py-8">
                    <EmptyState
                        icon={BarChart3}
                        title="Unable to load analytics"
                        description="There was an error loading your grade analytics. Please try again."
                    />
                </Card.Body>
            </Card>
        )
    }

    const hasData = gradeDistributionData.length > 0 || coursePerformanceData.length > 0

    if (!hasData) {
        return (
            <Card className="border-0 shadow-sm">
                <Card.Body className="py-8">
                    <EmptyState
                        icon={Award}
                        title="No Grade Data"
                        description="No graded courses found yet. Grades will appear here once assessments are graded."
                    />
                </Card.Body>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            {/* GPA Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-0 shadow-sm overflow-hidden">
                    <Card.Body>
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl">
                                <Award className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">CGPA</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {analytics.CGPA?.toFixed(2) || '-'}
                                </p>
                            </div>
                        </div>
                    </Card.Body>
                </Card>

                <Card className="border-0 shadow-sm overflow-hidden">
                    <Card.Body>
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl">
                                <TrendingUp className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">Semester GPA</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {analytics.CurrentSemesterGPA?.toFixed(2) || '-'}
                                </p>
                            </div>
                        </div>
                    </Card.Body>
                </Card>

                <Card className="border-0 shadow-sm overflow-hidden">
                    <Card.Body>
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-gradient-to-br from-purple-400 to-violet-500 rounded-xl">
                                <GraduationCap className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">Credits Earned</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {analytics.TotalCreditsEarned || 0}
                                </p>
                            </div>
                        </div>
                    </Card.Body>
                </Card>

                <Card className="border-0 shadow-sm overflow-hidden">
                    <Card.Body>
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl">
                                <Target className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">Progress</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {analytics.CreditCompletionPercentage?.toFixed(0) || 0}%
                                </p>
                            </div>
                        </div>
                    </Card.Body>
                </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Grade Distribution Pie Chart */}
                {gradeDistributionData.length > 0 && (
                    <Card className="border-0 shadow-sm overflow-hidden">
                        <Card.Header className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b">
                            <Card.Title className="flex items-center gap-2">
                                <Award className="w-5 h-5 text-emerald-600" />
                                Grade Distribution
                            </Card.Title>
                            <Card.Description>
                                Breakdown of grades across all courses
                            </Card.Description>
                        </Card.Header>
                        <Card.Body>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={gradeDistributionData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={50}
                                            outerRadius={80}
                                            paddingAngle={2}
                                            dataKey="value"
                                        >
                                            {gradeDistributionData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomPieTooltip />} />
                                        <Legend
                                            formatter={(value, entry) => (
                                                <span className="text-sm text-gray-600">
                                                    {value} ({entry.payload.value})
                                                </span>
                                            )}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </Card.Body>
                    </Card>
                )}

                {/* Semester GPA Trend */}
                {semesterTrendData.length > 0 && (
                    <Card className="border-0 shadow-sm overflow-hidden">
                        <Card.Header className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                            <Card.Title className="flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-blue-600" />
                                GPA Trend
                            </Card.Title>
                            <Card.Description>
                                Semester-wise GPA progression
                            </Card.Description>
                        </Card.Header>
                        <Card.Body>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={semesterTrendData}>
                                        <defs>
                                            <linearGradient id="gpaGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                        <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} />
                                        <Tooltip
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    const data = payload[0].payload
                                                    return (
                                                        <div className="bg-white p-3 rounded-lg shadow-lg border">
                                                            <p className="font-semibold text-gray-900">{data.name}</p>
                                                            <p className="text-sm text-blue-600">GPA: {data.gpa?.toFixed(2)}</p>
                                                            <p className="text-xs text-gray-500">{data.credits} Credits | {data.courses} Courses</p>
                                                        </div>
                                                    )
                                                }
                                                return null
                                            }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="gpa"
                                            stroke="#3B82F6"
                                            strokeWidth={2}
                                            fill="url(#gpaGradient)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </Card.Body>
                    </Card>
                )}
            </div>

            {/* Course Performance */}
            {coursePerformanceData.length > 0 && (
                <Card className="border-0 shadow-sm overflow-hidden">
                    <Card.Header className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
                        <Card.Title className="flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-purple-600" />
                            Course Performance
                        </Card.Title>
                        <Card.Description>
                            Performance across enrolled courses
                        </Card.Description>
                    </Card.Header>
                    <Card.Body>
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={coursePerformanceData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} />
                                    <YAxis type="category" dataKey="name" width={60} tick={{ fontSize: 11 }} />
                                    <Tooltip content={<CustomBarTooltip />} />
                                    <Bar dataKey="percentage" radius={[0, 4, 4, 0]}>
                                        {coursePerformanceData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card.Body>
                </Card>
            )}

            {/* Assessment Type Performance */}
            {assessmentTypeData.length > 0 && (
                <Card className="border-0 shadow-sm overflow-hidden">
                    <Card.Header className="bg-gradient-to-r from-amber-50 to-orange-50 border-b">
                        <Card.Title className="flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-amber-600" />
                            Performance by Assessment Type
                        </Card.Title>
                        <Card.Description>
                            Average scores across different assessment types
                        </Card.Description>
                    </Card.Header>
                    <Card.Body>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {assessmentTypeData.map((item, index) => (
                                <div
                                    key={index}
                                    className="p-4 rounded-xl bg-gray-50 border border-gray-100"
                                >
                                    <p className="text-sm font-medium text-gray-700">{item.type}</p>
                                    <p className="text-2xl font-bold mt-1" style={{ color: item.fill }}>
                                        {item.avgPercentage.toFixed(1)}%
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">{item.count} assessments</p>
                                </div>
                            ))}
                        </div>
                    </Card.Body>
                </Card>
            )}

            {/* Course Details List */}
            {analytics.CourseGrades?.length > 0 && (
                <Card className="border-0 shadow-sm overflow-hidden">
                    <Card.Header className="bg-gradient-to-r from-slate-50 to-gray-50 border-b">
                        <Card.Title className="flex items-center gap-2">
                            <GraduationCap className="w-5 h-5 text-gray-600" />
                            Detailed Course Breakdown
                        </Card.Title>
                    </Card.Header>
                    <Card.Body className="p-0">
                        <div className="divide-y divide-gray-100">
                            {analytics.CourseGrades.map((course) => (
                                <div
                                    key={course.EnrollmentId}
                                    className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                                    onClick={() => onCourseSelect?.(course.CourseOfferingId)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3">
                                                <span className="font-mono text-sm text-blue-600">{course.SubjectCode}</span>
                                                <Badge variant="info">Sem {course.Semester}</Badge>
                                                {course.Grade && (
                                                    <Badge
                                                        variant={
                                                            course.Grade.startsWith('A') ? 'success' :
                                                                course.Grade.startsWith('B') ? 'primary' :
                                                                    course.Grade.startsWith('C') ? 'warning' : 'danger'
                                                        }
                                                    >
                                                        {course.Grade}
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-gray-900 font-medium mt-1">{course.SubjectName}</p>
                                            <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                                                <span>{course.Credits} Credits</span>
                                                <span>{course.CompletedAssessments}/{course.TotalAssessments} Assessments</span>
                                                {course.PendingAssessments > 0 && (
                                                    <Badge variant="warning" className="text-xs">
                                                        {course.PendingAssessments} Pending
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-gray-900">{course.Percentage.toFixed(1)}%</p>
                                            <p className="text-sm text-gray-500">
                                                {course.TotalObtained.toFixed(1)} / {course.TotalMaxMarks.toFixed(1)}
                                            </p>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-gray-400 ml-4" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card.Body>
                </Card>
            )}
        </div>
    )
}

export default GradeAnalytics
