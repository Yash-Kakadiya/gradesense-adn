import { useState, useRef, useEffect, Fragment } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Dialog, Transition } from '@headlessui/react'
import { Card, Badge, Button } from '@/components/common'
import { userService } from '@/services/userService'
import { courseOfferingService } from '@/services/courseOfferingService'
import { facultyService } from '@/services/facultyService'
import { useAuth } from '@/context/AuthContext'
import { formatDate, cn } from '@/utils/helpers'
import { getErrorMessage } from '@/utils/errorHandler'
import toast from 'react-hot-toast'
import {
    User,
    Mail,
    Phone,
    Shield,
    Calendar,
    Clock,
    Key,
    Save,
    X,
    Eye,
    EyeOff,
    RefreshCw,
    UserCheck,
    BookOpen,
    Edit2,
} from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'https://localhost:7266'

// Password Change Modal Component
const ChangePasswordModal = ({ isOpen, onClose, userId }) => {
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
        mutationFn: (data) => userService.changePassword(userId, data),
        onSuccess: () => {
            toast.success('Password changed successfully')
            handleClose()
        },
        onError: (error) => {
            toast.error(getErrorMessage(error))
        },
    })

    const handleClose = () => {
        setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' })
        setShowPasswords({ current: false, new: false, confirm: false })
        setErrors({})
        onClose()
    }

    const validateForm = () => {
        const newErrors = {}
        if (!formData.currentPassword) newErrors.currentPassword = 'Current password is required'
        if (!formData.newPassword) newErrors.newPassword = 'New password is required'
        else if (formData.newPassword.length < 6) newErrors.newPassword = 'Password must be at least 6 characters'
        if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your new password'
        else if (formData.newPassword !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match'
        if (formData.currentPassword && formData.newPassword && formData.currentPassword === formData.newPassword)
            newErrors.newPassword = 'New password must be different from current password'
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if (validateForm()) changePasswordMutation.mutate(formData)
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
    }

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={handleClose}>
                <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
                                {/* Header */}
                                <div className="relative bg-gradient-to-br from-indigo-500 to-purple-600 px-6 py-5">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                                    <button type="button" onClick={handleClose} className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors">
                                        <X className="w-5 h-5" />
                                    </button>
                                    <div className="relative z-0">
                                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-3">
                                            <Key className="w-6 h-6 text-white" />
                                        </div>
                                        <Dialog.Title className="text-xl font-bold text-white">Change Password</Dialog.Title>
                                        <p className="text-white/80 text-sm mt-1">Update your account password</p>
                                    </div>
                                </div>

                                {/* Form */}
                                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                    {/* Current Password */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Password</label>
                                        <div className="relative">
                                            <input
                                                type={showPasswords.current ? 'text' : 'password'}
                                                name="currentPassword"
                                                value={formData.currentPassword}
                                                onChange={handleChange}
                                                className={cn("w-full px-4 py-2.5 pr-12 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all", errors.currentPassword ? 'border-red-300 bg-red-50' : 'border-gray-200')}
                                                placeholder="Enter current password"
                                            />
                                            <button type="button" onClick={() => setShowPasswords(p => ({ ...p, current: !p.current }))} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600">
                                                {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                        {errors.currentPassword && <p className="text-red-500 text-xs mt-1">{errors.currentPassword}</p>}
                                    </div>

                                    {/* New Password */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
                                        <div className="relative">
                                            <input
                                                type={showPasswords.new ? 'text' : 'password'}
                                                name="newPassword"
                                                value={formData.newPassword}
                                                onChange={handleChange}
                                                className={cn("w-full px-4 py-2.5 pr-12 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all", errors.newPassword ? 'border-red-300 bg-red-50' : 'border-gray-200')}
                                                placeholder="Enter new password"
                                            />
                                            <button type="button" onClick={() => setShowPasswords(p => ({ ...p, new: !p.new }))} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600">
                                                {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                        {errors.newPassword && <p className="text-red-500 text-xs mt-1">{errors.newPassword}</p>}
                                    </div>

                                    {/* Confirm Password */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm New Password</label>
                                        <div className="relative">
                                            <input
                                                type={showPasswords.confirm ? 'text' : 'password'}
                                                name="confirmPassword"
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                className={cn("w-full px-4 py-2.5 pr-12 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all", errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-200')}
                                                placeholder="Confirm new password"
                                            />
                                            <button type="button" onClick={() => setShowPasswords(p => ({ ...p, confirm: !p.confirm }))} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600">
                                                {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                        {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-3 pt-4">
                                        <Button type="button" variant="outline" className="flex-1" onClick={handleClose}>Cancel</Button>
                                        <Button type="submit" variant="primary" className="flex-1" disabled={changePasswordMutation.isPending}>
                                            {changePasswordMutation.isPending ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Key className="w-4 h-4 mr-2" />}
                                            Change Password
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

// Info Row Component
const InfoRow = ({ icon: Icon, label, value, className }) => (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
        <div className="p-2 bg-gray-100 rounded-lg">
            <Icon className="w-4 h-4 text-gray-500" />
        </div>
        <div className="flex-1">
            <p className="text-xs text-gray-500 mb-0.5">{label}</p>
            <p className={cn("text-gray-900 font-medium", className)}>{value || 'Not provided'}</p>
        </div>
    </div>
)

const FacultyProfilePage = () => {
    const { user: authUser } = useAuth()
    const queryClient = useQueryClient()
    const [isEditing, setIsEditing] = useState(false)
    const [showPasswordModal, setShowPasswordModal] = useState(false)

    // Fetch user profile
    const { data: userData, isLoading: loadingUser, refetch: refetchUser } = useQuery({
        queryKey: ['user-profile', authUser?.id],
        queryFn: () => userService.getById(authUser?.id),
        enabled: !!authUser?.id,
    })

    // Fetch faculty details (Faculty.Id = User.Id)
    const { data: facultyData, isLoading: loadingFaculty } = useQuery({
        queryKey: ['faculty-profile', authUser?.id],
        queryFn: () => facultyService.getById(authUser?.id),
        enabled: !!authUser?.id,
    })

    // Fetch faculty's course offerings
    const { data: coursesData } = useQuery({
        queryKey: ['faculty-courses-profile'],
        queryFn: () => courseOfferingService.getAll({ pageSize: 100 }),
    })

    const user = userData?.Data
    const faculty = facultyData?.Data
    const courses = coursesData?.Data?.Data || coursesData?.Data || []

    // Form data
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phoneNumber: '',
    })

    useEffect(() => {
        if (user) {
            setFormData({
                fullName: user.FullName || '',
                email: user.Email || '',
                phoneNumber: user.PhoneNumber || '',
            })
        }
    }, [user])

    // Update profile mutation
    const updateProfileMutation = useMutation({
        mutationFn: (data) => userService.update(authUser?.id, data),
        onSuccess: () => {
            toast.success('Profile updated successfully')
            setIsEditing(false)
            queryClient.invalidateQueries(['user-profile'])
            refetchUser()
        },
        onError: (error) => {
            toast.error(getErrorMessage(error))
        },
    })

    const handleSave = () => {
        updateProfileMutation.mutate(formData)
    }

    const handleCancel = () => {
        if (user) {
            setFormData({
                fullName: user.FullName || '',
                email: user.Email || '',
                phoneNumber: user.PhoneNumber || '',
            })
        }
        setIsEditing(false)
    }

    const isLoading = loadingUser

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-center">
                    <RefreshCw className="w-10 h-10 animate-spin text-blue-600 mx-auto" />
                    <p className="text-sm text-gray-500 mt-3">Loading profile...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/25">
                    <User className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent">
                        My Profile
                    </h1>
                    <p className="text-gray-500">View and manage your profile information</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Card */}
                <Card className="border-0 shadow-md overflow-hidden">
                    {/* Cover */}
                    <div className="h-24 bg-gradient-to-br from-blue-500 to-indigo-600 relative">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_-20%,rgba(255,255,255,0.2),transparent)]" />
                    </div>

                    {/* Avatar */}
                    <div className="relative px-6 pb-6">
                        <div className="absolute -top-12 left-6">
                            <div className="w-24 h-24 rounded-2xl bg-white shadow-lg p-1">
                                {user?.ProfilePictureUrl ? (
                                    <img
                                        src={`${API_URL}${user.ProfilePictureUrl}`}
                                        alt={user.FullName}
                                        className="w-full h-full object-cover rounded-xl"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                                        <span className="text-3xl font-bold text-white">
                                            {user?.FullName?.charAt(0) || 'F'}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="pt-14">
                            <h2 className="text-xl font-bold text-gray-900">{user?.FullName}</h2>
                            <p className="text-gray-500">{faculty?.Designation || 'Faculty Member'}</p>

                            <div className="flex items-center gap-2 mt-3">
                                <Badge variant={user?.IsActive ? 'success' : 'danger'}>
                                    {user?.IsActive ? 'Active' : 'Inactive'}
                                </Badge>
                                <Badge variant="primary">{user?.Role}</Badge>
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => setShowPasswordModal(true)}
                                >
                                    <Key className="w-4 h-4 mr-2" />
                                    Change Password
                                </Button>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Details Card */}
                <Card className="border-0 shadow-md lg:col-span-2">
                    <Card.Header className="border-b border-gray-100">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <UserCheck className="w-5 h-5 text-blue-600" />
                                <h3 className="font-semibold text-gray-900">Personal Information</h3>
                            </div>
                            {!isEditing ? (
                                <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                                    <Edit2 className="w-4 h-4 mr-2" />
                                    Edit
                                </Button>
                            ) : (
                                <div className="flex gap-2">
                                    <Button variant="ghost" size="sm" onClick={handleCancel}>
                                        <X className="w-4 h-4 mr-2" />
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        onClick={handleSave}
                                        disabled={updateProfileMutation.isPending}
                                    >
                                        {updateProfileMutation.isPending ? (
                                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                        ) : (
                                            <Save className="w-4 h-4 mr-2" />
                                        )}
                                        Save
                                    </Button>
                                </div>
                            )}
                        </div>
                    </Card.Header>
                    <Card.Body className="p-0">
                        {isEditing ? (
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                                    <input
                                        type="text"
                                        value={formData.fullName}
                                        onChange={(e) => setFormData(p => ({ ...p, fullName: e.target.value }))}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
                                    <input
                                        type="tel"
                                        value={formData.phoneNumber}
                                        onChange={(e) => setFormData(p => ({ ...p, phoneNumber: e.target.value }))}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="px-6">
                                <InfoRow icon={User} label="Full Name" value={user?.FullName} />
                                <InfoRow icon={Mail} label="Email Address" value={user?.Email} />
                                <InfoRow icon={Phone} label="Phone Number" value={user?.PhoneNumber} />
                                <InfoRow icon={Shield} label="Role" value={user?.Role} />
                                <InfoRow icon={Calendar} label="Member Since" value={formatDate(user?.CreatedAt)} />
                                <InfoRow icon={Clock} label="Last Login" value={formatDate(user?.LastLoginAt)} />
                            </div>
                        )}
                    </Card.Body>
                </Card>

                {/* Current Courses Card */}
                <Card className="border-0 shadow-md lg:col-span-3">
                    <Card.Header className="border-b border-gray-100">
                        <div className="flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-emerald-600" />
                            <h3 className="font-semibold text-gray-900">My Courses</h3>
                            <Badge variant="secondary">{courses.length}</Badge>
                        </div>
                    </Card.Header>
                    <Card.Body className="p-4">
                        {courses.length === 0 ? (
                            <p className="text-center text-gray-500 py-6">No courses assigned</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {courses.slice(0, 6).map((course) => (
                                    <div key={course.Id} className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-emerald-100 rounded-lg">
                                                <BookOpen className="w-4 h-4 text-emerald-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-gray-900 truncate">{course.SubjectName}</p>
                                                <p className="text-xs text-gray-500">{course.SubjectCode} • {course.BatchName}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Badge variant="secondary" className="text-xs">Sem {course.Semester}</Badge>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {courses.length > 6 && (
                            <p className="text-center text-sm text-gray-500 mt-3">
                                +{courses.length - 6} more courses
                            </p>
                        )}
                    </Card.Body>
                </Card>
            </div>

            {/* Password Modal */}
            <ChangePasswordModal
                isOpen={showPasswordModal}
                onClose={() => setShowPasswordModal(false)}
                userId={authUser?.id}
            />
        </div>
    )
}

export default FacultyProfilePage
