'use client'

import { useState } from 'react'
import { PlusIcon, LucideIcon } from 'lucide-react'
import { EntityCard, EntityItem } from './EntityCard'
import { EntityModal } from './EntityModal'

interface EntityGridPageProps {
  title: string
  entitySingularName: string
  description: string
  icon?: LucideIcon
  addButtonText?: string
  initialItems: EntityItem[]
  emptyStateTitle?: string
  emptyStateDescription?: string
  onSave?: (data: Partial<EntityItem>) => Promise<void>
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
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<EntityItem | null>(null)

  // ── Open modal for new entry ─────────────────────────────
  const handleOpenAdd = () => {
    setEditingItem(null)        
    setIsModalOpen(true)
  }

  // ── Open modal for editing ───────────────────────────────
  const handleOpenEdit = (item: EntityItem) => {
    setEditingItem(item)       
    setIsModalOpen(true)
  }

  // ── Delete ───────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    if (confirm(`Are you sure you want to delete this ${entitySingularName.toLowerCase()}?`)) {
      if (onDelete) {
        await onDelete(id)
      }
    }
  }

  // ── Save (Create or Update) ──────────────────────────────
  const handleSave = async (savedData: Omit<EntityItem, 'id'> & { id?: string }) => {
    if (onSave) {
      await onSave(savedData)
    }
    setIsModalOpen(false)
    setEditingItem(null)       
  }

  // ── Active count ─────────────────────────────────────────
  const activeCount = initialItems.filter(
    item => item.isActive || item.status === 'Active'
  ).length

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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs">
          <p className="text-sm font-medium text-gray-500">Total {title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{initialItems.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs">
          <p className="text-sm font-medium text-gray-500">Active Options</p>
          <p className="text-3xl font-bold text-emerald-600 mt-1">{activeCount}</p>
        </div>
      </div>

      {/* Content */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Manage {title}</h2>
            <p className="mt-1 text-sm text-gray-500">Add, edit, or remove available options.</p>
          </div>

          {/*   calls handleOpenAdd */}
          {addButtonText && onSave && (
            <button
              type="button"
              onClick={handleOpenAdd}
              className="rounded-md bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-gray-800 hover:shadow-md flex items-center gap-2 active:scale-95 cursor-pointer"
            >
              <PlusIcon className="h-4 w-4" />
              {addButtonText}
            </button>
          )}
        </div>

        {/* Grid */}
        {initialItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {initialItems.map(item => (
              <EntityCard
                key={item.id}
                item={item}
                // Fixed — calls handleOpenEdit with item
                onEdit={onSave ? handleOpenEdit : undefined}
                // Fixed — calls handleDelete with id
                onDelete={onDelete ? (id) => handleDelete(String(id)) : undefined}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-gray-300 py-16 text-center bg-gray-50/50">
            <h3 className="text-base font-semibold text-gray-900">{emptyStateTitle}</h3>
            <p className="mt-1 text-sm text-gray-500">{emptyStateDescription}</p>
            {/* Empty state Add button */}
            {addButtonText && onSave && (
              <button
                type="button"
                onClick={handleOpenAdd}
                className="mt-4 inline-flex items-center gap-2 rounded-md bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 transition-all active:scale-95"
              >
                <PlusIcon className="h-4 w-4" />
                {addButtonText}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modal — only mount if onSave exists */}
      {onSave && (
        <EntityModal
          isOpen={isModalOpen}
          entityName={entitySingularName}
          initialData={editingItem}
          onClose={() => {
            setIsModalOpen(false)
            setEditingItem(null) 
          }}
          onSave={handleSave}
        />
      )}
    </div>
  )
}