import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import {
    X,
    FileText,
    User,
    Mail,
    Shield,
    Hash,
    Calendar,
    Clock,
    Globe,
    Monitor,
    Key,
    AlertCircle,
    Plus,
    Pencil,
    Trash2,
    Eye,
    ArrowRight,
    Code,
    Layers,
} from 'lucide-react'

const AuditLogDetailModal = ({ isOpen, onClose, auditLog }) => {
    if (!auditLog) return null

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A'
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        })
    }

    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A'
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        })
    }

    const getActionIcon = (action) => {
        switch (action?.toLowerCase()) {
            case 'create':
                return Plus
            case 'update':
                return Pencil
            case 'delete':
                return Trash2
            case 'read':
            case 'view':
                return Eye
            default:
                return FileText
        }
    }

    const getActionColor = (action) => {
        switch (action?.toLowerCase()) {
            case 'create':
                return 'bg-emerald-100 text-emerald-700'
            case 'update':
                return 'bg-blue-100 text-blue-700'
            case 'delete':
                return 'bg-red-100 text-red-700'
            case 'read':
            case 'view':
                return 'bg-gray-100 text-gray-700'
            default:
                return 'bg-slate-100 text-slate-700'
        }
    }

    const parseChangedFields = (fields) => {
        if (!fields) return []
        if (Array.isArray(fields)) return fields
        try {
            return JSON.parse(fields)
        } catch {
            return fields.split(',').map((f) => f.trim())
        }
    }

    const formatJsonValue = (value) => {
        if (!value) return null
        try {
            const parsed = JSON.parse(value)
            return JSON.stringify(parsed, null, 2)
        } catch {
            return value
        }
    }

    const ActionIcon = getActionIcon(auditLog.Action)
    const changedFields = parseChangedFields(auditLog.ChangedFields)

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
                                {/* Header with gradient */}
                                <div className="relative bg-gradient-to-br from-slate-600 to-gray-700 px-6 py-5">
                                    {/* Close button only - no edit for audit logs */}
                                    <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>

                                    {/* Decorative circles */}
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

                                    <div className="relative flex flex-col items-center">
                                        <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur flex items-center justify-center mb-4 ring-4 ring-white/30">
                                            <ActionIcon className="w-10 h-10 text-white" />
                                        </div>
                                        <Dialog.Title className="text-xl font-bold text-white">
                                            {auditLog.Action} - {auditLog.EntityName}
                                        </Dialog.Title>
                                        <p className="text-slate-200 text-sm mt-1">
                                            Audit Log #{auditLog.Id}
                                        </p>

                                        {/* Action Badge */}
                                        <div className="flex flex-wrap justify-center gap-2 mt-4">
                                            <span
                                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${getActionColor(auditLog.Action)}`}
                                            >
                                                <ActionIcon className="w-4 h-4" />
                                                {auditLog.Action}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6 max-h-[60vh] overflow-y-auto">
                                    <div className="space-y-6">
                                        {/* Actor Information */}
                                        <div>
                                            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                                                <User className="w-4 h-4 text-slate-500" />
                                                Actor Information
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="bg-slate-50 rounded-xl p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                                            <User className="w-5 h-5 text-blue-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-slate-500 uppercase tracking-wide">
                                                                User Name
                                                            </p>
                                                            <p className="text-sm font-semibold text-slate-900">
                                                                {auditLog.ActorUserName || 'System'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="bg-slate-50 rounded-xl p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                                                            <Mail className="w-5 h-5 text-indigo-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-slate-500 uppercase tracking-wide">
                                                                Email
                                                            </p>
                                                            <p className="text-sm font-semibold text-slate-900 break-all">
                                                                {auditLog.ActorUserEmail || 'N/A'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {auditLog.ActorUserRole && (
                                                    <div className="bg-slate-50 rounded-xl p-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                                                                <Shield className="w-5 h-5 text-purple-600" />
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-slate-500 uppercase tracking-wide">
                                                                    Role
                                                                </p>
                                                                <p className="text-sm font-semibold text-slate-900">
                                                                    {auditLog.ActorUserRole}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="bg-slate-50 rounded-xl p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center">
                                                            <Hash className="w-5 h-5 text-slate-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-slate-500 uppercase tracking-wide">
                                                                User ID
                                                            </p>
                                                            <p className="text-sm font-semibold text-slate-900">
                                                                {auditLog.ActorUserId || 'N/A'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Entity Information */}
                                        <div>
                                            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                                                <Layers className="w-4 h-4 text-slate-500" />
                                                Entity Information
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="bg-slate-50 rounded-xl p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                                                            <FileText className="w-5 h-5 text-amber-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-slate-500 uppercase tracking-wide">
                                                                Entity Name
                                                            </p>
                                                            <p className="text-sm font-semibold text-slate-900">
                                                                {auditLog.EntityName}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="bg-slate-50 rounded-xl p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                                                            <Hash className="w-5 h-5 text-orange-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-slate-500 uppercase tracking-wide">
                                                                Entity ID
                                                            </p>
                                                            <p className="text-sm font-semibold text-slate-900">
                                                                {auditLog.EntityId || 'N/A'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Changed Fields */}
                                        {changedFields.length > 0 && (
                                            <div>
                                                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                                                    <Code className="w-4 h-4 text-slate-500" />
                                                    Changed Fields
                                                </h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {changedFields.map((field, index) => (
                                                        <span
                                                            key={index}
                                                            className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium"
                                                        >
                                                            {field}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Values Comparison */}
                                        {(auditLog.OldValue || auditLog.NewValue) && (
                                            <div>
                                                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                                                    <ArrowRight className="w-4 h-4 text-slate-500" />
                                                    Value Changes
                                                </h3>
                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                                    {auditLog.OldValue && (
                                                        <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                                                            <p className="text-xs text-red-600 uppercase tracking-wide font-semibold mb-2">
                                                                Old Value
                                                            </p>
                                                            <pre className="text-xs text-slate-700 overflow-auto max-h-40 whitespace-pre-wrap break-words">
                                                                {formatJsonValue(auditLog.OldValue)}
                                                            </pre>
                                                        </div>
                                                    )}
                                                    {auditLog.NewValue && (
                                                        <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                                                            <p className="text-xs text-green-600 uppercase tracking-wide font-semibold mb-2">
                                                                New Value
                                                            </p>
                                                            <pre className="text-xs text-slate-700 overflow-auto max-h-40 whitespace-pre-wrap break-words">
                                                                {formatJsonValue(auditLog.NewValue)}
                                                            </pre>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Request Information */}
                                        <div>
                                            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                                                <Globe className="w-4 h-4 text-slate-500" />
                                                Request Information
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="bg-slate-50 rounded-xl p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center">
                                                            <Globe className="w-5 h-5 text-cyan-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-slate-500 uppercase tracking-wide">
                                                                IP Address
                                                            </p>
                                                            <p className="text-sm font-semibold text-slate-900 font-mono">
                                                                {auditLog.IPAddress || 'N/A'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {auditLog.SessionId && (
                                                    <div className="bg-slate-50 rounded-xl p-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center">
                                                                <Key className="w-5 h-5 text-teal-600" />
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-slate-500 uppercase tracking-wide">
                                                                    Session ID
                                                                </p>
                                                                <p className="text-sm font-semibold text-slate-900 font-mono truncate max-w-[180px]">
                                                                    {auditLog.SessionId}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {auditLog.UserAgent && (
                                                <div className="mt-4 bg-slate-50 rounded-xl p-4">
                                                    <div className="flex items-start gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0">
                                                            <Monitor className="w-5 h-5 text-violet-600" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-xs text-slate-500 uppercase tracking-wide">
                                                                User Agent
                                                            </p>
                                                            <p className="text-sm text-slate-700 break-all">
                                                                {auditLog.UserAgent}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Reason */}
                                        {auditLog.Reason && (
                                            <div>
                                                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                                                    <AlertCircle className="w-4 h-4 text-slate-500" />
                                                    Reason
                                                </h3>
                                                <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                                                    <p className="text-sm text-slate-700">
                                                        {auditLog.Reason}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Timestamps */}
                                        <div>
                                            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-slate-500" />
                                                Timestamps
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="bg-slate-50 rounded-xl p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                                                            <Calendar className="w-5 h-5 text-emerald-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-slate-500 uppercase tracking-wide">
                                                                Occurred At
                                                            </p>
                                                            <p className="text-sm font-semibold text-slate-900">
                                                                {formatDateTime(auditLog.OccurredAt)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="bg-slate-50 rounded-xl p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center">
                                                            <Clock className="w-5 h-5 text-slate-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-slate-500 uppercase tracking-wide">
                                                                Created At
                                                            </p>
                                                            <p className="text-sm font-semibold text-slate-900">
                                                                {formatDateTime(auditLog.CreatedAt)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}

export default AuditLogDetailModal
