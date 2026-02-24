import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, Button, Input, Select, Textarea } from '@/components/common'
import { LoadingInline } from '@/components/common/Spinner'
import { evaluationSchemeService } from '@/services/evaluationService'
import { courseOfferingService } from '@/services/courseOfferingService'
import { ROUTES } from '@/utils/constants'
import toast from 'react-hot-toast'
import { getErrorMessage } from '@/utils/errorHandler'
import {
    ClipboardList,
    ArrowLeft,
    Save,
    Target,
    Percent,
    BookOpen,
    FileText,
    Layers,
} from 'lucide-react'

const evaluationSchemeSchema = z.object({
    courseOfferingId: z.string().min(1, 'Please select a course offering'),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    description: z.string().optional(),
    totalMarks: z.string().min(1, 'Total marks is required'),
    passingMarks: z.string().min(1, 'Passing marks is required'),
    weight: z.string().min(1, 'Weight is required'),
    evaluationType: z.string().optional(),
    isActive: z.boolean().default(true),
})

const EvaluationSchemeFormPage = () => {
    const navigate = useNavigate()
    const { id } = useParams()
    const queryClient = useQueryClient()
    const isEdit = !!id

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        watch,
    } = useForm({
        resolver: zodResolver(evaluationSchemeSchema),
        defaultValues: {
            courseOfferingId: '',
            name: '',
            description: '',
            totalMarks: '',
            passingMarks: '',
            weight: '',
            evaluationType: '',
            isActive: true,
        },
    })

    // Fetch course offerings
    const { data: courseOfferingsData } = useQuery({
        queryKey: ['course-offerings-select'],
        queryFn: () => courseOfferingService.getAll({ pageSize: 200 }),
    })

    // Fetch evaluation scheme data for editing
    const { data: schemeData, isLoading } = useQuery({
        queryKey: ['evaluation-scheme', id],
        queryFn: () => evaluationSchemeService.getById(id),
        enabled: isEdit,
    })

    // Extract data with PascalCase
    const scheme = schemeData?.Data
    const courseOfferings = courseOfferingsData?.Data?.Data || []

    // Populate form with scheme data
    useEffect(() => {
        if (scheme) {
            reset({
                courseOfferingId: scheme.CourseOfferingId?.toString() || '',
                name: scheme.Name || '',
                description: scheme.Description || '',
                totalMarks: scheme.TotalMarks?.toString() || '',
                passingMarks: scheme.PassingMarks?.toString() || '',
                weight: scheme.Weight?.toString() || '',
                evaluationType: scheme.EvaluationType || '',
                isActive: scheme.IsActive ?? true,
            })
        }
    }, [scheme, reset])

    // Create mutation
    const createMutation = useMutation({
        mutationFn: (data) =>
            evaluationSchemeService.create({
                CourseOfferingId: parseInt(data.courseOfferingId),
                Name: data.name,
                Description: data.description || null,
                TotalMarks: parseFloat(data.totalMarks),
                PassingMarks: parseFloat(data.passingMarks),
                Weight: parseFloat(data.weight),
                EvaluationType: data.evaluationType || null,
                IsActive: data.isActive,
            }),
        onSuccess: () => {
            toast.success('Evaluation scheme created successfully')
            queryClient.invalidateQueries(['evaluation-schemes'])
            navigate(ROUTES.ADMIN_EVALUATION_SCHEMES)
        },
        onError: (error) => {
            toast.error(getErrorMessage(error))
        },
    })

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: (data) =>
            evaluationSchemeService.update(id, {
                CourseOfferingId: parseInt(data.courseOfferingId),
                Name: data.name,
                Description: data.description || null,
                TotalMarks: parseFloat(data.totalMarks),
                PassingMarks: parseFloat(data.passingMarks),
                Weight: parseFloat(data.weight),
                EvaluationType: data.evaluationType || null,
                IsActive: data.isActive,
            }),
        onSuccess: () => {
            toast.success('Evaluation scheme updated successfully')
            queryClient.invalidateQueries(['evaluation-schemes'])
            navigate(ROUTES.ADMIN_EVALUATION_SCHEMES)
        },
        onError: (error) => {
            toast.error(getErrorMessage(error))
        },
    })

    const onSubmit = (data) => {
        if (isEdit) {
            updateMutation.mutate(data)
        } else {
            createMutation.mutate(data)
        }
    }

    // Course offering options
    const courseOfferingOptions = [
        { value: '', label: 'Select Course Offering' },
        ...courseOfferings.map((c) => ({
            value: c.Id?.toString(),
            label: `${c.SubjectCode} - ${c.SubjectName} (${c.BatchName})`,
        })),
    ]

    // Evaluation type options
    const evaluationTypeOptions = [
        { value: '', label: 'Select Type' },
        { value: 'Internal', label: 'Internal' },
        { value: 'External', label: 'External' },
        { value: 'Practical', label: 'Practical' },
        { value: 'Assignment', label: 'Assignment' },
        { value: 'Project', label: 'Project' },
        { value: 'Quiz', label: 'Quiz' },
        { value: 'Midterm', label: 'Midterm' },
        { value: 'Final', label: 'Final' },
    ]

    if (isEdit && isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <LoadingInline message="Loading evaluation scheme data..." />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate(ROUTES.ADMIN_EVALUATION_SCHEMES)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-gray-500" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {isEdit ? 'Edit Evaluation Scheme' : 'Create Evaluation Scheme'}
                    </h1>
                    <p className="text-gray-500 mt-1">
                        {isEdit
                            ? 'Update evaluation scheme information'
                            : 'Define a new evaluation scheme for a course'}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Course Selection */}
                <Card className="border-0 shadow-sm">
                    <Card.Header>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                                <BookOpen className="w-5 h-5 text-teal-600" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">Course Selection</h2>
                                <p className="text-sm text-gray-500">Select the course for this evaluation scheme</p>
                            </div>
                        </div>
                    </Card.Header>
                    <Card.Body className="space-y-4">
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                                <BookOpen className="w-4 h-4 text-gray-400" />
                                Course Offering <span className="text-red-500">*</span>
                            </label>
                            <Select
                                options={courseOfferingOptions}
                                error={errors.courseOfferingId?.message}
                                {...register('courseOfferingId')}
                            />
                        </div>
                    </Card.Body>
                </Card>

                {/* Scheme Information */}
                <Card className="border-0 shadow-sm">
                    <Card.Header>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                                <ClipboardList className="w-5 h-5 text-cyan-600" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">Scheme Information</h2>
                                <p className="text-sm text-gray-500">Basic details about the evaluation scheme</p>
                            </div>
                        </div>
                    </Card.Header>
                    <Card.Body className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                                    <ClipboardList className="w-4 h-4 text-gray-400" />
                                    Scheme Name <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    placeholder="e.g., Midterm Examination"
                                    error={errors.name?.message}
                                    {...register('name')}
                                />
                            </div>
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                                    <Layers className="w-4 h-4 text-gray-400" />
                                    Evaluation Type
                                </label>
                                <Select options={evaluationTypeOptions} {...register('evaluationType')} />
                            </div>
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                                <FileText className="w-4 h-4 text-gray-400" />
                                Description
                            </label>
                            <Textarea
                                placeholder="Enter description for this evaluation scheme..."
                                rows={3}
                                {...register('description')}
                            />
                        </div>
                    </Card.Body>
                </Card>

                {/* Marks & Weight */}
                <Card className="border-0 shadow-sm">
                    <Card.Header>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                <Target className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">Marks & Weightage</h2>
                                <p className="text-sm text-gray-500">Define marks and weightage for this scheme</p>
                            </div>
                        </div>
                    </Card.Header>
                    <Card.Body className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                                    <Target className="w-4 h-4 text-gray-400" />
                                    Total Marks <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    type="number"
                                    step="0.5"
                                    placeholder="e.g., 100"
                                    error={errors.totalMarks?.message}
                                    {...register('totalMarks')}
                                />
                            </div>
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                                    <Target className="w-4 h-4 text-gray-400" />
                                    Passing Marks <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    type="number"
                                    step="0.5"
                                    placeholder="e.g., 40"
                                    error={errors.passingMarks?.message}
                                    {...register('passingMarks')}
                                />
                            </div>
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                                    <Percent className="w-4 h-4 text-gray-400" />
                                    Weight (%) <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    type="number"
                                    step="0.1"
                                    placeholder="e.g., 30"
                                    error={errors.weight?.message}
                                    {...register('weight')}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Percentage contribution to final grade
                                </p>
                            </div>
                        </div>
                    </Card.Body>
                </Card>

                {/* Status */}
                <Card className="border-0 shadow-sm">
                    <Card.Body>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div
                                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${watch('isActive') ? 'bg-emerald-100' : 'bg-gray-100'
                                        }`}
                                >
                                    <ClipboardList
                                        className={`w-5 h-5 ${watch('isActive') ? 'text-emerald-600' : 'text-gray-400'
                                            }`}
                                    />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900">Scheme Status</h3>
                                    <p className="text-sm text-gray-500">
                                        {watch('isActive')
                                            ? 'This evaluation scheme is currently active'
                                            : 'This evaluation scheme is currently inactive'}
                                    </p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    {...register('isActive')}
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                            </label>
                        </div>
                    </Card.Body>
                </Card>

                {/* Form Actions - Cancel left, Submit right */}
                <div className="flex items-center justify-end gap-4 pt-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate(ROUTES.ADMIN_EVALUATION_SCHEMES)}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        loading={createMutation.isPending || updateMutation.isPending}
                        className="gap-2"
                    >
                        <Save className="w-4 h-4" />
                        {isEdit ? 'Update Scheme' : 'Create Scheme'}
                    </Button>
                </div>
            </form>
        </div>
    )
}

export default EvaluationSchemeFormPage
