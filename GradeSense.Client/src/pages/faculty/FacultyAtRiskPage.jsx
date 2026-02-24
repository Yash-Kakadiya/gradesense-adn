import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, Badge, Button, EmptyState, Pagination, Modal } from '@/components/common'
import { useAuth } from '@/context/AuthContext'
import { useDebounce, useModal } from '@/hooks'
import { facultyAssignmentService } from '@/services/facultyAssignmentService'
import { predictionService } from '@/services/predictionService'
import { cn } from '@/utils/helpers'
import toast from 'react-hot-toast'
import {
    AlertTriangle,
    Search,
    TrendingDown,
    TrendingUp,
    Users,
    BookOpen,
    Target,
    Calendar,
    Mail,
    Phone,
    ChevronDown,
    Eye,
    RefreshCcw,
    Loader2,
    BarChart3,
    AlertCircle,
    Activity,
    Filter,
    LayoutGrid,
    List,
    Edit3,
    Save,
    X,
    ClipboardEdit,
} from 'lucide-react'

// Risk Level Indicator
const RiskLevelBadge = ({ level, confidence }) => {
    const getConfig = () => {
        const normalizedLevel = level?.toLowerCase()
        switch (normalizedLevel) {
            case 'high': return { color: 'red', label: 'High Risk', icon: AlertTriangle }
            case 'medium': return { color: 'orange', label: 'Medium Risk', icon: AlertCircle }
            case 'low': return { color: 'green', label: 'Low Risk', icon: TrendingUp }
            default: return { color: 'green', label: 'Good', icon: TrendingUp } // Default to Good since ML not implemented
        }
    }
    const config = getConfig()

    return (
        <div className="flex items-center gap-2">
            <Badge variant={config.color === 'red' ? 'danger' : config.color === 'orange' ? 'warning' : 'success'}>
                <config.icon className="w-3 h-3 mr-1" />
                {config.label}
            </Badge>
            {confidence && (
                <span className="text-xs text-gray-500">{(confidence * 100).toFixed(0)}% conf.</span>
            )}
        </div>
    )
}

// At-Risk Student Card
const AtRiskStudentCard = ({ student, onViewDetails, onReview }) => (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
        {/* Risk indicator bar */}
        <div className={cn(
            "h-1.5",
            student.RiskLevel?.toLowerCase() === 'high' ? "bg-gradient-to-r from-red-400 to-rose-500" :
                student.RiskLevel?.toLowerCase() === 'medium' ? "bg-gradient-to-r from-orange-400 to-amber-500" :
                    "bg-gradient-to-r from-green-400 to-emerald-500"
        )} />

        <Card.Body className="p-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "w-11 h-11 rounded-full flex items-center justify-center",
                        student.RiskLevel?.toLowerCase() === 'high' ? "bg-red-100" :
                            student.RiskLevel?.toLowerCase() === 'medium' ? "bg-orange-100" : "bg-green-100"
                    )}>
                        <span className={cn(
                            "font-semibold",
                            student.RiskLevel?.toLowerCase() === 'high' ? "text-red-600" :
                                student.RiskLevel?.toLowerCase() === 'medium' ? "text-orange-600" : "text-green-600"
                        )}>
                            {student.StudentName?.charAt(0) || 'S'}
                        </span>
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">{student.StudentName}</h3>
                        <p className="text-xs text-gray-500 font-mono">{student.RollNumber}</p>
                    </div>
                </div>
                <RiskLevelBadge level={student.RiskLevel} confidence={student.Confidence} />
            </div>

            {/* Course Info */}
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                <BookOpen className="w-4 h-4 text-gray-400" />
                <span className="truncate">{student.SubjectName || 'N/A'}</span>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                    <p className={cn(
                        "text-lg font-bold",
                        (student.CurrentScore || 0) >= 50 ? "text-gray-900" : "text-red-600"
                    )}>
                        {student.CurrentScore?.toFixed(1) || 0}%
                    </p>
                    <p className="text-xs text-gray-500">Score</p>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                    <p className={cn(
                        "text-lg font-bold",
                        (student.AttendancePercentage || 0) >= 75 ? "text-gray-900" : "text-red-600"
                    )}>
                        {student.AttendancePercentage?.toFixed(0) || 0}%
                    </p>
                    <p className="text-xs text-gray-500">Attendance</p>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                    <p className={cn(
                        "text-lg font-bold",
                        (student.PredictedScore || 0) >= 50 ? "text-green-600" : "text-red-600"
                    )}>
                        {student.PredictedScore?.toFixed(1) || 0}%
                    </p>
                    <p className="text-xs text-gray-500">Predicted</p>
                </div>
            </div>

            {/* Risk Factors */}
            {student.RiskFactors && student.RiskFactors.length > 0 && (
                <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-1">Risk Factors:</p>
                    <div className="flex flex-wrap gap-1">
                        {student.RiskFactors.slice(0, 3).map((factor, idx) => (
                            <span key={idx} className="text-xs px-2 py-0.5 bg-red-50 text-red-700 rounded-full">
                                {factor}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => onViewDetails(student)}
                >
                    <Eye className="w-4 h-4 mr-2" />
                    View
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1"
                    onClick={() => onReview(student)}
                >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Review
                </Button>
            </div>
        </Card.Body>
    </Card>
)

// At-Risk Table Row
const AtRiskTableRow = ({ student, onViewDetails, onReview, index }) => (
    <tr className={cn(
        "hover:bg-gray-50 transition-colors",
        index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
    )}>
        <td className="px-4 py-3">
            <div className="flex items-center gap-3">
                <div className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center",
                    student.RiskLevel?.toLowerCase() === 'high' ? "bg-red-100" :
                        student.RiskLevel?.toLowerCase() === 'medium' ? "bg-orange-100" : "bg-green-100"
                )}>
                    <span className={cn(
                        "font-medium text-sm",
                        student.RiskLevel?.toLowerCase() === 'high' ? "text-red-600" :
                            student.RiskLevel?.toLowerCase() === 'medium' ? "text-orange-600" : "text-green-600"
                    )}>
                        {student.StudentName?.charAt(0) || 'S'}
                    </span>
                </div>
                <div>
                    <p className="font-medium text-gray-900">{student.StudentName}</p>
                    <p className="text-xs text-gray-500 font-mono">{student.RollNumber}</p>
                </div>
            </div>
        </td>
        <td className="px-4 py-3 text-sm text-gray-600">
            <span className="truncate block max-w-xs">{student.SubjectName || 'N/A'}</span>
        </td>
        <td className="px-4 py-3 text-center">
            <span className={cn(
                "font-semibold",
                (student.CurrentScore || 0) >= 50 ? "text-gray-900" : "text-red-600"
            )}>
                {student.CurrentScore?.toFixed(1) || 0}%
            </span>
        </td>
        <td className="px-4 py-3 text-center">
            <span className={cn(
                "font-semibold",
                (student.AttendancePercentage || 0) >= 75 ? "text-gray-900" : "text-red-600"
            )}>
                {student.AttendancePercentage?.toFixed(0) || 0}%
            </span>
        </td>
        <td className="px-4 py-3 text-center">
            <span className={cn(
                "font-semibold",
                (student.PredictedScore || 0) >= 50 ? "text-green-600" : "text-red-600"
            )}>
                {student.PredictedScore?.toFixed(1) || 0}%
            </span>
        </td>
        <td className="px-4 py-3 text-center">
            <RiskLevelBadge level={student.RiskLevel} />
        </td>
        <td className="px-4 py-3 text-right">
            <div className="flex items-center justify-end gap-1">
                <Button variant="ghost" size="sm" onClick={() => onViewDetails(student)} title="View Details">
                    <Eye className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onReview(student)} title="Review Performance">
                    <Edit3 className="w-4 h-4" />
                </Button>
            </div>
        </td>
    </tr>
)

// Performance Review Modal
const PerformanceReviewModal = ({ isOpen, onClose, student, onSave, isSaving }) => {
    const [reviewData, setReviewData] = useState({
        predictedCategory: '',
        riskScore: '',
        reviewNotes: '',
    })

    // Initialize form when student changes
    useState(() => {
        if (student) {
            setReviewData({
                predictedCategory: student.RiskLevel || 'Safe',
                riskScore: student.RiskScore?.toString() || '',
                reviewNotes: student.ReviewNotes || '',
            })
        }
    }, [student])

    const handleSubmit = (e) => {
        e.preventDefault()
        onSave({
            ...reviewData,
            riskScore: reviewData.riskScore ? parseFloat(reviewData.riskScore) : undefined,
        })
    }

    const categoryOptions = [
        { value: 'High', label: 'High Risk', color: 'red' },
        { value: 'Medium', label: 'Medium Risk', color: 'orange' },
        { value: 'Low', label: 'Low Risk', color: 'green' },
        { value: 'Safe', label: 'Safe', color: 'emerald' },
    ]

    if (!student) return null

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Review Student Performance">
            <form onSubmit={handleSubmit}>
                {/* Student Info */}
                <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3 mb-3">
                        <div className={cn(
                            "w-12 h-12 rounded-full flex items-center justify-center",
                            student.RiskLevel?.toLowerCase() === 'high' ? "bg-red-100" :
                                student.RiskLevel?.toLowerCase() === 'medium' ? "bg-orange-100" : "bg-green-100"
                        )}>
                            <span className={cn(
                                "font-semibold text-lg",
                                student.RiskLevel?.toLowerCase() === 'high' ? "text-red-600" :
                                    student.RiskLevel?.toLowerCase() === 'medium' ? "text-orange-600" : "text-green-600"
                            )}>
                                {student.StudentName?.charAt(0) || 'S'}
                            </span>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">{student.StudentName}</h3>
                            <p className="text-sm text-gray-500">{student.RollNumber} • {student.SubjectName}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-center">
                        <div className="p-2 bg-white rounded-lg">
                            <p className={cn(
                                "text-lg font-bold",
                                (student.CurrentScore || 0) >= 50 ? "text-gray-900" : "text-red-600"
                            )}>
                                {student.CurrentScore?.toFixed(1) || 0}%
                            </p>
                            <p className="text-xs text-gray-500">Current Score</p>
                        </div>
                        <div className="p-2 bg-white rounded-lg">
                            <p className={cn(
                                "text-lg font-bold",
                                (student.AttendancePercentage || 0) >= 75 ? "text-gray-900" : "text-red-600"
                            )}>
                                {student.AttendancePercentage?.toFixed(0) || 0}%
                            </p>
                            <p className="text-xs text-gray-500">Attendance</p>
                        </div>
                        <div className="p-2 bg-white rounded-lg">
                            <p className={cn(
                                "text-lg font-bold",
                                (student.PredictedScore || 0) >= 50 ? "text-green-600" : "text-red-600"
                            )}>
                                {student.PredictedScore?.toFixed(1) || 0}%
                            </p>
                            <p className="text-xs text-gray-500">Predicted</p>
                        </div>
                    </div>
                </div>

                {/* Override Risk Level */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <ClipboardEdit className="w-4 h-4 inline mr-1" />
                        Override Risk Level
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        {categoryOptions.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => setReviewData(prev => ({ ...prev, predictedCategory: option.value }))}
                                className={cn(
                                    "px-4 py-3 rounded-lg border-2 transition-all text-sm font-medium",
                                    reviewData.predictedCategory === option.value
                                        ? option.color === 'red' ? "border-red-500 bg-red-50 text-red-700" :
                                            option.color === 'orange' ? "border-orange-500 bg-orange-50 text-orange-700" :
                                                option.color === 'green' ? "border-green-500 bg-green-50 text-green-700" :
                                                    "border-emerald-500 bg-emerald-50 text-emerald-700"
                                        : "border-gray-200 hover:border-gray-300"
                                )}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Review Notes */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Review Notes
                    </label>
                    <textarea
                        value={reviewData.reviewNotes}
                        onChange={(e) => setReviewData(prev => ({ ...prev, reviewNotes: e.target.value }))}
                        placeholder="Add notes about this student's performance, interventions planned, or observations..."
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSaving}>
                        {isSaving ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                Save Review
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </Modal>
    )
}

const FacultyAtRiskPage = () => {
    const { user } = useAuth()
    const queryClient = useQueryClient()
    const [searchTerm, setSearchTerm] = useState('')
    const [courseFilter, setCourseFilter] = useState('')
    const [riskFilter, setRiskFilter] = useState('')
    const [viewMode, setViewMode] = useState('grid')
    const [currentPage, setCurrentPage] = useState(1)
    const pageSize = 12
    const debouncedSearch = useDebounce(searchTerm, 300)

    // Review modal state
    const [selectedStudent, setSelectedStudent] = useState(null)
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)

    // Fetch faculty's course assignments
    const { data: assignmentsData } = useQuery({
        queryKey: ['faculty-assignments', user?.id],
        queryFn: () => facultyAssignmentService.getByFaculty(user?.id),
        enabled: !!user?.id,
    })

    // Get course IDs
    const courseIds = useMemo(() => {
        const data = assignmentsData?.Data?.Data || assignmentsData?.Data || []
        return data.map(a => a.CourseOfferingId).filter(Boolean)
    }, [assignmentsData])

    // Course options for filter
    const courseOptions = useMemo(() => {
        const data = assignmentsData?.Data?.Data || assignmentsData?.Data || []
        return data.map(a => ({
            value: a.CourseOfferingId?.toString() || '',
            label: a.SubjectName || 'Unknown',
        }))
    }, [assignmentsData])

    // Fetch at-risk predictions
    const { data: predictionsData, isLoading, refetch } = useQuery({
        queryKey: ['faculty-at-risk', courseIds, currentPage, pageSize],
        queryFn: async () => {
            if (courseIds.length === 0) return { Data: [], TotalCount: 0 }
            return predictionService.getAll({
                courseOfferingIds: courseFilter || courseIds.join(','),
                riskLevel: riskFilter || undefined,
                pageNumber: currentPage,
                pageSize,
            })
        },
        enabled: courseIds.length > 0,
    })

    // Process predictions data
    const atRiskStudents = useMemo(() => {
        const predictions = predictionsData?.Data?.Data || predictionsData?.Data || []
        return predictions.map(p => ({
            Id: p.Id,
            StudentId: p.StudentId,
            StudentName: p.StudentName || p.Student?.FullName,
            RollNumber: p.RollNumber || p.Student?.RollNumber,
            Email: p.StudentEmail || p.Student?.Email,
            SubjectName: p.SubjectName || p.CourseOffering?.SubjectName,
            CourseOfferingId: p.CourseOfferingId,
            CurrentScore: p.CurrentScore || p.AverageScore,
            AttendancePercentage: p.AttendancePercentage,
            PredictedScore: p.PredictedScore,
            RiskLevel: p.RiskLevel || 'Low', // Default to Low (Good) since ML not implemented
            Confidence: p.Confidence,
            RiskFactors: p.RiskFactors || [],
        }))
    }, [predictionsData])

    // Filter students
    const filteredStudents = useMemo(() => {
        return atRiskStudents.filter(student => {
            const matchesSearch = !debouncedSearch ||
                student.StudentName?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                student.RollNumber?.toLowerCase().includes(debouncedSearch.toLowerCase())

            const matchesCourse = !courseFilter ||
                student.CourseOfferingId?.toString() === courseFilter

            const matchesRisk = !riskFilter ||
                student.RiskLevel?.toLowerCase() === riskFilter

            return matchesSearch && matchesCourse && matchesRisk
        })
    }, [atRiskStudents, debouncedSearch, courseFilter, riskFilter])

    const totalCount = predictionsData?.Data?.TotalCount || filteredStudents.length
    const totalPages = Math.ceil(totalCount / pageSize)

    // Stats
    const stats = useMemo(() => ({
        total: atRiskStudents.length,
        highRisk: atRiskStudents.filter(s => s.RiskLevel?.toLowerCase() === 'high').length,
        mediumRisk: atRiskStudents.filter(s => s.RiskLevel?.toLowerCase() === 'medium').length,
        lowRisk: atRiskStudents.filter(s => s.RiskLevel?.toLowerCase() === 'low').length,
    }), [atRiskStudents])

    // Mutation for reviewing predictions
    const reviewMutation = useMutation({
        mutationFn: ({ predictionId, reviewData }) =>
            predictionService.reviewPrediction(predictionId, reviewData, user?.id),
        onSuccess: () => {
            toast.success('Performance review saved successfully')
            queryClient.invalidateQueries(['faculty-at-risk'])
            setIsReviewModalOpen(false)
            setSelectedStudent(null)
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to save review')
        },
    })

    const handleViewDetails = (student) => {
        setSelectedStudent(student)
        // For now, open review modal for viewing (since there's no separate view modal)
        setIsReviewModalOpen(true)
    }

    const handleReviewStudent = (student) => {
        setSelectedStudent(student)
        setIsReviewModalOpen(true)
    }

    const handleSaveReview = (reviewData) => {
        if (!selectedStudent?.Id) {
            toast.error('No prediction selected')
            return
        }
        reviewMutation.mutate({
            predictionId: selectedStudent.Id,
            reviewData: {
                PredictedCategory: reviewData.predictedCategory,
                RiskScore: reviewData.riskScore,
                ReviewNotes: reviewData.reviewNotes,
            },
        })
    }

    const riskOptions = [
        { value: '', label: 'All Risk Levels' },
        { value: 'high', label: 'High Risk' },
        { value: 'medium', label: 'Medium Risk' },
        { value: 'low', label: 'Low Risk' },
    ]

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl shadow-lg shadow-red-500/25">
                            <AlertTriangle className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent">
                            At-Risk Students
                        </h1>
                    </div>
                    <p className="text-gray-500 ml-14">
                        Identify and support students who may need additional help
                    </p>
                </div>
                <Button
                    variant="outline"
                    onClick={() => refetch()}
                    disabled={isLoading}
                >
                    <RefreshCcw className={cn('w-4 h-4 mr-2', isLoading && 'animate-spin')} />
                    Refresh
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Card className="border-0 shadow-sm bg-gradient-to-br from-gray-50 to-slate-100">
                    <Card.Body className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-200 rounded-lg">
                                <Users className="w-5 h-5 text-gray-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                                <p className="text-xs text-gray-500">Total Flagged</p>
                            </div>
                        </div>
                    </Card.Body>
                </Card>
                <Card className="border-0 shadow-sm bg-gradient-to-br from-red-50 to-rose-50">
                    <Card.Body className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-100 rounded-lg">
                                <AlertTriangle className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-red-600">{stats.highRisk}</p>
                                <p className="text-xs text-gray-500">High Risk</p>
                            </div>
                        </div>
                    </Card.Body>
                </Card>
                <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-amber-50">
                    <Card.Body className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-100 rounded-lg">
                                <AlertCircle className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-orange-600">{stats.mediumRisk}</p>
                                <p className="text-xs text-gray-500">Medium Risk</p>
                            </div>
                        </div>
                    </Card.Body>
                </Card>
                <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-emerald-50">
                    <Card.Body className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <TrendingUp className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-green-600">{stats.lowRisk}</p>
                                <p className="text-xs text-gray-500">Low Risk</p>
                            </div>
                        </div>
                    </Card.Body>
                </Card>
            </div>

            {/* Filters */}
            <Card className="border-0 shadow-sm">
                <Card.Body className="p-4">
                    <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                        <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full">
                            <div className="relative flex-1 max-w-sm">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search students..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                />
                            </div>
                            <select
                                value={courseFilter}
                                onChange={(e) => setCourseFilter(e.target.value)}
                                className="px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
                            >
                                <option value="">All Courses</option>
                                {courseOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                            <select
                                value={riskFilter}
                                onChange={(e) => setRiskFilter(e.target.value)}
                                className="px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
                            >
                                {riskOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">{filteredStudents.length} students</span>
                            <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={cn(
                                        'p-2 transition-colors',
                                        viewMode === 'grid' ? 'bg-red-50 text-red-600' : 'hover:bg-gray-50'
                                    )}
                                >
                                    <LayoutGrid className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={cn(
                                        'p-2 transition-colors',
                                        viewMode === 'list' ? 'bg-red-50 text-red-600' : 'hover:bg-gray-50'
                                    )}
                                >
                                    <List className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </Card.Body>
            </Card>

            {/* Content */}
            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="text-center">
                        <Loader2 className="w-10 h-10 animate-spin text-red-600 mx-auto" />
                        <p className="text-sm text-gray-500 mt-3">Analyzing student data...</p>
                    </div>
                </div>
            ) : filteredStudents.length === 0 ? (
                <EmptyState
                    icon={AlertTriangle}
                    title="No at-risk students found"
                    description={
                        searchTerm || courseFilter || riskFilter
                            ? 'Try adjusting your search or filters'
                            : 'All students are performing well in your courses!'
                    }
                />
            ) : viewMode === 'grid' ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {filteredStudents.map((student) => (
                            <AtRiskStudentCard
                                key={student.Id || `${student.StudentId}-${student.CourseOfferingId}`}
                                student={student}
                                onViewDetails={handleViewDetails}
                                onReview={handleReviewStudent}
                            />
                        ))}
                    </div>
                    {totalPages > 1 && (
                        <div className="flex justify-center">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                            />
                        </div>
                    )}
                </>
            ) : (
                <Card className="overflow-hidden border-0 shadow-md">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Student</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Course</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Score</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Attendance</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Predicted</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Risk Level</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredStudents.map((student, index) => (
                                    <AtRiskTableRow
                                        key={student.Id || `${student.StudentId}-${student.CourseOfferingId}`}
                                        student={student}
                                        onViewDetails={handleViewDetails}
                                        onReview={handleReviewStudent}
                                        index={index}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {totalPages > 1 && (
                        <div className="p-4 border-t border-gray-200 flex justify-center">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                            />
                        </div>
                    )}
                </Card>
            )}

            {/* Performance Review Modal */}
            <PerformanceReviewModal
                isOpen={isReviewModalOpen}
                onClose={() => {
                    setIsReviewModalOpen(false)
                    setSelectedStudent(null)
                }}
                student={selectedStudent}
                onSave={handleSaveReview}
                isSaving={reviewMutation.isPending}
            />
        </div>
    )
}

export default FacultyAtRiskPage
