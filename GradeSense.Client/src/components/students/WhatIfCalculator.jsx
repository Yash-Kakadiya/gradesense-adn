import { useState, useMemo, useCallback } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Card, Badge, Button, EmptyState } from '@/components/common'
import { LoadingInline } from '@/components/common/Spinner'
import { useAuth } from '@/context/AuthContext'
import { dashboardService } from '@/services/dashboardService'
import toast from 'react-hot-toast'
import {
    Calculator, TrendingUp, TrendingDown, Minus, Target,
    RefreshCw, AlertCircle, CheckCircle, Sparkles, ArrowRight
} from 'lucide-react'

// Grade point scale mapping
const GRADE_SCALE = {
    'A+': 10.0, 'A': 9.0, 'A-': 8.5,
    'B+': 8.0, 'B': 7.0, 'B-': 6.5,
    'C+': 6.0, 'C': 5.0, 'C-': 4.5,
    'D': 4.0, 'F': 0.0
}

const GRADES = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F']

const getGradeFromPercentage = (pct) => {
    if (pct >= 90) return 'A+'
    if (pct >= 85) return 'A'
    if (pct >= 80) return 'A-'
    if (pct >= 75) return 'B+'
    if (pct >= 70) return 'B'
    if (pct >= 65) return 'B-'
    if (pct >= 60) return 'C+'
    if (pct >= 55) return 'C'
    if (pct >= 50) return 'C-'
    if (pct >= 40) return 'D'
    return 'F'
}

const WhatIfCalculator = () => {
    const { user } = useAuth()
    const [hypotheticalGrades, setHypotheticalGrades] = useState({})
    const [hasCalculated, setHasCalculated] = useState(false)

    // Fetch grade analytics to get current state and active courses
    const { data: analyticsData, isLoading: loadingAnalytics } = useQuery({
        queryKey: ['grade-analytics-whatif', user?.id],
        queryFn: () => dashboardService.getGradeAnalytics(user?.id),
        enabled: !!user?.id,
        staleTime: 5 * 60 * 1000,
    })

    const analytics = analyticsData?.Data || {}

    // Mutation for what-if calculation
    const calculateMutation = useMutation({
        mutationFn: (request) => dashboardService.calculateWhatIf(request),
        onSuccess: () => {
            setHasCalculated(true)
            toast.success('Projection calculated!')
        },
        onError: (error) => {
            toast.error(error.response?.data?.Message || 'Calculation failed')
        }
    })

    const result = calculateMutation.data?.Data || null

    // Get active courses with pending assessments
    const activeCourses = useMemo(() => {
        return (analytics.CourseGrades || [])
            .filter(c => c.Status === 'Active' && c.PendingAssessments > 0)
    }, [analytics.CourseGrades])

    // Handle grade input change
    const handleGradeChange = useCallback((enrollmentId, field, value) => {
        setHypotheticalGrades(prev => ({
            ...prev,
            [enrollmentId]: {
                ...prev[enrollmentId],
                [field]: value
            }
        }))
        setHasCalculated(false)
    }, [])

    // Perform calculation
    const handleCalculate = useCallback(() => {
        const hypotheticalGradesList = Object.entries(hypotheticalGrades)
            .filter(([_, data]) => data.percentage !== undefined && data.percentage !== '')
            .map(([enrollmentId, data]) => {
                const course = activeCourses.find(c => c.EnrollmentId === parseInt(enrollmentId))
                if (!course) return null

                // Calculate what marks are needed based on the hypothetical percentage
                const pendingMax = course.Assessments
                    ?.filter(a => !a.IsGraded && !a.IsAbsent)
                    .reduce((sum, a) => sum + (a.MaxMarks || 0), 0) || 0

                return {
                    enrollmentId: parseInt(enrollmentId),
                    obtainedMarks: pendingMax * (parseFloat(data.percentage) / 100),
                    maxMarks: pendingMax
                }
            })
            .filter(Boolean)

        const request = {
            studentId: user.id,
            hypotheticalGrades: hypotheticalGradesList,
            hypotheticalCourseGrades: []
        }

        calculateMutation.mutate(request)
    }, [hypotheticalGrades, activeCourses, user?.id, calculateMutation])

    // Reset calculator
    const handleReset = useCallback(() => {
        setHypotheticalGrades({})
        setHasCalculated(false)
        calculateMutation.reset()
    }, [calculateMutation])

    // Quick fill with target grade
    const fillWithTarget = useCallback((targetGrade) => {
        const targetPercentage = {
            'A+': 95, 'A': 87, 'A-': 82,
            'B+': 77, 'B': 72, 'B-': 67,
            'C+': 62, 'C': 57, 'C-': 52,
            'D': 45, 'F': 20
        }[targetGrade] || 75

        const newGrades = {}
        activeCourses.forEach(course => {
            newGrades[course.EnrollmentId] = {
                percentage: targetPercentage.toString()
            }
        })
        setHypotheticalGrades(newGrades)
        setHasCalculated(false)
    }, [activeCourses])

    if (loadingAnalytics) {
        return <LoadingInline message="Loading calculator data..." />
    }

    if (activeCourses.length === 0) {
        return (
            <Card className="border-0 shadow-sm">
                <Card.Body className="py-12">
                    <EmptyState
                        icon={Calculator}
                        title="No Active Courses"
                        description="All your assessments have been graded. The What-If Calculator works with pending assessments."
                    />
                </Card.Body>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header with Current GPA */}
            <Card className="border-0 shadow-md overflow-hidden">
                <div className="bg-gradient-to-r from-violet-500 to-purple-600 px-6 py-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
                                <Calculator className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">What-If GPA Calculator</h2>
                                <p className="text-sm text-white/80">Predict your GPA with hypothetical grades</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-white/80">Current CGPA</p>
                            <p className="text-3xl font-bold text-white">
                                {analytics.CGPA?.toFixed(2) || '-'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Quick Fill Buttons */}
                <div className="px-6 py-3 bg-gradient-to-r from-violet-50 to-purple-50 border-b flex items-center gap-4 overflow-x-auto">
                    <span className="text-sm text-gray-600 whitespace-nowrap">Quick fill:</span>
                    {['A+', 'A', 'B+', 'B', 'C'].map(grade => (
                        <button
                            key={grade}
                            onClick={() => fillWithTarget(grade)}
                            className="px-3 py-1.5 text-sm font-medium rounded-lg bg-white border border-gray-200 hover:border-violet-400 hover:bg-violet-50 transition-colors"
                        >
                            Target {grade}
                        </button>
                    ))}
                    <button
                        onClick={handleReset}
                        className="px-3 py-1.5 text-sm font-medium rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors flex items-center gap-1"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Reset
                    </button>
                </div>
            </Card>

            {/* Active Courses Input */}
            <Card className="border-0 shadow-sm overflow-hidden">
                <Card.Header className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                    <Card.Title className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-blue-600" />
                        Enter Hypothetical Grades
                    </Card.Title>
                    <Card.Description>
                        Set expected percentage for pending assessments in each course
                    </Card.Description>
                </Card.Header>
                <Card.Body className="p-0">
                    <div className="divide-y divide-gray-100">
                        {activeCourses.map((course) => {
                            const inputValue = hypotheticalGrades[course.EnrollmentId]?.percentage || ''
                            const projectedGrade = inputValue ? getGradeFromPercentage(parseFloat(inputValue)) : null

                            return (
                                <div key={course.EnrollmentId} className="p-4">
                                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-sm text-blue-600">{course.SubjectCode}</span>
                                                <Badge variant="info">Sem {course.Semester}</Badge>
                                            </div>
                                            <p className="text-gray-900 font-medium">{course.SubjectName}</p>
                                            <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                                                <span>{course.Credits} Credits</span>
                                                <span>|</span>
                                                <span>Current: {course.Percentage.toFixed(1)}%</span>
                                                <span>|</span>
                                                <Badge variant="warning" className="text-xs">
                                                    {course.PendingAssessments} Pending
                                                </Badge>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    step="1"
                                                    placeholder="Expected %"
                                                    value={inputValue}
                                                    onChange={(e) => handleGradeChange(course.EnrollmentId, 'percentage', e.target.value)}
                                                    className="w-32 px-4 py-2 border border-gray-200 rounded-lg text-center font-semibold focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200"
                                                />
                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">%</span>
                                            </div>

                                            {projectedGrade && (
                                                <div className="flex items-center gap-2">
                                                    <ArrowRight className="w-4 h-4 text-gray-400" />
                                                    <Badge
                                                        variant={
                                                            projectedGrade.startsWith('A') ? 'success' :
                                                                projectedGrade.startsWith('B') ? 'primary' :
                                                                    projectedGrade.startsWith('C') ? 'warning' : 'danger'
                                                        }
                                                        className="text-lg px-3 py-1"
                                                    >
                                                        {projectedGrade}
                                                    </Badge>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </Card.Body>
                <div className="px-6 py-4 bg-gray-50 border-t">
                    <Button
                        onClick={handleCalculate}
                        disabled={Object.keys(hypotheticalGrades).length === 0 || calculateMutation.isPending}
                        className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
                    >
                        {calculateMutation.isPending ? (
                            <>
                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                Calculating...
                            </>
                        ) : (
                            <>
                                <Calculator className="w-4 h-4 mr-2" />
                                Calculate Projected GPA
                            </>
                        )}
                    </Button>
                </div>
            </Card>

            {/* Results */}
            {hasCalculated && result && (
                <div className="space-y-4">
                    {/* Projection Summary */}
                    <Card className="border-0 shadow-md overflow-hidden">
                        <div className={`px-6 py-5 ${result.ImpactLevel === 'Positive' ? 'bg-gradient-to-r from-emerald-500 to-green-600' :
                                result.ImpactLevel === 'Negative' ? 'bg-gradient-to-r from-red-500 to-rose-600' :
                                    'bg-gradient-to-r from-gray-500 to-slate-600'
                            }`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="flex items-center gap-2 text-white/80">
                                        {result.ImpactLevel === 'Positive' ? (
                                            <TrendingUp className="w-5 h-5" />
                                        ) : result.ImpactLevel === 'Negative' ? (
                                            <TrendingDown className="w-5 h-5" />
                                        ) : (
                                            <Minus className="w-5 h-5" />
                                        )}
                                        <span className="text-sm font-medium">
                                            {result.ImpactLevel === 'Positive' ? 'GPA Will Increase' :
                                                result.ImpactLevel === 'Negative' ? 'GPA Will Decrease' :
                                                    'Minimal Impact'}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold text-white mt-1">Projected Results</h3>
                                </div>
                            </div>
                        </div>

                        <Card.Body>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* CGPA Projection */}
                                <div className="text-center p-4 rounded-xl bg-gray-50">
                                    <p className="text-sm text-gray-500 mb-2">Projected CGPA</p>
                                    <div className="flex items-center justify-center gap-3">
                                        <span className="text-2xl text-gray-400">{result.CurrentCGPA?.toFixed(2) || '-'}</span>
                                        <ArrowRight className="w-5 h-5 text-gray-400" />
                                        <span className={`text-3xl font-bold ${result.CGPAChange > 0 ? 'text-green-600' :
                                                result.CGPAChange < 0 ? 'text-red-600' : 'text-gray-900'
                                            }`}>
                                            {result.ProjectedCGPA?.toFixed(2) || '-'}
                                        </span>
                                    </div>
                                    {result.CGPAChange != null && result.CGPAChange !== 0 && (
                                        <Badge variant={result.CGPAChange > 0 ? 'success' : 'danger'} className="mt-2">
                                            {result.CGPAChange > 0 ? '+' : ''}{result.CGPAChange.toFixed(2)}
                                        </Badge>
                                    )}
                                </div>

                                {/* Semester GPA Projection */}
                                <div className="text-center p-4 rounded-xl bg-gray-50">
                                    <p className="text-sm text-gray-500 mb-2">Projected Semester GPA</p>
                                    <div className="flex items-center justify-center gap-3">
                                        <span className="text-2xl text-gray-400">{result.CurrentSemesterGPA?.toFixed(2) || '-'}</span>
                                        <ArrowRight className="w-5 h-5 text-gray-400" />
                                        <span className={`text-3xl font-bold ${result.SemesterGPAChange > 0 ? 'text-green-600' :
                                                result.SemesterGPAChange < 0 ? 'text-red-600' : 'text-gray-900'
                                            }`}>
                                            {result.ProjectedSemesterGPA?.toFixed(2) || '-'}
                                        </span>
                                    </div>
                                    {result.SemesterGPAChange != null && result.SemesterGPAChange !== 0 && (
                                        <Badge variant={result.SemesterGPAChange > 0 ? 'success' : 'danger'} className="mt-2">
                                            {result.SemesterGPAChange > 0 ? '+' : ''}{result.SemesterGPAChange.toFixed(2)}
                                        </Badge>
                                    )}
                                </div>

                                {/* Credits */}
                                <div className="text-center p-4 rounded-xl bg-gray-50">
                                    <p className="text-sm text-gray-500 mb-2">Total Credits</p>
                                    <div className="flex items-center justify-center gap-3">
                                        <span className="text-2xl text-gray-400">{result.TotalCreditsEarned}</span>
                                        <ArrowRight className="w-5 h-5 text-gray-400" />
                                        <span className="text-3xl font-bold text-gray-900">
                                            {result.ProjectedCredits}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>

                    {/* Course Projections */}
                    {result.CourseProjections?.length > 0 && (
                        <Card className="border-0 shadow-sm overflow-hidden">
                            <Card.Header className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                                <Card.Title className="flex items-center gap-2">
                                    <Target className="w-5 h-5 text-blue-600" />
                                    Course-wise Projections
                                </Card.Title>
                            </Card.Header>
                            <Card.Body className="p-0">
                                <div className="divide-y divide-gray-100">
                                    {result.CourseProjections.map((proj) => (
                                        <div key={proj.EnrollmentId} className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono text-sm text-blue-600">{proj.SubjectCode}</span>
                                                        <span className="text-gray-400">|</span>
                                                        <span className="text-gray-700">{proj.SubjectName}</span>
                                                    </div>
                                                    <p className="text-sm text-gray-500 mt-1">{proj.Credits} Credits</p>
                                                </div>

                                                <div className="flex items-center gap-4">
                                                    <div className="text-center">
                                                        <p className="text-xs text-gray-500">Current</p>
                                                        <p className="text-lg font-semibold text-gray-700">
                                                            {proj.CurrentPercentage?.toFixed(1)}%
                                                        </p>
                                                        <Badge variant="secondary" className="text-xs mt-1">
                                                            {proj.CurrentGrade || '-'}
                                                        </Badge>
                                                    </div>
                                                    <ArrowRight className="w-5 h-5 text-gray-400" />
                                                    <div className="text-center">
                                                        <p className="text-xs text-gray-500">Projected</p>
                                                        <p className={`text-lg font-bold ${proj.ProjectedPercentage > proj.CurrentPercentage ? 'text-green-600' :
                                                                proj.ProjectedPercentage < proj.CurrentPercentage ? 'text-red-600' : 'text-gray-900'
                                                            }`}>
                                                            {proj.ProjectedPercentage?.toFixed(1)}%
                                                        </p>
                                                        <Badge
                                                            variant={
                                                                proj.ProjectedGrade?.startsWith('A') ? 'success' :
                                                                    proj.ProjectedGrade?.startsWith('B') ? 'primary' :
                                                                        proj.ProjectedGrade?.startsWith('C') ? 'warning' : 'danger'
                                                            }
                                                            className="text-xs mt-1"
                                                        >
                                                            {proj.ProjectedGrade || '-'}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card.Body>
                        </Card>
                    )}

                    {/* Target Requirements */}
                    {result.TargetRequirements?.length > 0 && (
                        <Card className="border-0 shadow-sm overflow-hidden">
                            <Card.Header className="bg-gradient-to-r from-amber-50 to-orange-50 border-b">
                                <Card.Title className="flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5 text-amber-600" />
                                    What You Need for Target Grades
                                </Card.Title>
                                <Card.Description>
                                    Required scores in remaining assessments
                                </Card.Description>
                            </Card.Header>
                            <Card.Body className="p-0">
                                <div className="divide-y divide-gray-100">
                                    {/* Group by course */}
                                    {Object.entries(
                                        result.TargetRequirements.reduce((acc, req) => {
                                            if (!acc[req.EnrollmentId]) {
                                                acc[req.EnrollmentId] = {
                                                    subjectCode: req.SubjectCode,
                                                    subjectName: req.SubjectName,
                                                    currentPercentage: req.CurrentPercentage,
                                                    targets: []
                                                }
                                            }
                                            acc[req.EnrollmentId].targets.push(req)
                                            return acc
                                        }, {})
                                    ).map(([enrollmentId, data]) => (
                                        <div key={enrollmentId} className="p-4">
                                            <div className="flex items-start gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono text-sm text-blue-600">{data.subjectCode}</span>
                                                        <span className="text-gray-400">|</span>
                                                        <span className="text-gray-700">{data.subjectName}</span>
                                                    </div>
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        Current: {data.currentPercentage.toFixed(1)}%
                                                    </p>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {data.targets.map((target, idx) => (
                                                        <div
                                                            key={idx}
                                                            className={`px-3 py-2 rounded-lg text-center ${target.IsAchievable
                                                                    ? 'bg-green-50 border border-green-200'
                                                                    : 'bg-red-50 border border-red-200'
                                                                }`}
                                                        >
                                                            <p className="text-xs text-gray-500">For {target.TargetGrade}</p>
                                                            <div className="flex items-center gap-1 mt-1">
                                                                {target.IsAchievable ? (
                                                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                                                ) : (
                                                                    <AlertCircle className="w-4 h-4 text-red-500" />
                                                                )}
                                                                <span className={`font-bold ${target.IsAchievable ? 'text-green-700' : 'text-red-700'
                                                                    }`}>
                                                                    {target.IsAchievable
                                                                        ? `${target.RequiredPercentageInRemaining.toFixed(0)}%`
                                                                        : 'N/A'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card.Body>
                        </Card>
                    )}
                </div>
            )}
        </div>
    )
}

export default WhatIfCalculator
