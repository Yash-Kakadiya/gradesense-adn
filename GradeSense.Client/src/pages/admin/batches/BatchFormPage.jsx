import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Card, Button, Spinner } from '@/components/common'
import { batchService } from '@/services/batchService'
import { departmentService } from '@/services/departmentService'
import { facultyService } from '@/services/facultyService'
import { ROUTES } from '@/utils/constants'
import { cn } from '@/utils/helpers'
import {
    Layers,
    ArrowLeft,
    Save,
    User,
    Hash,
    AlertCircle,
    Loader2,
    UserCheck,
    UserX,
    Building2,
    Calendar,
    GraduationCap,
} from 'lucide-react'
import toast from 'react-hot-toast'

const API_URL = import.meta.env.VITE_API_URL || 'https://localhost:7266'

const BatchFormPage = () => {
    const navigate = useNavigate()
    const { id } = useParams()
    const queryClient = useQueryClient()
    const isEditMode = Boolean(id)

    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors },
    } = useForm({
        defaultValues: {
            name: '',
            semester: '',
            academicYear: '',
            departmentId: '',
            classCoordinatorId: '',
            division: '',
            isActive: true,
        },
    })

    const watchedValues = watch()
    const [selectedCoordinator, setSelectedCoordinator] = useState(null)

    // Fetch batch data for edit mode
    const { data: batchData, isLoading: isBatchLoading } = useQuery({
        queryKey: ['batch', id],
        queryFn: () => batchService.getById(id),
        enabled: isEditMode,
    })

    // Fetch departments for select
    const { data: departmentsData } = useQuery({
        queryKey: ['departments-select'],
        queryFn: () => departmentService.getAll({ pageSize: 100 }),
    })

    // Fetch faculties for class coordinator dropdown
    const { data: facultiesData, isLoading: isFacultiesLoading } = useQuery({
        queryKey: ['faculties-select', watchedValues.departmentId],
        queryFn: () => facultyService.getAll({ 
            pageSize: 500, 
            departmentId: watchedValues.departmentId || undefined 
        }),
    })

    const departments = departmentsData?.Data?.Data || []
    const faculties = facultiesData?.Data?.Data || []

    // Set form values when batch data is loaded (edit mode)
    useEffect(() => {
        if (batchData?.Data) {
            const batch = batchData.Data
            reset({
                name: batch.Name || '',
                semester: batch.Semester?.toString() || '',
                academicYear: batch.AcademicYear?.toString() || '',
                departmentId: batch.DepartmentId?.toString() || '',
                classCoordinatorId: batch.ClassCoordinatorId?.toString() || '',
                division: batch.Division || '',
                isActive: batch.IsActive ?? true,
            })
            // Set selected coordinator info for preview
            if (batch.ClassCoordinatorId) {
                setSelectedCoordinator({
                    FullName: batch.ClassCoordinatorName,
                    PersonalEmail: batch.ClassCoordinatorEmail,
                })
            }
        }
    }, [batchData, reset])

    // Update selected coordinator when classCoordinatorId changes
    useEffect(() => {
        if (watchedValues.classCoordinatorId) {
            const faculty = faculties.find(f => f.Id.toString() === watchedValues.classCoordinatorId)
            setSelectedCoordinator(faculty || null)
        } else {
            setSelectedCoordinator(null)
        }
    }, [watchedValues.classCoordinatorId, faculties])

    // Create/Update mutation
    const mutation = useMutation({
        mutationFn: (data) => {
            const payload = {
                Name: data.name,
                Semester: parseInt(data.semester),
                AcademicYear: parseInt(data.academicYear),
                DepartmentId: parseInt(data.departmentId),
                ClassCoordinatorId: data.classCoordinatorId ? parseInt(data.classCoordinatorId) : null,
                Division: data.division || null,
            }

            if (isEditMode) {
                payload.IsActive = data.isActive
                return batchService.update(id, payload)
            } else {
                payload.IsActive = true
                return batchService.create(payload)
            }
        },
        onSuccess: () => {
            toast.success(`Batch ${isEditMode ? 'updated' : 'created'} successfully`)
            queryClient.invalidateQueries(['batches'])
            queryClient.invalidateQueries(['admin-dashboard-stats'])
            navigate(ROUTES.ADMIN_BATCHES)
        },
        onError: (error) => {
            const message = error.response?.data?.Message || `Failed to ${isEditMode ? 'update' : 'create'} batch`
            toast.error(message)
        },
    })

    const onSubmit = (data) => {
        mutation.mutate(data)
    }

    const departmentOptions = [
        { value: '', label: 'Select Department' },
        ...departments.map((d) => ({
            value: d.Id.toString(),
            label: d.Name,
        })),
    ]

    const coordinatorOptions = [
        { value: '', label: 'No Coordinator Selected' },
        ...faculties.map((f) => ({
            value: f.Id.toString(),
            label: `${f.FullName} (${f.EmployeeId || 'No ID'})`,
        })),
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

    // Generate academic year options (current year - 5 to current year + 5)
    const currentYear = new Date().getFullYear()
    const academicYearOptions = [
        { value: '', label: 'Select Academic Year' },
        ...Array.from({ length: 11 }, (_, i) => {
            const year = currentYear - 5 + i
            return { value: year.toString(), label: year.toString() }
        }),
    ]

    if (isEditMode && isBatchLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Spinner size="lg" />
            </div>
        )
    }

    return (
        <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <button
                        onClick={() => navigate(ROUTES.ADMIN_BATCHES)}
                        className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-3 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Batches
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-xl shadow-lg shadow-cyan-500/25">
                            <Layers className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                {isEditMode ? 'Edit Batch' : 'Add New Batch'}
                            </h1>
                            <p className="text-gray-500">
                                {isEditMode ? 'Update batch information' : 'Create a new student batch'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Main Form Card */}
                <Card className="border-0 shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-cyan-500 to-teal-600 px-6 py-4">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Layers className="w-5 h-5" />
                            Batch Information
                        </h2>
                    </div>
                    <Card.Body className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Batch Name */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <span className="flex items-center gap-2">
                                        <Layers className="w-4 h-4 text-gray-400" />
                                        Batch Name <span className="text-red-500">*</span>
                                    </span>
                                </label>
                                <input
                                    type="text"
                                    {...register('name', {
                                        required: 'Batch name is required',
                                        minLength: { value: 2, message: 'Name must be at least 2 characters' },
                                    })}
                                    className={cn(
                                        'w-full px-4 py-2.5 rounded-xl border bg-gray-50 focus:bg-white transition-all',
                                        errors.name
                                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                            : 'border-gray-200 focus:ring-cyan-500 focus:border-cyan-500'
                                    )}
                                    placeholder="e.g., CSE 2024 Batch A"
                                />
                                {errors.name && (
                                    <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4" />
                                        {errors.name.message}
                                    </p>
                                )}
                            </div>

                            {/* Department */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <span className="flex items-center gap-2">
                                        <Building2 className="w-4 h-4 text-gray-400" />
                                        Department <span className="text-red-500">*</span>
                                    </span>
                                </label>
                                <select
                                    {...register('departmentId', {
                                        required: 'Please select a department',
                                    })}
                                    className={cn(
                                        'w-full px-4 py-2.5 rounded-xl border bg-gray-50 focus:bg-white transition-all',
                                        errors.departmentId
                                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                            : 'border-gray-200 focus:ring-cyan-500 focus:border-cyan-500'
                                    )}
                                >
                                    {departmentOptions.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                                {errors.departmentId && (
                                    <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4" />
                                        {errors.departmentId.message}
                                    </p>
                                )}
                            </div>

                            {/* Division */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <span className="flex items-center gap-2">
                                        <Hash className="w-4 h-4 text-gray-400" />
                                        Division
                                    </span>
                                </label>
                                <input
                                    type="text"
                                    {...register('division')}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                                    placeholder="e.g., A, B, C"
                                />
                                <p className="mt-1.5 text-xs text-gray-500">
                                    Optional division identifier
                                </p>
                            </div>

                            {/* Academic Year */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <span className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        Academic Year <span className="text-red-500">*</span>
                                    </span>
                                </label>
                                <select
                                    {...register('academicYear', {
                                        required: 'Please select an academic year',
                                    })}
                                    className={cn(
                                        'w-full px-4 py-2.5 rounded-xl border bg-gray-50 focus:bg-white transition-all',
                                        errors.academicYear
                                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                            : 'border-gray-200 focus:ring-cyan-500 focus:border-cyan-500'
                                    )}
                                >
                                    {academicYearOptions.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                                {errors.academicYear && (
                                    <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4" />
                                        {errors.academicYear.message}
                                    </p>
                                )}
                            </div>

                            {/* Semester */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <span className="flex items-center gap-2">
                                        <GraduationCap className="w-4 h-4 text-gray-400" />
                                        Semester <span className="text-red-500">*</span>
                                    </span>
                                </label>
                                <select
                                    {...register('semester', {
                                        required: 'Please select a semester',
                                    })}
                                    className={cn(
                                        'w-full px-4 py-2.5 rounded-xl border bg-gray-50 focus:bg-white transition-all',
                                        errors.semester
                                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                            : 'border-gray-200 focus:ring-cyan-500 focus:border-cyan-500'
                                    )}
                                >
                                    {semesterOptions.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                                {errors.semester && (
                                    <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4" />
                                        {errors.semester.message}
                                    </p>
                                )}
                            </div>

                            {/* Class Coordinator */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <span className="flex items-center gap-2">
                                        <User className="w-4 h-4 text-gray-400" />
                                        Class Coordinator
                                    </span>
                                </label>
                                <select
                                    {...register('classCoordinatorId')}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                                    disabled={isFacultiesLoading}
                                >
                                    {coordinatorOptions.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                                <p className="mt-1.5 text-xs text-gray-500">
                                    {watchedValues.departmentId 
                                        ? 'Select a faculty member as class coordinator (optional)'
                                        : 'Select a department first to see available faculty members'}
                                </p>
                            </div>

                            {/* Is Active (Edit mode only) */}
                            {isEditMode && (
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <span className="flex items-center gap-2">
                                            {watchedValues.isActive ? (
                                                <UserCheck className="w-4 h-4 text-emerald-500" />
                                            ) : (
                                                <UserX className="w-4 h-4 text-red-500" />
                                            )}
                                            Status
                                        </span>
                                    </label>
                                    <div className="flex items-center gap-4">
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                {...register('isActive')}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                                            <span className="ml-3 text-sm font-medium text-gray-700">
                                                {watchedValues.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </label>
                                    </div>
                                    <p className="mt-1.5 text-xs text-gray-500">
                                        Inactive batches won't be visible in selection lists
                                    </p>
                                </div>
                            )}
                        </div>
                    </Card.Body>
                </Card>

                {/* Selected Coordinator Preview */}
                {selectedCoordinator && (
                    <Card className="border-0 shadow-lg overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
                            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                <User className="w-5 h-5" />
                                Selected Coordinator Preview
                            </h2>
                        </div>
                        <Card.Body className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold">
                                    {selectedCoordinator.ProfileImagePath ? (
                                        <img
                                            src={`${API_URL}${selectedCoordinator.ProfileImagePath}`}
                                            alt={selectedCoordinator.FullName}
                                            className="w-full h-full rounded-full object-cover"
                                        />
                                    ) : (
                                        selectedCoordinator.FullName?.charAt(0)?.toUpperCase() || 'C'
                                    )}
                                </div>
                                <div>
                                    <p className="text-lg font-semibold text-gray-900">{selectedCoordinator.FullName}</p>
                                    <p className="text-sm text-gray-500">{selectedCoordinator.PersonalEmail || selectedCoordinator.Email || 'No email'}</p>
                                    {selectedCoordinator.EmployeeId && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-100 text-cyan-800 mt-1">
                                            {selectedCoordinator.EmployeeId}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate(ROUTES.ADMIN_BATCHES)}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={mutation.isPending}
                        className="bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-600 hover:to-teal-700 text-white shadow-lg shadow-cyan-500/25 gap-2"
                    >
                        {mutation.isPending ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                {isEditMode ? 'Updating...' : 'Creating...'}
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                {isEditMode ? 'Update Batch' : 'Create Batch'}
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    )
}

export default BatchFormPage
