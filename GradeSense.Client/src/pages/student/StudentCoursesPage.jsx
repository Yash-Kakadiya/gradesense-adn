import { useState, Fragment, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Dialog, Transition } from '@headlessui/react'
import { PageHeader } from '@/components/layout'
import { Card, Badge, SearchInput, EmptyState, Button } from '@/components/common'
import { courseEnrollmentService } from '@/services/courseEnrollmentService'
import { facultyAssignmentService } from '@/services/facultyAssignmentService'
import { facultyService } from '@/services/facultyService'
import { useDebounce } from '@/hooks'
import { BookOpen, User, Calendar, GraduationCap, Loader2, Hash, X, FileText, Clock, Award, Building2, Eye, Users, Mail, Phone } from 'lucide-react'

const ROLE_COLORS = {
    'Coordinator': 'bg-purple-100 text-purple-700 border-purple-200',
    'Instructor': 'bg-blue-100 text-blue-700 border-blue-200',
    'TA': 'bg-green-100 text-green-700 border-green-200',
    'Lab Instructor': 'bg-amber-100 text-amber-700 border-amber-200',
    'Guest Lecturer': 'bg-cyan-100 text-cyan-700 border-cyan-200',
}

// Role display order: Coordinator first, then others, TAs last
const ROLE_ORDER = ['Coordinator', 'Instructor', 'Lab Instructor', 'Guest Lecturer', 'TA']

// Format date helper
const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    })
}

const API_URL = import.meta.env.VITE_API_URL || 'https://localhost:7266'

// Faculty Detail Popup Component
const FacultyDetailPopup = ({ isOpen, onClose, faculty }) => {
    if (!faculty) return null

    const profileImageUrl = faculty.ProfileImagePath
        ? `${API_URL}${faculty.ProfileImagePath}`
        : null

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-[60]" onClose={onClose}>
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
                            <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
                                {/* Header */}
                                <div className="relative bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-6">
                                    <button
                                        onClick={onClose}
                                        className="absolute right-4 top-4 p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>

                                    <div className="flex flex-col items-center">
                                        {profileImageUrl ? (
                                            <img
                                                src={profileImageUrl}
                                                alt={faculty.FullName}
                                                className="w-24 h-24 rounded-full border-4 border-white/30 object-cover"
                                            />
                                        ) : (
                                            <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center border-4 border-white/30">
                                                <span className="text-3xl font-bold text-white">
                                                    {faculty.FullName?.charAt(0) || 'F'}
                                                </span>
                                            </div>
                                        )}
                                        <Dialog.Title className="text-xl font-bold text-white mt-3 text-center">
                                            {faculty.FullName}
                                        </Dialog.Title>
                                        {faculty.Designation && (
                                            <p className="text-blue-100 text-sm">{faculty.Designation}</p>
                                        )}
                                        <Badge variant="secondary" className="mt-2 bg-white/20 text-white border-0">
                                            {faculty.DepartmentName}
                                        </Badge>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-5 space-y-5 max-h-[60vh] overflow-y-auto">
                                    {/* Employment Information */}
                                    <div>
                                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Employment Information</h3>
                                        <div className="grid grid-cols-3 gap-3">
                                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                <div className="p-2 bg-blue-100 rounded-lg">
                                                    <User className="w-4 h-4 text-blue-600" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Employee ID</p>
                                                    <p className="font-medium text-gray-900 text-sm">{faculty.EmployeeId}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                <div className="p-2 bg-amber-100 rounded-lg">
                                                    <Building2 className="w-4 h-4 text-amber-600" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Department</p>
                                                    <p className="font-medium text-gray-900 text-sm">{faculty.DepartmentName}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                <div className="p-2 bg-gray-100 rounded-lg">
                                                    <Calendar className="w-4 h-4 text-gray-500" />
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
                                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                <div className="p-2 bg-cyan-100 rounded-lg">
                                                    <GraduationCap className="w-4 h-4 text-cyan-600" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Qualification</p>
                                                    <p className="font-medium text-gray-900 text-sm">{faculty.Qualification || 'N/A'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                <div className="p-2 bg-pink-100 rounded-lg">
                                                    <Award className="w-4 h-4 text-pink-600" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Specialization</p>
                                                    <p className="font-medium text-gray-900 text-sm">{faculty.Specialization || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Contact Information */}
                                    <div>
                                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Contact Information</h3>
                                        <div className="grid grid-cols-3 gap-3">
                                            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                                                <div className="p-2 bg-blue-100 rounded-lg shrink-0">
                                                    <Mail className="w-4 h-4 text-blue-600" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-xs text-gray-500">Personal Email</p>
                                                    <p className="font-medium text-gray-900 text-sm truncate" title={faculty.PersonalEmail}>
                                                        {faculty.PersonalEmail || 'N/A'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                                                <div className="p-2 bg-indigo-100 rounded-lg shrink-0">
                                                    <Building2 className="w-4 h-4 text-indigo-600" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-xs text-gray-500">Institutional Email</p>
                                                    <p className="font-medium text-gray-900 text-sm truncate" title={faculty.InstitutionalEmail}>
                                                        {faculty.InstitutionalEmail || 'N/A'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                <div className="p-2 bg-green-100 rounded-lg">
                                                    <Phone className="w-4 h-4 text-green-600" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Phone Number</p>
                                                    <p className="font-medium text-gray-900 text-sm">{faculty.PhoneNumber || 'N/A'}</p>
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

                                {/* Footer */}
                                <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
                                    <button
                                        onClick={onClose}
                                        className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors text-sm"
                                    >
                                        Close
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}

// Course Detail Modal Component
const CourseDetailModal = ({ isOpen, onClose, course }) => {
    const [selectedFaculty, setSelectedFaculty] = useState(null)
    const [isFacultyPopupOpen, setIsFacultyPopupOpen] = useState(false)

    // Fetch faculty assignments for this course
    const { data: assignmentsData, isLoading: loadingAssignments } = useQuery({
        queryKey: ['course-faculty-assignments', course?.CourseOfferingId],
        queryFn: () => facultyAssignmentService.getByCourseOffering(course?.CourseOfferingId),
        enabled: !!course?.CourseOfferingId && isOpen,
    })

    // Fetch faculty details for popup
    const { data: facultyDetailData } = useQuery({
        queryKey: ['faculty-detail', selectedFaculty?.FacultyId],
        queryFn: async () => {
            const response = await facultyService.getById(selectedFaculty?.FacultyId)
            return response?.Data || null
        },
        enabled: !!selectedFaculty?.FacultyId && isFacultyPopupOpen,
    })

    const assignments = assignmentsData?.Data?.Data || []

    // Group faculty by role
    const groupedFaculty = useMemo(() => {
        return assignments.reduce((acc, assignment) => {
            const role = assignment.Role || 'Instructor'
            if (!acc[role]) acc[role] = []
            acc[role].push(assignment)
            return acc
        }, {})
    }, [assignments])

    const handleViewFacultyDetails = (assignment) => {
        setSelectedFaculty(assignment)
        setIsFacultyPopupOpen(true)
    }

    const handleCloseFacultyPopup = () => {
        setIsFacultyPopupOpen(false)
        setSelectedFaculty(null)
    }

    if (!course) return null

    return (
        <>
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
                                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
                                    {/* Header */}
                                    <div className="relative bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-5">
                                        <button
                                            onClick={onClose}
                                            className="absolute right-4 top-4 p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                        <Badge variant="secondary" className="mb-2 bg-white/20 text-white border-0">
                                            {course.SubjectCode}
                                        </Badge>
                                        <Dialog.Title className="text-xl font-bold text-white">
                                            {course.SubjectName}
                                        </Dialog.Title>
                                    </div>

                                    {/* Content */}
                                    <div className="p-6 max-h-[60vh] overflow-y-auto">
                                        {/* Subject Description */}
                                        {course.SubjectDescription && (
                                            <div className="mb-6">
                                                <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                                    <FileText className="w-4 h-4 text-emerald-600" />
                                                    About This Course
                                                </h4>
                                                <p className="text-gray-600 text-sm leading-relaxed">
                                                    {course.SubjectDescription}
                                                </p>
                                            </div>
                                        )}

                                        {/* Course Details Grid */}
                                        <div className="grid grid-cols-2 gap-4 mb-6">
                                            <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Hash className="w-4 h-4 text-emerald-600" />
                                                    <span className="text-xs text-gray-500">Credits</span>
                                                </div>
                                                <p className="text-lg font-bold text-gray-900">{course.Credits || 0}</p>
                                            </div>

                                            <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <GraduationCap className="w-4 h-4 text-blue-600" />
                                                    <span className="text-xs text-gray-500">Semester</span>
                                                </div>
                                                <p className="text-lg font-bold text-gray-900">{course.Semester}</p>
                                            </div>

                                            <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Calendar className="w-4 h-4 text-amber-600" />
                                                    <span className="text-xs text-gray-500">Academic Year</span>
                                                </div>
                                                <p className="text-lg font-bold text-gray-900">{course.AcademicYear}</p>
                                            </div>

                                            <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Award className="w-4 h-4 text-purple-600" />
                                                    <span className="text-xs text-gray-500">Status</span>
                                                </div>
                                                <Badge variant={course.IsActive ? 'success' : 'default'} dot>
                                                    {course.IsActive ? 'Active' : 'Completed'}
                                                </Badge>
                                            </div>
                                        </div>

                                        {/* Batch Info */}
                                        {course.BatchName && (
                                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl mb-6">
                                                <div className="p-2 bg-white rounded-lg shadow-sm">
                                                    <Building2 className="w-4 h-4 text-gray-600" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Batch</p>
                                                    <p className="font-medium text-gray-900">{course.BatchName}</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Faculty Assignments Section */}
                                        <div>
                                            <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                                                <Users className="w-4 h-4 text-blue-600" />
                                                Course Faculty
                                            </h4>

                                            {loadingAssignments ? (
                                                <div className="flex items-center justify-center py-8">
                                                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                                                </div>
                                            ) : Object.keys(groupedFaculty).length === 0 ? (
                                                <div className="text-center py-6 bg-gray-50 rounded-xl">
                                                    <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                                    <p className="text-sm text-gray-500">No faculty assigned yet</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    {Object.entries(groupedFaculty)
                                                        .sort(([roleA], [roleB]) => {
                                                            const orderA = ROLE_ORDER.indexOf(roleA)
                                                            const orderB = ROLE_ORDER.indexOf(roleB)
                                                            return (orderA === -1 ? 999 : orderA) - (orderB === -1 ? 999 : orderB)
                                                        })
                                                        .map(([role, facultyList]) => (
                                                            <div key={role}>
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${ROLE_COLORS[role] || 'bg-gray-100 text-gray-700'}`}>
                                                                        {role}
                                                                    </span>
                                                                    <span className="text-xs text-gray-400">({facultyList.length})</span>
                                                                </div>
                                                                <div className="space-y-2">
                                                                    {facultyList.map((assignment) => (
                                                                        <div
                                                                            key={assignment.Id}
                                                                            className="flex items-center justify-between p-3 bg-gray-50 rounded-xl group hover:bg-gray-100 transition-colors"
                                                                        >
                                                                            <div className="flex items-center gap-3">
                                                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-medium">
                                                                                    {assignment.FacultyName?.charAt(0) || 'F'}
                                                                                </div>
                                                                                <div>
                                                                                    <p className="font-medium text-gray-900">{assignment.FacultyName}</p>
                                                                                    <p className="text-xs text-gray-500">{assignment.FacultyEmployeeId}</p>
                                                                                </div>
                                                                            </div>
                                                                            <button
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation()
                                                                                    handleViewFacultyDetails(assignment)
                                                                                }}
                                                                                className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                                                                title="View Details"
                                                                            >
                                                                                <Eye className="w-4 h-4" />
                                                                            </button>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                                        <Button variant="outline" className="w-full" onClick={onClose}>
                                            Close
                                        </Button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            {/* Faculty Detail Popup */}
            <FacultyDetailPopup
                isOpen={isFacultyPopupOpen}
                onClose={handleCloseFacultyPopup}
                faculty={facultyDetailData}
            />
        </>
    )
}

const StudentCoursesPage = () => {
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCourse, setSelectedCourse] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const debouncedSearch = useDebounce(searchTerm, 300)

    const handleCourseClick = (course) => {
        setSelectedCourse(course)
        setIsModalOpen(true)
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
        setSelectedCourse(null)
    }

    // Fetch student's enrolled courses
    const { data, isLoading } = useQuery({
        queryKey: ['student-courses'],
        queryFn: () => courseEnrollmentService.getAll({ pageSize: 100 }),
    })

    const courses = data?.Data?.Data || []

    const filteredCourses = courses.filter((course) => {
        const matchesSearch =
            course.SubjectName?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            course.SubjectCode?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            course.FacultyName?.toLowerCase().includes(debouncedSearch.toLowerCase())
        return matchesSearch
    })

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="My Courses"
                description="View your enrolled courses"
            />

            <Card className="border-0 shadow-md overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                <BookOpen className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-white">Find Your Courses</h3>
                                <p className="text-sm text-white/80">Search by name, code, or faculty</p>
                            </div>
                        </div>
                        <div className="w-full sm:w-80">
                            <div className="relative">
                                <SearchInput
                                    value={searchTerm}
                                    onChange={setSearchTerm}
                                    placeholder="Search courses..."
                                    className="[&_input]:bg-white/95 [&_input]:border-0 [&_input]:shadow-md [&_input]:placeholder-gray-400"
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="px-6 py-3 bg-gradient-to-r from-emerald-50 to-teal-50 border-t border-emerald-100">
                    <div className="flex items-center gap-2 text-sm text-emerald-700">
                        <Badge variant="success" className="bg-emerald-100 text-emerald-700 border-0">
                            {filteredCourses.length}
                        </Badge>
                        <span>course{filteredCourses.length !== 1 ? 's' : ''} found</span>
                    </div>
                </div>
            </Card>

            {filteredCourses.length === 0 ? (
                <EmptyState
                    icon={BookOpen}
                    title="No courses found"
                    description={
                        searchTerm
                            ? 'Try adjusting your search terms'
                            : 'You have no courses enrolled'
                    }
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredCourses.map((course) => (
                        <Card
                            key={course.Id}
                            className="group border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden cursor-pointer"
                            onClick={() => handleCourseClick(course)}
                        >
                            <div className="h-2 bg-gradient-to-r from-emerald-500 to-teal-600" />
                            <Card.Body className="p-5">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <Badge variant="primary" className="mb-2">
                                            {course.SubjectCode}
                                        </Badge>
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            {course.SubjectName}
                                        </h3>
                                    </div>
                                    <div className="p-2.5 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl">
                                        <BookOpen className="w-5 h-5 text-emerald-600" />
                                    </div>
                                </div>

                                <div className="space-y-2.5 text-sm">
                                    {course.FacultyName && (
                                        <div className="flex items-center gap-2.5 text-gray-600">
                                            <div className="p-1.5 bg-gray-100 rounded-lg">
                                                <User className="w-4 h-4" />
                                            </div>
                                            <span>{course.FacultyName}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2.5 text-gray-600">
                                        <div className="p-1.5 bg-gray-100 rounded-lg">
                                            <GraduationCap className="w-4 h-4" />
                                        </div>
                                        <span>{course.BatchName}</span>
                                    </div>
                                    <div className="flex items-center gap-2.5 text-gray-600">
                                        <div className="p-1.5 bg-gray-100 rounded-lg">
                                            <Calendar className="w-4 h-4" />
                                        </div>
                                        <span>AY: {course.AcademicYear}</span>
                                    </div>
                                    {course.Credits && (
                                        <div className="flex items-center gap-2.5 text-gray-600">
                                            <div className="p-1.5 bg-gray-100 rounded-lg">
                                                <Hash className="w-4 h-4" />
                                            </div>
                                            <span>{course.Credits} Credits</span>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-5 pt-4 border-t border-gray-100">
                                    <div className="flex items-center justify-between text-sm">
                                        <Badge variant="secondary">Semester {course.Semester}</Badge>
                                        <Badge
                                            variant={course.IsActive ? 'success' : 'default'}
                                            dot
                                        >
                                            {course.IsActive ? 'Active' : 'Completed'}
                                        </Badge>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    ))}
                </div>
            )}

            <CourseDetailModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                course={selectedCourse}
            />
        </div>
    )
}

export default StudentCoursesPage
