/* eslint-disable @typescript-eslint/no-explicit-any */
// components/admin/BookingFilters.tsx
'use client'

import { useState } from 'react'
import { Search, Filter, X, Calendar as CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { statusOptions } from './BookingStatusBadge'

interface BookingFiltersProps {
  onFilterChange: (filters: any) => void
  initialFilters?: any
  loading?: boolean
}

export default function BookingFilters({ 
  onFilterChange, 
  initialFilters = {},
  loading = false 
}: BookingFiltersProps) {
  // State for filters
  const [filters, setFilters] = useState({
    search: initialFilters.search || '',
    status: initialFilters.status || '',
    startDate: initialFilters.startDate || '',
    endDate: initialFilters.endDate || '',
  })

  //  State for showing/hiding date filters
  const [showDateFilters, setShowDateFilters] = useState(false)

  //  Handle filter change
  const handleChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  //  Clear all filters
  const clearFilters = () => {
    const emptyFilters = { search: '', status: '', startDate: '', endDate: '' }
    setFilters(emptyFilters)
    onFilterChange(emptyFilters)
    setShowDateFilters(false)
  }

  //  Check if any filter is active
  const hasActiveFilters = Object.values(filters).some(v => v !== '')

  // Count active filters
  const activeFilterCount = Object.values(filters).filter(v => v !== '').length

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-4">
      {/* Main Filter Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email or booking ID..."
            value={filters.search}
            onChange={(e) => handleChange('search', e.target.value)}
            disabled={loading}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none text-sm disabled:bg-gray-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* Status Filter */}
        <div className="relative min-w-45">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <select
            value={filters.status}
            onChange={(e) => handleChange('status', e.target.value)}
            disabled={loading}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none appearance-none bg-white text-sm disabled:bg-gray-50 disabled:cursor-not-allowed"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Toggle Date Filters */}
        <button
          onClick={() => setShowDateFilters(!showDateFilters)}
          disabled={loading}
          className={cn(
            'px-4 py-2.5 text-sm border rounded-lg transition flex items-center gap-2',
            showDateFilters
              ? 'bg-gray-900 text-white border-gray-900'
              : 'text-gray-600 hover:text-gray-900 border-gray-300 hover:bg-gray-50'
          )}
        >
          <CalendarIcon className="h-4 w-4" />
          {showDateFilters ? 'Hide Dates' : 'Add Dates'}
        </button>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            disabled={loading}
            className="flex items-center gap-1 px-4 py-2.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
          >
            <X className="h-4 w-4" />
            Clear ({activeFilterCount})
          </button>
        )}
      </div>

      {/* Date Filters (Collapsible) */}
      {showDateFilters && (
        <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-gray-100">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleChange('startDate', e.target.value)}
              disabled={loading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none text-sm disabled:bg-gray-50 disabled:cursor-not-allowed"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-500 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleChange('endDate', e.target.value)}
              disabled={loading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none text-sm disabled:bg-gray-50 disabled:cursor-not-allowed"
            />
          </div>
        </div>
      )}

      {/* Active Filters Tags */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
          {filters.search && (
            <span className="inline-flex items-center gap-1 px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
              Search: {filters.search}
              <button
                onClick={() => handleChange('search', '')}
                className="hover:text-gray-900"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {filters.status && (
            <span className="inline-flex items-center gap-1 px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
              Status: {statusOptions.find(s => s.value === filters.status)?.label}
              <button
                onClick={() => handleChange('status', '')}
                className="hover:text-gray-900"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {filters.startDate && (
            <span className="inline-flex items-center gap-1 px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
              From: {new Date(filters.startDate).toLocaleDateString()}
              <button
                onClick={() => handleChange('startDate', '')}
                className="hover:text-gray-900"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {filters.endDate && (
            <span className="inline-flex items-center gap-1 px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
              To: {new Date(filters.endDate).toLocaleDateString()}
              <button
                onClick={() => handleChange('endDate', '')}
                className="hover:text-gray-900"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  )
}