import { NextRequest, NextResponse } from 'next/server';
import { COOKIE_NAME } from '@/lib/backend';

// Protege las páginas: sin cookie de sesión -> /login. La validez real del
// token la enforcea el backend; esto solo evita mostrar páginas sin sesión.
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const authed = !!req.cookies.get(COOKIE_NAME)?.value;

  if (pathname === '/login') {
    if (authed) return NextResponse.redirect(new URL('/', req.url));
    return NextResponse.next();
  }
  if (!authed) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  return NextResponse.next();
}

export const config = {
  // Aplica a todo menos API, assets y estáticos.
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
