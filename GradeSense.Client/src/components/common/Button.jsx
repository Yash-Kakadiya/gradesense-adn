import { forwardRef } from 'react'
import { cn } from '@/utils/helpers'
import { Loader2 } from 'lucide-react'

const variants = {
    primary: 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 focus:ring-blue-500 shadow-sm hover:shadow-md',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500',
    danger: 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 focus:ring-red-500 shadow-sm',
    success: 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white hover:from-emerald-700 hover:to-emerald-800 focus:ring-emerald-500 shadow-sm',
    warning: 'bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 focus:ring-amber-500 shadow-sm',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 focus:ring-blue-500',
    ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:ring-gray-500',
    link: 'bg-transparent text-blue-600 hover:text-blue-700 hover:underline p-0',
}

const sizes = {
    xs: 'px-2.5 py-1 text-xs',
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
    xl: 'px-6 py-3 text-lg',
}

const Button = forwardRef(
    (
        {
            className,
            variant = 'primary',
            size = 'md',
            children,
            disabled,
            loading,
            leftIcon,
            rightIcon,
            type = 'button',
            ...props
        },
        ref
    ) => {
        return (
            <button
                ref={ref}
                type={type}
                disabled={disabled || loading}
                className={cn(
                    'inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-200',
                    'focus:outline-none focus:ring-2 focus:ring-offset-2',
                    'disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none',
                    'active:scale-[0.98]',
                    variants[variant],
                    variant !== 'link' && sizes[size],
                    className
                )}
                {...props}
            >
                {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : leftIcon ? (
                    <span className="w-4 h-4">{leftIcon}</span>
                ) : null}
                {children}
                {rightIcon && !loading && <span className="w-4 h-4">{rightIcon}</span>}
            </button>
        )
    }
)

Button.displayName = 'Button'

export default Button
