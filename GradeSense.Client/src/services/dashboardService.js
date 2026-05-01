import api from './api'

/**
 * Dashboard Service - Unified dashboard data fetching
 */
export const dashboardService = {
    /**
     * Get admin dashboard with system-wide statistics
     * @returns {Promise} Admin dashboard data
     */
    getAdminDashboard: async () => {
        return api.get('/api/dashboard/admin')
    },

    /**
     * Get student dashboard with personal academic overview
     * @param {number} studentId - Student ID
     * @returns {Promise} Student dashboard data
     */
    getStudentDashboard: async (studentId) => {
        return api.get(`/api/dashboard/student/${studentId}`)
    },

    /**
     * Get faculty dashboard with teaching overview
     * @param {number} facultyId - Faculty ID
     * @returns {Promise} Faculty dashboard data
     */
    getFacultyDashboard: async (facultyId) => {
        return api.get(`/api/dashboard/faculty/${facultyId}`)
    },

    /**
     * Get dashboard for current logged-in user (auto-detects role)
     * @returns {Promise} Dashboard data based on user role
     */
    getMyDashboard: async () => {
        return api.get('/api/dashboard/me')
    },

    /**
     * Get attendance calendar for a student
     * @param {number} studentId - Student ID
     * @param {Object} params - Optional parameters { year, month, courseOfferingId }
     * @returns {Promise} Attendance calendar data
     */
    getAttendanceCalendar: async (studentId, params = {}) => {
        return api.get(`/api/dashboard/student/${studentId}/attendance-calendar`, { params })
    },

    /**
     * Get grade analytics for a student
     * @param {number} studentId - Student ID
     * @param {number} semester - Optional semester filter
     * @returns {Promise} Grade analytics data
     */
    getGradeAnalytics: async (studentId, semester = null) => {
        const params = semester ? { semester } : {}
        return api.get(`/api/dashboard/student/${studentId}/grade-analytics`, { params })
    },

    /**
     * Calculate What-If GPA projection
     * @param {Object} request - What-if calculator request
     * @param {number} request.studentId - Student ID
     * @param {Array} request.hypotheticalGrades - Hypothetical grade entries
     * @param {Array} request.hypotheticalCourseGrades - Hypothetical course grades
     * @returns {Promise} What-if calculation result
     */
    calculateWhatIf: async (request) => {
        return api.post('/api/dashboard/student/what-if-calculator', request)
    },

    /**
     * Get enhanced analytics (comparative, trends, distributions)
     * @param {Object} request - EnhancedAnalyticsRequest payload
     * @returns {Promise} Enhanced analytics data
     */
    getEnhancedAnalytics: async (request) => {
        return api.post('/api/dashboard/analytics/enhanced', request)
    },
}

export default dashboardService
