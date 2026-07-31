/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @next/next/no-img-element */
'use client'

import React, { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {  Trash2, Eye } from 'lucide-react'
import { DataExplorer, Column } from '@/components/admin/DataExplorer'

interface MasterItem {
  id: string
  name: string
}

interface CarItem {
  id: string
  manufacturer: string
  model: string
  year: number
  licensePlate: string
  pricePerDay: number
  securityDeposit: number
  imageMain?: string
  status: 'AVAILABLE' | 'RESERVED' | 'UNAVAILABLE' | 'MAINTENANCE'
  category?: MasterItem | null
}

export default function CarsPage() {
  const router = useRouter()
  const [cars, setCars] = useState<CarItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  const [search, setSearch] = useState<string>('')
  const [debouncedSearch, setDebouncedSearch] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL') // now holds categoryId
  const [categories, setCategories] = useState<MasterItem[]>([])

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(handler)
  }, [search])

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch('/api/admin/categories')
        const data = await res.json()
        if (data?.success && Array.isArray(data.data)) {
          setCategories(data.data)
        }
      } catch (err) {
        console.error('Failed to load categories:', err)
      }
    }
    loadCategories()
  }, [])

  const fetchCars = useCallback(async () => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams()

      if (debouncedSearch.trim()) queryParams.set('search', debouncedSearch.trim())
      if (statusFilter !== 'ALL') queryParams.set('status', statusFilter)
      if (categoryFilter !== 'ALL') queryParams.set('categoryId', categoryFilter)

      const res = await fetch(`/api/admin/cars?${queryParams.toString()}`)
      const result = await res.json()

      if (res.ok && result.success && Array.isArray(result.data)) {
        setCars(result.data)
      } else {
        setCars([])
      }
    } catch (error) {
      console.error('Error fetching cars:', error)
      setCars([])
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, statusFilter, categoryFilter])

  useEffect(() => {
    fetchCars()
  }, [fetchCars])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this vehicle?')) return

    const previousCars = cars
    setCars((prev) => prev.filter((c) => c.id !== id))

    try {
      const res = await fetch(`/api/admin/cars/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
    } catch (error) {
      alert('Could not delete vehicle. Rolling back.')
      setCars(previousCars)
    }
  }

  const renderStatusBadge = (status: CarItem['status']) => {
    switch (status) {
      case 'AVAILABLE':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            Available
          </span>
        )
      case 'RESERVED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
            Reserved
          </span>
        )
      case 'MAINTENANCE':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
            Maintenance
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200">
            Unavailable
          </span>
        )
    }
  }

  const getCategoryName = (category?: MasterItem | null) => category?.name || 'Standard'

  const columns: Column<CarItem>[] = [
    {
      header: 'Vehicle',
      accessor: (car) => (
        <div className="flex items-center gap-3">
          <img
            src={car.imageMain || '/placeholder.png'}
            alt="image of the car"
            className="w-10 h-10 rounded-md object-cover border bg-gray-50"
          />
          <div>
            <div className="font-medium text-gray-900">
              {car.manufacturer} {car.model}
            </div>
            <div className="text-xs text-gray-400">{car.year}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Plate',
      accessor: (car) => (
        <span className="font-mono text-xs text-gray-700">{car.licensePlate || 'N/A'}</span>
      ),
    },
    { header: 'Category', accessor: (car) => getCategoryName(car.category) },
    { header: 'Status', accessor: (car) => renderStatusBadge(car.status) },
    {
      header: 'Rate / Day',
      accessor: (car) => (
        <span className="font-medium text-gray-900">
          ₹{car.pricePerDay?.toLocaleString() ?? 0}
        </span>
      ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      accessor: (car) => (
        <div className="inline-flex items-center gap-2 text-gray-400 justify-end w-full">
          <button
            onClick={() => router.push(`/admin/cars/${car.id}`)}
            className="hover:text-black p-1"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => handleDelete(car.id)}
            className="hover:text-red-600 p-1"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <DataExplorer<CarItem>
      title="Vehicles"
      subtitle="Overview of all active fleet vehicles."
      data={cars}
      loading={loading}
      keyExtractor={(car) => car.id}
      searchQuery={search}
      onSearchChange={setSearch}
      searchPlaceholder="Filter by make, model, plate..."
      addLabel="Add Vehicle"
      onAdd={() => router.push('/admin/cars/new')}
      onRefresh={fetchCars}
      filters={[
        {
          key: 'status',
          label: 'All Statuses',
          value: statusFilter,
          onChange: setStatusFilter,
          options: [
            { label: 'Available', value: 'AVAILABLE' },
            { label: 'Reserved', value: 'RESERVED' },
            { label: 'Maintenance', value: 'MAINTENANCE' },
            { label: 'Unavailable', value: 'UNAVAILABLE' },
          ],
        },
        {
          key: 'category',
          label: 'All Categories',
          value: categoryFilter,
          onChange: setCategoryFilter,
          options: categories.map((c) => ({ label: c.name, value: c.id })),
        },
      ]}
      columns={columns}
      renderGridCard={(car) => (
        <div className="border rounded-xl bg-white overflow-hidden shadow-sm hover:shadow transition flex flex-col justify-between">
          <div className="relative h-36 w-full bg-gray-100">
            <img
              src={car.imageMain || '/placeholder.png'}
              alt={`${car.manufacturer} ${car.model}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2.5 left-2.5">{renderStatusBadge(car.status)}</div>
          </div>

          <div className="p-3 flex-1 flex flex-col justify-between space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-medium text-gray-900 text-sm leading-snug">
                  {car.manufacturer} {car.model}
                </h3>
                <p className="text-xs text-gray-400 font-mono mt-0.5">
                  {car.licensePlate || 'N/A'} • {car.year}
                </p>
              </div>
              <div className="text-right whitespace-nowrap">
                <span className="text-sm font-bold text-gray-900">
                  ₹{car.pricePerDay?.toLocaleString() ?? 0}
                </span>
                <span className="text-[10px] text-gray-400 block">/day</span>
              </div>
            </div>

            <div className="pt-2 border-t flex items-center justify-between text-xs text-gray-400">
              <span className="text-[11px] text-gray-500">{getCategoryName(car.category)}</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => router.push(`/admin/cars/${car.id}`)}
                  className="p-1 hover:text-black rounded"
                  title="View"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
               
                <button
                  onClick={() => handleDelete(car.id)}
                  className="p-1 hover:text-red-600 rounded"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    />
  )
}