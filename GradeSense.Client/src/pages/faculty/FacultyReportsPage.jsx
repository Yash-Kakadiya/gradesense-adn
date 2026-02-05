import { useState } from 'react'
import { PageHeader } from '@/components/layout'
import { Card, Select, Button, Badge, Table } from '@/components/common'
import { Download, FileText, Users, TrendingUp, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'

const FacultyReportsPage = () => {
    const [selectedCourse, setSelectedCourse] = useState('')
    const [reportType, setReportType] = useState('')

    // Mock data
    const courses = [
        { value: '1', label: 'CS201 - Data Structures (CS 2023)' },
        { value: '2', label: 'CS301 - Algorithms (CS 2022)' },
        { value: '3', label: 'CS401 - Database Systems (CS 2021)' },
        { value: '4', label: 'CS350 - Web Development (CS 2023)' },
    ]

    const reportTypes = [
        { value: 'performance', label: 'Performance Summary' },
        { value: 'attendance', label: 'Attendance Report' },
        { value: 'at-risk', label: 'At-Risk Students' },
        { value: 'grade-distribution', label: 'Grade Distribution' },
    ]

    // Mock performance data
    const performanceData = {
        classAverage: 72.5,
        highestScore: 95,
        lowestScore: 45,
        passPercentage: 85,
        totalStudents: 45,
        assessmentsCompleted: 4,
    }

    // Mock at-risk students
    const atRiskStudents = [
        { id: 1, rollNumber: 'CS23003', name: 'Bob Wilson', attendance: 65, average: 48, riskLevel: 'high' },
        { id: 2, rollNumber: 'CS23007', name: 'Edward Jones', attendance: 70, average: 52, riskLevel: 'medium' },
        { id: 3, rollNumber: 'CS23012', name: 'Kevin Lee', attendance: 75, average: 55, riskLevel: 'medium' },
    ]

    // Mock grade distribution
    const gradeDistribution = [
        { grade: 'A+', count: 5, percentage: 11 },
        { grade: 'A', count: 8, percentage: 18 },
        { grade: 'B+', count: 10, percentage: 22 },
        { grade: 'B', count: 12, percentage: 27 },
        { grade: 'C+', count: 6, percentage: 13 },
        { grade: 'C', count: 3, percentage: 7 },
        { grade: 'F', count: 1, percentage: 2 },
    ]

    const handleExport = (format) => {
        toast.success(`Report exported as ${format.toUpperCase()}`)
    }

    const atRiskColumns = [
        { key: 'rollNumber', header: 'Roll Number' },
        { key: 'name', header: 'Student Name' },
        {
            key: 'attendance',
            header: 'Attendance %',
            render: (row) => (
                <span className={row.attendance < 75 ? 'text-red-600' : 'text-gray-900'}>
                    {row.attendance}%
                </span>
            ),
        },
        {
            key: 'average',
            header: 'Average Score',
            render: (row) => (
                <span className={row.average < 50 ? 'text-red-600' : 'text-gray-900'}>
                    {row.average}%
                </span>
            ),
        },
        {
            key: 'riskLevel',
            header: 'Risk Level',
            render: (row) => (
                <Badge variant={row.riskLevel === 'high' ? 'danger' : 'warning'}>
                    {row.riskLevel}
                </Badge>
            ),
        },
    ]

    return (
        <div>
            <PageHeader
                title="Reports & Analytics"
                description="View course performance reports and analytics"
            />

            {/* Filters */}
            <Card className="mb-6">
                <Card.Body>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Select
                            label="Select Course"
                            options={courses}
                            value={selectedCourse}
                            onChange={(e) => setSelectedCourse(e.target.value)}
                            placeholder="Choose a course"
                        />
                        <Select
                            label="Report Type"
                            options={reportTypes}
                            value={reportType}
                            onChange={(e) => setReportType(e.target.value)}
                            placeholder="Choose report type"
                            disabled={!selectedCourse}
                        />
                        <div className="flex items-end gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                leftIcon={<Download className="w-4 h-4" />}
                                onClick={() => handleExport('pdf')}
                                disabled={!selectedCourse || !reportType}
                            >
                                Export PDF
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                leftIcon={<FileText className="w-4 h-4" />}
                                onClick={() => handleExport('excel')}
                                disabled={!selectedCourse || !reportType}
                            >
                                Export Excel
                            </Button>
                        </div>
                    </div>
                </Card.Body>
            </Card>

            {selectedCourse && reportType === 'performance' && (
                <>
                    {/* Performance Summary Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                        <Card>
                            <Card.Body className="py-4">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-blue-600">{performanceData.classAverage}%</p>
                                    <p className="text-xs text-gray-500">Class Average</p>
                                </div>
                            </Card.Body>
                        </Card>
                        <Card>
                            <Card.Body className="py-4">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-green-600">{performanceData.highestScore}%</p>
                                    <p className="text-xs text-gray-500">Highest Score</p>
                                </div>
                            </Card.Body>
                        </Card>
                        <Card>
                            <Card.Body className="py-4">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-red-600">{performanceData.lowestScore}%</p>
                                    <p className="text-xs text-gray-500">Lowest Score</p>
                                </div>
                            </Card.Body>
                        </Card>
                        <Card>
                            <Card.Body className="py-4">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-purple-600">{performanceData.passPercentage}%</p>
                                    <p className="text-xs text-gray-500">Pass Rate</p>
                                </div>
                            </Card.Body>
                        </Card>
                        <Card>
                            <Card.Body className="py-4">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-orange-600">{performanceData.totalStudents}</p>
                                    <p className="text-xs text-gray-500">Total Students</p>
                                </div>
                            </Card.Body>
                        </Card>
                        <Card>
                            <Card.Body className="py-4">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-indigo-600">{performanceData.assessmentsCompleted}</p>
                                    <p className="text-xs text-gray-500">Assessments</p>
                                </div>
                            </Card.Body>
                        </Card>
                    </div>

                    {/* Performance Chart Placeholder */}
                    <Card>
                        <Card.Header>
                            <Card.Title className="flex items-center gap-2">
                                <TrendingUp className="w-5 h-5" />
                                Performance Trend
                            </Card.Title>
                        </Card.Header>
                        <Card.Body>
                            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                                <p className="text-gray-500">Performance chart will be rendered here</p>
                            </div>
                        </Card.Body>
                    </Card>
                </>
            )}

            {selectedCourse && reportType === 'at-risk' && (
                <Card>
                    <Card.Header>
                        <Card.Title className="flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-red-500" />
                            At-Risk Students
                        </Card.Title>
                        <Card.Description>
                            Students with low attendance or poor academic performance
                        </Card.Description>
                    </Card.Header>
                    <Card.Body className="p-0">
                        <Table columns={atRiskColumns} data={atRiskStudents} />
                    </Card.Body>
                </Card>
            )}

            {selectedCourse && reportType === 'grade-distribution' && (
                <Card>
                    <Card.Header>
                        <Card.Title>Grade Distribution</Card.Title>
                    </Card.Header>
                    <Card.Body>
                        <div className="space-y-3">
                            {gradeDistribution.map((item) => (
                                <div key={item.grade} className="flex items-center gap-4">
                                    <span className="w-12 font-medium">{item.grade}</span>
                                    <div className="flex-1 h-8 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-500 rounded-full flex items-center justify-end pr-2"
                                            style={{ width: `${item.percentage}%` }}
                                        >
                                            {item.percentage > 10 && (
                                                <span className="text-xs text-white font-medium">
                                                    {item.count}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <span className="w-16 text-sm text-gray-500 text-right">
                                        {item.percentage}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    </Card.Body>
                </Card>
            )}

            {selectedCourse && reportType === 'attendance' && (
                <Card>
                    <Card.Header>
                        <Card.Title className="flex items-center gap-2">
                            <Users className="w-5 h-5" />
                            Attendance Summary
                        </Card.Title>
                    </Card.Header>
                    <Card.Body>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-medium text-gray-900 mb-4">Overall Statistics</h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Average Attendance</span>
                                        <span className="font-medium">82%</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Total Classes Held</span>
                                        <span className="font-medium">24</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Students with &gt;75%</span>
                                        <span className="font-medium text-green-600">38</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Students with &lt;75%</span>
                                        <span className="font-medium text-red-600">7</span>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-900 mb-4">Attendance Trend</h4>
                                <div className="h-40 flex items-center justify-center bg-gray-50 rounded-lg">
                                    <p className="text-gray-500 text-sm">Attendance chart placeholder</p>
                                </div>
                            </div>
                        </div>
                    </Card.Body>
                </Card>
            )}

            {(!selectedCourse || !reportType) && (
                <Card>
                    <Card.Body>
                        <div className="text-center py-12">
                            <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-500">
                                Select a course and report type to view analytics
                            </p>
                        </div>
                    </Card.Body>
                </Card>
            )}
        </div>
    )
}

export default FacultyReportsPage
