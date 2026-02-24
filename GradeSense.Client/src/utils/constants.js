// App Constants

export const APP_NAME = import.meta.env.VITE_APP_NAME || 'GradeSense'
export const API_URL = import.meta.env.VITE_API_URL || 'https://localhost:7266'
export const ITEMS_PER_PAGE = parseInt(import.meta.env.VITE_ITEMS_PER_PAGE || '10')

// User Roles
export const ROLES = {
    ADMIN: 'Admin',
    FACULTY: 'Faculty',
    STUDENT: 'Student',
}

// Route Paths
export const ROUTES = {
    // Public
    LOGIN: '/login',

    // Admin
    ADMIN_DASHBOARD: '/admin/dashboard',
    ADMIN_PROFILE: '/admin/profile',
    ADMIN_SETTINGS: '/admin/settings',
    ADMIN_USERS: '/admin/users',
    ADMIN_DEPARTMENTS: '/admin/departments',
    ADMIN_BATCHES: '/admin/batches',
    ADMIN_SUBJECTS: '/admin/subjects',
    ADMIN_FACULTIES: '/admin/faculties',
    ADMIN_STUDENTS: '/admin/students',
    ADMIN_COURSE_OFFERINGS: '/admin/course-offerings',
    ADMIN_EVALUATION_SCHEMES: '/admin/evaluation-schemes',
    ADMIN_AUDIT_LOGS: '/admin/audit-logs',

    // Faculty
    FACULTY_DASHBOARD: '/faculty/dashboard',
    FACULTY_PROFILE: '/faculty/profile',
    FACULTY_COURSES: '/faculty/courses',
    FACULTY_STUDENTS: '/faculty/students',
    FACULTY_ALL_STUDENTS: '/faculty/all-students',
    FACULTY_ENROLLMENTS: '/faculty/enrollments',
    FACULTY_SUBJECT_UNITS: '/faculty/subject-units',
    FACULTY_GRADES: '/faculty/grades',
    FACULTY_ASSESSMENTS: '/faculty/assessments',
    FACULTY_ATTENDANCE: '/faculty/attendance',
    FACULTY_AT_RISK: '/faculty/at-risk',
    FACULTY_REPORTS: '/faculty/reports',

    // Student
    STUDENT_DASHBOARD: '/student/dashboard',
    STUDENT_COURSES: '/student/courses',
    STUDENT_GRADES: '/student/grades',
    STUDENT_ATTENDANCE: '/student/attendance',
    STUDENT_PROFILE: '/student/profile',
}

// API Endpoints
export const API_ENDPOINTS = {
    // Auth
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    REFRESH_TOKEN: '/api/auth/refresh-token',

    // Users
    USERS: '/api/users',

    // Departments
    DEPARTMENTS: '/api/departments',

    // Batches
    BATCHES: '/api/batches',

    // Subjects
    SUBJECTS: '/api/subjects',

    // Subject Units
    SUBJECT_UNITS: '/api/subjectunits',

    // Faculties
    FACULTIES: '/api/faculties',

    // Students
    STUDENTS: '/api/students',

    // Course Offerings
    COURSE_OFFERINGS: '/api/courseofferings',

    // Course Enrollments
    COURSE_ENROLLMENTS: '/api/courseenrollments',

    // Faculty Assignments
    FACULTY_ASSIGNMENTS: '/api/facultyassignments',

    // Evaluation Schemes
    EVALUATION_SCHEMES: '/api/evaluationschemes',

    // Assessment Items
    ASSESSMENT_ITEMS: '/api/assessmentitems',

    // Student Marks
    STUDENT_MARKS: '/api/studentmarks',

    // Attendance Records
    ATTENDANCE_RECORDS: '/api/attendancerecords',

    // Predictions
    PREDICTIONS: '/api/predictions',

    // Upload History
    UPLOAD_HISTORIES: '/api/uploadhistories',

    // Audit Logs
    AUDIT_LOGS: '/api/auditlogs',
}

// Pagination defaults
export const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_PAGE_SIZE: 10,
    PAGE_SIZE_OPTIONS: [5, 10, 25, 50, 100],
}

// Toast duration
export const TOAST_DURATION = 4000

// Grade scale
export const GRADE_SCALE = [
    { min: 90, max: 100, grade: 'A+', points: 10 },
    { min: 80, max: 89, grade: 'A', points: 9 },
    { min: 70, max: 79, grade: 'B+', points: 8 },
    { min: 60, max: 69, grade: 'B', points: 7 },
    { min: 50, max: 59, grade: 'C', points: 6 },
    { min: 40, max: 49, grade: 'D', points: 5 },
    { min: 0, max: 39, grade: 'F', points: 0 },
]

// Attendance threshold
export const ATTENDANCE_THRESHOLD = 75

// Status options
export const STATUS_OPTIONS = [
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'Inactive' },
]

// Gender options
export const GENDER_OPTIONS = [
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' },
    { value: 'Other', label: 'Other' },
]

// Semester options
export const SEMESTER_OPTIONS = [
    { value: 1, label: 'Semester 1' },
    { value: 2, label: 'Semester 2' },
    { value: 3, label: 'Semester 3' },
    { value: 4, label: 'Semester 4' },
    { value: 5, label: 'Semester 5' },
    { value: 6, label: 'Semester 6' },
    { value: 7, label: 'Semester 7' },
    { value: 8, label: 'Semester 8' },
]

// Assessment types
export const ASSESSMENT_TYPES = [
    { value: 'Assignment', label: 'Assignment' },
    { value: 'Quiz', label: 'Quiz' },
    { value: 'MidTerm', label: 'Mid Term' },
    { value: 'EndTerm', label: 'End Term' },
    { value: 'Project', label: 'Project' },
    { value: 'Practical', label: 'Practical' },
    { value: 'Presentation', label: 'Presentation' },
]

// Attendance status
export const ATTENDANCE_STATUS = [
    { value: 'Present', label: 'Present' },
    { value: 'Absent', label: 'Absent' },
    { value: 'Late', label: 'Late' },
    { value: 'Excused', label: 'Excused' },
]

// Risk levels for predictions
export const RISK_LEVELS = [
    { value: 'Low', label: 'Low Risk', color: 'badge-success' },
    { value: 'Medium', label: 'Medium Risk', color: 'badge-warning' },
    { value: 'High', label: 'High Risk', color: 'badge-error' },
]
