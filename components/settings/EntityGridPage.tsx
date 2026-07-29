/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import React, { useState, useEffect } from 'react'
import { PlusIcon, LucideIcon } from 'lucide-react'
import { EntityCard, EntityItem } from './EntityCard'
import { EntityModal } from './EntityModal'

interface EntityGridPageProps {
  title: string
  entitySingularName: string // e.g., "Category", "Fuel Type", "Transmission"
  description: string
  icon?: LucideIcon
  addButtonText: string
  initialItems: EntityItem[]
  emptyStateTitle?: string
  emptyStateDescription?: string
  onSave?: (item: Partial<EntityItem>) => Promise<void>
  onDelete?: (id: string) => Promise<void>
}

export const EntityGridPage: React.FC<EntityGridPageProps> = ({
  title,
  entitySingularName,
  description,
  icon: Icon,
  addButtonText,
  initialItems,
  emptyStateTitle = 'No items found',
  emptyStateDescription = 'Create your first entry to get started.',
  onSave,
  onDelete,
}) => {
  const [items, setItems] = useState<EntityItem[]>(initialItems)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<EntityItem | null>(null)

  // Keep state in sync with fetched items from API
  useEffect(() => {
    setItems(initialItems)
  }, [initialItems])

  // Open Modal for Creating New Entry
  const handleOpenAdd = () => {
    setEditingItem(null)
    setIsModalOpen(true)
  }

  // Open Modal for Editing Existing Entry
  const handleOpenEdit = (item: EntityItem) => {
    setEditingItem(item)
    setIsModalOpen(true)
  }

  // Handle Deletion (Async API call support)
  const handleDelete = async (id: string) => {
    if (confirm(`Are you sure you want to delete this ${entitySingularName.toLowerCase()}?`)) {
      if (onDelete) {
        await onDelete(id)
      } else {
        setItems(prev => prev.filter(item => String(item.id) !== id))
      }
    }
  }

  // Handle Save (Add or Update via API)
  const handleSave = async (savedData: Omit<EntityItem, 'id'> & { id?: string }) => {
    if (onSave) {
      await onSave(savedData)
    } else {
      // Fallback local update if no onSave prop provided
      if (savedData.id) {
        setItems(prevItems =>
          prevItems.map(item => (item.id === savedData.id ? (savedData as EntityItem) : item))
        )
      } else {
        const newItem: EntityItem = {
          ...(savedData as EntityItem),
          id: String(Date.now()),
        }
        setItems(prevItems => [newItem, ...prevItems])
      }
    }
    setIsModalOpen(false)
  }

  const activeCount = items.filter(item => item.status === 'Active').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5">
          {Icon && <Icon className="h-7 w-7 text-gray-800" />}
          {title}
        </h1>
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs">
          <p className="text-sm font-medium text-gray-500">Total {title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{items.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs">
          <p className="text-sm font-medium text-gray-500">Active Options</p>
          <p className="text-3xl font-bold text-emerald-600 mt-1">{activeCount}</p>
        </div>
      </div>

      {/* Content Container */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Manage {title}</h2>
            <p className="mt-1 text-sm text-gray-500">Add, edit, or remove available options.</p>
          </div>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="rounded-md bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-gray-800 hover:shadow-md flex items-center gap-2 active:scale-95 cursor-pointer"
          >
            <PlusIcon className="h-4 w-4" />
            {addButtonText}
          </button>
        </div>

        {/* Entity Card Grid */}
        {items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {items.map(item => (
              <EntityCard
                key={item.id}
                item={item}
                onEdit={handleOpenEdit}
                onDelete={(id) => handleDelete(String(id))}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="rounded-xl border border-dashed border-gray-300 py-16 text-center bg-gray-50/50">
            <h3 className="text-base font-semibold text-gray-900">{emptyStateTitle}</h3>
            <p className="mt-1 text-sm text-gray-500">{emptyStateDescription}</p>
          </div>
        )}
      </div>

      {/* Reusable Add / Edit Modal */}
      <EntityModal
        isOpen={isModalOpen}
        entityName={entitySingularName}
        initialData={editingItem}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  )
}