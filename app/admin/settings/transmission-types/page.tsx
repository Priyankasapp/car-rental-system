'use client'

import React from 'react'
import { Settings2Icon } from 'lucide-react'
import { EntityGridPage } from '@/components/settings/EntityGridPage'
import { EntityItem } from '@/components/settings/EntityCard'

export default function TransmissionTypesPage() {
  const initialTransmissions: EntityItem[] = [
    {
      id: 1,
      name: 'AUTOMATIC',
      description: 'Standard torque converter automatic for seamless gear shifts.',
      status: 'Active',
      color: 'bg-indigo-400',
      circleBg: 'bg-indigo-100',
      textColor: 'text-indigo-700',
      borderColor: 'border-indigo-200'
    },
    {
      id: 2,
      name: 'MANUAL',
      description: 'Traditional stick-shift offering direct driver engagement.',
      status: 'Active',
      color: 'bg-amber-400',
      circleBg: 'bg-amber-100',
      textColor: 'text-amber-700',
      borderColor: 'border-amber-200'
    },
    {
      id: 3,
      name: 'CVT',
      description: 'Continuously Variable Transmission for optimal fuel economy.',
      status: 'Active',
      color: 'bg-sky-400',
      circleBg: 'bg-sky-100',
      textColor: 'text-sky-700',
      borderColor: 'border-sky-200'
    },
    {
      id: 4,
      name: 'DUAL-CLUTCH (DCT)',
      description: 'Ultra-fast gear switching using dual clutches.',
      status: 'Active',
      color: 'bg-rose-400',
      circleBg: 'bg-rose-100',
      textColor: 'text-rose-700',
      borderColor: 'border-rose-200'
    },
    {
      id: 5,
      name: 'SINGLE-SPEED (EV)',
      description: 'Direct drive transmission dedicated to electric vehicles.',
      status: 'Active',
      color: 'bg-emerald-400',
      circleBg: 'bg-emerald-100',
      textColor: 'text-emerald-700',
      borderColor: 'border-emerald-200'
    },
    {
      id: 6,
      name: 'SEMI-AUTOMATIC',
      description: 'Automated manual system without a physical clutch pedal.',
      status: 'Inactive',
      color: 'bg-gray-300',
      circleBg: 'bg-gray-100',
      textColor: 'text-gray-600',
      borderColor: 'border-gray-200'
    }
  ]

  return (
    <EntityGridPage
      title="Transmission Types"
      entitySingularName="Transmission"
      description="Manage gearbox and transmission options available for vehicles."
      icon={Settings2Icon}
      addButtonText="Add Transmission"
      initialItems={initialTransmissions}
      emptyStateTitle="No transmission types found"
      emptyStateDescription="Create your first transmission option to get started."
    />
  )
}