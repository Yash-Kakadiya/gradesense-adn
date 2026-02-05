import { forwardRef } from 'react'
import { cn } from '@/utils/helpers'

const Textarea = forwardRef(
    (
        {
            className,
            label,
            error,
            helperText,
            rows = 4,
            required,
            disabled,
            ...props
        },
        ref
    ) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        {label}
                        {required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                )}
                <textarea
                    ref={ref}
                    rows={rows}
                    disabled={disabled}
                    className={cn(
                        'block w-full px-3 py-2 border rounded-md shadow-sm text-sm',
                        'placeholder-gray-400 transition-colors resize-none',
                        'focus:outline-none focus:ring-2 focus:ring-offset-0',
                        error
                            ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500',
                        disabled && 'bg-gray-100 cursor-not-allowed',
                        className
                    )}
                    {...props}
                />
                {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
                {helperText && !error && (
                    <p className="mt-1 text-sm text-gray-500">{helperText}</p>
                )}
            </div>
        )
    }
)

Textarea.displayName = 'Textarea'

export default Textarea
