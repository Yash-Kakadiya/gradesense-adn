import { cn } from '@/utils/helpers'

const Card = ({ className, hover = false, children, ...props }) => {
    return (
        <div
            className={cn(
                'bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden',
                hover && 'transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-gray-300/60',
                className
            )}
            {...props}
        >
            {children}
        </div>
    )
}

const CardHeader = ({ className, children, ...props }) => {
    return (
        <div
            className={cn('px-6 py-4 border-b border-gray-100', className)}
            {...props}
        >
            {children}
        </div>
    )
}

const CardTitle = ({ className, children, ...props }) => {
    return (
        <h3
            className={cn('text-lg font-semibold text-gray-900', className)}
            {...props}
        >
            {children}
        </h3>
    )
}

const CardDescription = ({ className, children, ...props }) => {
    return (
        <p className={cn('text-sm text-gray-500 mt-1', className)} {...props}>
            {children}
        </p>
    )
}

const CardBody = ({ className, children, ...props }) => {
    return (
        <div className={cn('p-6', className)} {...props}>
            {children}
        </div>
    )
}

const CardFooter = ({ className, children, ...props }) => {
    return (
        <div
            className={cn('px-6 py-4 bg-gray-50/50 border-t border-gray-100', className)}
            {...props}
        >
            {children}
        </div>
    )
}

Card.Header = CardHeader
Card.Title = CardTitle
Card.Description = CardDescription
Card.Body = CardBody
Card.Footer = CardFooter

export default Card
