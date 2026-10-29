'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Shell from '@/components/Shell';
import { api } from '@/lib/api';
import { STATUS_LABELS, LOG_LABELS, PERIOD_LABELS, fmtDate } from '@/lib/fmt';

export default function LicenseDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');

  const load = useCallback(async () => {
    setErr('');
    try { setData(await api.get('/licenses/' + id)); } catch (e: any) { setErr(e.message); }
  }, [id]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { api.get('/plans').then((d) => setPlans(d.items)).catch(() => {}); }, []);

  async function patch(body: any, okMsg: string) {
    setErr(''); setMsg('');
    try { await api.patch('/licenses/' + id, body); setMsg(okMsg); await load(); }
    catch (e: any) { setErr(e.message); }
  }

  async function act(fn: () => Promise<any>, okMsg: string) {
    setErr(''); setMsg('');
    try { await fn(); setMsg(okMsg); await load(); } catch (e: any) { setErr(e.message); }
  }

  if (!data) return <Shell>{err ? <div className="banner error">{err}</div> : <div className="muted">Cargando…</div>}</Shell>;

  const lic = data.license;
  const snap = lic.planSnapshot || {};

  return (
    <Shell>
      <div className="toolbar">
        <button className="btn sm" onClick={() => router.push('/licenses')}>← Volver</button>
        <div className="spacer" />
      </div>
      <div className="page-title">Licencia ····{lic.keyLast4}</div>
      <div className="page-sub" style={{ marginBottom: 14 }}>{lic.label || 'Sin etiqueta'}</div>

      {err && <div className="banner error">{err}</div>}
      {msg && <div className="banner ok">{msg}</div>}

      <div className="grid cols-2">
        <div className="card">
          <div className="sectitle" style={{ marginTop: 0 }}>Datos</div>
          <table>
            <tbody>
              <tr><td className="muted">Estado</td><td><span className={'badge ' + lic.status}>{STATUS_LABELS[lic.status]}</span>{lic.blockedReason ? <span className="muted"> · {lic.blockedReason}</span> : null}</td></tr>
              <tr><td className="muted">Plan</td><td className="mono">{lic.planCode}</td></tr>
              <tr><td className="muted">Cupo</td><td>{snap.quotaLimit} · {PERIOD_LABELS[snap.quotaPeriod]}</td></tr>
              <tr><td className="muted">Dispositivos máx.</td><td>{snap.maxDevices}</td></tr>
              <tr><td className="muted">Duración</td><td>{snap.durationDays === null ? 'Sin vencimiento' : snap.durationDays + ' días'}</td></tr>
              <tr><td className="muted">Ventana activación</td><td>{snap.activationWindowDays === null ? 'Siempre' : snap.activationWindowDays + ' días'}</td></tr>
              <tr><td className="muted">Activada</td><td>{fmtDate(lic.activatedAt)}</td></tr>
              <tr><td className="muted">Vence</td><td>{fmtDate(lic.expiresAt)}</td></tr>
              <tr><td className="muted">Creada</td><td>{fmtDate(lic.createdAt)}</td></tr>
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="sectitle" style={{ marginTop: 0 }}>Acciones</div>
          <div className="row mb">
            {lic.status !== 'blocked'
              ? <button className="btn" onClick={() => patch({ status: 'blocked', reason: 'manual' }, 'Licencia bloqueada.')}>Bloquear</button>
              : <button className="btn primary" onClick={() => patch({ status: 'active' }, 'Licencia reactivada.')}>Desbloquear</button>}
            {lic.status !== 'revoked' && <button className="btn danger" onClick={() => confirm('¿Revocar definitivamente?') && patch({ status: 'revoked' }, 'Licencia revocada.')}>Revocar</button>}
          </div>

          <div className="field">
            <label>Cambiar vencimiento</label>
            <div className="row">
              <input className="input" type="date" id="exp" defaultValue={lic.expiresAt ? new Date(lic.expiresAt).toISOString().slice(0, 10) : ''} />
              <button className="btn" onClick={() => {
                const v = (document.getElementById('exp') as HTMLInputElement).value;
                patch({ expiresAt: v ? new Date(v + 'T23:59:59Z').toISOString() : null }, 'Vencimiento actualizado.');
              }}>Guardar</button>
            </div>
            <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>Vacío = sin vencimiento. Extender reactiva automáticamente si estaba vencida.</div>
          </div>

          <div className="field">
            <label>Cambiar plan</label>
            <div className="row">
              <select className="input" id="plan" defaultValue={lic.planCode}>
                {plans.map((p) => <option key={p.code} value={p.code}>{p.name} ({p.code})</option>)}
              </select>
              <button className="btn" onClick={() => {
                const v = (document.getElementById('plan') as HTMLSelectElement).value;
                patch({ planCode: v, reapplyPlan: true }, 'Plan actualizado (snapshot re-aplicado).');
              }}>Aplicar</button>
            </div>
          </div>

          <div className="field">
            <label>Etiqueta</label>
            <div className="row">
              <input className="input" id="label" defaultValue={lic.label} />
              <button className="btn" onClick={() => patch({ label: (document.getElementById('label') as HTMLInputElement).value }, 'Etiqueta guardada.')}>Guardar</button>
            </div>
          </div>
        </div>
      </div>

      <div className="sectitle">Dispositivos</div>
      <div className="card" style={{ padding: 0 }}>
        <table>
          <thead><tr><th>Fingerprint</th><th>Primera IP</th><th>Último uso</th><th>Estado</th><th></th></tr></thead>
          <tbody>
            {data.devices.map((d: any) => (
              <tr key={d._id}>
                <td className="mono">{d.fingerprint.slice(0, 16)}…</td>
                <td className="mono">{d.firstSeenIp || '—'}</td>
                <td>{fmtDate(d.lastSeenAt)}</td>
                <td>{d.revoked ? <span className="badge revoked">Revocado</span> : <span className="badge active">Activo</span>}</td>
                <td>{!d.revoked && <button className="btn sm danger" onClick={() => act(() => api.del(`/licenses/${id}/devices/${d._id}`), 'Device revocado.')}>Revocar</button>}</td>
              </tr>
            ))}
            {data.devices.length === 0 && <tr><td colSpan={5} className="muted" style={{ padding: 16 }}>Sin dispositivos vinculados.</td></tr>}
          </tbody>
        </table>
      </div>
      {data.devices.some((d: any) => !d.revoked) && (
        <div className="mt"><button className="btn danger" onClick={() => confirm('¿Liberar todos los dispositivos?') && act(() => api.post(`/licenses/${id}/reset-devices`), 'Dispositivos liberados.')}>Liberar todos</button></div>
      )}

      <div className="sectitle">Uso por período</div>
      <div className="card" style={{ padding: 0 }}>
        <table>
          <thead><tr><th>Período</th><th>Rotaciones</th></tr></thead>
          <tbody>
            {data.counters.map((c: any) => <tr key={c._id}><td className="mono">{c.period}</td><td>{c.count}</td></tr>)}
            {data.counters.length === 0 && <tr><td colSpan={2} className="muted" style={{ padding: 16 }}>Sin uso registrado.</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="sectitle">Actividad reciente</div>
      <div className="card" style={{ padding: 0 }}>
        <table>
          <thead><tr><th>Fecha</th><th>Evento</th><th>Detalle</th><th>IP</th></tr></thead>
          <tbody>
            {data.logs.map((l: any) => (
              <tr key={l._id}><td>{fmtDate(l.createdAt)}</td><td>{LOG_LABELS[l.type] || l.type}</td><td className="muted">{l.reason || '—'}</td><td className="mono">{l.ip || '—'}</td></tr>
            ))}
            {data.logs.length === 0 && <tr><td colSpan={4} className="muted" style={{ padding: 16 }}>Sin actividad.</td></tr>}
          </tbody>
        </table>
      </div>
    </Shell>
  );
}
