import { useState, useEffect } from 'react'
import { cn } from '@/utils/helpers'
import { Search, X } from 'lucide-react'
import { useDebounce } from '@/hooks/useDebounce'

const SearchInput = ({
    value: externalValue,
    onChange,
    placeholder = 'Search...',
    debounceMs = 300,
    className,
    ...props
}) => {
    const [internalValue, setInternalValue] = useState(externalValue || '')
    const debouncedValue = useDebounce(internalValue, debounceMs)

    useEffect(() => {
        if (externalValue !== undefined) {
            setInternalValue(externalValue)
        }
    }, [externalValue])

    useEffect(() => {
        if (onChange && debouncedValue !== externalValue) {
            onChange(debouncedValue)
        }
    }, [debouncedValue, onChange, externalValue])

    const handleClear = () => {
        setInternalValue('')
        onChange?.('')
    }

    return (
        <div className={cn('relative', className)}>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-gray-400" />
            </div>
            <input
                type="text"
                value={internalValue}
                onChange={(e) => setInternalValue(e.target.value)}
                placeholder={placeholder}
                className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                {...props}
            />
            {internalValue && (
                <button
                    type="button"
                    onClick={handleClear}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                    <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                </button>
            )}
        </div>
    )
}

export default SearchInput
