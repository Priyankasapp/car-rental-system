/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { EntityItem } from '@/components/settings/EntityCard'
import { EntityGridPage } from '@/components/settings/EntityGridPage'
import { EntityGridSkeleton } from '@/components/settings/EntityGridSkeleton'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

//Permission helper funciton
function hasPermission(user: any, permission: string): boolean {
  if (!user) return false;
  const role = user.role?.toUpperCase();
  if (role === 'SUPERADMIN' || role === 'SUPER_ADMIN') return true;
  const permissions = user.permissions || [];
  return permissions.includes(permission); 
}



const page = () => {
  const router = useRouter()
  const [items, setItems] = useState<EntityItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [userLoading, setUserLoading] = useState<boolean>(true)
  const [hasAccess, setHasAccess] = useState<boolean>(false)

  //Load current user
    useEffect(() => {
        async function loadUser() {
          try {
            const res = await fetch('/api/auth/me')
            const data = await res.json()
            if (data.success) {
              setUser(data.data.user)
            }
          } catch (error) {
            console.error('Failed to load user:', error)
          } finally {
            setUserLoading(false)
          }
        }
        loadUser()
      }, [])
    
      //  Permission check
        useEffect(() => {
          if (!userLoading && user) {
            const canView = hasPermission(user, 'services:view')
            
            if (!canView) {
              router.push('/admin')
              return
            }
            
            setHasAccess(true)
            fetchServices()
          }
        }, [user, userLoading])

    // Fetch Services from backend API
    const fetchServices = useCallback(async () => {
      try{
        setLoading(true)
        setError(null)

        const res = await fetch('/api/admin/services')
        const json = await res.json()

        if(!res.ok){
          throw new Error(json.message || 'Failed to fetch services')
        }
        setItems(json.data)

      }catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
    }, [])
  
    //Handle save item
    const handleSaveItem = async (itemData: Partial<EntityItem>) => {
        //  Permission check for create/edit
        if (!hasPermission(user, 'services:create')) {
          throw new Error('You do not have permission to create/edit service types')
        }
        
        const isEdit = Boolean(itemData.id)
        const url = isEdit
          ? `/api/admin/services/${itemData.id}`
          : '/api/admin/services'
        const method = isEdit ? 'PUT' : 'POST'
    
        const res = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(itemData),
        })
    
        const json = await res.json()
    
        if (!res.ok) {
          throw new Error(json.message || `Failed to ${isEdit ? 'update' : 'create'} fuel type`)
        }
    
        await fetchServices()
      }

      // Handle Delete
      const handleDeleteItem = async (id: string | number) => {
    //  Permission check for delete
    if (!hasPermission(user, 'services:delete')) {
      throw new Error('You do not have permission to delete service types')
    }
    
    const res = await fetch(`/api/admin/services/${id}`, {
      method: 'DELETE',
    })

    const json = await res.json()

    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to delete fuel type')
    }

    await fetchServices()
  }
    

  //  Loading state
  if (userLoading || loading) {
    return (
      <EntityGridSkeleton
        title="Fuel Types"
        description="Manage engine fuel configurations supported in UrbanDrive."
        cardCount={6}
      />
    )
  }

  //  Access denied state
  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="text-center">
          <div className="text-4xl mb-4">🔒</div>
          <h2 className="text-lg font-semibold text-gray-900">Access Denied</h2>
          <p className="mt-1 text-sm text-gray-500">
            You do not have permission to view fuel types.
          </p>
        </div>
      </div>
    )
  }

    if (error) {
    return (
      <div className="p-6 rounded-xl bg-red-50 text-red-600 border border-red-200 text-center my-8">
        <p className="font-semibold">Failed to load Fuel Types</p>
        <p className="text-sm mt-1">{error}</p>
        <button
          onClick={fetchServices}
          className="mt-4 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div>
     <EntityGridPage
      title="Services"
      entitySingularName="Service"
      description="Manage contact servie configurations supported in UrbanDrive."
      addButtonText="Add Service"
      initialItems={items}
      onSave={handleSaveItem}
      onDelete={handleDeleteItem}
      emptyStateTitle="No service found"
      emptyStateDescription="Create your first service option to get started."
    />

     
      
    </div>
  )
}

export default page

