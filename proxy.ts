import { getSessionCookie } from 'better-auth/cookies'
import { NextRequest, NextResponse } from 'next/server'

const authRoutes = ['/sign-in', '/sign-up']
const protectedRoutes = ['/dashboard']

export async function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request)

  const { pathname } = request.nextUrl

  const isAuthRoute = authRoutes.includes(pathname)
  const isProtectedRoute = protectedRoutes.includes(pathname)

  if (isProtectedRoute && !sessionCookie) {
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }

  if (isAuthRoute && sessionCookie) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/sign-in', '/sign-up'],
}
