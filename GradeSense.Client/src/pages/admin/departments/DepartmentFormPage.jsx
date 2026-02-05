import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Card, Button, Spinner } from '@/components/common'
import { departmentService } from '@/services/departmentService'
import { userService } from '@/services/userService'
import { ROUTES } from '@/utils/constants'
import { cn } from '@/utils/helpers'
import {
    Building2,
    ArrowLeft,
    Save,
    User,
    Hash,
    AlertCircle,
    Loader2,
    UserCheck,
    UserX,
    FileText,
} from 'lucide-react'
import toast from 'react-hot-toast'

const API_URL = import.meta.env.VITE_API_URL || 'https://localhost:7266'

const DepartmentFormPage = () => {
    const navigate = useNavigate()
    const { id } = useParams()
    const queryClient = useQueryClient()
    const isEditMode = Boolean(id)

    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors },
    } = useForm({
        defaultValues: {
            name: '',
            code: '',
            hodUserId: '',
            isActive: true,
        },
    })

    const watchedValues = watch()
    const [selectedHOD, setSelectedHOD] = useState(null)

    // Fetch department data for edit mode
    const { data: departmentData, isLoading: isDepartmentLoading } = useQuery({
        queryKey: ['department', id],
        queryFn: () => departmentService.getById(id),
        enabled: isEditMode,
    })

    // Fetch users with Faculty or Admin role for HOD dropdown
    const { data: hodUsersData, isLoading: isUsersLoading } = useQuery({
        queryKey: ['users-for-hod'],
        queryFn: async () => {
            // Get both Faculty and Admin users
            const [facultyRes, adminRes] = await Promise.all([
                userService.getAll({ pageSize: 500, role: 'Faculty', isActive: true }),
                userService.getAll({ pageSize: 500, role: 'Admin', isActive: true }),
            ])
            const facultyUsers = facultyRes?.Data?.Data || []
            const adminUsers = adminRes?.Data?.Data || []
            return [...facultyUsers, ...adminUsers]
        },
    })

    const hodUsers = hodUsersData || []

    // Set form values when department data is loaded (edit mode)
    useEffect(() => {
        if (departmentData?.Data) {
            const department = departmentData.Data
            reset({
                name: department.Name || '',
                code: department.Code || '',
                hodUserId: department.HODUserId?.toString() || '',
                isActive: department.IsActive ?? true,
            })
            // Set selected HOD info for preview
            if (department.HODUserId) {
                setSelectedHOD({
                    FullName: department.HODName,
                    PersonalEmail: department.HODEmail,
                })
            }
        }
    }, [departmentData, reset])

    // Update selected HOD when hodUserId changes
    useEffect(() => {
        if (watchedValues.hodUserId) {
            const user = hodUsers.find(u => u.Id.toString() === watchedValues.hodUserId)
            setSelectedHOD(user || null)
        } else {
            setSelectedHOD(null)
        }
    }, [watchedValues.hodUserId, hodUsers])

    // Create/Update mutation
    const mutation = useMutation({
        mutationFn: (data) => {
            const payload = {
                Name: data.name,
                Code: data.code,
                HODUserId: data.hodUserId ? parseInt(data.hodUserId) : null,
            }

            if (isEditMode) {
                // Add IsActive for update
                payload.IsActive = data.isActive
                return departmentService.update(id, payload)
            } else {
                return departmentService.create(payload)
            }
        },
        onSuccess: () => {
            toast.success(`Department ${isEditMode ? 'updated' : 'created'} successfully`)
            queryClient.invalidateQueries(['departments'])
            queryClient.invalidateQueries(['admin-dashboard-stats'])
            navigate(ROUTES.ADMIN_DEPARTMENTS)
        },
        onError: (error) => {
            const message = error.response?.data?.Message || `Failed to ${isEditMode ? 'update' : 'create'} department`
            toast.error(message)
        },
    })

    const onSubmit = (data) => {
        mutation.mutate(data)
    }

    const hodOptions = [
        { value: '', label: 'No HOD Selected' },
        ...hodUsers.map((user) => ({
            value: user.Id.toString(),
            label: `${user.FullName} (${user.PersonalEmail || user.InstitutionalEmail || 'No email'})`,
        })),
    ]

    if (isEditMode && isDepartmentLoading) {
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
                        onClick={() => navigate(ROUTES.ADMIN_DEPARTMENTS)}
                        className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-3 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Departments
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg shadow-amber-500/25">
                            <Building2 className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                {isEditMode ? 'Edit Department' : 'Add New Department'}
                            </h1>
                            <p className="text-gray-500">
                                {isEditMode ? 'Update department information' : 'Create a new academic department'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Main Form Card */}
                <Card className="border-0 shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-4">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Building2 className="w-5 h-5" />
                            Department Information
                        </h2>
                    </div>
                    <Card.Body className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Department Name */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <span className="flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-gray-400" />
                                        Department Name <span className="text-red-500">*</span>
                                    </span>
                                </label>
                                <input
                                    type="text"
                                    {...register('name', {
                                        required: 'Department name is required',
                                        minLength: { value: 2, message: 'Name must be at least 2 characters' },
                                    })}
                                    className={cn(
                                        'w-full px-4 py-2.5 rounded-xl border bg-gray-50 focus:bg-white transition-all',
                                        errors.name
                                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                            : 'border-gray-200 focus:ring-amber-500 focus:border-amber-500'
                                    )}
                                    placeholder="e.g., Computer Science and Engineering"
                                />
                                {errors.name && (
                                    <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4" />
                                        {errors.name.message}
                                    </p>
                                )}
                            </div>

                            {/* Department Code */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <span className="flex items-center gap-2">
                                        <Hash className="w-4 h-4 text-gray-400" />
                                        Department Code <span className="text-red-500">*</span>
                                    </span>
                                </label>
                                <input
                                    type="text"
                                    {...register('code', {
                                        required: 'Department code is required',
                                        minLength: { value: 2, message: 'Code must be at least 2 characters' },
                                        maxLength: { value: 10, message: 'Code must be at most 10 characters' },
                                    })}
                                    className={cn(
                                        'w-full px-4 py-2.5 rounded-xl border bg-gray-50 focus:bg-white transition-all font-mono uppercase',
                                        errors.code
                                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                            : 'border-gray-200 focus:ring-amber-500 focus:border-amber-500'
                                    )}
                                    placeholder="e.g., CSE"
                                />
                                {errors.code && (
                                    <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4" />
                                        {errors.code.message}
                                    </p>
                                )}
                                <p className="mt-1.5 text-xs text-gray-500">
                                    Short code for the department (2-10 characters)
                                </p>
                            </div>

                            {/* HOD Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <span className="flex items-center gap-2">
                                        <User className="w-4 h-4 text-gray-400" />
                                        Head of Department
                                    </span>
                                </label>
                                <select
                                    {...register('hodUserId')}
                                    className={cn(
                                        'w-full px-4 py-2.5 rounded-xl border bg-gray-50 focus:bg-white transition-all',
                                        'border-gray-200 focus:ring-amber-500 focus:border-amber-500'
                                    )}
                                    disabled={isUsersLoading}
                                >
                                    {hodOptions.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                                <p className="mt-1.5 text-xs text-gray-500">
                                    Select a faculty or admin user as HOD (optional)
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
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                                            <span className="ml-3 text-sm font-medium text-gray-700">
                                                {watchedValues.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </label>
                                    </div>
                                    <p className="mt-1.5 text-xs text-gray-500">
                                        Inactive departments won't be visible in selection lists
                                    </p>
                                </div>
                            )}
                        </div>
                    </Card.Body>
                </Card>

                {/* Selected HOD Preview */}
                {selectedHOD && (
                    <Card className="border-0 shadow-lg overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
                            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                <User className="w-5 h-5" />
                                Selected HOD Preview
                            </h2>
                        </div>
                        <Card.Body className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold">
                                    {selectedHOD.ProfileImagePath ? (
                                        <img
                                            src={`${API_URL}${selectedHOD.ProfileImagePath}`}
                                            alt={selectedHOD.FullName}
                                            className="w-full h-full rounded-full object-cover"
                                        />
                                    ) : (
                                        selectedHOD.FullName?.charAt(0)?.toUpperCase() || 'H'
                                    )}
                                </div>
                                <div>
                                    <p className="text-lg font-semibold text-gray-900">{selectedHOD.FullName}</p>
                                    <p className="text-sm text-gray-500">{selectedHOD.PersonalEmail || selectedHOD.InstitutionalEmail || 'No email'}</p>
                                    {selectedHOD.Role && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                                            {selectedHOD.Role}
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
                        onClick={() => navigate(ROUTES.ADMIN_DEPARTMENTS)}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={mutation.isPending}
                        className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg shadow-amber-500/25 gap-2"
                    >
                        {mutation.isPending ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                {isEditMode ? 'Updating...' : 'Creating...'}
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                {isEditMode ? 'Update Department' : 'Create Department'}
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    )
}

export default DepartmentFormPage
