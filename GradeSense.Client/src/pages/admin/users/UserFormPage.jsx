import { useEffect, useState, Fragment, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Transition } from '@headlessui/react'
import { Card, Button, Input, Select } from '@/components/common'
import { LoadingInline } from '@/components/common/Spinner'
import { userService } from '@/services/userService'
import { cn } from '@/utils/helpers'
import { ROUTES, ROLES, API_URL } from '@/utils/constants'
import {
    User,
    Mail,
    Lock,
    Shield,
    UserCog,
    Users,
    Eye,
    EyeOff,
    ArrowLeft,
    Save,
    CheckCircle,
    AlertCircle,
    UserPlus,
    IdCard,
    Info,
    Phone,
    Building,
    Camera,
    Upload,
    Trash2,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { getErrorMessage } from '@/utils/errorHandler'

// Phone number regex pattern
const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/

// Validation schema
const createUserSchema = z.object({
    personalEmail: z.string().email('Please enter a valid personal email'),
    institutionalEmail: z.string().email('Please enter a valid institutional email').optional().or(z.literal('')),
    phoneNumber: z.string().regex(phoneRegex, 'Please enter a valid phone number').optional().or(z.literal('')),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    fullName: z.string().min(2, 'Name must be at least 2 characters'),
    role: z.enum(['Admin', 'Faculty', 'Student'], {
        errorMap: () => ({ message: 'Please select a role' }),
    }),
    isActive: z.boolean().default(true),
})

const updateUserSchema = z.object({
    personalEmail: z.string().email('Please enter a valid personal email'),
    institutionalEmail: z.string().email('Please enter a valid institutional email').optional().or(z.literal('')),
    phoneNumber: z.string().regex(phoneRegex, 'Please enter a valid phone number').optional().or(z.literal('')),
    password: z.string().min(6, 'Password must be at least 6 characters').optional().or(z.literal('')),
    fullName: z.string().min(2, 'Name must be at least 2 characters'),
    role: z.enum(['Admin', 'Faculty', 'Student'], {
        errorMap: () => ({ message: 'Please select a role' }),
    }),
    isActive: z.boolean().default(true),
})

// Form field component with enhanced styling
const FormField = ({ label, icon: Icon, error, required, children, hint }) => (
    <div className="space-y-1.5">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            {Icon && <Icon className="w-4 h-4 text-gray-400" />}
            {label}
            {required && <span className="text-red-500">*</span>}
        </label>
        {children}
        {hint && !error && (
            <p className="flex items-center gap-1.5 text-xs text-gray-500">
                <Info className="w-3 h-3" />
                {hint}
            </p>
        )}
        {error && (
            <p className="flex items-center gap-1.5 text-xs text-red-500">
                <AlertCircle className="w-3 h-3" />
                {error}
            </p>
        )}
    </div>
)

// Role Card Component
const RoleCard = ({ role, icon: Icon, description, isSelected, onClick, color }) => (
    <button
        type="button"
        onClick={onClick}
        className={cn(
            "relative flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-200",
            isSelected
                ? `border-${color}-500 bg-${color}-50 ring-2 ring-${color}-500/20`
                : "border-gray-200 hover:border-gray-300 bg-white"
        )}
    >
        {isSelected && (
            <div className={`absolute -top-2 -right-2 w-5 h-5 bg-${color}-500 rounded-full flex items-center justify-center`}>
                <CheckCircle className="w-3 h-3 text-white" />
            </div>
        )}
        <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center mb-2 transition-colors",
            isSelected
                ? `bg-gradient-to-br from-${color}-500 to-${color}-600`
                : "bg-gray-100"
        )}>
            <Icon className={cn(
                "w-6 h-6",
                isSelected ? "text-white" : "text-gray-500"
            )} />
        </div>
        <span className={cn(
            "font-medium text-sm",
            isSelected ? `text-${color}-700` : "text-gray-700"
        )}>
            {role}
        </span>
        <span className="text-xs text-gray-500 mt-0.5">{description}</span>
    </button>
)

const UserFormPage = () => {
    const navigate = useNavigate()
    const { id } = useParams()
    const queryClient = useQueryClient()
    const isEdit = !!id
    const fileInputRef = useRef(null)

    const [showPassword, setShowPassword] = useState(false)
    const [selectedRole, setSelectedRole] = useState('')
    const [profileImage, setProfileImage] = useState(null) // For new user creation
    const [profilePreview, setProfilePreview] = useState(null)
    const [isUploadingImage, setIsUploadingImage] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting, isDirty },
        reset,
        setValue,
        watch,
    } = useForm({
        resolver: zodResolver(isEdit ? updateUserSchema : createUserSchema),
        defaultValues: {
            personalEmail: '',
            institutionalEmail: '',
            phoneNumber: '',
            password: '',
            fullName: '',
            role: '',
            isActive: true,
        },
    })

    const watchedRole = watch('role')
    const watchedIsActive = watch('isActive')

    useEffect(() => {
        setSelectedRole(watchedRole)
    }, [watchedRole])

    // Fetch user data if editing
    const { data: userData, isLoading } = useQuery({
        queryKey: ['user', id],
        queryFn: () => userService.getById(id),
        enabled: isEdit,
    })

    // Get actual user data from response
    const user = userData?.Data

    // Set form values when user data is loaded
    useEffect(() => {
        if (user) {
            reset({
                personalEmail: user.PersonalEmail || '',
                institutionalEmail: user.InstitutionalEmail || '',
                phoneNumber: user.PhoneNumber || '',
                fullName: user.FullName || '',
                role: user.Role || '',
                isActive: user.IsActive ?? true,
                password: '',
            })
            setSelectedRole(user.Role || '')
            // Set profile preview from existing image
            if (user.ProfileImagePath) {
                setProfilePreview(`${API_URL}${user.ProfileImagePath}`)
            }
        }
    }, [user, reset])

    // Create mutation
    const createMutation = useMutation({
        mutationFn: async (data) => {
            const result = await userService.create(data)
            // If profile image was selected, upload it after user creation
            if (profileImage && result?.Data?.Id) {
                await userService.uploadProfileImage(result.Data.Id, profileImage)
            }
            return result
        },
        onSuccess: () => {
            toast.success('User created successfully')
            queryClient.invalidateQueries(['users'])
            navigate(ROUTES.ADMIN_USERS)
        },
        onError: (error) => {
            toast.error(getErrorMessage(error))
        },
    })

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: async (data) => {
            // First update user data
            const result = await userService.update(id, data)

            // Handle profile image changes
            if (removeImageOnSubmit && user?.ProfileImagePath) {
                await userService.deleteProfileImage(id)
            } else if (profileImage) {
                await userService.uploadProfileImage(id, profileImage)
            }

            return result
        },
        onSuccess: () => {
            toast.success('User updated successfully')
            queryClient.invalidateQueries(['users'])
            queryClient.invalidateQueries(['user', id])
            navigate(ROUTES.ADMIN_USERS)
        },
        onError: (error) => {
            toast.error(getErrorMessage(error))
        },
    })

    const onSubmit = (data) => {
        // Remove empty password on update
        if (isEdit && !data.password) {
            delete data.password
        }

        // Remove empty optional fields
        if (!data.institutionalEmail) {
            delete data.institutionalEmail
        }
        if (!data.phoneNumber) {
            delete data.phoneNumber
        }

        if (isEdit) {
            updateMutation.mutate(data)
        } else {
            createMutation.mutate(data)
        }
    }

    // Track if image should be removed on submit
    const [removeImageOnSubmit, setRemoveImageOnSubmit] = useState(false)

    // Handle profile image selection - only preview, upload on form submit
    const handleImageSelect = (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
        if (!allowedTypes.includes(file.type)) {
            toast.error('Invalid file type. Allowed: jpg, png, gif, webp')
            return
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('File size must be less than 5MB')
            return
        }

        // Show preview
        const reader = new FileReader()
        reader.onloadend = () => {
            setProfilePreview(reader.result)
        }
        reader.readAsDataURL(file)

        // Store the file for upload on form submit
        setProfileImage(file)
        setRemoveImageOnSubmit(false)
    }

    // Handle profile image removal - only mark for removal, delete on form submit
    const handleRemoveImage = () => {
        setProfilePreview(null)
        setProfileImage(null)
        if (isEdit && user?.ProfileImagePath) {
            setRemoveImageOnSubmit(true)
        }
    }

    const handleRoleSelect = (role) => {
        setValue('role', role, { shouldValidate: true, shouldDirty: true })
        setSelectedRole(role)
    }

    const getRoleGradient = (role) => {
        switch (role) {
            case 'Admin':
                return 'from-rose-500 to-pink-600'
            case 'Faculty':
                return 'from-blue-500 to-indigo-600'
            case 'Student':
                return 'from-emerald-500 to-teal-600'
            default:
                return 'from-blue-500 to-indigo-600'
        }
    }

    if (isEdit && isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-50 flex items-center justify-center">
                        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                    <p className="text-gray-500">Loading user data...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="animate-fadeIn">
            {/* Header */}
            <div className="mb-8">
                <button
                    onClick={() => navigate(ROUTES.ADMIN_USERS)}
                    className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors mb-4"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Users
                </button>

                <div className="flex items-center gap-4">
                    <div className={cn(
                        "p-3 rounded-xl shadow-lg",
                        isEdit
                            ? `bg-gradient-to-br ${getRoleGradient(user?.Role)}`
                            : "bg-gradient-to-br from-blue-500 to-indigo-600"
                    )}>
                        {isEdit ? (
                            <span className="text-2xl font-bold text-white">
                                {user?.FullName?.charAt(0)?.toUpperCase() || 'U'}
                            </span>
                        ) : (
                            <UserPlus className="w-6 h-6 text-white" />
                        )}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {isEdit ? 'Edit User' : 'Create New User'}
                        </h1>
                        <p className="text-gray-500">
                            {isEdit
                                ? `Update information for ${user?.FullName}`
                                : 'Add a new user to the system'
                            }
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Form */}
                <div className="lg:col-span-2">
                    <Card className="border-0 shadow-sm overflow-hidden">
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                                <User className="w-5 h-5 text-gray-500" />
                                User Information
                            </h2>
                        </div>
                        <Card.Body className="p-6">
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                {/* Profile Photo Section - Edit mode */}
                                {isEdit && (
                                    <div className="flex justify-center pb-4 border-b border-gray-100">
                                        <div className="flex flex-col items-center">
                                            <div className="relative group">
                                                <div className={cn(
                                                    "w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-lg",
                                                    "bg-gradient-to-br from-gray-200 to-gray-300"
                                                )}>
                                                    {(profilePreview || user?.ProfileImagePath) ? (
                                                        <img
                                                            src={profilePreview || `${API_URL}${user.ProfileImagePath}`}
                                                            alt="Profile"
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <Camera className="w-10 h-10 text-gray-400" />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Overlay on hover */}
                                                <div className={cn(
                                                    "absolute inset-0 rounded-full bg-black/50 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity",
                                                    isUploadingImage && "opacity-100"
                                                )}>
                                                    {isUploadingImage ? (
                                                        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                    ) : (
                                                        <>
                                                            <button
                                                                type="button"
                                                                onClick={() => fileInputRef.current?.click()}
                                                                className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                                                                title="Upload image"
                                                            >
                                                                <Upload className="w-5 h-5 text-white" />
                                                            </button>
                                                            {(profilePreview || user?.ProfileImagePath) && (
                                                                <button
                                                                    type="button"
                                                                    onClick={handleRemoveImage}
                                                                    className="p-2 bg-red-500/80 rounded-full hover:bg-red-600 transition-colors"
                                                                    title="Remove image"
                                                                >
                                                                    <Trash2 className="w-5 h-5 text-white" />
                                                                </button>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/jpeg,image/png,image/gif,image/webp"
                                                onChange={handleImageSelect}
                                                className="hidden"
                                            />
                                            {profileImage ? (
                                                <p className="mt-3 text-xs text-emerald-600 text-center font-medium">
                                                    New image selected<br />
                                                    <span className="text-gray-500 font-normal">Will be uploaded when you save</span>
                                                </p>
                                            ) : removeImageOnSubmit ? (
                                                <p className="mt-3 text-xs text-red-600 text-center font-medium">
                                                    Image marked for removal<br />
                                                    <span className="text-gray-500 font-normal">Will be removed when you save</span>
                                                </p>
                                            ) : (
                                                <p className="mt-3 text-xs text-gray-500 text-center">
                                                    Click to upload profile photo<br />
                                                    JPG, PNG, GIF, WebP (max 5MB)
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Full Name */}
                                <FormField
                                    label="Full Name"
                                    icon={User}
                                    error={errors.fullName?.message}
                                    required
                                >
                                    <input
                                        type="text"
                                        placeholder="Enter full name"
                                        className={cn(
                                            "w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm transition-all",
                                            "focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white",
                                            errors.fullName
                                                ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                                                : "border-gray-200"
                                        )}
                                        {...register('fullName')}
                                    />
                                </FormField>

                                {/* Email Fields - Two columns */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Personal Email */}
                                    <FormField
                                        label="Personal Email"
                                        icon={Mail}
                                        error={errors.personalEmail?.message}
                                        required
                                        hint="Used for login and notifications"
                                    >
                                        <input
                                            type="email"
                                            placeholder="personal@email.com"
                                            className={cn(
                                                "w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm transition-all",
                                                "focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white",
                                                errors.personalEmail
                                                    ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                                                    : "border-gray-200"
                                            )}
                                            {...register('personalEmail')}
                                        />
                                    </FormField>

                                    {/* Institutional Email */}
                                    <FormField
                                        label="Institutional Email"
                                        icon={Building}
                                        error={errors.institutionalEmail?.message}
                                        hint="College/Institute email (optional)"
                                    >
                                        <input
                                            type="email"
                                            placeholder="user@institute.edu"
                                            className={cn(
                                                "w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm transition-all",
                                                "focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white",
                                                errors.institutionalEmail
                                                    ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                                                    : "border-gray-200"
                                            )}
                                            {...register('institutionalEmail')}
                                        />
                                    </FormField>
                                </div>

                                {/* Phone Number */}
                                <FormField
                                    label="Phone Number"
                                    icon={Phone}
                                    error={errors.phoneNumber?.message}
                                    hint="Mobile/Phone number (optional)"
                                >
                                    <input
                                        type="tel"
                                        placeholder="+91 98765 43210"
                                        className={cn(
                                            "w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm transition-all",
                                            "focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white",
                                            errors.phoneNumber
                                                ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                                                : "border-gray-200"
                                        )}
                                        {...register('phoneNumber')}
                                    />
                                </FormField>

                                {/* Password - Only show on create, not edit */}
                                {!isEdit && (
                                    <FormField
                                        label="Password"
                                        icon={Lock}
                                        error={errors.password?.message}
                                        required
                                        hint="Minimum 6 characters"
                                    >
                                        <div className="relative">
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder="Enter password"
                                                className={cn(
                                                    "w-full px-4 py-2.5 pr-10 bg-gray-50 border rounded-xl text-sm transition-all",
                                                    "focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white",
                                                    errors.password
                                                        ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                                                        : "border-gray-200"
                                                )}
                                                {...register('password')}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="w-4 h-4" />
                                                ) : (
                                                    <Eye className="w-4 h-4" />
                                                )}
                                            </button>
                                        </div>
                                    </FormField>
                                )}

                                {/* Role Selection */}
                                <div className="space-y-3">
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                        <Shield className="w-4 h-4 text-gray-400" />
                                        User Role
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <div className="grid grid-cols-3 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => handleRoleSelect('Admin')}
                                            className={cn(
                                                "relative flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-200",
                                                selectedRole === 'Admin'
                                                    ? "border-rose-500 bg-rose-50 ring-2 ring-rose-500/20"
                                                    : "border-gray-200 hover:border-gray-300 bg-white"
                                            )}
                                        >
                                            {selectedRole === 'Admin' && (
                                                <div className="absolute -top-2 -right-2 w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center">
                                                    <CheckCircle className="w-3 h-3 text-white" />
                                                </div>
                                            )}
                                            <div className={cn(
                                                "w-12 h-12 rounded-xl flex items-center justify-center mb-2 transition-colors",
                                                selectedRole === 'Admin'
                                                    ? "bg-gradient-to-br from-rose-500 to-pink-600"
                                                    : "bg-gray-100"
                                            )}>
                                                <Shield className={cn(
                                                    "w-6 h-6",
                                                    selectedRole === 'Admin' ? "text-white" : "text-gray-500"
                                                )} />
                                            </div>
                                            <span className={cn(
                                                "font-medium text-sm",
                                                selectedRole === 'Admin' ? "text-rose-700" : "text-gray-700"
                                            )}>
                                                Admin
                                            </span>
                                            <span className="text-xs text-gray-500 mt-0.5">Full access</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => handleRoleSelect('Faculty')}
                                            className={cn(
                                                "relative flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-200",
                                                selectedRole === 'Faculty'
                                                    ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500/20"
                                                    : "border-gray-200 hover:border-gray-300 bg-white"
                                            )}
                                        >
                                            {selectedRole === 'Faculty' && (
                                                <div className="absolute -top-2 -right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                                    <CheckCircle className="w-3 h-3 text-white" />
                                                </div>
                                            )}
                                            <div className={cn(
                                                "w-12 h-12 rounded-xl flex items-center justify-center mb-2 transition-colors",
                                                selectedRole === 'Faculty'
                                                    ? "bg-gradient-to-br from-blue-500 to-indigo-600"
                                                    : "bg-gray-100"
                                            )}>
                                                <UserCog className={cn(
                                                    "w-6 h-6",
                                                    selectedRole === 'Faculty' ? "text-white" : "text-gray-500"
                                                )} />
                                            </div>
                                            <span className={cn(
                                                "font-medium text-sm",
                                                selectedRole === 'Faculty' ? "text-blue-700" : "text-gray-700"
                                            )}>
                                                Faculty
                                            </span>
                                            <span className="text-xs text-gray-500 mt-0.5">Instructor</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => handleRoleSelect('Student')}
                                            className={cn(
                                                "relative flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-200",
                                                selectedRole === 'Student'
                                                    ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/20"
                                                    : "border-gray-200 hover:border-gray-300 bg-white"
                                            )}
                                        >
                                            {selectedRole === 'Student' && (
                                                <div className="absolute -top-2 -right-2 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                                                    <CheckCircle className="w-3 h-3 text-white" />
                                                </div>
                                            )}
                                            <div className={cn(
                                                "w-12 h-12 rounded-xl flex items-center justify-center mb-2 transition-colors",
                                                selectedRole === 'Student'
                                                    ? "bg-gradient-to-br from-emerald-500 to-teal-600"
                                                    : "bg-gray-100"
                                            )}>
                                                <Users className={cn(
                                                    "w-6 h-6",
                                                    selectedRole === 'Student' ? "text-white" : "text-gray-500"
                                                )} />
                                            </div>
                                            <span className={cn(
                                                "font-medium text-sm",
                                                selectedRole === 'Student' ? "text-emerald-700" : "text-gray-700"
                                            )}>
                                                Student
                                            </span>
                                            <span className="text-xs text-gray-500 mt-0.5">Learner</span>
                                        </button>
                                    </div>
                                    {errors.role && (
                                        <p className="flex items-center gap-1.5 text-xs text-red-500">
                                            <AlertCircle className="w-3 h-3" />
                                            {errors.role?.message}
                                        </p>
                                    )}
                                    <input type="hidden" {...register('role')} />
                                </div>

                                {/* Status Toggle */}
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                    <div>
                                        <p className="font-medium text-gray-900">Account Status</p>
                                        <p className="text-sm text-gray-500">
                                            {watchedIsActive
                                                ? 'User can access the system'
                                                : 'User cannot log in'
                                            }
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setValue('isActive', !watchedIsActive, { shouldDirty: true })}
                                        className={cn(
                                            "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                                            watchedIsActive ? "bg-emerald-500" : "bg-gray-200"
                                        )}
                                    >
                                        <span
                                            className={cn(
                                                "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                                                watchedIsActive ? "translate-x-5" : "translate-x-0"
                                            )}
                                        />
                                    </button>
                                    <input type="hidden" {...register('isActive')} />
                                </div>

                                {/* Actions */}
                                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => navigate(ROUTES.ADMIN_USERS)}
                                        className="gap-2"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        loading={createMutation.isPending || updateMutation.isPending}
                                        className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                                    >
                                        <Save className="w-4 h-4" />
                                        {isEdit ? 'Update User' : 'Create User'}
                                    </Button>
                                </div>
                            </form>
                        </Card.Body>
                    </Card>
                </div>

                {/* Sidebar - Tips & Preview */}
                <div className="space-y-6">
                    {/* Profile Photo for Create Mode */}
                    {!isEdit && (
                        <Card className="border-0 shadow-sm overflow-hidden">
                            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                                    <Camera className="w-5 h-5 text-gray-500" />
                                    Profile Photo
                                </h2>
                            </div>
                            <Card.Body className="p-6">
                                <div className="flex flex-col items-center">
                                    <div className="relative group">
                                        <div className={cn(
                                            "w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-lg",
                                            "bg-gradient-to-br from-gray-200 to-gray-300"
                                        )}>
                                            {profilePreview ? (
                                                <img
                                                    src={profilePreview}
                                                    alt="Profile preview"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Camera className="w-10 h-10 text-gray-400" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                                                title="Upload image"
                                            >
                                                <Upload className="w-5 h-5 text-white" />
                                            </button>
                                            {profilePreview && (
                                                <button
                                                    type="button"
                                                    onClick={handleRemoveImage}
                                                    className="p-2 bg-red-500/80 rounded-full hover:bg-red-600 transition-colors"
                                                    title="Remove image"
                                                >
                                                    <Trash2 className="w-5 h-5 text-white" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/jpeg,image/png,image/gif,image/webp"
                                        onChange={handleImageSelect}
                                        className="hidden"
                                    />
                                    {profileImage ? (
                                        <p className="mt-3 text-xs text-emerald-600 text-center font-medium">
                                            Image selected<br />
                                            <span className="text-gray-500 font-normal">Will be uploaded when you create user</span>
                                        </p>
                                    ) : (
                                        <p className="mt-3 text-xs text-gray-500 text-center">
                                            Click to upload profile photo<br />
                                            JPG, PNG, GIF, WebP (max 5MB)
                                        </p>
                                    )}
                                </div>
                            </Card.Body>
                        </Card>
                    )}

                    {/* User Preview Card */}
                    <Card className="border-0 shadow-sm overflow-hidden">
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                                <IdCard className="w-5 h-5 text-indigo-500" />
                                Preview
                            </h2>
                        </div>
                        <Card.Body className="p-6">
                            <div className="flex flex-col items-center">
                                <div className={cn(
                                    "w-20 h-20 rounded-full flex items-center justify-center mb-4 shadow-lg overflow-hidden",
                                    selectedRole
                                        ? `bg-gradient-to-br ${getRoleGradient(selectedRole)}`
                                        : "bg-gradient-to-br from-gray-300 to-gray-400"
                                )}>
                                    {(isEdit && user?.ProfileImagePath) || profilePreview ? (
                                        <img
                                            src={profilePreview || `${API_URL}${user?.ProfileImagePath}`}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-2xl font-bold text-white">
                                            {watch('fullName')?.charAt(0)?.toUpperCase() || '?'}
                                        </span>
                                    )}
                                </div>
                                <p className="font-semibold text-gray-900">
                                    {watch('fullName') || 'User Name'}
                                </p>
                                <p className="text-sm text-gray-500">
                                    {watch('personalEmail') || 'email@example.com'}
                                </p>
                                {watch('institutionalEmail') && (
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        {watch('institutionalEmail')}
                                    </p>
                                )}
                                {watch('phoneNumber') && (
                                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                                        <Phone className="w-3 h-3" />
                                        {watch('phoneNumber')}
                                    </p>
                                )}
                                {selectedRole && (
                                    <span className={cn(
                                        "mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium",
                                        selectedRole === 'Admin' && "bg-rose-100 text-rose-700",
                                        selectedRole === 'Faculty' && "bg-blue-100 text-blue-700",
                                        selectedRole === 'Student' && "bg-emerald-100 text-emerald-700"
                                    )}>
                                        {selectedRole === 'Admin' && <Shield className="w-3.5 h-3.5" />}
                                        {selectedRole === 'Faculty' && <UserCog className="w-3.5 h-3.5" />}
                                        {selectedRole === 'Student' && <Users className="w-3.5 h-3.5" />}
                                        {selectedRole}
                                    </span>
                                )}
                                <span className={cn(
                                    "mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                                    watchedIsActive
                                        ? "bg-emerald-100 text-emerald-700"
                                        : "bg-red-100 text-red-700"
                                )}>
                                    <span className={cn(
                                        "w-1.5 h-1.5 rounded-full",
                                        watchedIsActive ? "bg-emerald-500" : "bg-red-500"
                                    )} />
                                    {watchedIsActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                        </Card.Body>
                    </Card>

                    {/* Role Permissions Info */}
                    <Transition
                        show={!!selectedRole}
                        enter="transition-all duration-300"
                        enterFrom="opacity-0 translate-y-4"
                        enterTo="opacity-100 translate-y-0"
                        leave="transition-all duration-200"
                        leaveFrom="opacity-100 translate-y-0"
                        leaveTo="opacity-0 translate-y-4"
                    >
                        <Card className="border-0 shadow-sm overflow-hidden">
                            <div className={cn(
                                "px-6 py-4 border-b",
                                selectedRole === 'Admin' && "bg-rose-50 border-rose-100",
                                selectedRole === 'Faculty' && "bg-blue-50 border-blue-100",
                                selectedRole === 'Student' && "bg-emerald-50 border-emerald-100"
                            )}>
                                <h2 className={cn(
                                    "font-semibold flex items-center gap-2",
                                    selectedRole === 'Admin' && "text-rose-900",
                                    selectedRole === 'Faculty' && "text-blue-900",
                                    selectedRole === 'Student' && "text-emerald-900"
                                )}>
                                    <Info className="w-5 h-5" />
                                    {selectedRole} Permissions
                                </h2>
                            </div>
                            <Card.Body className="p-4">
                                <ul className="space-y-2">
                                    {selectedRole === 'Admin' && (
                                        <>
                                            <li className="flex items-center gap-2 text-sm text-gray-600">
                                                <CheckCircle className="w-4 h-4 text-emerald-500" />
                                                Full system access
                                            </li>
                                            <li className="flex items-center gap-2 text-sm text-gray-600">
                                                <CheckCircle className="w-4 h-4 text-emerald-500" />
                                                Manage users and roles
                                            </li>
                                            <li className="flex items-center gap-2 text-sm text-gray-600">
                                                <CheckCircle className="w-4 h-4 text-emerald-500" />
                                                Access all reports
                                            </li>
                                            <li className="flex items-center gap-2 text-sm text-gray-600">
                                                <CheckCircle className="w-4 h-4 text-emerald-500" />
                                                Configure system settings
                                            </li>
                                        </>
                                    )}
                                    {selectedRole === 'Faculty' && (
                                        <>
                                            <li className="flex items-center gap-2 text-sm text-gray-600">
                                                <CheckCircle className="w-4 h-4 text-emerald-500" />
                                                Manage assigned courses
                                            </li>
                                            <li className="flex items-center gap-2 text-sm text-gray-600">
                                                <CheckCircle className="w-4 h-4 text-emerald-500" />
                                                Enter student marks
                                            </li>
                                            <li className="flex items-center gap-2 text-sm text-gray-600">
                                                <CheckCircle className="w-4 h-4 text-emerald-500" />
                                                View student attendance
                                            </li>
                                            <li className="flex items-center gap-2 text-sm text-gray-600">
                                                <CheckCircle className="w-4 h-4 text-emerald-500" />
                                                Generate course reports
                                            </li>
                                        </>
                                    )}
                                    {selectedRole === 'Student' && (
                                        <>
                                            <li className="flex items-center gap-2 text-sm text-gray-600">
                                                <CheckCircle className="w-4 h-4 text-emerald-500" />
                                                View enrolled courses
                                            </li>
                                            <li className="flex items-center gap-2 text-sm text-gray-600">
                                                <CheckCircle className="w-4 h-4 text-emerald-500" />
                                                Check grades and marks
                                            </li>
                                            <li className="flex items-center gap-2 text-sm text-gray-600">
                                                <CheckCircle className="w-4 h-4 text-emerald-500" />
                                                View attendance records
                                            </li>
                                            <li className="flex items-center gap-2 text-sm text-gray-600">
                                                <CheckCircle className="w-4 h-4 text-emerald-500" />
                                                Access personal reports
                                            </li>
                                        </>
                                    )}
                                </ul>
                            </Card.Body>
                        </Card>
                    </Transition>
                </div>
            </div>
        </div>
    )
}

export default UserFormPage
