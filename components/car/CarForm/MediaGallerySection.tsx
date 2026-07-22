// components/admin/cars/CarForm/MediaGallerySection.tsx
import Image from 'next/image'
import { ImageIcon, Trash2, Plus } from 'lucide-react'
import { SectionHeader } from '../shared/SectionHeader'
import { ImageUpload } from '../shared/ImageUpload'

interface MediaGallerySectionProps {
  images: string[]
  onImageUpload: (files: FileList) => void
  onImageRemove: (index: number) => void
}

export function MediaGallerySection({ images, onImageUpload, onImageRemove }: MediaGallerySectionProps) {
  return (
    <section className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-200">
      <SectionHeader icon={<ImageIcon className="w-5 h-5 text-gray-900" />} title="Media Gallery" />
      
      <ImageUpload onUpload={onImageUpload} />

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {images.map((image, index) => (
          <div key={index} className="aspect-square bg-gray-100 rounded-lg relative overflow-hidden group">
            <Image
              src={image}
              alt={`Upload ${index + 1}`}
              width={200}
              height={200}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button
                type="button"
                onClick={() => onImageRemove(index)}
                className="bg-white text-gray-900 p-2 rounded-full shadow-lg hover:bg-gray-100 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {images.length < 8 && (
          <div
            className="aspect-square bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
            onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}
          >
            <Plus className="w-8 h-8 text-gray-400" />
          </div>
        )}
      </div>
    </section>
  )
}