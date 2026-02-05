import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { PageHeader } from '@/components/layout'
import { Card, Badge, SearchInput, EmptyState } from '@/components/common'
import { courseEnrollmentService } from '@/services/courseEnrollmentService'
import { useDebounce } from '@/hooks'
import { BookOpen, User, Calendar, GraduationCap, Loader2, Hash } from 'lucide-react'

const StudentCoursesPage = () => {
    const [searchTerm, setSearchTerm] = useState('')
    const debouncedSearch = useDebounce(searchTerm, 300)

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

            <Card className="border-0 shadow-sm">
                <Card.Body>
                    <SearchInput
                        value={searchTerm}
                        onChange={setSearchTerm}
                        placeholder="Search courses by name, code, or faculty..."
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
                            : 'You have no courses enrolled'
                    }
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredCourses.map((course) => (
                        <Card
                            key={course.Id}
                            className="group border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
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
        </div>
    )
}

export default StudentCoursesPage
