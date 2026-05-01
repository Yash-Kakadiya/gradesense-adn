import { Fragment, useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Menu, Transition, Dialog } from '@headlessui/react'
import { useAuth } from '@/context/AuthContext'
import { cn, getInitials } from '@/utils/helpers'
import { ROUTES, ROLES, API_URL } from '@/utils/constants'
import {
    Menu as MenuIcon,
    Bell,
    User,
    LogOut,
    Settings,
    ChevronDown,
    Search,
    HelpCircle,
    Command,
    RefreshCw,
    Home,
    ChevronRight,
    Shield,
    Briefcase,
    GraduationCap,
    Clock,
    Check,
    X,
    Mail,
    Phone,
    Building,
    Calendar,
    UserCheck,
    UserX,
    Hash,
} from 'lucide-react'
import Avatar from '@/components/common/Avatar'
import Badge from '@/components/common/Badge'

const Navbar = ({ onMenuClick }) => {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [searchFocused, setSearchFocused] = useState(false)
    const [currentTime, setCurrentTime] = useState(new Date())
    const [hasNotifications, setHasNotifications] = useState(true)
    const [showProfileModal, setShowProfileModal] = useState(false)

    // Update time every minute
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000)
        return () => clearInterval(timer)
    }, [])

    const handleLogout = async () => {
        await logout()
        navigate(ROUTES.LOGIN)
    }

    const getRoleConfig = (role) => {
        switch (role) {
            case 'Admin':
                return {
                    variant: 'danger',
                    gradient: 'from-rose-500 to-pink-600',
                    bgLight: 'bg-rose-50',
                    text: 'text-rose-600',
                    icon: Shield,
                }
            case 'Faculty':
                return {
                    variant: 'info',
                    gradient: 'from-blue-500 to-indigo-600',
                    bgLight: 'bg-blue-50',
                    text: 'text-blue-600',
                    icon: Briefcase,
                }
            case 'Student':
                return {
                    variant: 'success',
                    gradient: 'from-emerald-500 to-teal-600',
                    bgLight: 'bg-emerald-50',
                    text: 'text-emerald-600',
                    icon: GraduationCap,
                }
            default:
                return {
                    variant: 'default',
                    gradient: 'from-gray-500 to-gray-600',
                    bgLight: 'bg-gray-50',
                    text: 'text-gray-600',
                    icon: User,
                }
        }
    }

    const roleConfig = getRoleConfig(user?.role)
    const RoleIcon = roleConfig.icon

    // Build breadcrumb from route
    const getBreadcrumb = () => {
        const path = location.pathname
        const segments = path.split('/').filter(Boolean)

        const breadcrumb = []

        // Get role dashboard path
        let dashboardPath = '/'
        if (segments[0] === 'admin') {
            dashboardPath = ROUTES.ADMIN_DASHBOARD
        } else if (segments[0] === 'faculty') {
            dashboardPath = ROUTES.FACULTY_DASHBOARD
        } else if (segments[0] === 'student') {
            dashboardPath = ROUTES.STUDENT_DASHBOARD
        }

        // Only add dashboard breadcrumb if we're not already on dashboard
        const isOnDashboard = path === dashboardPath || segments[1] === 'dashboard'

        if (segments[0] === 'admin') {
            breadcrumb.push({ label: 'Admin', path: ROUTES.ADMIN_DASHBOARD })
        } else if (segments[0] === 'faculty') {
            breadcrumb.push({ label: 'Faculty', path: ROUTES.FACULTY_DASHBOARD })
        } else if (segments[0] === 'student') {
            breadcrumb.push({ label: 'Student', path: ROUTES.STUDENT_DASHBOARD })
        }

        // Add current page only if not on dashboard
        if (segments.length > 1 && segments[1] !== 'dashboard') {
            const pageName = segments[1].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
            breadcrumb.push({ label: pageName, path: path })
        }

        return breadcrumb
    }

    const breadcrumb = getBreadcrumb()

    // Format time
    const formatTime = (date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        })
    }

    // Mock notifications
    const notifications = [
        { id: 1, title: 'New student enrolled', time: '5 min ago', read: false },
        { id: 2, title: 'Report generated', time: '1 hour ago', read: false },
        { id: 3, title: 'System backup completed', time: '2 hours ago', read: true },
    ]

    return (
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-200/50">
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-white via-gray-50/50 to-white pointer-events-none" />

            <div className="relative flex items-center justify-between h-16 px-4 md:px-6">
                {/* Left side - Menu button & Breadcrumb */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={onMenuClick}
                        className="lg:hidden p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200 active:scale-95"
                    >
                        <MenuIcon className="w-5 h-5" />
                    </button>

                    {/* Breadcrumb */}
                    <div className="hidden sm:flex items-center gap-2">
                        <button
                            onClick={() => navigate(breadcrumb[0]?.path || '/')}
                            className={cn(
                                'p-1.5 rounded-lg transition-all duration-200',
                                roleConfig.bgLight,
                                'hover:scale-105'
                            )}
                        >
                            <Home className={cn('w-4 h-4', roleConfig.text)} />
                        </button>
                        {breadcrumb.map((item, index) => (
                            <Fragment key={item.path}>
                                <ChevronRight className="w-4 h-4 text-gray-300" />
                                <span
                                    className={cn(
                                        'text-sm font-medium transition-colors',
                                        index === breadcrumb.length - 1
                                            ? 'text-gray-900'
                                            : 'text-gray-500 hover:text-gray-700 cursor-pointer'
                                    )}
                                    onClick={() => index < breadcrumb.length - 1 && navigate(item.path)}
                                >
                                    {item.label}
                                </span>
                            </Fragment>
                        ))}
                    </div>
                </div>

                {/* Center - Search */}
                <div className="hidden md:flex flex-1 max-w-lg mx-8">
                    <div className={cn(
                        'relative w-full transition-all duration-300',
                        searchFocused ? 'scale-[1.02]' : 'scale-100'
                    )}>
                        <Search className={cn(
                            'absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors',
                            searchFocused ? 'text-blue-500' : 'text-gray-400'
                        )} />
                        <input
                            type="text"
                            placeholder="Search anything..."
                            className={cn(
                                'w-full pl-11 pr-20 py-2.5 text-sm bg-gray-100/80 rounded-xl',
                                'border-2 border-transparent',
                                'focus:bg-white focus:border-blue-500/30 focus:shadow-lg focus:shadow-blue-500/10',
                                'transition-all duration-300 placeholder:text-gray-400'
                            )}
                            onFocus={() => setSearchFocused(true)}
                            onBlur={() => setSearchFocused(false)}
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                            <kbd className="hidden lg:inline-flex items-center gap-1 px-2 py-1 text-[10px] font-semibold text-gray-400 bg-white border border-gray-200 rounded-md shadow-sm">
                                <Command className="w-3 h-3" />
                                K
                            </kbd>
                        </div>
                    </div>
                </div>

                {/* Right side */}
                <div className="flex items-center gap-2 md:gap-3">
                    {/* Time display - hidden on mobile */}
                    <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 bg-gray-100/80 rounded-lg">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-600">{formatTime(currentTime)}</span>
                    </div>

                    {/* Help Button */}
                    {/* <button className="hidden md:flex p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:scale-105">
                        <HelpCircle className="w-5 h-5" />
                    </button> */}

                    {/* Notifications */}
                    <Menu as="div" className="relative">
                        <Menu.Button className="relative p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200 group hover:scale-105">
                            <Bell className="w-5 h-5 group-hover:animate-wiggle" />
                            {hasNotifications && (
                                <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border-2 border-white" />
                                </span>
                            )}
                        </Menu.Button>

                        <Transition
                            as={Fragment}
                            enter="transition ease-out duration-200"
                            enterFrom="transform opacity-0 scale-95 translate-y-1"
                            enterTo="transform opacity-100 scale-100 translate-y-0"
                            leave="transition ease-in duration-150"
                            leaveFrom="transform opacity-100 scale-100 translate-y-0"
                            leaveTo="transform opacity-0 scale-95 translate-y-1"
                        >
                            <Menu.Items className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-200/80 overflow-hidden focus:outline-none">
                                <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-semibold text-gray-900">Notifications</span>
                                        <button className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                                            <Check className="w-3 h-3" />
                                            Mark all read
                                        </button>
                                    </div>
                                </div>
                                <div className="max-h-72 overflow-y-auto">
                                    {notifications.map((notif) => (
                                        <Menu.Item key={notif.id}>
                                            {({ active }) => (
                                                <button
                                                    className={cn(
                                                        'w-full flex items-start gap-3 px-4 py-3 text-left transition-colors',
                                                        active && 'bg-gray-50',
                                                        !notif.read && 'bg-blue-50/50'
                                                    )}
                                                >
                                                    <div className={cn(
                                                        'w-2 h-2 mt-1.5 rounded-full flex-shrink-0',
                                                        notif.read ? 'bg-gray-300' : 'bg-blue-500'
                                                    )} />
                                                    <div className="flex-1 min-w-0">
                                                        <p className={cn(
                                                            'text-sm truncate',
                                                            notif.read ? 'text-gray-600' : 'text-gray-900 font-medium'
                                                        )}>
                                                            {notif.title}
                                                        </p>
                                                        <p className="text-xs text-gray-400 mt-0.5">{notif.time}</p>
                                                    </div>
                                                </button>
                                            )}
                                        </Menu.Item>
                                    ))}
                                </div>
                                <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
                                    <button className="w-full text-center text-xs text-blue-600 hover:text-blue-700 font-medium py-1">
                                        View all notifications
                                    </button>
                                </div>
                            </Menu.Items>
                        </Transition>
                    </Menu>

                    {/* Divider */}
                    <div className="hidden md:block w-px h-8 bg-gradient-to-b from-transparent via-gray-200 to-transparent" />

                    {/* User menu */}
                    <Menu as="div" className="relative">
                        <Menu.Button className="flex items-center gap-2 md:gap-3 p-1.5 md:pr-3 hover:bg-gray-100 rounded-xl transition-all duration-200 group">
                            <div className={cn('p-0.5 rounded-full bg-gradient-to-br shadow-md', roleConfig.gradient)}>
                                <div className="w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-white flex items-center justify-center">
                                    {user?.profileImagePath ? (
                                        <img
                                            src={`${API_URL}${user.profileImagePath}`}
                                            alt={user?.fullName}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className={cn('text-sm font-semibold', roleConfig.text)}>
                                            {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="hidden md:block text-left">
                                <p className="text-sm font-semibold text-gray-900 max-w-[120px] truncate">
                                    {user?.fullName || user?.email}
                                </p>
                                <div className="flex items-center gap-1.5">
                                    <RoleIcon className={cn('w-3 h-3', roleConfig.text)} />
                                    <span className={cn('text-xs font-medium', roleConfig.text)}>
                                        {user?.role}
                                    </span>
                                </div>
                            </div>
                            <ChevronDown className="w-4 h-4 text-gray-400 hidden md:block group-hover:text-gray-600 transition-transform group-hover:translate-y-0.5" />
                        </Menu.Button>

                        <Transition
                            as={Fragment}
                            enter="transition ease-out duration-200"
                            enterFrom="transform opacity-0 scale-95 translate-y-1"
                            enterTo="transform opacity-100 scale-100 translate-y-0"
                            leave="transition ease-in duration-150"
                            leaveFrom="transform opacity-100 scale-100 translate-y-0"
                            leaveTo="transform opacity-0 scale-95 translate-y-1"
                        >
                            <Menu.Items className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-200/80 py-2 focus:outline-none overflow-hidden">
                                {/* User Info Header */}
                                <div className={cn('px-4 py-4 bg-gradient-to-br border-b border-gray-100', roleConfig.bgLight)}>
                                    <div className="flex items-center gap-3">
                                        <div className={cn('p-0.5 rounded-full bg-gradient-to-br shadow-lg', roleConfig.gradient)}>
                                            <div className="w-12 h-12 rounded-full border-2 border-white overflow-hidden bg-white flex items-center justify-center">
                                                {user?.profileImagePath ? (
                                                    <img
                                                        src={`${API_URL}${user.profileImagePath}`}
                                                        alt={user?.fullName}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <span className={cn('text-lg font-bold', roleConfig.text)}>
                                                        {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-base font-bold text-gray-900 truncate">
                                                {user?.fullName || 'User'}
                                            </p>
                                            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                                            <div className="flex items-center gap-1.5 mt-1">
                                                <div className={cn('px-2 py-0.5 rounded-full text-[10px] font-semibold', roleConfig.bgLight, roleConfig.text)}>
                                                    <div className="flex items-center gap-1">
                                                        <RoleIcon className="w-3 h-3" />
                                                        {user?.role}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Menu Items */}
                                <div className="py-2">
                                    <Menu.Item>
                                        {({ active }) => (
                                            <button
                                                onClick={() => {
                                                    // Navigate to profile page based on role
                                                    if (user?.role === ROLES.ADMIN) {
                                                        navigate(ROUTES.ADMIN_PROFILE)
                                                    } else if (user?.role === ROLES.STUDENT) {
                                                        navigate(ROUTES.STUDENT_PROFILE)
                                                    } else if (user?.role === ROLES.FACULTY) {
                                                        navigate(ROUTES.FACULTY_PROFILE)
                                                    } else {
                                                        // Fallback to modal for unknown roles
                                                        setShowProfileModal(true)
                                                    }
                                                }}
                                                className={cn(
                                                    'flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 transition-colors',
                                                    active && 'bg-gray-50'
                                                )}
                                            >
                                                <span className="p-2 rounded-xl bg-gray-100 group-hover:bg-gray-200">
                                                    <User className="w-4 h-4 text-gray-600" />
                                                </span>
                                                <div className="text-left">
                                                    <span className="block font-medium">My Profile</span>
                                                    <span className="block text-xs text-gray-400">View & edit your profile</span>
                                                </div>
                                            </button>
                                        )}
                                    </Menu.Item>

                                    <Menu.Item>
                                        {({ active }) => (
                                            <button
                                                onClick={() => navigate(ROUTES.ADMIN_SETTINGS)}
                                                className={cn(
                                                    'flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 transition-colors',
                                                    active && 'bg-gray-50'
                                                )}
                                            >
                                                <span className="p-2 rounded-xl bg-gray-100">
                                                    <Settings className="w-4 h-4 text-gray-600" />
                                                </span>
                                                <div className="text-left">
                                                    <span className="block font-medium">Settings</span>
                                                    <span className="block text-xs text-gray-400">System settings</span>
                                                </div>
                                            </button>
                                        )}
                                    </Menu.Item>
                                </div>

                                {/* Logout */}
                                <div className="border-t border-gray-100 pt-2 px-2">
                                    <Menu.Item>
                                        {({ active }) => (
                                            <button
                                                onClick={handleLogout}
                                                className={cn(
                                                    'flex items-center gap-3 w-full px-3 py-2.5 text-sm text-red-600 rounded-xl transition-colors',
                                                    active && 'bg-red-50'
                                                )}
                                            >
                                                <span className="p-2 rounded-xl bg-red-100">
                                                    <LogOut className="w-4 h-4 text-red-600" />
                                                </span>
                                                <span className="font-medium">Sign out</span>
                                            </button>
                                        )}
                                    </Menu.Item>
                                </div>
                            </Menu.Items>
                        </Transition>
                    </Menu>
                </div>
            </div>

            {/* Profile Modal */}
            <ProfileModal
                isOpen={showProfileModal}
                onClose={() => setShowProfileModal(false)}
                user={user}
                roleConfig={roleConfig}
                RoleIcon={RoleIcon}
            />
        </header>
    )
}

// Profile Modal Component
const ProfileModal = ({ isOpen, onClose, user, roleConfig, RoleIcon }) => {
    const formatDate = (date) => {
        if (!date) return 'N/A'
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        })
    }

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
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
                                {/* Header with gradient */}
                                <div className={cn('relative bg-gradient-to-br px-6 py-6', roleConfig.gradient)}>
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="absolute top-4 right-4 p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors z-10"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>

                                    {/* Decorative circles */}
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

                                    <div className="relative flex flex-col items-center">
                                        <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur flex items-center justify-center mb-4 ring-4 ring-white/30 overflow-hidden">
                                            {user?.profileImagePath ? (
                                                <img
                                                    src={`${API_URL}${user.profileImagePath}`}
                                                    alt={user?.fullName}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <span className="text-4xl font-bold text-white">
                                                    {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                                                </span>
                                            )}
                                        </div>
                                        <Dialog.Title className="text-xl font-bold text-white">
                                            {user?.fullName || 'User'}
                                        </Dialog.Title>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-sm font-medium">
                                                <RoleIcon className="w-4 h-4" />
                                                {user?.role}
                                            </span>
                                            <span className={cn(
                                                "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium",
                                                user?.isActive ? "bg-emerald-500/80 text-white" : "bg-red-500/80 text-white"
                                            )}>
                                                {user?.isActive ? (
                                                    <><UserCheck className="w-4 h-4" /> Active</>
                                                ) : (
                                                    <><UserX className="w-4 h-4" /> Inactive</>
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-5 space-y-4">
                                    {/* Contact Information */}
                                    <div>
                                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Contact Information</h3>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                <div className="p-2 bg-blue-100 rounded-lg">
                                                    <Mail className="w-4 h-4 text-blue-600" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs text-gray-500">Personal Email</p>
                                                    <p className="font-medium text-gray-900 text-sm truncate">{user?.personalEmail || user?.email || 'N/A'}</p>
                                                </div>
                                            </div>
                                            {user?.institutionalEmail && (
                                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                    <div className="p-2 bg-indigo-100 rounded-lg">
                                                        <Building className="w-4 h-4 text-indigo-600" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs text-gray-500">Institutional Email</p>
                                                        <p className="font-medium text-gray-900 text-sm truncate">{user.institutionalEmail}</p>
                                                    </div>
                                                </div>
                                            )}
                                            {user?.phoneNumber && (
                                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                    <div className="p-2 bg-green-100 rounded-lg">
                                                        <Phone className="w-4 h-4 text-green-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500">Phone Number</p>
                                                        <p className="font-medium text-gray-900 text-sm">{user.phoneNumber}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Account Information */}
                                    <div>
                                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Account Information</h3>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="p-3 bg-gray-50 rounded-xl">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Hash className="w-3.5 h-3.5 text-gray-400" />
                                                    <p className="text-xs text-gray-500">User ID</p>
                                                </div>
                                                <p className="font-medium text-gray-900 text-sm">#{user?.id || 'N/A'}</p>
                                            </div>
                                            <div className="p-3 bg-gray-50 rounded-xl">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                                    <p className="text-xs text-gray-500">Member Since</p>
                                                </div>
                                                <p className="font-medium text-gray-900 text-sm">{formatDate(user?.createdAt)}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}

export default Navbar
