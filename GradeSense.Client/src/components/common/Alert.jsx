import { cn } from '@/utils/helpers'
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react'
import { useState } from 'react'

const variants = {
    success: {
        container: 'bg-green-50 border-green-200',
        icon: 'text-green-500',
        title: 'text-green-800',
        message: 'text-green-700',
        Icon: CheckCircle,
    },
    error: {
        container: 'bg-red-50 border-red-200',
        icon: 'text-red-500',
        title: 'text-red-800',
        message: 'text-red-700',
        Icon: AlertCircle,
    },
    warning: {
        container: 'bg-yellow-50 border-yellow-200',
        icon: 'text-yellow-500',
        title: 'text-yellow-800',
        message: 'text-yellow-700',
        Icon: AlertTriangle,
    },
    info: {
        container: 'bg-blue-50 border-blue-200',
        icon: 'text-blue-500',
        title: 'text-blue-800',
        message: 'text-blue-700',
        Icon: Info,
    },
}

const Alert = ({
    variant = 'info',
    title,
    children,
    dismissible = false,
    onDismiss,
    className,
}) => {
    const [dismissed, setDismissed] = useState(false)

    if (dismissed) return null

    const { container, icon, title: titleClass, message, Icon } = variants[variant]

    const handleDismiss = () => {
        setDismissed(true)
        onDismiss?.()
    }

    return (
        <div
            className={cn(
                'flex gap-3 p-4 border rounded-lg',
                container,
                className
            )}
            role="alert"
        >
            <Icon className={cn('w-5 h-5 flex-shrink-0', icon)} />
            <div className="flex-1">
                {title && (
                    <h3 className={cn('text-sm font-medium', titleClass)}>{title}</h3>
                )}
                {children && (
                    <div className={cn('text-sm', message, title && 'mt-1')}>
                        {children}
                    </div>
                )}
            </div>
            {dismissible && (
                <button
                    type="button"
                    onClick={handleDismiss}
                    className={cn('flex-shrink-0', icon, 'hover:opacity-75')}
                >
                    <X className="w-4 h-4" />
                </button>
            )}
        </div>
    )
}

export default Alert
