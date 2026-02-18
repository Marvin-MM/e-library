import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;

    // Public paths that don't require authentication
    if (path.startsWith("/login") ||
        path.startsWith("/signup") ||
        path.startsWith("/verify-email") ||
        path.startsWith("/forgot-password") ||
        path.startsWith("/_next") ||
        path.startsWith("/api") ||
        path.includes(".")) {
        return NextResponse.next();
    }

    // Check for auth token (adjust cookie name based on your auth implementation)
    const token = request.cookies.get("refreshToken")?.value;

    if (!token) {
        // Redirect to login if not authenticated
        return NextResponse.redirect(new URL("/login", request.url));
    }

    // TODO: In a real world scenario, you would decode the JWT here to get the role.
    // Since we can't easily decode JWT in Edge Runtime without external libs,
    // we might rely on a separate non-httpOnly cookie for role if available, or just
    // let the client handle the specific role redirect (which causes the flicker).
    // 
    // However, to fix the "Admin Flicker", we can try to read a "userRole" cookie
    // if you decide to set one during login.
    //
    // For now, let's assume we implement a strategy where we set a "user_role" cookie 
    // on login (non-httpOnly or httpOnly) specifically for middleware routing.

    const userRole = request.cookies.get("user_role")?.value;

    if (userRole === "ADMIN" && path === "/dashboard") {
        return NextResponse.redirect(new URL("/dashboard/admin", request.url));
    }

    if (userRole !== "ADMIN" && path.startsWith("/dashboard/admin")) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
