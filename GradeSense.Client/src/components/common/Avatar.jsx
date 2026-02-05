import { cn, getInitials } from '@/utils/helpers'

const sizes = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
}

const Avatar = ({
    src,
    alt,
    name,
    size = 'md',
    className,
    ...props
}) => {
    const initials = getInitials(name || alt)

    if (src) {
        return (
            <img
                src={src}
                alt={alt || name}
                className={cn(
                    'rounded-full object-cover',
                    sizes[size],
                    className
                )}
                {...props}
            />
        )
    }

    return (
        <div
            className={cn(
                'rounded-full bg-blue-600 text-white flex items-center justify-center font-medium',
                sizes[size],
                className
            )}
            {...props}
        >
            {initials}
        </div>
    )
}

export default Avatar
