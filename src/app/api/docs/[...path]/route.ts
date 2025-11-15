// src/app/api/docs/[...path]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  try {
    const params = await context.params
    const filePath = path.join(process.cwd(), 'docs', ...params.path)
    
    console.log('Attempting to read:', filePath)
    
    // Security: ensure we're only reading from docs directory
    const docsDir = path.join(process.cwd(), 'docs')
    if (!filePath.startsWith(docsDir)) {
      return new NextResponse('Forbidden', { status: 403 })
    }

    const content = await fs.readFile(filePath, 'utf-8')
    
    return new NextResponse(content, {
      headers: {
        'Content-Type': 'text/markdown',
        'Cache-Control': 'public, max-age=3600'
      }
    })
  } catch (error) {
    console.error('Error reading doc file:', error)
    return new NextResponse(`Not Found: ${error}`, { status: 404 })
  }
}