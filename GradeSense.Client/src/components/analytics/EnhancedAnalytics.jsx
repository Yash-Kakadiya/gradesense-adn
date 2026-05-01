import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, Badge, Button, EmptyState, StatCard } from '@/components/common'
import { PageHeader } from '@/components/layout'
import { dashboardService } from '@/services/dashboardService'
import { subjectService } from '@/services/subjectService'
import { batchService } from '@/services/batchService'
import { courseOfferingService } from '@/services/courseOfferingService'
import { cn } from '@/utils/helpers'
import {
    BarChart as ReBarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    LineChart,
    Line,
} from 'recharts'
import {
    Filter,
    RefreshCcw,
    Sparkles,
    Calendar,
    Layers,
    BookOpen,
    GraduationCap,
    TrendingUp,
    Activity,
    BarChart3,
} from 'lucide-react'

const gradeColors = {
    A: '#16a34a',
    B: '#3b82f6',
    C: '#f59e0b',
    D: '#f97316',
    F: '#ef4444',
}

const defaultFilters = {
    subjectId: '',
    batchId: '',
    courseOfferingId: '',
    fromDate: '',
    toDate: '',
    minStudents: 5,
}

const EnhancedAnalytics = ({
    title = 'Enhanced Analytics',
    subtitle = 'Comparative performance, grade distributions, and historical trends',
}) => {
    const [filters, setFilters] = useState(defaultFilters)

    // Dropdown data
    const { data: subjectsData } = useQuery({
        queryKey: ['subjects-select'],
        queryFn: () => subjectService.getAllForSelect(),
    })

    const { data: batchesData } = useQuery({
        queryKey: ['batches-select'],
        queryFn: () => batchService.getAllForSelect(),
    })

    const { data: offeringsData } = useQuery({
        queryKey: ['course-offerings-select'],
        queryFn: () => courseOfferingService.getAllForSelect(),
    })

    const subjects = useMemo(() => {
        const rows = subjectsData?.Data?.Data || subjectsData?.Data || []
        return rows.map((s) => ({ value: s.Id?.toString(), label: `${s.Code || ''} ${s.Name || ''}`.trim() }))
    }, [subjectsData])

    const batches = useMemo(() => {
        const rows = batchesData?.Data?.Data || batchesData?.Data || []
        return rows.map((b) => ({ value: b.Id?.toString(), label: b.Name || b.Code || `Batch ${b.Id}` }))
    }, [batchesData])

    const offerings = useMemo(() => {
        const rows = offeringsData?.Data?.Data || offeringsData?.Data || []
        return rows.map((o) => ({
            value: o.Id?.toString(),
            label: `${o.SubjectCode || 'Subject'} • ${o.BatchName || 'Batch'} • ${o.AcademicYear || ''}`.trim(),
        }))
    }, [offeringsData])

    const requestPayload = useMemo(() => ({
        SubjectId: filters.subjectId ? parseInt(filters.subjectId) : null,
        BatchId: filters.batchId ? parseInt(filters.batchId) : null,
        CourseOfferingId: filters.courseOfferingId ? parseInt(filters.courseOfferingId) : null,
        FromDate: filters.fromDate ? new Date(filters.fromDate).toISOString() : null,
        ToDate: filters.toDate ? new Date(filters.toDate).toISOString() : null,
        MinStudents: filters.minStudents ? parseInt(filters.minStudents) : 5,
    }), [filters])

    const { data, isLoading, isFetching, refetch } = useQuery({
        queryKey: ['enhanced-analytics', requestPayload],
        queryFn: () => dashboardService.getEnhancedAnalytics(requestPayload),
        keepPreviousData: true,
    })

    const analytics = data?.Data || data || {}
    const crossBatch = analytics.CrossBatchPerformance || []
    const distributions = analytics.GradeDistributions || []
    const trends = analytics.GradeTrends || []

    const distributionChartData = useMemo(() => (
        distributions.map((series) => {
            const entry = { label: series.Label || `Batch ${series.BatchId}` }
                ; (series.Buckets || []).forEach((bucket) => {
                    entry[bucket.Grade] = bucket.Percentage ?? 0
                })
            return entry
        })
    ), [distributions])

    const avgAcrossBatches = useMemo(() => {
        if (!crossBatch.length) return 0
        const total = crossBatch.reduce((sum, item) => sum + (item.AveragePercentage || 0), 0)
        return Math.round((total / crossBatch.length) * 100) / 100
    }, [crossBatch])

    const totalSamples = useMemo(() => (
        distributions.reduce((sum, series) => sum + (series.Buckets || []).reduce((s, b) => s + (b.Count || 0), 0), 0)
    ), [distributions])

    const handleQuickRange = (months) => {
        const to = new Date()
        const from = new Date()
        from.setMonth(from.getMonth() - months)
        setFilters((prev) => ({
            ...prev,
            fromDate: from.toISOString().slice(0, 10),
            toDate: to.toISOString().slice(0, 10),
        }))
    }

    const handleReset = () => setFilters(defaultFilters)

    return (
        <div className="space-y-6">
            <PageHeader
                title={title}
                description={subtitle}
                icon={Sparkles}
                onRefresh={refetch}
                isRefreshing={isFetching}
                actions={(
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuickRange(6)}
                            leftIcon={<Calendar className="w-4 h-4" />}
                        >
                            Last 6 months
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuickRange(12)}
                            leftIcon={<Calendar className="w-4 h-4" />}
                        >
                            Last 12 months
                        </Button>
                    </div>
                )}
            />

            {/* Filters */}
            <Card>
                <Card.Header className="flex items-center justify-between bg-gradient-to-r from-gray-50 via-white to-gray-50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-blue-100 text-blue-600 border border-blue-200">
                            <Filter className="w-4 h-4" />
                        </div>
                        <div>
                            <Card.Title>Filters</Card.Title>
                            <Card.Description>Limit the scope by subject, batch, course, and time window.</Card.Description>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleReset}
                        >
                            Reset
                        </Button>
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={() => refetch()}
                            leftIcon={<RefreshCcw className={cn('w-4 h-4', isFetching && 'animate-spin')} />}
                        >
                            Apply
                        </Button>
                    </div>
                </Card.Header>
                <Card.Body className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                        <label className="text-xs font-semibold text-gray-500 flex items-center gap-2 mb-1">
                            <BookOpen className="w-4 h-4 text-gray-400" /> Subject
                        </label>
                        <select
                            className="w-full rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm p-2.5"
                            value={filters.subjectId}
                            onChange={(e) => setFilters((prev) => ({ ...prev, subjectId: e.target.value }))}
                        >
                            <option value="">All subjects</option>
                            {subjects.map((s) => (
                                <option key={s.value} value={s.value}>{s.label}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-gray-500 flex items-center gap-2 mb-1">
                            <Layers className="w-4 h-4 text-gray-400" /> Batch
                        </label>
                        <select
                            className="w-full rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm p-2.5"
                            value={filters.batchId}
                            onChange={(e) => setFilters((prev) => ({ ...prev, batchId: e.target.value, courseOfferingId: '' }))}
                        >
                            <option value="">All batches</option>
                            {batches.map((b) => (
                                <option key={b.value} value={b.value}>{b.label}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-gray-500 flex items-center gap-2 mb-1">
                            <GraduationCap className="w-4 h-4 text-gray-400" /> Course Offering
                        </label>
                        <select
                            className="w-full rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm p-2.5"
                            value={filters.courseOfferingId}
                            onChange={(e) => setFilters((prev) => ({ ...prev, courseOfferingId: e.target.value }))}
                        >
                            <option value="">All courses</option>
                            {offerings.map((o) => (
                                <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-gray-500 mb-1">From Date</label>
                        <input
                            type="date"
                            className="w-full rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm p-2.5"
                            value={filters.fromDate}
                            onChange={(e) => setFilters((prev) => ({ ...prev, fromDate: e.target.value }))}
                        />
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-gray-500 mb-1">To Date</label>
                        <input
                            type="date"
                            className="w-full rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm p-2.5"
                            value={filters.toDate}
                            onChange={(e) => setFilters((prev) => ({ ...prev, toDate: e.target.value }))}
                        />
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-gray-500 mb-1">Minimum Students</label>
                        <input
                            type="number"
                            min="1"
                            className="w-full rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm p-2.5"
                            value={filters.minStudents}
                            onChange={(e) => setFilters((prev) => ({ ...prev, minStudents: e.target.value }))}
                        />
                    </div>
                </Card.Body>
            </Card>

            {/* Summary stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Groups Analyzed"
                    value={crossBatch.length}
                    icon={Layers}
                    color="blue"
                    loading={isLoading || isFetching}
                    subtitle="Distinct batch-course combinations"
                />
                <StatCard
                    title="Avg. Percentage"
                    value={`${avgAcrossBatches.toFixed(2)}%`}
                    icon={TrendingUp}
                    color="emerald"
                    loading={isLoading || isFetching}
                    subtitle="Across analyzed cohorts"
                />
                <StatCard
                    title="Trend Points"
                    value={trends.length}
                    icon={Activity}
                    color="purple"
                    loading={isLoading || isFetching}
                    subtitle="Monthly aggregates"
                />
                <StatCard
                    title="Samples Counted"
                    value={totalSamples}
                    icon={BarChart3}
                    color="orange"
                    loading={isLoading || isFetching}
                    subtitle="Assessments considered"
                />
            </div>

            {(!crossBatch.length && !isLoading) ? (
                <EmptyState
                    title="No analytics yet"
                    description="Try widening the date range or removing filters to see comparative insights."
                    actionLabel="Reset filters"
                    onAction={handleReset}
                />
            ) : null}

            {/* Cross-batch table */}
            {crossBatch.length > 0 && (
                <Card>
                    <Card.Header className="flex items-center justify-between">
                        <div>
                            <Card.Title>Cross-Batch Performance</Card.Title>
                            <Card.Description>Average and median percentages by batch and course offering.</Card.Description>
                        </div>
                        <Badge variant="primary">{crossBatch.length} cohorts</Badge>
                    </Card.Header>
                    <Card.Body className="overflow-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="text-left text-gray-500 uppercase text-xs">
                                    <th className="py-2 pr-4">Batch</th>
                                    <th className="py-2 pr-4">Course</th>
                                    <th className="py-2 pr-4">Subject</th>
                                    <th className="py-2 pr-4">Avg%</th>
                                    <th className="py-2 pr-4">Median%</th>
                                    <th className="py-2 pr-4">Students</th>
                                    <th className="py-2">Assessments</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {crossBatch.map((item) => (
                                    <tr key={`${item.BatchId}-${item.CourseOfferingId}-${item.SubjectCode}`} className="hover:bg-gray-50">
                                        <td className="py-3 pr-4 font-medium text-gray-900">{item.BatchName || 'Batch'}</td>
                                        <td className="py-3 pr-4 text-gray-700">#{item.CourseOfferingId}</td>
                                        <td className="py-3 pr-4 text-gray-700">{item.SubjectCode} — {item.SubjectName}</td>
                                        <td className="py-3 pr-4 font-semibold text-emerald-600">{item.AveragePercentage?.toFixed(2)}%</td>
                                        <td className="py-3 pr-4 text-gray-800">{item.MedianPercentage?.toFixed(2)}%</td>
                                        <td className="py-3 pr-4 text-gray-700">{item.StudentCount}</td>
                                        <td className="py-3 text-gray-700">{item.AssessmentCount}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </Card.Body>
                </Card>
            )}

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="h-[420px]">
                    <Card.Header className="flex items-center justify-between">
                        <div>
                            <Card.Title>Grade Distribution by Batch</Card.Title>
                            <Card.Description>Stacked percentage of grades (A-F) for each cohort.</Card.Description>
                        </div>
                        <Badge variant="purple">Percent of submissions</Badge>
                    </Card.Header>
                    <Card.Body className="h-[340px]">
                        {distributionChartData.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-sm text-gray-500">No distribution data</div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <ReBarChart data={distributionChartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                                    <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#6b7280' }} angle={-10} textAnchor="end" />
                                    <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
                                    <Tooltip formatter={(value) => `${value}%`} />
                                    <Legend iconType="circle" />
                                    {Object.entries(gradeColors).map(([grade, color]) => (
                                        <Bar key={grade} dataKey={grade} stackId="grades" fill={color} radius={[6, 6, 0, 0]} />
                                    ))}
                                </ReBarChart>
                            </ResponsiveContainer>
                        )}
                    </Card.Body>
                </Card>

                <Card className="h-[420px]">
                    <Card.Header className="flex items-center justify-between">
                        <div>
                            <Card.Title>Historical Grade Trend</Card.Title>
                            <Card.Description>Average percentage by month for the selected window.</Card.Description>
                        </div>
                        <Badge variant="primary">{trends.length} points</Badge>
                    </Card.Header>
                    <Card.Body className="h-[340px]">
                        {trends.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-sm text-gray-500">No trend data</div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={trends} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="Label" tick={{ fontSize: 12, fill: '#6b7280' }} />
                                    <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} domain={[0, 'auto']} />
                                    <Tooltip formatter={(value) => `${value}%`} />
                                    <Legend iconType="line" />
                                    <Line type="monotone" dataKey="AveragePercentage" name="Average %" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                    <Line type="monotone" dataKey="SampleSize" name="Samples" stroke="#10b981" strokeDasharray="4 2" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </Card.Body>
                </Card>
            </div>
        </div>
    )
}

export default EnhancedAnalytics
