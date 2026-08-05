/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @next/next/no-img-element */

'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Eye, Pencil } from 'lucide-react'

import { DataExplorer, Column } from '@/components/admin/DataExplorer'
import { PERMISSIONS } from '@/lib/permissions'


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

interface CurrentUser {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
  permissions: string[]
  isEmailVerified: boolean
  createdAt: string
}

export default function CarsPage() {
  const router = useRouter()

  const [cars, setCars] = useState<CarItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  const [search, setSearch] = useState<string>('')
  const [debouncedSearch, setDebouncedSearch] = useState<string>('')

  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL')

  const [categories, setCategories] = useState<MasterItem[]>([])

  const [user, setUser] = useState<CurrentUser | null>(null)
  const [authLoading, setAuthLoading] = useState(true)

  // GET CURRENT USER

  useEffect(() => {
    async function loadCurrentUser() {
      try {
        setAuthLoading(true)

        const res = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store',
        })

        const result = await res.json()

        if (!res.ok || !result.success || !result.data?.user) {
          setUser(null)
          return
        }

        setUser(result.data.user)
      } catch (error) {
        console.error('Failed to load current user:', error)
        setUser(null)
      } finally {
        setAuthLoading(false)
      }
    }

    loadCurrentUser()
  }, [])

  // PERMISSION HELPER

  const hasPermission = useCallback(
    (permission: string) => {
      if (!user) return false

      const role = user.role?.toUpperCase()

  
      if (
        role === 'SUPERADMIN' ||
        role === 'SUPER_ADMIN'
      ) {
        return true
      }

      const permissions = user.permissions

      if (!Array.isArray(permissions)) {
        return false
      }

      const domain = permission.split(':')[0]
      const wildcard = `${domain}:*`

      return (
        permissions.includes('*') ||
        permissions.includes(wildcard) ||
        permissions.includes(permission)
      )
    },
    [user]
  )

  // CAR PERMISSIONS
 

  const canViewCars = hasPermission(
    PERMISSIONS.CARS_VIEW
  )

  const canCreateCars = hasPermission(
    PERMISSIONS.CARS_CREATE
  )

  const canEditCars = hasPermission(
    PERMISSIONS.CARS_EDIT
  )

  const canDeleteCars = hasPermission(
    PERMISSIONS.CARS_DELETE
  )


  // SEARCH DEBOUNCE


  useEffect(() => {
    const handler = setTimeout(
      () => setDebouncedSearch(search),
      300
    )

    return () => clearTimeout(handler)
  }, [search])


  // LOAD CATEGORIES


  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch(
          '/api/admin/categories'
        )

        const data = await res.json()

        if (
          data?.success &&
          Array.isArray(data.data)
        ) {
          setCategories(data.data)
        }
      } catch (err) {
        console.error(
          'Failed to load categories:',
          err
        )
      }
    }

    // Only load categories after auth
    if (!authLoading && canViewCars) {
      loadCategories()
    }
  }, [authLoading, canViewCars])

 
  // FETCH CARS
 

  const fetchCars = useCallback(async () => {
    // Don't fetch until permissions are known
    if (authLoading) return

    // User doesn't have cars:view
    if (!canViewCars) {
      setCars([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)

      const queryParams = new URLSearchParams()

      if (debouncedSearch.trim()) {
        queryParams.set(
          'search',
          debouncedSearch.trim()
        )
      }

      if (statusFilter !== 'ALL') {
        queryParams.set(
          'status',
          statusFilter
        )
      }

      if (categoryFilter !== 'ALL') {
        queryParams.set(
          'categoryId',
          categoryFilter
        )
      }

      const res = await fetch(
        `/api/admin/cars?${queryParams.toString()}`,
        {
          credentials: 'include',
          cache: 'no-store',
        }
      )

      const result = await res.json()

      if (
        res.ok &&
        result.success &&
        Array.isArray(result.data)
      ) {
        setCars(result.data)
      } else {
        setCars([])
      }
    } catch (error) {
      console.error(
        'Error fetching cars:',
        error
      )

      setCars([])
    } finally {
      setLoading(false)
    }
  }, [
    authLoading,
    canViewCars,
    debouncedSearch,
    statusFilter,
    categoryFilter,
  ])

  useEffect(() => {
    fetchCars()
  }, [fetchCars])

  // DELETE CAR
 

  const handleDelete = async (id: string) => {
    // Frontend protection
    if (!canDeleteCars) {
      alert(
        'You do not have permission to delete vehicles.'
      )
      return
    }

    if (
      !confirm(
        'Are you sure you want to delete this vehicle?'
      )
    ) {
      return
    }

    const previousCars = cars

    setCars((prev) =>
      prev.filter((c) => c.id !== id)
    )

    try {
      const res = await fetch(
        `/api/admin/cars/${id}`,
        {
          method: 'DELETE',
          credentials: 'include',
        }
      )

      if (!res.ok) {
        throw new Error('Failed to delete')
      }
    } catch (error) {
      console.error(error)

      alert(
        'Could not delete vehicle. Rolling back.'
      )

      setCars(previousCars)
    }
  }


  // STATUS BADGE


  const renderStatusBadge = (
    status: CarItem['status']
  ) => {
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


  // CATEGORY


  const getCategoryName = (
    category?: MasterItem | null
  ) => {
    return category?.name || 'Standard'
  }


  // COLUMNS


  const columns: Column<CarItem>[] = [
    {
      header: 'Vehicle',

      accessor: (car) => (
        <div className="flex items-center gap-3">
          <img
            src={
              car.imageMain ||
              '/placeholder.png'
            }
            alt="image of the car"
            className="w-10 h-10 rounded-md object-cover border bg-gray-50"
          />

          <div>
            <div className="font-medium text-gray-900">
              {car.manufacturer} {car.model}
            </div>

            <div className="text-xs text-gray-400">
              {car.year}
            </div>
          </div>
        </div>
      ),
    },

    {
      header: 'Plate',

      accessor: (car) => (
        <span className="font-mono text-xs text-gray-700">
          {car.licensePlate || 'N/A'}
        </span>
      ),
    },

    {
      header: 'Category',
      accessor: (car) =>
        getCategoryName(car.category),
    },

    {
      header: 'Status',
      accessor: (car) =>
        renderStatusBadge(car.status),
    },

    {
      header: 'Rate / Day',

      accessor: (car) => (
        <span className="font-medium text-gray-900">
          ₹
          {car.pricePerDay?.toLocaleString() ??
            0}
        </span>
      ),
    },


    // ACTIONS


    {
      header: 'Actions',
      className: 'text-right',

      accessor: (car) => (
        <div className="inline-flex items-center gap-2 text-gray-400 justify-end w-full">

          {/* VIEW */}

          {canViewCars && (
            <button
              onClick={() =>
                router.push(
                  `/admin/cars/${car.id}`
                )
              }
              className="hover:text-black p-1"
              title="View Details"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}

          {/* EDIT */}

          {canEditCars && (
            <button
              onClick={() =>
                router.push(
                  `/admin/cars/${car.id}/edit`
                )
              }
              className="hover:text-blue-600 p-1"
              title="Edit Vehicle"
            >
              <Pencil className="w-4 h-4" />
            </button>
          )}

          {/* DELETE */}

          {canDeleteCars && (
            <button
              onClick={() =>
                handleDelete(car.id)
              }
              className="hover:text-red-600 p-1"
              title="Delete Vehicle"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

        </div>
      ),
    },
  ]


  // LOADING AUTH


  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-sm text-gray-500">
          Loading permissions...
        </div>
      </div>
    )
  }

  // NO CAR PERMISSION


  if (!canViewCars) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-900">
            Access Denied
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            You do not have permission to view vehicles.
          </p>
        </div>
      </div>
    )
  }


  // PAGE


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

      // Add vihical 

      addLabel={
        canCreateCars
          ? 'Add Vehicle'
          : undefined
      }

      onAdd={
        canCreateCars
          ? () =>
              router.push(
                '/admin/cars/new'
              )
          : undefined
      }

      onRefresh={fetchCars}

      filters={[
        {
          key: 'status',
          label: 'All Statuses',
          value: statusFilter,
          onChange: setStatusFilter,

          options: [
            {
              label: 'Available',
              value: 'AVAILABLE',
            },
            {
              label: 'Reserved',
              value: 'RESERVED',
            },
            {
              label: 'Maintenance',
              value: 'MAINTENANCE',
            },
            {
              label: 'Unavailable',
              value: 'UNAVAILABLE',
            },
          ],
        },

        {
          key: 'category',
          label: 'All Categories',
          value: categoryFilter,
          onChange: setCategoryFilter,

          options: categories.map(
            (c) => ({
              label: c.name,
              value: c.id,
            })
          ),
        },
      ]}

      columns={columns}

      // GRID CARD


      renderGridCard={(car) => (
        <div className="border rounded-xl bg-white overflow-hidden shadow-sm hover:shadow transition flex flex-col justify-between">

          <div className="relative h-36 w-full bg-gray-100">

            <img
              src={
                car.imageMain ||
                '/placeholder.png'
              }
              alt={`${car.manufacturer} ${car.model}`}
              className="w-full h-full object-cover"
            />

            <div className="absolute top-2.5 left-2.5">
              {renderStatusBadge(
                car.status
              )}
            </div>

          </div>

          <div className="p-3 flex-1 flex flex-col justify-between space-y-3">

            <div className="flex items-start justify-between gap-2">

              <div>
                <h3 className="font-medium text-gray-900 text-sm leading-snug">
                  {car.manufacturer}{' '}
                  {car.model}
                </h3>

                <p className="text-xs text-gray-400 font-mono mt-0.5">
                  {car.licensePlate ||
                    'N/A'}{' '}
                  • {car.year}
                </p>
              </div>

              <div className="text-right whitespace-nowrap">

                <span className="text-sm font-bold text-gray-900">
                  ₹
                  {car.pricePerDay?.toLocaleString() ??
                    0}
                </span>

                <span className="text-[10px] text-gray-400 block">
                  /day
                </span>

              </div>

            </div>

            <div className="pt-2 border-t flex items-center justify-between text-xs text-gray-400">

              <span className="text-[11px] text-gray-500">
                {getCategoryName(
                  car.category
                )}
              </span>

              <div className="flex items-center gap-1">

                {/* VIEW */}

                {canViewCars && (
                  <button
                    onClick={() =>
                      router.push(
                        `/admin/cars/${car.id}`
                      )
                    }
                    className="p-1 hover:text-black rounded"
                    title="View"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* EDIT */}

                {canEditCars && (
                  <button
                    onClick={() =>
                      router.push(
                        `/admin/cars/${car.id}/edit`
                      )
                    }
                    className="p-1 hover:text-blue-600 rounded"
                    title="Edit"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* DELETE */}

                {canDeleteCars && (
                  <button
                    onClick={() =>
                      handleDelete(car.id)
                    }
                    className="p-1 hover:text-red-600 rounded"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}

              </div>

            </div>
          </div>
        </div>
      )}
    />
  )
}