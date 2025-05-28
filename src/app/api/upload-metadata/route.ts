import { NextRequest, NextResponse } from 'next/server'
import { uploadMetadataToStorage } from '@/lib/storage'

export async function POST(request: NextRequest) {
  try {
    const metadata = await request.json()
    
    // Validate metadata structure
    if (!metadata.name || !metadata.description || !metadata.attributes) {
      return NextResponse.json(
        { error: 'Invalid metadata structure' },
        { status: 400 }
      )
    }

    // Upload metadata using our storage system
    const metadataId = await uploadMetadataToStorage(metadata)
    
    return NextResponse.json({
      success: true,
      metadataId,
      metadataURI: metadataId, // Since we're using data URIs, this is the same
      url: metadataId
    })
  } catch (error) {
    console.error('Metadata upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload metadata' },
      { status: 500 }
    )
  }
} 