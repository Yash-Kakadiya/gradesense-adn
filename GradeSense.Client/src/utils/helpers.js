import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge Tailwind CSS classes with conflict resolution
 */
export function cn(...inputs) {
    return twMerge(clsx(inputs))
}

/**
 * Format date to locale string or relative time
 */
export function formatDate(date, format = 'default') {
    if (!date) return ''

    const dateObj = new Date(date)

    if (format === 'relative') {
        const now = new Date()
        const diffMs = now - dateObj
        const diffSec = Math.floor(diffMs / 1000)
        const diffMin = Math.floor(diffSec / 60)
        const diffHour = Math.floor(diffMin / 60)
        const diffDay = Math.floor(diffHour / 24)

        if (diffSec < 60) return 'just now'
        if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`
        if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`
        if (diffDay < 7) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`

        return dateObj.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        })
    }

    const defaultOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    }
    return dateObj.toLocaleDateString('en-US', defaultOptions)
}

/**
 * Format date with time
 */
export function formatDateTime(date) {
    if (!date) return ''
    return new Date(date).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}

/**
 * Format number to currency
 */
export function formatCurrency(amount, currency = 'INR') {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency,
    }).format(amount)
}

/**
 * Format percentage
 */
export function formatPercentage(value, decimals = 1) {
    if (value === null || value === undefined) return '-'
    return `${Number(value).toFixed(decimals)}%`
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text, maxLength = 50) {
    if (!text || text.length <= maxLength) return text
    return `${text.substring(0, maxLength)}...`
}

/**
 * Capitalize first letter
 */
export function capitalize(str) {
    if (!str) return ''
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/**
 * Generate initials from name
 */
export function getInitials(name) {
    if (!name) return ''
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
}

/**
 * Debounce function
 */
export function debounce(func, wait) {
    let timeout
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout)
            func(...args)
        }
        clearTimeout(timeout)
        timeout = setTimeout(later, wait)
    }
}

/**
 * Get role badge color
 */
export function getRoleBadgeColor(role) {
    const colors = {
        Admin: 'badge-error',
        Faculty: 'badge-info',
        Student: 'badge-success',
    }
    return colors[role] || 'badge-info'
}

/**
 * Get status badge color
 */
export function getStatusBadgeColor(status) {
    const colors = {
        Active: 'badge-success',
        Inactive: 'badge-error',
        Pending: 'badge-warning',
        Completed: 'badge-success',
        InProgress: 'badge-info',
    }
    return colors[status] || 'badge-info'
}

/**
 * Calculate CGPA grade
 */
export function getGradeFromCGPA(cgpa) {
    if (cgpa >= 9) return 'A+'
    if (cgpa >= 8) return 'A'
    if (cgpa >= 7) return 'B+'
    if (cgpa >= 6) return 'B'
    if (cgpa >= 5) return 'C'
    if (cgpa >= 4) return 'D'
    return 'F'
}

/**
 * Get attendance status color
 */
export function getAttendanceColor(percentage) {
    if (percentage >= 75) return 'text-green-600'
    if (percentage >= 60) return 'text-yellow-600'
    return 'text-red-600'
}

/**
 * Parse API errors
 */
export function parseApiError(error) {
    if (error.response?.data?.message) {
        return error.response.data.message
    }
    if (error.response?.data?.errors) {
        return Object.values(error.response.data.errors).flat().join(', ')
    }
    if (error.message) {
        return error.message
    }
    return 'An unexpected error occurred'
}

/**
 * Build query string from params
 */
export function buildQueryString(params) {
    const query = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            query.append(key, value)
        }
    })
    return query.toString()
}
