/* eslint-disable @typescript-eslint/no-explicit-any */
// components/admin/ImageUpload.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { Upload, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImageUploadProps {
  onUpload: (url: string) => void
  onRemove: (url: string) => void
  existingImages?: string[]
  maxImages?: number
}

export function ImageUpload({ 
  onUpload, 
  onRemove, 
  existingImages = [], 
  maxImages = 10 
}: ImageUploadProps) {
  const [images, setImages] = useState<string[]>(existingImages)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  //  Handle file upload
  const handleUpload = async (file: File) => {
    if (images.length >= maxImages) {
      setError(`Maximum ${maxImages} images allowed`)
      return
    }

    setUploading(true)
    setError(null)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message)
      }

      const newImages = [...images, data.data.url]
      setImages(newImages)
      onUpload(data.data.url)
      setUploadProgress(100)
      
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (err: any) {
      setError(err.message || 'Failed to upload image')
    } finally {
      setUploading(false)
      setTimeout(() => setUploadProgress(0), 1000)
    }
  }

  //  Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleUpload(file)
    }
  }

  //  Handle drag and drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleUpload(file)
    }
  }

  //  Handle remove image
  const handleRemove = (url: string) => {
    const newImages = images.filter(img => img !== url)
    setImages(newImages)
    onRemove(url)
  }

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={cn(
          'relative border-2 border-dashed rounded-xl p-8 text-center transition-colors',
          dragActive ? 'border-gray-900 bg-gray-50' : 'border-gray-300 hover:border-gray-400',
          uploading && 'opacity-50 cursor-not-allowed'
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={uploading || images.length >= maxImages}
        />
        
        <div className="flex flex-col items-center gap-2">
          {uploading ? (
            <>
              <div className="relative">
                <Loader2 className="w-10 h-10 animate-spin text-gray-400" />
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-gray-400">
                  {uploadProgress}%
                </div>
              </div>
              <p className="text-sm font-medium text-gray-600">Uploading...</p>
            </>
          ) : (
            <>
              <Upload className="w-10 h-10 text-gray-400" />
              <p className="text-sm font-medium text-gray-600">
                {images.length === 0 ? 'Click or drag to upload images' : 'Add more images'}
              </p>
              <p className="text-xs text-gray-400">
                PNG, JPG, WEBP up to 5MB • Max {maxImages} images
              </p>
              {images.length > 0 && (
                <p className="text-xs text-gray-400">
                  {images.length} / {maxImages} uploaded
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 p-3 rounded-lg">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Gallery */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
          {images.map((url, index) => (
            <div
              key={index}
              className="relative group aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-gray-300 transition-colors"
            >
              {/* Main Image Badge */}
              {index === 0 && (
                <div className="absolute top-1 left-1 z-10 bg-black/70 text-white text-xs px-2 py-0.5 rounded">
                  Main
                </div>
              )}
              
              {/* Image */}
              <Image
                src={url}
                alt={`Car image ${index + 1}`}
                fill
                className="object-cover"
              />
              
              {/* Hover Actions */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      const newImages = [...images]
                      const temp = newImages[0]
                      newImages[0] = newImages[index]
                      newImages[index] = temp
                      setImages(newImages)
                      onUpload(newImages[0])
                    }}
                    className="p-1.5 bg-white/90 rounded-lg hover:bg-white transition"
                    title="Set as main image"
                  >
                    <CheckCircle className="w-4 h-4 text-gray-700" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleRemove(url)}
                  className="p-1.5 bg-red-500/90 rounded-lg hover:bg-red-500 transition"
                  title="Remove image"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}