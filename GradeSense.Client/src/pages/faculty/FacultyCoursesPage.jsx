import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { PageHeader } from '@/components/layout'
import { Card, Badge, SearchInput, EmptyState } from '@/components/common'
import { courseOfferingService } from '@/services/courseOfferingService'
import { useDebounce } from '@/hooks'
import { ROUTES } from '@/utils/constants'
import { BookOpen, Users, Calendar, ChevronRight, GraduationCap, Loader2, ClipboardCheck } from 'lucide-react'

const FacultyCoursesPage = () => {
    const navigate = useNavigate()
    const [searchTerm, setSearchTerm] = useState('')
    const debouncedSearch = useDebounce(searchTerm, 300)

    // Fetch faculty's courses from API
    const { data, isLoading } = useQuery({
        queryKey: ['faculty-courses'],
        queryFn: () => courseOfferingService.getAll({ pageSize: 100 }),
    })

    const courses = data?.Data?.Data || []

    const filteredCourses = courses.filter(
        (course) =>
            course.SubjectName?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            course.SubjectCode?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            course.BatchName?.toLowerCase().includes(debouncedSearch.toLowerCase())
    )

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
                description="View and manage your assigned courses"
            />

            <Card className="border-0 shadow-sm">
                <Card.Body>
                    <SearchInput
                        value={searchTerm}
                        onChange={setSearchTerm}
                        placeholder="Search courses by name, code, or batch..."
                        className="max-w-md"
                    />
                </Card.Body>
            </Card>

            {filteredCourses.length === 0 ? (
                <EmptyState
                    icon={BookOpen}
                    title="No courses found"
                    description={
                        searchTerm
                            ? 'Try adjusting your search terms'
                            : 'You have no courses assigned for this semester'
                    }
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredCourses.map((course) => (
                        <Card
                            key={course.Id}
                            className="group border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                        >
                            <div className="h-2 bg-gradient-to-r from-blue-500 to-purple-600" />
                            <Card.Body className="p-5">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <Badge variant="primary" className="mb-2">{course.SubjectCode}</Badge>
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            {course.SubjectName}
                                        </h3>
                                    </div>
                                    <div className="p-2.5 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl">
                                        <BookOpen className="w-5 h-5 text-blue-600" />
                                    </div>
                                </div>

                                <div className="space-y-2.5 text-sm">
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
                                        <span>AY: {course.AcademicYear}</span>
                                    </div>
                                    <div className="flex items-center gap-2.5 text-gray-600">
                                        <div className="p-1.5 bg-gray-100 rounded-lg">
                                            <Users className="w-4 h-4" />
                                        </div>
                                        <span>{course.EnrolledCount || 0} students enrolled</span>
                                    </div>
                                </div>

                                <div className="mt-5 pt-4 border-t border-gray-100">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => navigate(`${ROUTES.FACULTY_GRADES}?course=${course.Id}`)}
                                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                                        >
                                            <ClipboardCheck className="w-4 h-4" />
                                            Grades
                                        </button>
                                        <button
                                            onClick={() => navigate(`${ROUTES.FACULTY_ATTENDANCE}?course=${course.Id}`)}
                                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
                                        >
                                            <Calendar className="w-4 h-4" />
                                            Attendance
                                        </button>
                                        <Link
                                            to={`${ROUTES.FACULTY_COURSES}/${course.Id}`}
                                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                        >
                                            <ChevronRight className="w-5 h-5" />
                                        </Link>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}

export default FacultyCoursesPage
