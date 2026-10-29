'use client';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Shell from '@/components/Shell';
import { api } from '@/lib/api';
import { LOG_LABELS, fmtDate } from '@/lib/fmt';

const TYPES = ['', 'activate', 'revalidate', 'rotate', 'rotate_blocked', 'device_rejected', 'admin_block', 'admin_unblock', 'admin_revoke', 'admin_reset_device'];

export default function LogsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [type, setType] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [err, setErr] = useState('');

  const load = useCallback(async () => {
    setErr('');
    try {
      const params = new URLSearchParams({ page: String(page), limit: '100' });
      if (type) params.set('type', type);
      const d = await api.get('/logs?' + params.toString());
      setItems(d.items); setPages(d.pages || 1);
    } catch (e: any) { setErr(e.message); }
  }, [type, page]);

  useEffect(() => { load(); }, [load]);

  return (
    <Shell>
      <div className="page-title">Logs</div>
      <div className="page-sub">Actividad global</div>
      {err && <div className="banner error">{err}</div>}

      <div className="toolbar">
        <select className="input" style={{ maxWidth: 200 }} value={type} onChange={(e) => { setPage(1); setType(e.target.value); }}>
          {TYPES.map((t) => <option key={t} value={t}>{t ? (LOG_LABELS[t] || t) : 'Todos los eventos'}</option>)}
        </select>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <table>
          <thead><tr><th>Fecha</th><th>Evento</th><th>Licencia</th><th>Detalle</th><th>IP</th></tr></thead>
          <tbody>
            {items.map((l) => (
              <tr key={l._id}>
                <td>{fmtDate(l.createdAt)}</td>
                <td>{LOG_LABELS[l.type] || l.type}</td>
                <td><Link className="mono" href={'/licenses/' + l.licenseId} style={{ color: 'var(--accent)' }}>{String(l.licenseId).slice(-6)}</Link></td>
                <td className="muted">{l.reason || '—'}</td>
                <td className="mono">{l.ip || '—'}</td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={5} className="muted" style={{ padding: 18 }}>Sin eventos.</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="row end mt">
        <button className="btn sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>← Anterior</button>
        <span className="muted">Página {page} de {pages}</span>
        <button className="btn sm" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>Siguiente →</button>
      </div>
    </Shell>
  );
}
