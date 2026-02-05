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
    Building2,
    BookOpen,
    Award,
    UserCheck,
    UserX,
    GraduationCap,
    Briefcase,
    RefreshCw,
    Users,
} from 'lucide-react'
import { facultyService } from '@/services/facultyService'
import { ROUTES } from '@/utils/constants'
import { cn } from '@/utils/helpers'

const API_URL = import.meta.env.VITE_API_URL || 'https://localhost:7266'

const FacultyDetailModal = ({ isOpen, onClose, facultyId }) => {
    const navigate = useNavigate()

    // Fetch full faculty details when modal opens
    const { data: facultyData, isLoading } = useQuery({
        queryKey: ['faculty-detail', facultyId],
        queryFn: () => facultyService.getById(facultyId),
        enabled: isOpen && !!facultyId,
    })

    const faculty = facultyData?.Data

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
                                ) : faculty ? (
                                    <>
                                        {/* Header with gradient */}
                                        <div className="relative bg-gradient-to-br from-indigo-500 to-purple-600 px-6 py-5">
                                            {/* Action buttons */}
                                            <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        handleClose()
                                                        navigate(`${ROUTES.ADMIN_FACULTIES}/${faculty.Id}/edit`)
                                                    }}
                                                    className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors group"
                                                    title="Edit Faculty"
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
                                                    {faculty.ProfileImagePath ? (
                                                        <img
                                                            src={`${API_URL}${faculty.ProfileImagePath}`}
                                                            alt={faculty.FullName}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <span className="text-3xl font-bold text-white">
                                                            {faculty.FullName?.charAt(0)?.toUpperCase() || 'F'}
                                                        </span>
                                                    )}
                                                </div>
                                                <Dialog.Title className="text-xl font-bold text-white">
                                                    {faculty.FullName}
                                                </Dialog.Title>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-sm font-medium">
                                                        <Briefcase className="w-4 h-4" />
                                                        {faculty.Designation || 'Faculty'}
                                                    </span>
                                                    <span className={cn(
                                                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium",
                                                        faculty.IsActive ? "bg-emerald-500/80 text-white" : "bg-red-500/80 text-white"
                                                    )}>
                                                        {faculty.IsActive ? (
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
                                            {/* Employment Information */}
                                            <div>
                                                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Employment Information</h3>
                                                <div className="grid grid-cols-3 gap-3">
                                                    {/* Employee ID */}
                                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                        <div className="p-2 bg-purple-100 rounded-lg">
                                                            <Hash className="w-5 h-5 text-purple-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500">Employee ID</p>
                                                            <p className="font-medium text-gray-900">{faculty.EmployeeId}</p>
                                                        </div>
                                                    </div>

                                                    {/* Department */}
                                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                        <div className="p-2 bg-amber-100 rounded-lg">
                                                            <Building2 className="w-5 h-5 text-amber-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500">Department</p>
                                                            <p className="font-medium text-gray-900">
                                                                {faculty.DepartmentName || 'Not Assigned'}
                                                                {faculty.DepartmentCode && (
                                                                    <span className="text-gray-500 text-sm ml-1">({faculty.DepartmentCode})</span>
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Joined Date */}
                                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                        <div className="p-2 bg-gray-100 rounded-lg">
                                                            <Calendar className="w-5 h-5 text-gray-500" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500">Joined</p>
                                                            <p className="font-medium text-gray-900 text-sm">
                                                                {formatDate(faculty.JoiningDate || faculty.CreatedAt)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Academic Information */}
                                            <div>
                                                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Academic Information</h3>
                                                <div className="grid grid-cols-2 gap-3">
                                                    {/* Qualification */}
                                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                        <div className="p-2 bg-cyan-100 rounded-lg">
                                                            <GraduationCap className="w-5 h-5 text-cyan-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500">Qualification</p>
                                                            <p className="font-medium text-gray-900">{faculty.Qualification || 'N/A'}</p>
                                                        </div>
                                                    </div>

                                                    {/* Specialization */}
                                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                        <div className="p-2 bg-pink-100 rounded-lg">
                                                            <Award className="w-5 h-5 text-pink-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500">Specialization</p>
                                                            <p className="font-medium text-gray-900">{faculty.Specialization || 'N/A'}</p>
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
                                                            <p className="font-medium text-gray-900 truncate">{faculty.PersonalEmail}</p>
                                                        </div>
                                                    </div>

                                                    {/* Institutional Email */}
                                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                        <div className="p-2 bg-indigo-100 rounded-lg">
                                                            <Building2 className="w-5 h-5 text-indigo-600" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs text-gray-500">Institutional Email</p>
                                                            <p className="font-medium text-gray-900 truncate">{faculty.InstitutionalEmail || 'N/A'}</p>
                                                        </div>
                                                    </div>

                                                    {/* Phone */}
                                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                        <div className="p-2 bg-green-100 rounded-lg">
                                                            <Phone className="w-5 h-5 text-green-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500">Phone Number</p>
                                                            <p className="font-medium text-gray-900">{faculty.PhoneNumber || 'N/A'}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Statistics */}
                                            <div>
                                                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Statistics</h3>
                                                <div className="grid grid-cols-3 gap-3">
                                                    <div className="p-3 bg-indigo-50 rounded-xl text-center">
                                                        <BookOpen className="w-5 h-5 text-indigo-600 mx-auto mb-1" />
                                                        <p className="text-lg font-bold text-indigo-700">{faculty.AssignedCoursesCount || 0}</p>
                                                        <p className="text-xs text-indigo-600">Courses</p>
                                                    </div>
                                                    <div className="p-3 bg-emerald-50 rounded-xl text-center">
                                                        <Users className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                                                        <p className="text-lg font-bold text-emerald-700">{faculty.CoordinatingBatchesCount || 0}</p>
                                                        <p className="text-xs text-emerald-600">Batches</p>
                                                    </div>
                                                    <div className="p-3 bg-amber-50 rounded-xl text-center">
                                                        <BookOpen className="w-5 h-5 text-amber-600 mx-auto mb-1" />
                                                        <p className="text-lg font-bold text-amber-700">{faculty.CoordinatingCoursesCount || 0}</p>
                                                        <p className="text-xs text-amber-600">Coordinating</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="py-16 text-center text-gray-500">
                                        Faculty not found
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

export default FacultyDetailModal
