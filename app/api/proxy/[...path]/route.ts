import { NextRequest, NextResponse } from 'next/server';
import { callBackend, COOKIE_NAME } from '@/lib/backend';

export const dynamic = 'force-dynamic';

async function handle(req: NextRequest, ctx: { params: { path: string[] } }) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  const path = '/' + (ctx.params.path || []).join('/');
  const search = req.nextUrl.search || '';
  const method = req.method;

  let body: string | undefined;
  if (method !== 'GET' && method !== 'DELETE') {
    body = await req.text();
  }

  const res = await callBackend(path + search, { method, body, token });
  const text = await res.text();

  // Si el backend rechaza el token, limpiamos la cookie para forzar re-login.
  const out = new NextResponse(text, {
    status: res.status,
    headers: { 'content-type': res.headers.get('content-type') || 'application/json' },
  });
  if (res.status === 401) {
    out.cookies.set(COOKIE_NAME, '', { httpOnly: true, path: '/', maxAge: 0 });
  }
  return out;
}

export const GET = handle;
export const POST = handle;
export const PATCH = handle;
export const DELETE = handle;
