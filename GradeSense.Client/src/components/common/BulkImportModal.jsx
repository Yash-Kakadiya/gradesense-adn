import { useState, useRef } from 'react'
import { useMutation } from '@tanstack/react-query'
// Direct imports to avoid circular dependency with index.js
import Modal from './Modal'
import Button from './Button'
import Badge from './Badge'
import { cn } from '@/utils/helpers'
import { getErrorMessage } from '@/utils/errorHandler'
import toast from 'react-hot-toast'
import {
    Upload,
    Download,
    FileSpreadsheet,
    FileText,
    CheckCircle,
    XCircle,
    AlertCircle,
    Loader2,
    ChevronRight,
    ArrowLeft,
    RefreshCcw,
} from 'lucide-react'

/**
 * BulkImportModal - Reusable component for bulk import with validation preview
 * 
 * @param {boolean} isOpen - Modal open state
 * @param {function} onClose - Close handler
 * @param {string} title - Modal title (e.g., "Import Grades", "Import Attendance")
 * @param {string} entityName - Entity being imported (e.g., "grades", "attendance")
 * @param {function} onDownloadTemplate - Function to download template (returns blob)
 * @param {function} onValidate - Function to validate file (returns validation response)
 * @param {function} onExecuteImport - Function to execute import
 * @param {object} importContext - Context for import (e.g., { assessmentItemId, graderId })
 * @param {function} onSuccess - Callback after successful import
 */
const BulkImportModal = ({
    isOpen,
    onClose,
    title = "Import Data",
    entityName = "records",
    onDownloadTemplate,
    onValidate,
    onExecuteImport,
    importContext = {},
    onSuccess,
}) => {
    // State management
    const [step, setStep] = useState('upload') // 'upload' | 'preview' | 'result'
    const [selectedFile, setSelectedFile] = useState(null)
    const [validationResult, setValidationResult] = useState(null)
    const [conflictResolution, setConflictResolution] = useState('skip')
    const [importResult, setImportResult] = useState(null)
    const [isDownloading, setIsDownloading] = useState(false)
    const fileInputRef = useRef(null)

    // Helper to normalize PascalCase response from API to camelCase
    const normalizeValidationResponse = (data) => {
        if (!data) return null
        return {
            totalRows: data.totalRows ?? data.TotalRows ?? 0,
            validRows: data.validRows ?? data.ValidRows ?? 0,
            invalidRows: data.invalidRows ?? data.InvalidRows ?? 0,
            conflictRows: data.conflictRows ?? data.ConflictRows ?? 0,
            canProceed: data.canProceed ?? data.CanProceed ?? true,
            rows: (data.rows ?? data.Rows ?? []).map(row => ({
                rowNumber: row.rowNumber ?? row.RowNumber,
                rollNumber: row.rollNumber ?? row.RollNumber,
                studentName: row.studentName ?? row.StudentName,
                marksObtained: row.marksObtained ?? row.MarksObtained,
                status: row.status ?? row.Status,
                isAbsent: row.isAbsent ?? row.IsAbsent,
                remarks: row.remarks ?? row.Remarks,
                studentId: row.studentId ?? row.StudentId,
                enrollmentId: row.enrollmentId ?? row.EnrollmentId,
                existingMarks: row.existingMarks ?? row.ExistingMarks,
                existingStatus: row.existingStatus ?? row.ExistingStatus,
                isValid: row.isValid ?? row.IsValid,
                hasConflict: row.hasConflict ?? row.HasConflict,
                errors: row.errors ?? row.Errors ?? [],
            }))
        }
    }

    // Helper to normalize import result response
    const normalizeImportResponse = (data) => {
        if (!data) return null
        return {
            totalRecords: data.totalRecords ?? data.TotalRecords ?? 0,
            successCount: data.successCount ?? data.SuccessCount ?? 0,
            errorCount: data.errorCount ?? data.ErrorCount ?? 0,
            isSuccess: data.isSuccess ?? data.IsSuccess ?? false,
            errors: (data.errors ?? data.Errors ?? []).map(err => ({
                rowNumber: err.rowNumber ?? err.RowNumber,
                identifier: err.identifier ?? err.Identifier,
                errorMessage: err.errorMessage ?? err.ErrorMessage,
            })),
            successfulRecords: data.successfulRecords ?? data.SuccessfulRecords ?? [],
        }
    }

    // Helper to extract data from API response (handles both camelCase and PascalCase)
    const extractResponseData = (response) => {
        // Axios response structure: response.data = API response body
        const body = response?.data || response
        // API returns { Success, Message, Data } or { success, message, data }
        return body?.data ?? body?.Data ?? body
    }

    // Mutations
    const validateMutation = useMutation({
        mutationFn: onValidate,
        onSuccess: (response) => {
            console.log('[BulkImportModal] Validation response:', response)
            const rawData = extractResponseData(response)
            console.log('[BulkImportModal] Extracted validation data:', rawData)
            const normalized = normalizeValidationResponse(rawData)
            console.log('[BulkImportModal] Normalized validation:', normalized)
            setValidationResult(normalized)
            setStep('preview')
        },
        onError: (error) => {
            console.error('[BulkImportModal] Validation error:', error)
            toast.error(getErrorMessage(error, 'Validation failed'))
        }
    })

    const importMutation = useMutation({
        mutationFn: onExecuteImport,
        onSuccess: (response) => {
            console.log('[BulkImportModal] Import response:', response)
            const rawData = extractResponseData(response)
            console.log('[BulkImportModal] Extracted data:', rawData)
            const normalized = normalizeImportResponse(rawData)
            console.log('[BulkImportModal] Normalized result:', normalized)
            setImportResult(normalized)
            setStep('result')
            if (onSuccess) {
                onSuccess(rawData)
            }
        },
        onError: (error) => {
            console.error('[BulkImportModal] Import error:', error)
            toast.error(getErrorMessage(error, 'Import failed'))
        }
    })

    // Handlers
    const handleDownloadTemplate = async () => {
        if (!onDownloadTemplate) return
        setIsDownloading(true)
        try {
            const blob = await onDownloadTemplate()
            const url = window.URL.createObjectURL(blob.data || blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `${entityName}_template.xlsx`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)
            toast.success('Template downloaded')
        } catch (error) {
            toast.error(getErrorMessage(error, 'Failed to download template'))
        } finally {
            setIsDownloading(false)
        }
    }

    const handleFileSelect = (event) => {
        const file = event.target.files?.[0]
        if (file) {
            const validTypes = ['.csv', '.xlsx', '.xls']
            const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()
            if (!validTypes.includes(fileExt)) {
                toast.error('Please select a CSV or Excel file')
                return
            }
            setSelectedFile(file)
        }
    }

    const handleDrop = (event) => {
        event.preventDefault()
        const file = event.dataTransfer.files?.[0]
        if (file) {
            const validTypes = ['.csv', '.xlsx', '.xls']
            const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()
            if (!validTypes.includes(fileExt)) {
                toast.error('Please select a CSV or Excel file')
                return
            }
            setSelectedFile(file)
        }
    }

    const handleDragOver = (event) => {
        event.preventDefault()
    }

    const handleValidate = () => {
        if (!selectedFile) {
            toast.error('Please select a file first')
            return
        }
        validateMutation.mutate({ file: selectedFile, ...importContext })
    }

    const handleImport = () => {
        if (!validationResult) return

        // Filter rows based on user selection
        const rowsToImport = validationResult.rows
            .filter(row => row.isValid || (row.hasConflict && conflictResolution !== 'error'))
            .map(row => ({
                rowNumber: row.rowNumber,
                rollNumber: row.rollNumber,
                marksObtained: row.marksObtained?.toString() || row.status,
                status: row.status,
                isAbsent: row.isAbsent || false,
                remarks: row.remarks || ''
            }))

        // Debug logging
        console.log('[BulkImportModal] handleImport - validationResult.rows:', validationResult.rows)
        console.log('[BulkImportModal] handleImport - conflictResolution:', conflictResolution)
        console.log('[BulkImportModal] handleImport - rowsToImport:', rowsToImport)
        console.log('[BulkImportModal] handleImport - importContext:', importContext)

        importMutation.mutate({
            ...importContext,
            conflictResolution,
            rows: rowsToImport
        })
    }

    const handleReset = () => {
        setStep('upload')
        setSelectedFile(null)
        setValidationResult(null)
        setImportResult(null)
        setConflictResolution('skip')
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const handleClose = () => {
        handleReset()
        onClose()
    }

    // Render step content
    const renderUploadStep = () => (
        <div className="space-y-6">
            {/* Template download */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex items-start gap-3">
                    <FileSpreadsheet className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                        <p className="text-sm font-medium text-blue-900">Download Template</p>
                        <p className="text-xs text-blue-700 mt-1">
                            Use our template to ensure correct format for import
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDownloadTemplate}
                        disabled={isDownloading || !onDownloadTemplate}
                    >
                        {isDownloading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Download className="w-4 h-4" />
                        )}
                        <span className="ml-2">Download</span>
                    </Button>
                </div>
            </div>

            {/* File upload area */}
            <div
                className={cn(
                    "border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer",
                    selectedFile ? "border-green-400 bg-green-50" : "border-gray-300 hover:border-blue-400"
                )}
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    className="hidden"
                    onChange={handleFileSelect}
                />
                {selectedFile ? (
                    <div className="flex flex-col items-center">
                        <div className="p-3 bg-green-100 rounded-full mb-3">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-900">{selectedFile.name}</span>
                        <span className="text-xs text-gray-500 mt-1">
                            {(selectedFile.size / 1024).toFixed(1)} KB
                        </span>
                        <button
                            type="button"
                            className="mt-2 text-xs text-blue-600 hover:underline"
                            onClick={(e) => {
                                e.stopPropagation()
                                setSelectedFile(null)
                                if (fileInputRef.current) fileInputRef.current.value = ''
                            }}
                        >
                            Change file
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center">
                        <div className="p-3 bg-gray-100 rounded-full mb-3">
                            <Upload className="w-6 h-6 text-gray-500" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                            Click to upload or drag and drop
                        </span>
                        <span className="text-xs text-gray-500 mt-1">
                            CSV or Excel files (.xlsx, .xls)
                        </span>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={handleClose}>Cancel</Button>
                <Button
                    variant="primary"
                    onClick={handleValidate}
                    disabled={!selectedFile || validateMutation.isPending}
                >
                    {validateMutation.isPending ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Validating...
                        </>
                    ) : (
                        <>
                            Validate & Preview
                            <ChevronRight className="w-4 h-4 ml-2" />
                        </>
                    )}
                </Button>
            </div>
        </div>
    )

    const renderPreviewStep = () => {
        if (!validationResult) return null

        const { totalRows, validRows, invalidRows, conflictRows, rows } = validationResult

        return (
            <div className="space-y-4">
                {/* Summary */}
                <div className="grid grid-cols-4 gap-3">
                    <div className="p-3 bg-gray-50 rounded-lg text-center">
                        <div className="text-2xl font-bold text-gray-900">{totalRows}</div>
                        <div className="text-xs text-gray-500">Total</div>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg text-center">
                        <div className="text-2xl font-bold text-green-600">{validRows}</div>
                        <div className="text-xs text-green-600">Valid</div>
                    </div>
                    <div className="p-3 bg-red-50 rounded-lg text-center">
                        <div className="text-2xl font-bold text-red-600">{invalidRows}</div>
                        <div className="text-xs text-red-600">Invalid</div>
                    </div>
                    <div className="p-3 bg-amber-50 rounded-lg text-center">
                        <div className="text-2xl font-bold text-amber-600">{conflictRows}</div>
                        <div className="text-xs text-amber-600">Conflicts</div>
                    </div>
                </div>

                {/* Conflict Resolution */}
                {conflictRows > 0 && (
                    <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
                        <p className="text-sm font-medium text-amber-900 mb-2">
                            Handle Conflicts ({conflictRows} {entityName} already exist)
                        </p>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="conflict"
                                    value="skip"
                                    checked={conflictResolution === 'skip'}
                                    onChange={(e) => setConflictResolution(e.target.value)}
                                    className="text-blue-600"
                                />
                                <span className="text-sm text-gray-700">Skip existing</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="conflict"
                                    value="update"
                                    checked={conflictResolution === 'update'}
                                    onChange={(e) => setConflictResolution(e.target.value)}
                                    className="text-blue-600"
                                />
                                <span className="text-sm text-gray-700">Update existing</span>
                            </label>
                        </div>
                    </div>
                )}

                {/* Data Preview */}
                <div className="max-h-64 overflow-auto border rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Row</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Roll No</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Name</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Value</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {rows?.slice(0, 50).map((row, index) => (
                                <tr key={index} className={cn(
                                    !row.isValid && "bg-red-50",
                                    row.hasConflict && row.isValid && "bg-amber-50"
                                )}>
                                    <td className="px-4 py-2 text-sm text-gray-500">{row.rowNumber}</td>
                                    <td className="px-4 py-2 text-sm font-medium text-gray-900">{row.rollNumber}</td>
                                    <td className="px-4 py-2 text-sm text-gray-600">{row.studentName || '-'}</td>
                                    <td className="px-4 py-2 text-sm text-gray-600">
                                        {row.marksObtained !== undefined ? row.marksObtained : row.status}
                                    </td>
                                    <td className="px-4 py-2">
                                        {!row.isValid ? (
                                            <div className="flex items-center gap-1">
                                                <XCircle className="w-4 h-4 text-red-500" />
                                                <span className="text-xs text-red-600">{row.errors?.[0]}</span>
                                            </div>
                                        ) : row.hasConflict ? (
                                            <div className="flex items-center gap-1">
                                                <AlertCircle className="w-4 h-4 text-amber-500" />
                                                <span className="text-xs text-amber-600">
                                                    Exists ({row.existingMarks || row.existingStatus})
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1">
                                                <CheckCircle className="w-4 h-4 text-green-500" />
                                                <span className="text-xs text-green-600">Ready</span>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {rows?.length > 50 && (
                        <div className="px-4 py-2 text-xs text-gray-500 bg-gray-50 border-t">
                            Showing 50 of {rows.length} rows
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex justify-between pt-4 border-t">
                    <Button variant="outline" onClick={handleReset}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={handleClose}>Cancel</Button>
                        <Button
                            variant="primary"
                            onClick={handleImport}
                            disabled={(validRows === 0 && (conflictRows === 0 || conflictResolution !== 'update')) || importMutation.isPending}
                        >
                            {importMutation.isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Importing...
                                </>
                            ) : (
                                <>
                                    <Upload className="w-4 h-4 mr-2" />
                                    Import {validRows + (conflictResolution === 'update' ? conflictRows : 0)} {entityName}
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    const renderResultStep = () => {
        if (!importResult) return null

        const { successCount, errorCount, totalRecords } = importResult

        return (
            <div className="space-y-6">
                {/* Result summary */}
                <div className="text-center py-6">
                    {errorCount === 0 ? (
                        <div className="flex flex-col items-center">
                            <div className="p-4 bg-green-100 rounded-full mb-4">
                                <CheckCircle className="w-12 h-12 text-green-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">Import Successful!</h3>
                            <p className="text-gray-600 mt-1">
                                {successCount} {entityName} imported successfully
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center">
                            <div className="p-4 bg-amber-100 rounded-full mb-4">
                                <AlertCircle className="w-12 h-12 text-amber-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">Import Completed with Errors</h3>
                            <p className="text-gray-600 mt-1">
                                {successCount} succeeded, {errorCount} failed
                            </p>
                        </div>
                    )}
                </div>

                {/* Error details */}
                {importResult.errors?.length > 0 && (
                    <div className="max-h-40 overflow-auto border rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Row</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">ID</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Error</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {importResult.errors.map((err, index) => (
                                    <tr key={index} className="bg-red-50">
                                        <td className="px-4 py-2 text-sm text-gray-500">{err.rowNumber}</td>
                                        <td className="px-4 py-2 text-sm font-medium text-gray-900">{err.identifier}</td>
                                        <td className="px-4 py-2 text-sm text-red-600">{err.errorMessage}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button variant="outline" onClick={handleReset}>
                        <RefreshCcw className="w-4 h-4 mr-2" />
                        Import More
                    </Button>
                    <Button variant="primary" onClick={handleClose}>
                        Done
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={title}
            size="lg"
        >
            {step === 'upload' && renderUploadStep()}
            {step === 'preview' && renderPreviewStep()}
            {step === 'result' && renderResultStep()}
        </Modal>
    )
}

export default BulkImportModal
