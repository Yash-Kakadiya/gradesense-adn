import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Dialog, Transition, Listbox } from '@headlessui/react'
import { Fragment } from 'react'
import {
    ChevronLeft,
    ChevronRight,
    Calendar,
    Check,
    X,
    Clock,
    AlertCircle,
    ChevronDown,
    Loader2,
    BookOpen,
    Filter,
} from 'lucide-react'
import { Card, Badge } from '@/components/common'
import { dashboardService } from '@/services/dashboardService'
import { cn } from '@/utils/helpers'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
]

// Status badge colors
const getStatusColor = (status) => {
    switch (status) {
        case 'Present':
            return 'bg-emerald-100 text-emerald-700 border-emerald-200'
        case 'Absent':
            return 'bg-red-100 text-red-700 border-red-200'
        case 'Late':
            return 'bg-amber-100 text-amber-700 border-amber-200'
        case 'Excused':
            return 'bg-blue-100 text-blue-700 border-blue-200'
        default:
            return 'bg-gray-100 text-gray-700 border-gray-200'
    }
}

const getStatusIcon = (status) => {
    switch (status) {
        case 'Present':
            return <Check className="w-3 h-3" />
        case 'Absent':
            return <X className="w-3 h-3" />
        case 'Late':
            return <Clock className="w-3 h-3" />
        case 'Excused':
            return <AlertCircle className="w-3 h-3" />
        default:
            return null
    }
}

// Day Detail Modal
const DayDetailModal = ({ isOpen, onClose, day, date }) => {
    if (!day) return null

    const formattedDate = date ? new Date(date.year, date.month, day.DayOfMonth).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }) : ''

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
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
                                {/* Header */}
                                <div className="relative bg-gradient-to-br from-indigo-500 to-purple-600 px-6 py-5">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />

                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>

                                    <div className="relative flex flex-col items-center">
                                        <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center mb-3 ring-4 ring-white/30">
                                            <Calendar className="w-8 h-8 text-white" />
                                        </div>
                                        <Dialog.Title className="text-xl font-bold text-white">
                                            Attendance Details
                                        </Dialog.Title>
                                        <p className="text-white/80 text-sm mt-1">
                                            {formattedDate}
                                        </p>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6">
                                    {day.Entries && day.Entries.length > 0 ? (
                                        <div className="space-y-3">
                                            {day.Entries.map((entry, idx) => (
                                                <div
                                                    key={idx}
                                                    className={cn(
                                                        "p-4 rounded-xl border-2 transition-all",
                                                        getStatusColor(entry.Status)
                                                    )}
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <p className="font-semibold text-gray-900">
                                                                {entry.SubjectCode}
                                                            </p>
                                                            <p className="text-sm text-gray-600 mt-0.5">
                                                                {entry.SubjectName}
                                                            </p>
                                                        </div>
                                                        <span className={cn(
                                                            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border",
                                                            getStatusColor(entry.Status)
                                                        )}>
                                                            {getStatusIcon(entry.Status)}
                                                            {entry.Status}
                                                        </span>
                                                    </div>
                                                    {entry.Remarks && (
                                                        <p className="mt-2 text-sm text-gray-600 bg-white/50 rounded-lg p-2">
                                                            <span className="font-medium">Note:</span> {entry.Remarks}
                                                        </p>
                                                    )}
                                                    {entry.RecordedByName && (
                                                        <p className="mt-2 text-xs text-gray-500">
                                                            Recorded by: {entry.RecordedByName}
                                                        </p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                            <p>No classes recorded for this day</p>
                                        </div>
                                    )}
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}

// Calendar Day Cell
const CalendarDay = ({ day, onClick, isCurrentMonth = true }) => {
    if (!day) {
        return <div className="h-24 bg-gray-50/50" />
    }

    const hasClasses = day.Entries && day.Entries.length > 0
    const allPresent = hasClasses && day.Entries.every(e => e.Status === 'Present' || e.Status === 'Late' || e.Status === 'Excused')
    const hasAbsent = hasClasses && day.Entries.some(e => e.Status === 'Absent')

    return (
        <button
            onClick={() => hasClasses && onClick(day)}
            disabled={!hasClasses}
            className={cn(
                "h-24 p-2 text-left transition-all border-b border-r border-gray-100 relative group",
                day.IsWeekend && "bg-gray-50/70",
                day.IsToday && "bg-indigo-50/50 ring-2 ring-inset ring-indigo-500",
                hasClasses && "hover:bg-gray-50 cursor-pointer",
                !hasClasses && !day.IsWeekend && "bg-white",
                !isCurrentMonth && "opacity-40"
            )}
        >
            {/* Day number */}
            <span className={cn(
                "inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-medium",
                day.IsToday ? "bg-indigo-600 text-white" : "text-gray-700",
                day.IsWeekend && !day.IsToday && "text-gray-400"
            )}>
                {day.DayOfMonth}
            </span>

            {/* Attendance indicator dots */}
            {hasClasses && (
                <div className="mt-1 flex flex-wrap gap-1">
                    {day.Entries.slice(0, 4).map((entry, idx) => (
                        <span
                            key={idx}
                            className={cn(
                                "w-2 h-2 rounded-full",
                                entry.Status === 'Present' && "bg-emerald-500",
                                entry.Status === 'Absent' && "bg-red-500",
                                entry.Status === 'Late' && "bg-amber-500",
                                entry.Status === 'Excused' && "bg-blue-500"
                            )}
                            title={`${entry.SubjectCode}: ${entry.Status}`}
                        />
                    ))}
                    {day.Entries.length > 4 && (
                        <span className="text-xs text-gray-400">+{day.Entries.length - 4}</span>
                    )}
                </div>
            )}

            {/* Status summary badge */}
            {hasClasses && (
                <div className={cn(
                    "absolute bottom-2 right-2 text-xs px-1.5 py-0.5 rounded font-medium",
                    allPresent ? "bg-emerald-100 text-emerald-700" : hasAbsent ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"
                )}>
                    {day.Entries.length} {day.Entries.length === 1 ? 'class' : 'classes'}
                </div>
            )}
        </button>
    )
}

// Main Attendance Calendar Component
const AttendanceCalendar = ({ studentId }) => {
    const today = new Date()
    const [selectedYear, setSelectedYear] = useState(today.getFullYear())
    const [selectedMonth, setSelectedMonth] = useState(today.getMonth())
    const [selectedCourse, setSelectedCourse] = useState(null)
    const [selectedDay, setSelectedDay] = useState(null)
    const [isDayModalOpen, setIsDayModalOpen] = useState(false)

    // Fetch calendar data
    const { data: calendarData, isLoading, error } = useQuery({
        queryKey: ['attendance-calendar', studentId, selectedYear, selectedMonth + 1, selectedCourse?.CourseOfferingId],
        queryFn: () => dashboardService.getAttendanceCalendar(studentId, {
            year: selectedYear,
            month: selectedMonth + 1,
            courseOfferingId: selectedCourse?.CourseOfferingId
        }),
        enabled: !!studentId,
        staleTime: 60000,
    })

    const calendar = calendarData?.Data || {}
    const days = calendar.Days || []
    const summary = calendar.Summary || {}
    const courses = calendar.AvailableCourses || []

    // Build calendar grid
    const calendarGrid = useMemo(() => {
        const firstDay = new Date(selectedYear, selectedMonth, 1)
        const lastDay = new Date(selectedYear, selectedMonth + 1, 0)
        const startPadding = firstDay.getDay() // 0 = Sunday
        const totalDays = lastDay.getDate()

        const grid = []

        // Add padding for days before the 1st
        for (let i = 0; i < startPadding; i++) {
            grid.push(null)
        }

        // Add actual days
        for (let d = 1; d <= totalDays; d++) {
            const dayData = days.find(day => day.DayOfMonth === d)
            grid.push(dayData || {
                Date: new Date(selectedYear, selectedMonth, d).toISOString().split('T')[0],
                DayOfMonth: d,
                IsWeekend: new Date(selectedYear, selectedMonth, d).getDay() === 0 || new Date(selectedYear, selectedMonth, d).getDay() === 6,
                IsToday: new Date(selectedYear, selectedMonth, d).toDateString() === today.toDateString(),
                Entries: []
            })
        }

        return grid
    }, [selectedYear, selectedMonth, days])

    // Navigation handlers
    const goToPreviousMonth = () => {
        if (selectedMonth === 0) {
            setSelectedMonth(11)
            setSelectedYear(selectedYear - 1)
        } else {
            setSelectedMonth(selectedMonth - 1)
        }
    }

    const goToNextMonth = () => {
        if (selectedMonth === 11) {
            setSelectedMonth(0)
            setSelectedYear(selectedYear + 1)
        } else {
            setSelectedMonth(selectedMonth + 1)
        }
    }

    const goToToday = () => {
        setSelectedYear(today.getFullYear())
        setSelectedMonth(today.getMonth())
    }

    const handleDayClick = (day) => {
        setSelectedDay(day)
        setIsDayModalOpen(true)
    }

    if (isLoading) {
        return (
            <Card className="p-8">
                <div className="flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                    <span className="ml-3 text-gray-600">Loading calendar...</span>
                </div>
            </Card>
        )
    }

    if (error) {
        return (
            <Card className="p-8">
                <div className="text-center text-red-500">
                    <AlertCircle className="w-12 h-12 mx-auto mb-3" />
                    <p>Failed to load attendance calendar</p>
                </div>
            </Card>
        )
    }

    return (
        <Card className="overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-white/20 backdrop-blur rounded-xl">
                            <Calendar className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Attendance Calendar</h3>
                            <p className="text-white/70 text-sm">Track your attendance record</p>
                        </div>
                    </div>

                    {/* Course Filter */}
                    {courses.length > 0 && (
                        <Listbox value={selectedCourse} onChange={setSelectedCourse}>
                            <div className="relative w-full sm:w-64">
                                <Listbox.Button className="relative w-full cursor-pointer rounded-xl bg-white/20 backdrop-blur py-2.5 pl-4 pr-10 text-left text-white border border-white/30 hover:bg-white/30 transition-colors">
                                    <span className="flex items-center gap-2 truncate">
                                        <Filter className="w-4 h-4" />
                                        {selectedCourse ? selectedCourse.SubjectCode : 'All Courses'}
                                    </span>
                                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                        <ChevronDown className="w-5 h-5 text-white/70" />
                                    </span>
                                </Listbox.Button>
                                <Transition
                                    as={Fragment}
                                    leave="transition ease-in duration-100"
                                    leaveFrom="opacity-100"
                                    leaveTo="opacity-0"
                                >
                                    <Listbox.Options className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 shadow-lg ring-1 ring-black/5 focus:outline-none">
                                        <Listbox.Option
                                            value={null}
                                            className={({ active }) =>
                                                cn(
                                                    "relative cursor-pointer select-none py-2.5 pl-10 pr-4",
                                                    active ? "bg-indigo-50 text-indigo-900" : "text-gray-900"
                                                )
                                            }
                                        >
                                            {({ selected }) => (
                                                <>
                                                    <span className={cn("block truncate", selected && "font-semibold")}>
                                                        All Courses
                                                    </span>
                                                    {selected && (
                                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-indigo-600">
                                                            <Check className="w-5 h-5" />
                                                        </span>
                                                    )}
                                                </>
                                            )}
                                        </Listbox.Option>
                                        {courses.map((course) => (
                                            <Listbox.Option
                                                key={course.CourseOfferingId}
                                                value={course}
                                                className={({ active }) =>
                                                    cn(
                                                        "relative cursor-pointer select-none py-2.5 pl-10 pr-4",
                                                        active ? "bg-indigo-50 text-indigo-900" : "text-gray-900"
                                                    )
                                                }
                                            >
                                                {({ selected }) => (
                                                    <>
                                                        <span className={cn("block truncate", selected && "font-semibold")}>
                                                            {course.SubjectCode} - {course.SubjectName}
                                                        </span>
                                                        <span className="block text-xs text-gray-500">
                                                            {course.AttendancePercentage?.toFixed(1) || 0}% attendance
                                                        </span>
                                                        {selected && (
                                                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-indigo-600">
                                                                <Check className="w-5 h-5" />
                                                            </span>
                                                        )}
                                                    </>
                                                )}
                                            </Listbox.Option>
                                        ))}
                                    </Listbox.Options>
                                </Transition>
                            </div>
                        </Listbox>
                    )}
                </div>

                {/* Month/Year Navigation */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/20">
                    <button
                        onClick={goToPreviousMonth}
                        className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-2">
                        {/* Month Selector */}
                        <Listbox value={selectedMonth} onChange={setSelectedMonth}>
                            <div className="relative">
                                <Listbox.Button className="flex items-center gap-1 px-3 py-1.5 text-lg font-bold text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
                                    {MONTHS[selectedMonth]}
                                    <ChevronDown className="w-4 h-4" />
                                </Listbox.Button>
                                <Transition
                                    as={Fragment}
                                    leave="transition ease-in duration-100"
                                    leaveFrom="opacity-100"
                                    leaveTo="opacity-0"
                                >
                                    <Listbox.Options className="absolute z-20 mt-1 max-h-60 w-40 overflow-auto rounded-xl bg-white py-1 shadow-lg ring-1 ring-black/5 focus:outline-none">
                                        {MONTHS.map((month, idx) => (
                                            <Listbox.Option
                                                key={month}
                                                value={idx}
                                                className={({ active }) =>
                                                    cn(
                                                        "relative cursor-pointer select-none py-2 pl-10 pr-4 text-sm",
                                                        active ? "bg-indigo-50 text-indigo-900" : "text-gray-900"
                                                    )
                                                }
                                            >
                                                {({ selected }) => (
                                                    <>
                                                        <span className={cn("block truncate", selected && "font-semibold")}>
                                                            {month}
                                                        </span>
                                                        {selected && (
                                                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-indigo-600">
                                                                <Check className="w-4 h-4" />
                                                            </span>
                                                        )}
                                                    </>
                                                )}
                                            </Listbox.Option>
                                        ))}
                                    </Listbox.Options>
                                </Transition>
                            </div>
                        </Listbox>
                        {/* Year Selector */}
                        <Listbox value={selectedYear} onChange={setSelectedYear}>
                            <div className="relative">
                                <Listbox.Button className="flex items-center gap-1 px-3 py-1.5 text-lg font-bold text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
                                    {selectedYear}
                                    <ChevronDown className="w-4 h-4" />
                                </Listbox.Button>
                                <Transition
                                    as={Fragment}
                                    leave="transition ease-in duration-100"
                                    leaveFrom="opacity-100"
                                    leaveTo="opacity-0"
                                >
                                    <Listbox.Options className="absolute z-20 mt-1 max-h-60 w-24 overflow-auto rounded-xl bg-white py-1 shadow-lg ring-1 ring-black/5 focus:outline-none">
                                        {Array.from({ length: 10 }, (_, i) => today.getFullYear() - 5 + i).map((year) => (
                                            <Listbox.Option
                                                key={year}
                                                value={year}
                                                className={({ active }) =>
                                                    cn(
                                                        "relative cursor-pointer select-none py-2 pl-10 pr-4 text-sm",
                                                        active ? "bg-indigo-50 text-indigo-900" : "text-gray-900"
                                                    )
                                                }
                                            >
                                                {({ selected }) => (
                                                    <>
                                                        <span className={cn("block truncate", selected && "font-semibold")}>
                                                            {year}
                                                        </span>
                                                        {selected && (
                                                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-indigo-600">
                                                                <Check className="w-4 h-4" />
                                                            </span>
                                                        )}
                                                    </>
                                                )}
                                            </Listbox.Option>
                                        ))}
                                    </Listbox.Options>
                                </Transition>
                            </div>
                        </Listbox>
                        <button
                            onClick={goToToday}
                            className="px-3 py-1.5 text-xs font-medium bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors"
                        >
                            Today
                        </button>
                    </div>
                    <button
                        onClick={goToNextMonth}
                        className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Summary Stats */}
            {summary.TotalClasses > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-px bg-gray-100 border-b border-gray-200">
                    <div className="bg-white p-3 text-center">
                        <p className="text-2xl font-bold text-gray-900">{summary.TotalClasses}</p>
                        <p className="text-xs text-gray-500">Total Classes</p>
                    </div>
                    <div className="bg-white p-3 text-center">
                        <p className="text-2xl font-bold text-emerald-600">{summary.PresentCount}</p>
                        <p className="text-xs text-gray-500">Present</p>
                    </div>
                    <div className="bg-white p-3 text-center">
                        <p className="text-2xl font-bold text-red-600">{summary.AbsentCount}</p>
                        <p className="text-xs text-gray-500">Absent</p>
                    </div>
                    <div className="bg-white p-3 text-center">
                        <p className="text-2xl font-bold text-amber-600">{summary.LateCount}</p>
                        <p className="text-xs text-gray-500">Late</p>
                    </div>
                    <div className="bg-white p-3 text-center col-span-2 sm:col-span-1">
                        <p className={cn(
                            "text-2xl font-bold",
                            summary.AttendancePercentage >= 75 ? "text-emerald-600" : "text-red-600"
                        )}>
                            {summary.AttendancePercentage?.toFixed(1) || 0}%
                        </p>
                        <p className="text-xs text-gray-500">Attendance</p>
                    </div>
                </div>
            )}

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
                {WEEKDAYS.map((day, idx) => (
                    <div
                        key={day}
                        className={cn(
                            "py-3 text-center text-sm font-semibold",
                            (idx === 0 || idx === 6) ? "text-gray-400" : "text-gray-700"
                        )}
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7">
                {calendarGrid.map((day, idx) => (
                    <CalendarDay
                        key={idx}
                        day={day}
                        onClick={handleDayClick}
                    />
                ))}
            </div>

            {/* Legend */}
            <div className="p-4 bg-gray-50 border-t border-gray-200">
                <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
                    <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-emerald-500" />
                        <span className="text-gray-600">Present</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-red-500" />
                        <span className="text-gray-600">Absent</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-amber-500" />
                        <span className="text-gray-600">Late</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-blue-500" />
                        <span className="text-gray-600">Excused</span>
                    </div>
                </div>
            </div>

            {/* Day Detail Modal */}
            <DayDetailModal
                isOpen={isDayModalOpen}
                onClose={() => setIsDayModalOpen(false)}
                day={selectedDay}
                date={{ year: selectedYear, month: selectedMonth }}
            />
        </Card>
    )
}

export default AttendanceCalendar
