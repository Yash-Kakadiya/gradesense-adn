import { forwardRef } from 'react'
import { cn } from '@/utils/helpers'

const Input = forwardRef(
    (
        {
            className,
            label,
            error,
            helperText,
            leftIcon,
            rightIcon,
            type = 'text',
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
                <div className="relative">
                    {leftIcon && (
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-400 w-5 h-5">{leftIcon}</span>
                        </div>
                    )}
                    <input
                        ref={ref}
                        type={type}
                        disabled={disabled}
                        className={cn(
                            'block w-full px-3 py-2 border rounded-md shadow-sm text-sm',
                            'placeholder-gray-400 transition-colors',
                            'focus:outline-none focus:ring-2 focus:ring-offset-0',
                            error
                                ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500',
                            disabled && 'bg-gray-100 cursor-not-allowed',
                            leftIcon && 'pl-10',
                            rightIcon && 'pr-10',
                            className
                        )}
                        {...props}
                    />
                    {rightIcon && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                            <span className="text-gray-400 w-5 h-5">{rightIcon}</span>
                        </div>
                    )}
                </div>
                {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
                {helperText && !error && (
                    <p className="mt-1 text-sm text-gray-500">{helperText}</p>
                )}
            </div>
        )
    }
)

Input.displayName = 'Input'

export default Input
