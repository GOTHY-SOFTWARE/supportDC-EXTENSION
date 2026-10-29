'use client';

// Cliente del navegador. Siempre llama a /api/* (mismo origen). El token va en
// cookie httpOnly, así que acá no se maneja.

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function req(method: string, path: string, body?: any) {
  const res = await fetch('/api/proxy' + path, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 401) {
    if (typeof window !== 'undefined') window.location.href = '/login';
    throw new ApiError('unauthenticated', 401);
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data.error || 'error', res.status);
  return data;
}

export const api = {
  get: (p: string) => req('GET', p),
  post: (p: string, b?: any) => req('POST', p, b),
  patch: (p: string, b?: any) => req('PATCH', p, b),
  del: (p: string) => req('DELETE', p),
};

export async function login(email: string, password: string) {
  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data.error || 'invalid_credentials', res.status);
  return data;
}

export async function logout() {
  await fetch('/api/logout', { method: 'POST' });
  window.location.href = '/login';
}
