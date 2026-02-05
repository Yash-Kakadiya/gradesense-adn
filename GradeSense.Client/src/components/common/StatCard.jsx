import { cn } from '@/utils/helpers'
import { Loader2, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react'

const colorSchemes = {
    blue: {
        gradient: 'from-blue-500 to-blue-600',
        bg: 'bg-blue-50',
        text: 'text-blue-600',
        ring: 'ring-blue-500/20',
        icon: 'bg-blue-100 text-blue-600',
    },
    emerald: {
        gradient: 'from-emerald-500 to-emerald-600',
        bg: 'bg-emerald-50',
        text: 'text-emerald-600',
        ring: 'ring-emerald-500/20',
        icon: 'bg-emerald-100 text-emerald-600',
    },
    purple: {
        gradient: 'from-purple-500 to-purple-600',
        bg: 'bg-purple-50',
        text: 'text-purple-600',
        ring: 'ring-purple-500/20',
        icon: 'bg-purple-100 text-purple-600',
    },
    orange: {
        gradient: 'from-orange-500 to-orange-600',
        bg: 'bg-orange-50',
        text: 'text-orange-600',
        ring: 'ring-orange-500/20',
        icon: 'bg-orange-100 text-orange-600',
    },
    rose: {
        gradient: 'from-rose-500 to-rose-600',
        bg: 'bg-rose-50',
        text: 'text-rose-600',
        ring: 'ring-rose-500/20',
        icon: 'bg-rose-100 text-rose-600',
    },
    cyan: {
        gradient: 'from-cyan-500 to-cyan-600',
        bg: 'bg-cyan-50',
        text: 'text-cyan-600',
        ring: 'ring-cyan-500/20',
        icon: 'bg-cyan-100 text-cyan-600',
    },
    amber: {
        gradient: 'from-amber-500 to-amber-600',
        bg: 'bg-amber-50',
        text: 'text-amber-600',
        ring: 'ring-amber-500/20',
        icon: 'bg-amber-100 text-amber-600',
    },
    indigo: {
        gradient: 'from-indigo-500 to-indigo-600',
        bg: 'bg-indigo-50',
        text: 'text-indigo-600',
        ring: 'ring-indigo-500/20',
        icon: 'bg-indigo-100 text-indigo-600',
    },
}

// Modern gradient stat card
export const StatCard = ({
    title,
    value,
    icon: Icon,
    color = 'blue',
    loading = false,
    trend,
    trendValue,
    subtitle,
    onClick,
    className,
}) => {
    const scheme = colorSchemes[color] || colorSchemes.blue

    return (
        <div
            onClick={onClick}
            className={cn(
                'group relative overflow-hidden rounded-2xl bg-white border border-gray-200/60',
                'transition-all duration-300 hover:shadow-xl hover:-translate-y-1',
                onClick && 'cursor-pointer',
                className
            )}
        >
            {/* Gradient accent */}
            <div className={cn('absolute inset-x-0 top-0 h-1 bg-gradient-to-r', scheme.gradient)} />

            <div className="p-6">
                <div className="flex items-start justify-between">
                    {/* Icon */}
                    <div className={cn('p-3 rounded-xl', scheme.icon, 'ring-4', scheme.ring)}>
                        <Icon className="w-6 h-6" />
                    </div>

                    {/* Trend indicator */}
                    {trend && !loading && (
                        <div className={cn(
                            'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
                            trend === 'up' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                        )}>
                            {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {trendValue}
                        </div>
                    )}
                </div>

                <div className="mt-4">
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    {loading ? (
                        <div className="flex items-center mt-2">
                            <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
                        </div>
                    ) : (
                        <p className={cn('text-3xl font-bold mt-1', scheme.text)}>
                            {typeof value === 'number' ? value.toLocaleString() : value}
                        </p>
                    )}
                    {subtitle && !loading && (
                        <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
                    )}
                </div>

                {/* Hover arrow */}
                {onClick && (
                    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                        <ArrowRight className={cn('w-5 h-5', scheme.text)} />
                    </div>
                )}
            </div>
        </div>
    )
}

// Compact stat for secondary metrics
export const MiniStat = ({
    title,
    value,
    icon: Icon,
    color = 'blue',
    loading = false,
}) => {
    const scheme = colorSchemes[color] || colorSchemes.blue

    return (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50/80 border border-gray-100">
            <div className={cn('p-2 rounded-lg', scheme.icon)}>
                <Icon className="w-4 h-4" />
            </div>
            <div>
                <p className="text-xs font-medium text-gray-500">{title}</p>
                {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-gray-300" />
                ) : (
                    <p className={cn('text-lg font-bold', scheme.text)}>
                        {typeof value === 'number' ? value.toLocaleString() : value}
                    </p>
                )}
            </div>
        </div>
    )
}

// Large featured stat card
export const FeaturedStat = ({
    title,
    value,
    description,
    icon: Icon,
    color = 'blue',
    loading = false,
    children,
}) => {
    const scheme = colorSchemes[color] || colorSchemes.blue

    return (
        <div className={cn(
            'relative overflow-hidden rounded-2xl p-6',
            'bg-gradient-to-br', scheme.gradient,
            'text-white shadow-lg'
        )}>
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/20" />
                <div className="absolute -left-10 -bottom-10 w-32 h-32 rounded-full bg-white/10" />
            </div>

            <div className="relative">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-sm font-medium text-white/80">{title}</p>
                        {loading ? (
                            <Loader2 className="w-8 h-8 animate-spin text-white/50 mt-2" />
                        ) : (
                            <p className="text-4xl font-bold mt-1">
                                {typeof value === 'number' ? value.toLocaleString() : value}
                            </p>
                        )}
                        {description && (
                            <p className="text-sm text-white/70 mt-2">{description}</p>
                        )}
                    </div>
                    <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                        <Icon className="w-8 h-8" />
                    </div>
                </div>
                {children && <div className="mt-4">{children}</div>}
            </div>
        </div>
    )
}

export default StatCard
