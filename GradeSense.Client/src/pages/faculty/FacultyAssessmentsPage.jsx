import { useState, useMemo, useCallback, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, Badge, Button, EmptyState, Modal, Pagination } from '@/components/common'
import { useAuth } from '@/context/AuthContext'
import { facultyAssignmentService } from '@/services/facultyAssignmentService'
import { assessmentItemService, evaluationSchemeService } from '@/services/evaluationService'
import { useDebounce } from '@/hooks'
import { cn } from '@/utils/helpers'
import { getErrorMessage } from '@/utils/errorHandler'
import toast from 'react-hot-toast'
import {
    FileText,
    Plus,
    Search,
    Edit,
    Trash2,
    Loader2,
    Calendar,
    Target,
    ClipboardCheck,
    RefreshCcw,
    BookOpen,
    Filter,
    Eye,
    Clock,
    CheckCircle,
    AlertCircle,
    MoreVertical,
    Star,
} from 'lucide-react'

// Assessment Card Component
const AssessmentCard = ({ assessment, onEdit, onDelete, onView }) => {
    const isOverdue = assessment.DueDate && new Date(assessment.DueDate) < new Date()
    const isPending = !isOverdue && assessment.DueDate && new Date(assessment.DueDate) > new Date()

    return (
        <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
            {/* Top colored bar */}
            <div className={cn(
                "h-1.5",
                isOverdue ? "bg-gradient-to-r from-red-400 to-orange-500" :
                    isPending ? "bg-gradient-to-r from-blue-400 to-indigo-500" :
                        "bg-gradient-to-r from-emerald-400 to-teal-500"
            )} />

            <Card.Body className="p-4">
                <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 line-clamp-1">{assessment.Name}</h3>
                        <p className="text-sm text-gray-500 line-clamp-1">{assessment.SubjectName}</p>
                    </div>
                    <Badge
                        variant={assessment.IsActive ? 'success' : 'secondary'}
                        className="text-xs"
                    >
                        {assessment.IsActive ? 'Active' : 'Inactive'}
                    </Badge>
                </div>

                {assessment.Description && (
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">{assessment.Description}</p>
                )}

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <p className="text-lg font-bold text-gray-900">{assessment.MaxMarks}</p>
                        <p className="text-xs text-gray-500">Max Marks</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <p className="text-lg font-bold text-gray-900">{assessment.Weight || '-'}%</p>
                        <p className="text-xs text-gray-500">Weight</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <p className="text-sm font-bold text-gray-900 truncate">{assessment.CalculationType}</p>
                        <p className="text-xs text-gray-500">Type</p>
                    </div>
                </div>

                {/* Dates */}
                <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                    {assessment.ScheduledDate && (
                        <div className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Scheduled: {new Date(assessment.ScheduledDate).toLocaleDateString()}</span>
                        </div>
                    )}
                    {assessment.DueDate && (
                        <div className={cn(
                            "flex items-center gap-1",
                            isOverdue && "text-red-500 font-medium"
                        )}>
                            <Clock className="w-3.5 h-3.5" />
                            <span>Due: {new Date(assessment.DueDate).toLocaleDateString()}</span>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                    <Button variant="ghost" size="sm" className="flex-1" onClick={() => onView(assessment)}>
                        <Eye className="w-4 h-4 mr-1" /> View
                    </Button>
                    <Button variant="ghost" size="sm" className="flex-1" onClick={() => onEdit(assessment)}>
                        <Edit className="w-4 h-4 mr-1" /> Edit
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => onDelete(assessment)}
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            </Card.Body>
        </Card>
    )
}

// Assessment Form Modal
const AssessmentFormModal = ({ isOpen, onClose, assessment, evaluationSchemes, onSubmit, isLoading }) => {
    const [formData, setFormData] = useState({
        evaluationSchemeId: assessment?.EvaluationSchemeId?.toString() || '',
        name: assessment?.Name || '',
        description: assessment?.Description || '',
        maxMarks: assessment?.MaxMarks?.toString() || '',
        weight: assessment?.Weight?.toString() || '',
        calculationType: assessment?.CalculationType || 'Raw',
        scheduledDate: assessment?.ScheduledDate || '',
        dueDate: assessment?.DueDate || '',
        isActive: assessment?.IsActive ?? true,
    })

    // Update form data when assessment prop changes (for edit mode)
    useEffect(() => {
        if (assessment) {
            setFormData({
                evaluationSchemeId: assessment.EvaluationSchemeId?.toString() || '',
                name: assessment.Name || '',
                description: assessment.Description || '',
                maxMarks: assessment.MaxMarks?.toString() || '',
                weight: assessment.Weight?.toString() || '',
                calculationType: assessment.CalculationType || 'Raw',
                scheduledDate: assessment.ScheduledDate ? assessment.ScheduledDate.split('T')[0] : '',
                dueDate: assessment.DueDate ? assessment.DueDate.split('T')[0] : '',
                isActive: assessment.IsActive ?? true,
            })
        } else {
            // Reset to empty form for create mode
            setFormData({
                evaluationSchemeId: '',
                name: '',
                description: '',
                maxMarks: '',
                weight: '',
                calculationType: 'Raw',
                scheduledDate: '',
                dueDate: '',
                isActive: true,
            })
        }
    }, [assessment])

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        onSubmit({
            ...formData,
            evaluationSchemeId: parseInt(formData.evaluationSchemeId),
            maxMarks: parseFloat(formData.maxMarks),
            weight: formData.weight ? parseFloat(formData.weight) : null,
            scheduledDate: formData.scheduledDate || null,
            dueDate: formData.dueDate || null,
        })
    }

    const calculationTypes = ['Raw', 'Average', 'BestOf']

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={assessment ? 'Edit Assessment' : 'Create Assessment'} size="lg">
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Evaluation Scheme */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Evaluation Scheme <span className="text-red-500">*</span>
                    </label>
                    <select
                        value={formData.evaluationSchemeId}
                        onChange={(e) => handleChange('evaluationSchemeId', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                    >
                        <option value="">Select scheme...</option>
                        {evaluationSchemes.map(scheme => (
                            <option key={scheme.Id} value={scheme.Id.toString()}>{scheme.Name} - {scheme.SubjectName}</option>
                        ))}
                    </select>
                </div>

                {/* Name */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Assessment Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., Quiz 1, Unit Test 1, Assignment 1"
                        required
                    />
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => handleChange('description', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        rows={2}
                        placeholder="Optional description..."
                    />
                </div>

                {/* Max Marks, Weight, Type */}
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Max Marks <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            value={formData.maxMarks}
                            onChange={(e) => handleChange('maxMarks', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            min="1"
                            step="0.5"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Weight (%)</label>
                        <input
                            type="number"
                            value={formData.weight}
                            onChange={(e) => handleChange('weight', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            min="0"
                            max="100"
                            step="0.1"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                        <select
                            value={formData.calculationType}
                            onChange={(e) => handleChange('calculationType', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            {calculationTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Date</label>
                        <input
                            type="date"
                            value={formData.scheduledDate}
                            onChange={(e) => handleChange('scheduledDate', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                        <input
                            type="date"
                            value={formData.dueDate}
                            onChange={(e) => handleChange('dueDate', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Is Active */}
                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="isActive"
                        checked={formData.isActive}
                        onChange={(e) => handleChange('isActive', e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="isActive" className="text-sm text-gray-700">Active assessment</label>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                    <Button type="submit" variant="primary" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                {assessment ? 'Update' : 'Create'}
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </Modal>
    )
}

// Assessment Detail Modal
const AssessmentDetailModal = ({ isOpen, onClose, assessment }) => {
    if (!assessment) return null

    const isOverdue = assessment.DueDate && new Date(assessment.DueDate) < new Date()

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Assessment Details" size="lg">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
                        <FileText className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-xl font-semibold text-gray-900">{assessment.Name}</h3>
                            <Badge variant={assessment.IsActive ? 'success' : 'secondary'}>
                                {assessment.IsActive ? 'Active' : 'Inactive'}
                            </Badge>
                        </div>
                        <p className="text-gray-500">{assessment.SubjectName}</p>
                    </div>
                </div>

                {/* Description */}
                {assessment.Description && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-gray-600">{assessment.Description}</p>
                    </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-blue-50 rounded-xl text-center">
                        <Target className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-gray-900">{assessment.MaxMarks}</p>
                        <p className="text-sm text-gray-500">Max Marks</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-xl text-center">
                        <Star className="w-6 h-6 text-green-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-gray-900">{assessment.Weight || '-'}%</p>
                        <p className="text-sm text-gray-500">Weight</p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-xl text-center">
                        <ClipboardCheck className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                        <p className="text-lg font-bold text-gray-900">{assessment.CalculationType}</p>
                        <p className="text-sm text-gray-500">Type</p>
                    </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                    {assessment.ScheduledDate && (
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <Calendar className="w-5 h-5 text-gray-400" />
                            <div>
                                <p className="text-xs text-gray-500">Scheduled Date</p>
                                <p className="text-sm font-medium text-gray-900">
                                    {new Date(assessment.ScheduledDate).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    )}
                    {assessment.DueDate && (
                        <div className={cn(
                            "flex items-center gap-3 p-3 rounded-lg",
                            isOverdue ? "bg-red-50" : "bg-gray-50"
                        )}>
                            <Clock className={cn("w-5 h-5", isOverdue ? "text-red-500" : "text-gray-400")} />
                            <div>
                                <p className="text-xs text-gray-500">Due Date</p>
                                <p className={cn(
                                    "text-sm font-medium",
                                    isOverdue ? "text-red-600" : "text-gray-900"
                                )}>
                                    {new Date(assessment.DueDate).toLocaleDateString()}
                                    {isOverdue && <span className="ml-1 text-xs">(Overdue)</span>}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Evaluation Scheme Info */}
                <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Evaluation Scheme:</span>
                        <span className="font-medium">{assessment.EvaluationSchemeName || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Assessment ID:</span>
                        <span className="font-medium">{assessment.Id}</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t">
                    <Button variant="outline" className="flex-1" onClick={onClose}>
                        Close
                    </Button>
                </div>
            </div>
        </Modal>
    )
}

const FacultyAssessmentsPage = () => {
    const queryClient = useQueryClient()
    const { user } = useAuth()
    const [searchTerm, setSearchTerm] = useState('')
    const [schemeFilter, setSchemeFilter] = useState('')
    const [typeFilter, setTypeFilter] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [selectedAssessment, setSelectedAssessment] = useState(null)
    const [deleteTarget, setDeleteTarget] = useState(null)
    const [viewAssessment, setViewAssessment] = useState(null)
    const [isViewModalOpen, setIsViewModalOpen] = useState(false)
    const pageSize = 12
    const debouncedSearch = useDebounce(searchTerm, 300)

    // Fetch faculty's courses
    const { data: assignmentsData } = useQuery({
        queryKey: ['faculty-assignments', user?.id],
        queryFn: () => facultyAssignmentService.getByFaculty(user?.id),
        enabled: !!user?.id,
    })

    // Get course offering IDs
    const courseOfferingIds = useMemo(() => {
        const data = assignmentsData?.Data?.Data || assignmentsData?.Data || []
        return data.map(a => a.CourseOfferingId).filter(Boolean)
    }, [assignmentsData])

    // Fetch evaluation schemes for faculty's courses
    const { data: schemesData } = useQuery({
        queryKey: ['faculty-evaluation-schemes', courseOfferingIds],
        queryFn: async () => {
            if (courseOfferingIds.length === 0) return { Data: [] }
            return evaluationSchemeService.getAll({ courseOfferingIds: courseOfferingIds.join(','), pageSize: 1000 })
        },
        enabled: courseOfferingIds.length > 0,
    })

    const evaluationSchemes = useMemo(() => {
        return schemesData?.Data?.Data || schemesData?.Data || []
    }, [schemesData])

    // Fetch assessment items
    const { data: assessmentsData, isLoading, refetch } = useQuery({
        queryKey: ['faculty-assessments', evaluationSchemes.map(s => s.Id), currentPage, pageSize],
        queryFn: async () => {
            if (evaluationSchemes.length === 0) return { Data: [], TotalCount: 0 }
            const schemeIds = schemeFilter || evaluationSchemes.map(s => s.Id).join(',')
            return assessmentItemService.getAll({
                evaluationSchemeIds: schemeIds,
                pageNumber: currentPage,
                pageSize,
            })
        },
        enabled: evaluationSchemes.length > 0,
    })

    const assessments = useMemo(() => {
        return assessmentsData?.Data?.Data || assessmentsData?.Data || []
    }, [assessmentsData])

    // Filter assessments
    const filteredAssessments = useMemo(() => {
        return assessments.filter(assessment => {
            const matchesSearch = !debouncedSearch ||
                assessment.Name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                assessment.SubjectName?.toLowerCase().includes(debouncedSearch.toLowerCase())

            const matchesScheme = !schemeFilter ||
                assessment.EvaluationSchemeId?.toString() === schemeFilter

            const matchesType = !typeFilter ||
                assessment.CalculationType === typeFilter

            return matchesSearch && matchesScheme && matchesType
        })
    }, [assessments, debouncedSearch, schemeFilter, typeFilter])

    const totalCount = assessmentsData?.Data?.TotalCount || filteredAssessments.length
    const totalPages = Math.ceil(totalCount / pageSize)

    // Stats
    const stats = useMemo(() => ({
        total: assessments.length,
        active: assessments.filter(a => a.IsActive).length,
        upcoming: assessments.filter(a => a.DueDate && new Date(a.DueDate) > new Date()).length,
        overdue: assessments.filter(a => a.DueDate && new Date(a.DueDate) < new Date()).length,
    }), [assessments])

    // Unique calculation types for filter
    const calculationTypes = useMemo(() => {
        return [...new Set(assessments.map(a => a.CalculationType).filter(Boolean))]
    }, [assessments])

    // Create mutation
    const createMutation = useMutation({
        mutationFn: (data) => assessmentItemService.create(data),
        onSuccess: () => {
            toast.success('Assessment created successfully')
            queryClient.invalidateQueries(['faculty-assessments'])
            setIsFormOpen(false)
        },
        onError: (error) => {
            toast.error(getErrorMessage(error))
        },
    })

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => assessmentItemService.update(id, data),
        onSuccess: () => {
            toast.success('Assessment updated successfully')
            queryClient.invalidateQueries(['faculty-assessments'])
            setIsFormOpen(false)
            setSelectedAssessment(null)
        },
        onError: (error) => {
            toast.error(getErrorMessage(error))
        },
    })

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: (id) => assessmentItemService.delete(id),
        onSuccess: () => {
            toast.success('Assessment deleted successfully')
            queryClient.invalidateQueries(['faculty-assessments'])
            setDeleteTarget(null)
        },
        onError: (error) => {
            toast.error(getErrorMessage(error))
        },
    })

    const handleCreate = () => {
        setSelectedAssessment(null)
        setIsFormOpen(true)
    }

    const handleEdit = (assessment) => {
        setSelectedAssessment(assessment)
        setIsFormOpen(true)
    }

    const handleDelete = (assessment) => {
        setDeleteTarget(assessment)
    }

    const handleView = (assessment) => {
        setViewAssessment(assessment)
        setIsViewModalOpen(true)
    }

    const handleSubmit = (data) => {
        if (selectedAssessment) {
            updateMutation.mutate({ id: selectedAssessment.Id, data })
        } else {
            createMutation.mutate(data)
        }
    }

    const confirmDelete = () => {
        if (deleteTarget) {
            deleteMutation.mutate(deleteTarget.Id)
        }
    }

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl shadow-lg shadow-violet-500/25">
                            <ClipboardCheck className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent">
                            Assessments
                        </h1>
                    </div>
                    <p className="text-gray-500 ml-14">
                        Create and manage assessments for your courses
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={() => refetch()}
                        disabled={isLoading}
                    >
                        <RefreshCcw className={cn('w-4 h-4 mr-2', isLoading && 'animate-spin')} />
                        Refresh
                    </Button>
                    <Button variant="primary" onClick={handleCreate}>
                        <Plus className="w-4 h-4 mr-2" />
                        New Assessment
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50">
                    <Card.Body className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <FileText className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                                <p className="text-xs text-gray-500">Total</p>
                            </div>
                        </div>
                    </Card.Body>
                </Card>
                <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-teal-50">
                    <Card.Body className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-100 rounded-lg">
                                <CheckCircle className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
                                <p className="text-xs text-gray-500">Active</p>
                            </div>
                        </div>
                    </Card.Body>
                </Card>
                <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-orange-50">
                    <Card.Body className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-100 rounded-lg">
                                <Clock className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{stats.upcoming}</p>
                                <p className="text-xs text-gray-500">Upcoming</p>
                            </div>
                        </div>
                    </Card.Body>
                </Card>
                <Card className="border-0 shadow-sm bg-gradient-to-br from-red-50 to-rose-50">
                    <Card.Body className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-100 rounded-lg">
                                <AlertCircle className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{stats.overdue}</p>
                                <p className="text-xs text-gray-500">Overdue</p>
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
                                    placeholder="Search assessments..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                />
                            </div>
                            <select
                                value={schemeFilter}
                                onChange={(e) => setSchemeFilter(e.target.value)}
                                className="px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                            >
                                <option value="">All Courses</option>
                                {evaluationSchemes.map(scheme => (
                                    <option key={scheme.Id} value={scheme.Id}>{scheme.SubjectName}</option>
                                ))}
                            </select>
                            <select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className="px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                            >
                                <option value="">All Types</option>
                                {calculationTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>
                        <span className="text-sm text-gray-500">{filteredAssessments.length} assessments</span>
                    </div>
                </Card.Body>
            </Card>

            {/* Content */}
            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="text-center">
                        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto" />
                        <p className="text-sm text-gray-500 mt-3">Loading assessments...</p>
                    </div>
                </div>
            ) : filteredAssessments.length === 0 ? (
                <EmptyState
                    icon={ClipboardCheck}
                    title="No assessments found"
                    description={
                        searchTerm || schemeFilter || typeFilter
                            ? 'Try adjusting your search or filters'
                            : 'Create your first assessment to get started'
                    }
                    action={
                        !searchTerm && !schemeFilter && !typeFilter ? (
                            <Button variant="primary" onClick={handleCreate}>
                                <Plus className="w-4 h-4 mr-2" />
                                Create Assessment
                            </Button>
                        ) : null
                    }
                />
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {filteredAssessments.map((assessment) => (
                            <AssessmentCard
                                key={assessment.Id}
                                assessment={assessment}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                onView={handleView}
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
            )}

            {/* Create/Edit Modal */}
            {isFormOpen && (
                <AssessmentFormModal
                    isOpen={isFormOpen}
                    onClose={() => {
                        setIsFormOpen(false)
                        setSelectedAssessment(null)
                    }}
                    assessment={selectedAssessment}
                    evaluationSchemes={evaluationSchemes}
                    onSubmit={handleSubmit}
                    isLoading={createMutation.isPending || updateMutation.isPending}
                />
            )}

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                title="Delete Assessment"
                size="sm"
            >
                <div className="space-y-4">
                    <div className="p-4 bg-red-50 rounded-lg">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="w-6 h-6 text-red-500" />
                            <p className="text-red-700">
                                Are you sure you want to delete <strong>{deleteTarget?.Name}</strong>?
                            </p>
                        </div>
                    </div>
                    <p className="text-sm text-gray-500">
                        This will also remove all grades associated with this assessment. This action cannot be undone.
                    </p>
                    <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
                        <Button
                            variant="danger"
                            onClick={confirmDelete}
                            disabled={deleteMutation.isPending}
                        >
                            {deleteMutation.isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Assessment Detail Modal */}
            <AssessmentDetailModal
                isOpen={isViewModalOpen}
                onClose={() => {
                    setIsViewModalOpen(false)
                    setViewAssessment(null)
                }}
                assessment={viewAssessment}
            />
        </div>
    )
}

export default FacultyAssessmentsPage
