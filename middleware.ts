import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const publicPaths = ['/signin', '/signup', '/otp-verification', '/forgot-password']

export function middleware(request: NextRequest) {
  const accessToken = request.cookies.get('accessToken')
  const currentPath = request.nextUrl.pathname

  // Check if the path is public
  const isPublicPath = publicPaths.some(path => currentPath.startsWith(path))

  // If not logged in and trying to access protected route
  if (!accessToken && !isPublicPath) {
    return NextResponse.redirect(new URL('/signin', request.url))
  }

  // If logged in and trying to access auth pages
  if (accessToken && isPublicPath) {
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