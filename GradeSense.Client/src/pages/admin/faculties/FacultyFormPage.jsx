import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Card, Button, Spinner } from '@/components/common'
import { facultyService } from '@/services/facultyService'
import { departmentService } from '@/services/departmentService'
import { userService } from '@/services/userService'
import { ROUTES } from '@/utils/constants'
import { cn } from '@/utils/helpers'
import {
    UserCog,
    ArrowLeft,
    Save,
    User,
    Building2,
    Briefcase,
    Hash,
    Calendar,
    AlertCircle,
    Loader2,
    Sparkles,
    GraduationCap,
    Award,
} from 'lucide-react'
import toast from 'react-hot-toast'

const API_URL = import.meta.env.VITE_API_URL || 'https://localhost:7266'

const FacultyFormPage = () => {
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
            userId: '',
            employeeId: '',
            departmentId: '',
            designation: '',
            joiningDate: '',
            qualification: '',
            specialization: '',
        },
    })

    const watchedValues = watch()
    const [selectedUser, setSelectedUser] = useState(null)

    // Fetch faculty data for edit mode
    const { data: facultyData, isLoading: isFacultyLoading } = useQuery({
        queryKey: ['faculty', id],
        queryFn: () => facultyService.getById(id),
        enabled: isEditMode,
    })

    // Fetch departments for select
    const { data: departmentsData } = useQuery({
        queryKey: ['departments-select'],
        queryFn: () => departmentService.getAll({ pageSize: 100 }),
    })

    // Fetch users with Faculty role for the dropdown (only for create mode)
    const { data: facultyUsersData, isLoading: isUsersLoading } = useQuery({
        queryKey: ['users-faculty-role'],
        queryFn: () => userService.getAll({ pageSize: 500, role: 'Faculty', isActive: true }),
        enabled: !isEditMode,
    })

    // Fetch existing faculties to filter out already assigned users
    const { data: existingFacultiesData } = useQuery({
        queryKey: ['existing-faculties'],
        queryFn: () => facultyService.getAll({ pageSize: 500 }),
        enabled: !isEditMode,
    })

    const departments = departmentsData?.Data?.Data || []
    const allFacultyUsers = facultyUsersData?.Data?.Data || []
    const existingFacultyIds = (existingFacultiesData?.Data?.Data || []).map(f => f.Id)

    // Filter out users who are already assigned as faculty
    const availableUsers = allFacultyUsers.filter(user => !existingFacultyIds.includes(user.Id))

    // Set form values when faculty data is loaded (edit mode)
    useEffect(() => {
        if (facultyData?.Data) {
            const faculty = facultyData.Data
            reset({
                userId: faculty.Id?.toString() || '',
                employeeId: faculty.EmployeeId || '',
                departmentId: faculty.DepartmentId?.toString() || '',
                designation: faculty.Designation || '',
                joiningDate: faculty.JoiningDate || '',
                qualification: faculty.Qualification || '',
                specialization: faculty.Specialization || '',
            })
            // Set selected user info for preview
            setSelectedUser({
                FullName: faculty.FullName,
                PersonalEmail: faculty.PersonalEmail,
                ProfileImagePath: faculty.ProfileImagePath,
            })
        }
    }, [facultyData, reset])

    // Update selected user when userId changes
    useEffect(() => {
        if (!isEditMode && watchedValues.userId) {
            const user = availableUsers.find(u => u.Id.toString() === watchedValues.userId)
            setSelectedUser(user || null)
        }
    }, [watchedValues.userId, availableUsers, isEditMode])

    // Create/Update mutation
    const mutation = useMutation({
        mutationFn: (data) => {
            if (isEditMode) {
                // Update payload - only send fields that can be updated
                const updatePayload = {
                    employeeId: data.employeeId || undefined,
                    departmentId: data.departmentId ? parseInt(data.departmentId) : undefined,
                    designation: data.designation || undefined,
                    joiningDate: data.joiningDate || undefined,
                    qualification: data.qualification || undefined,
                    specialization: data.specialization || undefined,
                }
                return facultyService.update(id, updatePayload)
            } else {
                // Create payload
                const createPayload = {
                    userId: parseInt(data.userId),
                    employeeId: data.employeeId,
                    departmentId: parseInt(data.departmentId),
                    designation: data.designation || undefined,
                    joiningDate: data.joiningDate || undefined,
                    qualification: data.qualification || undefined,
                    specialization: data.specialization || undefined,
                }
                return facultyService.create(createPayload)
            }
        },
        onSuccess: () => {
            toast.success(`Faculty ${isEditMode ? 'updated' : 'created'} successfully`)
            queryClient.invalidateQueries(['faculties'])
            queryClient.invalidateQueries(['admin-dashboard-stats'])
            navigate(ROUTES.ADMIN_FACULTIES)
        },
        onError: (error) => {
            const message = error.response?.data?.Message || `Failed to ${isEditMode ? 'update' : 'create'} faculty`
            toast.error(message)
        },
    })

    const onSubmit = (data) => {
        mutation.mutate(data)
    }

    const designationOptions = [
        { value: '', label: 'Select Designation' },
        { value: 'Professor', label: 'Professor' },
        { value: 'Associate Professor', label: 'Associate Professor' },
        { value: 'Assistant Professor', label: 'Assistant Professor' },
        { value: 'Lecturer', label: 'Lecturer' },
        { value: 'Senior Lecturer', label: 'Senior Lecturer' },
        { value: 'Visiting Faculty', label: 'Visiting Faculty' },
        { value: 'HOD', label: 'Head of Department' },
    ]

    const departmentOptions = [
        { value: '', label: 'Select Department' },
        ...departments.map((dept) => ({
            value: dept.Id.toString(),
            label: dept.Name,
        })),
    ]

    const userOptions = [
        { value: '', label: 'Select Faculty User' },
        ...availableUsers.map((user) => ({
            value: user.Id.toString(),
            label: `${user.FullName} (${user.PersonalEmail})`,
        })),
    ]

    if (isEditMode && isFacultyLoading) {
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
                        onClick={() => navigate(ROUTES.ADMIN_FACULTIES)}
                        className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-3 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Faculties
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/25">
                            <UserCog className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                {isEditMode ? 'Edit Faculty' : 'Add New Faculty'}
                            </h1>
                            <p className="text-gray-500">
                                {isEditMode ? 'Update faculty information' : 'Create a new faculty member'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Main Form Card */}
                <Card className="border-0 shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <User className="w-5 h-5" />
                            Faculty Information
                        </h2>
                    </div>
                    <Card.Body className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* User Selection (Create mode only) */}
                            {!isEditMode && (
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <span className="flex items-center gap-2">
                                            <User className="w-4 h-4 text-gray-400" />
                                            Select User <span className="text-red-500">*</span>
                                        </span>
                                    </label>
                                    <select
                                        {...register('userId', {
                                            required: 'Please select a user',
                                        })}
                                        className={cn(
                                            'w-full px-4 py-2.5 rounded-xl border bg-gray-50 focus:bg-white transition-all',
                                            errors.userId
                                                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                                : 'border-gray-200 focus:ring-indigo-500 focus:border-indigo-500'
                                        )}
                                        disabled={isUsersLoading}
                                    >
                                        {userOptions.map((opt) => (
                                            <option key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.userId && (
                                        <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                                            <AlertCircle className="w-4 h-4" />
                                            {errors.userId.message}
                                        </p>
                                    )}
                                    <p className="mt-1.5 text-xs text-gray-500">
                                        Only users with "Faculty" role who are not already assigned are shown here.
                                    </p>
                                </div>
                            )}

                            {/* Employee ID */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <span className="flex items-center gap-2">
                                        <Hash className="w-4 h-4 text-gray-400" />
                                        Employee ID <span className="text-red-500">*</span>
                                    </span>
                                </label>
                                <input
                                    type="text"
                                    {...register('employeeId', {
                                        required: 'Employee ID is required',
                                    })}
                                    className={cn(
                                        'w-full px-4 py-2.5 rounded-xl border bg-gray-50 focus:bg-white transition-all',
                                        errors.employeeId
                                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                            : 'border-gray-200 focus:ring-indigo-500 focus:border-indigo-500'
                                    )}
                                    placeholder="e.g., FAC001"
                                />
                                {errors.employeeId && (
                                    <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4" />
                                        {errors.employeeId.message}
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
                                        required: 'Department is required',
                                    })}
                                    className={cn(
                                        'w-full px-4 py-2.5 rounded-xl border bg-gray-50 focus:bg-white transition-all',
                                        errors.departmentId
                                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                            : 'border-gray-200 focus:ring-indigo-500 focus:border-indigo-500'
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

                            {/* Designation */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <span className="flex items-center gap-2">
                                        <Briefcase className="w-4 h-4 text-gray-400" />
                                        Designation
                                    </span>
                                </label>
                                <select
                                    {...register('designation')}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                                >
                                    {designationOptions.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Joining Date */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <span className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        Joining Date
                                    </span>
                                </label>
                                <input
                                    type="date"
                                    {...register('joiningDate')}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                                />
                            </div>

                            {/* Qualification */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <span className="flex items-center gap-2">
                                        <GraduationCap className="w-4 h-4 text-gray-400" />
                                        Qualification
                                    </span>
                                </label>
                                <input
                                    type="text"
                                    {...register('qualification')}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                                    placeholder="e.g., Ph.D. in Computer Science"
                                />
                            </div>

                            {/* Specialization */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <span className="flex items-center gap-2">
                                        <Award className="w-4 h-4 text-gray-400" />
                                        Specialization
                                    </span>
                                </label>
                                <input
                                    type="text"
                                    {...register('specialization')}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                                    placeholder="e.g., Machine Learning, AI"
                                />
                            </div>
                        </div>
                    </Card.Body>
                </Card>

                {/* Preview Card */}
                <Card className="border-0 shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-gray-700 to-gray-900 px-6 py-4">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Sparkles className="w-5 h-5" />
                            Preview
                        </h2>
                    </div>
                    <Card.Body className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg overflow-hidden">
                                {selectedUser?.ProfileImagePath ? (
                                    <img
                                        src={`${API_URL}${selectedUser.ProfileImagePath}`}
                                        alt={selectedUser?.FullName || 'Faculty'}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-2xl font-bold text-white">
                                        {selectedUser?.FullName?.charAt(0)?.toUpperCase() || 'F'}
                                    </span>
                                )}
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {selectedUser?.FullName || 'Select a user'}
                                </h3>
                                <p className="text-sm text-gray-500">
                                    {watchedValues.employeeId || 'Employee ID'} • {watchedValues.designation || 'Designation'}
                                </p>
                                <p className="text-sm text-gray-400">
                                    {selectedUser?.PersonalEmail || 'email@example.com'}
                                </p>
                                {watchedValues.qualification && (
                                    <p className="text-xs text-indigo-600 mt-1">
                                        {watchedValues.qualification}
                                    </p>
                                )}
                            </div>
                            {watchedValues.departmentId && (
                                <div className="text-right">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-amber-50 text-amber-700">
                                        <Building2 className="w-4 h-4" />
                                        {departments.find(d => d.Id.toString() === watchedValues.departmentId)?.Name || 'Department'}
                                    </span>
                                </div>
                            )}
                        </div>
                    </Card.Body>
                </Card>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate(ROUTES.ADMIN_FACULTIES)}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={mutation.isPending}
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/25 gap-2"
                    >
                        {mutation.isPending ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                {isEditMode ? 'Updating...' : 'Creating...'}
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                {isEditMode ? 'Update Faculty' : 'Create Faculty'}
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    )
}

export default FacultyFormPage
