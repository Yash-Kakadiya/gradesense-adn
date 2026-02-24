import { useState, useEffect, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, Badge, Button, Modal, EmptyState } from '@/components/common'
import { useAuth } from '@/context/AuthContext'
import { useDebounce, useModal } from '@/hooks'
import { facultyAssignmentService } from '@/services/facultyAssignmentService'
import { assessmentItemService } from '@/services/evaluationService'
import { studentMarkService } from '@/services/studentMarkService'
import { courseEnrollmentService } from '@/services/courseEnrollmentService'
import { getErrorMessage } from '@/utils/errorHandler'
import { cn } from '@/utils/helpers'
import toast from 'react-hot-toast'
import {
    Save,
    Download,
    Upload,
    FileSpreadsheet,
    BookOpen,
    GraduationCap,
    Search,
    Loader2,
    CheckCircle,
    Clock,
    AlertCircle,
    Target,
    Users,
    ClipboardCheck,
    RefreshCcw,
    ChevronDown,
} from 'lucide-react'

// Grade Input Component
const GradeInput = ({ value, onChange, maxMarks, isGraded }) => {
    const handleChange = (e) => {
        const val = e.target.value
        // Allow empty string for clearing
        if (val === '') {
            onChange('')
            return
        }
        const numVal = parseFloat(val)
        // Validate range
        if (!isNaN(numVal) && numVal >= 0 && numVal <= maxMarks) {
            onChange(val)
        } else if (!isNaN(numVal) && numVal > maxMarks) {
            // Cap at max marks
            onChange(maxMarks.toString())
        } else if (!isNaN(numVal) && numVal < 0) {
            onChange('0')
        }
    }

    return (
        <div className="relative">
            <input
                type="number"
                min="0"
                max={maxMarks}
                step="0.5"
                placeholder={`0-${maxMarks}`}
                value={value}
                onChange={handleChange}
                className={cn(
                    "w-24 px-3 py-2 text-center border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all",
                    isGraded ? "border-green-200 bg-green-50" : "border-gray-200"
                )}
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">/{maxMarks}</span>
        </div>
    )
}

// Student Grade Row
const StudentGradeRow = ({ student, grade, maxMarks, onChange, index }) => {
    const isGraded = student.CurrentGrade !== null
    const percentage = grade ? ((parseFloat(grade) / maxMarks) * 100).toFixed(0) : null

    return (
        <tr className={cn(
            "hover:bg-gray-50 transition-colors",
            index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
        )}>
            <td className="px-4 py-3">
                <span className="text-sm text-gray-500">{index + 1}</span>
            </td>
            <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                        <span className="text-white text-xs font-medium">
                            {student.StudentName?.charAt(0) || 'S'}
                        </span>
                    </div>
                    <div>
                        <p className="font-medium text-gray-900">{student.StudentName}</p>
                        <p className="text-xs text-gray-500 font-mono">{student.EnrollmentNumber}</p>
                    </div>
                </div>
            </td>
            <td className="px-4 py-3 text-center">
                {isGraded ? (
                    <Badge variant="success" className="font-mono">
                        {student.CurrentGrade}/{maxMarks}
                    </Badge>
                ) : (
                    <Badge variant="warning">Not graded</Badge>
                )}
            </td>
            <td className="px-4 py-3 text-center">
                <GradeInput
                    value={grade}
                    onChange={onChange}
                    maxMarks={maxMarks}
                    isGraded={isGraded}
                />
            </td>
            <td className="px-4 py-3 text-center">
                {percentage && (
                    <span className={cn(
                        "font-semibold",
                        parseInt(percentage) >= 70 ? "text-green-600" :
                            parseInt(percentage) >= 50 ? "text-yellow-600" : "text-red-600"
                    )}>
                        {percentage}%
                    </span>
                )}
            </td>
        </tr>
    )
}

const FacultyGradesPage = () => {
    const location = useLocation()
    const { user } = useAuth()
    const queryClient = useQueryClient()
    const [selectedCourse, setSelectedCourse] = useState(location.state?.courseId?.toString() || '')
    const [selectedAssessment, setSelectedAssessment] = useState('')
    const [searchTerm, setSearchTerm] = useState('')
    const [grades, setGrades] = useState({})
    const debouncedSearch = useDebounce(searchTerm, 300)
    const bulkUploadModal = useModal()

    // Fetch faculty's course assignments
    const { data: assignmentsData, isLoading: loadingAssignments, refetch: refetchAssignments } = useQuery({
        queryKey: ['faculty-assignments-grades', user?.id],
        queryFn: () => facultyAssignmentService.getByFaculty(user?.id),
        enabled: !!user?.id,
    })

    // Fetch assessment items for selected course
    const { data: assessmentsData, isLoading: loadingAssessments } = useQuery({
        queryKey: ['assessments-for-course', selectedCourse],
        queryFn: () => assessmentItemService.getAll({ courseOfferingId: selectedCourse, pageSize: 100 }),
        enabled: !!selectedCourse,
    })

    // Fetch enrolled students for selected course
    const { data: enrollmentsData, isLoading: loadingEnrollments } = useQuery({
        queryKey: ['course-enrollments-grades', selectedCourse],
        queryFn: () => courseEnrollmentService.getByCourseOffering(selectedCourse),
        enabled: !!selectedCourse,
    })

    // Fetch existing marks for the selected assessment
    const { data: marksData, isLoading: loadingMarks } = useQuery({
        queryKey: ['marks-for-assessment', selectedAssessment],
        queryFn: () => studentMarkService.getAll({ assessmentItemId: selectedAssessment, pageSize: 1000 }),
        enabled: !!selectedAssessment,
    })

    // Extract data
    const courseAssignments = useMemo(() =>
        assignmentsData?.Data?.Data || assignmentsData?.Data || [],
        [assignmentsData])

    const assessments = useMemo(() =>
        assessmentsData?.Data?.Data || assessmentsData?.Data || [],
        [assessmentsData])

    const enrollments = useMemo(() =>
        enrollmentsData?.Data?.Data || enrollmentsData?.Data || [],
        [enrollmentsData])

    const existingMarks = useMemo(() =>
        marksData?.Data?.Data || marksData?.Data || [],
        [marksData])

    // Get selected assessment details
    const selectedAssessmentDetails = useMemo(() =>
        assessments.find(a => a.Id?.toString() === selectedAssessment),
        [assessments, selectedAssessment])

    // Get selected course details
    const selectedCourseDetails = useMemo(() =>
        courseAssignments.find(a => a.CourseOfferingId?.toString() === selectedCourse),
        [courseAssignments, selectedCourse])

    // Initialize grades from existing marks
    useEffect(() => {
        if (existingMarks.length > 0) {
            const initialGrades = {}
            existingMarks.forEach(mark => {
                initialGrades[mark.StudentId || mark.Id] = mark.ObtainedMarks?.toString() || ''
            })
            setGrades(initialGrades)
        } else {
            setGrades({})
        }
    }, [existingMarks])

    // Bulk save mutation
    const bulkSaveMutation = useMutation({
        mutationFn: (data) => studentMarkService.bulkEntry(data),
        onSuccess: () => {
            toast.success('Grades saved successfully')
            queryClient.invalidateQueries(['marks-for-assessment', selectedAssessment])
        },
        onError: (error) => {
            toast.error(getErrorMessage(error))
        },
    })

    const handleGradeChange = (studentId, value) => {
        setGrades((prev) => ({ ...prev, [studentId]: value }))
    }

    const handleSaveGrades = () => {
        if (!selectedCourse || !selectedAssessment) {
            toast.error('Please select a course and assessment')
            return
        }

        const maxMarks = selectedAssessmentDetails?.MaxMarks || 100
        const marksEntries = Object.entries(grades)
            .filter(([_, value]) => value !== '')
            .map(([studentId, marksObtained]) => ({
                studentId: parseInt(studentId),
                marksObtained: parseFloat(marksObtained),
            }))

        if (marksEntries.length === 0) {
            toast.error('No grades to save')
            return
        }

        // Validate marks are within range
        const invalidMarks = marksEntries.filter(m => m.marksObtained < 0 || m.marksObtained > maxMarks)
        if (invalidMarks.length > 0) {
            toast.error(`Marks must be between 0 and ${maxMarks}`)
            return
        }

        bulkSaveMutation.mutate({
            assessmentItemId: parseInt(selectedAssessment),
            graderId: user?.id,
            marks: marksEntries,
        })
    }

    const handleExport = () => {
        const headers = ['Roll Number', 'Student Name', 'Marks', 'Max Marks']
        const rows = filteredStudents.map(s => [
            s.EnrollmentNumber || '',
            s.StudentName || '',
            grades[s.StudentId || s.Id] || '',
            selectedAssessmentDetails?.MaxMarks || ''
        ])

        const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')
        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `grades_${selectedAssessmentDetails?.Name || 'export'}.csv`
        a.click()
        toast.success('Grade sheet exported successfully')
    }

    // Map enrollments to students
    const students = useMemo(() => enrollments.map(e => ({
        Id: e.StudentId || e.Id,
        StudentId: e.StudentId,
        EnrollmentNumber: e.EnrollmentNumber || e.RollNumber,
        StudentName: e.StudentName || e.Name,
        CurrentGrade: existingMarks.find(m => m.StudentId === (e.StudentId || e.Id))?.ObtainedMarks || null,
    })), [enrollments, existingMarks])

    const filteredStudents = useMemo(() => students.filter(
        (student) =>
            (student.StudentName || '').toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            (student.EnrollmentNumber || '').toLowerCase().includes(debouncedSearch.toLowerCase())
    ), [students, debouncedSearch])

    // Stats
    const stats = useMemo(() => {
        const graded = Object.values(grades).filter(g => g !== '').length
        const total = students.length
        const avgScore = graded > 0
            ? Object.values(grades).filter(g => g !== '').reduce((sum, g) => sum + parseFloat(g), 0) / graded
            : 0
        const maxMarks = selectedAssessmentDetails?.MaxMarks || 100
        return { graded, total, avgScore, maxMarks }
    }, [grades, students, selectedAssessmentDetails])

    // Course and assessment options
    const courseOptions = courseAssignments.map((a) => ({
        value: a.CourseOfferingId?.toString(),
        label: `${a.SubjectCode || ''} - ${a.SubjectName}`,
        batch: a.BatchName,
    }))

    const assessmentOptions = assessments.map((a) => ({
        value: a.Id?.toString(),
        label: a.Name,
        maxMarks: a.MaxMarks,
        type: a.CalculationType,
    }))

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/25">
                            <ClipboardCheck className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent">
                            Grade Entry
                        </h1>
                    </div>
                    <p className="text-gray-500 ml-14">
                        Enter and manage student grades for your courses
                    </p>
                </div>
                <Button
                    variant="outline"
                    onClick={() => refetchAssignments()}
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
                                <p className="text-xs text-gray-500">Choose a course to enter grades</p>
                            </div>
                        </div>
                        <div className="relative">
                            <select
                                value={selectedCourse}
                                onChange={(e) => {
                                    setSelectedCourse(e.target.value)
                                    setSelectedAssessment('')
                                    setGrades({})
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
                                    <strong>{selectedCourseDetails.SubjectName}</strong> • {selectedCourseDetails.BatchName} • Semester {selectedCourseDetails.Semester}
                                </p>
                            </div>
                        )}
                    </Card.Body>
                </Card>

                {/* Assessment Selection */}
                <Card className="border-0 shadow-md overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-violet-500 to-purple-600" />
                    <Card.Body className="p-5">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-violet-100 rounded-lg">
                                <Target className="w-5 h-5 text-violet-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Select Assessment</h3>
                                <p className="text-xs text-gray-500">Choose an assessment to grade</p>
                            </div>
                        </div>
                        <div className="relative">
                            <select
                                value={selectedAssessment}
                                onChange={(e) => {
                                    setSelectedAssessment(e.target.value)
                                    setGrades({})
                                }}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent appearance-none bg-white cursor-pointer disabled:bg-gray-50 disabled:cursor-not-allowed"
                                disabled={!selectedCourse || loadingAssessments}
                            >
                                <option value="">Choose an assessment...</option>
                                {assessmentOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label} ({opt.maxMarks} marks)
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                        {selectedAssessmentDetails && (
                            <div className="mt-3 p-3 bg-violet-50 rounded-lg flex items-center justify-between">
                                <p className="text-sm text-violet-700">
                                    <strong>{selectedAssessmentDetails.Name}</strong> • {selectedAssessmentDetails.CalculationType}
                                </p>
                                <Badge variant="primary">Max: {selectedAssessmentDetails.MaxMarks}</Badge>
                            </div>
                        )}
                    </Card.Body>
                </Card>
            </div>

            {/* Stats (only show when assessment is selected) */}
            {selectedAssessment && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50">
                        <Card.Body className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Users className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                                    <p className="text-xs text-gray-500">Total Students</p>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                    <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-teal-50">
                        <Card.Body className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-100 rounded-lg">
                                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">{stats.graded}</p>
                                    <p className="text-xs text-gray-500">Graded</p>
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
                                    <p className="text-2xl font-bold text-gray-900">{stats.total - stats.graded}</p>
                                    <p className="text-xs text-gray-500">Pending</p>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                    <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-violet-50">
                        <Card.Body className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <Target className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {stats.graded > 0 ? `${((stats.avgScore / stats.maxMarks) * 100).toFixed(0)}%` : '-'}
                                    </p>
                                    <p className="text-xs text-gray-500">Avg Score</p>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </div>
            )}

            {/* Grade Entry Table */}
            {selectedCourse && selectedAssessment ? (
                loadingEnrollments || loadingMarks ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="text-center">
                            <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto" />
                            <p className="text-sm text-gray-500 mt-3">Loading students...</p>
                        </div>
                    </div>
                ) : filteredStudents.length === 0 ? (
                    <EmptyState
                        icon={GraduationCap}
                        title="No students found"
                        description="No students are enrolled in this course"
                    />
                ) : (
                    <Card className="border-0 shadow-md overflow-hidden">
                        {/* Card Header */}
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 px-5 py-4">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <FileSpreadsheet className="w-5 h-5 text-gray-600" />
                                    <h3 className="font-semibold text-gray-900">Student Grades</h3>
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
                                            className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent w-40"
                                        />
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={bulkUploadModal.open}
                                    >
                                        <Upload className="w-4 h-4 mr-2" />
                                        Import
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleExport}
                                    >
                                        <Download className="w-4 h-4 mr-2" />
                                        Export
                                    </Button>
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        onClick={handleSaveGrades}
                                        disabled={bulkSaveMutation.isPending}
                                    >
                                        {bulkSaveMutation.isPending ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4 mr-2" />
                                                Save Grades
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
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Current</th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Enter Grade</th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">%</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredStudents.map((student, index) => (
                                        <StudentGradeRow
                                            key={student.StudentId || student.Id}
                                            student={student}
                                            grade={grades[student.StudentId || student.Id] || ''}
                                            maxMarks={selectedAssessmentDetails?.MaxMarks || 100}
                                            onChange={(value) => handleGradeChange(student.StudentId || student.Id, value)}
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
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FileSpreadsheet className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Select Course and Assessment</h3>
                            <p className="text-gray-500 max-w-md mx-auto">
                                Please select a course and assessment from the options above to start entering grades
                            </p>
                        </div>
                    </Card.Body>
                </Card>
            )}

            {/* Bulk Upload Modal */}
            <Modal
                isOpen={bulkUploadModal.isOpen}
                onClose={bulkUploadModal.close}
                title="Import Grades"
                size="md"
            >
                <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                        Upload a CSV file with student roll numbers and their grades.
                    </p>

                    {/* Download Template */}
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                        <p className="text-sm text-blue-700 mb-2">
                            <strong>Format:</strong> Roll Number, Marks
                        </p>
                        <Button variant="outline" size="sm" onClick={handleExport}>
                            <Download className="w-4 h-4 mr-2" />
                            Download Template
                        </Button>
                    </div>

                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors cursor-pointer">
                        <input
                            type="file"
                            accept=".csv,.xlsx"
                            className="hidden"
                            id="grade-upload"
                        />
                        <label htmlFor="grade-upload" className="cursor-pointer flex flex-col items-center">
                            <div className="p-3 bg-gray-100 rounded-full mb-3">
                                <Upload className="w-6 h-6 text-gray-500" />
                            </div>
                            <span className="text-sm font-medium text-gray-700">
                                Click to upload or drag and drop
                            </span>
                            <span className="text-xs text-gray-500 mt-1">
                                CSV or XLSX files only
                            </span>
                        </label>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button variant="outline" onClick={bulkUploadModal.close}>Cancel</Button>
                        <Button variant="primary" onClick={() => toast.success('Import feature coming soon')}>
                            <Upload className="w-4 h-4 mr-2" />
                            Import
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}

export default FacultyGradesPage
