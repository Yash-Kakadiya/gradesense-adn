import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, Badge, Button, SearchInput, EmptyState, Modal } from '@/components/common'
import { useAuth } from '@/context/AuthContext'
import { dashboardService } from '@/services/dashboardService'
import { facultyAssignmentService } from '@/services/facultyAssignmentService'
import { facultyService } from '@/services/facultyService'
import { subjectService } from '@/services/subjectService'
import { useDebounce } from '@/hooks'
import { ROUTES } from '@/utils/constants'
import { cn } from '@/utils/helpers'
import toast from 'react-hot-toast'
import {
    BookOpen,
    Users,
    Calendar,
    ChevronRight,
    GraduationCap,
    Loader2,
    ClipboardCheck,
    Target,
    Clock,
    BarChart3,
    Eye,
    Edit,
    Search,
    Filter,
    LayoutGrid,
    List,
    TrendingUp,
    RefreshCcw,
    X,
    UserPlus,
    Trash2,
    Shield,
    FileText,
    Tag,
    CheckCircle,
    AlertCircle,
    Info,
} from 'lucide-react'

const ROLE_OPTIONS = [
    { value: 'Coordinator', label: 'Coordinator', color: 'bg-purple-100 text-purple-700' },
    { value: 'Instructor', label: 'Instructor', color: 'bg-blue-100 text-blue-700' },
    { value: 'TA', label: 'Teaching Assistant', color: 'bg-green-100 text-green-700' },
    { value: 'Lab Instructor', label: 'Lab Instructor', color: 'bg-amber-100 text-amber-700' },
    { value: 'Guest Lecturer', label: 'Guest Lecturer', color: 'bg-cyan-100 text-cyan-700' },
]

// Course Detail Modal Component
const CourseDetailModal = ({ isOpen, onClose, course }) => {
    const queryClient = useQueryClient()
    const [showAddForm, setShowAddForm] = useState(false)
    const [newAssignment, setNewAssignment] = useState({ facultyId: '', role: 'Instructor' })

    const canManageAssignments = course?.IsCoordinator === true

    // Fetch subject details for this course
    const { data: subjectData, isLoading: loadingSubject } = useQuery({
        queryKey: ['subject-details', course?.SubjectId],
        queryFn: () => subjectService.getById(course?.SubjectId),
        enabled: !!course?.SubjectId && isOpen,
    })

    const subjectDetails = subjectData?.Data || null

    // Fetch faculty assignments for this course
    const { data: assignmentsData, isLoading: loadingAssignments } = useQuery({
        queryKey: ['faculty-assignments-modal', course?.CourseOfferingId],
        queryFn: () => facultyAssignmentService.getByCourseOffering(course?.CourseOfferingId),
        enabled: !!course?.CourseOfferingId && isOpen,
    })

    // Fetch all faculty for the dropdown
    const { data: facultiesData } = useQuery({
        queryKey: ['faculties-select-modal-faculty'],
        queryFn: () => facultyService.getAll({ pageSize: 200, isActive: true }),
        enabled: canManageAssignments && showAddForm,
    })

    const assignments = assignmentsData?.Data?.Data || []
    const faculties = facultiesData?.Data?.Data || []

    // Filter out already assigned faculty
    const availableFaculty = useMemo(() => {
        const assignedIds = new Set(assignments.map(a => a.FacultyId))
        return faculties.filter(f => !assignedIds.has(f.Id))
    }, [faculties, assignments])

    // Create assignment mutation
    const createMutation = useMutation({
        mutationFn: (data) => facultyAssignmentService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['faculty-assignments-modal', course?.CourseOfferingId] })
            toast.success('Faculty assigned successfully')
            setShowAddForm(false)
            setNewAssignment({ facultyId: '', role: 'Instructor' })
        },
        onError: (error) => {
            toast.error(error.response?.data?.Message || 'Failed to assign faculty')
        }
    })

    // Delete assignment mutation
    const deleteMutation = useMutation({
        mutationFn: (id) => facultyAssignmentService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['faculty-assignments-modal', course?.CourseOfferingId] })
            toast.success('Faculty assignment removed')
        },
        onError: (error) => {
            toast.error(error.response?.data?.Message || 'Failed to remove assignment')
        }
    })

    const handleAddAssignment = () => {
        if (!newAssignment.facultyId) {
            toast.error('Please select a faculty member')
            return
        }
        createMutation.mutate({
            courseOfferingId: course.CourseOfferingId,
            facultyId: parseInt(newAssignment.facultyId),
            role: newAssignment.role,
            assignmentDate: new Date().toISOString(),
        })
    }

    const handleRemoveAssignment = (assignmentId) => {
        if (window.confirm('Are you sure you want to remove this faculty assignment?')) {
            deleteMutation.mutate(assignmentId)
        }
    }

    const getRoleBadgeClass = (role) => {
        const option = ROLE_OPTIONS.find(r => r.value === role)
        return option?.color || 'bg-gray-100 text-gray-700'
    }

    if (!course) return null

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A'
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        })
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Course Details" size="lg">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
                        <BookOpen className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                        <Badge variant="primary" className="mb-2">{course.SubjectCode}</Badge>
                        <h3 className="text-xl font-semibold text-gray-900">{course.SubjectName}</h3>
                        <p className="text-gray-500">{course.BatchName} • Semester {course.Semester}</p>
                        {course.IsCoordinator && (
                            <Badge variant="warning" className="mt-2">Course Coordinator</Badge>
                        )}
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-blue-50 rounded-xl text-center">
                        <GraduationCap className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-gray-900">{course.EnrolledStudents || 0}</p>
                        <p className="text-sm text-gray-500">Students</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-xl text-center">
                        <Target className="w-6 h-6 text-green-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-gray-900">{course.AverageScore?.toFixed(1) || 0}%</p>
                        <p className="text-sm text-gray-500">Avg Score</p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-xl text-center">
                        <Calendar className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-gray-900">{course.AverageAttendance?.toFixed(0) || 0}%</p>
                        <p className="text-sm text-gray-500">Attendance</p>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-xl text-center">
                        <Clock className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-gray-900">{course.PendingGrades || 0}</p>
                        <p className="text-sm text-gray-500">Pending</p>
                    </div>
                </div>

                {/* Subject Details */}
                <div>
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Subject Information</h4>
                    {loadingSubject ? (
                        <div className="flex items-center justify-center p-4">
                            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                    <div className="p-2 bg-indigo-100 rounded-lg">
                                        <BookOpen className="w-5 h-5 text-indigo-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Subject Code</p>
                                        <p className="font-medium text-gray-900">{course.SubjectCode}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                    <div className="p-2 bg-cyan-100 rounded-lg">
                                        <GraduationCap className="w-5 h-5 text-cyan-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Credits</p>
                                        <p className="font-medium text-gray-900">{subjectDetails?.Credit || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                    <div className="p-2 bg-teal-100 rounded-lg">
                                        <Calendar className="w-5 h-5 text-teal-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Academic Year</p>
                                        <p className="font-medium text-gray-900">{course.AcademicYear}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                    <div className="p-2 bg-purple-100 rounded-lg">
                                        <Tag className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Subject Type</p>
                                        <p className="font-medium text-gray-900">{subjectDetails?.SubjectType || 'Theory'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                    <div className="p-2 bg-amber-100 rounded-lg">
                                        {subjectDetails?.IsElective ? (
                                            <CheckCircle className="w-5 h-5 text-amber-600" />
                                        ) : (
                                            <AlertCircle className="w-5 h-5 text-amber-600" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Elective</p>
                                        <p className="font-medium text-gray-900">{subjectDetails?.IsElective ? 'Yes' : 'No'}</p>
                                    </div>
                                </div>
                                {subjectDetails?.PrerequisiteSubjectName && (
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                        <div className="p-2 bg-rose-100 rounded-lg">
                                            <Info className="w-5 h-5 text-rose-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Prerequisite</p>
                                            <p className="font-medium text-gray-900">{subjectDetails.PrerequisiteSubjectName}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                            {/* Description */}
                            {subjectDetails?.Description && (
                                <div className="mt-4 p-3 bg-gray-50 rounded-xl">
                                    <p className="text-xs text-gray-500 mb-1">Description</p>
                                    <p className="text-sm text-gray-700">{subjectDetails.Description}</p>
                                </div>
                            )}
                            {/* Syllabus */}
                            {subjectDetails?.Syllabus && (
                                <div className="mt-3 p-3 bg-blue-50 rounded-xl">
                                    <div className="flex items-center gap-2 mb-1">
                                        <FileText className="w-4 h-4 text-blue-600" />
                                        <p className="text-xs text-blue-700 font-medium">Syllabus</p>
                                    </div>
                                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{subjectDetails.Syllabus}</p>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Batch Details */}
                <div>
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Batch Information</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                            <div className="p-2 bg-violet-100 rounded-lg">
                                <Users className="w-5 h-5 text-violet-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Batch</p>
                                <p className="font-medium text-gray-900">{course.BatchName}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                            <div className="p-2 bg-amber-100 rounded-lg">
                                <BarChart3 className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Semester</p>
                                <p className="font-medium text-gray-900">{course.Semester}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                            <div className="p-2 bg-emerald-100 rounded-lg">
                                <Target className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Course ID</p>
                                <p className="font-medium text-gray-900">{course.CourseOfferingId}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Schedule if available */}
                {(course.StartDate || course.EndDate) && (
                    <div>
                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Schedule</h4>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <Calendar className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Start Date</p>
                                    <p className="font-medium text-gray-900">{formatDate(course.StartDate)}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                <div className="p-2 bg-red-100 rounded-lg">
                                    <Calendar className="w-5 h-5 text-red-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">End Date</p>
                                    <p className="font-medium text-gray-900">{formatDate(course.EndDate)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Faculty Assignments Section - Only for Coordinators */}
                {canManageAssignments && (
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                <Shield className="w-4 h-4" />
                                Faculty Assignments
                            </h4>
                            {!showAddForm && (
                                <button
                                    onClick={() => setShowAddForm(true)}
                                    className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                                >
                                    <UserPlus className="w-4 h-4" />
                                    Add Faculty
                                </button>
                            )}
                        </div>

                        {/* Add Assignment Form */}
                        {showAddForm && (
                            <div className="mb-4 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                                <div className="flex items-end gap-3">
                                    <div className="flex-1">
                                        <label className="block text-xs font-medium text-gray-600 mb-1">
                                            Select Faculty
                                        </label>
                                        <select
                                            value={newAssignment.facultyId}
                                            onChange={(e) => setNewAssignment(prev => ({ ...prev, facultyId: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200"
                                        >
                                            <option value="">Choose a faculty...</option>
                                            {availableFaculty.map(f => (
                                                <option key={f.Id} value={f.Id}>
                                                    {f.FullName} ({f.EmployeeId})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="w-40">
                                        <label className="block text-xs font-medium text-gray-600 mb-1">
                                            Role
                                        </label>
                                        <select
                                            value={newAssignment.role}
                                            onChange={(e) => setNewAssignment(prev => ({ ...prev, role: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200"
                                        >
                                            {ROLE_OPTIONS.map(r => (
                                                <option key={r.value} value={r.value}>{r.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleAddAssignment}
                                            disabled={createMutation.isPending}
                                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                                        >
                                            {createMutation.isPending ? 'Adding...' : 'Add'}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowAddForm(false)
                                                setNewAssignment({ facultyId: '', role: 'Instructor' })
                                            }}
                                            className="px-3 py-2 text-sm font-medium text-gray-600 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Assignments List */}
                        {loadingAssignments ? (
                            <div className="text-center py-4 text-gray-500 text-sm">Loading assignments...</div>
                        ) : assignments.length === 0 ? (
                            <div className="text-center py-6 bg-gray-50 rounded-xl">
                                <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-500">No faculty assigned yet</p>
                                {!showAddForm && (
                                    <button
                                        onClick={() => setShowAddForm(true)}
                                        className="mt-2 text-sm text-indigo-600 hover:text-indigo-700"
                                    >
                                        Add the first faculty member
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {assignments.map(assignment => (
                                    <div
                                        key={assignment.Id}
                                        className="flex items-center justify-between p-3 bg-gray-50 rounded-xl group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-medium">
                                                {assignment.FacultyName?.charAt(0) || 'F'}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium text-gray-900">{assignment.FacultyName}</p>
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeClass(assignment.Role)}`}>
                                                        {assignment.Role || 'Instructor'}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-500">
                                                    {assignment.FacultyEmployeeId} • Assigned {formatDate(assignment.AssignmentDate)}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleRemoveAssignment(assignment.Id)}
                                            disabled={deleteMutation.isPending}
                                            className="p-2 text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-50 rounded-lg transition-all"
                                            title="Remove assignment"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t">
                    <Button variant="outline" className="flex-1" onClick={onClose}>
                        Close
                    </Button>
                </div>
            </div>
        </Modal>
    )
}

// Course Card Component
const CourseCard = ({ course, onViewDetails, onGrades, onAttendance }) => {
    const stats = [
        { icon: GraduationCap, label: 'Students', value: course.EnrolledStudents || 0 },
        { icon: Target, label: 'Avg Score', value: `${course.AverageScore?.toFixed(1) || 0}%` },
        { icon: Calendar, label: 'Attendance', value: `${course.AverageAttendance?.toFixed(0) || 0}%` },
    ]

    return (
        <Card
            className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden border-0 shadow-md cursor-pointer"
            onClick={() => onViewDetails(course)}
        >
            {/* Top colored bar */}
            <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-600" />

            <Card.Body className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <Badge variant="primary" className="mb-2">{course.SubjectCode}</Badge>
                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                            {course.SubjectName}
                        </h3>
                    </div>
                    <div className="p-2.5 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl">
                        <BookOpen className="w-5 h-5 text-blue-600" />
                    </div>
                </div>

                {/* Course Info */}
                <div className="space-y-2 text-sm mb-4">
                    <div className="flex items-center gap-2.5 text-gray-600">
                        <div className="p-1.5 bg-gray-100 rounded-lg">
                            <GraduationCap className="w-4 h-4" />
                        </div>
                        <span>{course.BatchName} • Semester {course.Semester}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-gray-600">
                        <div className="p-1.5 bg-gray-100 rounded-lg">
                            <Calendar className="w-4 h-4" />
                        </div>
                        <span>Academic Year: {course.AcademicYear}</span>
                    </div>
                    {course.IsCoordinator && (
                        <Badge variant="warning" className="text-xs">Course Coordinator</Badge>
                    )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                    {stats.map((stat, idx) => (
                        <div key={idx} className="text-center p-2 bg-gray-50 rounded-xl">
                            <stat.icon className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                            <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                            <p className="text-xs text-gray-500">{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* Pending indicator */}
                {course.PendingGrades > 0 && (
                    <div className="flex items-center gap-2 p-2 bg-orange-50 border border-orange-100 rounded-lg mb-4">
                        <Clock className="w-4 h-4 text-orange-500" />
                        <span className="text-sm text-orange-700 font-medium">
                            {course.PendingGrades} pending grades
                        </span>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={(e) => { e.stopPropagation(); onGrades(course); }}
                    >
                        <ClipboardCheck className="w-4 h-4 mr-1" />
                        Grades
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={(e) => { e.stopPropagation(); onAttendance(course); }}
                    >
                        <Calendar className="w-4 h-4 mr-1" />
                        Attendance
                    </Button>
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); onViewDetails(course); }}
                    >
                        <Eye className="w-4 h-4" />
                    </Button>
                </div>
            </Card.Body>
        </Card>
    )
}

// Course List Row Component
const CourseListRow = ({ course, onViewDetails, onGrades, onAttendance }) => (
    <tr className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => onViewDetails(course)}>
        <td className="px-4 py-4">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                    <p className="font-semibold text-gray-900">{course.SubjectName}</p>
                    <p className="text-sm text-gray-500">{course.SubjectCode}</p>
                </div>
            </div>
        </td>
        <td className="px-4 py-4">
            <span className="text-sm text-gray-600">{course.BatchName}</span>
            <p className="text-xs text-gray-400">Sem {course.Semester}</p>
        </td>
        <td className="px-4 py-4 text-center">
            <span className="font-semibold text-gray-900">{course.EnrolledStudents || 0}</span>
        </td>
        <td className="px-4 py-4 text-center">
            <span className={cn(
                "font-semibold",
                (course.AverageScore || 0) >= 70 ? "text-green-600" :
                    (course.AverageScore || 0) >= 50 ? "text-yellow-600" : "text-red-600"
            )}>
                {course.AverageScore?.toFixed(1) || 0}%
            </span>
        </td>
        <td className="px-4 py-4 text-center">
            <span className={cn(
                "font-semibold",
                (course.AverageAttendance || 0) >= 75 ? "text-green-600" :
                    (course.AverageAttendance || 0) >= 60 ? "text-yellow-600" : "text-red-600"
            )}>
                {course.AverageAttendance?.toFixed(0) || 0}%
            </span>
        </td>
        <td className="px-4 py-4 text-center">
            {course.PendingGrades > 0 ? (
                <Badge variant="warning">{course.PendingGrades}</Badge>
            ) : (
                <Badge variant="success">0</Badge>
            )}
        </td>
        <td className="px-4 py-4">
            <div className="flex items-center justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onGrades(course); }}>
                    <ClipboardCheck className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onAttendance(course); }}>
                    <Calendar className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onViewDetails(course); }}>
                    <Eye className="w-4 h-4" />
                </Button>
            </div>
        </td>
    </tr>
)

const FacultyCoursesPage = () => {
    const navigate = useNavigate()
    const { user } = useAuth()
    const [searchTerm, setSearchTerm] = useState('')
    const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
    const [semesterFilter, setSemesterFilter] = useState('')
    const [selectedCourse, setSelectedCourse] = useState(null)
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
    const debouncedSearch = useDebounce(searchTerm, 300)

    // Fetch faculty dashboard data which includes courses with stats
    const { data: dashboardData, isLoading, refetch } = useQuery({
        queryKey: ['faculty-dashboard-courses'],
        queryFn: () => dashboardService.getMyDashboard(),
    })

    // Extract courses from dashboard
    const courses = useMemo(() => {
        const data = dashboardData?.Data || dashboardData || {}
        return data.CurrentCourses || []
    }, [dashboardData])

    // Get unique semesters for filter
    const semesters = useMemo(() => {
        const uniqueSems = [...new Set(courses.map(c => c.Semester))].filter(Boolean).sort()
        return uniqueSems.map(sem => ({ value: sem.toString(), label: `Semester ${sem}` }))
    }, [courses])

    // Filter courses
    const filteredCourses = useMemo(() => {
        return courses.filter(course => {
            const matchesSearch = !debouncedSearch ||
                course.SubjectName?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                course.SubjectCode?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                course.BatchName?.toLowerCase().includes(debouncedSearch.toLowerCase())

            const matchesSemester = !semesterFilter ||
                course.Semester?.toString() === semesterFilter

            return matchesSearch && matchesSemester
        })
    }, [courses, debouncedSearch, semesterFilter])

    // Stats
    const stats = useMemo(() => ({
        totalCourses: courses.length,
        totalStudents: courses.reduce((sum, c) => sum + (c.EnrolledStudents || 0), 0),
        pendingGrades: courses.reduce((sum, c) => sum + (c.PendingGrades || 0), 0),
        avgAttendance: courses.length > 0
            ? courses.reduce((sum, c) => sum + (c.AverageAttendance || 0), 0) / courses.length
            : 0,
    }), [courses])

    // Handlers
    const handleViewDetails = (course) => {
        setSelectedCourse(course)
        setIsDetailModalOpen(true)
    }

    const handleGrades = (course) => {
        navigate(ROUTES.FACULTY_GRADES, { state: { courseId: course.CourseOfferingId } })
    }

    const handleAttendance = (course) => {
        navigate(ROUTES.FACULTY_ATTENDANCE, { state: { courseId: course.CourseOfferingId } })
    }

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/25">
                            <BookOpen className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent">
                            My Courses
                        </h1>
                    </div>
                    <p className="text-gray-500 ml-14">
                        Manage your assigned courses and track student progress
                    </p>
                </div>
                <Button
                    variant="outline"
                    onClick={() => refetch()}
                    disabled={isLoading}
                >
                    <RefreshCcw className={cn('w-4 h-4 mr-2', isLoading && 'animate-spin')} />
                    Refresh
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50">
                    <Card.Body className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <BookOpen className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalCourses}</p>
                                <p className="text-xs text-gray-500">Active Courses</p>
                            </div>
                        </div>
                    </Card.Body>
                </Card>
                <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-teal-50">
                    <Card.Body className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-100 rounded-lg">
                                <GraduationCap className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
                                <p className="text-xs text-gray-500">Total Students</p>
                            </div>
                        </div>
                    </Card.Body>
                </Card>
                <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-amber-50">
                    <Card.Body className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-100 rounded-lg">
                                <Clock className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{stats.pendingGrades}</p>
                                <p className="text-xs text-gray-500">Pending Grades</p>
                            </div>
                        </div>
                    </Card.Body>
                </Card>
                <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-violet-50">
                    <Card.Body className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <TrendingUp className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{stats.avgAttendance.toFixed(0)}%</p>
                                <p className="text-xs text-gray-500">Avg Attendance</p>
                            </div>
                        </div>
                    </Card.Body>
                </Card>
            </div>

            {/* Filters */}
            <Card className="border-0 shadow-sm">
                <Card.Body className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full sm:w-auto">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search courses..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                />
                            </div>
                            <select
                                value={semesterFilter}
                                onChange={(e) => setSemesterFilter(e.target.value)}
                                className="px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white w-full sm:w-48"
                            >
                                <option value="">All Semesters</option>
                                {semesters.map(sem => (
                                    <option key={sem.value} value={sem.value}>{sem.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">{filteredCourses.length} courses</span>
                            <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={cn(
                                        'p-2 transition-colors',
                                        viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                                    )}
                                >
                                    <LayoutGrid className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={cn(
                                        'p-2 transition-colors',
                                        viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                                    )}
                                >
                                    <List className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </Card.Body>
            </Card>

            {/* Content */}
            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="text-center">
                        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto" />
                        <p className="text-sm text-gray-500 mt-3">Loading your courses...</p>
                    </div>
                </div>
            ) : filteredCourses.length === 0 ? (
                <EmptyState
                    icon={BookOpen}
                    title="No courses found"
                    description={
                        searchTerm || semesterFilter
                            ? 'Try adjusting your search or filters'
                            : 'You have no courses assigned for this academic session'
                    }
                />
            ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredCourses.map((course) => (
                        <CourseCard
                            key={course.Id || course.CourseOfferingId}
                            course={course}
                            onViewDetails={handleViewDetails}
                            onGrades={handleGrades}
                            onAttendance={handleAttendance}
                        />
                    ))}
                </div>
            ) : (
                <Card className="overflow-hidden border-0 shadow-md">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Course
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Batch
                                    </th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Students
                                    </th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Avg Score
                                    </th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Attendance
                                    </th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Pending
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredCourses.map((course) => (
                                    <CourseListRow
                                        key={course.Id || course.CourseOfferingId}
                                        course={course}
                                        onViewDetails={handleViewDetails}
                                        onGrades={handleGrades}
                                        onAttendance={handleAttendance}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            {/* Course Detail Modal */}
            <CourseDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => {
                    setIsDetailModalOpen(false)
                    setSelectedCourse(null)
                }}
                course={selectedCourse}
            />
        </div>
    )
}

export default FacultyCoursesPage
