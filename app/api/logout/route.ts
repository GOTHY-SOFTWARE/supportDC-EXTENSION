import { NextResponse } from 'next/server';
import { COOKIE_NAME } from '@/lib/backend';

export async function POST() {
  const out = NextResponse.json({ ok: true });
  out.cookies.set(COOKIE_NAME, '', { httpOnly: true, path: '/', maxAge: 0 });
  return out;
}
