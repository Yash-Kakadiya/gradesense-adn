import { useState, useEffect, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, Badge, Button, Modal, EmptyState } from '@/components/common'
import { useAuth } from '@/context/AuthContext'
import { useModal } from '@/hooks'
import { facultyAssignmentService } from '@/services/facultyAssignmentService'
import { attendanceService } from '@/services/attendanceService'
import { courseEnrollmentService } from '@/services/courseEnrollmentService'
import { getErrorMessage } from '@/utils/errorHandler'
import { cn } from '@/utils/helpers'
import toast from 'react-hot-toast'
import {
    Save,
    Calendar,
    Check,
    X,
    Clock,
    Users,
    BookOpen,
    Loader2,
    RefreshCcw,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    UserCheck,
    UserX,
    AlertCircle,
    Search,
} from 'lucide-react'

// Attendance Button Component
const AttendanceButton = ({ status, currentStatus, onClick, icon: Icon, label, color }) => (
    <button
        onClick={onClick}
        className={cn(
            "p-2.5 rounded-xl transition-all duration-200 flex items-center justify-center",
            currentStatus === status
                ? `bg-${color}-500 text-white shadow-lg shadow-${color}-500/25 scale-105`
                : `bg-gray-100 text-gray-600 hover:bg-${color}-50 hover:text-${color}-600`
        )}
        title={label}
    >
        <Icon className="w-5 h-5" />
    </button>
)

// Student Attendance Row
const StudentAttendanceRow = ({ student, status, onStatusChange, index }) => {
    const getStatusBadge = () => {
        if (!status) return <Badge variant="secondary">Not marked</Badge>
        const variants = {
            present: 'success',
            absent: 'danger',
            late: 'warning',
            excused: 'info',
        }
        return <Badge variant={variants[status]}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>
    }

    return (
        <tr className={cn(
            "hover:bg-gray-50 transition-colors",
            index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
        )}>
            <td className="px-4 py-3 text-sm text-gray-500">{index + 1}</td>
            <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "w-9 h-9 rounded-full flex items-center justify-center",
                        status === 'present' ? "bg-green-100" :
                            status === 'absent' ? "bg-red-100" :
                                status === 'late' ? "bg-yellow-100" : "bg-gray-100"
                    )}>
                        <span className={cn(
                            "font-medium text-sm",
                            status === 'present' ? "text-green-600" :
                                status === 'absent' ? "text-red-600" :
                                    status === 'late' ? "text-yellow-600" : "text-gray-600"
                        )}>
                            {student.Name?.charAt(0) || 'S'}
                        </span>
                    </div>
                    <div>
                        <p className="font-medium text-gray-900">{student.Name}</p>
                        <p className="text-xs text-gray-500 font-mono">{student.RollNumber}</p>
                    </div>
                </div>
            </td>
            <td className="px-4 py-3 text-center">
                {getStatusBadge()}
            </td>
            <td className="px-4 py-3">
                <div className="flex items-center justify-center gap-2">
                    <button
                        onClick={() => onStatusChange('present')}
                        className={cn(
                            "p-2 rounded-lg transition-all",
                            status === 'present'
                                ? "bg-green-500 text-white shadow-md"
                                : "bg-gray-100 text-gray-600 hover:bg-green-100 hover:text-green-600"
                        )}
                        title="Present"
                    >
                        <Check className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onStatusChange('absent')}
                        className={cn(
                            "p-2 rounded-lg transition-all",
                            status === 'absent'
                                ? "bg-red-500 text-white shadow-md"
                                : "bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600"
                        )}
                        title="Absent"
                    >
                        <X className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onStatusChange('late')}
                        className={cn(
                            "p-2 rounded-lg transition-all",
                            status === 'late'
                                ? "bg-yellow-500 text-white shadow-md"
                                : "bg-gray-100 text-gray-600 hover:bg-yellow-100 hover:text-yellow-600"
                        )}
                        title="Late"
                    >
                        <Clock className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onStatusChange('excused')}
                        className={cn(
                            "p-2 rounded-lg transition-all",
                            status === 'excused'
                                ? "bg-blue-500 text-white shadow-md"
                                : "bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-600"
                        )}
                        title="Excused"
                    >
                        <AlertCircle className="w-4 h-4" />
                    </button>
                </div>
            </td>
        </tr>
    )
}

const FacultyAttendancePage = () => {
    const location = useLocation()
    const { user } = useAuth()
    const queryClient = useQueryClient()
    const [selectedCourse, setSelectedCourse] = useState(location.state?.courseId?.toString() || '')
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
    const [attendance, setAttendance] = useState({})
    const [searchTerm, setSearchTerm] = useState('')

    // Fetch faculty's course assignments
    const { data: assignmentsData, isLoading: loadingAssignments, refetch } = useQuery({
        queryKey: ['faculty-assignments-attendance', user?.id],
        queryFn: () => facultyAssignmentService.getByFaculty(user?.id),
        enabled: !!user?.id,
    })

    // Fetch enrolled students for selected course
    const { data: enrollmentsData, isLoading: loadingEnrollments } = useQuery({
        queryKey: ['course-enrollments-attendance', selectedCourse],
        queryFn: () => courseEnrollmentService.getByCourseOffering(selectedCourse),
        enabled: !!selectedCourse,
    })

    // Fetch existing attendance for the selected date and course
    const { data: existingAttendanceData, isLoading: loadingAttendance } = useQuery({
        queryKey: ['attendance', selectedCourse, selectedDate],
        queryFn: () => attendanceService.getAll({
            courseOfferingId: selectedCourse,
            date: selectedDate,
            pageSize: 1000,
        }),
        enabled: !!selectedCourse && !!selectedDate,
    })

    // Extract data
    const courseAssignments = useMemo(() =>
        assignmentsData?.Data?.Data || assignmentsData?.Data || [],
        [assignmentsData])

    const enrollments = useMemo(() =>
        enrollmentsData?.Data?.Data || enrollmentsData?.Data || [],
        [enrollmentsData])

    const existingAttendance = useMemo(() =>
        existingAttendanceData?.Data?.Data || existingAttendanceData?.Data || [],
        [existingAttendanceData])

    // Selected course details
    const selectedCourseDetails = useMemo(() =>
        courseAssignments.find(a => a.CourseOfferingId?.toString() === selectedCourse),
        [courseAssignments, selectedCourse])

    // Initialize attendance from existing records
    useEffect(() => {
        if (existingAttendance.length > 0) {
            const initialAttendance = {}
            existingAttendance.forEach(record => {
                initialAttendance[record.StudentId] = record.Status?.toLowerCase() || null
            })
            setAttendance(initialAttendance)
        } else {
            setAttendance({})
        }
    }, [existingAttendance])

    // Bulk mark mutation
    const bulkMarkMutation = useMutation({
        mutationFn: (data) => attendanceService.bulkMark(data),
        onSuccess: () => {
            toast.success('Attendance saved successfully')
            queryClient.invalidateQueries(['attendance', selectedCourse, selectedDate])
        },
        onError: (error) => {
            toast.error(getErrorMessage(error))
        },
    })

    // Students list
    const students = useMemo(() => enrollments.map(e => ({
        Id: e.StudentId || e.Id,
        StudentId: e.StudentId,
        RollNumber: e.EnrollmentNumber || e.RollNumber,
        Name: e.StudentName || e.Name,
    })), [enrollments])

    // Filtered students
    const filteredStudents = useMemo(() => students.filter(
        s => s.Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.RollNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    ), [students, searchTerm])

    const handleAttendanceChange = (studentId, status) => {
        setAttendance((prev) => ({ ...prev, [studentId]: status }))
    }

    const handleMarkAll = (status) => {
        const newAttendance = {}
        students.forEach((student) => {
            newAttendance[student.StudentId || student.Id] = status
        })
        setAttendance(newAttendance)
        toast.success(`All students marked as ${status}`)
    }

    const handleSaveAttendance = () => {
        if (!selectedCourse) {
            toast.error('Please select a course')
            return
        }

        const records = Object.entries(attendance)
            .filter(([_, status]) => status !== null)
            .map(([studentId, status]) => ({
                studentId: parseInt(studentId),
                status: status.charAt(0).toUpperCase() + status.slice(1),
            }))

        if (records.length === 0) {
            toast.error('No attendance marked')
            return
        }

        bulkMarkMutation.mutate({
            courseOfferingId: parseInt(selectedCourse),
            date: selectedDate,
            markedById: user?.id,
            records,
        })
    }

    const navigateDate = (direction) => {
        const date = new Date(selectedDate)
        date.setDate(date.getDate() + direction)
        setSelectedDate(date.toISOString().split('T')[0])
    }

    // Stats
    const stats = useMemo(() => ({
        present: Object.values(attendance).filter((s) => s === 'present').length,
        absent: Object.values(attendance).filter((s) => s === 'absent').length,
        late: Object.values(attendance).filter((s) => s === 'late').length,
        excused: Object.values(attendance).filter((s) => s === 'excused').length,
        notMarked: students.length - Object.values(attendance).filter((s) => s !== null).length,
        total: students.length,
    }), [attendance, students])

    // Course options
    const courseOptions = courseAssignments.map((a) => ({
        value: a.CourseOfferingId?.toString(),
        label: `${a.SubjectCode || ''} - ${a.SubjectName}`,
        batch: a.BatchName,
    }))

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl shadow-lg shadow-teal-500/25">
                            <Calendar className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent">
                            Attendance
                        </h1>
                    </div>
                    <p className="text-gray-500 ml-14">
                        Mark and manage student attendance for your courses
                    </p>
                </div>
                <Button
                    variant="outline"
                    onClick={() => refetch()}
                    disabled={loadingAssignments}
                >
                    <RefreshCcw className={cn('w-4 h-4 mr-2', loadingAssignments && 'animate-spin')} />
                    Refresh
                </Button>
            </div>

            {/* Selection Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Course Selection */}
                <Card className="border-0 shadow-md overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-600" />
                    <Card.Body className="p-5">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <BookOpen className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Select Course</h3>
                                <p className="text-xs text-gray-500">Choose a course to mark attendance</p>
                            </div>
                        </div>
                        <div className="relative">
                            <select
                                value={selectedCourse}
                                onChange={(e) => {
                                    setSelectedCourse(e.target.value)
                                    setAttendance({})
                                }}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white cursor-pointer"
                                disabled={loadingAssignments}
                            >
                                <option value="">Choose a course...</option>
                                {courseOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label} ({opt.batch})
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                        {selectedCourseDetails && (
                            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                                <p className="text-sm text-blue-700">
                                    <strong>{selectedCourseDetails.SubjectName}</strong> • {selectedCourseDetails.BatchName}
                                </p>
                            </div>
                        )}
                    </Card.Body>
                </Card>

                {/* Date Selection */}
                <Card className="border-0 shadow-md overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-teal-500 to-emerald-600" />
                    <Card.Body className="p-5">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-teal-100 rounded-lg">
                                <Calendar className="w-5 h-5 text-teal-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Select Date</h3>
                                <p className="text-xs text-gray-500">Choose the date for attendance</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => navigateDate(-1)}
                                className="p-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5 text-gray-600" />
                            </button>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent text-center"
                            />
                            <button
                                onClick={() => navigateDate(1)}
                                className="p-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                            >
                                <ChevronRight className="w-5 h-5 text-gray-600" />
                            </button>
                        </div>
                        <div className="mt-3 p-3 bg-teal-50 rounded-lg text-center">
                            <p className="text-sm text-teal-700 font-medium">
                                {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                        </div>
                    </Card.Body>
                </Card>
            </div>

            {/* Stats (when course is selected) */}
            {selectedCourse && students.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                    <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50">
                        <Card.Body className="p-3 text-center">
                            <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
                            <p className="text-xs text-gray-500">Total</p>
                        </Card.Body>
                    </Card>
                    <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-emerald-50">
                        <Card.Body className="p-3 text-center">
                            <p className="text-2xl font-bold text-green-600">{stats.present}</p>
                            <p className="text-xs text-gray-500">Present</p>
                        </Card.Body>
                    </Card>
                    <Card className="border-0 shadow-sm bg-gradient-to-br from-red-50 to-rose-50">
                        <Card.Body className="p-3 text-center">
                            <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
                            <p className="text-xs text-gray-500">Absent</p>
                        </Card.Body>
                    </Card>
                    <Card className="border-0 shadow-sm bg-gradient-to-br from-yellow-50 to-amber-50">
                        <Card.Body className="p-3 text-center">
                            <p className="text-2xl font-bold text-yellow-600">{stats.late}</p>
                            <p className="text-xs text-gray-500">Late</p>
                        </Card.Body>
                    </Card>
                    <Card className="border-0 shadow-sm bg-gradient-to-br from-cyan-50 to-sky-50">
                        <Card.Body className="p-3 text-center">
                            <p className="text-2xl font-bold text-cyan-600">{stats.excused}</p>
                            <p className="text-xs text-gray-500">Excused</p>
                        </Card.Body>
                    </Card>
                    <Card className="border-0 shadow-sm bg-gradient-to-br from-gray-50 to-slate-100">
                        <Card.Body className="p-3 text-center">
                            <p className="text-2xl font-bold text-gray-600">{stats.notMarked}</p>
                            <p className="text-xs text-gray-500">Pending</p>
                        </Card.Body>
                    </Card>
                </div>
            )}

            {/* Attendance Table */}
            {selectedCourse ? (
                loadingEnrollments || loadingAttendance ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="text-center">
                            <Loader2 className="w-10 h-10 animate-spin text-teal-600 mx-auto" />
                            <p className="text-sm text-gray-500 mt-3">Loading students...</p>
                        </div>
                    </div>
                ) : students.length === 0 ? (
                    <EmptyState
                        icon={Users}
                        title="No students found"
                        description="No students are enrolled in this course"
                    />
                ) : (
                    <Card className="border-0 shadow-md overflow-hidden">
                        {/* Card Header */}
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 px-5 py-4">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <Calendar className="w-5 h-5 text-gray-600" />
                                    <h3 className="font-semibold text-gray-900">
                                        Attendance for {new Date(selectedDate).toLocaleDateString()}
                                    </h3>
                                    <Badge variant="secondary">{filteredStudents.length} students</Badge>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    {/* Search */}
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            placeholder="Search..."
                                            className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent w-40"
                                        />
                                    </div>
                                    {/* Quick Actions */}
                                    <Button variant="outline" size="sm" onClick={() => handleMarkAll('present')}>
                                        <UserCheck className="w-4 h-4 mr-2 text-green-600" />
                                        All Present
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => handleMarkAll('absent')}>
                                        <UserX className="w-4 h-4 mr-2 text-red-600" />
                                        All Absent
                                    </Button>
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        onClick={handleSaveAttendance}
                                        disabled={bulkMarkMutation.isPending}
                                    >
                                        {bulkMarkMutation.isPending ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4 mr-2" />
                                                Save
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase w-12">#</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Student</th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Status</th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Mark</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredStudents.map((student, index) => (
                                        <StudentAttendanceRow
                                            key={student.StudentId || student.Id}
                                            student={student}
                                            status={attendance[student.StudentId || student.Id]}
                                            onStatusChange={(status) => handleAttendanceChange(student.StudentId || student.Id, status)}
                                            index={index}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )
            ) : (
                <Card className="border-0 shadow-md">
                    <Card.Body className="py-16">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Calendar className="w-8 h-8 text-teal-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Course</h3>
                            <p className="text-gray-500 max-w-md mx-auto">
                                Please select a course from the options above to start marking attendance
                            </p>
                        </div>
                    </Card.Body>
                </Card>
            )}
        </div>
    )
}

export default FacultyAttendancePage
