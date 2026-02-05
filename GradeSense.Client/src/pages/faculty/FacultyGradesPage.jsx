import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PageHeader } from '@/components/layout'
import { Card, Table, Select, Button, Badge, SearchInput, Modal, Input, EmptyState } from '@/components/common'
import { LoadingInline } from '@/components/common/Spinner'
import { useDebounce, useModal } from '@/hooks'
import { useAuth } from '@/context/AuthContext'
import { facultyAssignmentService } from '@/services/facultyAssignmentService'
import { assessmentItemService } from '@/services/evaluationService'
import { studentMarkService } from '@/services/studentMarkService'
import { courseEnrollmentService } from '@/services/courseEnrollmentService'
import { Save, Download, Upload, FileSpreadsheet, BookOpen } from 'lucide-react'
import toast from 'react-hot-toast'

const FacultyGradesPage = () => {
    const { user } = useAuth()
    const queryClient = useQueryClient()
    const [selectedCourse, setSelectedCourse] = useState('')
    const [selectedAssessment, setSelectedAssessment] = useState('')
    const [searchTerm, setSearchTerm] = useState('')
    const [grades, setGrades] = useState({})
    const debouncedSearch = useDebounce(searchTerm, 300)
    const bulkUploadModal = useModal()

    // Fetch faculty's course assignments
    const { data: assignmentsData, isLoading: loadingAssignments } = useQuery({
        queryKey: ['faculty-assignments-grades', user?.Id],
        queryFn: () => facultyAssignmentService.getByFaculty(user?.Id),
        enabled: !!user?.Id,
    })

    // Fetch assessment items for selected course
    const { data: assessmentsData, isLoading: loadingAssessments } = useQuery({
        queryKey: ['assessments-for-course', selectedCourse],
        queryFn: () => assessmentItemService.getAll({ courseOfferingId: selectedCourse, pageSize: 100 }),
        enabled: !!selectedCourse,
    })

    // Fetch enrolled students for selected course
    const { data: enrollmentsData, isLoading: loadingEnrollments } = useQuery({
        queryKey: ['course-enrollments', selectedCourse],
        queryFn: () => courseEnrollmentService.getByCourseOffering(selectedCourse),
        enabled: !!selectedCourse,
    })

    // Fetch existing marks for the selected assessment
    const { data: marksData, isLoading: loadingMarks } = useQuery({
        queryKey: ['marks-for-assessment', selectedAssessment],
        queryFn: () => studentMarkService.getAll({ assessmentItemId: selectedAssessment, pageSize: 1000 }),
        enabled: !!selectedAssessment,
    })

    // Extract data from API responses (PascalCase)
    const courseAssignments = assignmentsData?.Data?.Data || assignmentsData?.Data || []
    const assessments = assessmentsData?.Data?.Data || []
    const enrollments = enrollmentsData?.Data?.Data || enrollmentsData?.Data || []
    const existingMarks = marksData?.Data?.Data || []

    // Get the selected assessment details for max marks
    const selectedAssessmentDetails = assessments.find(a => a.Id?.toString() === selectedAssessment)

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
            toast.error(error.response?.data?.Message || 'Failed to save grades')
        },
    })

    const handleGradeChange = (studentId, value) => {
        setGrades((prev) => ({
            ...prev,
            [studentId]: value,
        }))
    }

    const handleSaveGrades = () => {
        if (!selectedCourse || !selectedAssessment) {
            toast.error('Please select a course and assessment')
            return
        }

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

        bulkSaveMutation.mutate({
            assessmentItemId: parseInt(selectedAssessment),
            marks: marksEntries,
        })
    }

    const handleExport = () => {
        // Generate CSV content
        const headers = ['Roll Number', 'Student Name', 'Marks']
        const rows = filteredStudents.map(s => [
            s.EnrollmentNumber || s.RollNumber || '',
            s.StudentName || s.Name || '',
            grades[s.StudentId || s.Id] || ''
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

    const handleBulkUpload = () => {
        toast.success('Bulk upload feature coming soon')
        bulkUploadModal.close()
    }

    // Map enrollments to student list format
    const students = enrollments.map(e => ({
        Id: e.StudentId || e.Id,
        StudentId: e.StudentId,
        EnrollmentNumber: e.EnrollmentNumber || e.RollNumber,
        StudentName: e.StudentName || e.Name,
        CurrentGrade: existingMarks.find(m => m.StudentId === (e.StudentId || e.Id))?.ObtainedMarks || null,
    }))

    const filteredStudents = students.filter(
        (student) =>
            (student.StudentName || '').toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            (student.EnrollmentNumber || '').toLowerCase().includes(debouncedSearch.toLowerCase())
    )

    // Build course options from assignments
    const courseOptions = courseAssignments.map((a) => ({
        value: a.CourseOfferingId?.toString(),
        label: `${a.SubjectCode || ''} - ${a.SubjectName} (${a.BatchName})`,
    }))

    // Build assessment options
    const assessmentOptions = assessments.map((a) => ({
        value: a.Id?.toString(),
        label: `${a.Name} (${a.MaxMarks} marks)`,
    }))

    const columns = [
        {
            header: 'Roll Number',
            accessor: 'EnrollmentNumber',
            cell: (row) => (
                <span className="font-mono text-sm">{row.EnrollmentNumber}</span>
            ),
        },
        {
            header: 'Student Name',
            accessor: 'StudentName',
            cell: (row) => (
                <span className="font-medium">{row.StudentName}</span>
            ),
        },
        {
            header: 'Current Grade',
            accessor: 'CurrentGrade',
            cell: (row) => (
                <Badge variant={row.CurrentGrade !== null ? 'success' : 'warning'}>
                    {row.CurrentGrade !== null ? `${row.CurrentGrade}/${selectedAssessmentDetails?.MaxMarks || 0}` : 'Not graded'}
                </Badge>
            ),
        },
        {
            header: 'Enter Grade',
            cell: (row) => (
                <Input
                    type="number"
                    min="0"
                    max={selectedAssessmentDetails?.MaxMarks || 100}
                    placeholder={`Max: ${selectedAssessmentDetails?.MaxMarks || 100}`}
                    value={grades[row.StudentId || row.Id] || ''}
                    onChange={(e) => handleGradeChange(row.StudentId || row.Id, e.target.value)}
                    className="w-28"
                />
            ),
        },
    ]

    if (loadingAssignments) {
        return <LoadingInline message="Loading courses..." />
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Grade Entry"
                description="Enter and manage student grades for your courses"
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
                                setSelectedAssessment('')
                                setGrades({})
                            }}
                        />
                        <Select
                            label="Select Assessment"
                            options={[{ value: '', label: 'Choose an assessment...' }, ...assessmentOptions]}
                            value={selectedAssessment}
                            onChange={(e) => {
                                setSelectedAssessment(e.target.value)
                                setGrades({})
                            }}
                            disabled={!selectedCourse || loadingAssessments}
                        />
                        <div className="flex items-end">
                            <SearchInput
                                value={searchTerm}
                                onChange={setSearchTerm}
                                placeholder="Search students..."
                                className="w-full"
                            />
                        </div>
                    </div>
                </Card.Body>
            </Card>

            {/* Grade Entry Table */}
            {selectedCourse && selectedAssessment ? (
                loadingEnrollments || loadingMarks ? (
                    <LoadingInline message="Loading students..." />
                ) : filteredStudents.length === 0 ? (
                    <EmptyState
                        icon={BookOpen}
                        title="No students found"
                        description="No students are enrolled in this course"
                    />
                ) : (
                    <Card className="border-0 shadow-sm overflow-hidden">
                        <Card.Header className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                            <div className="flex items-center justify-between">
                                <Card.Title className="flex items-center gap-2">
                                    <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                                    Student Grades
                                </Card.Title>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        leftIcon={<Upload className="w-4 h-4" />}
                                        onClick={bulkUploadModal.open}
                                    >
                                        Bulk Upload
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        leftIcon={<Download className="w-4 h-4" />}
                                        onClick={handleExport}
                                    >
                                        Export
                                    </Button>
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        leftIcon={<Save className="w-4 h-4" />}
                                        onClick={handleSaveGrades}
                                        loading={bulkSaveMutation.isPending}
                                    >
                                        Save Grades
                                    </Button>
                                </div>
                            </div>
                        </Card.Header>
                        <Table columns={columns} data={filteredStudents} />
                    </Card>
                )
            ) : (
                <Card className="border-0 shadow-sm">
                    <Card.Body>
                        <div className="text-center py-12">
                            <FileSpreadsheet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500">
                                Please select a course and assessment to enter grades
                            </p>
                        </div>
                    </Card.Body>
                </Card>
            )}

            {/* Bulk Upload Modal */}
            <Modal
                isOpen={bulkUploadModal.isOpen}
                onClose={bulkUploadModal.close}
                title="Bulk Upload Grades"
            >
                <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                        Upload a CSV file with student roll numbers and their grades.
                    </p>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                        <input
                            type="file"
                            accept=".csv,.xlsx"
                            className="hidden"
                            id="grade-upload"
                        />
                        <label
                            htmlFor="grade-upload"
                            className="cursor-pointer flex flex-col items-center"
                        >
                            <Upload className="w-10 h-10 text-gray-400 mb-2" />
                            <span className="text-sm text-gray-600">
                                Click to upload or drag and drop
                            </span>
                            <span className="text-xs text-gray-400 mt-1">
                                CSV or XLSX files only
                            </span>
                        </label>
                    </div>
                    <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={bulkUploadModal.close}>
                            Cancel
                        </Button>
                        <Button variant="primary" onClick={handleBulkUpload}>
                            Upload
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}

export default FacultyGradesPage
