import { useState, Fragment } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Dialog, Transition } from '@headlessui/react'
import { Card, Badge, EmptyState, Pagination } from '@/components/common'
import { facultyService } from '@/services/facultyService'
import { useDebounce, usePagination } from '@/hooks'
import {
    User,
    Mail,
    Phone,
    Building2,
    Loader2,
    Eye,
    X,
    GraduationCap,
    Search,
    Calendar,
    Award,
    BookOpen,
    Users,
    RefreshCw,
} from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'https://localhost:7266'

// Format date helper
const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    })
}

// Faculty Detail Modal Component
const FacultyDetailModal = ({ isOpen, onClose, facultyId }) => {
    const { data: facultyData, isLoading } = useQuery({
        queryKey: ['faculty-detail', facultyId],
        queryFn: async () => {
            const response = await facultyService.getById(facultyId)
            return response?.Data || null
        },
        enabled: !!facultyId && isOpen,
    })

    const faculty = facultyData

    const profileImageUrl = faculty?.ProfileImagePath
        ? `${API_URL}${faculty.ProfileImagePath}`
        : null

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
                            <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
                                {isLoading ? (
                                    <div className="py-20 text-center">
                                        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
                                        <p className="text-gray-500">Loading faculty details...</p>
                                    </div>
                                ) : faculty ? (
                                    <>
                                        {/* Header */}
                                        <div className="relative bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-6">
                                            <button
                                                onClick={onClose}
                                                className="absolute right-4 top-4 p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>

                                            <div className="flex flex-col items-center">
                                                {profileImageUrl ? (
                                                    <img
                                                        src={profileImageUrl}
                                                        alt={faculty.FullName}
                                                        className="w-24 h-24 rounded-full border-4 border-white/30 object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center border-4 border-white/30">
                                                        <span className="text-3xl font-bold text-white">
                                                            {faculty.FullName?.charAt(0) || 'F'}
                                                        </span>
                                                    </div>
                                                )}
                                                <Dialog.Title className="text-xl font-bold text-white mt-4 text-center">
                                                    {faculty.FullName}
                                                </Dialog.Title>
                                                {faculty.Designation && (
                                                    <p className="text-blue-100 text-sm mt-1">{faculty.Designation}</p>
                                                )}
                                                <Badge variant="secondary" className="mt-3 bg-white/20 text-white border-0">
                                                    {faculty.DepartmentName}
                                                </Badge>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="p-5 space-y-5 max-h-[60vh] overflow-y-auto">
                                            {/* Faculty Information */}
                                            <div>
                                                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Faculty Information</h3>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                        <div className="p-2 bg-amber-100 rounded-lg">
                                                            <Building2 className="w-5 h-5 text-amber-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500">Department</p>
                                                            <p className="font-medium text-gray-900">{faculty.DepartmentName}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                        <div className="p-2 bg-gray-100 rounded-lg">
                                                            <Calendar className="w-5 h-5 text-gray-500" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500">Joined</p>
                                                            <p className="font-medium text-gray-900 text-sm">
                                                                {formatDate(faculty.JoiningDate || faculty.CreatedAt)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Academic Information */}
                                            <div>
                                                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Academic Information</h3>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                        <div className="p-2 bg-cyan-100 rounded-lg">
                                                            <GraduationCap className="w-5 h-5 text-cyan-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500">Qualification</p>
                                                            <p className="font-medium text-gray-900">{faculty.Qualification || 'N/A'}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                        <div className="p-2 bg-pink-100 rounded-lg">
                                                            <Award className="w-5 h-5 text-pink-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500">Specialization</p>
                                                            <p className="font-medium text-gray-900">{faculty.Specialization || 'N/A'}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Contact Information */}
                                            <div>
                                                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Contact Information</h3>
                                                <div className="grid grid-cols-3 gap-3">
                                                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                                                        <div className="p-2 bg-blue-100 rounded-lg shrink-0">
                                                            <Mail className="w-5 h-5 text-blue-600" />
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-xs text-gray-500">Personal Email</p>
                                                            <p className="font-medium text-gray-900 truncate" title={faculty.PersonalEmail}>{faculty.PersonalEmail}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                                                        <div className="p-2 bg-indigo-100 rounded-lg shrink-0">
                                                            <Building2 className="w-5 h-5 text-indigo-600" />
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-xs text-gray-500">Institutional Email</p>
                                                            <p className="font-medium text-gray-900 truncate" title={faculty.InstitutionalEmail}>{faculty.InstitutionalEmail || 'N/A'}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                        <div className="p-2 bg-green-100 rounded-lg">
                                                            <Phone className="w-5 h-5 text-green-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500">Phone Number</p>
                                                            <p className="font-medium text-gray-900">{faculty.PhoneNumber || 'N/A'}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                        </div>

                                        {/* Footer */}
                                        <div className="px-5 py-4 bg-gray-50 border-t border-gray-100">
                                            <button
                                                onClick={onClose}
                                                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
                                            >
                                                Close
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="py-16 text-center text-gray-500">
                                        Faculty not found
                                    </div>
                                )}
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}

// Faculty Card Component
const FacultyCard = ({ faculty, onViewDetails }) => {
    const profileImageUrl = faculty.ProfileImagePath
        ? `${API_URL}${faculty.ProfileImagePath}`
        : null

    return (
        <Card
            className="hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden cursor-pointer"
            onClick={() => onViewDetails(faculty)}
        >
            <div className="p-5">
                <div className="flex items-start gap-4">
                    {/* Avatar */}
                    {profileImageUrl ? (
                        <img
                            src={profileImageUrl}
                            alt={faculty.FullName}
                            className="w-14 h-14 rounded-xl object-cover border-2 border-gray-100"
                        />
                    ) : (
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center border-2 border-gray-100">
                            <span className="text-xl font-bold text-white">
                                {faculty.FullName?.charAt(0) || 'F'}
                            </span>
                        </div>
                    )}

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{faculty.FullName}</h3>
                        {faculty.Designation && (
                            <p className="text-sm text-gray-500">{faculty.Designation}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                            <Badge variant="primary" className="text-xs">
                                {faculty.DepartmentName}
                            </Badge>
                        </div>
                    </div>
                    <Eye className="w-5 h-5 text-blue-500" />
                </div>

                {/* Contact Info */}
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="truncate">{faculty.InstitutionalEmail || faculty.PersonalEmail}</span>
                    </div>
                    {faculty.PhoneNumber && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span>{faculty.PhoneNumber}</span>
                        </div>
                    )}
                </div>
            </div>
        </Card>
    )
}

const StudentFacultiesPage = () => {
    const [searchInput, setSearchInput] = useState('')
    const [departmentFilter, setDepartmentFilter] = useState('')
    const [viewFacultyId, setViewFacultyId] = useState(null)
    const [isViewModalOpen, setIsViewModalOpen] = useState(false)
    const debouncedSearch = useDebounce(searchInput, 300)

    // Pagination
    const {
        currentPage,
        pageSize,
        handlePageChange,
        handlePageSizeChange,
        paginationParams,
    } = usePagination()

    // Fetch all active faculties (fetch more to allow client-side department filtering)
    const { data, isLoading, refetch } = useQuery({
        queryKey: ['student-faculties', paginationParams, debouncedSearch],
        queryFn: () => facultyService.getAll({
            ...paginationParams,
            pageSize: 100, // Fetch more for client-side filtering
            isActive: true,
            searchTerm: debouncedSearch || undefined,
        }),
    })

    const allFaculties = data?.Data?.Data || []

    // Get unique departments for filter dropdown
    const departments = [...new Set(allFaculties.map(f => f.DepartmentName).filter(Boolean))].sort()

    // Apply department filter client-side
    const faculties = departmentFilter
        ? allFaculties.filter(f => f.DepartmentName === departmentFilter)
        : allFaculties

    const totalItems = faculties.length
    const totalPages = Math.ceil(totalItems / pageSize) || 1

    // Paginate client-side after filtering
    const startIndex = (currentPage - 1) * pageSize
    const paginatedFaculties = faculties.slice(startIndex, startIndex + pageSize)

    const handleViewFaculty = (faculty) => {
        setViewFacultyId(faculty.Id)
        setIsViewModalOpen(true)
    }

    const handleCloseViewModal = () => {
        setIsViewModalOpen(false)
        setViewFacultyId(null)
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/25">
                    <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Faculty Directory</h1>
                    <p className="text-gray-500">View faculty members and their contact information</p>
                </div>
            </div>

            {/* Search and Stats Bar */}
            <Card className="border-0 shadow-md overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                <Users className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-white">Find Faculty</h3>
                                <p className="text-sm text-white/80">Search by name, email, or department</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <div className="relative flex-1 sm:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    placeholder="Search faculties..."
                                    className="w-full pl-10 pr-10 py-2.5 bg-white/95 border-0 rounded-xl text-sm shadow-md placeholder-gray-400 focus:ring-2 focus:ring-white/50"
                                />
                                {searchInput && (
                                    <button
                                        onClick={() => setSearchInput('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
                                    >
                                        <X className="w-4 h-4 text-gray-400" />
                                    </button>
                                )}
                            </div>
                            <select
                                value={departmentFilter}
                                onChange={(e) => setDepartmentFilter(e.target.value)}
                                className="py-2.5 px-3 bg-white/95 border-0 rounded-xl text-sm shadow-md focus:ring-2 focus:ring-white/50 min-w-[160px]"
                            >
                                <option value="">All Departments</option>
                                {departments.map(dept => (
                                    <option key={dept} value={dept}>{dept}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
                <div className="px-6 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-t border-blue-100">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-2">
                                <Badge variant="primary" className="bg-blue-100 text-blue-700 border-0">
                                    {totalItems}
                                </Badge>
                                <span className="text-blue-700">facult{totalItems !== 1 ? 'ies' : 'y'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 border-0">
                                    {departments.length}
                                </Badge>
                                <span className="text-indigo-700">department{departments.length !== 1 ? 's' : ''}</span>
                            </div>
                        </div>
                        <button
                            onClick={() => refetch()}
                            disabled={isLoading}
                            className="p-2 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50"
                            title="Refresh"
                        >
                            <RefreshCw className={`w-4 h-4 text-blue-600 ${isLoading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>
            </Card>

            {/* Content */}
            {isLoading ? (
                <div className="flex justify-center items-center py-16">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
            ) : faculties.length === 0 ? (
                <Card className="border-0 shadow-sm">
                    <div className="flex flex-col items-center justify-center py-16">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <GraduationCap className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">No faculties found</h3>
                        <p className="text-gray-500 mb-6">
                            {(searchInput || departmentFilter)
                                ? "Try adjusting your search terms or filters"
                                : "No faculty members available"}
                        </p>
                        {(searchInput || departmentFilter) && (
                            <button
                                onClick={() => { setSearchInput(''); setDepartmentFilter(''); }}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Clear Filters
                            </button>
                        )}
                    </div>
                </Card>
            ) : (
                <>
                    {/* Faculty Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {paginatedFaculties.map((faculty) => (
                            <FacultyCard
                                key={faculty.Id}
                                faculty={faculty}
                                onViewDetails={handleViewFaculty}
                            />
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <Card className="border-0 shadow-sm">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                totalItems={totalItems}
                                pageSize={pageSize}
                                onPageChange={handlePageChange}
                                onPageSizeChange={handlePageSizeChange}
                            />
                        </Card>
                    )}
                </>
            )}

            {/* Faculty Detail Modal */}
            <FacultyDetailModal
                isOpen={isViewModalOpen}
                onClose={handleCloseViewModal}
                facultyId={viewFacultyId}
            />
        </div>
    )
}

export default StudentFacultiesPage
