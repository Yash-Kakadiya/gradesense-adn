import { useState, useEffect, Fragment } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Dialog, Transition, Menu } from '@headlessui/react'
import {
    Pagination,
    Badge,
    Button,
    Select,
    Card,
    ConfirmDialog,
    ExportDropdown,
} from '@/components/common'
import { userService } from '@/services/userService'
import { dashboardService } from '@/services/dashboardService'
import { exportUsersToCsv, exportUsersToExcel, downloadBlob } from '@/services/exportService'
import { usePagination, useModal } from '@/hooks'
import { formatDate, cn } from '@/utils/helpers'
import { ROUTES, ROLES } from '@/utils/constants'
import { ChangePasswordModal } from '@/pages/admin/profile/AdminProfilePage'
import {
    Edit,
    Trash2,
    Eye,
    Users,
    UserPlus,
    MoreVertical,
    Shield,
    UserCheck,
    UserX,
    Mail,
    Calendar,
    Clock,
    Download,
    CheckSquare,
    Square,
    X,
    RefreshCw,
    Search,
    SlidersHorizontal,
    UserCog,
    Key,
    Hash,
    Phone,
    Building,
    GraduationCap,
} from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'https://localhost:7266'
import toast from 'react-hot-toast'

// User Detail Modal Component
const UserDetailModal = ({ isOpen, onClose, userId, onChangePassword }) => {
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
                                                        onChangePassword && onChangePassword(user)
                                                    }}
                                                    className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors group"
                                                    title="Change Password"
                                                >
                                                    <Key className="w-5 h-5" />
                                                </button>
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

                                        {/* Content */}
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

// Stats Card Component
const StatsCard = ({ icon: Icon, label, value, color, loading }) => (
    <div className={cn(
        "relative overflow-hidden rounded-xl p-4",
        "bg-gradient-to-br",
        color
    )}>
        <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-lg backdrop-blur">
                <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
                <p className="text-white/80 text-sm font-medium">{label}</p>
                {loading ? (
                    <div className="h-8 w-12 bg-white/20 rounded animate-pulse" />
                ) : (
                    <p className="text-2xl font-bold text-white">{value}</p>
                )}
            </div>
        </div>
    </div>
)

// Debounce hook for search
const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value)

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value)
        }, delay)

        return () => clearTimeout(handler)
    }, [value, delay])

    return debouncedValue
}

const UsersPage = () => {
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const deleteModal = useModal()
    const [viewUserId, setViewUserId] = useState(null)
    const [isViewModalOpen, setIsViewModalOpen] = useState(false)
    const [passwordModalUser, setPasswordModalUser] = useState(null)
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)

    // Filters
    const [searchInput, setSearchInput] = useState('')
    const [roleFilter, setRoleFilter] = useState('')
    const [statusFilter, setStatusFilter] = useState('')
    const [showFilters, setShowFilters] = useState(false)

    // Debounced search
    const debouncedSearch = useDebounce(searchInput, 300)

    // Selection
    const [selectedUsers, setSelectedUsers] = useState([])

    // Pagination
    const {
        currentPage,
        pageSize,
        handlePageChange,
        handlePageSizeChange,
        paginationParams,
    } = usePagination()

    // Fetch dashboard stats for accurate counts
    const { data: dashboardData, isLoading: statsLoading, refetch: refetchStats } = useQuery({
        queryKey: ['admin-dashboard-stats'],
        queryFn: () => dashboardService.getAdminDashboard(),
        staleTime: 30000, // Cache for 30 seconds
    })

    const stats = dashboardData?.Data || {}

    // Fetch users
    const { data, isLoading, refetch } = useQuery({
        queryKey: ['users', paginationParams, debouncedSearch, roleFilter, statusFilter],
        queryFn: () =>
            userService.getAll({
                ...paginationParams,
                search: debouncedSearch || undefined,
                role: roleFilter || undefined,
                isActive: statusFilter === '' ? undefined : statusFilter === 'active',
            }),
    })

    // Get users from API response
    const users = data?.Data?.Data || []
    const totalItems = data?.Data?.TotalRecords || 0
    const totalPages = data?.Data?.TotalPages || 1

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: (id) => userService.delete(id),
        onSuccess: () => {
            toast.success('User deleted successfully')
            queryClient.invalidateQueries(['users'])
            queryClient.invalidateQueries(['admin-dashboard-stats'])
            deleteModal.close()
            setSelectedUsers([])
        },
        onError: () => {
            toast.error('Failed to delete user')
        },
    })

    // Toggle status mutation
    const toggleStatusMutation = useMutation({
        mutationFn: ({ id, isActive }) =>
            isActive ? userService.deactivate(id) : userService.activate(id),
        onSuccess: (_, variables) => {
            toast.success(`User ${variables.isActive ? 'deactivated' : 'activated'} successfully`)
            queryClient.invalidateQueries(['users'])
            queryClient.invalidateQueries(['admin-dashboard-stats'])
        },
        onError: () => {
            toast.error('Failed to update user status')
        },
    })

    const handleDelete = () => {
        if (deleteModal.data) {
            deleteMutation.mutate(deleteModal.data.Id)
        }
    }

    const handleToggleStatus = (user, e) => {
        if (e) e.stopPropagation()
        toggleStatusMutation.mutate({ id: user.Id, isActive: user.IsActive })
    }

    const handleSelectAll = () => {
        if (selectedUsers.length === users.length) {
            setSelectedUsers([])
        } else {
            setSelectedUsers(users.map(u => u.Id))
        }
    }

    const handleSelectUser = (userId, e) => {
        if (e) e.stopPropagation()
        setSelectedUsers(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        )
    }

    const handleBulkDelete = async () => {
        if (selectedUsers.length === 0) return

        try {
            await Promise.all(selectedUsers.map(id => userService.delete(id)))
            toast.success(`${selectedUsers.length} users deleted successfully`)
            queryClient.invalidateQueries(['users'])
            queryClient.invalidateQueries(['admin-dashboard-stats'])
            setSelectedUsers([])
        } catch (error) {
            toast.error('Failed to delete some users')
        }
    }

    const handleExportCsv = async () => {
        const filters = {
            role: roleFilter || undefined,
            search: searchInput || undefined,
            isActive: statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined
        }
        const blob = await exportUsersToCsv(filters)
        downloadBlob(blob, `users-export-${new Date().toISOString().split('T')[0]}.csv`)
    }

    const handleExportExcel = async () => {
        const filters = {
            role: roleFilter || undefined,
            search: searchInput || undefined,
            isActive: statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined
        }
        const blob = await exportUsersToExcel(filters)
        downloadBlob(blob, `users-export-${new Date().toISOString().split('T')[0]}.xlsx`)
    }

    const handleRefresh = () => {
        refetch()
        refetchStats()
        toast.success('Data refreshed')
    }

    const clearFilters = () => {
        setSearchInput('')
        setRoleFilter('')
        setStatusFilter('')
    }

    const handleViewUser = (user) => {
        setViewUserId(user.Id)
        setIsViewModalOpen(true)
    }

    const handleCloseViewModal = () => {
        setIsViewModalOpen(false)
        setViewUserId(null)
    }

    const handleChangePassword = (user) => {
        setPasswordModalUser(user)
        setIsPasswordModalOpen(true)
    }

    const handleClosePasswordModal = () => {
        setIsPasswordModalOpen(false)
        setPasswordModalUser(null)
    }

    const hasActiveFilters = searchInput || roleFilter || statusFilter

    const getRoleColor = (role) => {
        switch (role) {
            case 'Admin':
                return 'from-rose-500 to-pink-600'
            case 'Faculty':
                return 'from-blue-500 to-indigo-600'
            default:
                return 'from-emerald-500 to-teal-600'
        }
    }

    const getRoleStyle = (role) => {
        switch (role) {
            case 'Admin':
                return { variant: 'danger', icon: Shield }
            case 'Faculty':
                return { variant: 'info', icon: UserCog }
            default:
                return { variant: 'success', icon: Users }
        }
    }

    const roleOptions = [
        { value: '', label: 'All Roles' },
        { value: ROLES.ADMIN, label: 'Admin' },
        { value: ROLES.FACULTY, label: 'Faculty' },
        { value: ROLES.STUDENT, label: 'Student' },
    ]

    const statusOptions = [
        { value: '', label: 'All Status' },
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
    ]

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/25">
                            <Users className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                            <p className="text-gray-500">Manage system users, roles, and permissions</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <ExportDropdown
                        onExportCsv={handleExportCsv}
                        onExportExcel={handleExportExcel}
                    />
                    <Button
                        onClick={() => navigate(`${ROUTES.ADMIN_USERS}/create`)}
                        className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25"
                    >
                        <UserPlus className="w-4 h-4" />
                        Add User
                    </Button>
                </div>
            </div>

            {/* Stats Cards - Using Dashboard Stats for accurate counts */}
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                <StatsCard
                    icon={Users}
                    label="Total Users"
                    value={stats.TotalUsers || 0}
                    color="from-blue-500 to-indigo-600"
                    loading={statsLoading}
                />
                <StatsCard
                    icon={Shield}
                    label="Admins"
                    value={stats.AdminUsers || 0}
                    color="from-rose-500 to-pink-600"
                    loading={statsLoading}
                />
                <StatsCard
                    icon={UserCog}
                    label="Faculties"
                    value={stats.TotalFaculties || 0}
                    color="from-indigo-500 to-purple-600"
                    loading={statsLoading}
                />
                <StatsCard
                    icon={GraduationCap}
                    label="Students"
                    value={stats.TotalStudents || 0}
                    color="from-cyan-500 to-blue-600"
                    loading={statsLoading}
                />
                <StatsCard
                    icon={UserCheck}
                    label="Active"
                    value={stats.ActiveUsers || 0}
                    color="from-emerald-500 to-teal-600"
                    loading={statsLoading}
                />
                <StatsCard
                    icon={UserX}
                    label="Inactive"
                    value={stats.InactiveUsers || 0}
                    color="from-amber-500 to-orange-600"
                    loading={statsLoading}
                />
            </div>

            {/* Filters */}
            <Card className="border-0 shadow-sm overflow-hidden">
                <Card.Body className="p-4">
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                placeholder="Search by name or email..."
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-0 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                            />
                            {searchInput && (
                                <button
                                    onClick={() => setSearchInput('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full"
                                >
                                    <X className="w-4 h-4 text-gray-400" />
                                </button>
                            )}
                        </div>

                        {/* Filter toggles */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={cn(
                                    "inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
                                    showFilters
                                        ? "bg-blue-50 text-blue-600"
                                        : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                                )}
                            >
                                <SlidersHorizontal className="w-4 h-4" />
                                Filters
                                {hasActiveFilters && (
                                    <span className="w-2 h-2 bg-blue-500 rounded-full" />
                                )}
                            </button>

                            <button
                                onClick={handleRefresh}
                                disabled={isLoading}
                                className="p-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50"
                                title="Refresh"
                            >
                                <RefreshCw className={cn(
                                    "w-4 h-4 text-gray-500",
                                    isLoading && "animate-spin"
                                )} />
                            </button>
                        </div>
                    </div>

                    {/* Expanded Filters */}
                    {showFilters && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <div className="flex flex-wrap items-end gap-4">
                                <div className="w-48">
                                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Role</label>
                                    <Select
                                        value={roleFilter}
                                        onChange={(e) => setRoleFilter(e.target.value)}
                                        options={roleOptions}
                                        className="bg-gray-50 border-0"
                                    />
                                </div>
                                <div className="w-48">
                                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Status</label>
                                    <Select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        options={statusOptions}
                                        className="bg-gray-50 border-0"
                                    />
                                </div>
                                {hasActiveFilters && (
                                    <button
                                        onClick={clearFilters}
                                        className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                        Clear filters
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </Card.Body>
            </Card>

            {/* Bulk Actions Bar */}
            {selectedUsers.length > 0 && (
                <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-100 rounded-xl">
                    <div className="flex items-center gap-3">
                        <CheckSquare className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">
                            {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''} selected
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedUsers([])}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="danger"
                            size="sm"
                            onClick={handleBulkDelete}
                            className="gap-1.5"
                        >
                            <Trash2 className="w-4 h-4" />
                            Delete Selected
                        </Button>
                    </div>
                </div>
            )}

            {/* Table */}
            {users.length === 0 && !isLoading ? (
                <Card className="border-0 shadow-sm">
                    <div className="flex flex-col items-center justify-center py-16">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <Users className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">No users found</h3>
                        <p className="text-gray-500 mb-6">
                            {hasActiveFilters
                                ? "Try adjusting your filters"
                                : "Get started by creating your first user"}
                        </p>
                        {hasActiveFilters ? (
                            <Button variant="outline" onClick={clearFilters}>
                                Clear Filters
                            </Button>
                        ) : (
                            <Button onClick={() => navigate(`${ROUTES.ADMIN_USERS}/create`)}>
                                <UserPlus className="w-4 h-4 mr-2" />
                                Add User
                            </Button>
                        )}
                    </div>
                </Card>
            ) : (
                <Card className="border-0 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-gray-50/80 border-b border-gray-100">
                                <tr>
                                    <th className="px-4 py-3 text-left w-12">
                                        <button
                                            onClick={handleSelectAll}
                                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                                        >
                                            {selectedUsers.length === users.length && users.length > 0 ? (
                                                <CheckSquare className="w-4 h-4 text-blue-600" />
                                            ) : (
                                                <Square className="w-4 h-4 text-gray-400" />
                                            )}
                                        </button>
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Created</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-12 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
                                                <p className="text-sm text-gray-500">Loading users...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((row) => {
                                        const roleStyle = getRoleStyle(row.Role)
                                        const RoleIcon = roleStyle.icon

                                        return (
                                            <tr
                                                key={row.Id}
                                                onClick={() => handleViewUser(row)}
                                                className={cn(
                                                    "hover:bg-gray-50/80 cursor-pointer transition-colors",
                                                    selectedUsers.includes(row.Id) && "bg-blue-50/50"
                                                )}
                                            >
                                                <td className="px-4 py-3">
                                                    <button
                                                        onClick={(e) => handleSelectUser(row.Id, e)}
                                                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                                                    >
                                                        {selectedUsers.includes(row.Id) ? (
                                                            <CheckSquare className="w-4 h-4 text-blue-600" />
                                                        ) : (
                                                            <Square className="w-4 h-4 text-gray-400" />
                                                        )}
                                                    </button>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className={cn(
                                                            "w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center shadow-sm overflow-hidden",
                                                            getRoleColor(row.Role)
                                                        )}>
                                                            {row.ProfileImagePath ? (
                                                                <img
                                                                    src={`${API_URL}${row.ProfileImagePath}`}
                                                                    alt={row.FullName}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <span className="text-sm font-semibold text-white">
                                                                    {row.FullName?.charAt(0)?.toUpperCase() || 'U'}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-900">{row.FullName}</p>
                                                            <p className="text-sm text-gray-500">{row.PersonalEmail}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Badge variant={roleStyle.variant} icon={RoleIcon}>
                                                        {row.Role}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <button
                                                        onClick={(e) => handleToggleStatus(row, e)}
                                                        disabled={toggleStatusMutation.isPending}
                                                        className={cn(
                                                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all",
                                                            "hover:ring-2 hover:ring-offset-1",
                                                            row.IsActive
                                                                ? "bg-emerald-50 text-emerald-700 hover:ring-emerald-300"
                                                                : "bg-red-50 text-red-700 hover:ring-red-300"
                                                        )}
                                                    >
                                                        <span className={cn(
                                                            "w-1.5 h-1.5 rounded-full",
                                                            row.IsActive ? "bg-emerald-500 animate-pulse" : "bg-red-500"
                                                        )} />
                                                        {row.IsActive ? 'Active' : 'Inactive'}
                                                    </button>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="text-sm">
                                                        <p className="text-gray-900">{formatDate(row.CreatedAt)}</p>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="xs"
                                                            className="hover:bg-gray-100"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                handleViewUser(row)
                                                            }}
                                                            title="View Details"
                                                        >
                                                            <Eye className="w-4 h-4 text-gray-500" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="xs"
                                                            className="hover:bg-blue-50"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                navigate(`${ROUTES.ADMIN_USERS}/${row.Id}/edit`)
                                                            }}
                                                            title="Edit User"
                                                        >
                                                            <Edit className="w-4 h-4 text-blue-600" />
                                                        </Button>
                                                        <Menu as="div" className="relative">
                                                            <Menu.Button
                                                                as={Button}
                                                                variant="ghost"
                                                                size="xs"
                                                                className="hover:bg-gray-100"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                <MoreVertical className="w-4 h-4 text-gray-500" />
                                                            </Menu.Button>
                                                            <Transition
                                                                as={Fragment}
                                                                enter="transition ease-out duration-100"
                                                                enterFrom="transform opacity-0 scale-95"
                                                                enterTo="transform opacity-100 scale-100"
                                                                leave="transition ease-in duration-75"
                                                                leaveFrom="transform opacity-100 scale-100"
                                                                leaveTo="transform opacity-0 scale-95"
                                                            >
                                                                <Menu.Items className="absolute right-0 z-10 mt-1 w-48 origin-top-right rounded-xl bg-white shadow-lg ring-1 ring-black/5 focus:outline-none divide-y divide-gray-100">
                                                                    <div className="p-1">
                                                                        <Menu.Item>
                                                                            {({ active }) => (
                                                                                <button
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation()
                                                                                        handleChangePassword(row)
                                                                                    }}
                                                                                    className={cn(
                                                                                        "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm",
                                                                                        active ? "bg-gray-50" : ""
                                                                                    )}
                                                                                >
                                                                                    <Key className="w-4 h-4 text-indigo-500" />
                                                                                    <span>Change Password</span>
                                                                                </button>
                                                                            )}
                                                                        </Menu.Item>
                                                                        <Menu.Item>
                                                                            {({ active }) => (
                                                                                <button
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation()
                                                                                        handleToggleStatus(row, e)
                                                                                    }}
                                                                                    className={cn(
                                                                                        "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm",
                                                                                        active ? "bg-gray-50" : ""
                                                                                    )}
                                                                                >
                                                                                    {row.IsActive ? (
                                                                                        <>
                                                                                            <UserX className="w-4 h-4 text-amber-500" />
                                                                                            <span>Deactivate</span>
                                                                                        </>
                                                                                    ) : (
                                                                                        <>
                                                                                            <UserCheck className="w-4 h-4 text-emerald-500" />
                                                                                            <span>Activate</span>
                                                                                        </>
                                                                                    )}
                                                                                </button>
                                                                            )}
                                                                        </Menu.Item>
                                                                    </div>
                                                                    <div className="p-1">
                                                                        <Menu.Item>
                                                                            {({ active }) => (
                                                                                <button
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation()
                                                                                        deleteModal.open(row)
                                                                                    }}
                                                                                    className={cn(
                                                                                        "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600",
                                                                                        active ? "bg-red-50" : ""
                                                                                    )}
                                                                                >
                                                                                    <Trash2 className="w-4 h-4" />
                                                                                    <span>Delete</span>
                                                                                </button>
                                                                            )}
                                                                        </Menu.Item>
                                                                    </div>
                                                                </Menu.Items>
                                                            </Transition>
                                                        </Menu>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                    {totalPages > 0 && (
                        <div className="border-t border-gray-100">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                totalItems={totalItems}
                                pageSize={pageSize}
                                onPageChange={handlePageChange}
                                onPageSizeChange={handlePageSizeChange}
                            />
                        </div>
                    )}
                </Card>
            )}

            {/* User Detail Modal */}
            <UserDetailModal
                isOpen={isViewModalOpen}
                onClose={handleCloseViewModal}
                userId={viewUserId}
                onChangePassword={handleChangePassword}
            />

            {/* Change Password Modal */}
            <ChangePasswordModal
                isOpen={isPasswordModalOpen}
                onClose={handleClosePasswordModal}
                userId={passwordModalUser?.Id}
                userName={passwordModalUser?.FullName}
            />

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={deleteModal.isOpen}
                onClose={deleteModal.close}
                onConfirm={handleDelete}
                title="Delete User"
                message={`Are you sure you want to delete "${deleteModal.data?.FullName}"? This action cannot be undone.`}
                confirmText="Delete"
                loading={deleteMutation.isPending}
            />
        </div>
    )
}

export default UsersPage
