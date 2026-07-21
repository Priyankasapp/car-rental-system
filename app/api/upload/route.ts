// app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    
    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file uploaded' },
        { status: 400 }
      )
    }

    // Check file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: 'Invalid file type. Only JPEG, PNG, WEBP are allowed.' },
        { status: 400 }
      )
    }

    // Check file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: 'File size too large. Max 5MB.' },
        { status: 400 }
      )
    }

    //  Use built-in crypto.randomUUID() 
    const ext = path.extname(file.name)
    const filename = `${crypto.randomUUID()}${ext}`
    const uploadDir = path.join(process.cwd(), 'public/uploads/cars')
    
    // Create directory if it doesn't exist
    await mkdir(uploadDir, { recursive: true })
    
    // Save file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const filePath = path.join(uploadDir, filename)
    await writeFile(filePath, buffer)

    const imageUrl = `/uploads/cars/${filename}`

    return NextResponse.json({
      success: true,
      data: { url: imageUrl },
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to upload file' },
      { status: 500 }
    )
  }
}