import api from './api';

/**
 * Export Service - Handles CSV and Excel exports for all entities
 * 
 * CSV exports: Basic list data (lighter weight)
 * Excel exports: Full detailed data (comprehensive)
 */

// ============================================================================
// Users
// ============================================================================

export const exportUsersToCsv = async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.role) params.append('Role', filters.role);
    if (filters.search) params.append('Search', filters.search);
    if (filters.isActive !== undefined) params.append('IsActive', filters.isActive);

    const response = await api.get(`/api/export/users/csv?${params.toString()}`, {
        responseType: 'blob'
    });
    return response;
};

export const exportUsersToExcel = async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.role) params.append('Role', filters.role);
    if (filters.search) params.append('Search', filters.search);
    if (filters.isActive !== undefined) params.append('IsActive', filters.isActive);

    const response = await api.get(`/api/export/users/excel?${params.toString()}`, {
        responseType: 'blob'
    });
    return response;
};

// ============================================================================
// Faculties
// ============================================================================

export const exportFacultiesToCsv = async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.departmentId) params.append('DepartmentId', filters.departmentId);
    if (filters.designation) params.append('Designation', filters.designation);
    if (filters.search) params.append('Search', filters.search);
    if (filters.isActive !== undefined) params.append('IsActive', filters.isActive);

    const response = await api.get(`/api/export/faculties/csv?${params.toString()}`, {
        responseType: 'blob'
    });
    return response;
};

export const exportFacultiesToExcel = async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.departmentId) params.append('DepartmentId', filters.departmentId);
    if (filters.designation) params.append('Designation', filters.designation);
    if (filters.search) params.append('Search', filters.search);
    if (filters.isActive !== undefined) params.append('IsActive', filters.isActive);

    const response = await api.get(`/api/export/faculties/excel?${params.toString()}`, {
        responseType: 'blob'
    });
    return response;
};

// ============================================================================
// Students
// ============================================================================

export const exportStudentsToCsv = async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.departmentId) params.append('DepartmentId', filters.departmentId);
    if (filters.status) params.append('Status', filters.status);
    if (filters.admissionYear) params.append('AdmissionYear', filters.admissionYear);
    if (filters.currentSemester) params.append('CurrentSemester', filters.currentSemester);

    const response = await api.get(`/api/export/students/csv?${params.toString()}`, {
        responseType: 'blob'
    });
    return response;
};

export const exportStudentsToExcel = async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.departmentId) params.append('DepartmentId', filters.departmentId);
    if (filters.status) params.append('Status', filters.status);
    if (filters.admissionYear) params.append('AdmissionYear', filters.admissionYear);
    if (filters.currentSemester) params.append('CurrentSemester', filters.currentSemester);

    const response = await api.get(`/api/export/students/excel?${params.toString()}`, {
        responseType: 'blob'
    });
    return response;
};

// ============================================================================
// Departments
// ============================================================================

export const exportDepartmentsToCsv = async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.search) params.append('Search', filters.search);
    if (filters.isActive != null) params.append('IsActive', filters.isActive);

    const response = await api.get(`/api/export/departments/csv?${params.toString()}`, {
        responseType: 'blob'
    });
    return response;
};

export const exportDepartmentsToExcel = async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.search) params.append('Search', filters.search);
    if (filters.isActive != null) params.append('IsActive', filters.isActive);

    const response = await api.get(`/api/export/departments/excel?${params.toString()}`, {
        responseType: 'blob'
    });
    return response;
};

// ============================================================================
// Batches
// ============================================================================

export const exportBatchesToCsv = async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.departmentId) params.append('DepartmentId', filters.departmentId);
    if (filters.semester) params.append('Semester', filters.semester);
    if (filters.academicYear) params.append('AcademicYear', filters.academicYear);
    if (filters.search) params.append('Search', filters.search);
    if (filters.isActive != null) params.append('IsActive', filters.isActive);

    const response = await api.get(`/api/export/batches/csv?${params.toString()}`, {
        responseType: 'blob'
    });
    return response;
};

export const exportBatchesToExcel = async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.departmentId) params.append('DepartmentId', filters.departmentId);
    if (filters.semester) params.append('Semester', filters.semester);
    if (filters.academicYear) params.append('AcademicYear', filters.academicYear);
    if (filters.search) params.append('Search', filters.search);
    if (filters.isActive != null) params.append('IsActive', filters.isActive);

    const response = await api.get(`/api/export/batches/excel?${params.toString()}`, {
        responseType: 'blob'
    });
    return response;
};

// ============================================================================
// Subjects
// ============================================================================

export const exportSubjectsToCsv = async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.departmentId) params.append('DepartmentId', filters.departmentId);
    if (filters.semester) params.append('Semester', filters.semester);
    if (filters.subjectType) params.append('SubjectType', filters.subjectType);
    if (filters.isElective != null) params.append('IsElective', filters.isElective);
    if (filters.search) params.append('Search', filters.search);
    if (filters.isActive != null) params.append('IsActive', filters.isActive);

    const response = await api.get(`/api/export/subjects/csv?${params.toString()}`, {
        responseType: 'blob'
    });
    return response;
};

export const exportSubjectsToExcel = async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.departmentId) params.append('DepartmentId', filters.departmentId);
    if (filters.semester) params.append('Semester', filters.semester);
    if (filters.subjectType) params.append('SubjectType', filters.subjectType);
    if (filters.isElective != null) params.append('IsElective', filters.isElective);
    if (filters.search) params.append('Search', filters.search);
    if (filters.isActive != null) params.append('IsActive', filters.isActive);

    const response = await api.get(`/api/export/subjects/excel?${params.toString()}`, {
        responseType: 'blob'
    });
    return response;
};

// ============================================================================
// Course Offerings
// ============================================================================

export const exportCourseOfferingsToCsv = async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.subjectId) params.append('SubjectId', filters.subjectId);
    if (filters.batchId) params.append('BatchId', filters.batchId);
    if (filters.departmentId) params.append('DepartmentId', filters.departmentId);
    if (filters.academicYear) params.append('AcademicYear', filters.academicYear);
    if (filters.search) params.append('Search', filters.search);
    if (filters.isActive != null) params.append('IsActive', filters.isActive);

    const response = await api.get(`/api/export/course-offerings/csv?${params.toString()}`, {
        responseType: 'blob'
    });
    return response;
};

export const exportCourseOfferingsToExcel = async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.subjectId) params.append('SubjectId', filters.subjectId);
    if (filters.batchId) params.append('BatchId', filters.batchId);
    if (filters.departmentId) params.append('DepartmentId', filters.departmentId);
    if (filters.academicYear) params.append('AcademicYear', filters.academicYear);
    if (filters.search) params.append('Search', filters.search);
    if (filters.isActive != null) params.append('IsActive', filters.isActive);

    const response = await api.get(`/api/export/course-offerings/excel?${params.toString()}`, {
        responseType: 'blob'
    });
    return response;
};

// ============================================================================
// Evaluation Schemes
// ============================================================================

export const exportEvaluationSchemesToCsv = async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.courseOfferingId) params.append('CourseOfferingId', filters.courseOfferingId);
    if (filters.subjectId) params.append('SubjectId', filters.subjectId);
    if (filters.batchId) params.append('BatchId', filters.batchId);
    if (filters.evaluationType) params.append('EvaluationType', filters.evaluationType);
    if (filters.search) params.append('Search', filters.search);
    if (filters.isActive != null) params.append('IsActive', filters.isActive);

    const response = await api.get(`/api/export/evaluation-schemes/csv?${params.toString()}`, {
        responseType: 'blob'
    });
    return response;
};

export const exportEvaluationSchemesToExcel = async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.courseOfferingId) params.append('CourseOfferingId', filters.courseOfferingId);
    if (filters.subjectId) params.append('SubjectId', filters.subjectId);
    if (filters.batchId) params.append('BatchId', filters.batchId);
    if (filters.evaluationType) params.append('EvaluationType', filters.evaluationType);
    if (filters.search) params.append('Search', filters.search);
    if (filters.isActive != null) params.append('IsActive', filters.isActive);

    const response = await api.get(`/api/export/evaluation-schemes/excel?${params.toString()}`, {
        responseType: 'blob'
    });
    return response;
};

// ============================================================================
// Audit Logs
// ============================================================================

export const exportAuditLogsToCsv = async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.action) params.append('Action', filters.action);
    if (filters.entityName) params.append('EntityName', filters.entityName);
    if (filters.actorUserId) params.append('ActorUserId', filters.actorUserId);
    if (filters.fromDate) params.append('FromDate', filters.fromDate);
    if (filters.toDate) params.append('ToDate', filters.toDate);
    if (filters.search) params.append('Search', filters.search);

    const response = await api.get(`/api/export/audit-logs/csv?${params.toString()}`, {
        responseType: 'blob'
    });
    return response;
};

export const exportAuditLogsToExcel = async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.action) params.append('Action', filters.action);
    if (filters.entityName) params.append('EntityName', filters.entityName);
    if (filters.actorUserId) params.append('ActorUserId', filters.actorUserId);
    if (filters.fromDate) params.append('FromDate', filters.fromDate);
    if (filters.toDate) params.append('ToDate', filters.toDate);
    if (filters.search) params.append('Search', filters.search);

    const response = await api.get(`/api/export/audit-logs/excel?${params.toString()}`, {
        responseType: 'blob'
    });
    return response;
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Download a blob as a file
 * @param {Blob} blob - The blob data
 * @param {string} filename - The filename for the download
 */
export const downloadBlob = (blob, filename) => {
    // Ensure we have a valid Blob
    if (!blob || !(blob instanceof Blob)) {
        throw new Error('Invalid blob data received');
    }

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
};

/**
 * Export helper that handles the download
 * @param {Function} exportFn - The export function to call
 * @param {Object} filters - The filters to apply
 * @param {string} filename - The filename for the download
 */
export const handleExport = async (exportFn, filters, filename) => {
    try {
        const blob = await exportFn(filters);
        downloadBlob(blob, filename);
        return { success: true };
    } catch (error) {
        console.error('Export failed:', error);
        return { success: false, error: error.message };
    }
};

export default {
    // Users
    exportUsersToCsv,
    exportUsersToExcel,
    // Faculties
    exportFacultiesToCsv,
    exportFacultiesToExcel,
    // Students
    exportStudentsToCsv,
    exportStudentsToExcel,
    // Departments
    exportDepartmentsToCsv,
    exportDepartmentsToExcel,
    // Batches
    exportBatchesToCsv,
    exportBatchesToExcel,
    // Subjects
    exportSubjectsToCsv,
    exportSubjectsToExcel,
    // Course Offerings
    exportCourseOfferingsToCsv,
    exportCourseOfferingsToExcel,
    // Evaluation Schemes
    exportEvaluationSchemesToCsv,
    exportEvaluationSchemesToExcel,
    // Audit Logs
    exportAuditLogsToCsv,
    exportAuditLogsToExcel,
    // Utilities
    downloadBlob,
    handleExport
};
