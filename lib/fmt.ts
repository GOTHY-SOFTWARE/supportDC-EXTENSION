export function fmtDate(v: string | number | null | undefined): string {
  if (!v) return '—';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' });
}

export function fmtDateOnly(v: string | number | null | undefined): string {
  if (!v) return '—';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('es-AR', { dateStyle: 'medium' });
}

export const STATUS_LABELS: Record<string, string> = {
  active: 'Activa',
  blocked: 'Bloqueada',
  revoked: 'Revocada',
};

export const LOG_LABELS: Record<string, string> = {
  activate: 'Activación',
  revalidate: 'Revalidación',
  rotate: 'Rotación IP',
  rotate_blocked: 'Rotación sin cupo',
  device_rejected: 'Device rechazado',
  admin_block: 'Bloqueo (admin)',
  admin_unblock: 'Desbloqueo (admin)',
  admin_revoke: 'Revocación (admin)',
  admin_reset_device: 'Reset device (admin)',
};

export const PERIOD_LABELS: Record<string, string> = {
  daily: 'Diario',
  monthly: 'Mensual',
  total: 'Total (de por vida)',
};
