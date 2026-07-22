// components/admin/cars/shared/ImageUpload.tsx
import { useRef } from 'react'
import { Upload } from 'lucide-react'

interface ImageUploadProps {
  onUpload: (files: FileList) => void
}

export function ImageUpload({ onUpload }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.currentTarget.classList.remove('border-gray-900', 'bg-gray-50')
    if (e.dataTransfer.files.length > 0) {
      onUpload(e.dataTransfer.files)
    }
  }

  return (
    <div
      className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-gray-900 transition-colors cursor-pointer group mb-6"
      onClick={() => fileInputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault()
        e.currentTarget.classList.add('border-gray-900', 'bg-gray-50')
      }}
      onDragLeave={(e) => {
        e.currentTarget.classList.remove('border-gray-900', 'bg-gray-50')
      }}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && onUpload(e.target.files)}
      />
      <div className="flex flex-col items-center">
        <Upload className="w-12 h-12 text-gray-400 mb-4 group-hover:scale-110 transition-transform" />
        <p className="text-lg text-gray-900 mb-1">Click to upload or drag and drop</p>
        <p className="text-sm text-gray-500">PNG, JPG or WEBP (max. 4096×4096px)</p>
      </div>
    </div>
  )
}