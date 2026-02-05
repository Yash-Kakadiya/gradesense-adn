import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, Button, Input, Select } from '@/components/common'
import { LoadingInline } from '@/components/common/Spinner'
import { courseOfferingService } from '@/services/courseOfferingService'
import { subjectService } from '@/services/subjectService'
import { batchService } from '@/services/batchService'
import { facultyService } from '@/services/facultyService'
import { ROUTES } from '@/utils/constants'
import toast from 'react-hot-toast'
import {
    BookOpen,
    ArrowLeft,
    Save,
    Calendar,
    Users,
    GraduationCap,
    User,
    Layers,
} from 'lucide-react'

const courseOfferingSchema = z.object({
    subjectId: z.string().min(1, 'Please select a subject'),
    batchId: z.string().min(1, 'Please select a batch'),
    subjectCoordinatorId: z.string().optional(),
    academicYear: z.string().min(1, 'Academic year is required'),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    maxEnrollment: z.string().optional(),
    isActive: z.boolean().default(true),
})

const CourseOfferingFormPage = () => {
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
        resolver: zodResolver(courseOfferingSchema),
        defaultValues: {
            subjectId: '',
            batchId: '',
            subjectCoordinatorId: '',
            academicYear: new Date().getFullYear().toString(),
            startDate: '',
            endDate: '',
            maxEnrollment: '',
            isActive: true,
        },
    })

    // Fetch subjects
    const { data: subjectsData } = useQuery({
        queryKey: ['subjects-select'],
        queryFn: () => subjectService.getAll({ pageSize: 200 }),
    })

    // Fetch batches
    const { data: batchesData } = useQuery({
        queryKey: ['batches-select'],
        queryFn: () => batchService.getAll({ pageSize: 100 }),
    })

    // Fetch faculties (for coordinator selection)
    const { data: facultiesData } = useQuery({
        queryKey: ['faculties-select'],
        queryFn: () => facultyService.getAll({ pageSize: 200 }),
    })

    // Fetch course offering data for editing
    const { data: courseOfferingData, isLoading } = useQuery({
        queryKey: ['course-offering', id],
        queryFn: () => courseOfferingService.getById(id),
        enabled: isEdit,
    })

    // Extract data with PascalCase
    const courseOffering = courseOfferingData?.Data
    const subjects = subjectsData?.Data?.Data || []
    const batches = batchesData?.Data?.Data || []
    const faculties = facultiesData?.Data?.Data || []

    // Format date for input (yyyy-MM-dd)
    const formatDateForInput = (dateString) => {
        if (!dateString) return ''
        const date = new Date(dateString)
        return date.toISOString().split('T')[0]
    }

    // Populate form with course offering data
    useEffect(() => {
        if (courseOffering) {
            reset({
                subjectId: courseOffering.SubjectId?.toString() || '',
                batchId: courseOffering.BatchId?.toString() || '',
                subjectCoordinatorId: courseOffering.SubjectCoordinatorId?.toString() || '',
                academicYear: courseOffering.AcademicYear?.toString() || '',
                startDate: formatDateForInput(courseOffering.StartDate),
                endDate: formatDateForInput(courseOffering.EndDate),
                maxEnrollment: courseOffering.MaxEnrollment?.toString() || '',
                isActive: courseOffering.IsActive ?? true,
            })
        }
    }, [courseOffering, reset])

    // Create mutation
    const createMutation = useMutation({
        mutationFn: (data) =>
            courseOfferingService.create({
                SubjectId: parseInt(data.subjectId),
                BatchId: parseInt(data.batchId),
                SubjectCoordinatorId: data.subjectCoordinatorId
                    ? parseInt(data.subjectCoordinatorId)
                    : null,
                AcademicYear: parseInt(data.academicYear),
                StartDate: data.startDate || null,
                EndDate: data.endDate || null,
                MaxEnrollment: data.maxEnrollment ? parseInt(data.maxEnrollment) : null,
                IsActive: data.isActive,
            }),
        onSuccess: () => {
            toast.success('Course offering created successfully')
            queryClient.invalidateQueries(['course-offerings'])
            navigate(ROUTES.ADMIN_COURSE_OFFERINGS)
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to create course offering')
        },
    })

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: (data) =>
            courseOfferingService.update(id, {
                SubjectId: parseInt(data.subjectId),
                BatchId: parseInt(data.batchId),
                SubjectCoordinatorId: data.subjectCoordinatorId
                    ? parseInt(data.subjectCoordinatorId)
                    : null,
                AcademicYear: parseInt(data.academicYear),
                StartDate: data.startDate || null,
                EndDate: data.endDate || null,
                MaxEnrollment: data.maxEnrollment ? parseInt(data.maxEnrollment) : null,
                IsActive: data.isActive,
            }),
        onSuccess: () => {
            toast.success('Course offering updated successfully')
            queryClient.invalidateQueries(['course-offerings'])
            navigate(ROUTES.ADMIN_COURSE_OFFERINGS)
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to update course offering')
        },
    })

    const onSubmit = (data) => {
        if (isEdit) {
            updateMutation.mutate(data)
        } else {
            createMutation.mutate(data)
        }
    }

    // Generate academic year options (current year ± 5 years)
    const currentYear = new Date().getFullYear()
    const academicYearOptions = [
        { value: '', label: 'Select Academic Year' },
        ...Array.from({ length: 11 }, (_, i) => {
            const year = currentYear - 5 + i
            return { value: year.toString(), label: year.toString() }
        }),
    ]

    // Subject options
    const subjectOptions = [
        { value: '', label: 'Select Subject' },
        ...subjects.map((s) => ({
            value: s.Id?.toString(),
            label: `${s.Code} - ${s.Name}`,
        })),
    ]

    // Batch options
    const batchOptions = [
        { value: '', label: 'Select Batch' },
        ...batches.map((b) => ({
            value: b.Id?.toString(),
            label: b.Name,
        })),
    ]

    // Faculty options (for coordinator)
    const coordinatorOptions = [
        { value: '', label: 'Not Assigned' },
        ...faculties.map((f) => ({
            value: f.Id?.toString(),
            label: `${f.EmployeeId} - ${f.FirstName} ${f.LastName}`,
        })),
    ]

    if (isEdit && isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <LoadingInline message="Loading course offering data..." />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate(ROUTES.ADMIN_COURSE_OFFERINGS)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-gray-500" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {isEdit ? 'Edit Course Offering' : 'Create Course Offering'}
                    </h1>
                    <p className="text-gray-500 mt-1">
                        {isEdit
                            ? 'Update course offering information'
                            : 'Assign a subject to a batch for a specific academic year'}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Course Assignment */}
                <Card className="border-0 shadow-sm">
                    <Card.Header>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                                <BookOpen className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">Course Assignment</h2>
                                <p className="text-sm text-gray-500">Select subject and batch for this offering</p>
                            </div>
                        </div>
                    </Card.Header>
                    <Card.Body className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                                    <BookOpen className="w-4 h-4 text-gray-400" />
                                    Subject <span className="text-red-500">*</span>
                                </label>
                                <Select
                                    options={subjectOptions}
                                    error={errors.subjectId?.message}
                                    {...register('subjectId')}
                                />
                            </div>
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                                    <GraduationCap className="w-4 h-4 text-gray-400" />
                                    Batch <span className="text-red-500">*</span>
                                </label>
                                <Select
                                    options={batchOptions}
                                    error={errors.batchId?.message}
                                    {...register('batchId')}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                                    <User className="w-4 h-4 text-gray-400" />
                                    Subject Coordinator
                                </label>
                                <Select
                                    options={coordinatorOptions}
                                    {...register('subjectCoordinatorId')}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Faculty member responsible for coordinating this course
                                </p>
                            </div>
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                                    <Calendar className="w-4 h-4 text-gray-400" />
                                    Academic Year <span className="text-red-500">*</span>
                                </label>
                                <Select
                                    options={academicYearOptions}
                                    error={errors.academicYear?.message}
                                    {...register('academicYear')}
                                />
                            </div>
                        </div>
                    </Card.Body>
                </Card>

                {/* Schedule & Enrollment */}
                <Card className="border-0 shadow-sm">
                    <Card.Header>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                <Calendar className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">Schedule & Enrollment</h2>
                                <p className="text-sm text-gray-500">Course duration and enrollment limits</p>
                            </div>
                        </div>
                    </Card.Header>
                    <Card.Body className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                                    <Calendar className="w-4 h-4 text-gray-400" />
                                    Start Date
                                </label>
                                <Input type="date" {...register('startDate')} />
                            </div>
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                                    <Calendar className="w-4 h-4 text-gray-400" />
                                    End Date
                                </label>
                                <Input type="date" {...register('endDate')} />
                            </div>
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                                    <Users className="w-4 h-4 text-gray-400" />
                                    Max Enrollment
                                </label>
                                <Input
                                    type="number"
                                    placeholder="Leave empty for unlimited"
                                    {...register('maxEnrollment')}
                                />
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
                                    <Layers
                                        className={`w-5 h-5 ${watch('isActive') ? 'text-emerald-600' : 'text-gray-400'
                                            }`}
                                    />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900">Course Offering Status</h3>
                                    <p className="text-sm text-gray-500">
                                        {watch('isActive')
                                            ? 'This course offering is currently active and available for enrollment'
                                            : 'This course offering is currently inactive'}
                                    </p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    {...register('isActive')}
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                            </label>
                        </div>
                    </Card.Body>
                </Card>

                {/* Form Actions - Cancel left, Submit right */}
                <div className="flex items-center justify-end gap-4 pt-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate(ROUTES.ADMIN_COURSE_OFFERINGS)}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        loading={createMutation.isPending || updateMutation.isPending}
                        className="gap-2"
                    >
                        <Save className="w-4 h-4" />
                        {isEdit ? 'Update Course Offering' : 'Create Course Offering'}
                    </Button>
                </div>
            </form>
        </div>
    )
}

export default CourseOfferingFormPage
