/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { CldUploadWidget, CldImage } from 'next-cloudinary'
import { useState } from 'react'
import { UploadCloud, X } from 'lucide-react'

type ImageUploaderProps = {
  value: string[]
  onChange: (urls: string[]) => void
  multiple?: boolean
  folder?: string
}

export function ImageUploader({
  value = [],
  onChange,
  multiple = true,
  folder = 'cars',
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)

  // Track new uploads during a single widget session
  const [uploadedQueue, setUploadedQueue] = useState<string[]>([])

  const handleSuccess = (result: any) => {
    const newUrl = result?.info?.secure_url
    if (!newUrl) return

    if (multiple) {
      setUploadedQueue((prevQueue) => {
        const nextQueue = [...prevQueue, newUrl]
        // Push combined existing values + new session uploads to parent
        const uniqueCombined = Array.from(new Set([...value, ...nextQueue]))
        onChange(uniqueCombined)
        return nextQueue
      })
    } else {
      onChange([newUrl])
    }
  }

  const handleError = (error: any) => {
    console.error('Cloudinary Upload error details:', error)
    setUploading(false)
    alert('Failed to upload image. Please check your Cloudinary configuration.')
  }

  const handleRemove = (indexToRemove: number) => {
    const updated = value.filter((_, idx) => idx !== indexToRemove)
    onChange(updated)
  }

  return (
    <div className="space-y-4">
      {/* Uploaded Images Grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {value.map((url, i) => (
            <div
              key={`${url}-${i}`}
              className="relative group aspect-4/3 rounded-xl overflow-hidden border border-gray-200 bg-gray-100 shadow-sm"
            >
              <CldImage
                src={url}
                width={300}
                height={225}
                alt="Uploaded image"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              
              {/* Image index badge */}
              <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-md text-white text-[10px] font-medium rounded-md">
                #{i + 1}
              </div>

              {/* Delete button */}
              <button
                type="button"
                onClick={() => handleRemove(i)}
                className="absolute top-2 right-2 bg-black/60 hover:bg-red-600 text-white p-1.5 rounded-full transition-colors backdrop-blur-md opacity-90 hover:opacity-100"
                title="Remove image"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          {uploading && (
            <div className="aspect-4/3 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center bg-gray-50/50">
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin mb-2" />
              <div className="text-xs font-medium text-gray-500">Uploading...</div>
            </div>
          )}
        </div>
      )}

      {/* Cloudinary Widget Dropzone Button */}
      <CldUploadWidget
        uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
        options={{
          folder,
          multiple,
          maxFiles: multiple ? 10 : 1,
          clientAllowedFormats: ['image'],
          maxFileSize: 5000000,
          sources: ['local', 'url'],
          styles: {
            palette: {
              window: '#FFFFFF',
              windowBorder: '#E4E4E7',
              tabIcon: '#09090B',
              menuBg: '#FFFFFF',
              textDark: '#09090B',
              textLight: '#FFFFFF',
              link: '#09090B',
              action: '#09090B',
              inactiveTabIcon: '#A1A1AA',
              error: '#EF4444',
              inProgress: '#09090B',
              complete: '#10B981',
              sourceBg: '#F4F4F5',
            },
          },
        }}
        onSuccess={handleSuccess}
        onError={handleError}
        onOpen={() => {
          setUploading(true)
          setUploadedQueue([]) // Reset session queue when opening modal
        }}
        onClose={() => setUploading(false)}
      >
        {({ open }) => (
          <button
            type="button"
            onClick={() => open()}
            disabled={uploading}
            className="w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50 hover:bg-gray-100/80 hover:border-gray-300 transition-all cursor-pointer group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm mb-2 group-hover:scale-110 transition-transform">
              <UploadCloud className="w-5 h-5 text-gray-600" />
            </div>
            <p className="text-xs font-semibold text-gray-800">
              {multiple ? 'Click to upload vehicle images' : 'Click to upload photo'}
            </p>
            <p className="text-[11px] text-gray-400 mt-1">
              PNG, JPG, or WEBP up to 5MB (Max {multiple ? '10 files' : '1 file'})
            </p>
          </button>
        )}
      </CldUploadWidget>
    </div>
  )
}