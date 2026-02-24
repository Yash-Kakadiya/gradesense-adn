import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { parseApiError, getErrorMessage, isNotFoundError } from '@/utils/errorHandler'

/**
 * Custom hook for handling API errors in components
 * Provides consistent error handling with proper toast messages and navigation
 */
export const useErrorHandler = () => {
    const navigate = useNavigate()

    /**
     * Handle CRUD operation errors
     * Shows appropriate toast message based on error type
     * @param {Object} error - Axios error object
     * @param {Object} options - Configuration options
     * @param {string} options.operation - Operation name (create, update, delete, fetch)
     * @param {string} options.entity - Entity name (user, department, etc.)
     * @param {boolean} options.redirectOnNotFound - Whether to redirect to 404 page on not found
     * @param {string} options.notFoundRedirect - Custom redirect path for not found
     */
    const handleError = useCallback((error, options = {}) => {
        const {
            operation = 'perform this action',
            entity = 'record',
            redirectOnNotFound = false,
            notFoundRedirect = '/not-found'
        } = options

        const parsed = parseApiError(error)

        // Handle 404 with optional redirect
        if (isNotFoundError(error)) {
            if (redirectOnNotFound) {
                toast.error(`${entity} not found`)
                navigate(notFoundRedirect, { replace: true })
                return
            }
            toast.error(parsed.message || `${entity} not found`)
            return
        }

        // For validation errors, show the detailed message
        if (parsed.isValidationError) {
            toast.error(parsed.message)
            return
        }

        // For other errors, show parsed message or generic message
        const message = parsed.message || `Failed to ${operation} ${entity}`
        toast.error(message)
    }, [navigate])

    /**
     * Handle mutation errors (create, update, delete)
     * @param {Object} error - Axios error object
     * @param {string} operation - Operation name
     * @param {string} entity - Entity name
     */
    const handleMutationError = useCallback((error, operation, entity) => {
        handleError(error, { operation, entity })
    }, [handleError])

    /**
     * Handle query errors (fetch, get)
     * @param {Object} error - Axios error object
     * @param {string} entity - Entity name
     * @param {boolean} redirectOnNotFound - Whether to redirect on 404
     */
    const handleQueryError = useCallback((error, entity, redirectOnNotFound = false) => {
        handleError(error, {
            operation: 'fetch',
            entity,
            redirectOnNotFound
        })
    }, [handleError])

    return {
        handleError,
        handleMutationError,
        handleQueryError,
        parseApiError,
        getErrorMessage
    }
}

export default useErrorHandler
