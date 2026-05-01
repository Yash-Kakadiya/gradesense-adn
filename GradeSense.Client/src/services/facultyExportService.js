import api from './api';

/**
 * Faculty Export Service - Handles exports for faculty's course data
 * 
 * These endpoints are accessible only by authenticated faculty members
 * and export data for courses assigned to the logged-in faculty.
 * 
 * CSV exports: Basic data (lighter weight)
 * Excel exports: Full detailed data with multiple sheets and headers
 */

// ============================================================================
// Student Roster Exports
// ============================================================================

/**
 * Export student roster for a course to CSV
 * @param {number} courseOfferingId - The course offering ID
 * @param {Object} filters - Optional filters
 * @param {string} filters.status - Filter by enrollment status (Active, Completed, etc.)
 */
export const exportRosterToCsv = async (courseOfferingId, filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);

    const response = await api.get(`/api/facultyexport/roster/${courseOfferingId}/csv?${params.toString()}`, {
        responseType: 'blob'
    });
    return response;
};

/**
 * Export student roster for a course to Excel (with full details and header info)
 * @param {number} courseOfferingId - The course offering ID
 * @param {Object} filters - Optional filters
 * @param {string} filters.status - Filter by enrollment status
 */
export const exportRosterToExcel = async (courseOfferingId, filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);

    const response = await api.get(`/api/facultyexport/roster/${courseOfferingId}/excel?${params.toString()}`, {
        responseType: 'blob'
    });
    return response;
};

// ============================================================================
// Grades Exports
// ============================================================================

/**
 * Export all student grades for a course to CSV
 * @param {number} courseOfferingId - The course offering ID
 * @param {Object} filters - Optional filters
 * @param {number} filters.assessmentItemId - Filter by specific assessment
 */
export const exportGradesToCsv = async (courseOfferingId, filters = {}) => {
    const params = new URLSearchParams();
    if (filters.assessmentItemId) params.append('assessmentItemId', filters.assessmentItemId);

    const response = await api.get(`/api/facultyexport/grades/${courseOfferingId}/csv?${params.toString()}`, {
        responseType: 'blob'
    });
    return response;
};

/**
 * Export all student grades for a course to Excel (with statistics and header)
 * @param {number} courseOfferingId - The course offering ID
 * @param {Object} filters - Optional filters
 * @param {number} filters.assessmentItemId - Filter by specific assessment
 */
export const exportGradesToExcel = async (courseOfferingId, filters = {}) => {
    const params = new URLSearchParams();
    if (filters.assessmentItemId) params.append('assessmentItemId', filters.assessmentItemId);

    const response = await api.get(`/api/facultyexport/grades/${courseOfferingId}/excel?${params.toString()}`, {
        responseType: 'blob'
    });
    return response;
};

/**
 * Export grades for a specific assessment item
 * @param {number} assessmentItemId - The assessment item ID
 */
export const exportAssessmentGrades = async (assessmentItemId) => {
    const response = await api.get(`/api/facultyexport/assessment/${assessmentItemId}/grades`, {
        responseType: 'blob'
    });
    return response;
};

// ============================================================================
// Attendance Exports
// ============================================================================

/**
 * Export attendance records for a course to CSV
 * @param {number} courseOfferingId - The course offering ID
 * @param {Object} filters - Optional filters
 * @param {Date} filters.fromDate - Filter from date
 * @param {Date} filters.toDate - Filter to date
 */
export const exportAttendanceToCsv = async (courseOfferingId, filters = {}) => {
    const params = new URLSearchParams();
    if (filters.fromDate) params.append('fromDate', filters.fromDate.toISOString());
    if (filters.toDate) params.append('toDate', filters.toDate.toISOString());

    const response = await api.get(`/api/facultyexport/attendance/${courseOfferingId}/csv?${params.toString()}`, {
        responseType: 'blob'
    });
    return response;
};

/**
 * Export attendance records for a course to Excel (with summary and header)
 * @param {number} courseOfferingId - The course offering ID
 * @param {Object} filters - Optional filters
 * @param {Date} filters.fromDate - Filter from date
 * @param {Date} filters.toDate - Filter to date
 */
export const exportAttendanceToExcel = async (courseOfferingId, filters = {}) => {
    const params = new URLSearchParams();
    if (filters.fromDate) params.append('fromDate', filters.fromDate.toISOString());
    if (filters.toDate) params.append('toDate', filters.toDate.toISOString());

    const response = await api.get(`/api/facultyexport/attendance/${courseOfferingId}/excel?${params.toString()}`, {
        responseType: 'blob'
    });
    return response;
};

// ============================================================================
// At-Risk Students Exports
// ============================================================================

/**
 * Export at-risk students for a course to CSV
 * @param {number} courseOfferingId - The course offering ID
 * @param {Object} filters - Optional filters
 * @param {string} filters.riskLevel - Filter by risk level (High, Medium)
 */
export const exportAtRiskToCsv = async (courseOfferingId, filters = {}) => {
    const params = new URLSearchParams();
    if (filters.riskLevel) params.append('riskLevel', filters.riskLevel);

    const response = await api.get(`/api/facultyexport/at-risk/${courseOfferingId}/csv?${params.toString()}`, {
        responseType: 'blob'
    });
    return response;
};

/**
 * Export at-risk students for a course to Excel (with recommendations)
 * @param {number} courseOfferingId - The course offering ID
 * @param {Object} filters - Optional filters
 * @param {string} filters.riskLevel - Filter by risk level (High, Medium)
 */
export const exportAtRiskToExcel = async (courseOfferingId, filters = {}) => {
    const params = new URLSearchParams();
    if (filters.riskLevel) params.append('riskLevel', filters.riskLevel);

    const response = await api.get(`/api/facultyexport/at-risk/${courseOfferingId}/excel?${params.toString()}`, {
        responseType: 'blob'
    });
    return response;
};

// ============================================================================
// Comprehensive Course Report
// ============================================================================

/**
 * Export comprehensive course report (roster, grades, attendance, at-risk)
 * @param {number} courseOfferingId - The course offering ID
 */
export const exportCourseReport = async (courseOfferingId) => {
    const response = await api.get(`/api/facultyexport/course-report/${courseOfferingId}`, {
        responseType: 'blob'
    });
    return response;
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get filename from response headers or generate a default one
 * @param {Object} response - Axios response object
 * @param {string} defaultName - Default filename if not found in headers
 * @returns {string} - The filename to use
 */
export const getFilenameFromResponse = (response, defaultName) => {
    const contentDisposition = response?.headers?.['content-disposition'];
    if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
            return filenameMatch[1].replace(/['"]/g, '');
        }
    }
    return defaultName;
};

/**
 * Download blob as file
 * @param {Blob} blob - The blob data to download
 * @param {string} filename - The filename for the download
 */
export const downloadBlob = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
};

/**
 * Helper to handle export response and trigger download
 * @param {Object} response - The API response
 * @param {string} defaultFilename - Default filename if not in response
 */
export const handleExportDownload = (response, defaultFilename) => {
    const filename = getFilenameFromResponse(response, defaultFilename);
    const blob = response.data instanceof Blob
        ? response.data
        : new Blob([response.data], { type: response.headers['content-type'] });
    downloadBlob(blob, filename);
};

export default {
    // Roster
    exportRosterToCsv,
    exportRosterToExcel,
    // Grades
    exportGradesToCsv,
    exportGradesToExcel,
    exportAssessmentGrades,
    // Attendance
    exportAttendanceToCsv,
    exportAttendanceToExcel,
    // At-Risk
    exportAtRiskToCsv,
    exportAtRiskToExcel,
    // Comprehensive
    exportCourseReport,
    // Helpers
    getFilenameFromResponse,
    downloadBlob,
    handleExportDownload
};
