import { useState, useRef, useEffect, Fragment } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Dialog, Transition } from '@headlessui/react'
import { Card, Button } from '@/components/common'
import { userService } from '@/services/userService'
import { useAuth } from '@/context/AuthContext'
import { formatDate, cn } from '@/utils/helpers'
import {
    User,
    Mail,
    Phone,
    Shield,
    Calendar,
    Clock,
    Camera,
    Key,
    Save,
    X,
    Eye,
    EyeOff,
    CheckCircle,
    AlertCircle,
    RefreshCw,
    Building,
    Hash,
    UserCheck,
    UserX,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { getErrorMessage } from '@/utils/errorHandler'

const API_URL = import.meta.env.VITE_API_URL || 'https://localhost:7266'

// Password Change Modal Component - Reusable for any user
export const ChangePasswordModal = ({ isOpen, onClose, userId, userName }) => {
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    })
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    })
    const [errors, setErrors] = useState({})

    const changePasswordMutation = useMutation({
        mutationFn: (data) => userService.changePassword(userId, {
            currentPassword: data.currentPassword,
            newPassword: data.newPassword,
            confirmPassword: data.confirmPassword,
        }),
        onSuccess: () => {
            toast.success('Password changed successfully')
            handleClose()
        },
        onError: (error) => {
            // Handle validation errors from FluentValidation
            const errorData = error.response?.data
            if (errorData?.errors) {
                // FluentValidation format: { errors: { FieldName: ["error message"] } }
                const validationErrors = {}
                Object.entries(errorData.errors).forEach(([key, messages]) => {
                    const fieldName = key.charAt(0).toLowerCase() + key.slice(1)
                    validationErrors[fieldName] = Array.isArray(messages) ? messages[0] : messages
                })
                setErrors(validationErrors)
                const firstError = Object.values(validationErrors)[0]
                toast.error(firstError || 'Validation failed')
            } else {
                const message = errorData?.Message || 'Failed to change password'
                toast.error(message)
                if (message.toLowerCase().includes('current password')) {
                    setErrors({ currentPassword: 'Current password is incorrect' })
                }
            }
        },
    })

    const handleClose = () => {
        setFormData({
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        })
        setShowPasswords({ current: false, new: false, confirm: false })
        setErrors({})
        onClose()
    }

    const validateForm = () => {
        const newErrors = {}

        if (!formData.currentPassword) {
            newErrors.currentPassword = 'Current password is required'
        }

        if (!formData.newPassword) {
            newErrors.newPassword = 'New password is required'
        } else if (formData.newPassword.length < 6) {
            newErrors.newPassword = 'Password must be at least 6 characters'
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your new password'
        } else if (formData.newPassword !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match'
        }

        if (formData.currentPassword && formData.newPassword && formData.currentPassword === formData.newPassword) {
            newErrors.newPassword = 'New password must be different from current password'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if (validateForm()) {
            changePasswordMutation.mutate(formData)
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }))
        }
    }

    const togglePasswordVisibility = (field) => {
        setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }))
    }

    // Password strength indicator
    const getPasswordStrength = (password) => {
        if (!password) return { strength: 0, label: '', color: '' }
        let strength = 0
        if (password.length >= 6) strength++
        if (password.length >= 8) strength++
        if (/[A-Z]/.test(password)) strength++
        if (/[0-9]/.test(password)) strength++
        if (/[^A-Za-z0-9]/.test(password)) strength++

        const levels = [
            { strength: 0, label: '', color: '' },
            { strength: 1, label: 'Weak', color: 'bg-red-500' },
            { strength: 2, label: 'Fair', color: 'bg-orange-500' },
            { strength: 3, label: 'Good', color: 'bg-yellow-500' },
            { strength: 4, label: 'Strong', color: 'bg-green-500' },
            { strength: 5, label: 'Very Strong', color: 'bg-emerald-500' },
        ]

        return levels[Math.min(strength, 5)]
    }

    const passwordStrength = getPasswordStrength(formData.newPassword)

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={handleClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
                                {/* Header */}
                                <div className="relative bg-gradient-to-br from-indigo-500 to-purple-600 px-6 py-5">
                                    {/* Decorative circle - placed first so it's behind */}
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />

                                    {/* Close button with higher z-index */}
                                    <button
                                        type="button"
                                        onClick={handleClose}
                                        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>

                                    <div className="relative flex flex-col items-center">
                                        <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center mb-3 ring-4 ring-white/30">
                                            <Key className="w-8 h-8 text-white" />
                                        </div>
                                        <Dialog.Title className="text-xl font-bold text-white">
                                            Change Password
                                        </Dialog.Title>
                                        <p className="text-white/80 text-sm mt-1">
                                            {userName ? `Update password for ${userName}` : 'Update your account password'}
                                        </p>
                                    </div>
                                </div>

                                {/* Form */}
                                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                    {/* Current Password */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                            Current Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPasswords.current ? 'text' : 'password'}
                                                name="currentPassword"
                                                value={formData.currentPassword}
                                                onChange={handleChange}
                                                className={cn(
                                                    "w-full px-4 py-2.5 pr-10 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all",
                                                    errors.currentPassword ? "border-red-300 bg-red-50" : "border-gray-200"
                                                )}
                                                placeholder="Enter current password"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => togglePasswordVisibility('current')}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                        {errors.currentPassword && (
                                            <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                                                <AlertCircle className="w-4 h-4" />
                                                {errors.currentPassword}
                                            </p>
                                        )}
                                    </div>

                                    {/* New Password */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                            New Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPasswords.new ? 'text' : 'password'}
                                                name="newPassword"
                                                value={formData.newPassword}
                                                onChange={handleChange}
                                                className={cn(
                                                    "w-full px-4 py-2.5 pr-10 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all",
                                                    errors.newPassword ? "border-red-300 bg-red-50" : "border-gray-200"
                                                )}
                                                placeholder="Enter new password"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => togglePasswordVisibility('new')}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                        <p className="mt-1 text-xs text-gray-500">
                                            Must have: uppercase, lowercase, number, special char (@$!%*?&#)
                                        </p>
                                        {formData.newPassword && (
                                            <div className="mt-2">
                                                <div className="flex gap-1 mb-1">
                                                    {[1, 2, 3, 4, 5].map((level) => (
                                                        <div
                                                            key={level}
                                                            className={cn(
                                                                "h-1.5 flex-1 rounded-full transition-colors",
                                                                level <= passwordStrength.strength ? passwordStrength.color : "bg-gray-200"
                                                            )}
                                                        />
                                                    ))}
                                                </div>
                                                <p className="text-xs text-gray-500">
                                                    Password strength: <span className="font-medium">{passwordStrength.label}</span>
                                                </p>
                                            </div>
                                        )}
                                        {errors.newPassword && (
                                            <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                                                <AlertCircle className="w-4 h-4" />
                                                {errors.newPassword}
                                            </p>
                                        )}
                                    </div>

                                    {/* Confirm Password */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                            Confirm New Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPasswords.confirm ? 'text' : 'password'}
                                                name="confirmPassword"
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                className={cn(
                                                    "w-full px-4 py-2.5 pr-10 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all",
                                                    errors.confirmPassword ? "border-red-300 bg-red-50" : "border-gray-200"
                                                )}
                                                placeholder="Confirm new password"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => togglePasswordVisibility('confirm')}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                        {formData.confirmPassword && formData.newPassword === formData.confirmPassword && (
                                            <p className="mt-1.5 text-sm text-green-600 flex items-center gap-1">
                                                <CheckCircle className="w-4 h-4" />
                                                Passwords match
                                            </p>
                                        )}
                                        {errors.confirmPassword && (
                                            <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                                                <AlertCircle className="w-4 h-4" />
                                                {errors.confirmPassword}
                                            </p>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-3 pt-4">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleClose}
                                            className="flex-1"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={changePasswordMutation.isPending}
                                            className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                                        >
                                            {changePasswordMutation.isPending ? (
                                                <>
                                                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                                    Updating...
                                                </>
                                            ) : (
                                                <>
                                                    <Key className="w-4 h-4 mr-2" />
                                                    Update Password
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}

// Main Profile Page Component
const AdminProfilePage = () => {
    const { user: authUser } = useAuth()
    const queryClient = useQueryClient()
    const fileInputRef = useRef(null)
    const [isEditing, setIsEditing] = useState(false)
    const [showPasswordModal, setShowPasswordModal] = useState(false)

    // Fetch full user data from API
    const { data: userData, isLoading, refetch } = useQuery({
        queryKey: ['user-profile', authUser?.id],
        queryFn: () => userService.getById(authUser?.id),
        enabled: !!authUser?.id,
    })

    const user = userData?.Data

    // Form data state
    const [formData, setFormData] = useState({
        fullName: '',
        phoneNumber: '',
        personalEmail: '',
        institutionalEmail: '',
    })

    // Update form data when user data loads
    useEffect(() => {
        if (user) {
            setFormData({
                fullName: user.FullName || '',
                phoneNumber: user.PhoneNumber || '',
                personalEmail: user.PersonalEmail || '',
                institutionalEmail: user.InstitutionalEmail || '',
            })
        }
    }, [user])

    // Update profile mutation
    const updateProfileMutation = useMutation({
        mutationFn: (data) => userService.update(authUser?.id, data),
        onSuccess: () => {
            toast.success('Profile updated successfully')
            setIsEditing(false)
            refetch()
            queryClient.invalidateQueries(['user-profile', authUser?.id])
        },
        onError: (error) => {
            toast.error(getErrorMessage(error))
        },
    })

    // Upload image mutation
    const uploadImageMutation = useMutation({
        mutationFn: (file) => userService.uploadProfileImage(authUser?.id, file),
        onSuccess: () => {
            toast.success('Profile image updated')
            refetch()
        },
        onError: (error) => {
            toast.error(getErrorMessage(error))
        },
    })

    const handleImageChange = (e) => {
        const file = e.target.files?.[0]
        if (file) {
            // Validate file type and size
            const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
            if (!validTypes.includes(file.type)) {
                toast.error('Please upload a valid image file (JPEG, PNG, GIF, or WebP)')
                return
            }
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size should be less than 5MB')
                return
            }
            uploadImageMutation.mutate(file)
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        updateProfileMutation.mutate({
            fullName: formData.fullName,
            phoneNumber: formData.phoneNumber,
            personalEmail: formData.personalEmail,
            institutionalEmail: formData.institutionalEmail,
        })
    }

    const handleCancel = () => {
        setFormData({
            fullName: user?.FullName || '',
            phoneNumber: user?.PhoneNumber || '',
            personalEmail: user?.PersonalEmail || '',
            institutionalEmail: user?.InstitutionalEmail || '',
        })
        setIsEditing(false)
    }

    const getRoleGradient = (role) => {
        switch (role) {
            case 'Admin':
                return 'from-rose-500 to-pink-600'
            case 'Faculty':
                return 'from-blue-500 to-indigo-600'
            default:
                return 'from-emerald-500 to-teal-600'
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/25">
                    <User className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
                    <p className="text-gray-500">Manage your account information and settings</p>
                </div>
            </div>

            {/* Profile Card */}
            <Card className="border-0 shadow-lg overflow-hidden">
                {/* Profile Header */}
                <div className={cn(
                    "relative bg-gradient-to-br px-6 py-8",
                    getRoleGradient(user?.Role)
                )}>
                    {/* Decorative circles */}
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

                    <div className="relative flex flex-col sm:flex-row items-center gap-6">
                        {/* Profile Image */}
                        <div className="relative group">
                            <div className="w-28 h-28 rounded-full bg-white/20 backdrop-blur flex items-center justify-center ring-4 ring-white/30 overflow-hidden">
                                {user?.ProfileImagePath ? (
                                    <img
                                        src={`${API_URL}${user.ProfileImagePath}`}
                                        alt={user?.FullName}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-4xl font-bold text-white">
                                        {user?.FullName?.charAt(0)?.toUpperCase() || 'U'}
                                    </span>
                                )}
                            </div>
                            {/* Upload overlay */}
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploadImageMutation.isPending}
                                className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            >
                                {uploadImageMutation.isPending ? (
                                    <RefreshCw className="w-6 h-6 text-white animate-spin" />
                                ) : (
                                    <Camera className="w-6 h-6 text-white" />
                                )}
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/gif,image/webp"
                                onChange={handleImageChange}
                                className="hidden"
                            />
                        </div>

                        {/* User Info */}
                        <div className="text-center sm:text-left">
                            <h2 className="text-2xl font-bold text-white">{user?.FullName}</h2>
                            <p className="text-white/80 mt-1">{user?.PersonalEmail}</p>
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-sm font-medium">
                                    <Shield className="w-4 h-4" />
                                    {user?.Role}
                                </span>
                                <span className={cn(
                                    "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium",
                                    user?.IsActive ? "bg-emerald-500/80 text-white" : "bg-red-500/80 text-white"
                                )}>
                                    {user?.IsActive ? (
                                        <><UserCheck className="w-4 h-4" /> Active</>
                                    ) : (
                                        <><UserX className="w-4 h-4" /> Inactive</>
                                    )}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Profile Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Account Information */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Account Information</h3>
                            {!isEditing && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsEditing(true)}
                                >
                                    Edit Profile
                                </Button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* User ID */}
                            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <Hash className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">User ID</p>
                                    <p className="font-medium text-gray-900">#{user?.Id}</p>
                                </div>
                            </div>

                            {/* Role */}
                            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                                <div className="p-2 bg-rose-100 rounded-lg">
                                    <Shield className="w-5 h-5 text-rose-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Role</p>
                                    <p className="font-medium text-gray-900">{user?.Role}</p>
                                </div>
                            </div>

                            {/* Full Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    <User className="w-4 h-4 inline mr-1.5" />
                                    Full Name
                                </label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={formData.fullName}
                                        onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                                        placeholder="Enter full name"
                                    />
                                ) : (
                                    <p className="px-4 py-2.5 bg-gray-50 rounded-xl text-gray-900">{user?.FullName || 'N/A'}</p>
                                )}
                            </div>

                            {/* Phone Number */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    <Phone className="w-4 h-4 inline mr-1.5" />
                                    Phone Number
                                </label>
                                {isEditing ? (
                                    <input
                                        type="tel"
                                        value={formData.phoneNumber}
                                        onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                                        placeholder="Enter phone number"
                                    />
                                ) : (
                                    <p className="px-4 py-2.5 bg-gray-50 rounded-xl text-gray-900">{user?.PhoneNumber || 'Not provided'}</p>
                                )}
                            </div>

                            {/* Personal Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    <Mail className="w-4 h-4 inline mr-1.5" />
                                    Personal Email
                                </label>
                                {isEditing ? (
                                    <input
                                        type="email"
                                        value={formData.personalEmail}
                                        onChange={(e) => setFormData(prev => ({ ...prev, personalEmail: e.target.value }))}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                                        placeholder="Enter personal email"
                                    />
                                ) : (
                                    <p className="px-4 py-2.5 bg-gray-50 rounded-xl text-gray-900">{user?.PersonalEmail || 'Not provided'}</p>
                                )}
                            </div>

                            {/* Institutional Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    <Building className="w-4 h-4 inline mr-1.5" />
                                    Institutional Email
                                </label>
                                {isEditing ? (
                                    <input
                                        type="email"
                                        value={formData.institutionalEmail}
                                        onChange={(e) => setFormData(prev => ({ ...prev, institutionalEmail: e.target.value }))}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                                        placeholder="Enter institutional email"
                                    />
                                ) : (
                                    <p className="px-4 py-2.5 bg-gray-50 rounded-xl text-gray-900">{user?.InstitutionalEmail || 'Not provided'}</p>
                                )}
                            </div>
                        </div>

                        {/* Save/Cancel buttons for edit mode */}
                        {isEditing && (
                            <div className="flex gap-3 mt-6">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleCancel}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={updateProfileMutation.isPending}
                                    className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                                >
                                    {updateProfileMutation.isPending ? (
                                        <>
                                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4 mr-2" />
                                            Save Changes
                                        </>
                                    )}
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Timestamps */}
                    <div className="pt-6 border-t border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Activity</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                                <div className="p-2.5 bg-white rounded-lg shadow-sm">
                                    <Calendar className="w-5 h-5 text-indigo-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Account Created</p>
                                    <p className="font-medium text-gray-900">{formatDate(user?.CreatedAt)}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                                <div className="p-2.5 bg-white rounded-lg shadow-sm">
                                    <Clock className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Last Updated</p>
                                    <p className="font-medium text-gray-900">{formatDate(user?.UpdatedAt) || 'Never'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </Card>

            {/* Security Card */}
            <Card className="border-0 shadow-lg overflow-hidden">
                <Card.Body className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Security</h3>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-white rounded-lg shadow-sm">
                                <Key className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">Password</p>
                                <p className="text-sm text-gray-500">Change your account password</p>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => setShowPasswordModal(true)}
                        >
                            <Key className="w-4 h-4 mr-2" />
                            Change Password
                        </Button>
                    </div>
                </Card.Body>
            </Card>

            {/* Change Password Modal */}
            <ChangePasswordModal
                isOpen={showPasswordModal}
                onClose={() => setShowPasswordModal(false)}
                userId={user?.Id}
            />
        </div>
    )
}

export default AdminProfilePage
