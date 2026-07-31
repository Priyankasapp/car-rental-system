/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { CldUploadWidget, CldImage } from 'next-cloudinary'
import { useState } from 'react'

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

  const handleSuccess = (result: any) => {
    const url = result?.info?.secure_url
    if (!url) {
      console.error('No URL returned from Cloudinary')
      setUploading(false)
      return
    }

    setUploading(false)

    if (multiple) {
      onChange([...value, url])
    } else {
      onChange([url])
    }
  }

  const handleError = (error: any) => {
    console.error('Upload error:', error)
    setUploading(false)
    alert('Failed to upload image. Please check your Cloudinary configuration.')
  }

  const handleOpen = () => {
    setUploading(true)
  }

  return (
    <div>
      {/* Uploaded Cloudinary Images Grid */}
      <div className="grid grid-cols-4 gap-2 mb-3">
        {value.map((url, i) => (
          <div key={`${url}-${i}`} className="relative group">
            <CldImage
              src={url}
              width={200}
              height={150}
              alt="Uploaded image"
              className="w-32 h-24 object-cover rounded border"
            />
            <button
              type="button"
              onClick={() => onChange(value.filter((u) => u !== url))}
              className="absolute top-1 right-1 bg-black/60 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center hover:bg-red-600"
            >
              ✕
            </button>
          </div>
        ))}

        {uploading && (
          <div className="w-32 h-24 rounded border flex items-center justify-center bg-gray-100">
            <div className="text-xs text-gray-500">Uploading...</div>
          </div>
        )}
      </div>

      {/* Cloudinary Widget */}
      <CldUploadWidget
        uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
        options={{
          folder,
          multiple,
          maxFiles: multiple ? 10 : 1,
          clientAllowedFormats: ['image'],
          maxFileSize: 5000000,
        }}
        onSuccess={handleSuccess}
        onError={handleError}
        onOpen={handleOpen}
      >
        {({ open }) => (
          <button
            type="button"
            onClick={() => open()}
            disabled={uploading}
            className="border px-4 py-2 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            {multiple ? 'Upload Images' : 'Upload Photo'}
          </button>
        )}
      </CldUploadWidget>
    </div>
  )
}