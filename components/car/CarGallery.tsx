// components/car/CarGallery.tsx
'use client'

import { useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface CarGalleryProps {
  mainImage: string
  images: string[]
}

export function CarGallery({ mainImage, images }: CarGalleryProps) {
  const [activeImage, setActiveImage] = useState(0)
  const allImages = [mainImage, ...images]

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="aspect-video w-full bg-gray-100 rounded-2xl overflow-hidden relative">
        <Image
          src={allImages[activeImage]}
          alt="Car"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Thumbnail Grid */}
      <div className="grid grid-cols-4 gap-4">
        {allImages.map((img, index) => (
          <button
            key={index}
            onClick={() => setActiveImage(index)}
            className={cn(
              'aspect-square bg-gray-100 rounded-lg overflow-hidden relative border-2 transition',
              activeImage === index ? 'border-black' : 'border-transparent hover:border-gray-300'
            )}
          >
            <Image
              src={img}
              alt={`Thumbnail ${index + 1}`}
              fill
              className={cn(
                'object-cover transition',
                activeImage === index ? 'opacity-100' : 'opacity-60 hover:opacity-100'
              )}
            />
          </button>
        ))}
      </div>
    </div>
  )
}