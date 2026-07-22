// components/admin/cars/BackButton.tsx
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export function BackButton() {
  return (
    <Link
      href="/admin/cars"
      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
    >
      <ArrowLeft className="w-5 h-5" />
    </Link>
  )
}