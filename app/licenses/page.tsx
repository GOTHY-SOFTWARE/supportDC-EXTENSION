'use client';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Shell from '@/components/Shell';
import { api } from '@/lib/api';
import { STATUS_LABELS, fmtDateOnly } from '@/lib/fmt';

type License = {
  _id: string; keyLast4: string; label: string; planCode: string;
  status: string; expiresAt: string | null; activeDevices: number; createdAt: string;
};
type Plan = { code: string; name: string };

export default function LicensesPage() {
  const [items, setItems] = useState<License[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [err, setErr] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [newPlan, setNewPlan] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [createdKey, setCreatedKey] = useState('');

  const load = useCallback(async () => {
    setErr('');
    try {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (status) params.set('status', status);
      const d = await api.get('/licenses?' + params.toString());
      setItems(d.items);
    } catch (e: any) { setErr(e.message); }
  }, [q, status]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { api.get('/plans').then((d) => { setPlans(d.items); if (d.items[0]) setNewPlan(d.items[0].code); }).catch(() => {}); }, []);

  async function create() {
    setErr(''); setCreatedKey('');
    try {
      const d = await api.post('/licenses', { planCode: newPlan, label: newLabel });
      setCreatedKey(d.key);
      setNewLabel('');
      setShowNew(false);
      await load();
    } catch (e: any) { setErr(e.message); }
  }

  return (
    <Shell>
      <div className="toolbar">
        <div>
          <div className="page-title">Licencias</div>
          <div className="page-sub" style={{ marginBottom: 0 }}>{items.length} mostradas</div>
        </div>
        <div className="spacer" />
        <button className="btn primary" onClick={() => { setShowNew(true); setCreatedKey(''); }}>+ Nueva licencia</button>
      </div>

      {err && <div className="banner error">{err}</div>}
      {createdKey && (
        <div className="banner key">
          Key generada (se muestra una sola vez): <b>{createdKey}</b>
        </div>
      )}

      <div className="toolbar">
        <input className="input" style={{ maxWidth: 260 }} placeholder="Buscar por etiqueta o últimos 4…" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && load()} />
        <select className="input" style={{ maxWidth: 160 }} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Todos los estados</option>
          <option value="active">Activa</option>
          <option value="blocked">Bloqueada</option>
          <option value="revoked">Revocada</option>
        </select>
        <button className="btn" onClick={load}>Filtrar</button>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <table>
          <thead>
            <tr><th>Key</th><th>Etiqueta</th><th>Plan</th><th>Estado</th><th>Devices</th><th>Vence</th><th></th></tr>
          </thead>
          <tbody>
            {items.map((l) => (
              <tr key={l._id}>
                <td className="mono">····{l.keyLast4}</td>
                <td>{l.label || <span className="muted">—</span>}</td>
                <td className="mono">{l.planCode}</td>
                <td><span className={'badge ' + l.status}>{STATUS_LABELS[l.status]}</span></td>
                <td>{l.activeDevices}</td>
                <td>{l.expiresAt ? fmtDateOnly(l.expiresAt) : <span className="muted">—</span>}</td>
                <td><Link className="btn sm" href={'/licenses/' + l._id}>Ver</Link></td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={7} className="muted" style={{ padding: 20 }}>Sin licencias.</td></tr>}
          </tbody>
        </table>
      </div>

      {showNew && (
        <div className="modal-bg" onClick={() => setShowNew(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Nueva licencia</h3>
            <div className="field"><label>Plan</label>
              <select className="input" value={newPlan} onChange={(e) => setNewPlan(e.target.value)}>
                {plans.map((p) => <option key={p.code} value={p.code}>{p.name} ({p.code})</option>)}
              </select></div>
            <div className="field"><label>Etiqueta (opcional)</label>
              <input className="input" value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder="Cliente, nota…" /></div>
            <div className="row end mt">
              <button className="btn" onClick={() => setShowNew(false)}>Cancelar</button>
              <button className="btn primary" onClick={create} disabled={!newPlan}>Crear</button>
            </div>
          </div>
        </div>
      )}
    </Shell>
  );
}
