import { NextResponse, type NextRequest } from 'next/server';

const ROLE_DASHBOARDS: Record<string, string> = {
  SUPER_ADMIN: '/admin/dashboard',
  WORKER: '/worker/dashboard',
  OFFICE_STAFF: '/office-staff/dashboard',
  CUSTOMER: '/dashboard',
};

const AUTH_PATHS = [
  '/login',
  '/register',
  '/verify-otp',
  '/admin/login',
  '/worker/login',
  '/office-staff/login',
];

/**
 * Safely decodes and validates JWT structure and expiry at the edge
 */
function decodeJwt(token: string): { sub?: string; role?: string; exp?: number } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const jsonString = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );
    const payload = JSON.parse(jsonString);

    // Verify token expiry if exp is present
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const tokenCookie = request.cookies.get('kk_auth_token')?.value;

  const jwtPayload = tokenCookie ? decodeJwt(tokenCookie) : null;
  const isAuthenticated = !!jwtPayload;
  const role = jwtPayload?.role;

  // 1. Redirect legacy /customer/dashboard -> /dashboard
  if (pathname === '/customer/dashboard' || pathname.startsWith('/customer/dashboard/')) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace('/customer/dashboard', '/dashboard');
    return NextResponse.redirect(url);
  }

  // 2. Before Auth (Guest-only auth pages: /login, /admin/login, etc.)
  const isAuthPage = AUTH_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

  if (isAuthPage) {
    if (isAuthenticated && role && ROLE_DASHBOARDS[role]) {
      const destination = ROLE_DASHBOARDS[role];
      const url = new URL(destination, request.url);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Helper to clear invalid token cookies and redirect
  const redirectToLogin = (loginPath: string) => {
    const response = NextResponse.redirect(new URL(loginPath, request.url));
    if (tokenCookie && !isAuthenticated) {
      response.cookies.delete('kk_auth_token');
      response.cookies.delete('kk_auth_role');
      response.cookies.delete('kk_auth_user');
    }
    return response;
  };

  // 3. After Auth (Role-Guarded Dashboards)

  // Super Admin
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    if (!isAuthenticated) {
      return redirectToLogin('/admin/login');
    }
    if (role !== 'SUPER_ADMIN') {
      const destination = (role && ROLE_DASHBOARDS[role]) || '/login';
      return NextResponse.redirect(new URL(destination, request.url));
    }
    return NextResponse.next();
  }

  // Worker
  if (pathname.startsWith('/worker/dashboard')) {
    if (!isAuthenticated) {
      return redirectToLogin('/worker/login');
    }
    if (role !== 'WORKER') {
      const destination = (role && ROLE_DASHBOARDS[role]) || '/login';
      return NextResponse.redirect(new URL(destination, request.url));
    }
    return NextResponse.next();
  }

  // Office Staff
  if (pathname.startsWith('/office-staff/dashboard')) {
    // Allow instant preview in demo mode
    if (
      request.nextUrl.searchParams.get('demo') === 'true' ||
      request.cookies.get('kk_demo_staff')?.value === 'true'
    ) {
      return NextResponse.next();
    }

    if (!isAuthenticated) {
      return redirectToLogin('/office-staff/login');
    }
    if (role !== 'OFFICE_STAFF' && role !== 'SUPER_ADMIN') {
      const destination = (role && ROLE_DASHBOARDS[role]) || '/login';
      return NextResponse.redirect(new URL(destination, request.url));
    }
    return NextResponse.next();
  }

  // Customer Dashboard (/dashboard)
  if (pathname === '/dashboard' || pathname.startsWith('/dashboard/')) {
    if (!isAuthenticated) {
      return redirectToLogin('/login');
    }
    if (role !== 'CUSTOMER') {
      const destination = (role && ROLE_DASHBOARDS[role]) || '/login';
      return NextResponse.redirect(new URL(destination, request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

// Backward compatibility export if needed
export { proxy as middleware };

export const config = {
  matcher: [
    '/customer/dashboard/:path*',
    '/dashboard/:path*',
    '/admin/:path*',
    '/worker/dashboard/:path*',
    '/office-staff/dashboard/:path*',
    '/login',
    '/register',
    '/verify-otp',
    '/admin/login',
    '/worker/login',
    '/office-staff/login',
  ],
};
