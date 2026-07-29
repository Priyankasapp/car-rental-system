'use client'

import React from 'react'
import { PencilIcon, TrashIcon } from 'lucide-react'

export interface EntityItem {
  id: number
  name: string
  description: string
  status: 'Active' | 'Inactive' | string
  color: string        // e.g. 'bg-sky-400'
  circleBg: string     // e.g. 'bg-sky-100'
  textColor: string    // e.g. 'text-sky-700'
  borderColor: string  // e.g. 'border-sky-200'
}

interface EntityCardProps {
  item: EntityItem
  onEdit: (item: EntityItem) => void
  onDelete: (id: number) => void
}

export const EntityCard: React.FC<EntityCardProps> = ({ item, onEdit, onDelete }) => {
  const avatarText = item.name.substring(0, 2).toUpperCase()

  return (
    <div className="group relative rounded-xl border border-gray-200 bg-white p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between overflow-hidden">
      {/* 1/4 Decorative Circle in Top-Right Corner */}
      <div 
        className={`absolute -top-12 -right-12 w-32 h-32 rounded-full ${item.color} opacity-20 blur-xs pointer-events-none transition-transform duration-500 group-hover:scale-125`} 
      />

      <div className="relative z-10">
        {/* Top Bar: Left Avatar + Right Status Badge */}
        <div className="flex items-center justify-between">
          <div className={`w-12 h-12 rounded-full ${item.circleBg} ${item.textColor} border ${item.borderColor} flex items-center justify-center text-base font-extrabold shadow-xs tracking-wider transition-transform duration-300 group-hover:scale-105`}>
            {avatarText}
          </div>

          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
            item.status === 'Active' 
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' 
              : 'bg-gray-100 text-gray-500 border border-gray-200/60'
          }`}>
            <span className={`h-1.5 w-1.5 rounded-full ${
              item.status === 'Active' ? 'bg-emerald-500' : 'bg-gray-400'
            }`} />
            {item.status}
          </span>
        </div>

        {/* Title */}
        <div className="mt-5">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2.5">
            {item.name}
            <span className={`h-2 w-2 rounded-full ${item.color}`} />
          </h3>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 mt-2 line-clamp-2 min-h-10 leading-relaxed">
          {item.description}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="relative z-10 mt-6 flex items-center justify-end gap-2.5 pt-4 border-t border-gray-100">
        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 min-w-24 px-5 py-2 text-xs font-semibold text-gray-900 bg-white border border-gray-300 hover:bg-gray-900 hover:text-white hover:border-gray-900 rounded-md transition-all duration-200 shadow-xs active:scale-95 cursor-pointer"
          onClick={() => onEdit(item)}
        >
          <PencilIcon className="h-3.5 w-3.5" />
          Edit
        </button>

        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 min-w-24 px-5 py-2 text-xs font-semibold text-white bg-gray-900 hover:bg-red-600 rounded-md transition-all duration-200 shadow-xs active:scale-95 cursor-pointer"
          onClick={() => onDelete(item.id)}
        >
          <TrashIcon className="h-3.5 w-3.5" />
          Delete
        </button>
      </div>
    </div>
  )
}