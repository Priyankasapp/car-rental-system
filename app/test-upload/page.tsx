// app/test-cloudinary/page.tsx
'use client'

import { CldUploadWidget } from 'next-cloudinary'

export default function TestCloudinaryPage() {
  console.log('Cloud name:', process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME)
  console.log('Preset:', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET)

  return (
    <div className="p-8">
      <h1>Cloudinary Connection Test</h1>
      <CldUploadWidget
        uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
        onSuccess={(result) => {
          console.log('✅ Upload success:', result)
          alert('Upload worked! Check console for details.')
        }}
        onError={(error) => {
          console.error('❌ Upload failed:', error)
        }}
      >
        {({ open }) => (
          <button onClick={() => open()} className="border px-4 py-2">
            Test Upload
          </button>
        )}
      </CldUploadWidget>
    </div>
  )
}