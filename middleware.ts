import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtDecode } from 'jwt-decode' // We'll need to install this package

const publicPaths = ['/signin', '/signup', '/otp-verification', '/forgot-password']

export function middleware(request: NextRequest) {
  const accessToken = request.cookies.get('accessToken')
  const currentPath = request.nextUrl.pathname

  // Check if the path is public
  const isPublicPath = publicPaths.some(path => currentPath.startsWith(path))

  // If token exists, check if it's expired
  if (accessToken?.value) {
    try {
      const decodedToken = jwtDecode(accessToken.value)
      const currentTime = Math.floor(Date.now() / 1000)
      
      // Check if token is expired (exp is in seconds)
      if (decodedToken.exp && decodedToken.exp < currentTime) {
        // Token is expired, clear cookies and redirect to login
        const response = NextResponse.redirect(new URL('/signin', request.url))
        
        // Clear the cookies
        response.cookies.delete('accessToken')
        response.cookies.delete('refreshToken')
        response.cookies.delete('FMSUID')
        
        return response
      }
    } catch (error) {
      // If token can't be decoded, treat as invalid
      console.error('Error decoding token:', error)
      const response = NextResponse.redirect(new URL('/signin', request.url))
      
      // Clear the cookies
      response.cookies.delete('accessToken')
      response.cookies.delete('refreshToken')
      response.cookies.delete('FMSUID')
      
      return response
    }
  }

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