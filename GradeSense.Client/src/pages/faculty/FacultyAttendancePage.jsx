import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PageHeader } from '@/components/layout'
import { Card, Table, Select, Button, Badge, Input, Modal, EmptyState } from '@/components/common'
import { LoadingInline } from '@/components/common/Spinner'
import { useModal } from '@/hooks'
import { useAuth } from '@/context/AuthContext'
import { facultyAssignmentService } from '@/services/facultyAssignmentService'
import { attendanceService } from '@/services/attendanceService'
import { courseEnrollmentService } from '@/services/courseEnrollmentService'
import { Save, Calendar, Check, X, Clock, Users } from 'lucide-react'
import toast from 'react-hot-toast'

const FacultyAttendancePage = () => {
    const { user } = useAuth()
    const queryClient = useQueryClient()
    const [selectedCourse, setSelectedCourse] = useState('')
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
    const [attendance, setAttendance] = useState({})
    const summaryModal = useModal()

    // Fetch faculty's course assignments
    const { data: assignmentsData, isLoading: loadingAssignments } = useQuery({
        queryKey: ['faculty-assignments-attendance', user?.Id],
        queryFn: () => facultyAssignmentService.getByFaculty(user?.Id),
        enabled: !!user?.Id,
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

    // Extract data from API responses (PascalCase)
    const courseAssignments = assignmentsData?.Data?.Data || assignmentsData?.Data || []
    const enrollments = enrollmentsData?.Data?.Data || enrollmentsData?.Data || []
    const existingAttendance = existingAttendanceData?.Data?.Data || []

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

    // Bulk mark attendance mutation
    const bulkMarkMutation = useMutation({
        mutationFn: (data) => attendanceService.bulkMark(data),
        onSuccess: () => {
            toast.success('Attendance saved successfully')
            queryClient.invalidateQueries(['attendance', selectedCourse, selectedDate])
        },
        onError: (error) => {
            toast.error(error.response?.data?.Message || 'Failed to save attendance')
        },
    })

    // Map enrollments to student list
    const students = enrollments.map(e => ({
        Id: e.StudentId || e.Id,
        StudentId: e.StudentId,
        RollNumber: e.EnrollmentNumber || e.RollNumber,
        Name: e.StudentName || e.Name,
    }))

    const handleAttendanceChange = (studentId, status) => {
        setAttendance((prev) => ({
            ...prev,
            [studentId]: status,
        }))
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
                status: status.charAt(0).toUpperCase() + status.slice(1), // Capitalize for API
            }))

        if (records.length === 0) {
            toast.error('No attendance marked')
            return
        }

        bulkMarkMutation.mutate({
            courseOfferingId: parseInt(selectedCourse),
            date: selectedDate,
            records,
        })
    }

    const getStatusBadge = (studentId) => {
        const status = attendance[studentId]
        if (!status) {
            return <Badge variant="default">Not marked</Badge>
        }
        const variants = {
            present: 'success',
            absent: 'danger',
            late: 'warning',
            excused: 'info',
        }
        return <Badge variant={variants[status]}>{status}</Badge>
    }

    const summaryStats = {
        present: Object.values(attendance).filter((s) => s === 'present').length,
        absent: Object.values(attendance).filter((s) => s === 'absent').length,
        late: Object.values(attendance).filter((s) => s === 'late').length,
        excused: Object.values(attendance).filter((s) => s === 'excused').length,
        notMarked: students.length - Object.values(attendance).filter((s) => s !== null).length,
    }

    // Build course options from assignments
    const courseOptions = courseAssignments.map((a) => ({
        value: a.CourseOfferingId?.toString(),
        label: `${a.SubjectCode || ''} - ${a.SubjectName} (${a.BatchName})`,
    }))

    const columns = [
        {
            header: 'Roll Number',
            accessor: 'RollNumber',
            cell: (row) => (
                <span className="font-mono text-sm">{row.RollNumber}</span>
            ),
        },
        {
            header: 'Student Name',
            accessor: 'Name',
            cell: (row) => (
                <span className="font-medium">{row.Name}</span>
            ),
        },
        {
            header: 'Status',
            cell: (row) => getStatusBadge(row.StudentId || row.Id),
        },
        {
            header: 'Mark Attendance',
            cell: (row) => (
                <div className="flex gap-2">
                    <button
                        onClick={() => handleAttendanceChange(row.StudentId || row.Id, 'present')}
                        className={`p-2 rounded-lg transition-colors ${attendance[row.StudentId || row.Id] === 'present'
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-green-100'
                            }`}
                        title="Present"
                    >
                        <Check className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => handleAttendanceChange(row.StudentId || row.Id, 'absent')}
                        className={`p-2 rounded-lg transition-colors ${attendance[row.StudentId || row.Id] === 'absent'
                            ? 'bg-red-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-red-100'
                            }`}
                        title="Absent"
                    >
                        <X className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => handleAttendanceChange(row.StudentId || row.Id, 'late')}
                        className={`p-2 rounded-lg transition-colors ${attendance[row.StudentId || row.Id] === 'late'
                            ? 'bg-yellow-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-yellow-100'
                            }`}
                        title="Late"
                    >
                        <Clock className="w-4 h-4" />
                    </button>
                </div>
            ),
        },
    ]

    if (loadingAssignments) {
        return <LoadingInline message="Loading courses..." />
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Attendance Management"
                description="Mark and manage student attendance for your courses"
            />

            {/* Filters */}
            <Card className="border-0 shadow-sm">
                <Card.Body>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Select
                            label="Select Course"
                            options={[{ value: '', label: 'Choose a course...' }, ...courseOptions]}
                            value={selectedCourse}
                            onChange={(e) => {
                                setSelectedCourse(e.target.value)
                                setAttendance({})
                            }}
                        />
                        <Input
                            type="date"
                            label="Date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                        />
                        <div className="flex items-end gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleMarkAll('present')}
                                disabled={!selectedCourse || students.length === 0}
                            >
                                Mark All Present
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleMarkAll('absent')}
                                disabled={!selectedCourse || students.length === 0}
                            >
                                Mark All Absent
                            </Button>
                        </div>
                    </div>
                </Card.Body>
            </Card>

            {/* Summary Stats */}
            {selectedCourse && students.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <Card className="border-0 shadow-sm">
                        <Card.Body className="py-3">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-green-600">{summaryStats.present}</p>
                                <p className="text-xs text-gray-500">Present</p>
                            </div>
                        </Card.Body>
                    </Card>
                    <Card className="border-0 shadow-sm">
                        <Card.Body className="py-3">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-red-600">{summaryStats.absent}</p>
                                <p className="text-xs text-gray-500">Absent</p>
                            </div>
                        </Card.Body>
                    </Card>
                    <Card className="border-0 shadow-sm">
                        <Card.Body className="py-3">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-yellow-600">{summaryStats.late}</p>
                                <p className="text-xs text-gray-500">Late</p>
                            </div>
                        </Card.Body>
                    </Card>
                    <Card className="border-0 shadow-sm">
                        <Card.Body className="py-3">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-blue-600">{summaryStats.excused}</p>
                                <p className="text-xs text-gray-500">Excused</p>
                            </div>
                        </Card.Body>
                    </Card>
                    <Card className="border-0 shadow-sm">
                        <Card.Body className="py-3">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-gray-600">{summaryStats.notMarked}</p>
                                <p className="text-xs text-gray-500">Not Marked</p>
                            </div>
                        </Card.Body>
                    </Card>
                </div>
            )}

            {/* Attendance Table */}
            {selectedCourse ? (
                loadingEnrollments || loadingAttendance ? (
                    <LoadingInline message="Loading students..." />
                ) : students.length === 0 ? (
                    <EmptyState
                        icon={Users}
                        title="No students found"
                        description="No students are enrolled in this course"
                    />
                ) : (
                    <Card className="border-0 shadow-sm overflow-hidden">
                        <Card.Header className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                            <div className="flex items-center justify-between">
                                <Card.Title className="flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-blue-600" />
                                    Attendance for {new Date(selectedDate).toLocaleDateString()}
                                </Card.Title>
                                <Button
                                    variant="primary"
                                    size="sm"
                                    leftIcon={<Save className="w-4 h-4" />}
                                    onClick={handleSaveAttendance}
                                    loading={bulkMarkMutation.isPending}
                                >
                                    Save Attendance
                                </Button>
                            </div>
                        </Card.Header>
                        <Table columns={columns} data={students} />
                    </Card>
                )
            ) : (
                <Card className="border-0 shadow-sm">
                    <Card.Body>
                        <div className="text-center py-12">
                            <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-500">
                                Please select a course to mark attendance
                            </p>
                        </div>
                    </Card.Body>
                </Card>
            )}
        </div>
    )
}

export default FacultyAttendancePage
