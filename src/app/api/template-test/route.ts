import { NextRequest, NextResponse } from 'next/server'
import { getTemplateTestURL } from '@/lib/storage'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const message = searchParams.get('message') || 'Test gratitude message'
    const number = parseInt(searchParams.get('number') || '1')

    const templateUrl = getTemplateTestURL(message, number)
    
    // Test if template is accessible
    let templateStatus = 'unknown'
    try {
      const response = await fetch(templateUrl, { method: 'HEAD' })
      templateStatus = response.ok ? 'accessible' : `error: ${response.status}`
    } catch (error) {
      templateStatus = `fetch error: ${error}`
    }
    
    return NextResponse.json({
      success: true,
      templateUrl,
      templateStatus,
      message: 'Template URL generated successfully',
      testUrl: templateUrl,
      config: {
        baseUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        path: '/nft-template.html'
      }
    })
  } catch (error) {
    console.error('Template test error:', error)
    return NextResponse.json(
      { error: 'Failed to generate template URL' },
      { status: 500 }
    )
  }
} 