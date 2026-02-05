import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
    X,
    Edit,
    Hash,
    Mail,
    Phone,
    Calendar,
    Clock,
    UserCheck,
    UserX,
    Shield,
    UserCog,
    Users,
    Building,
    RefreshCw,
} from 'lucide-react'
import { userService } from '@/services/userService'
import { ROUTES } from '@/utils/constants'
import { cn } from '@/utils/helpers'

const API_URL = import.meta.env.VITE_API_URL || 'https://localhost:7266'

const UserDetailModal = ({ isOpen, onClose, userId }) => {
    const navigate = useNavigate()

    // Fetch full user details when modal opens
    const { data: userData, isLoading } = useQuery({
        queryKey: ['user-detail', userId],
        queryFn: () => userService.getById(userId),
        enabled: isOpen && !!userId,
    })

    const user = userData?.Data

    const getRoleIcon = (role) => {
        switch (role) {
            case 'Admin':
                return <Shield className="w-5 h-5" />
            case 'Faculty':
                return <UserCog className="w-5 h-5" />
            default:
                return <Users className="w-5 h-5" />
        }
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

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A'
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        })
    }

    const handleClose = (e) => {
        if (e) e.stopPropagation()
        onClose()
    }

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
                            <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
                                {isLoading ? (
                                    <div className="flex items-center justify-center py-16">
                                        <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
                                    </div>
                                ) : user ? (
                                    <>
                                        {/* Header with gradient */}
                                        <div className={`relative bg-gradient-to-br ${getRoleGradient(user.Role)} px-6 py-5`}>
                                            {/* Action buttons */}
                                            <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        handleClose()
                                                        navigate(`${ROUTES.ADMIN_USERS}/${user.Id}/edit`)
                                                    }}
                                                    className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors group"
                                                    title="Edit User"
                                                >
                                                    <Edit className="w-5 h-5" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={handleClose}
                                                    className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
                                                >
                                                    <X className="w-5 h-5" />
                                                </button>
                                            </div>

                                            {/* Decorative circles */}
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

                                            <div className="relative flex flex-col items-center">
                                                <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur flex items-center justify-center mb-4 ring-4 ring-white/30 overflow-hidden">
                                                    {user.ProfileImagePath ? (
                                                        <img
                                                            src={`${API_URL}${user.ProfileImagePath}`}
                                                            alt={user.FullName}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <span className="text-3xl font-bold text-white">
                                                            {user.FullName?.charAt(0)?.toUpperCase() || 'U'}
                                                        </span>
                                                    )}
                                                </div>
                                                <Dialog.Title className="text-xl font-bold text-white">
                                                    {user.FullName}
                                                </Dialog.Title>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-sm font-medium">
                                                        {getRoleIcon(user.Role)}
                                                        {user.Role}
                                                    </span>
                                                    <span className={cn(
                                                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium",
                                                        user.IsActive ? "bg-emerald-500/80 text-white" : "bg-red-500/80 text-white"
                                                    )}>
                                                        {user.IsActive ? (
                                                            <><UserCheck className="w-4 h-4" /> Active</>
                                                        ) : (
                                                            <><UserX className="w-4 h-4" /> Inactive</>
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Content - Scrollable */}
                                        <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
                                            {/* Account Information */}
                                            <div>
                                                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Account Information</h3>
                                                <div className="grid grid-cols-3 gap-3">
                                                    {/* User ID */}
                                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                        <div className="p-2 bg-purple-100 rounded-lg">
                                                            <Hash className="w-5 h-5 text-purple-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500">User ID</p>
                                                            <p className="font-medium text-gray-900">#{user.Id}</p>
                                                        </div>
                                                    </div>

                                                    {/* Role Info */}
                                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                        <div className={cn(
                                                            "p-2 rounded-lg",
                                                            user.Role === 'Admin' && "bg-rose-100",
                                                            user.Role === 'Faculty' && "bg-blue-100",
                                                            user.Role === 'Student' && "bg-emerald-100"
                                                        )}>
                                                            {getRoleIcon(user.Role)}
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500">Role</p>
                                                            <p className="font-medium text-gray-900">{user.Role}</p>
                                                        </div>
                                                    </div>

                                                    {/* Status */}
                                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                        <div className={cn(
                                                            "p-2 rounded-lg",
                                                            user.IsActive ? "bg-emerald-100" : "bg-red-100"
                                                        )}>
                                                            {user.IsActive ? (
                                                                <UserCheck className="w-5 h-5 text-emerald-600" />
                                                            ) : (
                                                                <UserX className="w-5 h-5 text-red-600" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500">Account Status</p>
                                                            <p className={cn(
                                                                "font-medium",
                                                                user.IsActive ? "text-emerald-600" : "text-red-600"
                                                            )}>
                                                                {user.IsActive ? 'Active' : 'Inactive'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Contact Information */}
                                            <div>
                                                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Contact Information</h3>
                                                <div className="grid grid-cols-3 gap-3">
                                                    {/* Personal Email */}
                                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                        <div className="p-2 bg-blue-100 rounded-lg">
                                                            <Mail className="w-5 h-5 text-blue-600" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs text-gray-500">Personal Email</p>
                                                            <p className="font-medium text-gray-900 truncate">{user.PersonalEmail}</p>
                                                        </div>
                                                    </div>

                                                    {/* Institutional Email */}
                                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                        <div className="p-2 bg-indigo-100 rounded-lg">
                                                            <Building className="w-5 h-5 text-indigo-600" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs text-gray-500">Institutional Email</p>
                                                            <p className="font-medium text-gray-900 truncate">{user.InstitutionalEmail || 'N/A'}</p>
                                                        </div>
                                                    </div>

                                                    {/* Phone Number */}
                                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                        <div className="p-2 bg-green-100 rounded-lg">
                                                            <Phone className="w-5 h-5 text-green-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500">Phone Number</p>
                                                            <p className="font-medium text-gray-900">{user.PhoneNumber || 'N/A'}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Timestamps */}
                                            <div>
                                                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Activity</h3>
                                                <div className="grid grid-cols-2 gap-3">
                                                    {/* Created Date */}
                                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                        <div className="p-2 bg-gray-100 rounded-lg">
                                                            <Calendar className="w-5 h-5 text-gray-500" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500">Created</p>
                                                            <p className="font-medium text-gray-900 text-sm">
                                                                {formatDate(user.CreatedAt)}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Updated Date */}
                                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                        <div className="p-2 bg-gray-100 rounded-lg">
                                                            <Clock className="w-5 h-5 text-gray-500" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500">Last Updated</p>
                                                            <p className="font-medium text-gray-900 text-sm">
                                                                {formatDate(user.UpdatedAt) || 'Never'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="py-16 text-center text-gray-500">
                                        User not found
                                    </div>
                                )}
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}

export default UserDetailModal
