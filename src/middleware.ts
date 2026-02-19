
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    // Check if the path starts with /admin
    if (request.nextUrl.pathname.startsWith('/admin')) {
        // Exclude /admin/login from protection
        if (request.nextUrl.pathname === '/admin/login') {
            return NextResponse.next()
        }

        // Check for admin_session cookie
        const hasSession = request.cookies.has('admin_session')

        if (!hasSession) {
            return NextResponse.redirect(new URL('/admin/login', request.url))
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: '/admin/:path*',
}
