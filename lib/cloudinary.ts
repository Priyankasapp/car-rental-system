/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/cloudinary.ts
import { v2 as cloudinary } from 'cloudinary'

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export default cloudinary

// Upload function with proper typing
export const uploadToCloudinary = (
  buffer: Buffer,
  options: {
    folder?: string
    publicId?: string
    transformation?: any[]
  } = {}
): Promise<any> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder: options.folder || 'cars',
        public_id: options.publicId,
        resource_type: 'auto',
        transformation: options.transformation || [
          { quality: 'auto', fetch_format: 'auto' }
        ],
      },
      (error, result) => {
        if (error) {
          reject(error)
        } else {
          resolve(result)
        }
      }
    ).end(buffer)
  })
}

// Delete function
export const deleteFromCloudinary = (publicId: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) {
        reject(error)
      } else {
        resolve(result)
      }
    })
  })
}