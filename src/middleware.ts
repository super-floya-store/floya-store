import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Admin route protection
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('access_token')?.value
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // API auth protection (but allow public GET /api/settings for storefront)
  if (pathname.startsWith('/api/admin') || pathname === '/api/stats') {
    const token = request.cookies.get('access_token')?.value || request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 })
    }
  }

  // Settings API: require auth for PUT, allow public GET
  if (pathname === '/api/settings' && request.method !== 'GET') {
    const token = request.cookies.get('access_token')?.value || request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*', '/api/stats', '/api/settings'],
}
