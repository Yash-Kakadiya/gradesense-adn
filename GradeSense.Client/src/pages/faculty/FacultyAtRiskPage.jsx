import { useState, useMemo, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, Badge, Button, EmptyState, Pagination, Modal } from '@/components/common'
import { useAuth } from '@/context/AuthContext'
import { useDebounce, useModal } from '@/hooks'
import { facultyAssignmentService } from '@/services/facultyAssignmentService'
import { courseEnrollmentService } from '@/services/courseEnrollmentService'
import { departmentService } from '@/services/departmentService'
import { predictionService } from '@/services/predictionService'
import { getErrorMessage } from '@/utils/errorHandler'
import StudentDetailModal from '@/components/students/StudentDetailModal'
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
const AtRiskStudentCard = ({ student, onViewDetails, onReview, onCardClick }) => {
    const handleButtonClick = (e, handler) => {
        e.stopPropagation()
        handler(student)
    }

    return (
        <Card
            className="group hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer"
            onClick={() => onCardClick && onCardClick(student)}
        >
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
                        onClick={(e) => handleButtonClick(e, onViewDetails)}
                    >
                        <Eye className="w-4 h-4 mr-2" />
                        View
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1"
                        onClick={(e) => handleButtonClick(e, onReview)}
                    >
                        <Edit3 className="w-4 h-4 mr-2" />
                        Review
                    </Button>
                </div>
            </Card.Body>
        </Card>
    )
}

// At-Risk Table Row
const AtRiskTableRow = ({ student, onViewDetails, onReview, onRowClick, index }) => {
    const handleButtonClick = (e, handler) => {
        e.stopPropagation()
        handler(student)
    }

    return (
        <tr
            className={cn(
                "hover:bg-gray-50 transition-colors cursor-pointer",
                index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
            )}
            onClick={() => onRowClick && onRowClick(student)}
        >
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
                    <Button variant="ghost" size="sm" onClick={(e) => handleButtonClick(e, onViewDetails)} title="View Details">
                        <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={(e) => handleButtonClick(e, onReview)} title="Review Performance">
                        <Edit3 className="w-4 h-4" />
                    </Button>
                </div>
            </td>
        </tr>
    )
}

// Helper function to map risk level to category
const mapRiskLevelToCategory = (riskLevel) => {
    if (!riskLevel) return 'High'
    const normalized = String(riskLevel).toLowerCase().trim()
    if (normalized === 'high' || normalized === 'at-risk') return 'High'
    if (normalized === 'medium' || normalized === 'needs-attention') return 'Medium'
    if (normalized === 'low' || normalized === 'safe') return 'Low'
    return 'High'
}

// Performance Review Modal - only rendered when open with a student
const PerformanceReviewModal = ({ onClose, student, onSave, isSaving }) => {
    // Derive initial values directly from student prop
    const initialCategory = mapRiskLevelToCategory(student.RiskLevel)

    // Simple state - no lazy initializer, no useEffect
    const [predictedCategory, setPredictedCategory] = useState(initialCategory)
    const [riskScoreInput, setRiskScoreInput] = useState(student.RiskScore?.toString() || '')
    const [reviewNotesInput, setReviewNotesInput] = useState(student.ReviewNotes || '')

    const handleSubmit = (e) => {
        e.preventDefault()
        onSave({
            predictedCategory,
            riskScore: riskScoreInput ? parseFloat(riskScoreInput) : undefined,
            reviewNotes: reviewNotesInput,
        })
    }

    const categoryOptions = [
        { value: 'High', label: 'High Risk', color: 'red' },
        { value: 'Medium', label: 'Medium Risk', color: 'orange' },
        { value: 'Low', label: 'Low Risk', color: 'green' },
    ]

    return (
        <Modal isOpen={true} onClose={onClose} title="Review Student Performance">
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
                                onClick={() => setPredictedCategory(option.value)}
                                className={cn(
                                    "px-4 py-3 rounded-lg border-2 transition-all text-sm font-medium",
                                    predictedCategory === option.value
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
                        value={reviewNotesInput}
                        onChange={(e) => setReviewNotesInput(e.target.value)}
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
    const [departmentFilter, setDepartmentFilter] = useState('')
    const [riskFilter, setRiskFilter] = useState('')
    const [viewMode, setViewMode] = useState('grid')
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(12)
    const debouncedSearch = useDebounce(searchTerm, 300)

    // Review modal state
    const [selectedStudent, setSelectedStudent] = useState(null)
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)

    // Student detail modal state
    const [isViewModalOpen, setIsViewModalOpen] = useState(false)
    const [viewStudentId, setViewStudentId] = useState(null)

    // Fetch departments for filter
    const { data: departmentsData } = useQuery({
        queryKey: ['departments-for-atrisk-filter'],
        queryFn: () => departmentService.getAll({ pageSize: 100 }),
    })

    const departments = useMemo(() =>
        departmentsData?.Data?.Data || departmentsData?.Data || [],
        [departmentsData])

    const departmentOptions = useMemo(() => [
        { value: '', label: 'All Departments' },
        ...departments.map(d => ({ value: d.Id?.toString(), label: d.Name }))
    ], [departments])

    // Fetch faculty's course assignments
    const { data: assignmentsData } = useQuery({
        queryKey: ['faculty-assignments', user?.facultyId],
        queryFn: () => facultyAssignmentService.getByFaculty(user?.facultyId),
        enabled: !!user?.facultyId,
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

    // Risk thresholds
    const getRiskLevel = (score) => {
        if (score < 40) return 'high'
        if (score < 55) return 'medium'
        return 'low'
    }

    // Fetch enrollments for faculty's courses
    const { data: enrollmentsData, isLoading, refetch } = useQuery({
        queryKey: ['faculty-at-risk-enrollments', courseIds],
        queryFn: async () => {
            if (courseIds.length === 0) return { Data: [] }
            return courseEnrollmentService.getAll({
                courseOfferingIds: courseFilter || courseIds.join(','),
                pageSize: 1000, // Get all enrollments
            })
        },
        enabled: courseIds.length > 0,
    })

    // Fetch predictions for faculty's courses
    const { data: predictionsData, refetch: refetchPredictions } = useQuery({
        queryKey: ['faculty-predictions', courseIds],
        queryFn: async () => {
            if (courseIds.length === 0) return { Data: { Data: [] } }
            // Fetch active predictions
            const result = await predictionService.getAll({
                isActive: true,
                pageSize: 1000,
            })
            return result || { Data: { Data: [] } }
        },
        enabled: courseIds.length > 0,
        staleTime: 0, // Always refetch when invalidated
    })

    // Mutation for saving faculty prediction override
    const savePredictionMutation = useMutation({
        mutationFn: (data) => predictionService.create(data),
        onSuccess: async () => {
            // Close modal first for better UX
            setIsReviewModalOpen(false)
            setSelectedStudent(null)
            toast.success('Student risk assessment saved successfully')
            // Force invalidate and refetch all prediction-related queries
            await queryClient.invalidateQueries({ queryKey: ['faculty-predictions'] })
            // Also refetch enrollments to ensure fresh data
            await queryClient.invalidateQueries({ queryKey: ['faculty-at-risk-enrollments'] })
        },
        onError: (error) => {
            toast.error(getErrorMessage(error))
        },
    })

    // Create a map of enrollment ID to prediction for quick lookup
    const predictionMap = useMemo(() => {
        const predictions = predictionsData?.Data?.Data || predictionsData?.Data || []
        const map = {}
        predictions.forEach(p => {
            // Keep only the latest prediction per enrollment (sorted by GeneratedAt desc)
            if (!map[p.CourseEnrollmentId] ||
                new Date(p.GeneratedAt) > new Date(map[p.CourseEnrollmentId].GeneratedAt)) {
                map[p.CourseEnrollmentId] = p
            }
        })
        return map
    }, [predictionsData])

    // Map backend prediction category to display risk level
    const mapCategoryToRiskLevel = (category) => {
        if (!category) return null
        const normalizedCategory = category.toLowerCase()
        if (normalizedCategory === 'at-risk') return 'high'
        if (normalizedCategory === 'needs-attention') return 'medium'
        if (normalizedCategory === 'high-achiever' || normalizedCategory === 'safe') return 'low'
        return 'low'
    }

    // Process enrollments data and calculate risk based on AverageScore
    // Merge with prediction data if available (faculty overrides)
    const atRiskStudents = useMemo(() => {
        const enrollments = enrollmentsData?.Data?.Data || enrollmentsData?.Data || []
        // Filter only students with scores below 55% (at risk threshold)
        return enrollments
            .filter(e => (e.AverageScore || 0) < 55)
            .map(e => {
                const prediction = predictionMap[e.Id]
                const calculatedRisk = getRiskLevel(e.AverageScore || 0)
                // Use prediction data if available, otherwise use calculated values
                return {
                    Id: e.Id,
                    StudentId: e.StudentId,
                    StudentName: e.StudentName,
                    RollNumber: e.RollNumber || e.EnrollmentNumber,
                    Email: e.PersonalEmail,
                    SubjectName: e.SubjectName,
                    CourseOfferingId: e.CourseOfferingId,
                    DepartmentId: e.DepartmentId,
                    DepartmentName: e.DepartmentName,
                    CurrentScore: e.AverageScore || 0,
                    AttendancePercentage: e.AttendancePercentage,
                    PredictedScore: prediction?.PredictedMarks || null,
                    // Use prediction risk level if exists, otherwise calculated
                    RiskLevel: prediction ? mapCategoryToRiskLevel(prediction.PredictedCategory) : calculatedRisk,
                    RiskScore: prediction?.RiskScore || null,
                    Confidence: prediction?.ConfidenceScore || null,
                    ReviewNotes: prediction?.RecommendedActions || '',
                    HasPrediction: !!prediction,
                    PredictionId: prediction?.Id || null,
                    RiskFactors: [],
                }
            })
    }, [enrollmentsData, predictionMap])

    // Filter students
    const filteredStudents = useMemo(() => {
        return atRiskStudents.filter(student => {
            const matchesSearch = !debouncedSearch ||
                student.StudentName?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                student.RollNumber?.toLowerCase().includes(debouncedSearch.toLowerCase())

            const matchesCourse = !courseFilter ||
                student.CourseOfferingId?.toString() === courseFilter

            const matchesDepartment = !departmentFilter ||
                student.DepartmentId?.toString() === departmentFilter

            const matchesRisk = !riskFilter ||
                student.RiskLevel?.toLowerCase() === riskFilter

            return matchesSearch && matchesCourse && matchesDepartment && matchesRisk
        })
    }, [atRiskStudents, debouncedSearch, courseFilter, departmentFilter, riskFilter])

    const totalCount = filteredStudents.length
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize) || 1)

    // Paginated students
    const paginatedStudents = useMemo(() => {
        const start = (currentPage - 1) * pageSize
        return filteredStudents.slice(start, start + pageSize)
    }, [filteredStudents, currentPage, pageSize])

    // Stats
    const stats = useMemo(() => ({
        total: atRiskStudents.length,
        highRisk: atRiskStudents.filter(s => s.RiskLevel?.toLowerCase() === 'high').length,
        mediumRisk: atRiskStudents.filter(s => s.RiskLevel?.toLowerCase() === 'medium').length,
        lowRisk: atRiskStudents.filter(s => s.RiskLevel?.toLowerCase() === 'low').length,
    }), [atRiskStudents])

    const handleViewDetails = (student) => {
        // Open StudentDetailModal with full student details
        setViewStudentId(student.StudentId)
        setIsViewModalOpen(true)
    }

    const handleRowClick = (student) => {
        // Row click shows performance review modal
        setSelectedStudent(student)
        setIsReviewModalOpen(true)
    }

    const handleCloseViewModal = () => {
        setIsViewModalOpen(false)
        setViewStudentId(null)
    }

    const handleReviewStudent = (student) => {
        setSelectedStudent(student)
        setIsReviewModalOpen(true)
    }

    const handleSaveReview = (reviewData) => {
        if (!selectedStudent?.Id) {
            toast.error('Unable to save review - missing enrollment ID')
            return
        }

        // Map frontend category to backend format and risk score
        const categoryMap = {
            'High': { category: 'At-Risk', score: 0.85 },
            'Medium': { category: 'Needs-Attention', score: 0.55 },
            'Low': { category: 'Safe', score: 0.25 },
        }
        const mapping = categoryMap[reviewData.predictedCategory] || categoryMap['High']

        savePredictionMutation.mutate({
            CourseEnrollmentId: selectedStudent.Id,
            PredictedCategory: mapping.category,
            RiskScore: reviewData.riskScore !== undefined && reviewData.riskScore !== ''
                ? parseFloat(reviewData.riskScore)
                : mapping.score,
            ConfidenceScore: 1.0, // Faculty manual override = 100% confidence
            ModelVersion: 'Faculty-Manual-Override',
            ModelAccuracy: 1.0,
            RecommendedActions: reviewData.reviewNotes || null,
            GeneratedAt: new Date().toISOString(),
            IsActive: true,
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
                    onClick={() => { refetch(); refetchPredictions(); }}
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
                                value={departmentFilter}
                                onChange={(e) => setDepartmentFilter(e.target.value)}
                                className="px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
                            >
                                {departmentOptions.map(opt => (
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
                        {paginatedStudents.map((student) => (
                            <AtRiskStudentCard
                                key={student.Id || `${student.StudentId}-${student.CourseOfferingId}`}
                                student={student}
                                onViewDetails={handleViewDetails}
                                onReview={handleReviewStudent}
                                onCardClick={handleRowClick}
                            />
                        ))}
                    </div>
                    {totalPages > 1 && (
                        <div className="flex justify-center">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                totalItems={totalCount}
                                pageSize={pageSize}
                                onPageChange={setCurrentPage}
                                onPageSizeChange={(size) => {
                                    setPageSize(size)
                                    setCurrentPage(1)
                                }}
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
                                {paginatedStudents.map((student, index) => (
                                    <AtRiskTableRow
                                        key={student.Id || `${student.StudentId}-${student.CourseOfferingId}`}
                                        student={student}
                                        onViewDetails={handleViewDetails}
                                        onReview={handleReviewStudent}
                                        onRowClick={handleRowClick}
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
                                totalItems={totalCount}
                                pageSize={pageSize}
                                onPageChange={setCurrentPage}
                                onPageSizeChange={(size) => {
                                    setPageSize(size)
                                    setCurrentPage(1)
                                }}
                            />
                        </div>
                    )}
                </Card>
            )}

            {/* Performance Review Modal - only render when open with student */}
            {isReviewModalOpen && selectedStudent && (
                <PerformanceReviewModal
                    key={`review-${selectedStudent.Id}`}
                    onClose={() => {
                        setIsReviewModalOpen(false)
                        setSelectedStudent(null)
                    }}
                    student={selectedStudent}
                    onSave={handleSaveReview}
                    isSaving={savePredictionMutation.isPending}
                />
            )}

            {/* Student Detail Modal */}
            <StudentDetailModal
                isOpen={isViewModalOpen}
                onClose={handleCloseViewModal}
                studentId={viewStudentId}
                showEditButton={false}
            />
        </div>
    )
}

export default FacultyAtRiskPage
