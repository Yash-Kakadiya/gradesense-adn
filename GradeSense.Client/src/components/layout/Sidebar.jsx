import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { ROUTES, ROLES } from '@/utils/constants'
import { cn } from '@/utils/helpers'
import {
    X,
    LayoutDashboard,
    Users,
    Building2,
    GraduationCap,
    BookOpen,
    Calendar,
    ClipboardList,
    FileText,
    BarChart3,
    TrendingUp,
    UserCog,
    Layers,
    School,
    ClipboardCheck,
    History,
    ChevronDown,
    Shield,
    Briefcase,
    User,
    UserPlus,
    Circle,
    Zap,
    PanelLeftClose,
    PanelLeft,
    AlertTriangle,
    Target,
} from 'lucide-react'

// Navigation configuration by role with sections
const navigationConfig = {
    [ROLES.ADMIN]: {
        title: 'Administration',
        icon: Shield,
        color: 'rose',
        sections: [
            {
                title: 'Overview',
                items: [
                    { to: ROUTES.ADMIN_DASHBOARD, icon: LayoutDashboard, label: 'Dashboard' },
                ]
            },
            {
                title: 'Analytics',
                items: [
                    { to: ROUTES.ADMIN_ANALYTICS, icon: BarChart3, label: 'Enhanced Analytics' },
                ]
            },
            {
                title: 'User Management',
                items: [
                    { to: ROUTES.ADMIN_USERS, icon: Users, label: 'Users' },
                    { to: ROUTES.ADMIN_FACULTIES, icon: UserCog, label: 'Faculties' },
                    { to: ROUTES.ADMIN_STUDENTS, icon: GraduationCap, label: 'Students' },
                ]
            },
            {
                title: 'Academic Setup',
                items: [
                    { to: ROUTES.ADMIN_DEPARTMENTS, icon: Building2, label: 'Departments' },
                    { to: ROUTES.ADMIN_BATCHES, icon: Layers, label: 'Batches' },
                    { to: ROUTES.ADMIN_SUBJECTS, icon: BookOpen, label: 'Subjects' },
                ]
            },
            {
                title: 'Courses & Evaluation',
                items: [
                    { to: ROUTES.ADMIN_COURSE_OFFERINGS, icon: School, label: 'Course Offerings' },
                    { to: ROUTES.ADMIN_EVALUATION_SCHEMES, icon: ClipboardList, label: 'Evaluation Schemes' },
                ]
            },
            {
                title: 'System',
                items: [
                    { to: ROUTES.ADMIN_AUDIT_LOGS, icon: History, label: 'Audit Logs' },
                ]
            },
        ]
    },
    [ROLES.FACULTY]: {
        title: 'Faculty Portal',
        icon: Briefcase,
        color: 'blue',
        sections: [
            {
                title: 'Overview',
                items: [
                    { to: ROUTES.FACULTY_DASHBOARD, icon: LayoutDashboard, label: 'Dashboard' },
                ]
            },
            {
                title: 'Teaching',
                items: [
                    { to: ROUTES.FACULTY_COURSES, icon: BookOpen, label: 'My Courses' },
                    { to: ROUTES.FACULTY_STUDENTS, icon: GraduationCap, label: 'My Students' },
                    { to: ROUTES.FACULTY_ALL_STUDENTS, icon: Users, label: 'All Students' },
                    { to: ROUTES.FACULTY_ENROLLMENTS, icon: UserPlus, label: 'Enrollments' },
                    { to: ROUTES.FACULTY_SUBJECT_UNITS, icon: Layers, label: 'Subject Units' },
                ]
            },
            {
                title: 'Grading',
                items: [
                    { to: ROUTES.FACULTY_ASSESSMENTS, icon: ClipboardList, label: 'Assessments' },
                    { to: ROUTES.FACULTY_GRADES, icon: ClipboardCheck, label: 'Grade Entry' },
                ]
            },
            {
                title: 'Attendance',
                items: [
                    { to: ROUTES.FACULTY_ATTENDANCE, icon: Calendar, label: 'Mark Attendance' },
                ]
            },
            {
                title: 'Analytics',
                items: [
                    { to: ROUTES.FACULTY_ANALYTICS, icon: TrendingUp, label: 'Enhanced Analytics' },
                    { to: ROUTES.FACULTY_AT_RISK, icon: AlertTriangle, label: 'At-Risk Students' },
                    { to: ROUTES.FACULTY_REPORTS, icon: BarChart3, label: 'Reports' },
                ]
            },
        ]
    },
    [ROLES.STUDENT]: {
        title: 'Student Portal',
        icon: User,
        color: 'emerald',
        sections: [
            {
                title: 'Overview',
                items: [
                    { to: ROUTES.STUDENT_DASHBOARD, icon: LayoutDashboard, label: 'Dashboard' },
                ]
            },
            {
                title: 'Academics',
                items: [
                    { to: ROUTES.STUDENT_COURSES, icon: BookOpen, label: 'My Courses' },
                    { to: ROUTES.STUDENT_GRADES, icon: FileText, label: 'My Grades' },
                    { to: ROUTES.STUDENT_ATTENDANCE, icon: Calendar, label: 'My Attendance' },
                    { to: ROUTES.STUDENT_FACULTIES, icon: Users, label: 'Faculties' },
                ]
            },
            {
                title: 'Account',
                items: [
                    { to: ROUTES.STUDENT_PROFILE, icon: User, label: 'Profile' },
                ]
            },
        ]
    },
}

// Role-specific color themes - Enhanced with more properties
const roleColorMap = {
    rose: {
        bg: 'bg-rose-600',
        bgLight: 'bg-rose-50',
        bgLighter: 'bg-rose-50/50',
        text: 'text-rose-600',
        textDark: 'text-rose-700',
        border: 'border-rose-200',
        borderLight: 'border-rose-100',
        hover: 'hover:bg-rose-50',
        active: 'bg-gradient-to-r from-rose-50 to-rose-100/80 text-rose-700 border-l-rose-500',
        gradient: 'from-rose-500 via-rose-600 to-pink-600',
        gradientLight: 'from-rose-100 to-pink-100',
        ring: 'ring-rose-500/20',
        shadow: 'shadow-rose-500/25',
        glow: 'shadow-[0_0_20px_rgba(244,63,94,0.15)]',
    },
    blue: {
        bg: 'bg-blue-600',
        bgLight: 'bg-blue-50',
        bgLighter: 'bg-blue-50/50',
        text: 'text-blue-600',
        textDark: 'text-blue-700',
        border: 'border-blue-200',
        borderLight: 'border-blue-100',
        hover: 'hover:bg-blue-50',
        active: 'bg-gradient-to-r from-blue-50 to-blue-100/80 text-blue-700 border-l-blue-500',
        gradient: 'from-blue-500 via-blue-600 to-indigo-600',
        gradientLight: 'from-blue-100 to-indigo-100',
        ring: 'ring-blue-500/20',
        shadow: 'shadow-blue-500/25',
        glow: 'shadow-[0_0_20px_rgba(59,130,246,0.15)]',
    },
    emerald: {
        bg: 'bg-emerald-600',
        bgLight: 'bg-emerald-50',
        bgLighter: 'bg-emerald-50/50',
        text: 'text-emerald-600',
        textDark: 'text-emerald-700',
        border: 'border-emerald-200',
        borderLight: 'border-emerald-100',
        hover: 'hover:bg-emerald-50',
        active: 'bg-gradient-to-r from-emerald-50 to-emerald-100/80 text-emerald-700 border-l-emerald-500',
        gradient: 'from-emerald-500 via-emerald-600 to-teal-600',
        gradientLight: 'from-emerald-100 to-teal-100',
        ring: 'ring-emerald-500/20',
        shadow: 'shadow-emerald-500/25',
        glow: 'shadow-[0_0_20px_rgba(16,185,129,0.15)]',
    },
}

// Enhanced Collapsible navigation section component
const NavSection = ({ title, items, colorTheme, isOpen, onToggle, closeSidebar, isCollapsed }) => {
    const location = useLocation()
    const colors = roleColorMap[colorTheme] || roleColorMap.blue

    if (isCollapsed) {
        return (
            <div className="py-1 space-y-1">
                {items.map((item) => {
                    const Icon = item.icon
                    const isActive = location.pathname === item.to ||
                        (item.to !== '/' && location.pathname.startsWith(item.to))

                    return (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            onClick={closeSidebar}
                            title={item.label}
                            className={cn(
                                'group relative flex items-center justify-center w-10 h-10 mx-auto rounded-xl transition-all duration-200',
                                isActive
                                    ? `bg-gradient-to-br ${colors.gradient} text-white shadow-lg ${colors.shadow}`
                                    : `text-gray-500 hover:text-gray-700 hover:bg-gray-100`
                            )}
                        >
                            <Icon className="w-5 h-5" />
                            {/* Tooltip */}
                            <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-xl">
                                {item.label}
                                <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
                            </div>
                        </NavLink>
                    )
                })}
            </div>
        )
    }

    return (
        <div className="mb-2">
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between px-4 py-2.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider hover:text-gray-600 transition-colors group"
            >
                <span className="flex items-center gap-2">
                    <div className={cn('w-1.5 h-1.5 rounded-full', colors.bg, 'opacity-60')} />
                    {title}
                </span>
                <ChevronDown
                    className={cn(
                        'w-3.5 h-3.5 transition-transform duration-300 group-hover:text-gray-500',
                        isOpen ? 'rotate-0' : '-rotate-90'
                    )}
                />
            </button>
            <div
                className={cn(
                    'space-y-1 overflow-hidden transition-all duration-300 ease-out',
                    isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                )}
            >
                {items.map((item, idx) => {
                    const Icon = item.icon
                    const isActive = location.pathname === item.to ||
                        (item.to !== '/' && location.pathname.startsWith(item.to))

                    return (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            onClick={closeSidebar}
                            style={{ animationDelay: `${idx * 50}ms` }}
                            className={cn(
                                'group flex items-center gap-3 px-4 py-2.5 mx-2 text-sm font-medium rounded-xl transition-all duration-200 border-l-[3px]',
                                isOpen && 'animate-fadeIn',
                                isActive
                                    ? `${colors.active} shadow-sm ${colors.glow}`
                                    : `text-gray-600 border-l-transparent hover:bg-gray-50 hover:text-gray-900 hover:border-l-gray-300`
                            )}
                        >
                            <span
                                className={cn(
                                    'p-2 rounded-lg transition-all duration-200',
                                    isActive
                                        ? `bg-gradient-to-br ${colors.gradient} text-white shadow-md ${colors.shadow}`
                                        : 'bg-gray-100/80 group-hover:bg-gray-200/80 text-gray-500 group-hover:text-gray-700'
                                )}
                            >
                                <Icon className="w-4 h-4" />
                            </span>
                            <span className="flex-1">{item.label}</span>
                            {isActive && (
                                <span className={cn('w-2 h-2 rounded-full', colors.bg)} />
                            )}
                        </NavLink>
                    )
                })}
            </div>
        </div>
    )
}

const Sidebar = ({ isOpen, onClose }) => {
    const { user } = useAuth()
    const [expandedSections, setExpandedSections] = useState({})
    const [isCollapsed, setIsCollapsed] = useState(false)

    const config = navigationConfig[user?.role] || navigationConfig[ROLES.STUDENT]
    const colors = roleColorMap[config.color] || roleColorMap.blue
    const RoleIcon = config.icon

    // Toggle section expansion
    const toggleSection = (index) => {
        setExpandedSections(prev => ({
            ...prev,
            [index]: prev[index] === undefined ? false : !prev[index]
        }))
    }

    // Check if section is expanded (default: true)
    const isSectionExpanded = (index) => {
        return expandedSections[index] === undefined ? true : expandedSections[index]
    }

    return (
        <>
            {/* Mobile sidebar backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-gray-900/60 backdrop-blur-sm lg:hidden transition-opacity duration-300"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    'bg-white/95 backdrop-blur-xl border-r border-gray-200/80 flex-shrink-0',
                    'flex flex-col h-full',
                    // Mobile: fixed overlay
                    'fixed inset-y-0 left-0 z-50 shadow-2xl',
                    'transform transition-all duration-300 ease-out',
                    isOpen ? 'translate-x-0' : '-translate-x-full',
                    // Desktop: static in flex layout
                    'lg:relative lg:translate-x-0 lg:z-0 lg:shadow-none lg:h-screen',
                    // Collapsible width
                    isCollapsed ? 'w-20' : 'w-72'
                )}
            >
                {/* Gradient accent line */}
                <div className={cn('absolute inset-x-0 top-0 h-1 bg-gradient-to-r', colors.gradient)} />

                {/* Header */}
                <div className="relative border-b border-gray-100/80 bg-white/50">
                    <div className={cn(
                        'flex items-center h-16 px-4',
                        isCollapsed ? 'justify-center' : 'justify-between'
                    )}>
                        {!isCollapsed ? (
                            <>
                                <div className="flex items-center gap-3">
                                    {/* Logo */}
                                    <div className={cn(
                                        'relative p-2.5 rounded-xl bg-gradient-to-br shadow-lg',
                                        colors.gradient,
                                        colors.shadow
                                    )}>
                                        <GraduationCap className="w-6 h-6 text-white" />
                                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse" />
                                    </div>
                                    <div>
                                        <span className="text-xl font-bold bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent">
                                            GradeSense
                                        </span>
                                        <div className={cn(
                                            'flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider',
                                            colors.text
                                        )}>
                                            <RoleIcon className="w-3 h-3" />
                                            <span>{config.title}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    {/* Collapse button - desktop only */}
                                    <button
                                        onClick={() => setIsCollapsed(true)}
                                        className="hidden lg:flex p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
                                        title="Collapse sidebar"
                                    >
                                        <PanelLeftClose className="w-4 h-4" />
                                    </button>
                                    {/* Close button - mobile only */}
                                    <button
                                        onClick={onClose}
                                        className="lg:hidden p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className={cn(
                                    'p-2 rounded-xl bg-gradient-to-br shadow-lg',
                                    colors.gradient,
                                    colors.shadow
                                )}>
                                    <GraduationCap className="w-5 h-5 text-white" />
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Expand button when collapsed */}
                {isCollapsed && (
                    <div className="px-2 py-3 border-b border-gray-100">
                        <button
                            onClick={() => setIsCollapsed(false)}
                            className="w-full flex items-center justify-center p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
                            title="Expand sidebar"
                        >
                            <PanelLeft className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {/* User Info Card - Only when not collapsed */}
                {!isCollapsed && (
                    <div className="px-3 py-4">
                        <div className={cn(
                            'relative overflow-hidden p-4 rounded-2xl bg-gradient-to-br border',
                            colors.gradientLight,
                            colors.borderLight
                        )}>
                            {/* Decorative elements */}
                            <div className="absolute top-0 right-0 w-20 h-20 bg-white/30 rounded-full -translate-y-1/2 translate-x-1/2" />
                            <div className="absolute bottom-0 left-0 w-12 h-12 bg-white/20 rounded-full translate-y-1/2 -translate-x-1/2" />

                            <div className="relative flex items-center gap-3">
                                <div className={cn(
                                    'p-3 rounded-xl bg-gradient-to-br shadow-lg',
                                    colors.gradient,
                                    colors.shadow
                                )}>
                                    <RoleIcon className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-gray-900 truncate">
                                        {user?.fullName || user?.email}
                                    </p>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <Zap className={cn('w-3 h-3', colors.text)} />
                                        <span className={cn('text-xs font-semibold', colors.text)}>
                                            {user?.role} Account
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation Sections */}
                <nav className={cn(
                    'flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent',
                    isCollapsed ? 'py-4 px-2' : 'py-2'
                )}>
                    {config.sections.map((section, index) => (
                        <NavSection
                            key={section.title}
                            title={section.title}
                            items={section.items}
                            colorTheme={config.color}
                            isOpen={isSectionExpanded(index)}
                            onToggle={() => toggleSection(index)}
                            closeSidebar={onClose}
                            isCollapsed={isCollapsed}
                        />
                    ))}
                </nav>

                {/* Footer */}
                <div className={cn(
                    'border-t border-gray-100 bg-gradient-to-b from-transparent to-gray-50/50',
                    isCollapsed ? 'p-2' : 'p-4'
                )}>
                    {isCollapsed ? (
                        <div className="flex justify-center">
                            <div className={cn('w-2 h-2 rounded-full animate-pulse', colors.bg)} />
                        </div>
                    ) : (
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                <div className={cn('w-2 h-2 rounded-full animate-pulse', colors.bg)} />
                                <span className="font-medium">GradeSense</span>
                            </div>
                            <span className="text-[10px] font-medium text-gray-300 bg-gray-100 px-2 py-0.5 rounded-full">
                                v1.0.0
                            </span>
                        </div>
                    )}
                </div>
            </aside>
        </>
    )
}

export default Sidebar
