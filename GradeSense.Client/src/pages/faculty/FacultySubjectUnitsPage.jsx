import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, Badge, Button, EmptyState, Modal, Pagination } from '@/components/common'
import { useAuth } from '@/context/AuthContext'
import { dashboardService } from '@/services/dashboardService'
import { subjectUnitService } from '@/services/subjectUnitService'
import { subjectService } from '@/services/subjectService'
import { useDebounce } from '@/hooks'
import { cn } from '@/utils/helpers'
import { getErrorMessage } from '@/utils/errorHandler'
import toast from 'react-hot-toast'
import {
    Layers,
    Search,
    Plus,
    Edit,
    Trash2,
    Loader2,
    BookOpen,
    Clock,
    Hash,
    FileText,
    RefreshCcw,
    CheckCircle,
    ChevronDown,
} from 'lucide-react'

// Unit Card Component
const UnitCard = ({ unit, onEdit, onDelete }) => (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-emerald-400 to-teal-500" />
        <Card.Body className="p-4">
            <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                    <Badge variant="primary" className="font-mono">Unit {unit.UnitNumber}</Badge>
                    <Badge variant={unit.IsActive !== false ? 'success' : 'secondary'}>
                        {unit.IsActive !== false ? 'Active' : 'Inactive'}
                    </Badge>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="sm" onClick={() => onEdit(unit)}>
                        <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={() => onDelete(unit)}>
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            <h3 className="font-semibold text-gray-900 line-clamp-1 mb-2">{unit.TopicName || unit.Name}</h3>
            <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                {unit.Description || 'No description provided'}
            </p>

            <div className="flex items-center gap-4 text-sm text-gray-500 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4" />
                    <span>{unit.SubjectName || unit.Subject?.Name}</span>
                </div>
                {(unit.TeachingHours || unit.Hours) && (
                    <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        <span>{unit.TeachingHours || unit.Hours} hrs</span>
                    </div>
                )}
            </div>
        </Card.Body>
    </Card>
)

// Unit Form Modal
const UnitFormModal = ({ isOpen, onClose, unit, subjects, onSubmit, isLoading }) => {
    const [formData, setFormData] = useState({
        subjectId: unit?.SubjectId?.toString() || '',
        unitNumber: unit?.UnitNumber?.toString() || '',
        topicName: unit?.TopicName || '',
        description: unit?.Description || '',
        teachingHours: unit?.TeachingHours?.toString() || '',
    })

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!formData.subjectId || !formData.unitNumber || !formData.topicName) {
            toast.error('Please fill all required fields')
            return
        }
        onSubmit({
            subjectId: parseInt(formData.subjectId),
            unitNumber: parseInt(formData.unitNumber),
            topicName: formData.topicName,
            description: formData.description || null,
            teachingHours: formData.teachingHours ? parseInt(formData.teachingHours) : 1,
        })
    }

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={unit ? 'Edit Subject Unit' : 'Create Subject Unit'}
            size="md"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Subject */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Subject <span className="text-red-500">*</span>
                    </label>
                    <select
                        value={formData.subjectId}
                        onChange={(e) => handleChange('subjectId', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={!!unit}
                    >
                        <option value="">Select subject...</option>
                        {subjects.map(subject => (
                            <option key={subject.Id || subject.SubjectId} value={subject.Id || subject.SubjectId}>
                                {subject.Name || subject.SubjectName} ({subject.Code || subject.SubjectCode})
                            </option>
                        ))}
                    </select>
                </div>

                {/* Unit Number and Name */}
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Unit # <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            min="1"
                            value={formData.unitNumber}
                            onChange={(e) => handleChange('unitNumber', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="1"
                        />
                    </div>
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Topic Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.topicName}
                            onChange={(e) => handleChange('topicName', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Introduction to..."
                        />
                    </div>
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => handleChange('description', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={3}
                        placeholder="Brief description of the unit..."
                    />
                </div>

                {/* Hours */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Teaching Hours <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="number"
                        min="1"
                        value={formData.teachingHours}
                        onChange={(e) => handleChange('teachingHours', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="10"
                        required
                    />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                    <Button type="submit" variant="primary" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                {unit ? 'Update' : 'Create'}
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </Modal>
    )
}

const FacultySubjectUnitsPage = () => {
    const queryClient = useQueryClient()
    const { user } = useAuth()
    const [searchTerm, setSearchTerm] = useState('')
    const [subjectFilter, setSubjectFilter] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [formModalOpen, setFormModalOpen] = useState(false)
    const [selectedUnit, setSelectedUnit] = useState(null)
    const [deleteTarget, setDeleteTarget] = useState(null)
    const [pageSize, setPageSize] = useState(12)
    const debouncedSearch = useDebounce(searchTerm, 300)

    // Fetch faculty's courses to get subjects
    const { data: dashboardData } = useQuery({
        queryKey: ['faculty-dashboard-units'],
        queryFn: () => dashboardService.getMyDashboard(),
    })

    // Extract unique subjects from courses
    const subjects = useMemo(() => {
        const data = dashboardData?.Data || dashboardData || {}
        const courses = data.CurrentCourses || []
        const subjectMap = new Map()
        courses.forEach(course => {
            if (!subjectMap.has(course.SubjectCode)) {
                subjectMap.set(course.SubjectCode, {
                    SubjectCode: course.SubjectCode,
                    SubjectName: course.SubjectName,
                    // Note: We don't have SubjectId from dashboard, would need separate fetch
                })
            }
        })
        return Array.from(subjectMap.values())
    }, [dashboardData])

    // Fetch all subjects for the form (need IDs for creating units)
    const { data: allSubjectsData } = useQuery({
        queryKey: ['all-subjects'],
        queryFn: () => subjectService.getAll({ pageSize: 200 }),
    })

    const allSubjects = useMemo(() => {
        return allSubjectsData?.Data?.Data || allSubjectsData?.Data || []
    }, [allSubjectsData])

    // Filter subjects that faculty teaches
    const teachingSubjects = useMemo(() => {
        const subjectCodes = subjects.map(s => s.SubjectCode)
        return allSubjects.filter(s => subjectCodes.includes(s.Code))
    }, [allSubjects, subjects])

    // Get subject IDs for filtering
    const subjectIds = useMemo(() => {
        return teachingSubjects.map(s => s.Id).filter(Boolean)
    }, [teachingSubjects])

    // Fetch subject units
    const { data: unitsData, isLoading, refetch } = useQuery({
        queryKey: ['faculty-subject-units', subjectFilter || subjectIds.join(','), currentPage],
        queryFn: () => {
            const params = {
                pageNumber: currentPage,
                pageSize,
            }
            if (subjectFilter) {
                params.subjectId = subjectFilter
            } else if (subjectIds.length > 0) {
                params.subjectId = subjectIds[0]
            }
            return subjectUnitService.getAll(params)
        },
        enabled: subjectIds.length > 0 || !!subjectFilter,
    })

    const units = useMemo(() => {
        return unitsData?.Data?.Data || unitsData?.Data || []
    }, [unitsData])

    // Filter units
    const filteredUnits = useMemo(() => {
        return units.filter(unit => {
            const matchesSearch = !debouncedSearch ||
                unit.TopicName?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                unit.Name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                unit.Description?.toLowerCase().includes(debouncedSearch.toLowerCase())
            return matchesSearch
        })
    }, [units, debouncedSearch])

    const totalCount = unitsData?.Data?.TotalRecords || filteredUnits.length
    const totalPages = Math.ceil(totalCount / pageSize)

    // Create mutation
    const createMutation = useMutation({
        mutationFn: (data) => subjectUnitService.create(data),
        onSuccess: () => {
            toast.success('Subject unit created successfully')
            queryClient.invalidateQueries(['faculty-subject-units'])
            setFormModalOpen(false)
            setSelectedUnit(null)
        },
        onError: (error) => {
            toast.error(getErrorMessage(error))
        },
    })

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => subjectUnitService.update(id, data),
        onSuccess: () => {
            toast.success('Subject unit updated successfully')
            queryClient.invalidateQueries(['faculty-subject-units'])
            setFormModalOpen(false)
            setSelectedUnit(null)
        },
        onError: (error) => {
            toast.error(getErrorMessage(error))
        },
    })

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: (id) => subjectUnitService.delete(id),
        onSuccess: () => {
            toast.success('Subject unit deleted successfully')
            queryClient.invalidateQueries(['faculty-subject-units'])
            setDeleteTarget(null)
        },
        onError: (error) => {
            toast.error(getErrorMessage(error))
        },
    })

    const handleSubmit = (data) => {
        if (selectedUnit) {
            updateMutation.mutate({ id: selectedUnit.Id, data })
        } else {
            createMutation.mutate(data)
        }
    }

    const handleEdit = (unit) => {
        setSelectedUnit(unit)
        setFormModalOpen(true)
    }

    const handleCreate = () => {
        setSelectedUnit(null)
        setFormModalOpen(true)
    }

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg shadow-emerald-500/25">
                        <Layers className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent">
                            Subject Units
                        </h1>
                        <p className="text-gray-500">Manage course curriculum units</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => refetch()}>
                        <RefreshCcw className="w-4 h-4 mr-2" />
                        Refresh
                    </Button>
                    <Button variant="primary" onClick={handleCreate}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Unit
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-0">
                    <Card.Body className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-100 rounded-lg">
                                <Layers className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{units.length}</p>
                                <p className="text-sm text-gray-600">Total Units</p>
                            </div>
                        </div>
                    </Card.Body>
                </Card>
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-0">
                    <Card.Body className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <BookOpen className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{teachingSubjects.length}</p>
                                <p className="text-sm text-gray-600">Subjects</p>
                            </div>
                        </div>
                    </Card.Body>
                </Card>
                <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-0">
                    <Card.Body className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <Clock className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">
                                    {units.reduce((sum, u) => sum + (u.TeachingHours || 0), 0)}
                                </p>
                                <p className="text-sm text-gray-600">Total Hours</p>
                            </div>
                        </div>
                    </Card.Body>
                </Card>
            </div>

            {/* Filters */}
            <Card className="border-0 shadow-md">
                <Card.Body className="p-4">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex-1 min-w-64">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search units..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                        <select
                            value={subjectFilter}
                            onChange={(e) => setSubjectFilter(e.target.value)}
                            className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">All Subjects</option>
                            {teachingSubjects.map(subject => (
                                <option key={subject.Id} value={subject.Id}>
                                    {subject.Name} ({subject.Code})
                                </option>
                            ))}
                        </select>
                    </div>
                </Card.Body>
            </Card>

            {/* Content */}
            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="text-center">
                        <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mx-auto" />
                        <p className="text-sm text-gray-500 mt-3">Loading units...</p>
                    </div>
                </div>
            ) : filteredUnits.length === 0 ? (
                <EmptyState
                    icon={Layers}
                    title="No Units Found"
                    description={subjectFilter ? "No units for this subject yet" : "Select a subject to view units"}
                    action={{
                        label: 'Add Unit',
                        onClick: handleCreate,
                    }}
                />
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredUnits.map(unit => (
                            <UnitCard
                                key={unit.Id}
                                unit={unit}
                                onEdit={handleEdit}
                                onDelete={setDeleteTarget}
                            />
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div className="flex justify-center">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                totalItems={totalCount}
                                pageSize={pageSize}
                                onPageChange={setCurrentPage}
                                onPageSizeChange={(size) => {
                                    setPageSize(size)
                                    setCurrentPage(1)
                                }}
                            />
                        </div>
                    )}
                </>
            )}

            {/* Form Modal */}
            {formModalOpen && (
                <UnitFormModal
                    isOpen={formModalOpen}
                    onClose={() => {
                        setFormModalOpen(false)
                        setSelectedUnit(null)
                    }}
                    unit={selectedUnit}
                    subjects={teachingSubjects}
                    onSubmit={handleSubmit}
                    isLoading={createMutation.isPending || updateMutation.isPending}
                />
            )}

            {/* Delete Confirmation */}
            <Modal
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                title="Delete Unit"
                size="sm"
            >
                <div className="space-y-4">
                    <p className="text-gray-600">
                        Are you sure you want to delete <strong>Unit {deleteTarget?.UnitNumber}: {deleteTarget?.Name}</strong>?
                    </p>
                    <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
                        <Button
                            variant="danger"
                            onClick={() => deleteMutation.mutate(deleteTarget.Id)}
                            disabled={deleteMutation.isPending}
                        >
                            {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}

export default FacultySubjectUnitsPage
