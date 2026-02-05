import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import {
    X,
    BookOpen,
    Calendar,
    Users,
    GraduationCap,
    Clock,
    Hash,
    User,
    Mail,
    Layers,
    Building2,
    CheckCircle,
    XCircle,
    Edit,
    ClipboardList,
    UserCheck,
} from 'lucide-react'

const CourseOfferingDetailModal = ({ isOpen, onClose, courseOffering, onEdit }) => {
    if (!courseOffering) return null

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A'
        return new Date(dateString).toLocaleDateString('en-US', {
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
                            <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
                                {/* Header with gradient */}
                                <div className="relative bg-gradient-to-br from-indigo-500 to-purple-600 px-6 py-5">
                                    {/* Action buttons */}
                                    <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
                                        {onEdit && (
                                            <button
                                                type="button"
                                                onClick={() => onEdit(courseOffering)}
                                                className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
                                                title="Edit Course Offering"
                                            >
                                                <Edit className="w-5 h-5" />
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={onClose}
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
                                            <BookOpen className="w-10 h-10 text-white" />
                                        </div>
                                        <Dialog.Title className="text-xl font-bold text-white">
                                            {courseOffering.SubjectName}
                                        </Dialog.Title>
                                        <p className="text-indigo-100 text-sm mt-1">
                                            {courseOffering.SubjectCode}
                                        </p>

                                        {/* Status Badges */}
                                        <div className="flex flex-wrap justify-center gap-2 mt-4">
                                            <span
                                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${courseOffering.IsActive
                                                    ? 'bg-emerald-500/80 text-white'
                                                    : 'bg-red-500/80 text-white'
                                                    }`}
                                            >
                                                {courseOffering.IsActive ? (
                                                    <CheckCircle className="w-4 h-4" />
                                                ) : (
                                                    <XCircle className="w-4 h-4" />
                                                )}
                                                {courseOffering.IsActive ? 'Active' : 'Inactive'}
                                            </span>
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-white/20 text-white">
                                                <Calendar className="w-4 h-4" />
                                                {courseOffering.AcademicYear}
                                            </span>
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-white/20 text-white">
                                                <GraduationCap className="w-4 h-4" />
                                                {courseOffering.BatchName}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
                                    {/* Statistics */}
                                    {(courseOffering.CourseEnrollmentsCount !== undefined ||
                                        courseOffering.EvaluationSchemesCount !== undefined) && (
                                            <div className="grid grid-cols-4 gap-3">
                                                <div className="text-center p-3 bg-indigo-50 rounded-xl">
                                                    <Users className="w-6 h-6 text-indigo-600 mx-auto mb-1" />
                                                    <p className="text-lg font-bold text-indigo-700">
                                                        {courseOffering.CourseEnrollmentsCount || 0}
                                                    </p>
                                                    <p className="text-xs text-indigo-600">Enrollments</p>
                                                </div>
                                                <div className="text-center p-3 bg-emerald-50 rounded-xl">
                                                    <UserCheck className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
                                                    <p className="text-lg font-bold text-emerald-700">
                                                        {courseOffering.ActiveEnrollmentsCount || 0}
                                                    </p>
                                                    <p className="text-xs text-emerald-600">Active</p>
                                                </div>
                                                <div className="text-center p-3 bg-purple-50 rounded-xl">
                                                    <ClipboardList className="w-6 h-6 text-purple-600 mx-auto mb-1" />
                                                    <p className="text-lg font-bold text-purple-700">
                                                        {courseOffering.EvaluationSchemesCount || 0}
                                                    </p>
                                                    <p className="text-xs text-purple-600">Evaluations</p>
                                                </div>
                                                <div className="text-center p-3 bg-amber-50 rounded-xl">
                                                    <User className="w-6 h-6 text-amber-600 mx-auto mb-1" />
                                                    <p className="text-lg font-bold text-amber-700">
                                                        {courseOffering.FacultyAssignmentsCount || 0}
                                                    </p>
                                                    <p className="text-xs text-amber-600">Faculty</p>
                                                </div>
                                            </div>
                                        )}

                                    {/* Subject Information */}
                                    <div>
                                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                                            Subject Information
                                        </h3>
                                        <div className="grid grid-cols-3 gap-3">
                                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                <div className="p-2 bg-indigo-100 rounded-lg">
                                                    <Hash className="w-5 h-5 text-indigo-600" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Subject Code</p>
                                                    <p className="font-medium text-gray-900">
                                                        {courseOffering.SubjectCode}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                <div className="p-2 bg-purple-100 rounded-lg">
                                                    <BookOpen className="w-5 h-5 text-purple-600" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs text-gray-500">Subject Name</p>
                                                    <p className="font-medium text-gray-900 truncate">
                                                        {courseOffering.SubjectName}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                <div className="p-2 bg-cyan-100 rounded-lg">
                                                    <GraduationCap className="w-5 h-5 text-cyan-600" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Credits</p>
                                                    <p className="font-medium text-gray-900">
                                                        {courseOffering.SubjectCredit || 'N/A'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Batch Information */}
                                    <div>
                                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                                            Batch Information
                                        </h3>
                                        <div className="grid grid-cols-3 gap-3">
                                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                <div className="p-2 bg-cyan-100 rounded-lg">
                                                    <Layers className="w-5 h-5 text-cyan-600" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs text-gray-500">Batch Name</p>
                                                    <p className="font-medium text-gray-900 truncate">
                                                        {courseOffering.BatchName}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                <div className="p-2 bg-teal-100 rounded-lg">
                                                    <GraduationCap className="w-5 h-5 text-teal-600" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Semester</p>
                                                    <p className="font-medium text-gray-900">
                                                        Sem {courseOffering.BatchSemester || 'N/A'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                <div className="p-2 bg-amber-100 rounded-lg">
                                                    <Building2 className="w-5 h-5 text-amber-600" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs text-gray-500">Department</p>
                                                    <p className="font-medium text-gray-900 truncate">
                                                        {courseOffering.BatchDepartmentName || 'N/A'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Coordinator Information */}
                                    <div>
                                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                                            Subject Coordinator
                                        </h3>
                                        <div className="grid grid-cols-3 gap-3">
                                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                <div className="p-2 bg-blue-100 rounded-lg">
                                                    <User className="w-5 h-5 text-blue-600" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs text-gray-500">Name</p>
                                                    <p className="font-medium text-gray-900 truncate">
                                                        {courseOffering.SubjectCoordinatorName || 'Not Assigned'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                <div className="p-2 bg-blue-100 rounded-lg">
                                                    <Hash className="w-5 h-5 text-blue-600" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Employee ID</p>
                                                    <p className="font-medium text-gray-900">
                                                        {courseOffering.SubjectCoordinatorEmployeeId || 'N/A'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                <div className="p-2 bg-blue-100 rounded-lg">
                                                    <Mail className="w-5 h-5 text-blue-600" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs text-gray-500">Email</p>
                                                    <p className="font-medium text-gray-900 truncate">
                                                        {courseOffering.SubjectCoordinatorEmail || 'N/A'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Schedule & Enrollment */}
                                    <div>
                                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                                            Schedule & Enrollment
                                        </h3>
                                        <div className="grid grid-cols-3 gap-3">
                                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                <div className="p-2 bg-emerald-100 rounded-lg">
                                                    <Calendar className="w-5 h-5 text-emerald-600" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Start Date</p>
                                                    <p className="font-medium text-gray-900">
                                                        {formatDate(courseOffering.StartDate)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                <div className="p-2 bg-red-100 rounded-lg">
                                                    <Calendar className="w-5 h-5 text-red-600" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">End Date</p>
                                                    <p className="font-medium text-gray-900">
                                                        {formatDate(courseOffering.EndDate)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                <div className="p-2 bg-violet-100 rounded-lg">
                                                    <Users className="w-5 h-5 text-violet-600" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Max Enrollment</p>
                                                    <p className="font-medium text-gray-900">
                                                        {courseOffering.MaxEnrollment || 'Unlimited'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Timestamps */}
                                    <div>
                                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                                            Record Information
                                        </h3>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                <div className="p-2 bg-emerald-100 rounded-lg">
                                                    <Calendar className="w-5 h-5 text-emerald-600" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Created At</p>
                                                    <p className="font-medium text-gray-900">
                                                        {formatDate(courseOffering.CreatedAt)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                <div className="p-2 bg-blue-100 rounded-lg">
                                                    <Clock className="w-5 h-5 text-blue-600" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Last Updated</p>
                                                    <p className="font-medium text-gray-900">
                                                        {formatDate(courseOffering.UpdatedAt)}
                                                    </p>
                                                </div>
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

export default CourseOfferingDetailModal
