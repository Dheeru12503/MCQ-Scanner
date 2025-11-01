import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

export function middleware(request: NextRequest) {
    // TEMPORARILY DISABLED FOR TESTING - Remove this to enable authentication
    // Just allow all requests for now
    return NextResponse.next();

    /* AUTHENTICATION CODE - ENABLE WHEN READY
    const token = request.cookies.get('token')?.value;
    const { pathname } = request.nextUrl;

    // Public routes
    const publicRoutes = ['/login', '/register'];
    const isPublicRoute = publicRoutes.includes(pathname);

    // API routes that need auth
    const protectedApiRoutes = [
        '/api/mcq',
        '/api/exam',
        '/api/scan',
        '/api/dashboard',
    ];
    const isProtectedApi = protectedApiRoutes.some(route => pathname.startsWith(route));

    if (isPublicRoute && token) {
        // If logged in and trying to access login/register, redirect to dashboard
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    if (!isPublicRoute && pathname.startsWith('/api/')) {
        // Check API routes
        if (isProtectedApi && !token) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        if (isProtectedApi && token) {
            const decoded = verifyToken(token);
            if (!decoded) {
                return NextResponse.json(
                    { error: 'Invalid token' },
                    { status: 401 }
                );
            }
        }
    }

    if (!isPublicRoute && !pathname.startsWith('/api/') && !pathname.startsWith('/_next/')) {
        // Check page routes (except public routes)
        if (!token) {
            return NextResponse.redirect(new URL('/login', request.url));
        }

        const decoded = verifyToken(token);
        if (!decoded) {
            const response = NextResponse.redirect(new URL('/login', request.url));
            response.cookies.delete('token');
            return response;
        }
    }

    return NextResponse.next();
    */
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
