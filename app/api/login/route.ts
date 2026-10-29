import { NextRequest, NextResponse } from 'next/server';
import { callBackend, COOKIE_NAME } from '@/lib/backend';

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }

  const res = await callBackend('/login', {
    method: 'POST',
    body: JSON.stringify({ email: body.email, password: body.password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.token) {
    return NextResponse.json({ error: data.error || 'invalid_credentials' }, { status: res.status || 401 });
  }

  const out = NextResponse.json({ admin: data.admin });
  out.cookies.set(COOKIE_NAME, data.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 8, // 8h, alineado con el TTL del JWT
  });
  return out;
}
