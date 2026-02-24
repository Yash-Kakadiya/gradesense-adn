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
    RefreshCw,
    BarChart3,
} from 'lucide-react'
import { studentService } from '@/services/studentService'
import { ROUTES } from '@/utils/constants'
import { cn } from '@/utils/helpers'

const API_URL = import.meta.env.VITE_API_URL || 'https://localhost:7266'

const StudentDetailModal = ({ isOpen, onClose, studentId, showEditButton = true }) => {
    const navigate = useNavigate()

    // Fetch full student details when modal opens
    const { data: studentData, isLoading } = useQuery({
        queryKey: ['student-detail', studentId],
        queryFn: () => studentService.getById(studentId),
        enabled: isOpen && !!studentId,
    })

    const student = studentData?.Data

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
                                        <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
                                    </div>
                                ) : student ? (
                                    <>
                                        {/* Header with gradient */}
                                        <div className="relative bg-gradient-to-br from-emerald-500 to-teal-600 px-6 py-5">
                                            {/* Action buttons */}
                                            <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
                                                {showEditButton && (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            handleClose()
                                                            navigate(`${ROUTES.ADMIN_STUDENTS}/${student.Id}/edit`)
                                                        }}
                                                        className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors group"
                                                        title="Edit Student"
                                                    >
                                                        <Edit className="w-5 h-5" />
                                                    </button>
                                                )}
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
                                                    {student.ProfileImagePath ? (
                                                        <img
                                                            src={`${API_URL}${student.ProfileImagePath}`}
                                                            alt={student.FullName}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <span className="text-3xl font-bold text-white">
                                                            {student.FullName?.charAt(0)?.toUpperCase() || 'S'}
                                                        </span>
                                                    )}
                                                </div>
                                                <Dialog.Title className="text-xl font-bold text-white">
                                                    {student.FullName}
                                                </Dialog.Title>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-sm font-medium">
                                                        <Hash className="w-4 h-4" />
                                                        {student.EnrollmentNumber}
                                                    </span>
                                                    <span className={cn(
                                                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium",
                                                        student.Status === 'Active' ? "bg-emerald-500/80 text-white" :
                                                            student.Status === 'Graduated' ? "bg-blue-500/80 text-white" : "bg-red-500/80 text-white"
                                                    )}>
                                                        {student.Status === 'Active' ? (
                                                            <><UserCheck className="w-4 h-4" /> Active</>
                                                        ) : student.Status === 'Graduated' ? (
                                                            <><GraduationCap className="w-4 h-4" /> Graduated</>
                                                        ) : (
                                                            <><UserX className="w-4 h-4" /> {student.Status}</>
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Content - Scrollable */}
                                        <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
                                            {/* Academic Information */}
                                            <div>
                                                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Academic Information</h3>
                                                <div className="grid grid-cols-4 gap-3">
                                                    {/* Department */}
                                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                        <div className="p-2 bg-amber-100 rounded-lg">
                                                            <Building2 className="w-5 h-5 text-amber-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500">Department</p>
                                                            <p className="font-medium text-gray-900 text-sm">{student.DepartmentName || 'N/A'}</p>
                                                            {student.DepartmentCode && (
                                                                <p className="text-xs text-gray-500">({student.DepartmentCode})</p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Semester */}
                                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                        <div className="p-2 bg-purple-100 rounded-lg">
                                                            <BookOpen className="w-5 h-5 text-purple-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500">Semester</p>
                                                            <p className="font-medium text-gray-900 text-sm">Semester {student.CurrentSemester || 'N/A'}</p>
                                                        </div>
                                                    </div>

                                                    {/* Admission Year */}
                                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                        <div className="p-2 bg-gray-100 rounded-lg">
                                                            <Calendar className="w-5 h-5 text-gray-500" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500">Admission Year</p>
                                                            <p className="font-medium text-gray-900 text-sm">{student.AdmissionYear || 'N/A'}</p>
                                                        </div>
                                                    </div>

                                                    {/* CGPA */}
                                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                        <div className="p-2 bg-emerald-100 rounded-lg">
                                                            <Award className="w-5 h-5 text-emerald-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500">CGPA</p>
                                                            <p className="font-medium text-gray-900 text-sm">{student.CGPA?.toFixed(2) || 'N/A'}</p>
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
                                                            <p className="font-medium text-gray-900 truncate">{student.PersonalEmail || 'N/A'}</p>
                                                        </div>
                                                    </div>

                                                    {/* Institutional Email */}
                                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                        <div className="p-2 bg-indigo-100 rounded-lg">
                                                            <Mail className="w-5 h-5 text-indigo-600" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs text-gray-500">Institutional Email</p>
                                                            <p className="font-medium text-gray-900 truncate">{student.InstitutionalEmail || 'N/A'}</p>
                                                        </div>
                                                    </div>

                                                    {/* Phone */}
                                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                        <div className="p-2 bg-green-100 rounded-lg">
                                                            <Phone className="w-5 h-5 text-green-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500">Phone Number</p>
                                                            <p className="font-medium text-gray-900">{student.PhoneNumber || 'N/A'}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Statistics */}
                                            {(student.EnrolledCoursesCount !== undefined || student.CompletedCoursesCount !== undefined || student.ActiveCoursesCount !== undefined) && (
                                                <div>
                                                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Statistics</h3>
                                                    <div className="grid grid-cols-3 gap-3">
                                                        <div className="p-3 bg-indigo-50 rounded-xl text-center">
                                                            <BookOpen className="w-5 h-5 text-indigo-600 mx-auto mb-1" />
                                                            <p className="text-lg font-bold text-indigo-700">{student.EnrolledCoursesCount || 0}</p>
                                                            <p className="text-xs text-indigo-600">Enrolled</p>
                                                        </div>
                                                        <div className="p-3 bg-emerald-50 rounded-xl text-center">
                                                            <Award className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                                                            <p className="text-lg font-bold text-emerald-700">{student.CompletedCoursesCount || 0}</p>
                                                            <p className="text-xs text-emerald-600">Completed</p>
                                                        </div>
                                                        <div className="p-3 bg-blue-50 rounded-xl text-center">
                                                            <BarChart3 className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                                                            <p className="text-lg font-bold text-blue-700">{student.ActiveCoursesCount || 0}</p>
                                                            <p className="text-xs text-blue-600">Active</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <div className="py-16 text-center text-gray-500">
                                        Student not found
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

export default StudentDetailModal
