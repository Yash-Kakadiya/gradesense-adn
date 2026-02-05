import { cn } from '@/utils/helpers'

const variants = {
    default: 'bg-gray-100 text-gray-700 ring-1 ring-gray-200',
    primary: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
    success: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
    warning: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
    danger: 'bg-red-50 text-red-700 ring-1 ring-red-200',
    info: 'bg-cyan-50 text-cyan-700 ring-1 ring-cyan-200',
    purple: 'bg-purple-50 text-purple-700 ring-1 ring-purple-200',
    rose: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
}

const solidVariants = {
    default: 'bg-gray-600 text-white',
    primary: 'bg-blue-600 text-white',
    success: 'bg-emerald-600 text-white',
    warning: 'bg-amber-500 text-white',
    danger: 'bg-red-600 text-white',
    info: 'bg-cyan-600 text-white',
    purple: 'bg-purple-600 text-white',
    rose: 'bg-rose-600 text-white',
}

const sizes = {
    xs: 'px-1.5 py-0.5 text-[10px]',
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1 text-sm',
}

const Badge = ({
    className,
    variant = 'default',
    size = 'md',
    solid = false,
    children,
    dot,
    pulse,
    icon: Icon,
    ...props
}) => {
    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 font-medium rounded-full transition-colors',
                solid ? solidVariants[variant] : variants[variant],
                sizes[size],
                className
            )}
            {...props}
        >
            {dot && (
                <span
                    className={cn(
                        'w-1.5 h-1.5 rounded-full',
                        pulse && 'animate-pulse',
                        variant === 'success' && 'bg-emerald-500',
                        variant === 'warning' && 'bg-amber-500',
                        variant === 'danger' && 'bg-red-500',
                        variant === 'info' && 'bg-cyan-500',
                        variant === 'primary' && 'bg-blue-500',
                        variant === 'purple' && 'bg-purple-500',
                        variant === 'rose' && 'bg-rose-500',
                        variant === 'default' && 'bg-gray-500'
                    )}
                />
            )}
            {Icon && <Icon className="w-3 h-3" />}
            {children}
        </span>
    )
}

export default Badge
