import { Fragment, useState } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { Download, FileSpreadsheet, FileText, Loader2, ChevronDown } from 'lucide-react';
import { Button } from '@/components/common';
import { cn } from '@/utils/helpers';
import toast from 'react-hot-toast';

/**
 * Export Dropdown Component
 * Provides CSV and Excel export options with loading states
 * 
 * @param {Function} onExportCsv - Function to call for CSV export
 * @param {Function} onExportExcel - Function to call for Excel export
 * @param {boolean} disabled - Whether the export buttons should be disabled
 * @param {string} className - Additional CSS classes
 */
const ExportDropdown = ({
    onExportCsv,
    onExportExcel,
    disabled = false,
    className = ''
}) => {
    const [isExporting, setIsExporting] = useState(false);
    const [exportType, setExportType] = useState(null);

    const handleExport = async (type, exportFn) => {
        if (isExporting) return;

        setIsExporting(true);
        setExportType(type);

        try {
            await exportFn();
            toast.success(`${type.toUpperCase()} export completed successfully`);
        } catch (error) {
            console.error(`Export failed:`, error);
            const errorMessage = error?.response?.data?.Message || error?.message || 'Unknown error';
            toast.error(`Failed to export ${type.toUpperCase()}\n${errorMessage}`);
        } finally {
            setIsExporting(false);
            setExportType(null);
        }
    };

    return (
        <Menu as="div" className={cn("relative inline-block text-left", className)}>
            <Menu.Button
                as={Button}
                variant="outline"
                disabled={disabled || isExporting}
                className="gap-2"
            >
                {isExporting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    <Download className="w-4 h-4" />
                )}
                {isExporting ? 'Exporting...' : 'Export'}
                <ChevronDown className="w-4 h-4 ml-1" />
            </Menu.Button>

            <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
            >
                <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right divide-y divide-gray-100 rounded-xl bg-white shadow-lg ring-1 ring-black/5 focus:outline-none z-50">
                    <div className="p-1">
                        <Menu.Item>
                            {({ active }) => (
                                <button
                                    onClick={() => handleExport('csv', onExportCsv)}
                                    disabled={isExporting}
                                    className={cn(
                                        "group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                                        active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                                        isExporting && exportType === 'csv' && "opacity-50 cursor-not-allowed"
                                    )}
                                >
                                    {isExporting && exportType === 'csv' ? (
                                        <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                                    ) : (
                                        <FileText className="w-4 h-4 text-emerald-600" />
                                    )}
                                    <div className="flex flex-col items-start">
                                        <span className="font-medium">Export CSV</span>
                                        <span className="text-xs text-gray-500">Basic list data</span>
                                    </div>
                                </button>
                            )}
                        </Menu.Item>
                        <Menu.Item>
                            {({ active }) => (
                                <button
                                    onClick={() => handleExport('excel', onExportExcel)}
                                    disabled={isExporting}
                                    className={cn(
                                        "group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                                        active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                                        isExporting && exportType === 'excel' && "opacity-50 cursor-not-allowed"
                                    )}
                                >
                                    {isExporting && exportType === 'excel' ? (
                                        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                                    ) : (
                                        <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                                    )}
                                    <div className="flex flex-col items-start">
                                        <span className="font-medium">Export Excel</span>
                                        <span className="text-xs text-gray-500">Full detailed data</span>
                                    </div>
                                </button>
                            )}
                        </Menu.Item>
                    </div>
                </Menu.Items>
            </Transition>
        </Menu>
    );
};

export default ExportDropdown;
