// Helpers server-side para hablar con el backend /spoofer/admin/*.
// El JWT del admin vive en una cookie httpOnly; nunca se expone al JS del
// navegador. Las páginas llaman a /api/* (mismo origen) y estos handlers
// reenvían al backend con el token.

export const COOKIE_NAME = 'gp_admin';

export function backendUrl(path: string): string {
  const base = (process.env.BACKEND_URL || '').replace(/\/$/, '');
  return `${base}/spoofer/admin${path.startsWith('/') ? path : '/' + path}`;
}

export async function callBackend(
  path: string,
  init: RequestInit & { token?: string | null } = {}
): Promise<Response> {
  const { token, headers, ...rest } = init;
  const h: Record<string, string> = { ...(headers as Record<string, string>) };
  if (token) h['Authorization'] = `Bearer ${token}`;
  if (rest.body && !h['Content-Type']) h['Content-Type'] = 'application/json';
  return fetch(backendUrl(path), { ...rest, headers: h, cache: 'no-store' });
}
