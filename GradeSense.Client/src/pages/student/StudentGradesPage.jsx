import { useState, useMemo, useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { PageHeader } from '@/components/layout'
import { Card, Badge, Select, Table, EmptyState, Button } from '@/components/common'
import { LoadingInline } from '@/components/common/Spinner'
import { useAuth } from '@/context/AuthContext'
import { courseEnrollmentService } from '@/services/courseEnrollmentService'
import { studentMarkService } from '@/services/studentMarkService'
import { studentExportService } from '@/services/studentExportService'
import { Award, TrendingUp, Target, BookOpen, GraduationCap, Download, Filter, BarChart3, Calculator, FileSpreadsheet, ChevronDown, FileText } from 'lucide-react'
import toast from 'react-hot-toast'
import GradeAnalytics from '@/components/students/GradeAnalytics'
import WhatIfCalculator from '@/components/students/WhatIfCalculator'

const StudentGradesPage = () => {
    const { user } = useAuth()
    const [activeTab, setActiveTab] = useState('grades')
    const [selectedCourse, setSelectedCourse] = useState('')
    const [selectedSemester, setSelectedSemester] = useState('all')
    const [showExportMenu, setShowExportMenu] = useState(false)
    const [exporting, setExporting] = useState(false)
    const exportMenuRef = useRef(null)

    // Close export menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
                setShowExportMenu(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Fetch student's course enrollments (user.id === student.id for students)
    const { data: enrollmentsData, isLoading: loadingEnrollments } = useQuery({
        queryKey: ['student-enrollments-grades', user?.id],
        queryFn: () => courseEnrollmentService.getByStudent(user?.id),
        enabled: !!user?.id,
    })

    // Fetch student marks for selected course
    const { data: marksData, isLoading: loadingMarks } = useQuery({
        queryKey: ['student-marks', selectedCourse],
        queryFn: () => studentMarkService.getAll({
            studentId: user?.id,
            courseOfferingId: selectedCourse,
            pageSize: 100,
        }),
        enabled: !!selectedCourse && !!user?.id,
    })

    // Extract data from API responses (PascalCase)
    const enrollments = enrollmentsData?.Data?.Data || enrollmentsData?.Data || []
    const marks = marksData?.Data?.Data || []

    // Build semester options from enrollments
    const semesters = useMemo(() => {
        const semesterSet = new Set()
        enrollments.forEach(e => {
            if (e.Semester) semesterSet.add(e.Semester)
        })
        return Array.from(semesterSet).sort((a, b) => a - b).map(s => ({
            value: s.toString(),
            label: `Semester ${s}`,
        }))
    }, [enrollments])

    // Filter enrollments by semester
    const filteredEnrollments = useMemo(() => {
        if (selectedSemester === 'all') return enrollments
        return enrollments.filter(e => e.Semester?.toString() === selectedSemester)
    }, [enrollments, selectedSemester])

    // Build course options from filtered enrollments
    const courseOptions = filteredEnrollments.map(e => ({
        value: e.CourseOfferingId?.toString() || e.Id?.toString(),
        label: `${e.SubjectCode || ''} - ${e.SubjectName}`,
        semester: e.Semester,
        credits: e.Credits,
    }))

    // Calculate statistics for filtered enrollments
    const stats = useMemo(() => {
        const totalCredits = filteredEnrollments.reduce((sum, e) => sum + (e.Credits || 0), 0)
        const enrolledCourses = filteredEnrollments.length
        const avgPercentage = marks.length > 0
            ? marks.reduce((sum, m) => sum + ((m.ObtainedMarks || 0) / (m.AssessmentMaxMarks || 1) * 100), 0) / marks.length
            : 0
        return { totalCredits, enrolledCourses, avgPercentage }
    }, [filteredEnrollments, marks])

    // Calculate semester-wise summary
    const semesterSummary = useMemo(() => {
        const summary = {}
        semesters.forEach(sem => {
            const semEnrollments = enrollments.filter(e => e.Semester?.toString() === sem.value)
            const credits = semEnrollments.reduce((sum, e) => sum + (e.Credits || 0), 0)
            summary[sem.value] = {
                semester: sem.value,
                courses: semEnrollments.length,
                credits,
            }
        })
        return summary
    }, [enrollments, semesters])

    // Download grades as CSV
    const downloadGradesCSV = () => {
        if (marks.length === 0) {
            toast.error('No marks to download')
            return
        }

        const selectedCourseLabel = courseOptions.find(c => c.value === selectedCourse)?.label || 'Unknown Course'
        const headers = ['Assessment', 'Max Marks', 'Obtained Marks', 'Percentage', 'Status']
        const rows = marks.map(m => {
            const pct = m.ObtainedMarks !== null && m.AssessmentMaxMarks > 0
                ? ((m.ObtainedMarks / m.AssessmentMaxMarks) * 100).toFixed(1)
                : '-'
            const status = m.IsAbsent ? 'Absent' : m.ObtainedMarks !== null ? 'Graded' : 'Pending'
            return [m.AssessmentItemName, m.AssessmentMaxMarks, m.ObtainedMarks ?? '-', `${pct}%`, status]
        })

        // Add total row
        const totalObtained = marks.reduce((sum, m) => sum + (m.ObtainedMarks || 0), 0)
        const totalMax = marks.reduce((sum, m) => sum + (m.AssessmentMaxMarks || 0), 0)
        const totalPct = totalMax > 0 ? ((totalObtained / totalMax) * 100).toFixed(1) : '0'
        rows.push(['TOTAL', totalMax, totalObtained, `${totalPct}%`, '-'])

        const csvContent = [
            `Course: ${selectedCourseLabel}`,
            `Generated: ${new Date().toLocaleDateString()}`,
            '',
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = `grades_${selectedCourseLabel.replace(/[^a-z0-9]/gi, '_')}.csv`
        link.click()
        toast.success('Grades downloaded successfully')
    }

    // Server-side exports (more comprehensive with header info)
    const handleExportCourseGrades = async (format) => {
        if (!selectedCourse) {
            toast.error('Please select a course first')
            return
        }

        setExporting(true)
        setShowExportMenu(false)

        try {
            const response = format === 'csv'
                ? await studentExportService.exportGradesToCsv(selectedCourse)
                : await studentExportService.exportGradesToExcel(selectedCourse)

            const filename = studentExportService.getFilenameFromResponse(
                response,
                `grades_${selectedCourseDetails?.label?.replace(/[^a-z0-9]/gi, '_') || 'course'}.${format === 'csv' ? 'csv' : 'xlsx'}`
            )

            studentExportService.downloadBlobAsFile(response.data, filename)
            toast.success(`Grades exported to ${format.toUpperCase()} successfully`)
        } catch (error) {
            console.error('Export error:', error)
            toast.error(`Failed to export grades: ${error.message || 'Unknown error'}`)
        } finally {
            setExporting(false)
        }
    }

    const handleExportAllGrades = async () => {
        setExporting(true)
        setShowExportMenu(false)

        try {
            const filters = selectedSemester !== 'all' ? { semester: parseInt(selectedSemester) } : {}
            const response = await studentExportService.exportAllGradesToExcel(filters)

            const semesterSuffix = selectedSemester !== 'all' ? `_sem${selectedSemester}` : ''
            const filename = studentExportService.getFilenameFromResponse(
                response,
                `all_grades${semesterSuffix}.xlsx`
            )

            studentExportService.downloadBlobAsFile(response.data, filename)
            toast.success('All grades exported successfully')
        } catch (error) {
            console.error('Export error:', error)
            toast.error(`Failed to export grades: ${error.message || 'Unknown error'}`)
        } finally {
            setExporting(false)
        }
    }

    const handleExportTranscript = async (format) => {
        setExporting(true)
        setShowExportMenu(false)

        try {
            const filters = selectedSemester !== 'all' ? { semester: parseInt(selectedSemester) } : {}
            const response = format === 'csv'
                ? await studentExportService.exportTranscriptToCsv(filters)
                : await studentExportService.exportTranscriptToExcel(filters)

            const filename = studentExportService.getFilenameFromResponse(
                response,
                `transcript.${format === 'csv' ? 'csv' : 'xlsx'}`
            )

            studentExportService.downloadBlobAsFile(response.data, filename)
            toast.success(`Transcript exported to ${format.toUpperCase()} successfully`)
        } catch (error) {
            console.error('Export error:', error)
            toast.error(`Failed to export transcript: ${error.message || 'Unknown error'}`)
        } finally {
            setExporting(false)
        }
    }

    // Get selected course details
    const selectedCourseDetails = courseOptions.find(c => c.value === selectedCourse)

    const getGradeBadgeColor = (percentage) => {
        if (percentage >= 90) return 'success'
        if (percentage >= 75) return 'primary'
        if (percentage >= 60) return 'warning'
        return 'danger'
    }

    const marksColumns = [
        {
            header: 'Assessment',
            accessor: 'AssessmentItemName',
            cell: (row) => (
                <span className="font-medium">{row.AssessmentItemName}</span>
            ),
        },
        {
            header: 'Max Marks',
            accessor: 'AssessmentMaxMarks',
            cell: (row) => (
                <span className="text-gray-600">{row.AssessmentMaxMarks}</span>
            ),
        },
        {
            header: 'Obtained',
            accessor: 'ObtainedMarks',
            cell: (row) => (
                <span className="font-semibold text-blue-600">
                    {row.ObtainedMarks ?? '-'}
                </span>
            ),
        },
        {
            header: 'Percentage',
            cell: (row) => {
                const pct = row.ObtainedMarks !== null && row.AssessmentMaxMarks > 0
                    ? ((row.ObtainedMarks / row.AssessmentMaxMarks) * 100).toFixed(1)
                    : null
                return pct ? (
                    <Badge variant={getGradeBadgeColor(parseFloat(pct))}>
                        {pct}%
                    </Badge>
                ) : (
                    <span className="text-gray-400">-</span>
                )
            },
        },
        {
            header: 'Status',
            cell: (row) => (
                <Badge variant={row.IsAbsent ? 'danger' : row.ObtainedMarks !== null ? 'success' : 'warning'}>
                    {row.IsAbsent ? 'Absent' : row.ObtainedMarks !== null ? 'Graded' : 'Pending'}
                </Badge>
            ),
        },
    ]

    if (loadingEnrollments) {
        return <LoadingInline message="Loading your grades..." />
    }

    // Tab definitions
    const tabs = [
        { id: 'grades', label: 'My Grades', icon: Award },
        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
        { id: 'whatif', label: 'What-If Calculator', icon: Calculator },
    ]

    // Handle course selection from analytics
    const handleCourseSelect = (courseOfferingId) => {
        setSelectedCourse(courseOfferingId?.toString())
        setActiveTab('grades')
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="My Grades"
                description="View your academic performance and grades"
            />

            {/* Main Tab Navigation */}
            <Card className="border-0 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-1">
                    <div className="flex items-center gap-1 overflow-x-auto">
                        {tabs.map(tab => {
                            const Icon = tab.icon
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap rounded-t-lg ${activeTab === tab.id
                                        ? 'bg-white text-indigo-600'
                                        : 'text-white/80 hover:text-white hover:bg-white/10'
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            )
                        })}
                    </div>
                </div>
            </Card>

            {/* Tab Content */}
            {activeTab === 'analytics' ? (
                <GradeAnalytics semesterFilter={selectedSemester !== 'all' ? parseInt(selectedSemester) : null} onCourseSelect={handleCourseSelect} />
            ) : activeTab === 'whatif' ? (
                <WhatIfCalculator />
            ) : (
                <>
                    {/* Semester Filter Tabs */}
                    {semesters.length > 0 && (
                        <Card className="border-0 shadow-sm">
                            <Card.Body className="py-3">
                                <div className="flex items-center gap-2 overflow-x-auto">
                                    <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                    <button
                                        onClick={() => { setSelectedSemester('all'); setSelectedCourse(''); }}
                                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${selectedSemester === 'all'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                    >
                                        All Semesters
                                    </button>
                                    {semesters.map(sem => (
                                        <button
                                            key={sem.value}
                                            onClick={() => { setSelectedSemester(sem.value); setSelectedCourse(''); }}
                                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${selectedSemester === sem.value
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                }`}
                                        >
                                            {sem.label}
                                            <span className="ml-2 text-xs opacity-75">
                                                ({semesterSummary[sem.value]?.courses || 0})
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </Card.Body>
                        </Card>
                    )}

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="border-0 shadow-sm overflow-hidden">
                            <Card.Body>
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg shadow-sm">
                                        <Award className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Courses Enrolled</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {stats.enrolledCourses}
                                        </p>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                        <Card className="border-0 shadow-sm overflow-hidden">
                            <Card.Body>
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg shadow-sm">
                                        <GraduationCap className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Total Credits</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {stats.totalCredits}
                                        </p>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                        <Card className="border-0 shadow-sm overflow-hidden">
                            <Card.Body>
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-gradient-to-br from-purple-400 to-violet-500 rounded-lg shadow-sm">
                                        <Target className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Avg Score</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {stats.avgPercentage > 0 ? `${stats.avgPercentage.toFixed(1)}%` : '-'}
                                        </p>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </div>

                    {/* Course Selector */}
                    <Card className="border-0 shadow-md overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
                                        <BookOpen className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-white">Select Course</h3>
                                        <p className="text-sm text-white/80">Choose a course to view your grades</p>
                                    </div>
                                </div>
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                    <div className="w-full sm:w-80">
                                        <select
                                            value={selectedCourse}
                                            onChange={(e) => setSelectedCourse(e.target.value)}
                                            className="w-full px-4 py-2.5 bg-white/95 border-0 rounded-xl shadow-md text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-white/50 cursor-pointer appearance-none"
                                            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236366f1'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1.25rem' }}
                                        >
                                            <option value="">Choose a course...</option>
                                            {courseOptions.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    {selectedCourseDetails && (
                                        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                                            <GraduationCap className="w-4 h-4 text-white" />
                                            <span className="text-sm font-medium text-white">{selectedCourseDetails.credits} Credits</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        {selectedCourse && (
                            <div className="px-6 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-t border-blue-100">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-sm text-blue-700">
                                        <Award className="w-4 h-4" />
                                        <span className="font-medium">{selectedCourseDetails?.label}</span>
                                    </div>
                                    <Badge variant="primary" className="bg-blue-100 text-blue-700 border-0">
                                        Semester {selectedCourseDetails?.semester}
                                    </Badge>
                                </div>
                            </div>
                        )}
                    </Card>

                    {/* Marks Table */}
                    {selectedCourse ? (
                        loadingMarks ? (
                            <LoadingInline message="Loading marks..." />
                        ) : marks.length === 0 ? (
                            <EmptyState
                                icon={BookOpen}
                                title="No grades available"
                                description="No assessments have been graded for this course yet"
                            />
                        ) : (
                            <Card className="border-0 shadow-sm overflow-visible">
                                <Card.Header className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b overflow-visible">
                                    <div className="flex items-center justify-between w-full">
                                        <div>
                                            <Card.Title className="flex items-center gap-2">
                                                <TrendingUp className="w-5 h-5 text-blue-600" />
                                                Assessment Marks
                                            </Card.Title>
                                            <Card.Description>
                                                Your marks for {selectedCourseDetails?.label || 'the selected course'}
                                            </Card.Description>
                                        </div>
                                        <div className="relative z-50" ref={exportMenuRef}>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setShowExportMenu(!showExportMenu)}
                                                disabled={exporting}
                                                className="flex items-center gap-2"
                                            >
                                                {exporting ? (
                                                    <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
                                                ) : (
                                                    <Download className="w-4 h-4" />
                                                )}
                                                Export
                                                <ChevronDown className={`w-4 h-4 transition-transform ${showExportMenu ? 'rotate-180' : ''}`} />
                                            </Button>
                                            {showExportMenu && (
                                                <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-[100] max-h-[400px] overflow-y-auto">
                                                    <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-100">
                                                        Course Grades
                                                    </div>
                                                    <button
                                                        onClick={() => handleExportCourseGrades('csv')}
                                                        className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-blue-50 flex items-center gap-3 transition-colors"
                                                    >
                                                        <FileText className="w-4 h-4 text-green-600" />
                                                        <span>Download as CSV</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleExportCourseGrades('excel')}
                                                        className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-blue-50 flex items-center gap-3 transition-colors"
                                                    >
                                                        <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                                                        <span>Download as Excel</span>
                                                    </button>
                                                    <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 border-y border-gray-100 mt-2">
                                                        All Grades
                                                    </div>
                                                    <button
                                                        onClick={handleExportAllGrades}
                                                        className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-blue-50 flex items-center gap-3 transition-colors"
                                                    >
                                                        <FileSpreadsheet className="w-4 h-4 text-purple-600" />
                                                        <span>Export All Grades (Excel)</span>
                                                    </button>
                                                    <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 border-y border-gray-100 mt-2">
                                                        Transcript
                                                    </div>
                                                    <button
                                                        onClick={() => handleExportTranscript('csv')}
                                                        className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-blue-50 flex items-center gap-3 transition-colors"
                                                    >
                                                        <FileText className="w-4 h-4 text-orange-600" />
                                                        <span>Academic Transcript (CSV)</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleExportTranscript('excel')}
                                                        className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-blue-50 flex items-center gap-3 transition-colors"
                                                    >
                                                        <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
                                                        <span>Academic Transcript (Excel)</span>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Card.Header>
                                <Table columns={marksColumns} data={marks} />

                                {/* Total Calculation */}
                                <div className="border-t border-gray-100 bg-gray-50 px-6 py-4">
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium text-gray-700">Total</span>
                                        <div className="text-right">
                                            <span className="text-lg font-bold text-blue-600">
                                                {marks.reduce((sum, m) => sum + (m.ObtainedMarks || 0), 0)}
                                            </span>
                                            <span className="text-gray-400">
                                                {' / '}
                                                {marks.reduce((sum, m) => sum + (m.AssessmentMaxMarks || 0), 0)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        )
                    ) : (
                        <Card className="border-0 shadow-sm">
                            <Card.Body>
                                <div className="text-center py-12">
                                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500">
                                        Select a course to view your grades and assessment details
                                    </p>
                                </div>
                            </Card.Body>
                        </Card>
                    )}

                    {/* Course Performance Overview */}
                    {filteredEnrollments.length > 0 && (
                        <Card className="border-0 shadow-sm overflow-hidden">
                            <Card.Header className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
                                <Card.Title className="flex items-center gap-2">
                                    <GraduationCap className="w-5 h-5 text-purple-600" />
                                    {selectedSemester === 'all' ? 'All Enrolled Courses' : `Semester ${selectedSemester} Courses`}
                                </Card.Title>
                            </Card.Header>
                            <Card.Body>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {filteredEnrollments.map((enrollment) => (
                                        <div
                                            key={enrollment.Id}
                                            className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${(enrollment.CourseOfferingId?.toString() || enrollment.Id?.toString()) === selectedCourse
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200 hover:border-blue-300'
                                                }`}
                                            onClick={() => setSelectedCourse(enrollment.CourseOfferingId?.toString() || enrollment.Id?.toString())}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <p className="font-mono text-sm text-blue-600">{enrollment.SubjectCode}</p>
                                                    <p className="font-medium text-gray-900">{enrollment.SubjectName}</p>
                                                </div>
                                                <Badge variant="info">Sem {enrollment.Semester || '-'}</Badge>
                                            </div>
                                            <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                                                <span>{enrollment.Credits || 0} Credits</span>
                                                <span>{enrollment.FacultyName || '-'}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card.Body>
                        </Card>
                    )}
                </>
            )}
        </div>
    )
}

export default StudentGradesPage
