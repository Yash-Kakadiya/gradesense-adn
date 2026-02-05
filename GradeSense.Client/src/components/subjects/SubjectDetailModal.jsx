import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import {
    X,
    BookOpen,
    Building2,
    GraduationCap,
    FileText,
    Calendar,
    Clock,
    GitBranch,
    Layers,
    CheckCircle,
    XCircle,
    Hash,
    Award,
    Edit,
} from 'lucide-react'

const SubjectDetailModal = ({ isOpen, onClose, subject, onEdit }) => {
    if (!subject) return null

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
                                <div className="relative bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-6">
                                    {/* Action buttons */}
                                    <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
                                        {onEdit && (
                                            <button
                                                type="button"
                                                onClick={() => onEdit(subject)}
                                                className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
                                                title="Edit Subject"
                                            >
                                                <Edit className="w-5 h-5" />
                                            </button>
                                        )}
                                        <button
                                            onClick={onClose}
                                            className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                                        >
                                            <X className="w-5 h-5 text-white" />
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
                                            {subject.Name}
                                        </Dialog.Title>
                                        <p className="text-violet-100 text-sm mt-1">
                                            {subject.Code}
                                        </p>

                                        {/* Status Badges */}
                                        <div className="flex flex-wrap justify-center gap-2 mt-4">
                                            <span
                                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${subject.IsActive
                                                    ? 'bg-emerald-500/80 text-white'
                                                    : 'bg-red-500/80 text-white'
                                                    }`}
                                            >
                                                {subject.IsActive ? (
                                                    <CheckCircle className="w-4 h-4" />
                                                ) : (
                                                    <XCircle className="w-4 h-4" />
                                                )}
                                                {subject.IsActive ? 'Active' : 'Inactive'}
                                            </span>
                                            {subject.IsElective && (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-white/20 text-white">
                                                    <Award className="w-4 h-4" />
                                                    Elective
                                                </span>
                                            )}
                                            {subject.SubjectType && (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-white/20 text-white">
                                                    <Layers className="w-4 h-4" />
                                                    {subject.SubjectType}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
                                    {/* Subject Information */}
                                    <div>
                                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Subject Information</h3>
                                        <div className="grid grid-cols-3 gap-3">
                                            {/* Code */}
                                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                <div className="p-2 bg-violet-100 rounded-lg">
                                                    <Hash className="w-5 h-5 text-violet-600" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Code</p>
                                                    <p className="font-medium text-gray-900">{subject.Code}</p>
                                                </div>
                                            </div>

                                            {/* Credits */}
                                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                <div className="p-2 bg-cyan-100 rounded-lg">
                                                    <GraduationCap className="w-5 h-5 text-cyan-600" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Credits</p>
                                                    <p className="font-medium text-gray-900">{subject.Credit}</p>
                                                </div>
                                            </div>

                                            {/* Semester */}
                                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                <div className="p-2 bg-indigo-100 rounded-lg">
                                                    <Calendar className="w-5 h-5 text-indigo-600" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Semester</p>
                                                    <p className="font-medium text-gray-900">{subject.Semester ? `Sem ${subject.Semester}` : 'N/A'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Department Information */}
                                    <div>
                                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Department</h3>
                                        <div className="grid grid-cols-2 gap-3">
                                            {/* Department Name */}
                                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                <div className="p-2 bg-amber-100 rounded-lg">
                                                    <Building2 className="w-5 h-5 text-amber-600" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs text-gray-500">Department Name</p>
                                                    <p className="font-medium text-gray-900 truncate">{subject.DepartmentName}</p>
                                                </div>
                                            </div>

                                            {/* Department Code */}
                                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                <div className="p-2 bg-amber-100 rounded-lg">
                                                    <Hash className="w-5 h-5 text-amber-600" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Department Code</p>
                                                    <p className="font-medium text-gray-900 font-mono">{subject.DepartmentCode || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Course Details */}
                                    <div>
                                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Course Details</h3>
                                        <div className="grid grid-cols-3 gap-3">
                                            {/* Subject Type */}
                                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                <div className="p-2 bg-blue-100 rounded-lg">
                                                    <Layers className="w-5 h-5 text-blue-600" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Type</p>
                                                    <p className="font-medium text-gray-900">{subject.SubjectType || 'N/A'}</p>
                                                </div>
                                            </div>

                                            {/* Elective */}
                                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                <div className="p-2 bg-orange-100 rounded-lg">
                                                    <Award className="w-5 h-5 text-orange-600" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Elective</p>
                                                    <p className="font-medium text-gray-900">{subject.IsElective ? 'Yes' : 'No'}</p>
                                                </div>
                                            </div>

                                            {/* Prerequisite */}
                                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                <div className="p-2 bg-purple-100 rounded-lg">
                                                    <GitBranch className="w-5 h-5 text-purple-600" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs text-gray-500">Prerequisite</p>
                                                    <p className="font-medium text-gray-900 truncate">
                                                        {subject.PrerequisiteSubjectName
                                                            ? `${subject.PrerequisiteSubjectCode}`
                                                            : 'None'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Description & Syllabus */}
                                    {(subject.Description || subject.Syllabus) && (
                                        <div>
                                            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Details</h3>
                                            <div className="space-y-3">
                                                {subject.Description && (
                                                    <div className="p-3 bg-gray-50 rounded-xl">
                                                        <div className="flex items-start gap-3">
                                                            <div className="p-2 bg-emerald-100 rounded-lg">
                                                                <FileText className="w-5 h-5 text-emerald-600" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-xs text-gray-500">Description</p>
                                                                <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{subject.Description}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                                {subject.Syllabus && (
                                                    <div className="p-3 bg-gray-50 rounded-xl">
                                                        <div className="flex items-start gap-3">
                                                            <div className="p-2 bg-teal-100 rounded-lg">
                                                                <FileText className="w-5 h-5 text-teal-600" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-xs text-gray-500">Syllabus</p>
                                                                <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{subject.Syllabus}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Timestamps */}
                                    <div>
                                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Record Information</h3>
                                        <div className="grid grid-cols-2 gap-3">
                                            {/* Created At */}
                                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                <div className="p-2 bg-emerald-100 rounded-lg">
                                                    <Calendar className="w-5 h-5 text-emerald-600" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Created At</p>
                                                    <p className="font-medium text-gray-900">{formatDate(subject.CreatedAt)}</p>
                                                </div>
                                            </div>

                                            {/* Updated At */}
                                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                <div className="p-2 bg-blue-100 rounded-lg">
                                                    <Clock className="w-5 h-5 text-blue-600" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Last Updated</p>
                                                    <p className="font-medium text-gray-900">{formatDate(subject.UpdatedAt)}</p>
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

export default SubjectDetailModal
