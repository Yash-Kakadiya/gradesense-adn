import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Card, Button, Spinner } from '@/components/common'
import { studentService } from '@/services/studentService'
import { departmentService } from '@/services/departmentService'
import { userService } from '@/services/userService'
import { ROUTES } from '@/utils/constants'
import { cn } from '@/utils/helpers'
import {
    GraduationCap,
    ArrowLeft,
    Save,
    User,
    Building2,
    Hash,
    Calendar,
    AlertCircle,
    Loader2,
    Eye,
    BookOpen,
    Award,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { getErrorMessage } from '@/utils/errorHandler'

const API_URL = import.meta.env.VITE_API_URL || 'https://localhost:7266'

const StudentFormPage = () => {
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
            enrollmentNumber: '',
            admissionYear: new Date().getFullYear(),
            currentSemester: 1,
            departmentId: '',
            status: 'Active',
            cgpa: '',
        },
    })

    const watchedValues = watch()
    const [selectedUser, setSelectedUser] = useState(null)

    // Fetch student data for edit mode
    const { data: studentData, isLoading: isStudentLoading } = useQuery({
        queryKey: ['student', id],
        queryFn: () => studentService.getById(id),
        enabled: isEditMode,
    })

    // Fetch departments for select
    const { data: departmentsData } = useQuery({
        queryKey: ['departments-select'],
        queryFn: () => departmentService.getAll({ pageSize: 100 }),
    })

    // Fetch users with Student role for the dropdown (only for create mode)
    const { data: studentUsersData, isLoading: isUsersLoading } = useQuery({
        queryKey: ['users-student-role'],
        queryFn: () => userService.getAll({ pageSize: 500, role: 'Student', isActive: true }),
        enabled: !isEditMode,
    })

    // Fetch existing students to filter out already assigned users
    const { data: existingStudentsData } = useQuery({
        queryKey: ['existing-students'],
        queryFn: () => studentService.getAll({ pageSize: 500 }),
        enabled: !isEditMode,
    })

    const departments = departmentsData?.Data?.Data || []
    const allStudentUsers = studentUsersData?.Data?.Data || []
    const existingStudentIds = (existingStudentsData?.Data?.Data || []).map(s => s.Id)

    // Filter out users who are already assigned as students
    const availableUsers = allStudentUsers.filter(user => !existingStudentIds.includes(user.Id))

    // Set form values when student data is loaded (edit mode)
    useEffect(() => {
        if (studentData?.Data) {
            const student = studentData.Data
            reset({
                userId: student.Id?.toString() || '',
                enrollmentNumber: student.EnrollmentNumber || '',
                admissionYear: student.AdmissionYear || new Date().getFullYear(),
                currentSemester: student.CurrentSemester || 1,
                departmentId: student.DepartmentId?.toString() || '',
                status: student.Status || 'Active',
                cgpa: student.CGPA?.toString() || '',
            })
            // Set selected user info for preview
            setSelectedUser({
                FullName: student.FullName,
                PersonalEmail: student.PersonalEmail,
                ProfileImagePath: student.ProfileImagePath,
            })
        }
    }, [studentData, reset])

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
                // Update payload
                const updatePayload = {
                    enrollmentNumber: data.enrollmentNumber || undefined,
                    admissionYear: data.admissionYear ? parseInt(data.admissionYear) : undefined,
                    currentSemester: data.currentSemester ? parseInt(data.currentSemester) : undefined,
                    departmentId: data.departmentId ? parseInt(data.departmentId) : undefined,
                    status: data.status || undefined,
                    cgpa: data.cgpa ? parseFloat(data.cgpa) : undefined,
                }
                return studentService.update(id, updatePayload)
            } else {
                // Create payload
                const createPayload = {
                    userId: parseInt(data.userId),
                    enrollmentNumber: data.enrollmentNumber,
                    admissionYear: parseInt(data.admissionYear),
                    currentSemester: parseInt(data.currentSemester),
                    departmentId: parseInt(data.departmentId),
                    status: data.status || 'Active',
                    cgpa: data.cgpa ? parseFloat(data.cgpa) : undefined,
                }
                return studentService.create(createPayload)
            }
        },
        onSuccess: () => {
            toast.success(`Student ${isEditMode ? 'updated' : 'created'} successfully`)
            queryClient.invalidateQueries(['students'])
            queryClient.invalidateQueries(['admin-dashboard-stats'])
            navigate(ROUTES.ADMIN_STUDENTS)
        },
        onError: (error) => {
            toast.error(getErrorMessage(error))
        },
    })

    const onSubmit = (data) => {
        mutation.mutate(data)
    }

    const statusOptions = [
        { value: 'Active', label: 'Active' },
        { value: 'Suspended', label: 'Suspended' },
        { value: 'Graduated', label: 'Graduated' },
        { value: 'Dropped', label: 'Dropped' },
    ]

    const departmentOptions = [
        { value: '', label: 'Select Department' },
        ...departments.map((dept) => ({
            value: dept.Id.toString(),
            label: dept.Name,
        })),
    ]

    const userOptions = [
        { value: '', label: 'Select Student User' },
        ...availableUsers.map((user) => ({
            value: user.Id.toString(),
            label: `${user.FullName} (${user.PersonalEmail})`,
        })),
    ]

    const semesterOptions = Array.from({ length: 8 }, (_, i) => ({
        value: (i + 1).toString(),
        label: `Semester ${i + 1}`,
    }))

    const yearOptions = Array.from({ length: 10 }, (_, i) => {
        const year = new Date().getFullYear() - i
        return { value: year.toString(), label: year.toString() }
    })

    if (isEditMode && isStudentLoading) {
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
                        onClick={() => navigate(ROUTES.ADMIN_STUDENTS)}
                        className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-3 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Students
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg shadow-emerald-500/25">
                            <GraduationCap className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                {isEditMode ? 'Edit Student' : 'Add New Student'}
                            </h1>
                            <p className="text-gray-500">
                                {isEditMode ? 'Update student information' : 'Register a new student'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Main Form Card */}
                <Card className="border-0 shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-4">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <User className="w-5 h-5" />
                            Student Information
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
                                                : 'border-gray-200 focus:ring-emerald-500 focus:border-emerald-500'
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
                                        Only users with "Student" role who are not already assigned are shown here.
                                    </p>
                                </div>
                            )}

                            {/* Enrollment Number */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <span className="flex items-center gap-2">
                                        <Hash className="w-4 h-4 text-gray-400" />
                                        Enrollment Number <span className="text-red-500">*</span>
                                    </span>
                                </label>
                                <input
                                    type="text"
                                    {...register('enrollmentNumber', {
                                        required: 'Enrollment Number is required',
                                    })}
                                    className={cn(
                                        'w-full px-4 py-2.5 rounded-xl border bg-gray-50 focus:bg-white transition-all',
                                        errors.enrollmentNumber
                                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                            : 'border-gray-200 focus:ring-emerald-500 focus:border-emerald-500'
                                    )}
                                    placeholder="e.g., STU2024001"
                                />
                                {errors.enrollmentNumber && (
                                    <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4" />
                                        {errors.enrollmentNumber.message}
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
                                            : 'border-gray-200 focus:ring-emerald-500 focus:border-emerald-500'
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

                            {/* Admission Year */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <span className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        Admission Year <span className="text-red-500">*</span>
                                    </span>
                                </label>
                                <select
                                    {...register('admissionYear', {
                                        required: 'Admission year is required',
                                    })}
                                    className={cn(
                                        'w-full px-4 py-2.5 rounded-xl border bg-gray-50 focus:bg-white transition-all',
                                        errors.admissionYear
                                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                            : 'border-gray-200 focus:ring-emerald-500 focus:border-emerald-500'
                                    )}
                                >
                                    {yearOptions.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                                {errors.admissionYear && (
                                    <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4" />
                                        {errors.admissionYear.message}
                                    </p>
                                )}
                            </div>

                            {/* Current Semester */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <span className="flex items-center gap-2">
                                        <BookOpen className="w-4 h-4 text-gray-400" />
                                        Current Semester <span className="text-red-500">*</span>
                                    </span>
                                </label>
                                <select
                                    {...register('currentSemester', {
                                        required: 'Semester is required',
                                    })}
                                    className={cn(
                                        'w-full px-4 py-2.5 rounded-xl border bg-gray-50 focus:bg-white transition-all',
                                        errors.currentSemester
                                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                            : 'border-gray-200 focus:ring-emerald-500 focus:border-emerald-500'
                                    )}
                                >
                                    {semesterOptions.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                                {errors.currentSemester && (
                                    <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4" />
                                        {errors.currentSemester.message}
                                    </p>
                                )}
                            </div>

                            {/* Status */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <span className="flex items-center gap-2">
                                        Status
                                    </span>
                                </label>
                                <select
                                    {...register('status')}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                                >
                                    {statusOptions.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* CGPA */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <span className="flex items-center gap-2">
                                        <Award className="w-4 h-4 text-gray-400" />
                                        CGPA
                                    </span>
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="10"
                                    {...register('cgpa', {
                                        min: { value: 0, message: 'CGPA must be at least 0' },
                                        max: { value: 10, message: 'CGPA must be at most 10' },
                                    })}
                                    className={cn(
                                        'w-full px-4 py-2.5 rounded-xl border bg-gray-50 focus:bg-white transition-all',
                                        errors.cgpa
                                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                            : 'border-gray-200 focus:ring-emerald-500 focus:border-emerald-500'
                                    )}
                                    placeholder="e.g., 8.5"
                                />
                                {errors.cgpa && (
                                    <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4" />
                                        {errors.cgpa.message}
                                    </p>
                                )}
                            </div>
                        </div>
                    </Card.Body>
                </Card>

                {/* Preview Card */}
                <Card className="border-0 shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-gray-700 to-gray-900 px-6 py-4">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Eye className="w-5 h-5" />
                            Preview
                        </h2>
                    </div>
                    <Card.Body className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg overflow-hidden">
                                {selectedUser?.ProfileImagePath ? (
                                    <img
                                        src={`${API_URL}${selectedUser.ProfileImagePath}`}
                                        alt={selectedUser?.FullName || 'Student'}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-2xl font-bold text-white">
                                        {selectedUser?.FullName?.charAt(0)?.toUpperCase() || 'S'}
                                    </span>
                                )}
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {selectedUser?.FullName || 'Select a user'}
                                </h3>
                                <p className="text-sm text-gray-500">
                                    {watchedValues.enrollmentNumber || 'Enrollment Number'} • Semester {watchedValues.currentSemester || '1'}
                                </p>
                                <p className="text-sm text-gray-400">
                                    {selectedUser?.PersonalEmail || 'email@example.com'}
                                </p>
                                {watchedValues.cgpa && (
                                    <p className="text-xs text-emerald-600 mt-1">
                                        CGPA: {watchedValues.cgpa}
                                    </p>
                                )}
                            </div>
                            <div className="text-right space-y-2">
                                {watchedValues.departmentId && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-amber-50 text-amber-700">
                                        <Building2 className="w-4 h-4" />
                                        {departments.find(d => d.Id.toString() === watchedValues.departmentId)?.Name || 'Department'}
                                    </span>
                                )}
                                <div>
                                    <span className={cn(
                                        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium",
                                        watchedValues.status === 'Active'
                                            ? "bg-emerald-50 text-emerald-700"
                                            : watchedValues.status === 'Graduated'
                                                ? "bg-blue-50 text-blue-700"
                                                : "bg-gray-100 text-gray-700"
                                    )}>
                                        <span className={cn(
                                            "w-2 h-2 rounded-full",
                                            watchedValues.status === 'Active' ? "bg-emerald-500" :
                                                watchedValues.status === 'Graduated' ? "bg-blue-500" : "bg-gray-500"
                                        )} />
                                        {watchedValues.status || 'Active'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Card.Body>
                </Card>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate(ROUTES.ADMIN_STUDENTS)}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={mutation.isPending}
                        className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-500/25 gap-2"
                    >
                        {mutation.isPending ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                {isEditMode ? 'Updating...' : 'Creating...'}
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                {isEditMode ? 'Update Student' : 'Create Student'}
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    )
}

export default StudentFormPage
