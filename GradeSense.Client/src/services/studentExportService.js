import api from './api';

/**
 * Student Export Service - Handles exports for student's own academic data
 * 
 * These endpoints are accessible only by authenticated students
 * and export data specific to the logged-in student.
 * 
 * CSV exports: Basic data (lighter weight)
 * Excel exports: Full detailed data with multiple sheets
 */

// ============================================================================
// Transcript Exports
// ============================================================================

/**
 * Export student's academic transcript to CSV
 * @param {Object} filters - Optional filters
 * @param {number} filters.semester - Filter by specific semester
 * @param {string} filters.academicYear - Filter by academic year
 */
export const exportTranscriptToCsv = async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.semester) params.append('Semester', filters.semester);
    if (filters.academicYear) params.append('AcademicYear', filters.academicYear);

    const response = await api.get(`/api/studentexport/transcript/csv?${params.toString()}`, {
        responseType: 'blob'
    });
    return response;
};

/**
 * Export student's academic transcript to Excel (with full details)
 * @param {Object} filters - Optional filters
 * @param {number} filters.semester - Filter by specific semester
 * @param {string} filters.academicYear - Filter by academic year
 */
export const exportTranscriptToExcel = async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.semester) params.append('Semester', filters.semester);
    if (filters.academicYear) params.append('AcademicYear', filters.academicYear);

    const response = await api.get(`/api/studentexport/transcript/excel?${params.toString()}`, {
        responseType: 'blob'
    });
    return response;
};

// ============================================================================
// Grades Exports
// ============================================================================

/**
 * Export student's grades for a specific course to CSV
 * @param {number} courseOfferingId - The course offering ID
 */
export const exportGradesToCsv = async (courseOfferingId) => {
    const response = await api.get(`/api/studentexport/grades/${courseOfferingId}/csv`, {
        responseType: 'blob'
    });
    return response;
};

/**
 * Export student's grades for a specific course to Excel
 * @param {number} courseOfferingId - The course offering ID
 */
export const exportGradesToExcel = async (courseOfferingId) => {
    const response = await api.get(`/api/studentexport/grades/${courseOfferingId}/excel`, {
        responseType: 'blob'
    });
    return response;
};

/**
 * Export all grades across all courses to Excel
 * @param {Object} filters - Optional filters
 * @param {number} filters.semester - Filter by specific semester
 */
export const exportAllGradesToExcel = async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.semester) params.append('semester', filters.semester);

    const response = await api.get(`/api/studentexport/grades/all/excel?${params.toString()}`, {
        responseType: 'blob'
    });
    return response;
};

// ============================================================================
// Attendance Exports
// ============================================================================

/**
 * Export student's attendance records to CSV
 * @param {Object} filters - Optional filters
 * @param {number} filters.courseOfferingId - Filter by specific course
 * @param {number} filters.semester - Filter by semester
 * @param {Date} filters.fromDate - Filter from date
 * @param {Date} filters.toDate - Filter to date
 */
export const exportAttendanceToCsv = async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.courseOfferingId) params.append('CourseOfferingId', filters.courseOfferingId);
    if (filters.semester) params.append('Semester', filters.semester);
    if (filters.fromDate) params.append('FromDate', filters.fromDate.toISOString());
    if (filters.toDate) params.append('ToDate', filters.toDate.toISOString());

    const response = await api.get(`/api/studentexport/attendance/csv?${params.toString()}`, {
        responseType: 'blob'
    });
    return response;
};

/**
 * Export student's attendance records to Excel (with summary)
 * @param {Object} filters - Optional filters
 * @param {number} filters.courseOfferingId - Filter by specific course
 * @param {number} filters.semester - Filter by semester
 * @param {Date} filters.fromDate - Filter from date
 * @param {Date} filters.toDate - Filter to date
 */
export const exportAttendanceToExcel = async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.courseOfferingId) params.append('CourseOfferingId', filters.courseOfferingId);
    if (filters.semester) params.append('Semester', filters.semester);
    if (filters.fromDate) params.append('FromDate', filters.fromDate.toISOString());
    if (filters.toDate) params.append('ToDate', filters.toDate.toISOString());

    const response = await api.get(`/api/studentexport/attendance/excel?${params.toString()}`, {
        responseType: 'blob'
    });
    return response;
};

// ============================================================================
// Academic Report Export
// ============================================================================

/**
 * Export comprehensive academic report (grades, attendance, performance)
 * @param {Object} filters - Optional filters
 * @param {number} filters.semester - Filter by specific semester
 */
export const exportAcademicReportToExcel = async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.semester) params.append('semester', filters.semester);

    const response = await api.get(`/api/studentexport/academic-report/excel?${params.toString()}`, {
        responseType: 'blob'
    });
    return response;
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Download a blob response as a file
 * @param {Blob} blob - The blob data
 * @param {string} filename - The filename to save as
 */
export const downloadBlobAsFile = (blob, filename) => {
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
 * Get filename from Content-Disposition header or generate default
 * @param {Object} response - Axios response object
 * @param {string} defaultName - Default filename if not found in header
 */
export const getFilenameFromResponse = (response, defaultName) => {
    try {
        const contentDisposition = response?.headers?.['content-disposition'];
        if (contentDisposition) {
            const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
            if (match && match[1]) {
                return match[1].replace(/['"]/g, '');
            }
        }
    } catch (e) {
        console.warn('Could not parse filename from response headers:', e);
    }
    return defaultName;
};

// Default export with all functions
export const studentExportService = {
    // Transcript
    exportTranscriptToCsv,
    exportTranscriptToExcel,

    // Grades
    exportGradesToCsv,
    exportGradesToExcel,
    exportAllGradesToExcel,

    // Attendance
    exportAttendanceToCsv,
    exportAttendanceToExcel,

    // Academic Report
    exportAcademicReportToExcel,

    // Helpers
    downloadBlobAsFile,
    getFilenameFromResponse,
};

export default studentExportService;
