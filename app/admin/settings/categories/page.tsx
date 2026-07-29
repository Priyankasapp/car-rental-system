'use client'

import React from 'react'
import { FolderTreeIcon } from 'lucide-react'
import { EntityGridPage } from '@/components/settings/EntityGridPage'
import { EntityItem } from '@/components/settings/EntityCard'

export default function CategoriesPage() {
  const initialCategories: EntityItem[] = [
    {
      id: 1,
      name: 'SEDAN',
      description: 'Comfortable 4-door cars for daily commute',
      status: 'Active',
      color: 'bg-sky-400',
      circleBg: 'bg-sky-100',
      textColor: 'text-sky-700',
      borderColor: 'border-sky-200'
    },
    {
      id: 2,
      name: 'SUV',
      description: 'Spacious vehicles for family and adventure',
      status: 'Active',
      color: 'bg-emerald-400',
      circleBg: 'bg-emerald-100',
      textColor: 'text-emerald-700',
      borderColor: 'border-emerald-200'
    },
    {
      id: 3,
      name: 'LUXURY',
      description: 'Premium high-end vehicles with top features',
      status: 'Active',
      color: 'bg-purple-400',
      circleBg: 'bg-purple-100',
      textColor: 'text-purple-700',
      borderColor: 'border-purple-200'
    },
    {
      id: 4,
      name: 'SPORTS',
      description: 'High-performance cars for thrill seekers',
      status: 'Active',
      color: 'bg-rose-400',
      circleBg: 'bg-rose-100',
      textColor: 'text-rose-700',
      borderColor: 'border-rose-200'
    },
    {
      id: 5,
      name: 'VAN',
      description: 'Spacious vans for group travel and cargo',
      status: 'Inactive',
      color: 'bg-gray-300',
      circleBg: 'bg-gray-100',
      textColor: 'text-gray-600',
      borderColor: 'border-gray-200'
    },
    {
      id: 6,
      name: 'PICKUP',
      description: 'Utility vehicles for heavy load and towing',
      status: 'Active',
      color: 'bg-amber-400',
      circleBg: 'bg-amber-100',
      textColor: 'text-amber-700',
      borderColor: 'border-amber-200'
    }
  ]

  return (
    <EntityGridPage
      title="Categories"
      entitySingularName="Category"
      description="Manage vehicle categories used in UrbanDrive."
      icon={FolderTreeIcon}
      addButtonText="Add Category"
      initialItems={initialCategories}
      emptyStateTitle="No categories yet"
      emptyStateDescription="Create your first vehicle category to get started."
    />
  )
}