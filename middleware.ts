import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define public paths as a Set for O(1) lookup instead of array (which requires O(n) lookup)
const PUBLIC_PATHS = new Set(['/signin', '/signup', '/otp-verification', '/forgot-password'])

// Create a function to check if a path is public - more efficient than using .some() on every request
function isPublicPath(path: string): boolean {
  // Check direct matches first (most common case)
  if (PUBLIC_PATHS.has(path)) return true
  
  // For paths that might have additional segments
  for (const publicPath of PUBLIC_PATHS) {
    if (path.startsWith(`${publicPath}/`)) return true
  }
  
  return false
}

export function middleware(request: NextRequest) {
  const currentPath = request.nextUrl.pathname
  
  // Early return if accessing static assets (improves performance for static files)
  if (currentPath.includes('/_next/') || 
      currentPath.includes('/api/') || 
      currentPath.endsWith('.ico') ||
      currentPath.includes('.')) {
    return NextResponse.next()
  }
  
  // Get access token from cookies - more efficient
  const accessToken = request.cookies.get('accessToken')?.value
  const isPathPublic = isPublicPath(currentPath)

  // If not logged in and trying to access protected route
  if (!accessToken && !isPathPublic) {
    return NextResponse.redirect(new URL('/signin', request.url))
  }

  // If logged in and trying to access auth pages
  if (accessToken && isPathPublic) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public assets)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|$).*)',
  ],
}