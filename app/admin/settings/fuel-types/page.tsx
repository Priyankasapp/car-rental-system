'use client'

import React from 'react'
import { FuelIcon } from 'lucide-react'
import { EntityGridPage } from '@/components/settings/EntityGridPage'
import { EntityItem } from '@/components/settings/EntityCard'

export default function FuelTypesPage() {
  const initialFuelTypes: EntityItem[] = [
    {
      id: 1,
      name: 'PETROL',
      description: 'Standard gasoline engines offering high performance and flexibility.',
      status: 'Active',
      color: 'bg-emerald-400',
      circleBg: 'bg-emerald-100',
      textColor: 'text-emerald-700',
      borderColor: 'border-emerald-200'
    },
    {
      id: 2,
      name: 'DIESEL',
      description: 'High torque and efficient engines ideal for long-distance driving.',
      status: 'Active',
      color: 'bg-amber-400',
      circleBg: 'bg-amber-100',
      textColor: 'text-amber-700',
      borderColor: 'border-amber-200'
    },
    {
      id: 3,
      name: 'ELECTRIC',
      description: 'Zero-emission battery electric vehicles (BEVs) with instant torque.',
      status: 'Active',
      color: 'bg-sky-400',
      circleBg: 'bg-sky-100',
      textColor: 'text-sky-700',
      borderColor: 'border-sky-200'
    },
    {
      id: 4,
      name: 'HYBRID',
      description: 'Combines a gas engine with an electric motor for maximum efficiency.',
      status: 'Active',
      color: 'bg-teal-400',
      circleBg: 'bg-teal-100',
      textColor: 'text-teal-700',
      borderColor: 'border-teal-200'
    },
    {
      id: 5,
      name: 'PLUG-IN HYBRID',
      description: 'PHEV models with larger batteries rechargeable via external outlets.',
      status: 'Active',
      color: 'bg-indigo-400',
      circleBg: 'bg-indigo-100',
      textColor: 'text-indigo-700',
      borderColor: 'border-indigo-200'
    },
    {
      id: 6,
      name: 'LPG / CNG',
      description: 'Compressed or Liquefied gas alternatives for lower emissions.',
      status: 'Inactive',
      color: 'bg-gray-300',
      circleBg: 'bg-gray-100',
      textColor: 'text-gray-600',
      borderColor: 'border-gray-200'
    }
  ]

  return (
    <EntityGridPage
      title="Fuel Types"
      entitySingularName="Fuel Type"
      description="Manage engine fuel configurations supported in UrbanDrive."
      icon={FuelIcon}
      addButtonText="Add Fuel Type"
      initialItems={initialFuelTypes}
      emptyStateTitle="No fuel types found"
      emptyStateDescription="Create your first fuel option to get started."
    />
  )
}