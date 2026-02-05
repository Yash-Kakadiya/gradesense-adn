import { cn } from '@/utils/helpers'
import { Loader2 } from 'lucide-react'

const sizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
}

const Spinner = ({ className, size = 'md', ...props }) => {
    return (
        <Loader2
            className={cn('animate-spin text-blue-600', sizes[size], className)}
            {...props}
        />
    )
}

// Full page loading spinner
export const LoadingScreen = ({ message = 'Loading...' }) => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
            <Spinner size="xl" />
            <p className="mt-4 text-gray-600">{message}</p>
        </div>
    )
}

// Inline loading spinner
export const LoadingInline = ({ message }) => {
    return (
        <div className="flex items-center justify-center py-8">
            <Spinner size="lg" />
            {message && <p className="ml-3 text-gray-600">{message}</p>}
        </div>
    )
}

export default Spinner
