import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, Button, Input, Select, Textarea } from '@/components/common'
import { LoadingInline } from '@/components/common/Spinner'
import { subjectService } from '@/services/subjectService'
import { departmentService } from '@/services/departmentService'
import { ROUTES } from '@/utils/constants'
import toast from 'react-hot-toast'
import { getErrorMessage } from '@/utils/errorHandler'
import {
    BookOpen,
    ArrowLeft,
    Save,
    Hash,
    Building2,
    GraduationCap,
    Layers,
    Calendar,
    FileText,
    GitBranch,
    Award,
} from 'lucide-react'

const subjectSchema = z.object({
    code: z.string().min(2, 'Code must be at least 2 characters'),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    credit: z.string().min(1, 'Credit is required'),
    departmentId: z.string().min(1, 'Please select a department'),
    semester: z.string().optional(),
    subjectType: z.string().optional(),
    isElective: z.boolean().default(false),
    prerequisiteSubjectId: z.string().optional(),
    description: z.string().optional(),
    syllabus: z.string().optional(),
    isActive: z.boolean().default(true),
})

const SubjectFormPage = () => {
    const navigate = useNavigate()
    const { id } = useParams()
    const queryClient = useQueryClient()
    const isEdit = !!id

    const [availableSubjects, setAvailableSubjects] = useState([])

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        watch,
    } = useForm({
        resolver: zodResolver(subjectSchema),
        defaultValues: {
            code: '',
            name: '',
            credit: '',
            departmentId: '',
            semester: '',
            subjectType: '',
            isElective: false,
            prerequisiteSubjectId: '',
            description: '',
            syllabus: '',
            isActive: true,
        },
    })

    const selectedDepartmentId = watch('departmentId')

    // Fetch departments
    const { data: departmentsData } = useQuery({
        queryKey: ['departments-select'],
        queryFn: () => departmentService.getAll({ pageSize: 100 }),
    })

    // Fetch subjects for prerequisite selection (only from same department)
    const { data: subjectsData } = useQuery({
        queryKey: ['subjects-select', selectedDepartmentId],
        queryFn: () => subjectService.getAllForSelect(selectedDepartmentId || null),
        enabled: true,
    })

    // Fetch subject data for editing
    const { data: subjectData, isLoading } = useQuery({
        queryKey: ['subject', id],
        queryFn: () => subjectService.getById(id),
        enabled: isEdit,
    })

    // Extract data with PascalCase
    const subject = subjectData?.Data
    const departments = departmentsData?.Data?.Data || []
    const allSubjects = subjectsData?.Data?.Data || []

    // Filter out current subject from prerequisite options
    useEffect(() => {
        const filtered = allSubjects.filter((s) => s.Id?.toString() !== id)
        setAvailableSubjects(filtered)
    }, [allSubjects, id])

    // Populate form with subject data
    useEffect(() => {
        if (subject) {
            reset({
                code: subject.Code || '',
                name: subject.Name || '',
                credit: subject.Credit?.toString() || '',
                departmentId: subject.DepartmentId?.toString() || '',
                semester: subject.Semester?.toString() || '',
                subjectType: subject.SubjectType || '',
                isElective: subject.IsElective ?? false,
                prerequisiteSubjectId: subject.PrerequisiteSubjectId?.toString() || '',
                description: subject.Description || '',
                syllabus: subject.Syllabus || '',
                isActive: subject.IsActive ?? true,
            })
        }
    }, [subject, reset])

    // Create mutation
    const createMutation = useMutation({
        mutationFn: (data) =>
            subjectService.create({
                Code: data.code,
                Name: data.name,
                Credit: parseFloat(data.credit),
                DepartmentId: parseInt(data.departmentId),
                Semester: data.semester ? parseInt(data.semester) : null,
                SubjectType: data.subjectType || null,
                IsElective: data.isElective,
                PrerequisiteSubjectId: data.prerequisiteSubjectId
                    ? parseInt(data.prerequisiteSubjectId)
                    : null,
                Description: data.description || null,
                Syllabus: data.syllabus || null,
                IsActive: data.isActive,
            }),
        onSuccess: () => {
            toast.success('Subject created successfully')
            queryClient.invalidateQueries(['subjects'])
            navigate(ROUTES.ADMIN_SUBJECTS)
        },
        onError: (error) => {
            toast.error(getErrorMessage(error))
        },
    })

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: (data) =>
            subjectService.update(id, {
                Code: data.code,
                Name: data.name,
                Credit: parseFloat(data.credit),
                DepartmentId: parseInt(data.departmentId),
                Semester: data.semester ? parseInt(data.semester) : null,
                SubjectType: data.subjectType || null,
                IsElective: data.isElective,
                PrerequisiteSubjectId: data.prerequisiteSubjectId
                    ? parseInt(data.prerequisiteSubjectId)
                    : null,
                Description: data.description || null,
                Syllabus: data.syllabus || null,
                IsActive: data.isActive,
            }),
        onSuccess: () => {
            toast.success('Subject updated successfully')
            queryClient.invalidateQueries(['subjects'])
            navigate(ROUTES.ADMIN_SUBJECTS)
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

    // Options
    const departmentOptions = [
        { value: '', label: 'Select Department' },
        ...departments.map((d) => ({
            value: d.Id?.toString(),
            label: d.Name,
        })),
    ]

    const subjectTypeOptions = [
        { value: '', label: 'Select Type' },
        { value: 'Core', label: 'Core' },
        { value: 'Elective', label: 'Elective' },
        { value: 'Lab', label: 'Lab' },
        { value: 'Project', label: 'Project' },
    ]

    const semesterOptions = [
        { value: '', label: 'Select Semester' },
        { value: '1', label: 'Semester 1' },
        { value: '2', label: 'Semester 2' },
        { value: '3', label: 'Semester 3' },
        { value: '4', label: 'Semester 4' },
        { value: '5', label: 'Semester 5' },
        { value: '6', label: 'Semester 6' },
        { value: '7', label: 'Semester 7' },
        { value: '8', label: 'Semester 8' },
    ]

    const prerequisiteOptions = [
        { value: '', label: 'None' },
        ...availableSubjects.map((s) => ({
            value: s.Id?.toString(),
            label: `${s.Code} - ${s.Name}`,
        })),
    ]

    if (isEdit && isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <LoadingInline message="Loading subject data..." />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate(ROUTES.ADMIN_SUBJECTS)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-gray-500" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {isEdit ? 'Edit Subject' : 'Create Subject'}
                    </h1>
                    <p className="text-gray-500 mt-1">
                        {isEdit ? 'Update subject information' : 'Add a new subject to the system'}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Basic Information */}
                <Card className="border-0 shadow-sm">
                    <Card.Header>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                                <BookOpen className="w-5 h-5 text-violet-600" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
                                <p className="text-sm text-gray-500">Subject identification and core details</p>
                            </div>
                        </div>
                    </Card.Header>
                    <Card.Body className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                                    <Hash className="w-4 h-4 text-gray-400" />
                                    Subject Code <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    placeholder="e.g., CS101"
                                    error={errors.code?.message}
                                    {...register('code')}
                                />
                            </div>
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                                    <Building2 className="w-4 h-4 text-gray-400" />
                                    Department <span className="text-red-500">*</span>
                                </label>
                                <Select
                                    options={departmentOptions}
                                    error={errors.departmentId?.message}
                                    {...register('departmentId')}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                                <BookOpen className="w-4 h-4 text-gray-400" />
                                Subject Name <span className="text-red-500">*</span>
                            </label>
                            <Input
                                placeholder="Enter subject name"
                                error={errors.name?.message}
                                {...register('name')}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                                    <GraduationCap className="w-4 h-4 text-gray-400" />
                                    Credit <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    type="number"
                                    step="0.5"
                                    placeholder="e.g., 3.0"
                                    error={errors.credit?.message}
                                    {...register('credit')}
                                />
                            </div>
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                                    <Calendar className="w-4 h-4 text-gray-400" />
                                    Semester
                                </label>
                                <Select options={semesterOptions} {...register('semester')} />
                            </div>
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                                    <Layers className="w-4 h-4 text-gray-400" />
                                    Subject Type
                                </label>
                                <Select options={subjectTypeOptions} {...register('subjectType')} />
                            </div>
                        </div>
                    </Card.Body>
                </Card>

                {/* Additional Details */}
                <Card className="border-0 shadow-sm">
                    <Card.Header>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                <GitBranch className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">Additional Details</h2>
                                <p className="text-sm text-gray-500">Prerequisites and subject characteristics</p>
                            </div>
                        </div>
                    </Card.Header>
                    <Card.Body className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                                    <GitBranch className="w-4 h-4 text-gray-400" />
                                    Prerequisite Subject
                                </label>
                                <Select
                                    options={prerequisiteOptions}
                                    {...register('prerequisiteSubjectId')}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Select a subject that must be completed before this one
                                </p>
                            </div>
                            <div className="flex flex-col justify-center">
                                <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl">
                                    <input
                                        type="checkbox"
                                        id="isElective"
                                        className="w-5 h-5 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                                        {...register('isElective')}
                                    />
                                    <label htmlFor="isElective" className="flex items-center gap-2">
                                        <Award className="w-4 h-4 text-amber-600" />
                                        <span className="text-sm font-medium text-gray-700">
                                            This is an elective subject
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </Card.Body>
                </Card>

                {/* Description & Syllabus */}
                <Card className="border-0 shadow-sm">
                    <Card.Header>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                                <FileText className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">Description & Syllabus</h2>
                                <p className="text-sm text-gray-500">Course content and learning objectives</p>
                            </div>
                        </div>
                    </Card.Header>
                    <Card.Body className="space-y-4">
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                                <FileText className="w-4 h-4 text-gray-400" />
                                Description
                            </label>
                            <Textarea
                                placeholder="Enter subject description..."
                                rows={3}
                                {...register('description')}
                            />
                        </div>
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                                <FileText className="w-4 h-4 text-gray-400" />
                                Syllabus
                            </label>
                            <Textarea
                                placeholder="Enter syllabus details..."
                                rows={4}
                                {...register('syllabus')}
                            />
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
                                    <BookOpen
                                        className={`w-5 h-5 ${watch('isActive') ? 'text-emerald-600' : 'text-gray-400'
                                            }`}
                                    />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900">Subject Status</h3>
                                    <p className="text-sm text-gray-500">
                                        {watch('isActive')
                                            ? 'This subject is currently active'
                                            : 'This subject is currently inactive'}
                                    </p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    {...register('isActive')}
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-violet-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
                            </label>
                        </div>
                    </Card.Body>
                </Card>

                {/* Form Actions - Cancel left, Submit right */}
                <div className="flex items-center justify-end gap-4 pt-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate(ROUTES.ADMIN_SUBJECTS)}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        loading={createMutation.isPending || updateMutation.isPending}
                        className="gap-2"
                    >
                        <Save className="w-4 h-4" />
                        {isEdit ? 'Update Subject' : 'Create Subject'}
                    </Button>
                </div>
            </form>
        </div>
    )
}

export default SubjectFormPage
