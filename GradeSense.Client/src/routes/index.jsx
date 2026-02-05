import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { RoleBasedRoute } from './RoleBasedRoute'
import { ROUTES, ROLES } from '@/utils/constants'
import { LoadingScreen } from '@/components/common'
import { DashboardLayout } from '@/components/layout'
import { AuthProvider } from '@/context/AuthContext'

// Root layout that provides AuthContext to all routes
const RootLayout = () => (
    <AuthProvider>
        <Outlet />
    </AuthProvider>
)

// Lazy load pages
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

// Admin pages
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'))
const AdminProfilePage = lazy(() => import('@/pages/admin/profile/AdminProfilePage'))
const UsersPage = lazy(() => import('@/pages/admin/users/UsersPage'))
const UserFormPage = lazy(() => import('@/pages/admin/users/UserFormPage'))
const DepartmentsPage = lazy(() => import('@/pages/admin/departments/DepartmentsPage'))
const DepartmentFormPage = lazy(() => import('@/pages/admin/departments/DepartmentFormPage'))
const BatchesPage = lazy(() => import('@/pages/admin/batches/BatchesPage'))
const BatchFormPage = lazy(() => import('@/pages/admin/batches/BatchFormPage'))
const SubjectsPage = lazy(() => import('@/pages/admin/subjects/SubjectsPage'))
const SubjectFormPage = lazy(() => import('@/pages/admin/subjects/SubjectFormPage'))
const FacultiesPage = lazy(() => import('@/pages/admin/faculties/FacultiesPage'))
const FacultyFormPage = lazy(() => import('@/pages/admin/faculties/FacultyFormPage'))
const StudentsPage = lazy(() => import('@/pages/admin/students/StudentsPage'))
const StudentFormPage = lazy(() => import('@/pages/admin/students/StudentFormPage'))
const CourseOfferingsPage = lazy(() => import('@/pages/admin/course-offerings/CourseOfferingsPage'))
const CourseOfferingFormPage = lazy(() => import('@/pages/admin/course-offerings/CourseOfferingFormPage'))
const EvaluationSchemesPage = lazy(() => import('@/pages/admin/evaluation-schemes/EvaluationSchemesPage'))
const EvaluationSchemeFormPage = lazy(() => import('@/pages/admin/evaluation-schemes/EvaluationSchemeFormPage'))
const AuditLogsPage = lazy(() => import('@/pages/admin/audit-logs/AuditLogsPage'))

// Faculty pages
const FacultyDashboard = lazy(() => import('@/pages/faculty/FacultyDashboard'))
const FacultyCoursesPage = lazy(() => import('@/pages/faculty/FacultyCoursesPage'))
const FacultyGradesPage = lazy(() => import('@/pages/faculty/FacultyGradesPage'))
const FacultyAttendancePage = lazy(() => import('@/pages/faculty/FacultyAttendancePage'))
const FacultyReportsPage = lazy(() => import('@/pages/faculty/FacultyReportsPage'))

// Student pages
const StudentDashboard = lazy(() => import('@/pages/student/StudentDashboard'))
const StudentCoursesPage = lazy(() => import('@/pages/student/StudentCoursesPage'))
const StudentGradesPage = lazy(() => import('@/pages/student/StudentGradesPage'))
const StudentAttendancePage = lazy(() => import('@/pages/student/StudentAttendancePage'))
const StudentProfilePage = lazy(() => import('@/pages/student/StudentProfilePage'))

// Suspense wrapper
const SuspenseWrapper = ({ children }) => (
    <Suspense fallback={<LoadingScreen />}>{children}</Suspense>
)

export const router = createBrowserRouter([
    {
        element: <RootLayout />,
        children: [
            // Public routes
            {
                path: ROUTES.LOGIN,
                element: (
                    <SuspenseWrapper>
                        <LoginPage />
                    </SuspenseWrapper>
                ),
            },

            // Protected routes
            {
                element: <ProtectedRoute />,
                children: [
                    {
                        element: <DashboardLayout />,
                        children: [
                            // Admin routes
                            {
                                element: <RoleBasedRoute allowedRoles={[ROLES.ADMIN]} />,
                                children: [
                                    {
                                        path: ROUTES.ADMIN_DASHBOARD,
                                        element: (
                                            <SuspenseWrapper>
                                                <AdminDashboard />
                                            </SuspenseWrapper>
                                        ),
                                    },
                                    {
                                        path: ROUTES.ADMIN_PROFILE,
                                        element: (
                                            <SuspenseWrapper>
                                                <AdminProfilePage />
                                            </SuspenseWrapper>
                                        ),
                                    },
                                    {
                                        path: ROUTES.ADMIN_USERS,
                                        element: (
                                            <SuspenseWrapper>
                                                <UsersPage />
                                            </SuspenseWrapper>
                                        ),
                                    },
                                    {
                                        path: `${ROUTES.ADMIN_USERS}/create`,
                                        element: (
                                            <SuspenseWrapper>
                                                <UserFormPage />
                                            </SuspenseWrapper>
                                        ),
                                    },
                                    {
                                        path: `${ROUTES.ADMIN_USERS}/:id/edit`,
                                        element: (
                                            <SuspenseWrapper>
                                                <UserFormPage />
                                            </SuspenseWrapper>
                                        ),
                                    },
                                    {
                                        path: ROUTES.ADMIN_DEPARTMENTS,
                                        element: (
                                            <SuspenseWrapper>
                                                <DepartmentsPage />
                                            </SuspenseWrapper>
                                        ),
                                    },
                                    {
                                        path: `${ROUTES.ADMIN_DEPARTMENTS}/create`,
                                        element: (
                                            <SuspenseWrapper>
                                                <DepartmentFormPage />
                                            </SuspenseWrapper>
                                        ),
                                    },
                                    {
                                        path: `${ROUTES.ADMIN_DEPARTMENTS}/:id/edit`,
                                        element: (
                                            <SuspenseWrapper>
                                                <DepartmentFormPage />
                                            </SuspenseWrapper>
                                        ),
                                    },
                                    {
                                        path: ROUTES.ADMIN_BATCHES,
                                        element: (
                                            <SuspenseWrapper>
                                                <BatchesPage />
                                            </SuspenseWrapper>
                                        ),
                                    },
                                    {
                                        path: `${ROUTES.ADMIN_BATCHES}/create`,
                                        element: (
                                            <SuspenseWrapper>
                                                <BatchFormPage />
                                            </SuspenseWrapper>
                                        ),
                                    },
                                    {
                                        path: `${ROUTES.ADMIN_BATCHES}/:id/edit`,
                                        element: (
                                            <SuspenseWrapper>
                                                <BatchFormPage />
                                            </SuspenseWrapper>
                                        ),
                                    },
                                    {
                                        path: ROUTES.ADMIN_SUBJECTS,
                                        element: (
                                            <SuspenseWrapper>
                                                <SubjectsPage />
                                            </SuspenseWrapper>
                                        ),
                                    },
                                    {
                                        path: `${ROUTES.ADMIN_SUBJECTS}/create`,
                                        element: (
                                            <SuspenseWrapper>
                                                <SubjectFormPage />
                                            </SuspenseWrapper>
                                        ),
                                    },
                                    {
                                        path: `${ROUTES.ADMIN_SUBJECTS}/:id/edit`,
                                        element: (
                                            <SuspenseWrapper>
                                                <SubjectFormPage />
                                            </SuspenseWrapper>
                                        ),
                                    },
                                    {
                                        path: ROUTES.ADMIN_FACULTIES,
                                        element: (
                                            <SuspenseWrapper>
                                                <FacultiesPage />
                                            </SuspenseWrapper>
                                        ),
                                    },
                                    {
                                        path: `${ROUTES.ADMIN_FACULTIES}/create`,
                                        element: (
                                            <SuspenseWrapper>
                                                <FacultyFormPage />
                                            </SuspenseWrapper>
                                        ),
                                    },
                                    {
                                        path: `${ROUTES.ADMIN_FACULTIES}/:id/edit`,
                                        element: (
                                            <SuspenseWrapper>
                                                <FacultyFormPage />
                                            </SuspenseWrapper>
                                        ),
                                    },
                                    {
                                        path: ROUTES.ADMIN_STUDENTS,
                                        element: (
                                            <SuspenseWrapper>
                                                <StudentsPage />
                                            </SuspenseWrapper>
                                        ),
                                    },
                                    {
                                        path: `${ROUTES.ADMIN_STUDENTS}/create`,
                                        element: (
                                            <SuspenseWrapper>
                                                <StudentFormPage />
                                            </SuspenseWrapper>
                                        ),
                                    },
                                    {
                                        path: `${ROUTES.ADMIN_STUDENTS}/:id/edit`,
                                        element: (
                                            <SuspenseWrapper>
                                                <StudentFormPage />
                                            </SuspenseWrapper>
                                        ),
                                    },
                                    {
                                        path: ROUTES.ADMIN_COURSE_OFFERINGS,
                                        element: (
                                            <SuspenseWrapper>
                                                <CourseOfferingsPage />
                                            </SuspenseWrapper>
                                        ),
                                    },
                                    {
                                        path: `${ROUTES.ADMIN_COURSE_OFFERINGS}/create`,
                                        element: (
                                            <SuspenseWrapper>
                                                <CourseOfferingFormPage />
                                            </SuspenseWrapper>
                                        ),
                                    },
                                    {
                                        path: `${ROUTES.ADMIN_COURSE_OFFERINGS}/:id/edit`,
                                        element: (
                                            <SuspenseWrapper>
                                                <CourseOfferingFormPage />
                                            </SuspenseWrapper>
                                        ),
                                    },
                                    {
                                        path: ROUTES.ADMIN_EVALUATION_SCHEMES,
                                        element: (
                                            <SuspenseWrapper>
                                                <EvaluationSchemesPage />
                                            </SuspenseWrapper>
                                        ),
                                    },
                                    {
                                        path: `${ROUTES.ADMIN_EVALUATION_SCHEMES}/create`,
                                        element: (
                                            <SuspenseWrapper>
                                                <EvaluationSchemeFormPage />
                                            </SuspenseWrapper>
                                        ),
                                    },
                                    {
                                        path: `${ROUTES.ADMIN_EVALUATION_SCHEMES}/:id/edit`,
                                        element: (
                                            <SuspenseWrapper>
                                                <EvaluationSchemeFormPage />
                                            </SuspenseWrapper>
                                        ),
                                    },
                                    {
                                        path: ROUTES.ADMIN_AUDIT_LOGS,
                                        element: (
                                            <SuspenseWrapper>
                                                <AuditLogsPage />
                                            </SuspenseWrapper>
                                        ),
                                    },
                                ],
                            },

                            // Faculty routes
                            {
                                element: <RoleBasedRoute allowedRoles={[ROLES.FACULTY]} />,
                                children: [
                                    {
                                        path: ROUTES.FACULTY_DASHBOARD,
                                        element: (
                                            <SuspenseWrapper>
                                                <FacultyDashboard />
                                            </SuspenseWrapper>
                                        ),
                                    },
                                    {
                                        path: ROUTES.FACULTY_COURSES,
                                        element: (
                                            <SuspenseWrapper>
                                                <FacultyCoursesPage />
                                            </SuspenseWrapper>
                                        ),
                                    },
                                    {
                                        path: ROUTES.FACULTY_GRADES,
                                        element: (
                                            <SuspenseWrapper>
                                                <FacultyGradesPage />
                                            </SuspenseWrapper>
                                        ),
                                    },
                                    {
                                        path: ROUTES.FACULTY_ATTENDANCE,
                                        element: (
                                            <SuspenseWrapper>
                                                <FacultyAttendancePage />
                                            </SuspenseWrapper>
                                        ),
                                    },
                                    {
                                        path: ROUTES.FACULTY_REPORTS,
                                        element: (
                                            <SuspenseWrapper>
                                                <FacultyReportsPage />
                                            </SuspenseWrapper>
                                        ),
                                    },
                                ],
                            },

                            // Student routes
                            {
                                element: <RoleBasedRoute allowedRoles={[ROLES.STUDENT]} />,
                                children: [
                                    {
                                        path: ROUTES.STUDENT_DASHBOARD,
                                        element: (
                                            <SuspenseWrapper>
                                                <StudentDashboard />
                                            </SuspenseWrapper>
                                        ),
                                    },
                                    {
                                        path: ROUTES.STUDENT_COURSES,
                                        element: (
                                            <SuspenseWrapper>
                                                <StudentCoursesPage />
                                            </SuspenseWrapper>
                                        ),
                                    },
                                    {
                                        path: ROUTES.STUDENT_GRADES,
                                        element: (
                                            <SuspenseWrapper>
                                                <StudentGradesPage />
                                            </SuspenseWrapper>
                                        ),
                                    },
                                    {
                                        path: ROUTES.STUDENT_ATTENDANCE,
                                        element: (
                                            <SuspenseWrapper>
                                                <StudentAttendancePage />
                                            </SuspenseWrapper>
                                        ),
                                    },
                                    {
                                        path: ROUTES.STUDENT_PROFILE,
                                        element: (
                                            <SuspenseWrapper>
                                                <StudentProfilePage />
                                            </SuspenseWrapper>
                                        ),
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },

            // Default redirect
            {
                path: '/',
                element: <Navigate to={ROUTES.LOGIN} replace />,
            },

            // 404
            {
                path: '*',
                element: (
                    <SuspenseWrapper>
                        <NotFoundPage />
                    </SuspenseWrapper>
                ),
            },
        ],
    },
])

export default router
