import { cn } from '@/utils/helpers'
import Button from '@/components/common/Button'
import { Plus, Download, Upload, RefreshCw, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const PageHeader = ({
    title,
    description,
    actions,
    className,
    // Quick action props
    onAdd,
    addLabel,
    onExport,
    onImport,
    onRefresh,
    isRefreshing,
    showBack,
    backTo,
    icon: Icon,
    badge,
}) => {
    const navigate = useNavigate()

    const handleBack = () => {
        if (backTo) {
            navigate(backTo)
        } else {
            navigate(-1)
        }
    }

    return (
        <div className={cn('mb-6', className)}>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex items-start gap-4">
                    {/* Back button */}
                    {showBack && (
                        <button
                            onClick={handleBack}
                            className="p-2 -ml-2 mt-0.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                    )}

                    {/* Icon */}
                    {Icon && (
                        <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg">
                            <Icon className="w-6 h-6" />
                        </div>
                    )}

                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                            {badge && (
                                <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                                    {badge}
                                </span>
                            )}
                        </div>
                        {description && (
                            <p className="mt-1 text-sm text-gray-500 max-w-xl">{description}</p>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-wrap">
                    {onRefresh && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onRefresh}
                            disabled={isRefreshing}
                            className="text-gray-500"
                        >
                            <RefreshCw className={cn('w-4 h-4', isRefreshing && 'animate-spin')} />
                        </Button>
                    )}
                    {onExport && (
                        <Button variant="outline" size="sm" onClick={onExport}>
                            <Download className="w-4 h-4 mr-1.5" />
                            Export
                        </Button>
                    )}
                    {onImport && (
                        <Button variant="outline" size="sm" onClick={onImport}>
                            <Upload className="w-4 h-4 mr-1.5" />
                            Import
                        </Button>
                    )}
                    {onAdd && (
                        <Button size="sm" onClick={onAdd} className="shadow-sm">
                            <Plus className="w-4 h-4 mr-1.5" />
                            {addLabel || 'Add New'}
                        </Button>
                    )}
                    {actions}
                </div>
            </div>
        </div>
    )
}

export default PageHeader
