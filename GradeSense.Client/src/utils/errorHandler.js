/**
 * Global Error Handler Utility
 * Provides consistent error handling across the application
 */

/**
 * Parse error response from API
 * Handles various error formats including FluentValidation errors
 * @param {Object} error - Axios error object
 * @returns {Object} Parsed error with message and details
 */
export const parseApiError = (error) => {
    const response = error?.response
    const data = response?.data

    // Default error structure
    const result = {
        message: 'An unexpected error occurred',
        status: response?.status || 0,
        errors: null,
        isValidationError: false,
        isNetworkError: false,
        isAuthError: false
    }

    // Network error (no response)
    if (!response) {
        result.message = 'Unable to connect to the server. Please check your connection.'
        result.isNetworkError = true
        return result
    }

    // Handle different status codes
    switch (response.status) {
        case 400:
            result.isValidationError = true
            // FluentValidation errors format: { errors: { FieldName: ['Error 1', 'Error 2'] } }
            if (data?.errors) {
                const errorMessages = []
                Object.entries(data.errors).forEach(([field, messages]) => {
                    if (Array.isArray(messages)) {
                        messages.forEach(msg => errorMessages.push(msg))
                    } else if (typeof messages === 'string') {
                        errorMessages.push(messages)
                    }
                })
                result.errors = data.errors
                result.message = errorMessages.length > 0
                    ? errorMessages.join('. ')
                    : data?.title || data?.Message || 'Validation failed'
            } else {
                // Standard API error format: { Message: 'Error message' }
                result.message = data?.Message || data?.message || data?.title || 'Bad request'
            }
            break

        case 401:
            result.message = 'Your session has expired. Please login again.'
            result.isAuthError = true
            break

        case 403:
            result.message = 'You do not have permission to perform this action.'
            result.isAuthError = true
            break

        case 404:
            result.message = data?.Message || data?.message || 'The requested resource was not found.'
            break

        case 409:
            result.message = data?.Message || data?.message || 'A conflict occurred. The resource may already exist.'
            break

        case 422:
            result.isValidationError = true
            result.message = data?.Message || data?.message || 'The submitted data is invalid.'
            result.errors = data?.errors
            break

        case 500:
            result.message = 'An unexpected server error occurred. Please try again later.'
            break

        case 502:
        case 503:
        case 504:
            result.message = 'The server is temporarily unavailable. Please try again later.'
            break

        default:
            result.message = data?.Message || data?.message || `An error occurred (${response.status})`
    }

    return result
}

/**
 * Get user-friendly error message
 * @param {Object} error - Axios error object
 * @returns {string} User-friendly error message
 */
export const getErrorMessage = (error) => {
    const parsed = parseApiError(error)
    return parsed.message
}

/**
 * Get validation errors as an object for form fields
 * @param {Object} error - Axios error object
 * @returns {Object|null} Object with field names as keys and error messages as values
 */
export const getValidationErrors = (error) => {
    const parsed = parseApiError(error)
    if (!parsed.errors) return null

    const fieldErrors = {}
    Object.entries(parsed.errors).forEach(([field, messages]) => {
        // Convert PascalCase to camelCase for form field matching
        const fieldName = field.charAt(0).toLowerCase() + field.slice(1)
        fieldErrors[fieldName] = Array.isArray(messages) ? messages[0] : messages
    })
    return fieldErrors
}

/**
 * Check if error is a network error
 * @param {Object} error - Axios error object
 * @returns {boolean}
 */
export const isNetworkError = (error) => {
    return !error?.response
}

/**
 * Check if error is an authentication error
 * @param {Object} error - Axios error object
 * @returns {boolean}
 */
export const isAuthError = (error) => {
    const status = error?.response?.status
    return status === 401 || status === 403
}

/**
 * Check if error is a validation error
 * @param {Object} error - Axios error object
 * @returns {boolean}
 */
export const isValidationError = (error) => {
    const status = error?.response?.status
    return status === 400 || status === 422
}

/**
 * Check if error is a not found error
 * @param {Object} error - Axios error object
 * @returns {boolean}
 */
export const isNotFoundError = (error) => {
    return error?.response?.status === 404
}

export default {
    parseApiError,
    getErrorMessage,
    getValidationErrors,
    isNetworkError,
    isAuthError,
    isValidationError,
    isNotFoundError
}
