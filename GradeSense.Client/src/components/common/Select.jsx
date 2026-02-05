import { forwardRef } from 'react'
import { cn } from '@/utils/helpers'
import { ChevronDown } from 'lucide-react'

const Select = forwardRef(
    (
        {
            className,
            label,
            error,
            helperText,
            options = [],
            placeholder = 'Select an option',
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
                    <select
                        ref={ref}
                        disabled={disabled}
                        className={cn(
                            'block w-full px-3 py-2 pr-10 border rounded-md shadow-sm text-sm',
                            'appearance-none bg-white transition-colors',
                            'focus:outline-none focus:ring-2 focus:ring-offset-0',
                            error
                                ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500',
                            disabled && 'bg-gray-100 cursor-not-allowed',
                            className
                        )}
                        {...props}
                    >
                        <option value="">{placeholder}</option>
                        {options.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                    </div>
                </div>
                {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
                {helperText && !error && (
                    <p className="mt-1 text-sm text-gray-500">{helperText}</p>
                )}
            </div>
        )
    }
)

Select.displayName = 'Select'

export default Select
