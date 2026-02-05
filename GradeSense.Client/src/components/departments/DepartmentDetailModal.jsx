import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
    X,
    Edit,
    Hash,
    Mail,
    Calendar,
    Clock,
    Building2,
    BookOpen,
    User,
    UserCheck,
    UserX,
    GraduationCap,
    RefreshCw,
    Users,
    Layers,
} from 'lucide-react'
import { departmentService } from '@/services/departmentService'
import { ROUTES } from '@/utils/constants'
import { cn } from '@/utils/helpers'

const DepartmentDetailModal = ({ isOpen, onClose, departmentId }) => {
    const navigate = useNavigate()

    // Fetch full department details when modal opens
    const { data: departmentData, isLoading } = useQuery({
        queryKey: ['department-detail', departmentId],
        queryFn: () => departmentService.getById(departmentId),
        enabled: isOpen && !!departmentId,
    })

    const department = departmentData?.Data

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
                            <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
                                {isLoading ? (
                                    <div className="flex items-center justify-center py-16">
                                        <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
                                    </div>
                                ) : department ? (
                                    <>
                                        {/* Header with gradient */}
                                        <div className="relative bg-gradient-to-br from-amber-500 to-orange-600 px-6 py-5">
                                            {/* Action buttons */}
                                            <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        handleClose()
                                                        navigate(`${ROUTES.ADMIN_DEPARTMENTS}/${department.Id}/edit`)
                                                    }}
                                                    className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors group"
                                                    title="Edit Department"
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
                                                <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur flex items-center justify-center mb-4 ring-4 ring-white/30">
                                                    <Building2 className="w-10 h-10 text-white" />
                                                </div>
                                                <Dialog.Title className="text-xl font-bold text-white">
                                                    {department.Name}
                                                </Dialog.Title>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-sm font-medium">
                                                        <Hash className="w-4 h-4" />
                                                        {department.Code}
                                                    </span>
                                                    <span className={cn(
                                                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium",
                                                        department.IsActive ? "bg-emerald-500/80 text-white" : "bg-red-500/80 text-white"
                                                    )}>
                                                        {department.IsActive ? (
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
                                            {/* Department Information */}
                                            <div>
                                                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Department Information</h3>
                                                <div className="grid grid-cols-3 gap-3">
                                                    {/* ID */}
                                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                        <div className="p-2 bg-purple-100 rounded-lg">
                                                            <Hash className="w-5 h-5 text-purple-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500">Department ID</p>
                                                            <p className="font-medium text-gray-900">#{department.Id}</p>
                                                        </div>
                                                    </div>

                                                    {/* Code */}
                                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                        <div className="p-2 bg-amber-100 rounded-lg">
                                                            <Building2 className="w-5 h-5 text-amber-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500">Code</p>
                                                            <p className="font-medium text-gray-900 font-mono">{department.Code || 'N/A'}</p>
                                                        </div>
                                                    </div>

                                                    {/* Status */}
                                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                        <div className={cn(
                                                            "p-2 rounded-lg",
                                                            department.IsActive ? "bg-emerald-100" : "bg-red-100"
                                                        )}>
                                                            {department.IsActive ? (
                                                                <UserCheck className="w-5 h-5 text-emerald-600" />
                                                            ) : (
                                                                <UserX className="w-5 h-5 text-red-600" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500">Status</p>
                                                            <p className={cn(
                                                                "font-medium",
                                                                department.IsActive ? "text-emerald-600" : "text-red-600"
                                                            )}>
                                                                {department.IsActive ? 'Active' : 'Inactive'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* HOD Information */}
                                            <div>
                                                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Head of Department</h3>
                                                <div className="grid grid-cols-2 gap-3">
                                                    {/* HOD Name */}
                                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                        <div className="p-2 bg-blue-100 rounded-lg">
                                                            <User className="w-5 h-5 text-blue-600" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs text-gray-500">HOD Name</p>
                                                            <p className="font-medium text-gray-900 truncate">{department.HODName || 'Not Assigned'}</p>
                                                        </div>
                                                    </div>

                                                    {/* HOD Email */}
                                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                        <div className="p-2 bg-indigo-100 rounded-lg">
                                                            <Mail className="w-5 h-5 text-indigo-600" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs text-gray-500">HOD Email</p>
                                                            <p className="font-medium text-gray-900 truncate">{department.HODEmail || 'N/A'}</p>
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
                                                                {formatDate(department.CreatedAt)}
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
                                                                {formatDate(department.UpdatedAt) || 'Never'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Statistics */}
                                            <div>
                                                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Statistics</h3>
                                                <div className="grid grid-cols-4 gap-3">
                                                    <div className="p-3 bg-blue-50 rounded-xl text-center">
                                                        <Users className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                                                        <p className="text-lg font-bold text-blue-700">{department.FacultyCount || 0}</p>
                                                        <p className="text-xs text-blue-600">Faculty</p>
                                                    </div>
                                                    <div className="p-3 bg-emerald-50 rounded-xl text-center">
                                                        <GraduationCap className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                                                        <p className="text-lg font-bold text-emerald-700">{department.StudentCount || 0}</p>
                                                        <p className="text-xs text-emerald-600">Students</p>
                                                    </div>
                                                    <div className="p-3 bg-purple-50 rounded-xl text-center">
                                                        <BookOpen className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                                                        <p className="text-lg font-bold text-purple-700">{department.SubjectCount || 0}</p>
                                                        <p className="text-xs text-purple-600">Subjects</p>
                                                    </div>
                                                    <div className="p-3 bg-amber-50 rounded-xl text-center">
                                                        <Layers className="w-5 h-5 text-amber-600 mx-auto mb-1" />
                                                        <p className="text-lg font-bold text-amber-700">{department.BatchCount || 0}</p>
                                                        <p className="text-xs text-amber-600">Batches</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="py-16 text-center text-gray-500">
                                        Department not found
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

export default DepartmentDetailModal
