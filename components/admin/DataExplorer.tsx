/* eslint-disable @next/next/no-img-element */
'use client'

import React, { useState } from 'react'
import {
  Search,
  RefreshCw,
  LayoutGrid,
  List as ListIcon,
  Plus,
} from 'lucide-react'

export interface FilterOption {
  key: string
  label: string
  options: { label: string; value: string }[]
  value: string
  onChange: (value: string) => void
}

export interface Column<T> {
  header: string
  accessor: (item: T) => React.ReactNode
  className?: string
}

interface DataExplorerProps<T> {
  title: string
  subtitle?: string
  data: T[]
  loading?: boolean
  searchPlaceholder?: string
  searchQuery?: string
  onSearchChange?: (query: string) => void
  filters?: FilterOption[]
  onRefresh?: () => void
  onAdd?: () => void
  addLabel?: string
  columns: Column<T>[]
  renderGridCard: (item: T) => React.ReactNode
  keyExtractor: (item: T) => string
}

export function DataExplorer<T>({
  title,
  subtitle,
  data,
  loading = false,
  searchPlaceholder = 'Search...',
  searchQuery = '',
  onSearchChange,
  filters = [],
  onRefresh,
  onAdd,
  addLabel = 'Add New',
  columns,
  renderGridCard,
  keyExtractor,
}: DataExplorerProps<T>) {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid')

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-5">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
          )}
        </div>
        {onAdd && (
          <button
            onClick={onAdd}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition"
          >
            <Plus className="w-4 h-4" />
            {addLabel}
          </button>
        )}
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
        {/* Search */}
        {onSearchChange && (
          <div className="relative w-full sm:w-80">
            <div className="relative w-full sm:w-80">
  <label htmlFor="data-explorer-search" className="sr-only">
    Search {title}
  </label>

  <Search
    className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
    aria-hidden="true"
  />

  <input
    id="data-explorer-search"
    type="text"
    placeholder={searchPlaceholder}
    value={searchQuery}
    onChange={(e) => onSearchChange(e.target.value)}
    className="w-full pl-9 pr-3 py-1.5 text-sm border rounded-lg outline-none focus:border-black bg-white"
  />
</div>
          </div>
        )}

        {/* Filters & View Toggles */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {filters.map((filter) => (
            <select
              key={filter.key}
              value={filter.value}
              onChange={(e) => filter.onChange(e.target.value)}
              className="text-sm border rounded-lg px-3 py-1.5 outline-none bg-white text-gray-700"
            >
              <option value="ALL">{filter.label}</option>
              {filter.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ))}

          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-2 border rounded-lg hover:bg-gray-50 text-gray-600 bg-white"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}

          <div className="flex items-center border rounded-lg overflow-hidden bg-white ml-2 p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded ${
                viewMode === 'grid'
                  ? 'bg-gray-100 text-black font-semibold'
                  : 'text-gray-400 hover:text-gray-700'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded ${
                viewMode === 'list'
                  ? 'bg-gray-100 text-black font-semibold'
                  : 'text-gray-400 hover:text-gray-700'
              }`}
              title="List View"
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="text-center py-16 text-gray-400 text-sm border rounded-xl bg-white">
          Loading items...
        </div>
      ) : data.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm border rounded-xl bg-white">
          No records found.
        </div>
      ) : viewMode === 'list' ? (
        /* Table View */
        <div className="border rounded-xl overflow-hidden bg-white shadow-sm">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 border-b text-xs font-medium text-gray-500 uppercase tracking-wider">
              <tr>
                {columns.map((col, idx) => (
                  <th key={idx} className={`py-3 px-4 ${col.className || ''}`}>
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.map((item) => (
                <tr key={keyExtractor(item)} className="hover:bg-gray-50/50 transition">
                  {columns.map((col, idx) => (
                    <td key={idx} className={`py-3 px-4 ${col.className || ''}`}>
                      {col.accessor(item)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Minimal Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {data.map((item) => (
            <React.Fragment key={keyExtractor(item)}>
              {renderGridCard(item)}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  )
}